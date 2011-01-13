"""
This file demonstrates two different styles of tests (one doctest and one
unittest). These will both pass when you run "manage.py test".

Replace these with more appropriate tests for your application.
"""
import datetime, zipfile, os
from cStringIO import StringIO

from django.test import TestCase
from django.core import mail
from django.test.client import Client

from coreo.ucore.models import CoreUser, Skin, Tag, SearchLog, TrophyCase


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
    user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222', skin=Skin.objects.get(name='Default'))
    user.set_password('2pass')
    user.save()
    c = Client()

    self.assertTrue(c.login(username='testuser', password='2pass'))

    print '\nPassed the login test.'


  def test_trophypage(self):
    c = Client()
    c.login(username='testuser', password='2pass')
    response = c.get('/trophyroom/')

    self.assertEqual(response.status_code, 200)

    print 'Passed the trophyroom url test.\n'


  def test_signal_isworking(self):
    user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222', skin=Skin.objects.get(name='Default'))
    user.set_password('2pass')
    user.save()

    tagref = Tag.objects.get(name='Ocean')
    user = CoreUser.objects.get(pk=1)

    for x in range(1, 6):
      term_value = "Ocean" + str(x)
      anything  = SearchLog(user=user, date_queried=datetime.datetime.now(), search_terms=term_value)
      anything.save()
      anything.search_tags.add(Tag.objects.get(name='Ocean'))
      anything.save()    

    self.assertEqual(TrophyCase.objects.all().count(), 1)

    trophy = TrophyCase.objects.get(pk=1)
    self.assertEquals("Captain Blackbeard Trophy", trophy.trophy.name)
    self.assertEquals(len(mail.outbox), 1)

    print '\nPassed the e-mail test'
    print '\nPassed the signal test.'


  def test_registration_trophy_isearned(self):
    c = Client()
    c.post('/save-user/', {'sid': 'something', 'username': 'bubba', 'first_name': 'Bubba', 'last_name': 'Smith',
      'password': 'somethinghere', 'email':'prcoleman2@gmail.com', 'phone_number':'5555554444'})

    self.assertEquals(TrophyCase.objects.all().count(), 1)

    trophy = TrophyCase.objects.get(pk=1).trophy

    self.assertEquals("Successful Registration Trophy", trophy.name)
    self.assertEquals(len(mail.outbox), 1)
    self.assertEquals('bubba', TrophyCase.objects.get(pk=1).user.username)

    print 'Passed the registration trophy test.'


  def test_get_csv(self):
    c = Client()
    user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222',skin=Skin.objects.get(name='Default'))
    user.set_password('2pass')
    user.save()

    self.assertTrue(c.login(username='testuser', password='2pass'))

    response = c.get('/export-csv/')
    self.assertTrue(response.content, 'First,1,2,3\nSecond,4,5,6\nThird, 7,8,9')

    print '\nPassed the get_csv test'
  
  
  def test_get_kmz(self):
    c = Client()
    user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222',skin=Skin.objects.get(name='Default'))
    user.set_password('2pass')
    user.save()

    self.assertTrue(c.login(username='testuser', password='2pass'))

    response = c.get('/getkmz/')
    f = open('download.zip', 'wb')
    f.write(response.content)
    f.close()

    f = open('download.zip', 'rb')
    zip = zipfile.ZipFile(f, 'r', zipfile.ZIP_DEFLATED)
    extract = zip.extract('doc.kml')
    fread = open(extract)

    for line in fread:
      self.assertIn("<?xml version='1.0' encoding='UTF-8'?>", line)
      break

    fread.close()

    for i in zip.namelist():
      self.assertEquals('doc.kml', i)

    # These two lines below were added to remove the files from out of the 
    # project directory since they aren't deleted automatically. - PC
    os.remove('doc.kml')
    os.remove('download.zip')
    
    print 'Passed the get_kmz test.'


  def test_get_shapefile(self):
    c = Client()
    user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222',skin=Skin.objects.get(name='Default'))
    user.set_password('2pass')
    user.save()

    self.assertTrue(c.login(username='testuser', password='2pass'))

    response = c.get('/getshp/')
    f = open('sample.zip', 'wb')
    f.write(response.content)
    f.close()
    f = open('sample.zip', 'rb')
    zip = zipfile.ZipFile(f, 'r', zipfile.ZIP_DEFLATED)
    counter = 1

    for i in zip.namelist():
      if (counter == 1):
        self.assertEquals('sample.shx', i)
      elif (counter == 2):
        self.assertEquals('sample.dbf', i)
      elif (counter == 3):
        self.assertEquals('sample.shp', i)
      counter = counter + 1

    # The lines below were added to clean the file system
    # after the test.  - PC
    os.remove('sample.zip')
    os.remove('sample.shx')
    os.remove('sample.dbf')
    os.remove('sample.shp')

    print 'Passed the get_shapefile test.'
 

  def test_poll_notifications(self):
    self.assertTrue(True)

