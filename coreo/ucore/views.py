#import os
import urllib2
#import xml.dom.ext
import xml.dom.minidom
from django.conf import settings
from django.contrib import auth
from django.core import serializers
from django.core.urlresolvers import reverse
from django.db.models import Q
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext

from coreo.ucore.models import CoreUser, Link, LinkLibrary, Rating, Skin, Tag
from coreo.ucore import utils


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

 
def index(request):
	# If the user is authenticated, send them to the application.
	if request.user.is_authenticated():
		return HttpResponseRedirect(reverse('coreo.ucore.views.ge_index'))

	# If the user is not authenticated, show them the main page.
	return render_to_response('index.html', context_instance=RequestContext(request))


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

  # return an HttpResponseRedirect so that the data can't be POST'd twice if the user
  # hits the back button
  return HttpResponseRedirect(reverse('coreo.ucore.views.login'))


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


def upload_csv(request):
  if request.method == 'POST':
    utils.insert_links_from_csv(request.FILES['file'])
      
  return render_to_response('upload_csv.html', context_instance=RequestContext(request))


def get_library(request, username, lib_name):
  library = LinkLibrary.objects.get(user__username=username, name=lib_name)

  doc = utils.build_kml_from_library(library)
  file_path = 'media/kml/' + username + '-' + lib_name + '.kml'
  #xml.dom.ext.PrettyPrint(doc, open(file_path, "w"))

  with open(file_path, 'w') as f:
    f.write(doc.toprettyxml(indent='  ', encoding='UTF-8'))

  uri = settings.SITE_ROOT + 'site_media/kml/' + username + '-' + lib_name + '.kml'

  return HttpResponse(uri)


def rate_link(request, link_id):
  # XXX assuming we can get PKI certs working with WebFaction, we could pull the sid out here
  if not request.user.is_authenticated():
    return render_to_response('login.html', context_instance=RequestContext(request))

  try:
    link = Link.objects.get(id=link_id)
    user = CoreUser.objects.get(username=request.user.username)
  except (Link.DoesNotExist, CoreUser.DoesNotExist) as e:
    #return HttpResponse('Link with id %s does not exist' % link_id)
    return HttpResponse(e.message)

  # check to see if a Rating already exists for this (CoreUser, Link) combo. If the combo already exists:
  #   1. and this is a GET, pass the Rating to the template to be rendered so the user can update the Rating
  #   2. and this is a POST, update the Rating
  rating = Rating.objects.filter(user=user, link=link) # guaranteed at most 1 result b/c of DB unique_together

  if request.method == 'GET':
    if rating: context = {'rating': rating[0], 'link': link}
    else: context = {'link': link}

    return render_to_response('rate.html', context, context_instance=RequestContext(request))
  else:
    if rating:
      (rating[0].score, rating[0].comment) = (request.POST['score'], request.POST['comment'].strip())
      rating[0].save()
    else:
      Rating.objects.create(user=user, link=link, score=request.POST['score'], comment=request.POST['comment'].strip())

  # XXX is there a better way to redirect (which is recommended after a POST) to a "success" msg?
  #return HttpResponseRedirect(reverse('coreo.ucore.views.success', kwargs={'message': 'Rating successfully saved.'}))
  return HttpResponseRedirect(reverse('coreo.ucore.views.success'))


def rate_library(request, library_id):

  return HttpResponseRedirect(reverse('coreo.ucore.views.success'))


def success(request, message=''):
  return HttpResponse('you did it!')

