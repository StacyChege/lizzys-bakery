from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core import mail
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from menu.models import Category, Product
from .models import BlockedDate, DeliveryZone, Order

User = get_user_model()


def valid_date(days=7):
    return (timezone.localdate() + timedelta(days=days)).isoformat()


class OrderCreateTests(APITestCase):
    url = reverse('order-create')

    def setUp(self):
        self.category = Category.objects.create(name='Cakes')
        self.cake = Product.objects.create(
            category=self.category, name='Vanilla Cake', base_price=Decimal('2000.00'),
        )
        self.zone = DeliveryZone.objects.create(name='Kikuyu Town', fee=Decimal('150.00'))

    def _payload(self, **overrides):
        payload = {
            'contact_name': 'Mary W',
            'contact_phone': '0712345678',
            'contact_email': 'mary@example.com',
            'date_needed': valid_date(),
            'fulfilment_method': Order.PICKUP,
            'items': [{'product': self.cake.id, 'quantity': 2}],
        }
        payload.update(overrides)
        return payload

    def test_guest_can_place_a_pickup_order(self):
        res = self.client.post(self.url, self._payload(), format='json')
        self.assertEqual(res.status_code, 201)
        order = Order.objects.get()
        self.assertIsNone(order.user)
        self.assertEqual(order.status, Order.PENDING_CONFIRMATION)

    def test_totals_are_computed_from_live_product_price(self):
        res = self.client.post(self.url, self._payload(), format='json')
        order = Order.objects.get()
        # 2 x 2000, pickup so no delivery fee
        self.assertEqual(order.subtotal, Decimal('4000.00'))
        self.assertEqual(order.delivery_fee, Decimal('0'))
        self.assertEqual(order.total, Decimal('4000.00'))
        self.assertEqual(res.data['total'], '4000.00')

    def test_confirmation_email_is_sent(self):
        self.client.post(self.url, self._payload(), format='json')
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('mary@example.com', mail.outbox[0].to)

    def test_rejects_date_inside_lead_time(self):
        res = self.client.post(self.url, self._payload(date_needed=valid_date(days=2)), format='json')
        self.assertEqual(res.status_code, 400)
        self.assertIn('date_needed', res.data)
        self.assertEqual(Order.objects.count(), 0)

    def test_rejects_blocked_date(self):
        BlockedDate.objects.create(date=timezone.localdate() + timedelta(days=7))
        res = self.client.post(self.url, self._payload(), format='json')
        self.assertEqual(res.status_code, 400)
        self.assertEqual(Order.objects.count(), 0)

    def test_rejects_empty_cart(self):
        res = self.client.post(self.url, self._payload(items=[]), format='json')
        self.assertEqual(res.status_code, 400)

    def test_bakery_delivery_requires_zone_and_address(self):
        res = self.client.post(
            self.url, self._payload(fulfilment_method=Order.BAKERY_DELIVERY), format='json',
        )
        self.assertEqual(res.status_code, 400)

    def test_bakery_delivery_applies_zone_fee_to_total(self):
        res = self.client.post(self.url, self._payload(
            fulfilment_method=Order.BAKERY_DELIVERY,
            delivery_zone=self.zone.id,
            delivery_address='12 Kidfarmaco, Kikuyu',
        ), format='json')
        self.assertEqual(res.status_code, 201)
        order = Order.objects.get()
        self.assertEqual(order.delivery_fee, Decimal('150.00'))
        self.assertEqual(order.total, Decimal('4150.00'))

    def test_authenticated_order_attaches_the_user(self):
        user = User.objects.create_user(email='u@example.com', full_name='U', password='pw-123456')
        self.client.force_authenticate(user=user)
        self.client.post(self.url, self._payload(), format='json')
        self.assertEqual(Order.objects.get().user, user)


class MyOrdersTests(APITestCase):
    url = reverse('order-mine')

    def setUp(self):
        self.alice = User.objects.create_user(email='alice@example.com', full_name='Alice', password='pw-123456')
        self.bob = User.objects.create_user(email='bob@example.com', full_name='Bob', password='pw-123456')
        Order.objects.create(
            user=self.alice, contact_name='Alice', contact_phone='07', date_needed=timezone.localdate(),
            fulfilment_method=Order.PICKUP, subtotal=Decimal('100'), total=Decimal('100'),
        )
        Order.objects.create(
            user=self.bob, contact_name='Bob', contact_phone='07', date_needed=timezone.localdate(),
            fulfilment_method=Order.PICKUP, subtotal=Decimal('200'), total=Decimal('200'),
        )

    def test_requires_authentication(self):
        self.assertEqual(self.client.get(self.url).status_code, 401)

    def test_only_returns_the_callers_orders(self):
        self.client.force_authenticate(user=self.alice)
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['contact_name'], 'Alice')


class PublicListTests(APITestCase):
    def test_delivery_zones_list_is_public_and_active_only(self):
        DeliveryZone.objects.create(name='Active', fee=Decimal('150'))
        DeliveryZone.objects.create(name='Retired', fee=Decimal('150'), is_active=False)
        res = self.client.get(reverse('delivery-zone-list'))
        self.assertEqual(res.status_code, 200)
        names = [z['name'] for z in res.data]
        self.assertIn('Active', names)
        self.assertNotIn('Retired', names)

    def test_blocked_dates_list_excludes_past_dates(self):
        past = BlockedDate.objects.create(date=timezone.localdate() - timedelta(days=1))
        future = BlockedDate.objects.create(date=timezone.localdate() + timedelta(days=10))
        res = self.client.get(reverse('blocked-date-list'))
        dates = [d['date'] for d in res.data]
        self.assertIn(future.date.isoformat(), dates)
        self.assertNotIn(past.date.isoformat(), dates)


class AdminOrderTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email='admin@example.com', full_name='Baker', password='pw-123456', role=User.ADMIN,
        )
        self.customer = User.objects.create_user(
            email='cust@example.com', full_name='Cust', password='pw-123456',
        )
        self.order = Order.objects.create(
            contact_name='Someone', contact_phone='07', contact_email='someone@example.com',
            date_needed=timezone.localdate(), fulfilment_method=Order.PICKUP,
            subtotal=Decimal('1000'), total=Decimal('1000'),
        )

    def test_list_is_forbidden_for_customers(self):
        self.client.force_authenticate(user=self.customer)
        self.assertEqual(self.client.get(reverse('admin-order-list')).status_code, 403)

    def test_list_is_allowed_for_admin_and_filters_by_status(self):
        Order.objects.create(
            contact_name='Cancelled', contact_phone='07', date_needed=timezone.localdate(),
            fulfilment_method=Order.PICKUP, status=Order.CANCELLED,
            subtotal=Decimal('1'), total=Decimal('1'),
        )
        self.client.force_authenticate(user=self.admin)
        res = self.client.get(reverse('admin-order-list'), {'status': Order.CANCELLED})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['status'], Order.CANCELLED)

    def test_status_update_sends_email_and_returns_full_order(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-order-status-update', args=[self.order.id])
        res = self.client.patch(url, {'status': Order.CONFIRMED}, format='json')
        self.assertEqual(res.status_code, 200)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.CONFIRMED)
        self.assertIn('items', res.data)  # full OrderSerializer shape, not just {"status": ...}
        self.assertEqual(len(mail.outbox), 1)

    def test_status_update_to_same_value_sends_no_email(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-order-status-update', args=[self.order.id])
        self.client.patch(url, {'status': Order.PENDING_CONFIRMATION}, format='json')
        self.assertEqual(len(mail.outbox), 0)

    def test_stats_exclude_cancelled_orders(self):
        Order.objects.create(
            contact_name='Cancelled', contact_phone='07', date_needed=timezone.localdate(),
            fulfilment_method=Order.PICKUP, status=Order.CANCELLED,
            subtotal=Decimal('9999'), total=Decimal('9999'),
        )
        self.client.force_authenticate(user=self.admin)
        res = self.client.get(reverse('admin-order-stats'))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['orders_this_week'], 1)
        self.assertEqual(Decimal(str(res.data['revenue_this_week'])), Decimal('1000'))
