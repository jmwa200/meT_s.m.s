from rest_framework.test import APITestCase
from django.urls import reverse
from api.models import User

class LoginAPITestCase(APITestCase):
    def setUp(self):
        self.username = "testuser"
        self.password = "testpassword"
        self.user = User.objects.create_user(username=self.username, password=self.password)

    def test_login_success(self):
        """
        Ensure users can log in and receive a token.
        """
        url = reverse("api-login")  # Assuming 'api-login' is the name of the url pattern
        data = {
            "username": self.username,
            "password": self.password
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue("token" in response.data)
