from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core import mail
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from orders.models import BlockedDate
from .models import Category, CustomCakeRequest, Product, Testimonial

User = get_user_model()


def valid_date(days=7):
    return (timezone.localdate() + timedelta(days=days)).isoformat()


class MenuBase(APITestCase):
    def setUp(self):
        self.cakes = Category.objects.create(name='Cakes', sort_order=1)
        self.pastries = Category.objects.create(name='Pastries', sort_order=2)
        self.red_velvet = Product.objects.create(
            category=self.cakes, name='Red Velvet', base_price=Decimal('2500'),
            description='rich chocolate crumb',
        )
        self.croissant = Product.objects.create(
            category=self.pastries, name='Butter Croissant', base_price=Decimal('150'),
        )
        self.sold_out = Product.objects.create(
            category=self.pastries, name='Sold Out Bun', base_price=Decimal('100'),
            is_available=False,
        )
        self.admin = User.objects.create_user(
            email='baker@example.com', full_name='Baker', password='pw-123456', role=User.ADMIN,
        )
        self.customer = User.objects.create_user(
            email='cust@example.com', full_name='Cust', password='pw-123456',
        )


class PublicMenuTests(MenuBase):
    def test_category_list_is_public(self):
        res = self.client.get(reverse('category-list'))
        self.assertEqual(res.status_code, 200)
        self.assertEqual([c['name'] for c in res.data], ['Cakes', 'Pastries'])

    def test_product_list_hides_unavailable_products(self):
        res = self.client.get(reverse('product-list'))
        names = [p['name'] for p in res.data]
        self.assertIn('Red Velvet', names)
        self.assertNotIn('Sold Out Bun', names)

    def test_product_list_filters_by_category_slug(self):
        res = self.client.get(reverse('product-list'), {'category': self.pastries.slug})
        names = [p['name'] for p in res.data]
        self.assertEqual(names, ['Butter Croissant'])

    def test_product_list_search_matches_name_or_description(self):
        res = self.client.get(reverse('product-list'), {'search': 'chocolate'})
        self.assertEqual([p['name'] for p in res.data], ['Red Velvet'])

    def test_product_detail_is_looked_up_by_slug(self):
        res = self.client.get(reverse('product-detail', args=[self.red_velvet.slug]))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['name'], 'Red Velvet')


class TestimonialTests(MenuBase):
    def test_public_list_only_shows_published(self):
        Testimonial.objects.create(author_name='Wanjiru', quote='Best cake ever', is_published=True)
        Testimonial.objects.create(author_name='Hidden', quote='draft', is_published=False)
        res = self.client.get(reverse('testimonial-list'))
        authors = [t['author_name'] for t in res.data]
        self.assertEqual(authors, ['Wanjiru'])

    def test_admin_list_includes_unpublished_and_needs_admin(self):
        Testimonial.objects.create(author_name='Hidden', quote='draft', is_published=False)
        self.client.force_authenticate(user=self.customer)
        self.assertEqual(self.client.get(reverse('admin-testimonial-list-create')).status_code, 403)
        self.client.force_authenticate(user=self.admin)
        res = self.client.get(reverse('admin-testimonial-list-create'))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 1)

    def test_admin_can_create_a_testimonial(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.post(reverse('admin-testimonial-list-create'), {
            'author_name': 'Brian O', 'quote': 'Graduation cake was perfect', 'occasion': 'Graduation',
        })
        self.assertEqual(res.status_code, 201)
        self.assertTrue(Testimonial.objects.filter(author_name='Brian O').exists())


class CustomCakeRequestTests(MenuBase):
    url = reverse('custom-cake-request-create')

    def _payload(self, **overrides):
        payload = {
            'name': 'Aisha K', 'email': 'aisha@example.com', 'phone_number': '0712345678',
            'date_needed': valid_date(), 'occasion': 'Birthday', 'tier_count': 2,
            'flavour': 'Chocolate', 'special_notes': 'nut allergy',
        }
        payload.update(overrides)
        return payload

    def test_anyone_can_submit_a_request_and_gets_a_confirmation_email(self):
        res = self.client.post(self.url, self._payload())
        self.assertEqual(res.status_code, 201)
        req = CustomCakeRequest.objects.get()
        self.assertEqual(req.status, CustomCakeRequest.PENDING)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('aisha@example.com', mail.outbox[0].to)

    def test_rejects_date_inside_lead_time(self):
        res = self.client.post(self.url, self._payload(date_needed=valid_date(days=1)))
        self.assertEqual(res.status_code, 400)
        self.assertEqual(CustomCakeRequest.objects.count(), 0)

    def test_rejects_blocked_date(self):
        BlockedDate.objects.create(date=timezone.localdate() + timedelta(days=7))
        res = self.client.post(self.url, self._payload())
        self.assertEqual(res.status_code, 400)


class AdminCustomCakeRequestTests(MenuBase):
    def setUp(self):
        super().setUp()
        self.req = CustomCakeRequest.objects.create(
            name='Aisha K', email='aisha@example.com', phone_number='07',
            date_needed=timezone.localdate() + timedelta(days=10), occasion='Birthday',
        )
        self.url = reverse('admin-custom-cake-request-update', args=[self.req.id])

    def test_update_requires_admin(self):
        self.client.force_authenticate(user=self.customer)
        self.assertEqual(self.client.patch(self.url, {'status': 'QUOTED'}, format='json').status_code, 403)

    def test_status_change_sends_an_email(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.patch(
            self.url, {'status': CustomCakeRequest.QUOTED, 'quoted_price': '5000'}, format='json',
        )
        self.assertEqual(res.status_code, 200)
        self.req.refresh_from_db()
        self.assertEqual(self.req.status, CustomCakeRequest.QUOTED)
        self.assertEqual(self.req.quoted_price, Decimal('5000'))
        self.assertEqual(len(mail.outbox), 1)

    def test_customer_submitted_fields_are_read_only(self):
        self.client.force_authenticate(user=self.admin)
        self.client.patch(self.url, {'name': 'Tampered', 'occasion': 'Wedding'}, format='json')
        self.req.refresh_from_db()
        self.assertEqual(self.req.name, 'Aisha K')
        self.assertEqual(self.req.occasion, 'Birthday')
