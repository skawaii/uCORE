import datetime, json, os, zipfile
from cStringIO import StringIO

from django.core import mail, serializers
from django.test import TestCase
from django.test.client import Client

from coreo.ucore import utils
from coreo.ucore.models import *


# XXX in every setUp(), a CoreUser is being created. This should be put into a fixture

class LinkLibraryTest(TestCase):
  def setUp(self):
    self.user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222')
    self.user.set_password('2password')
    self.user.save()

    self.assertTrue(self.client.login(username='testuser', password='2password'))

    Tag.objects.create(name='WarmButton', type='P')
    self.poc = POC.objects.create(first_name='Jerry', last_name='Smith', phone_number='4443332222', email='prcoleman2@gmail.com')

    self.link1 = Link.objects.create(name='yahoo', desc='search site', url='www.yahoo.com', poc=self.poc)
    self.link1.tags.add(Tag.objects.get(name='HotButton'))

    self.link2 = Link.objects.create(name='lifehacker', desc='fun site', url='www.lifehacker.com', poc=self.poc)
    self.link2.tags.add(Tag.objects.get(name='HotButton'))

  def test_get_link(self):
    link = Link.objects.create(name='test_get_link',url='http://test_get_link',poc=self.poc)
    response = self.client.get('/links/%s/' % link.pk)
    self.assertEquals(response.content, '{"pk": %s, "model": "ucore.link", "fields": {"url": "http://test_get_link", "desc": "", "poc": %s, "name": "test_get_link", "tags": []}}' % (link.pk,self.poc.pk,))
    response = self.client.get('/links/foo/')
    self.assertEquals(response.status_code, 404)
    response = self.client.get('/links//')
    self.assertEquals(response.status_code, 404)
    
  def test_library_demo(self):
    response = self.client.get('/library-demo/')
    self.assertEquals(response.status_code, 200)

  def test_create(self):
    links = "1, 2"
    tags = "HotButton,WarmButton"
    response = self.client.post('/create-library/', {'name': 'test library', 'desc': 'test description', 'links': links, 'tags': tags })
    self.assertEquals(response.status_code, 200)
    self.assertEquals(LinkLibrary.objects.count(), 1)
    user = CoreUser.objects.get(username='testuser')
    self.assertEquals(1, user.libraries.count())

    library = LinkLibrary.objects.get(pk=1)
    self.assertEquals(library.links.count(), 2)
    # print 'Two links found in the library... checking if they are the right ones.'

    self.assertEquals(library.links.get(name='lifehacker').name, 'lifehacker')
    self.assertEquals(library.links.get(name='yahoo').name, 'yahoo')
    # print 'Ok the two links in the library created, are correct.'

    self.assertEquals(library.tags.count(), 2)
    self.assertEquals(library.tags.get(name='HotButton').name, 'HotButton')
    self.assertEquals(library.tags.get(name='WarmButton').name, 'WarmButton')

    response = self.client.post('/create-library/', {'name': 'test library', 'desc': 'test description', 'links': '', 'tags': '' })
    self.assertTrue(response.content.isdigit(), "response contains new library's primary key")
    library = LinkLibrary.objects.get(pk=int(response.content))
    self.assertTrue(library, "library was created")
    self.assertEqual('test library', library.name, "library name was saved correctly")
    self.assertEqual('test description', library.desc, "library desc was saved correctly")
    self.assertEqual(0, library.tags.count(), "library tags field is empty")
    self.assertEqual(0, library.links.count(), "library links field is empty")
    
    response = self.client.post('/create-library/', {'name': 'test library', 'desc': 'test description', 'links': 'notanumber', 'tags': '' })
    self.assertTrue(response.content.isdigit(), "response contains new library's primary key")
    library = LinkLibrary.objects.get(pk=int(response.content))
    self.assertTrue(library, "library was created")
    self.assertEqual('test library', library.name, "library name was saved correctly")
    self.assertEqual('test description', library.desc, "library desc was saved correctly")
    self.assertEqual(0, library.tags.count(), "library tags field is empty")
    self.assertEqual(0, library.links.count(), "library links field is empty")
    
    response = self.client.post('/create-library/', {'name': 'test library', 'desc': 'test description', 'links': ''})
    self.assertTrue(response.content.isdigit(), "response contains new library's primary key")
    library = LinkLibrary.objects.get(pk=int(response.content))
    self.assertTrue(library, "library was created")
    self.assertEqual('test library', library.name, "library name was saved correctly")
    self.assertEqual('test description', library.desc, "library desc was saved correctly")
    self.assertEqual(0, library.tags.count(), "library tags field is empty")
    self.assertEqual(0, library.links.count(), "library links field is empty")
    
    response = self.client.post('/create-library/', {'name': 'test library', 'desc': 'test description', 'tags': '' })
    self.assertTrue(response.content.isdigit(), "response contains new library's primary key")
    library = LinkLibrary.objects.get(pk=int(response.content))
    self.assertTrue(library, "library was created")
    self.assertEqual('test library', library.name, "library name was saved correctly")
    self.assertEqual('test description', library.desc, "library desc was saved correctly")
    self.assertEqual(0, library.tags.count(), "library tags field is empty")
    self.assertEqual(0, library.links.count(), "library links field is empty")
    
    # print 'Passed the create link library test.'
  def test_update_library(self):

    links = "1, 2"
    tags = "HotButton,WarmButton"
    response = self.client.post('/create-library/', {'name': 'test library', 'desc': 'test description', 'links': links, 'tags': tags })
    self.assertEquals(response.status_code, 200)
    self.assertEquals(LinkLibrary.objects.count(), 1)
    user = CoreUser.objects.get(username='testuser')
    self.assertEquals(1, user.libraries.count())

    # Now check the update ability....
    links = "1, 3"
    
    self.link3 = Link.objects.create(name='CNN news', desc='news site', url='www.cnn.com', poc=self.poc)
    self.link3.tags.add(Tag.objects.get(name='HotButton'))
    response = self.client.post('/update-library/', { 'id': '1', 'name': 'modified name', 'desc': 'modified description', 'links': links, 'tags': tags })
    self.assertEquals(response.status_code, 200)
    self.assertEquals(LinkLibrary.objects.count(), 1)
    library = LinkLibrary.objects.get(pk=1)
    self.assertEquals('modified name',  library.name)
    self.assertEquals('modified description', library.desc)
    self.assertEquals(2,  library.links.count())
    self.assertIsNotNone(library.links.get(pk=3))
    #
    #  self.assertContains(1, library.links.all())


  def test_add_single(self):
    creator = CoreUser.objects.create(sid='me', username='meme', first_name='me', last_name='me', email='me@me.com', phone_number='1234567890')
    link_library = LinkLibrary.objects.create(name='test library', desc='just a test', creator=creator)

    response = self.client.post('/add-library/', {'library_id': link_library.id})
    self.assertRedirects(response, '/success/')

    libraries = self.user.libraries.all()
    self.assertEquals(libraries.count(), 1)
    self.assertEquals(libraries[0].name, link_library.name)

  def test_add_multi(self):
    creator = CoreUser.objects.create(sid='me', username='meme', first_name='me', last_name='me', email='me@me.com', phone_number='1234567890')
    link_library1 = LinkLibrary.objects.create(name='library1', desc='just a test', creator=creator)
    link_library2 = LinkLibrary.objects.create(name='library2', desc='just a test', creator=creator)

    response = self.client.post('/add-library/', {'library_id': (link_library1.id, link_library2.id)})
    self.assertRedirects(response, '/success/')

    libraries = self.user.libraries.all()
    self.assertEquals(libraries.count(), 2)
    self.assertEquals(libraries[0].name, link_library1.name)
    self.assertEquals(libraries[1].name, link_library2.name)

  def test_delete_single(self):
    user = CoreUser.objects.get(username='testuser')
    link_library1 = LinkLibrary.objects.create(name='library1', desc='just a test', creator=user)
    library = LinkLibrary.objects.get(pk=1)
    user.libraries.add(library)
    user.save()
    self.assertEquals(1, user.libraries.count())
    # for i in user.libraries.all():
    #  print i.pk
    response = self.client.post('/delete-libraries/', { 'library_id': 1 })
    self.assertEqual(response.status_code, 200)
    user = CoreUser.objects.get(username='testuser')
    self.assertEqual(0, user.libraries.count())

class LinkTest(TestCase):

  def setUp(self):
    self.user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222')
    self.user.set_password('2password')
    self.user.save()
    self.assertTrue(self.client.login(username='testuser', password='2password'))
    Tag.objects.create(name='WarmButton', type='P')
    self.poc = POC.objects.create(first_name='Jerry', last_name='Smith', phone_number='4443332222', email='prcoleman2@gmail.com')

    self.link1 = Link.objects.create(name='yahoo', desc='search site', url='www.yahoo.com', poc=self.poc)
    self.link1.tags.add(Tag.objects.get(name='HotButton'))
    self.link2 = Link.objects.create(name='lifehacker', desc='fun site', url='www.lifehacker.com', poc=self.poc)
    self.link2.tags.add(Tag.objects.get(name='HotButton'))
 
  def test_get_existing_link(self):
    response = self.client.get('/links/', { 'url': 'www.yahoo.com' })
    self.assertEquals(200, response.status_code)

  def test_get_unknown_link(self):
    response = self.client.get('/links/', { 'url': 'www.google.com' })
    self.assertEquals(404, response.status_code)

  def test_post_link(self):
    numLinks = len(Link.objects.all())
    response = self.client.post('/links/', { 'name': 'newlink', 'desc': 'new description', 'url': 'www.theserverside.com', 'tags': 'HotButton, Informational', 'firstname': 'Harry', 'lastname': 'Barney', 'phone': '4443332222', 'email': 'no.one@nodomain.com'})
    self.assertEquals(200, response.status_code)
    self.assertEquals(numLinks+1, len(Link.objects.all()))
    resultingLink = Link.objects.filter(url='www.theserverside.com')
    self.assertEquals(len(resultingLink),  1)

class RegisterTest(TestCase):
 
  def testRegister(self):
    response = self.client.post('/create-user/', { 'username': 'joe', 'sid': 'joe','first_name': 'Joseph', 'last_name': 'Jenkins', 'phone_number': '3332221111', 'email': 'prcoleman2@gmail.com', 'password': '2password' })
    self.assertTrue(200, response.status_code)
    users_created = CoreUser.objects.filter(username='joe', email='prcoleman2@gmail.com')
    self.assertEquals(len(users_created), 1)


class LoginTest(TestCase):
  def setUp(self):
    self.user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222')
    self.user.set_password('2password')
    self.user.save()

  def test_login(self):
    self.client.post('/login/', {'username': 'testuser', 'password': '2password'})

    self.assertTrue(self.client.session.has_key('_auth_user_id'))

    # print '\nPassed the login test.'


class LogoutTest(TestCase):
  def setUp(self):
    self.user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222')
    self.user.set_password('2password')
    self.user.save()

    self.assertTrue(self.client.login(username='testuser', password='2password'))

  def test_logout(self):
    self.client.get('/logout/')

    self.assertFalse(self.client.session.has_key('_auth_user_id'))


class TrophyTest(TestCase):
  def   setUp(self):
    self.user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222')
    self.user.set_password('2password')
    self.user.save()

    # clear out the auto-generated trophy cases and notifications
    TrophyCase.objects.all().delete()
    Notification.objects.all().delete()
    mail.outbox = []

    self.assertTrue(self.client.login(username='testuser', password='2password'))
    self.assertTrue(self.client.login(username='testuser', password='2password'))

  def test_trophypage(self):
    response = self.client.get('/trophyroom/')

    self.assertEqual(response.status_code, 200)

    #print 'Passed the trophyroom url test.\n'

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
    self.assertEquals(trophy_case.trophy.name, 'Captain Blackbeard')
    self.assertEquals(trophy_case.date_earned, datetime.date.today())

    #print '\nPassed the e-mail test'
    #print '\nPassed the signal test.'

  def test_registration_trophy_earned(self):
    self.client.post('/create-user/', {'sid': 'something', 'username': 'bubba', 'first_name': 'Bubba', 'last_name': 'Smith',
      'password': '2password', 'email':'prcoleman2@gmail.com', 'phone_number':'(555)555-4444'})

    self.assertEquals(TrophyCase.objects.all().count(), 1)

    trophy_case = TrophyCase.objects.get(pk=1)

    self.assertEquals(trophy_case.user.username, 'bubba')
    self.assertEquals(trophy_case.trophy.name, 'Successful Registration')

    #print 'Passed the registration trophy test.'


class CsvTest(TestCase):
  def setUp(self):
    self.user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222')
    self.user.set_password('2password')
    self.user.save()

    self.assertTrue(self.client.login(username='testuser', password='2password'))

  def test_get_csv(self):
    response = self.client.get('/export-csv/')

    self.assertTrue(response.content, 'First,1,2,3\nSecond,4,5,6\nThird, 7,8,9')

    #print '\nPassed the get_csv test'
  
  
class KmzTest(TestCase):
  def setUp(self):
    self.user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222')
    self.user.set_password('2password')
    self.user.save()

    self.assertTrue(self.client.login(username='testuser', password='2password'))

  def test_get_kmz(self):
    response = self.client.get('/export-kmz/')

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
    
    #print 'Passed the get_kmz test.'


class PasswordTest(TestCase):
  def setUp(self):
    self.user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222')
    self.user.set_password('2password')
    self.user.save()

    self.assertTrue(self.client.login(username='testuser', password='2password'))

  def test_view_password(self):
    response = self.client.get('/update-password/')
    self.assertEquals(response.status_code, 200)
    
  def test_update_password(self):
    response = self.client.post('/update-password/', {'old' : '2password', 'password' : '3password'})
    self.assertRedirects(response, '/update-password/?saved=True')
    self.assertTrue(self.client.login(username='testuser', password='3password'))

  def test_wrong_current_password(self):
    response = self.client.post('/update-password/', {'old' : 'nothing', 'password' : 'anything5'})
    self.assertContains(response, 'Please try again.', count=1)

  def test_same_passwords(self):
    response = self.client.post('/update-password/', {'old' : '2password', 'password' : '2password'})
    self.assertContains(response, 'Please try again.', count=1)

class ProfileTest(TestCase):
  def setUp(self):
    self.user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222')
    self.user.set_password('2password')
    self.user.save()

    self.assertTrue(self.client.login(username='testuser', password='2password'))

  def test_profile_update(self):
    response = self.client.get('/user-profile/')
    self.assertEquals(response.status_code, 200)

    response = self.client.post('/update-user/', { 'sid' : 'anything', 'first_name' : 'Bill', 'last_name' : 'Somebody', 'phone_number': '9998887777', 'email': 'pcol@anywhere.com', 'skin': 'Default'})
    self.assertEquals(response.status_code, 302)
    self.assertRedirects(response, '/user-profile/?saved=True', status_code=302, target_status_code=200)

    response = self.client.get('/user-profile/?saved=True')
    self.assertContains(response, 'Your profile changes have been saved', count=1, status_code=200)

    user = CoreUser.objects.get(sid='anything')
    self.assertEquals(user.first_name, 'Bill')
    self.assertEquals(user.last_name, 'Somebody')
    self.assertEquals(user.email, 'pcol@anywhere.com')
    self.assertEquals(user.phone_number, '9998887777')
    # print 'Passed the UpdateProfile test.'


class SearchTest(TestCase):
  def setUp(self):
    self.user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222')
    self.user.set_password('2password')
    self.user.save()

    self.assertTrue(self.client.login(username='testuser', password='2password'))

    # create a POC
    self.poc = POC.objects.create(first_name='Bob', last_name='Dole', phone_number='1234567890', email='bob@dole.net')

    # create some Tags
    self.tag1 = Tag.objects.create(name='tag1', type='P')
    self.tag2 = Tag.objects.create(name='tag2', type='P')
    self.tag3 = Tag.objects.create(name='tag3', type='P')
    self.tag4 = Tag.objects.create(name='tag4', type='P')

    # create some Links
    self.link1 = Link.objects.create(name='link1', desc='this is link1 desc', url='http://www.link1.com', poc=self.poc)
    self.link1.tags.add(self.tag1, self.tag2)

    self.link2 = Link.objects.create(name='link2', desc='this is link2 desc', url='http://www.link2.com', poc=self.poc)
    self.link2.tags.add(self.tag1, self.tag3)

    self.link3 = Link.objects.create(name='link3', desc='this is link3 desc', url='http://www.link3.com', poc=self.poc)
    self.link3.tags.add(self.tag1, self.tag4)

    # create some LinkLibraries (don't need to worry about adding links, since we don't search libraries based on links)
    self.library1 = LinkLibrary.objects.create(name='sample1', desc='This is a description', creator=self.user)
    self.library1.tags.add(self.tag1, self.tag2)

    self.library2 = LinkLibrary.objects.create(name='sample2', desc='This LinkLibrary will rock your socks', creator=self.user)
    self.library2.tags.add(self.tag1, self.tag3)

  # tests for only searching Links
  def test_search_links_none(self):
    response = self.client.get('/search/links/?q=empty')
    self.assertEquals(response.status_code, 200)

    objs = [obj.object for obj in serializers.deserialize('json', response.content)]
    self.assertEquals(len(objs), 0)

  def test_name_search_links_single(self):
    response = self.client.get('/search/links/?q=link2')
    self.assertEquals(response.status_code, 200)

    objs = [obj.object for obj in serializers.deserialize('json', response.content)]
    self.assertEquals(len(objs), 1)
    self.assertIn(self.link2, objs)

  def test_name_search_links_multi(self):
    response = self.client.get('/search/links/?q=link')
    self.assertEquals(response.status_code, 200)
    
    objs = [obj.object for obj in serializers.deserialize('json', response.content)]
    self.assertEquals(len(objs), 3)
    self.assertIn(self.link1, objs)
    self.assertIn(self.link2, objs)
    self.assertIn(self.link3, objs)

  def test_desc_search_links_single(self):
    response = self.client.get('/search/links/?q=link1%20desc')
    self.assertEquals(response.status_code, 200)

    objs = [obj.object for obj in serializers.deserialize('json', response.content)]
    self.assertEquals(len(objs), 1)
    self.assertIn(self.link1, objs)

  def test_desc_search_links_multi(self):
    response = self.client.get('/search/links/?q=desc')
    self.assertEquals(response.status_code, 200)

    objs = [obj.object for obj in serializers.deserialize('json', response.content)]
    self.assertEquals(len(objs), 3)
    self.assertIn(self.link1, objs)
    self.assertIn(self.link2, objs)
    self.assertIn(self.link3, objs)

  def test_tag_search_links_single(self):
    response = self.client.get('/search/links/?q=tag4')
    self.assertEquals(response.status_code, 200)

    objs = [obj.object for obj in serializers.deserialize('json', response.content)]
    self.assertEquals(len(objs), 1)
    self.assertIn(self.link3, objs)

  def test_tag_search_links_multi(self):
    response = self.client.get('/search/links/?q=tag')
    self.assertEquals(response.status_code, 200)

    objs = [obj.object for obj in serializers.deserialize('json', response.content)]
    self.assertEquals(len(objs), 3)
    self.assertIn(self.link1, objs)
    self.assertIn(self.link2, objs)
    self.assertIn(self.link3, objs)

  # tests for only searching LinkLibraries
  def test_search_libraries_none(self):
    response = self.client.get('/search/libraries/?q=none')
    self.assertEquals(response.status_code, 200)

    objs = [obj.object for obj in serializers.deserialize('json', response.content)]
    self.assertEquals(len(objs), 0)

  def test_name_search_libraries_single(self):
    response = self.client.get('/search/libraries/?q=sample1')
    self.assertEquals(response.status_code, 200)

    objs = [obj.object for obj in serializers.deserialize('json', response.content)]
    self.assertEquals(len(objs), 1)
    self.assertIn(self.library1, objs)

  def test_name_search_libraries_multi(self):
    response = self.client.get('/search/libraries/?q=sample')
    self.assertEquals(response.status_code, 200)

    objs = [obj.object for obj in serializers.deserialize('json', response.content)]
    self.assertEquals(len(objs), 2)
    self.assertIn(self.library1, objs)
    self.assertIn(self.library2, objs)

  def test_desc_search_libraries_single(self):
    response = self.client.get('/search/libraries/?q=rock,socks')
    self.assertEquals(response.status_code, 200)

    objs = [obj.object for obj in serializers.deserialize('json', response.content)]
    self.assertEquals(len(objs), 1)
    self.assertIn(self.library2, objs)

  def test_desc_search_libraries_multi(self):
    response = self.client.get('/search/libraries/?q=this')
    self.assertEquals(response.status_code, 200)

    objs = [obj.object for obj in serializers.deserialize('json', response.content)]
    self.assertEquals(len(objs), 2)
    self.assertIn(self.library1, objs)
    self.assertIn(self.library2, objs)

  def test_tag_search_libraries_single(self):
    response = self.client.get('/search/libraries/?q=tag3')
    self.assertEquals(response.status_code, 200)

    objs = [obj.object for obj in serializers.deserialize('json', response.content)]
    self.assertEquals(len(objs), 1)
    self.assertIn(self.library2, objs)

  def test_tag_search_libraries_multi(self):
    response = self.client.get('/search/libraries/?q=tag1')
    self.assertEquals(response.status_code, 200)

    objs = [obj.object for obj in serializers.deserialize('json', response.content)]
    self.assertEquals(len(objs), 2)
    self.assertIn(self.library1, objs)
    self.assertIn(self.library2, objs)

  # tests for searching both Links and LinkLibraries
  def test_search_none(self):
    response = self.client.get('/search/?q=none')
    self.assertEquals(response.status_code, 200)

    objs = [obj.object for obj in serializers.deserialize('json', response.content)]
    self.assertEquals(len(objs), 0)

  def test_name_search(self):
    response = self.client.get('/search/?q=link1,sample')
    self.assertEquals(response.status_code, 200)

    objs = [obj.object for obj in serializers.deserialize('json', response.content)]
    self.assertEquals(len(objs), 3)
    self.assertIn(self.link1, objs)
    self.assertIn(self.library1, objs)
    self.assertIn(self.library2, objs)

  def test_desc_search(self):
    response = self.client.get('/search/?q=this')
    self.assertEquals(response.status_code, 200)

    objs = [obj.object for obj in serializers.deserialize('json', response.content)]
    self.assertEquals(len(objs), 5)
    self.assertIn(self.link1, objs)
    self.assertIn(self.link2, objs)
    self.assertIn(self.link3, objs)
    self.assertIn(self.library1, objs)
    self.assertIn(self.library2, objs)

  def test_tag_search(self):
    response = self.client.get('/search/?q=tag1')
    self.assertEquals(response.status_code, 200)

    objs = [obj.object for obj in serializers.deserialize('json', response.content)]
    self.assertEquals(len(objs), 5)
    self.assertIn(self.link1, objs)
    self.assertIn(self.link2, objs)
    self.assertIn(self.link3, objs)
    self.assertIn(self.library1, objs)
    self.assertIn(self.library2, objs)


class ShapefileTest(TestCase):
  def setUp(self):
    self.user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222')
    self.user.set_password('2password')
    self.user.save()

    self.assertTrue(self.client.login(username='testuser', password='2password'))

  def test_get_shapefile(self):
    response = self.client.get('/export-shp/')

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

    #print 'Passed the get_shapefile test.'
 

class FutureFeatureTest(TestCase):

  def test_getpage(self):
    response = self.client.get('/future-feature/')
    self.assertEquals(response.status_code, 200)
    self.assertTemplateUsed(response, 'future.html', msg_prefix='')
    self.assertContains(response, 'We\'re sorry', count=1, status_code=200, msg_prefix='')

    # print 'Passed the futurefeature test.'


class NotificationTest(TestCase):
  def setUp(self):
    self.user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222')
    self.user.set_password('2password')
    self.user.save()

    # delete the auto-generated notification resulting from saving a new user and add a know notification
    Notification.objects.all().delete()
    mail.outbox = [] # empty the outbox
    Notification.objects.create(user=self.user, type='TR', message='You won a new registration trophy')

    self.assertTrue(self.client.login(username='testuser', password='2password'))

  def test_get_notification(self):
    response = self.client.get('/notifications/')

    for obj in serializers.deserialize('json', response.content):
      # there's only 1 deserialized obj, in this case
      self.assertEquals(obj.object.message, 'You won a new registration trophy')
      self.assertEquals(obj.object.type, 'TR')
      self.assertEquals(obj.object.user, self.user)

    #print 'The GET method of notifications works well.'

  def test_delete_notification(self):
    self.client.delete('/notifications/1/') 

    self.assertEquals(Notification.objects.all().count(), 0)

    #print 'The DELETE method of notifications also works.'
    #print 'Poll notification test has passed.'

  def test_post_save_signal(self):
    self.assertEquals(len(mail.outbox), 1) 


class RateTest(TestCase):
  def setUp(self):
    # this could be in a fixture
    self.user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222')
    self.user.set_password('2password')
    self.user.save()

    self.poc = POC.objects.create(first_name='homer', last_name='simpson', phone_number='1234567890', email='homer@simpsons.com')

    self.link_tags = (Tag.objects.create(name='LinkTag1'), Tag.objects.create(name='LinkTag2'))
    self.link_library_tags = (Tag.objects.create(name='LinkLibraryTag1'), Tag.objects.create(name='LinkLibraryTag2'))

    self.link = Link.objects.create(name='Test Link', desc='Just a test', url='http://test.com', poc=self.poc)
    self.link.tags.add(self.link_tags[0])
    self.link.tags.add(self.link_tags[1])

    self.link_library = LinkLibrary.objects.create(name='Test LL', desc='Just a test', creator=self.user)
    self.link_library.tags.add(self.link_library_tags[0])
    self.link_library.tags.add(self.link_library_tags[1])
    self.link_library.links.add(self.link)

    self.assertTrue(self.client.login(username='testuser', password='2password'))

  def test_view_link_rating(self):
    rating_fk = RatingFK.objects.create(user=self.user, link=self.link)
    rating = Rating.objects.create(rating_fk=rating_fk, score=3, comment='could be better')

    response = self.client.get('/rate/link/1/')
    content = json.loads(response.content)

    self.assertEquals(response.status_code, 200)
    self.assertEquals(content['rating']['fields']['score'], 3)
    self.assertEquals(content['rating']['fields']['comment'], 'could be better')
    self.assertEquals(content['link']['pk'], self.link.pk)
    self.assertEquals(content['link']['fields']['url'], self.link.url)
    self.assertEquals(content['link_library'], None)

  def test_view_link_library_rating(self):
    rating_fk = RatingFK.objects.create(user=self.user, link_library=self.link_library)
    rating = Rating.objects.create(rating_fk=rating_fk, score=5, comment='mint chocolate chip!')

    response = self.client.get('/rate/library/1/')
    content = json.loads(response.content)

    self.assertEquals(response.status_code, 200)
    self.assertEquals(content['rating']['fields']['score'], 5)
    self.assertEquals(content['rating']['fields']['comment'], 'mint chocolate chip!')
    self.assertEquals(content['link'], None)
    self.assertEquals(content['link_library']['pk'], self.link_library.pk)
    self.assertEquals(content['link_library']['fields']['name'], self.link_library.name)

  def test_rating_link(self):
    response = self.client.post('/rate/link/1/', {'score': 1, 'comment': 'What is this? A link for ants?!'})

    self.assertEquals(response.status_code, 200)
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

  def test_rating_link_library(self):
    response = self.client.post('/rate/library/1/', {'score': 1, 'comment': 'What is this? A library for ants?!'})

    self.assertEquals(response.status_code, 200)
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


class SettingsTest(TestCase):
  def setUp(self): 
    self.user = CoreUser(sid='anything', username='testuser', first_name='Joe', last_name='Anybody', email='prcoleman2@gmail.com',
        phone_number='9221112222')
    self.user.set_password('2password')
    self.user.save()

    self.assertTrue(self.client.login(username='testuser', password='2password'))

  def test_settings_created(self):
    self.assertTrue(self.user.settings.wants_emails)
    self.assertEquals(self.user.settings.skin, Skin.objects.get(name='Default'))

  def test_view_settings(self):
    response = self.client.get('/settings/')
    self.assertEquals(response.status_code, 200)

  def test_modify_settings(self):
    skin = Skin.objects.create(name='Default2', file_path='/default.css')
    
    response = self.client.post('/settings/', {'skin': 'Default2'})
    self.assertRedirects(response, '/settings/?saved=True')

    settings = CoreUser.objects.get(username=self.user.username).settings
    self.assertFalse(settings.wants_emails)
    self.assertEquals(settings.skin, skin)

