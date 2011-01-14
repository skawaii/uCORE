import csv, datetime, os, time, urllib2, zipfile
import xml.dom.minidom
from cStringIO import StringIO

from django.core.mail import send_mail
from django.conf import settings
from django.contrib import auth
from django.core import serializers
from django.core.mail import send_mail
from django.core.urlresolvers import reverse
from django.db import IntegrityError
from django.db.models import Q
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.utils import simplejson as json

from coreo.ucore.models import CoreUser, Link, LinkLibrary, Notification, Rating, RatingFK, Skin, Tag, Trophy, TrophyCase
from coreo.ucore import utils, shapefile


def earn_trophy(request):
  if request.method == 'POST':
    user2 = request.POST['user'].strip()
    trophy2 = request.POST['trophy'].strip()
    trophyc = Trophy.objects.get(pk=trophy2)
    userc = CoreUser.objects.get(username=user2)
    tc = TrophyCase(user=userc, trophy=trophyc, date_earned=datetime.datetime.now())
    tc.save()
    custom_msg = "You have won a trophy, %s.  Congratulations" % userc.first_name
    user_email = userc.email
    send_mail(custom_msg, 'Testing e-mails', 'trophy@layeredintel.com', [user_email], fail_silently=False)


def ge_index(request):
  # This is a quick hack at getting our Google Earth app integrated with Django.
  if not request.user.is_authenticated():
    return render_to_response('login.html', context_instance=RequestContext(request))

  try:
    user = CoreUser.objects.get(username=request.user.username)
  except CoreUser.DoesNotExist:
    # as long as the login_user view forces them to register if they don't already 
    # exist in the db, then we should never actually get here. Still, better safe
    # than sorry.
    return render_to_response('login.html', context_instance=RequestContext(request))
  
  return render_to_response('geindex.html', {'user': user}, context_instance=RequestContext(request))

def get_csv(request):

  response = HttpResponse(mimetype='text/csv')
  response['Content-Disposition'] = 'attachment; filename=sample.csv'
  # This will eventually handle a json object rather than static data.
  # jsonObj = request.POST['gejson'].strip()
  #  if not (jsonObj)
  # jsonObj = '{["latitude":1.0, "longitude":2.0]}'
  # jsonObj = '["baz":"booz", "tic":"tock"]'
  # obj = json.loads(jsonObj)
  csv_data = (
      ('First', '1', '2', '3'),
      ('Second', '4', '5', '6'),
      ('Third', '7', '8', '9')
  )
  
  writer = csv.writer(response)
  writer.writerow(['First', '1', '2', '3'])
  writer.writerow(['Second', '4', '5', '6'])
  writer.writerow(['Third', '7', '8', '9'])
  return response


def get_kmz(request):
  # I must say I used some of : http://djangosnippets.org/snippets/709/
  # for this part. - PRC
  # I know this will be replaced once I have a sample JSON from the client
  # passed in.  For now I am just using sample data provided by Google.
  fileObj = StringIO()
  fileObj.write("<?xml version='1.0' encoding='UTF-8'?>\n")
  fileObj.write("<kml xmlns='http://www.opengis.net/kml/2.2'>\n")
  fileObj.write("<Placemark>\n")
  fileObj.write("<name>Simple placemark</name>\n")
  fileObj.write("<description>Attached to the ground. Intelligently places itself at the height of the underlying terrain.</description>\n")
  fileObj.write("<Point>\n")
  fileObj.write("<coordinates>-122.0822035425683,37.42228990140251,0</coordinates>\n")
  fileObj.write("</Point>\n")
  fileObj.write("</Placemark>\n")
  fileObj.write("</kml>\n")

  kmz = StringIO()
  f = zipfile.ZipFile(kmz, 'w', zipfile.ZIP_DEFLATED)
  f.writestr("doc.kml", fileObj.getvalue())
  f.close()
  response = HttpResponse(mimetype='application/zip')
  response.content = kmz.getvalue()
  kmz.close()
  response['Content-Type'] = 'application/vnd.google-earth.kmz'
  response['Content-Disposition'] = 'attachment; filename=download.kmz'
  response['Content-Description'] = 'a sample kmz file.'
  response['Content-Length'] = str(len(response.content))
  return response


def get_library(request, username, lib_name):
  library = LinkLibrary.objects.get(user__username=username, name=lib_name)

  doc = utils.build_kml_from_library(library)
  file_path = 'media/kml/' + username + '-' + lib_name + '.kml'
  #xml.dom.ext.PrettyPrint(doc, open(file_path, "w"))

  with open(file_path, 'w') as f:
    f.write(doc.toprettyxml(indent='  ', encoding='UTF-8'))

  uri = settings.SITE_ROOT + 'site_media/kml/' + username + '-' + lib_name + '.kml'

  return HttpResponse(uri)


def get_shapefile(request):
  w = shapefile.Writer(shapefile.POLYLINE)
  w.line(parts=[[[1,5],[5,5],[5,1],[3,1],[1,1]]])
  w.poly(parts=[[[1,5],[3,1]]], shapeType=shapefile.POLYLINE)
  w.field('FIRST_FLD', 'C', '40')
  w.field('SECOND_FLD', 'C', '40')
  w.record('First', 'Polygon')
  w.save('sample')
  shp = StringIO()
  f = zipfile.ZipFile(shp, 'w', zipfile.ZIP_DEFLATED)
  f.write('sample.shx')
  f.write('sample.dbf')
  f.write('sample.shp')
  f.close()
  response = HttpResponse(mimetype='application/zip')
  response['Content-Disposition'] = 'attachment; filename=sample1.shp'
  response.content = shp.getvalue()
  shp.close()
  return response

 
def index(request):
  # If the user is authenticated, send them to the application.
  if request.user.is_authenticated():
    return HttpResponseRedirect(reverse('coreo.ucore.views.ge_index'))
  # If the user is not authenticated, show them the main page.
  return render_to_response('index.html', context_instance=RequestContext(request))


def login(request):
  if request.method == 'GET':
    return render_to_response('login.html', context_instance=RequestContext(request))
  else:
    # authenticate the user viw username/password
    username = request.POST['username'].strip()
    password = request.POST['password'].strip()

    # check if the user already exists
    if not CoreUser.objects.filter(username__exact=username).exists():
      return render_to_response('register.html', context_instance=RequestContext(request))

    user = auth.authenticate(username=username, password=password)

    # The user has been succesfully authenticated. Send them to the GE app.
    if user:
      auth.login(request, user)
      return HttpResponseRedirect(reverse('coreo.ucore.views.ge_index'))

    return render_to_response('login.html',
          {'error_message': 'Invalid Username/Password Combination'},
           context_instance=RequestContext(request))


def logout(request):
  ''' Log the user out, terminating the session
  '''
  if request.user.is_authenticated():
    auth.logout(request)

  return HttpResponseRedirect(reverse('coreo.ucore.views.index'))


def poll_notifications(request): 
  if not request.user.is_authenticated():
    return render_to_response('login.html', context_instance=RequestContext(request))

  userperson = CoreUser.objects.filter(username=request.user)
  response = HttpResponse(mimetype='application/json')
  if request.method == "GET":
    print 'request user is %s' % request.user
    try:
      json_serializer = serializers.get_serializer("json")()
      notify_list = Notification.objects.filter(user=userperson)
      json_serializer.serialize(notify_list, ensure_ascii=False, stream=response)
    except Exception, e:
      print e.message 
    return response
  elif request.method == "POST":
    primaryKey = request.POST['id'].strip()
    record2delete = Notification.objects.filter(user=userperson, pk=primaryKey)
    record2delete.delete()
    return response


def notifytest(request):
  if not request.user.is_authenticated():
    return render_to_response('login.html', context_instance=RequestContext(request))

  # userperson = CoreUser.objects.filter(username=request.user)
  return render_to_response('notify.html', context_instance=RequestContext(request))


def rate(request, ratee, ratee_id):
  ''' Rate either a ``Link`` or ``LinkLibrary``.
      ``ratee`` must either be 'link' or 'library', with ``ratee_id`` being the respective id.
      The value of ``ratee`` is ensured in urls.py.
  '''
  if not request.user.is_authenticated():
    return render_to_response('login.html', context_instance=RequestContext(request))

  try:
    user = CoreUser.objects.get(username=request.user.username)
    link = None
    link_library = None

    if ratee == 'link': link = Link.objects.get(id=ratee_id)
    elif ratee == 'library': link_library = LinkLibrary.objects.get(id=ratee_id)
  except (CoreUser.DoesNotExist, Link.DoesNotExist, LinkLibrary.DoesNotExist) as e:
    return HttpResponse(e.message)

  # check to see if a RatingFK already exists for this (CoreUser, (Link|LinkLibrary)) combo. If the combo already exists:
  #   1. and this is a GET, pass the Rating to the template to be rendered so the user can update the Rating
  #   2. and this is a POST, update the Rating
  rating_fk = RatingFK.objects.filter(user=user, link=link, link_library=link_library) # guaranteed at most 1 result b/c of DB unique_together

  if rating_fk:
    rating = Rating.objects.filter(rating_fk=rating_fk[0]) #again, guarantted at most 1 result

    if not rating: raise IntegrityError('A RatingFK %s exists, but is not associated with a Rating' % rating_fk[0])

  if request.method == 'GET':
    if rating_fk: context = {'rating': rating[0], 'link': link, 'link_library': link_library}
    else: context = {'link': link, 'link_library': link_library}

    return render_to_response('rate.html', context, context_instance=RequestContext(request))
  else:
    if rating_fk:
      rating[0].score, rating[0].comment = (request.POST['score'], request.POST['comment'].strip())
      rating[0].save()
    else:
      if ratee == 'link': rating_fk = RatingFK.objects.create(user=user, link=link)
      elif ratee == 'library': rating_fk = RatingFK.objects.create(user=user, link_library=link_library)

      Rating.objects.create(rating_fk=rating_fk, score=request.POST['score'], comment=request.POST['comment'].strip())

    # XXX is there a better way to redirect (which is recommended after a POST) to a "success" msg?
    #return HttpResponseRedirect(reverse('coreo.ucore.views.success', kwargs={'message': 'Rating successfully saved.'}))
    return HttpResponseRedirect(reverse('coreo.ucore.views.success'))


def register(request, sid):
  ''' Pull out the user's sid, name, email, and phone number from the user's certs.
      Return a pre-filled registration form with this info so the user can create an account.
  '''
  # get the sid and name from the cert
  #name_sid = os.getenv('SSL_CLIENT_S_DN_CN', '').split(' ')
  #name = ' '.join(name_sid[:-1])
  #sid = name_sid[-1]

  # XXX in the future we'll be returning more info (sid, name, email, phone number).
  # The user will basically just need to verify the info and put in some basic additional
  # info (main areas of interest, skin, etc).
  return render_to_response('register.html', {'sid': sid}, context_instance=RequestContext(request))


def save_user(request):
  ''' Create/update the user's record in the DB.
  '''
  sid = request.POST['sid'].strip()
  username = request.POST['username'].strip()
  first_name = request.POST['first_name'].strip()
  last_name = request.POST['last_name'].strip()
  password = request.POST['password'].strip()
  email = request.POST['email'].strip()
  phone_number = request.POST['phone_number'].strip()

  if not (sid and username and first_name and last_name and password and email and phone_number):
    # redisplay the registration page
    return render_to_response('register.html',
        {'sid': sid,
         'error_message': 'Please fill in all required fields.'
        }, context_instance=RequestContext(request))

  # XXX currently User.phone_number is stored as an int
  #   1. keep as an int
  #   2. change from an int to a CharField
  # either way, we should use regex to check before we put it into the DB

  # save the new user to the DB with the default skin
  default_skin = Skin.objects.get(name='Default')
  user = CoreUser(sid=sid, username=username, first_name=first_name, last_name=last_name,
      email=email, phone_number=phone_number, skin=default_skin)
  user.set_password(password)
  user.save()

  TrophyCase.objects.create(user=user, trophy=Trophy.objects.get(name__contains='Registration'), date_earned=datetime.datetime.now())
  Notification.objects.create(user=user, type='TR', message='You have won a registration trophy.')
  # return an HttpResponseRedirect so that the data can't be POST'd twice if the user
  # hits the back button
  return HttpResponseRedirect(reverse( 'coreo.ucore.views.login'))


def search_links(request):
  terms = request.GET['q'].split(' ')
  links = list(Link.objects.filter(tags__name__in=terms).distinct())
  links += list(Link.objects.filter(reduce(lambda x, y: x | y, map(lambda z: Q(desc__icontains=z), terms))).distinct())
  links += list(Link.objects.filter(reduce(lambda x, y: x | y, map(lambda z: Q(name__icontains=z), terms))).distinct())

  return HttpResponse(serializers.serialize('json', links))


def search_mongo(request):
  url = 'http://174.129.206.221/hello//?' + request.GET['q']
  result = urllib2.urlopen(url)

  return HttpResponse('\n'.join(result.readlines()))


def success(request, message=''):
  return HttpResponse('you did it!')


def trophy_room(request):
  if not request.user.is_authenticated():
    return render_to_response('login.html', context_instance=RequestContext(request))

  try: 
    user = CoreUser.objects.get(username=request.user.username)
    trophy_list = Trophy.objects.all()
    trophy_case_list = TrophyCase.objects.all() 
  except CoreUser.DoesNotExist: 
    # as long as the login_user view forces them to register if they don't already 
    # exist in the db, then we should never actually get here. Still, better safe
    # than sorry.
    return render_to_response('login.html', context_instance=RequestContext(request))
    
  return render_to_response('trophyroom.html',
      {'trophy_list' : trophy_list ,
       'trophy_case_list' : trophy_case_list,
       'user' : user.username
      }, context_instance=RequestContext(request))


def upload_csv(request):
  if request.method == 'POST':
    utils.insert_links_from_csv(request.FILES['file'])
      
  return render_to_response('upload_csv.html', context_instance=RequestContext(request))


def user_profile(request):
  # XXX the django dev server can't use ssl, so fake getting the sid from the cert
  # XXX pull out the name as well. pass it to register() and keep things DRY
  # sid = os.getenv('SSL_CLIENT_S_DN_CN', '').split(' ')[-1]
  #sid = 'jlcoope'
  #if not sid: return render_to_response('install_certs.html')

  if not request.user.is_authenticated():
    return render_to_response('login.html', context_instance=RequestContext(request))

  try:
    user = CoreUser.objects.get(username=request.user.username)
  except CoreUser.DoesNotExist:
    # as long as the login_user view forces them to register if they don't already 
    # exist in the db, then we should never actually get here. Still, better safe
    # than sorry.
    return render_to_response('login.html', context_instance=RequestContext(request))
  
  return render_to_response('userprofile.html', {'user': user}, context_instance=RequestContext(request))

