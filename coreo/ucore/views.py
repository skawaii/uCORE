#import os
import csv
from django.core.urlresolvers import reverse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.contrib import auth
from django.core import serializers

from coreo.ucore.models import CoreUser, Link, Skin, Tag


def index(request):
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
  
  return render_to_response('index.html', {'user': user}, context_instance=RequestContext(request))


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
  # XXX make sure the pw is saved still
  #user = CoreUser(sid=sid, username=username, first_name=first_name, last_name=last_name, email=email, phone_number=phone_number, skin=default_skin)
  user = CoreUser(sid=sid, username=username, first_name=first_name, last_name=last_name,
      email=email, phone_number=phone_number, skin=default_skin)
  user.set_password(password)
  user.save()

  # return an HttpResponseRedirect so that the data can't be POST'd twice if the user
  # hits the back button
  return HttpResponseRedirect(reverse('coreo.ucore.views.index'))


def login(request):
  return render_to_response('login.html', context_instance=RequestContext(request))


def login_user(request):
  ''' Authenticate a user via Username/Password
  '''
  username = request.POST['username'].strip()
  password = request.POST['password'].strip()

  # check if the user already exists
  if not CoreUser.objects.filter(username__exact=username).exists():
    return render_to_response('register.html', context_instance=RequestContext(request))

  user = auth.authenticate(username=username, password=password)

  if user:
    auth.login(request, user)
    return HttpResponseRedirect(reverse('coreo.ucore.views.index'))

  return render_to_response('login.html',
        { 'error_message': 'Invalid Username/Password Combination'
        }, context_instance=RequestContext(request))


def logout_user(request):
  '''Log the user out, terminating the session
  '''
  if request.user.is_authenticated():
    auth.logout(request)

  return HttpResponseRedirect(reverse('coreo.ucore.views.index'))


def search_links(request, keywords):
  # tags will be in the form 'tag/tag/tag/...'
  tags = keywords.split('/')
  links = Link.objects.filter(tags__name__in=tags).distinct()

  # XXX format the links into a dict and render to a template (doesn't exist yet)
  return HttpResponse(serializers.serialize('json', links)) # for testing -- view source in browser to see what links are there


def upload_csv(request):
  if request.method == 'POST':
    insertLinksFromCSV(request.FILES['file'])
      
  return render_to_response('upload_csv.html', context_instance=RequestContext(request))

def insertLinksFromCSV(linkfile):
  linkFile = csv.reader(linkfile)
  headers = linkFile.next()
  for row in linkFile:
    fields = zip(headers, row)
    link = {}
    for(field, value) in fields:
      link[field] = value.strip()

    link['tags']=link['tags'].strip('"')
    dblink = Link(name=link['name'], url=link['url'])
    dblink.save()

    for tag in link['tags'].split(','):
      tag = tag.strip()
      try:
        storedTag=Tag.objects.get(name__exact=tag)
      except Tag.DoesNotExist:
        storedTag=Tag(name=tag)
      storedTag.save()
      dblink.tags.add(storedTag)

    dblink.save()
