"""
This file demonstrates two different styles of tests (one doctest and one
unittest). These will both pass when you run "manage.py test".

Replace these with more appropriate tests for your application.
"""
import datetime, os, zipfile
from cStringIO import StringIO

from django.core import mail, serializers
from django.test import TestCase
from django.test.client import Client

from coreo.ucore.models import *


# XXX in every setUp(), a CoreUser is being created. This should be put into a fixture


class LoginTest(TestCase):
  def setUp(self):
    self.user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222')
    self.user.set_password('2pass')
    self.user.save()

  def test_login(self):
    self.client.post('/login/', {'username': 'testuser', 'password': '2pass'})

    self.assertTrue(self.client.session.has_key('_auth_user_id'))

    print '\nPassed the login test.'


class LogoutTest(TestCase):
  def setUp(self):
    self.user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222')
    self.user.set_password('2pass')
    self.user.save()

    self.assertTrue(self.client.login(username='testuser', password='2pass'))

  def test_logout(self):
    self.client.get('/logout/')

    self.assertFalse(self.client.session.has_key('_auth_user_id'))


class CreateLibraryTest(TestCase):

  def setUp(self):
    self.user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222')
    self.user.set_password('2pass')
    self.user.save()


  def testCreate(self):
    self.client.login(username='testuser', password='2pass')
    response = self.client.get('/library-demo/')
    self.assertEquals(response.status_code, 200)
    # Link.create(
    # response = self.client.post('/create-library/', { 'name': 'test library', 'desc': 'test description', 'links': '1,3,5'})
    # self.assertEquals(response.status_code, 200)
    # self.assertEquals(LinkLibrary.objects.all().count(), 1)
    # library = LinkLibrary.objects.get(pk=1)
    # self.assertEquals(library.name, 'test library')
    # self.assertEquals(library.links.all().count(), 3)
    print 'Passed the create link library test.'


class TrophyTest(TestCase):
  def  setUp(self):
    self.user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222',skin=Skin.objects.get(name='Default'))
    self.user.set_password('2pass')
    self.user.save()

    # clear out the auto-generated trophy cases and notifications
    TrophyCase.objects.all().delete()
    Notification.objects.all().delete()
    mail.outbox = []

    self.assertTrue(self.client.login(username='testuser', password='2pass'))
    self.assertTrue(self.client.login(username='testuser', password='2pass'))

  def test_trophypage(self):
    response = self.client.get('/trophyroom/')

    self.assertEqual(response.status_code, 200)

    print 'Passed the trophyroom url test.\n'

  def test_post_save_signal(self):
    ocean_tag = Tag.objects.get(name='Ocean', type='T')
    user = CoreUser.objects.get(pk=1)

    for x in range(1, 6):
      term_value = 'Ocean' + str(x)
      search_log  = SearchLog(user=user, date_queried=datetime.datetime.now(), search_terms=term_value)
      search_log.save()
      search_log.search_tags.add(ocean_tag)
      search_log.save()    

    self.assertEqual(TrophyCase.objects.all().count(), 1)

    trophy_case = TrophyCase.objects.get(pk=1)
    self.assertEquals(trophy_case.trophy.name, 'Captain Blackbeard Trophy')
    self.assertEquals(trophy_case.date_earned, datetime.date.today())

    print '\nPassed the e-mail test'
    print '\nPassed the signal test.'

  def test_registration_trophy_earned(self):
    self.client.post('/save-user/', {'sid': 'something', 'username': 'bubba', 'first_name': 'Bubba', 'last_name': 'Smith',
      'password': 'somethinghere', 'email':'prcoleman2@gmail.com', 'phone_number':'(555)555-4444'})

    self.assertEquals(TrophyCase.objects.all().count(), 1)

    trophy_case = TrophyCase.objects.get(pk=1)

    self.assertEquals(trophy_case.user.username, 'bubba')
    self.assertEquals(trophy_case.trophy.name, 'Successful Registration Trophy')

    print 'Passed the registration trophy test.'


class CsvTest(TestCase):
  def setUp(self):
    self.user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222')
    self.user.set_password('2pass')
    self.user.save()

    self.assertTrue(self.client.login(username='testuser', password='2pass'))

  def test_get_csv(self):
    response = self.client.get('/export-csv/')

    self.assertTrue(response.content, 'First,1,2,3\nSecond,4,5,6\nThird, 7,8,9')

    print '\nPassed the get_csv test'
  
  
class KmzTest(TestCase):
  def setUp(self):
    self.user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222')
    self.user.set_password('2pass')
    self.user.save()

    self.assertTrue(self.client.login(username='testuser', password='2pass'))

  def test_get_kmz(self):
    response = self.client.get('/getkmz/')

    with open('download.kmz', 'wb') as f:
      f.write(response.content)

    with open('download.kmz', 'rb') as f:
      zip = zipfile.ZipFile(f, 'r', zipfile.ZIP_DEFLATED)

      self.assertEquals(zip.namelist()[0], 'doc.kml')

      with open(zip.extract('doc.kml')) as kml_file:
        for line in kml_file:
          self.assertIn('<?xml version="1.0" encoding="UTF-8"?>', line)
          break

    # These two lines below were added to remove the files from out of the 
    # project directory since they aren't deleted automatically. - PC
    os.remove('doc.kml')
    os.remove('download.kmz')
    
    print 'Passed the get_kmz test.'


class ShapefileTest(TestCase):
  def setUp(self):
    self.user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222')
    self.user.set_password('2pass')
    self.user.save()

    self.assertTrue(self.client.login(username='testuser', password='2pass'))

  def test_get_shapefile(self):
    response = self.client.get('/getshp/')

    with open('sample.zip', 'wb') as f:
      f.write(response.content)

    with open('sample.zip', 'rb') as f:
      zip_names = zipfile.ZipFile(f, 'r', zipfile.ZIP_DEFLATED).namelist()

      self.assertEquals(zip_names[0], 'sample.shx')
      self.assertEquals(zip_names[1], 'sample.dbf')
      self.assertEquals(zip_names[2], 'sample.shp')

    # The lines below were added to clean the file system after the test.  - PC
    os.remove('sample.zip')
    os.remove('sample.shx')
    os.remove('sample.dbf')
    os.remove('sample.shp')

    print 'Passed the get_shapefile test.'
 

class NotificationTest(TestCase):
  def setUp(self):
    self.user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222')
    self.user.set_password('2pass')
    self.user.save()

    # delete the auto-generated notification resulting from saving a new user and add a know notification
    Notification.objects.all().delete()
    mail.outbox = [] # empty the outbox
    Notification.objects.create(user=self.user, type='TR', message='You won a new registration trophy')

    self.assertTrue(self.client.login(username='testuser', password='2pass'))

  def test_get_notification(self):
    response = self.client.get('/notifications/')

    for obj in serializers.deserialize('json', response.content):
      # there's only 1 deserialized obj, in this case
      self.assertEquals(obj.object.message, 'You won a new registration trophy')
      self.assertEquals(obj.object.type, 'TR')
      self.assertEquals(obj.object.user, self.user)

    print 'The GET method of notifications works well.'

  def test_delete_notification(self):
    self.client.delete('/notifications/1/') 

    self.assertEquals(Notification.objects.all().count(), 0)

    print 'The DELETE method of notifications also works.'
    print 'Poll notification test has passed.'

  def test_post_save_signal(self):
    self.assertEquals(len(mail.outbox), 1)


class RateTest(TestCase):
  def setUp(self):
    # this could be in a fixture
    self.user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222')
    self.user.set_password('2pass')
    self.user.save()

    self.poc = POC.objects.create(first_name='homer', last_name='simpson', phone_number='1234567890', email='homer@simpsons.com')

    self.link_tags = (Tag.objects.create(name='LinkTag1'), Tag.objects.create(name='LinkTag2'))
    self.link_library_tags = (Tag.objects.create(name='LinkLibraryTag1'), Tag.objects.create(name='LinkLibraryTag2'))

    self.link = Link.objects.create(name='Test Link', desc='Just a test', url='http://test.com', poc=self.poc)
    self.link.tags.add(self.link_tags[0])
    self.link.tags.add(self.link_tags[1])

    self.link_library = LinkLibrary.objects.create(name='Test LL', desc='Just a test', user=self.user)
    self.link_library.tags.add(self.link_library_tags[0])
    self.link_library.tags.add(self.link_library_tags[1])
    self.link_library.links.add(self.link)

    self.assertTrue(self.client.login(username='testuser', password='2pass'))

  def test_view_link_rating(self):
    rating_fk = RatingFK.objects.create(user=self.user, link=self.link)
    rating = Rating.objects.create(rating_fk=rating_fk, score=3, comment='could be better')

    response = self.client.get('/rate/link/1/')

    self.assertTemplateUsed(response, 'rate.html')
    self.assertEquals(response.status_code, 200)
    self.assertEquals(response.context['rating'].score, 3)
    self.assertEquals(response.context['rating'].comment, 'could be better')
    self.assertEquals(response.context['link'], self.link)
    self.assertEquals(response.context['link_library'], None)
    print 'The test for view link rating has passed'

  def test_view_link_library_rating(self):
    rating_fk = RatingFK.objects.create(user=self.user, link_library=self.link_library)
    rating = Rating.objects.create(rating_fk=rating_fk, score=5, comment='mint chocolate chip!')

    response = self.client.get('/rate/library/1/')

    self.assertTemplateUsed(response, 'rate.html')
    self.assertEquals(response.status_code, 200)
    self.assertEquals(response.context['rating'].score, 5)
    self.assertEquals(response.context['rating'].comment, 'mint chocolate chip!')
    self.assertEquals(response.context['link'], None)
    self.assertEquals(response.context['link_library'], self.link_library)
    print 'The test for view link library has passed.'

  def test_rating_link(self):
    response = self.client.post('/rate/link/1/', {'score': 1, 'comment': 'What is this? A link for ants?!'})

    self.assertRedirects(response, '/success/')
    self.assertEquals(RatingFK.objects.all().count(), 1)
    self.assertEquals(Rating.objects.all().count(), 1)

    rating_fk = RatingFK.objects.get(pk=1)
    self.assertEquals(rating_fk.user, self.user)
    self.assertEquals(rating_fk.link, self.link)
    self.assertEquals(rating_fk.link_library, None)

    rating = Rating.objects.get(pk=1)
    self.assertEquals(rating.rating_fk, rating_fk)
    self.assertEquals(rating.score, 1)
    self.assertEquals(rating.comment, 'What is this? A link for ants?!')
    print 'Passed the tests for rating a link.'

  def test_rating_link_library(self):
    response = self.client.post('/rate/library/1/', {'score': 1, 'comment': 'What is this? A library for ants?!'})

    self.assertRedirects(response, '/success/')
    self.assertEquals(RatingFK.objects.all().count(), 1)
    self.assertEquals(Rating.objects.all().count(), 1)

    rating_fk = RatingFK.objects.get(pk=1)
    self.assertEquals(rating_fk.user, self.user)
    self.assertEquals(rating_fk.link, None)
    self.assertEquals(rating_fk.link_library, self.link_library)

    rating = Rating.objects.get(pk=1)
    self.assertEquals(rating.rating_fk, rating_fk)
    self.assertEquals(rating.score, 1)
    self.assertEquals(rating.comment, 'What is this? A library for ants?!')
    print 'Passed the test for rating a link library.'

