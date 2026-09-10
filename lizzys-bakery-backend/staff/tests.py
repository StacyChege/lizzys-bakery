import uuid
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from menu.models import Category, Product
from .models import ClockRecord, DailyStock, SaleEntry, StaffMember

User = get_user_model()


class StaffTestBase(APITestCase):
    def setUp(self):
        self.staff = StaffMember.objects.create(name='Lizzy')
        self.staff.set_pin('1234')
        self.staff.save()
        self.category = Category.objects.create(name='Pastries')
        self.scone = Product.objects.create(
            category=self.category, name='Scone', base_price=Decimal('120.00'),
        )

    def open_shift(self):
        shift = ClockRecord.objects.create(staff=self.staff)
        self.client.credentials(HTTP_X_STAFF_TOKEN=str(shift.token))
        return shift


class RosterTests(StaffTestBase):
    def test_roster_lists_active_staff_names_only(self):
        StaffMember.objects.create(name='Retired', is_active=False)
        res = self.client.get(reverse('staff-roster'))
        self.assertEqual(res.status_code, 200)
        names = [s['name'] for s in res.data]
        self.assertEqual(names, ['Lizzy'])
        self.assertNotIn('pin_hash', res.data[0])


class ClockInTests(StaffTestBase):
    url = reverse('staff-clock-in')

    def test_correct_pin_opens_a_shift_and_returns_a_token(self):
        res = self.client.post(self.url, {'staff_id': self.staff.id, 'pin': '1234'})
        self.assertEqual(res.status_code, 201)
        self.assertIn('token', res.data)
        self.assertTrue(ClockRecord.objects.filter(staff=self.staff, clock_out__isnull=True).exists())

    def test_wrong_pin_is_rejected(self):
        res = self.client.post(self.url, {'staff_id': self.staff.id, 'pin': '9999'})
        self.assertEqual(res.status_code, 400)
        self.assertEqual(ClockRecord.objects.count(), 0)

    def test_inactive_staff_cannot_clock_in(self):
        self.staff.is_active = False
        self.staff.save()
        res = self.client.post(self.url, {'staff_id': self.staff.id, 'pin': '1234'})
        self.assertEqual(res.status_code, 400)


class ShiftTokenAuthTests(StaffTestBase):
    def test_missing_token_is_unauthorized(self):
        self.assertEqual(self.client.get(reverse('staff-my-shift')).status_code, 401)

    def test_garbage_token_is_unauthorized(self):
        self.client.credentials(HTTP_X_STAFF_TOKEN='not-a-uuid')
        self.assertEqual(self.client.get(reverse('staff-my-shift')).status_code, 401)

    def test_unknown_token_is_unauthorized(self):
        self.client.credentials(HTTP_X_STAFF_TOKEN=str(uuid.uuid4()))
        self.assertEqual(self.client.get(reverse('staff-my-shift')).status_code, 401)

    def test_clocked_out_shift_token_stops_working(self):
        shift = self.open_shift()
        shift.clock_out = timezone.now()
        shift.save()
        self.assertEqual(self.client.get(reverse('staff-my-shift')).status_code, 401)


class ClockOutTests(StaffTestBase):
    def test_clock_out_closes_the_shift(self):
        shift = self.open_shift()
        res = self.client.post(reverse('staff-clock-out'))
        self.assertEqual(res.status_code, 200)
        shift.refresh_from_db()
        self.assertIsNotNone(shift.clock_out)


class DailyStockTests(StaffTestBase):
    def test_post_creates_then_updates_todays_stock(self):
        self.open_shift()
        url = reverse('staff-daily-stock')
        self.client.post(url, {'product': self.scone.id, 'quantity_stocked': 10}, format='json')
        res = self.client.post(url, {'product': self.scone.id, 'quantity_stocked': 25}, format='json')
        self.assertEqual(res.status_code, 200)
        stock = DailyStock.objects.get(product=self.scone, date=timezone.localdate())
        self.assertEqual(stock.quantity_stocked, 25)
        self.assertEqual(DailyStock.objects.count(), 1)

    def test_missing_fields_are_rejected(self):
        self.open_shift()
        res = self.client.post(reverse('staff-daily-stock'), {'product': self.scone.id}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_non_numeric_quantity_is_rejected(self):
        self.open_shift()
        res = self.client.post(
            reverse('staff-daily-stock'),
            {'product': self.scone.id, 'quantity_stocked': 'lots'}, format='json',
        )
        self.assertEqual(res.status_code, 400)

    def test_unknown_product_is_404(self):
        self.open_shift()
        res = self.client.post(
            reverse('staff-daily-stock'),
            {'product': 99999, 'quantity_stocked': 5}, format='json',
        )
        self.assertEqual(res.status_code, 404)


class SaleEntryTests(StaffTestBase):
    def setUp(self):
        super().setUp()
        self.open_shift()

    def _stock(self, qty):
        DailyStock.objects.create(product=self.scone, date=timezone.localdate(), quantity_stocked=qty)

    def test_sale_snapshots_the_unit_price(self):
        self._stock(10)
        res = self.client.post(reverse('staff-sales'), {'product': self.scone.id, 'quantity': 3})
        self.assertEqual(res.status_code, 201)
        sale = SaleEntry.objects.get()
        self.assertEqual(sale.unit_price, Decimal('120.00'))
        self.assertEqual(sale.quantity, 3)

    def test_sale_beyond_remaining_stock_is_rejected(self):
        self._stock(2)
        res = self.client.post(reverse('staff-sales'), {'product': self.scone.id, 'quantity': 5})
        self.assertEqual(res.status_code, 400)
        self.assertEqual(SaleEntry.objects.count(), 0)

    def test_sale_with_no_stock_entered_is_rejected(self):
        res = self.client.post(reverse('staff-sales'), {'product': self.scone.id, 'quantity': 1})
        self.assertEqual(res.status_code, 400)

    def test_sales_list_is_scoped_to_the_current_shift(self):
        self._stock(10)
        self.client.post(reverse('staff-sales'), {'product': self.scone.id, 'quantity': 1})
        other = ClockRecord.objects.create(staff=self.staff)
        SaleEntry.objects.create(shift=other, product=self.scone, quantity=4, unit_price=Decimal('120'))
        res = self.client.get(reverse('staff-sales'))
        self.assertEqual(len(res.data), 1)


class AdminSummaryTests(StaffTestBase):
    url = reverse('staff-admin-summary')

    def setUp(self):
        super().setUp()
        self.admin = User.objects.create_user(
            email='baker@example.com', full_name='Baker', password='pw-123456', role=User.ADMIN,
        )

    def test_requires_admin(self):
        self.assertEqual(self.client.get(self.url).status_code, 401)
        self.client.force_authenticate(
            user=User.objects.create_user(email='c@example.com', full_name='C', password='pw-123456')
        )
        self.assertEqual(self.client.get(self.url).status_code, 403)

    def test_summary_aggregates_sales_by_staff(self):
        shift = ClockRecord.objects.create(staff=self.staff)
        DailyStock.objects.create(product=self.scone, date=timezone.localdate(), quantity_stocked=10)
        SaleEntry.objects.create(shift=shift, product=self.scone, quantity=2, unit_price=Decimal('120'))
        SaleEntry.objects.create(shift=shift, product=self.scone, quantity=1, unit_price=Decimal('120'))
        self.client.force_authenticate(user=self.admin)
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['grand_total_quantity'], 3)
        self.assertEqual(Decimal(str(res.data['grand_total_revenue'])), Decimal('360'))
        self.assertEqual(res.data['by_staff'][0]['staff_name'], 'Lizzy')

    def test_invalid_date_param_is_rejected(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get(self.url, {'date': 'not-a-date'})
        self.assertEqual(res.status_code, 400)
