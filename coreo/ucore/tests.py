"""
This file demonstrates two different styles of tests (one doctest and one
unittest). These will both pass when you run "manage.py test".

Replace these with more appropriate tests for your application.
"""

from django.test import TestCase
from django.test.client import Client
from coreo.ucore.models import CoreUser, Skin

class SimpleTest(TestCase):
    def test_basic_addition(self):
        """
        Tests that 1 + 1 always equals 2.
        """
        self.failUnlessEqual(1 + 1, 2)

__test__ = {"doctest": """
Another way to test that 1 + 1 is equal to 2.

>>> 1 + 1 == 2
True
"""}


class LoginTest(TestCase):
  fixtures = ['initial_data.json']


  def test_login(self):
    user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com', phone_number='9221112222', skin=Skin.objects.get(name='Default'))
    user.set_password('2pass')
    user.save()
    c = Client()
    self.assertTrue(c.login(username='testuser', password='2pass'))
    print '\nPassed the login part'


  def test_trophypage(self):
    c = Client()
    c.login(username='testuser', password='2pass')
    response = c.get('/trophyroom/')
    self.assertEqual(response.status_code, 200)
    print 'Passed the trophyroom url part\n'


