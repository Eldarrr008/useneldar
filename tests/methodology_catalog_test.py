"""Public-access regression checks; run: python3 -m unittest discover -s tests -p '*_test.py'."""
import os
import unittest
from pathlib import Path
import requests


class CatalogAccessTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        config = dict(os.environ)
        # Read configuration without printing keys or file contents.
        for line in Path('.env').read_text().splitlines():
            if '=' in line and not line.startswith('#'):
                key, value = line.split('=', 1)
                config.setdefault(key.strip(), value.strip().strip('\"\''))
        cls.url = config['VITE_SUPABASE_URL'] + '/rest/v1/methodology_catalog'
        cls.headers = {'apikey': config['VITE_SUPABASE_PUBLISHABLE_KEY']}

    def test_catalog_is_not_publicly_readable(self):
        response = requests.get(self.url, headers=self.headers, timeout=30)
        if response.status_code == 200:
            self.assertEqual(response.json(), [])
        else:
            self.assertIn(response.status_code, (401, 403))

    def test_anonymous_user_cannot_add_methodology(self):
        response = requests.post(self.url, headers=self.headers, json={
            'code': 'anonymous-access-regression', 'title': 'Access regression',
            'category': 'Access regression',
        }, timeout=30)
        self.assertIn(response.status_code, (401, 403))


if __name__ == '__main__':
    unittest.main()