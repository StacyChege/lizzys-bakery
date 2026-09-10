from django.contrib.auth import get_user_model
from django.core import mail
from django.urls import reverse
from rest_framework.test import APITestCase

User = get_user_model()


class RegistrationTests(APITestCase):
    url = reverse('auth_register')

    def test_register_creates_customer_with_hashed_password(self):
        res = self.client.post(self.url, {
            'email': 'jane@example.com',
            'full_name': 'Jane Doe',
            'phone_number': '0712345678',
            'password': 'sup3r-secret-pw',
        })
        self.assertEqual(res.status_code, 201)
        user = User.objects.get(email='jane@example.com')
        self.assertEqual(user.role, User.CUSTOMER)
        self.assertNotEqual(user.password, 'sup3r-secret-pw')
        self.assertTrue(user.check_password('sup3r-secret-pw'))
        # password must never come back in the response
        self.assertNotIn('password', res.data.get('user', {}))

    def test_register_rejects_duplicate_email(self):
        User.objects.create_user(email='dupe@example.com', full_name='First', password='x')
        res = self.client.post(self.url, {
            'email': 'dupe@example.com',
            'full_name': 'Second',
            'password': 'another-pw-123',
        })
        self.assertEqual(res.status_code, 400)
        self.assertEqual(User.objects.filter(email='dupe@example.com').count(), 1)

    def test_register_rejects_short_password(self):
        res = self.client.post(self.url, {
            'email': 'short@example.com',
            'full_name': 'Shorty',
            'password': 'abc',
        })
        self.assertEqual(res.status_code, 400)


class LoginTests(APITestCase):
    url = reverse('token_obtain_pair')

    def setUp(self):
        self.user = User.objects.create_user(
            email='log@example.com', full_name='Log In', password='right-password-1',
        )

    def test_login_returns_tokens_and_user(self):
        res = self.client.post(self.url, {'email': 'log@example.com', 'password': 'right-password-1'})
        self.assertEqual(res.status_code, 200)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)
        self.assertEqual(res.data['user']['email'], 'log@example.com')
        self.assertEqual(res.data['user']['role'], User.CUSTOMER)

    def test_login_rejects_wrong_password(self):
        res = self.client.post(self.url, {'email': 'log@example.com', 'password': 'wrong'})
        self.assertEqual(res.status_code, 401)


class ProfileTests(APITestCase):
    url = reverse('user_profile')

    def test_me_requires_authentication(self):
        self.assertEqual(self.client.get(self.url).status_code, 401)

    def test_me_returns_the_logged_in_user(self):
        user = User.objects.create_user(email='me@example.com', full_name='Me', password='pw-123456')
        self.client.force_authenticate(user=user)
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['email'], 'me@example.com')


class PasswordResetTests(APITestCase):
    request_url = reverse('password_reset_request')
    confirm_url = reverse('password_reset_confirm')

    def setUp(self):
        self.user = User.objects.create_user(
            email='reset@example.com', full_name='Reset Me', password='old-password-1',
        )

    def test_request_sends_email_for_known_address(self):
        res = self.client.post(self.request_url, {'email': 'reset@example.com'})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('reset@example.com', mail.outbox[0].to)

    def test_request_is_silent_for_unknown_address(self):
        # Same response, no email — the endpoint must not leak who has an account.
        res = self.client.post(self.request_url, {'email': 'nobody@example.com'})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)

    def _uid_and_token_for(self, user):
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.encoding import force_bytes
        from django.utils.http import urlsafe_base64_encode
        return urlsafe_base64_encode(force_bytes(user.pk)), default_token_generator.make_token(user)

    def test_confirm_sets_new_password_with_valid_token(self):
        uid, token = self._uid_and_token_for(self.user)
        res = self.client.post(self.confirm_url, {
            'uid': uid, 'token': token, 'new_password': 'brand-new-pw-9',
        })
        self.assertEqual(res.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('brand-new-pw-9'))

    def test_confirm_rejects_bad_token(self):
        uid, _ = self._uid_and_token_for(self.user)
        res = self.client.post(self.confirm_url, {
            'uid': uid, 'token': 'not-a-real-token', 'new_password': 'brand-new-pw-9',
        })
        self.assertEqual(res.status_code, 400)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('old-password-1'))
