from django.test import TestCase
from django.urls import reverse


class HealthCheckTests(TestCase):
    url = reverse('health-check')

    def test_reports_ok_when_the_database_is_reachable(self):
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json(), {'status': 'ok', 'database': True})

    def test_is_public(self):
        # Dokploy's container healthcheck hits this with no credentials.
        res = self.client.get(self.url)
        self.assertNotIn(res.status_code, (401, 403))
