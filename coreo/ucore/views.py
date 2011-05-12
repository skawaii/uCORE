"""
  Views provide the views (or the controllers in a MVC applications)
  for the Django project.  This file was created and maintained by:
  Jason Cooper, Jason Hotelling, Paul Coleman, and Paul Boone.
"""
import csv, datetime, json, logging, os, re, time, urllib2, zipfile, pickle
from cStringIO import StringIO
from httplib import HTTPResponse, HTTPConnection
from urlparse import urlparse
from django.http import Http404
import xml.dom.expatbuilder
from xml.dom.minidom import parse, parseString
from xml.parsers import expat
from xml.parsers.expat import ExpatError
from django.core.mail import send_mail
from django.conf import settings
from django.contrib import auth
from django.contrib.auth.decorators import login_required
from django.core import serializers
from django.core.mail import send_mail
from django.core.urlresolvers import reverse
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseBadRequest, HttpResponseNotAllowed, HttpResponseServerError, HttpResponseNotFound
from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from django.views.decorators.http import require_http_methods
from coreo.ucore import shapefile, utils
from coreo.ucore.kmlparser import KmlParser
from coreo.ucore.models import *



@require_http_methods(['POST'])
@login_required
def add_library(request):
  """
  Add ``LinkLibrary``s to the user's ``LinkLibrary`` collection (i.e. the ``CoreUser.libraries`` field).
  This view accepts only POST requests. The request's ``library_id`` parameter should contain the
  ``LinkLibrary`` IDs to be added to the user's collection.
  """
  user = CoreUser.objects.get(username=request.user.username)
  library_ids = request.POST.getlist('library_id')
  # library_ids = request.POST['library_id'].strip(',')
  try:
    for library_id in library_ids:
      user.libraries.add(LinkLibrary.objects.get(pk=library_id))
  except LinkLibrary.DoesNotExist as e:
    return HttpResponse(e.message)

  return HttpResponseRedirect(reverse('coreo.ucore.views.success'))



@require_http_methods(['GET'])
def check_username(request):
  username = request.GET['username'].strip()
  return HttpResponse(json.dumps(CoreUser.objects.filter(username=username).exists()))

@require_http_methods(['POST', 'GET'])
@login_required
def create_library(request):
  """
  This view when called will create a link library. It won't work properly unless you are
  already logged in to the webapp in a legitimate way.

  Parameters:
    ``links`` - a comma-delimited list of the primary keys of the links you want
                to add to the created link library. They are passed in from
                request object via POST.
    ``name`` -  the name you wish to call the created link library.  Passed in
                from the request object via POST.
    ``desc`` -  The description you want to use for the link library.
    ``tags`` -  Another comma-delimited list of the names of the tags you want
                to associate with the link library you are creating. If the tags
                are not found within the Tag table, they will be created.

  Returns:
    This view should return the same page that called it, which is testgrid.
    We may need to modify this when it is more smoothly integrated into our
    existing webapp.
  """
  user = CoreUser.objects.get(username=request.user)
  if not user:
    logging.error('No user retrieved by the username of %s' % request.user)
    return HttpResponseBadRequest('No user identified in request.')

  if request.method == 'POST':
    links = ''
    if 'links' in request.POST:
      links = request.POST['links'].strip()
    if 'name' not in request.POST:
      return HttpResponseBadRequest('name is a required parameter')
    name = request.POST['name'].strip()
    desc = ''
    if 'desc' in request.POST:
      desc = request.POST['desc'].strip()
    tags = ''
    if 'tags' in request.POST:
      tags = request.POST['tags'].strip()
    # if tags[-1] == ',':
    #  length_of_tags = len(tags)
    #  tags = tags[0:length_of_tags-1]
    linkArray = links.split(',')
    tags = tags.split(',')
    library = LinkLibrary(name=name, desc=desc, creator=user)
    library.save()

    for t in tags:
      t = t.strip()
      if len(t) > 0:
        retrievedtag = Tag.objects.get_or_create(name=t)
        library.tags.add(retrievedtag[0])

    for link_object in linkArray:
      link_object = link_object.strip()
      if link_object.isdigit():
        link = Link.objects.get(pk=int(link_object))
        library.links.add(link)
  
    library.save()

    user.libraries.add(library)

    if utils.accepts_json(request):
      jsonContent = utils.get_linklibrary_json(library)
      return HttpResponse(content=jsonContent, content_type=utils.JSON_CONTENT_TYPE)

    return HttpResponse(str(library.pk))
  else:
    allLinks = Link.objects.all()
    allTags = Tag.objects.all()
    return render_to_response('createlib.html', { 'allLinks' : allLinks, 'allTags': allTags }, context_instance=RequestContext(request))



@require_http_methods(['POST'])
@login_required
def update_library(request):
  user = CoreUser.objects.get(username=request.user)
  if 'id' not in request.POST:
    raise HttpResponseBadRequest('id is a required parameter')
  else:
    id = request.POST['id'].strip()
    library = LinkLibrary.objects.get(pk=id)
    if not library:
      raise Http404
    links = ''
    if 'links' in request.POST:
      links = request.POST['links'].strip()
      linkArray = links.split(',')
      library.links.clear()
      for link_object in linkArray:
        link_object = link_object.strip()
        if link_object.isdigit():
          link = Link.objects.get(pk=int(link_object))
          library.links.add(link)
    if 'name' not in request.POST:
      return HttpResponseBadRequest('name is a required parameter')
    name = request.POST['name'].strip()
    library.name = name
    if 'desc' in request.POST:
      desc = request.POST['desc'].strip()
      library.desc = desc
    tags = ''
    if 'tags' in request.POST:
      tags = request.POST['tags'].strip()
      tags = tags.split(',')
      library.tags.clear()
      for t in tags:
        t = t.strip()
        if len(t) > 0:
          retrievedtag = Tag.objects.get_or_create(name=t)
          library.tags.add(retrievedtag[0])
    # if tags[-1] == ',':
    #  length_of_tags = len(tags)
    #  tags = tags[0:length_of_tags-1]
  
    library.save()
    
    # The below line shouldn't be needed because the library should
    # stay in the profile of the user even if it was updated.

    #  user.libraries.add(library)
    if utils.accepts_json(request):
      jsonContent = utils.get_linklibrary_json(library)
      return HttpResponse(content=jsonContent, content_type=utils.JSON_CONTENT_TYPE)
    return HttpResponse(str(library.pk))


@require_http_methods(["GET"])
@login_required
def get_libraries(request):
  try:
    user = CoreUser.objects.get(username=request.user)
    results = user.libraries.all()
  except CoreUser.DoesNotExist:
    return render_to_response('login.html', context_instance=RequestContext(request))
  return HttpResponse(serializers.serialize('json', results, use_natural_keys=True))
  # return HttpResponse(serializers.serialize('json', results, indent=4, relations=('links',)))


@require_http_methods(["GET", "POST"])
def links(request):
  if request.method == 'GET':
    if 'url' in request.GET:
      url = request.GET['url'].strip()
      retrievedLink = Link.objects.filter(url__icontains=url)
      if len(retrievedLink) > 0:
        return HttpResponse(serializers.serialize('json', retrievedLink, indent=4, relations=('poc','tags',)))
      else:
        raise Http404 
    total_links = Link.objects.all()  
    return HttpResponse(serializers.serialize('json', total_links, indent=4, relations=('poc','tags',)))
  # For the POST stuff the rest of the code is written.
  else:
    linkname = request.POST['name'].strip()
    linkdesc = request.POST['desc'].strip()
    url = request.POST['url'].strip()
    # The below variable will be an array of all tags that came in
    # as comma-delimited.
    tags = request.POST['tags'].strip().split(',')
    firstname = request.POST['firstname'].strip()
    lastname = request.POST['lastname'].strip()
    phone = request.POST['phone'].strip()
    email = request.POST['email'].strip()
    # Create the POC with the info
    # provided if he/she is not there already.
    # add first_name, and last_name to get_or_create
    poc = POC.objects.get_or_create(email=email, phone_number=phone)
    poc[0].first_name = firstname
    poc[0].last_name = lastname
    poc[0].save()
    # The below code will update or create depending on if the 
    # link already exists (determined by url which must be unique).
    link = Link.objects.create(url=url, name=linkname, desc=linkdesc, poc=poc[0])
    # Iterate through the tags and create a tag if it isn't already
    # in the tag table.
    for t in tags:
      tag = Tag.objects.get_or_create(name=t)
      link.tags.add(tag[0])
    # Finally save the link
    link.save()
    # Then return the primary key of the create link in the response
    #  return HttpResponse(link[0].pk)
    # return HttpResponse(serializers.serialize('json', link, indent=2, relations=('poc','tags',)))
    return HttpResponse(serializers.serialize('json', Link.objects.filter(url=url), indent=4, relations=('poc', 'tags',)))

   

@require_http_methods(["POST"])
@login_required
def delete_link(request):
  link = request.POST['id'].strip()
  link2delete = Link.objects.get(pk=link)
  Link.objects.remove(link2delete)
  return HttpResponse("Link removed")


@require_http_methods(["POST"])
@login_required
def delete_libraries(request):
  
  # library_ids = request.POST["ids"].strip()
  # libraryList = library_ids.split(',')
  libraryList = request.POST.getlist('library_id')
  try:
    user = CoreUser.objects.get(username=request.user)
    for i in libraryList:
      link2rid = LinkLibrary.objects.get(pk=i)
      user.libraries.remove(link2rid)
      user.save()
  except CoreUser.DoesNotExist:
    return render_to_response('login.html', context_instance=RequestContext(request))
  # maybe add a check to make sure that the logged in user is only
  # deleting his/her libraries.
  return HttpResponse("Purged of that LinkLibrary.")

@require_http_methods(['GET'])
def future_feature(request):
  return render_to_response('future.html', context_instance=RequestContext(request))



@require_http_methods(['POST'])
def create_user(request):
  """
  Create the user's record in the DB.
  """
  sid = request.POST['sid'].strip()
  username = request.POST['username'].strip()
  first_name = request.POST['first_name'].strip()
  last_name = request.POST['last_name'].strip()
  password = request.POST['password'].strip()
  email = request.POST['email'].strip()
  phone_number = request.POST['phone_number'].strip()

  try:
    if (len(phone_number) != 10):
      prog = re.compile(r"\((\d{3})\)(\d{3})-(\d{4})")
      result = prog.match(phone_number)
      phone_number = result.group(1) + result.group(2) + result.group(3)
  except Exception, e:
    logging.error('Exception parsing phone number: %s' % e.message)

  if not (sid and username and first_name and last_name and password and email and phone_number):
    # redisplay the registration page
    return render_to_response('register.html',
        {'sid': sid,
         'error_message': 'Please fill in all required fields.'
        }, context_instance=RequestContext(request))

  # create the user in the DB
  try:
    user = CoreUser.objects.create(sid=sid, username=username, first_name=first_name, last_name=last_name, email=email, phone_number=phone_number)
  except IntegrityError as e:
    print e
    return render_to_response('register.html',
        {'sid': sid,
         'error_message': 'The username/sid %s is not available. Please try again' % username
        }, context_instance=RequestContext(request))

  user.set_password(password)
  user.save()

  # return an HttpResponseRedirect so that the data can't be POST'd twice if the user hits the back button
  return HttpResponseRedirect(reverse('coreo.ucore.views.login'))


@require_http_methods(['GET'])
@login_required
def ge_index(request):
  # This is a quick hack at getting our Google Earth app integrated with Django.
  try:
    user = CoreUser.objects.get(username=request.user.username)
  except CoreUser.DoesNotExist:
    # as long as the login_user view forces them to register if they don't already
    # exist in the db, then we should never actually get here. Still, better safe than sorry.
    return render_to_response('login.html', context_instance=RequestContext(request))

  return render_to_response('map.html', {'user': user}, context_instance=RequestContext(request)) 


@require_http_methods(['GET'])
@login_required
def gm_index(request):
  # This is a quick hack at getting our Google Maps app integrated with Django.
  try:
    user = CoreUser.objects.get(username=request.user.username)
  except CoreUser.DoesNotExist:
    # as long as the login_user view forces them to register if they don't already
    # exist in the db, then we should never actually get here. Still, better safe than sorry.
    return render_to_response('login.html', context_instance=RequestContext(request))

  return render_to_response('gmindex.html', {'user': user}, context_instance=RequestContext(request))


# XXX should only accept a POST once fully implemented
@require_http_methods(['GET', 'POST'])
@login_required
def get_csv(request):
  """
  The purpose of this view is to return a csv file that represents the
  data on a GE view.  As of now, we don't have anything on the client
  side to work with this view.

  Parameters:
    Currently no parameters are passed in, but soon we hope to have JSON
    passed in from the client that represents the data from a GE view.

  Returns:
    This should return an attachment of type text/csv that will be csv
    from the view.  Right now it returns static data.
  """
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


# XXX should only accept a POST once fully implemented
@require_http_methods(['GET', 'POST'])
@login_required
def get_kmz(request):
  """ 
  Return a KMZ file that represents the data from a GE view in our webapp.

  Parameters:
    No parameters have yet been accepted, but eventually the client will
    be submitting a JSON object that represents the data from the GE view
    that we wish to convert to KMZ.

  Returns:
    This view will return a file attachment that is KMZ to the client.
    Right now we return static data. when the user requests /get-kmz/.
  """
  # I must say I used some of : http://djangosnippets.org/snippets/709/
  # for this part. - PRC
  # I know this will be replaced once I have a sample JSON from the client
  # passed in.  For now I am just using sample data provided by Google.
  fileObj = StringIO()
  fileObj.write('<?xml version="1.0" encoding="UTF-8"?>\n')
  fileObj.write('<kml xmlns="http://www.opengis.net/kml/2.2">\n')
  fileObj.write('<Placemark>\n')
  fileObj.write('<name>Simple placemark</name>\n')
  fileObj.write('<description>Attached to the ground. Intelligently places itself at the height of the underlying terrain.</description>\n')
  fileObj.write('<Point>\n')
  fileObj.write('<coordinates>-122.0822035425683,37.42228990140251,0</coordinates>\n')
  fileObj.write('</Point>\n')
  fileObj.write('</Placemark>\n')
  fileObj.write('</kml>\n')

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

@require_http_methods('GET')
@login_required
def get_library_by_id(request, libraryId):
  library = None
  try:
    library = LinkLibrary.objects.get(id=libraryId)
  except LinkLibrary.DoesNotExist, LinkLibrary.MultipleObjectsReturned:
    raise Http404
  return HttpResponse(utils.get_linklibrary_json(library))
  
@require_http_methods(['GET'])
@login_required
def get_library(request, username, lib_name):
  # XXX and try/except in case the lib_name doesn't exist
  # try :
  library = LinkLibrary.objects.get(user__username=username, name=lib_name)
  # except library.DoesNotExist:
  #   return HttpResponse('No library found.')

  doc = utils.build_kml_from_library(library)
  file_path = 'media/kml/' + username + '-' + lib_name + '.kml'
  #xml.dom.ext.PrettyPrint(doc, open(file_path, "w"))

  with open(file_path, 'w') as f:
    # XXX try setting newl=''
    f.write(doc.toprettyxml(indent='  ', encoding='UTF-8'))

  uri = settings.SITE_ROOT + 'site_media/kml/' + username + '-' + lib_name + '.kml'

  return HttpResponse(uri)

@require_http_methods('GET')
@login_required
def get_link(request, linkId):
  if linkId and linkId.isdigit():
    link = Link.objects.get(pk=int(linkId))
    if link:
      return HttpResponse(json.dumps(utils.django_to_dict(link)))
  return HttpResponseNotFound('Link %s doesn\'t exist' % linkId)

@require_http_methods(['GET'])
@login_required
def get_libraries(request):
  try:
    user = CoreUser.objects.get(username=request.user)
    results = user.libraries.all()
  except CoreUser.DoesNotExist:
    return render_to_response('login.html', context_instance=RequestContext(request))
  return HttpResponse(serializers.serialize('json', results, use_natural_keys=True))


# XXX should only accept a POST once fully implemented
@require_http_methods(['GET', 'POST'])
@login_required
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


@require_http_methods(['GET'])
@login_required
def get_tags(request):
  """
  The purpose of this view is to respond to an AJAX call for all
  the public tags in our Tag table.

  Parameters:
    ``term`` - represents the keyboard input of the user while
               waiting for the auto-complete list to be returned.

  Returns:
    This view returns a list of all the public tags that match the
    parameter submitted.
  """
  term = request.GET['term']
  print "Getting tags like %s" % term
  if ',' in term:
    termList = term.split(',')
    length_of_list = len(termList)
    term = termList[length_of_list-1].strip()
    # print 'term is- %s -here' % term

  results = Tag.objects.filter(name__icontains=term, type='P')

  return HttpResponse(serializers.serialize('json', results))


@require_http_methods(['GET'])
def index(request):
  # If the user is authenticated, send them to the application.
  if request.user.is_authenticated():
    return HttpResponseRedirect(reverse('coreo.ucore.views.map_view'))

  # If the user is not authenticated, show them the main page.
  return render_to_response('index.html', context_instance=RequestContext(request))


@require_http_methods(['GET'])
@login_required
def library_demo(request):
  """
  This view exists to demonstrate the ability to select multiple
  links from our search results and then select the ones you want
  to create a link library.

  Returns:
    If the user requesting this view is authenticated already, this
    view will return the HTML page that goes with it : testgrid.html.
    Otherwise, it will take the request and redirect to the login page.
  """
  return render_to_response('testgrid.html', context_instance=RequestContext(request))


@require_http_methods(['GET', 'POST'])
def login(request):
  if request.method == 'GET':
    next = request.GET['next'].strip() if 'next' in request.GET else ''

    return render_to_response('login.html', {'next' : next}, context_instance=RequestContext(request))
  else:
    # authenticate the user viw username/password
    username = request.POST['username'].strip()
    password = request.POST['password'].strip()
    next = request.POST['next'].strip() if 'next' in request.POST else '/map/'

    if not next: next = '/map/'

    # check if the user already exists
    if not CoreUser.objects.filter(username__exact=username).exists():
      return render_to_response('register.html', context_instance=RequestContext(request))

    user = auth.authenticate(username=username, password=password)

    # The user has been succesfully authenticated. Send them to the GE app.
    if user:
      auth.login(request, user)

      return HttpResponseRedirect(next)

    return render_to_response('login.html',
          {'error_message': 'Invalid Username/Password Combination'},
           context_instance=RequestContext(request))


@login_required
def logout(request):
  """
  Log the user out, terminating the session
  """
  if request.user.is_authenticated():
    auth.logout(request)

  return HttpResponseRedirect(reverse('coreo.ucore.views.index'))


@require_http_methods(['GET'])
@login_required
def map_view(request):
  try:
    user = CoreUser.objects.get(username=request.user.username)
  except CoreUser.DoesNotExist:
    # as long as the login_user view forces them to register if they don't already
    # exist in the db, then we should never actually get here. Still, better safe than sorry.
    return render_to_response('login.html', context_instance=RequestContext(request))

  return render_to_response('map.html', {'user': user}, context_instance=RequestContext(request))

@login_required
def manage_libraries(request):
  if request.method == 'GET':
    user = CoreUser.objects.get(username=request.user)
    library_list = user.libraries.all()
    available_list = LinkLibrary.objects.all()
    for i in library_list:
      available_list = available_list.exclude(name=i.name)
    return render_to_response('manage-libraries2.html', { 'library_list': library_list, 'available_list': available_list }, context_instance=RequestContext(request))
  else:
    return HttpResponse("Only GET supported so far.")

def manage_libraries2(request):
  if request.method == 'GET':
    user = CoreUser.objects.get(username=request.user)
    libform = LibraryForm(instance=user)
    LibraryFormSet = formset_factory(LibraryForm)
    return render_to_response('sample.html', { 'form', libform }, context_instance=RequestContext(request))    
  else:
    user = CoreUser.objects.get(username=request.user)
    libform = LibraryForm(request.POST, instance=user)
    libform.save()
    return HttpResponseRedirect('/manage-libraries/?saved=True')




@require_http_methods(['GET', 'POST'])
@login_required
def modify_settings(request):
  user = get_object_or_404(CoreUser, username=request.user.username)

  if request.method == 'GET':
    saved_status = request.GET['saved'].strip() if 'saved' in request.GET else ''

    return render_to_response('settings.html', {'settings': user.settings, 'skin_list': Skin.objects.all(), 'saved': saved_status},
        context_instance=RequestContext(request))
  else:
    wants_emails = True if 'wants_emails' in request.POST else False
    skin = Skin.objects.get(name=request.POST['skin'].strip())

    user.settings.wants_emails = wants_emails
    user.settings.skin = skin
    user.settings.save()

    return HttpResponseRedirect('/settings/?saved=True')


@require_http_methods(['GET'])
@login_required
def notifytest(request):
  # user = CoreUser.objects.filter(username=request.user)
  return render_to_response('notify.html', context_instance=RequestContext(request))


@require_http_methods(['GET', 'DELETE'])
@login_required
def poll_notifications(request, notification_id):
  """
  poll_notifications has two methods it supports: GET and DELETE.
  For DELETE you have to submit a ``notification_id``, which will then
  delete the notification from the DB.

  If you call a GET, don't send any parameters and the view will
  return a JSON list of all notifications for the logged-in user.
  """
  user = CoreUser.objects.filter(username=request.user)

  if not user:
    logging.debug('No user retrieved by the username of %s' % request.user)

  response = HttpResponse(mimetype='application/json')

  if request.method == "GET":
    # print 'request user is %s' % request.user
    try:
      json_serializer = serializers.get_serializer('json')()
      notify_list = Notification.objects.filter(user=user)
      json_serializer.serialize(notify_list, ensure_ascii=False, stream=response)
    except Exception, e:
      logging.error(e.message)
      print e.message

    return response
  else:
    logging.debug('Received the following id to delete from notifications : %s' % notification_id)
    notification = Notification.objects.filter(user=user, pk=notification_id)
    notification.delete()

    return response


@require_http_methods(['GET', 'POST'])
@login_required
def rate(request, ratee, ratee_id):
  """
  Rate either a ``Link`` or ``LinkLibrary``.

  Parameters:
    ``ratee`` - a string, whose value must be either 'link' or 'library'. The value of ``ratee`` is
                guaranteed by the app's URL conf file.
    ``ratee_id`` - the ID of the ``Link`` or ``LinkLibrary`` to be rated

  Returns:
    a JSON object. For GET requests, the JSON object represent the ``Link`` or ``LinkLibrary`` and the
    related ``Rating``, if one already exists. For POST requests, the JSON object is simply the new
    ``Rating`` instance resulting for updating the database.
  """
  user = get_object_or_404(CoreUser, username=request.user.username)
  link = get_object_or_404(Link, pk=ratee_id) if ratee == 'link' else None
  link_library = get_object_or_404(LinkLibrary, pk=ratee_id) if ratee == 'library' else None

  # check to see if a RatingFK already exists for this (CoreUser, (Link|LinkLibrary)) combo. If the combo already exists:
  #   1. and this is a GET, pass the Rating to the template to be rendered so the user can update the Rating
  #   2. and this is a POST, update the Rating
  try:
    rating_fk = RatingFK.objects.get(user=user, link=link, link_library=link_library)
  except RatingFK.DoesNotExist:
    rating_fk = None

  if rating_fk:
    try:
      rating = Rating.objects.get(rating_fk=rating_fk)
    except Rating.DoesNotExist:
      if not rating: raise IntegrityError('A RatingFK %s exists, but is not associated with a Rating' % rating_fk)

  if request.method == 'GET':
    if rating_fk:
      context = {'rating': utils.django_to_dict(rating), 'link': utils.django_to_dict(link),
                 'link_library': utils.django_to_dict(link_library)}
    else:
      context = {'link': utils.django_to_dict(link), 'link_library': utils.django_to_dict(link_library)}

    return HttpResponse(json.dumps(context))
  else:
    if rating_fk:
      rating.score, rating.comment = (request.POST['score'], request.POST['comment'].strip())
      rating.save()
    else:
      if ratee == 'link': rating_fk = RatingFK.objects.create(user=user, link=link)
      elif ratee == 'library': rating_fk = RatingFK.objects.create(user=user, link_library=link_library)

      rating = Rating.objects.create(rating_fk=rating_fk, score=request.POST['score'], comment=request.POST['comment'].strip())

    return HttpResponse(json.dumps(utils.django_to_dict(rating)))


@require_http_methods(['GET'])
def register(request, sid):
  """
  Pull out the user's sid, name, email, and phone number from the user's certs.
  Return a pre-filled registration form with this info so the user can create an account.
  """
  # get the sid and name from the cert
  #name_sid = os.getenv('SSL_CLIENT_S_DN_CN', '').split(' ')
  #name = ' '.join(name_sid[:-1])
  #sid = name_sid[-1]

  # XXX in the future we'll be returning more info (sid, name, email, phone number).
  # The user will basically just need to verify the info and put in some basic additional
  # info (main areas of interest, skin, etc).
  return render_to_response('register.html', {'sid': sid}, context_instance=RequestContext(request))


@require_http_methods(['GET'])
@login_required
def search(request, models):
  """
  Search the databases for ``Links`` or ``LinkLibraries`` whose metadata matches the search terms. The
  metadata searched is the name, description, and tag names associated with the ``Link`` or ``LinkLibrary``.
  The search terms come from the GET parameter ``q``, which should be a comma-separated list of strings.

  Parameters:
    ``models`` - a sequence of strings specifying the models to search. Must be a combination of
                 'Link' or 'LinkLibrary'. The values are guaranteed by the app's URL conf file.

  Returns:
    a JSON object containing the matching ``Links`` and/or ``LinkLibraries``.
  """
  if not request.GET['q']:
    return HttpResponse(serializers.serialize('json', ''))

  terms = request.GET['q'].split(',')

  # if the only search term is '*', then search everything
  if len(terms) == 1 and terms[0] == '*': terms[0] = ''

  results = utils.search_ucore(models, terms)

  return HttpResponse(utils.get_searchresults_json(results))

@require_http_methods(['GET'])
@login_required
def get_keywords(request):
  if not request.GET['q']:
    return HttpResponse(serializers.serialize('json', ''))
  term = request.GET['q']
  results = utils.get_keywords(term)
  return HttpResponse(json.dumps(results))
  
@require_http_methods(['GET'])
@login_required
def search_mongo(request):
  url = 'http://174.129.206.221/hello//?' + request.GET['q']
  result = urllib2.urlopen(url)

  return HttpResponse('\n'.join(result.readlines()))


@require_http_methods(['GET'])
def success(request, message=''):
  return HttpResponse('you did it!')


@require_http_methods(['GET'])
@login_required
def trophy_room(request):
  try:
    user = CoreUser.objects.get(username=request.user.username)
    trophy_list = Trophy.objects.all()
    trophy_case_list = TrophyCase.objects.all()
    earn_total = []
    earn_progress = []
    percentage = []

    for i in trophy_list:
      earn_total += [i.earning_req]

    # print 'total elements in list: ', earn_total
    for t in trophy_list:
      for o in trophy_case_list:
        if (o.trophy == t):
          # print 'Found one : %s' % t.name
          if o.date_earned:
            earn_progress += [t.earning_req]
            percentage += [(o.count / t.earning_req)*100]
          else:
            earn_progress += [o.count]
            percentage += [(o.count / t.earning_req)*100]
        else:
          earn_progress += [0]
          percentage += [(o.count / t.earning_req)*100]
    # print 'total earn_progress looks like: ', earn_progress
    combine_list = zip(trophy_list, earn_progress, percentage)
  except CoreUser.DoesNotExist:
    # as long as the login_user view forces them to register if they don't already
    # exist in the db, then we should never actually get here. Still, better safe than sorry.
    return render_to_response('login.html', context_instance=RequestContext(request))

  return render_to_response('trophyroom.html',
      {'trophy_list' : combine_list,
       'trophy_case_list' : trophy_case_list,
       'user' : user.username,
       'earn_total' : earn_total,
       'earn_progress' : earn_progress,
      }, context_instance=RequestContext(request))


@require_http_methods(['GET', 'POST'])
@login_required
def update_user(request):
  """ 
  Update the user's record in the DB.
  """
  if request.method == 'GET':
    user = CoreUser.objects.get(username=request.user.username)
    saved_status = request.GET['saved'].strip() if 'saved' in request.GET else ''
    return render_to_response('userprofile.html', {'user': user, 'saved': saved_status, 'settings': user.settings, 'skin_list': Skin.objects.all() }, context_instance=RequestContext(request))
  else:
    user = CoreUser.objects.filter(username=request.user.username)
    first_name = request.POST['first_name'].strip()
    last_name = request.POST['last_name'].strip()
    email = request.POST['email'].strip()
    phone_number = request.POST['phone_number'].strip()
    sid = request.POST['sid'].strip()
    wants_emails = True if 'wants_emails' in request.POST else False
    skin = Skin.objects.get(name=request.POST['skin'].strip())
    
    try:
      if (len(phone_number) != 10):
        prog = re.compile(r"\((\d{3})\)(\d{3})-(\d{4})")
        result = prog.match(phone_number)
        phone_number = result.group(1) + result.group(2) + result.group(3)
    except Exception, e:
      logging.error('Exception parsing phone number: %s' % e.message)

    if not (first_name and last_name and email and phone_number):
    # redisplay the registration page
      return render_to_response('userprofile.html', {'user': user, 'saved': 'False', 'settings': user.settings, 'skin_list': Skin.objects.all() }, context_instance=RequestContext(request))

    # update the user to the DB
    user = CoreUser.objects.get(sid=sid)
    user.first_name = first_name
    user.last_name = last_name
    user.email = email
    user.phone_number = phone_number
    user.settings.wants_emails = wants_emails
    user.settings.skin = skin
    user.settings.save()
    user.save()

    # return an HttpResponseRedirect so that the data can't be POST'd twice if the user hits the back button
    return HttpResponseRedirect('/user-profile/?saved=True')


@require_http_methods(['GET', 'POST'])
@login_required
def update_password(request):
  if request.method == 'GET':
    saved_status = request.GET['saved'].strip() if 'saved' in request.GET else ''

    return render_to_response('password.html', {'saved': saved_status}, context_instance=RequestContext(request))
  else:
    user = CoreUser.objects.get(username=request.user)
    old_password = request.POST['old'].strip()
    new_password = request.POST['password'].strip()

    if (old_password == new_password):
      return render_to_response('password.html', {'error_message': 'Your new password must be different from your current password. Please try again.'},
          context_instance=RequestContext(request))

    if user.check_password(old_password):
      user.set_password(new_password)
      user.save()

      return HttpResponseRedirect('/update-password/?saved=True')
    else:
      return render_to_response('password.html', {'error_message': 'Invalid password. Please try again.'},
           context_instance=RequestContext(request))
       

@require_http_methods(['GET', 'POST'])
def upload_csv(request):
  if request.method == 'GET':
    return render_to_response('upload_csv.html', context_instance=RequestContext(request))
  else:
    utils.insert_links_from_csv(request.FILES['file'])
    return render_to_response('upload_csv.html', context_instance=RequestContext(request))

@require_http_methods(['GET'])
@login_required
def user_profile(request):
  #XXX the django dev server can't use ssl, so fake getting the sid from the cert
  #XXX pull out the name as well. pass it to register() and keep things DRY
  #sid = os.getenv('SSL_CLIENT_S_DN_CN', '').split(' ')[-1]
  #sid = 'jlcoope'
  #if not sid: return render_to_response('install_certs.html')
  try:
    user = CoreUser.objects.get(username=request.user.username)
    saved_status = request.GET['saved'].strip() if 'saved' in request.GET else ''
  except CoreUser.DoesNotExist:
    # as long as the login_user view forces them to register if they
    # don't already exist in the db, then we should never actually get here.
    # Still, better safe than sorry.
    return render_to_response('login.html', context_instance=RequestContext(request))

  return render_to_response('userprofile.html', {'user': user, 'saved': saved_status, 'settings': user.settings, 'skin_list': Skin.objects.all()}, context_instance=RequestContext(request))


# XXX where is this used.?
def header_name(name):
    """ Convert header name like HTTP_XXXX_XXX to Xxxx-Xxx: """
    words = name[5:].split('_')

    for i in range(len(words)):
      words[i] = words[i][0].upper() + words[i][1:].lower()

    result = '-'.join(words) + ':'

    return result 


@require_http_methods(['GET'])
@login_required
def kmlproxy(request):
  remoteUrl = request.META['QUERY_STRING']
  parsedRemoteUrl = urlparse(remoteUrl)

  if (parsedRemoteUrl.scheme != 'http' and parsedRemoteUrl.scheme != 'https'):
      return HttpResponseBadRequest('Link contains invalid KML URL scheme - expected http or https')

  conn = None

  try:
    conn = HTTPConnection(parsedRemoteUrl.hostname, parsedRemoteUrl.port)
    headers = {}
    conn.request('GET', parsedRemoteUrl.path + '?' + parsedRemoteUrl.query, None, headers)
    remoteResponse = conn.getresponse()
    
    # parse KML into a DOM
    contentType = remoteResponse.getheader('content-type')
    kmlDom = None

    if contentType.startswith('application/vnd.google-earth.kmz'):
      # handle KMZ file, unzip and extract contents of doc.kml
      kmlTxt = None
      kmzBuffer = StringIO(remoteResponse.read())

      try:
        zipFile = zipfile.ZipFile(kmzBuffer, 'r')
        # KMZ spec says zip will contain exactly one file, named doc.kml
        kmlTxt = zipFile.read('doc.kml')
      finally:
        kmzBuffer.close()

      try:
        kmlDom = parseString(kmlTxt)
      except ExpatError, e:
        print 'ERROR: failed to parse KML - %s' % e
        return HttpResponseServerError('Link contains invalid KML')
    elif contentType.startswith('application/vnd.google-earth.kml+xml'):
      try:
        kmlDom = parse(remoteResponse)
      except ExpatError, e:
        print 'ERROR: failed to parse KML - %s' % e

        return HttpResponseServerError('Link contains invalid KML')
    else:
      print 'ERROR: URL didn\'t return KML. Returned %s' % contentType
      return HttpResponseServerError('Link doesn\'t contain KML (content-type was %s)' % contentType)

    # Parse KML into a dictionary and then serialize the dictionary to JSON
    try:
      # print remoteUrl + kmlDom.toprettyxml('  ')
      kmlParser = KmlParser()
      dict = None

      try:
        dict = kmlParser.kml_to_dict(node = kmlDom.documentElement, baseUrl = parsedRemoteUrl.geturl())
      except ValueError, e:
        print 'ERROR: failed to serialize KML document to dictionary - %s' % e
        return HttpResponseNotFound('Couldn\'t parse KML from link')

      jsonTxt = None

      try:
        jsonTxt = json.dumps(dict, indent = 2)
      except ValueError, e:
        print 'ERROR: Failed to serialize dictionary to JSON - %s' % e
        return HttpResponseServerError('Couldn\'t serialize link\'s KML to JSON')

      response = HttpResponse(content = jsonTxt, 
                              status = remoteResponse.status,
                              content_type = 'application/json')
      return response
    finally:
        kmlDom.unlink()
  finally:
      if conn: conn.close()

@require_http_methods(['GET', 'POST'])
@login_required
def kml2json(request):
    if request.method == 'GET':
      return render_to_response('kml2json.html', context_instance=RequestContext(request))
    
    # else request.method == 'POST', perform the conversion
    kmlDom = None
    asAttach = False
    if request.FILES != None and 'file' in request.FILES:
      print "Processing file"
      asAttach = True
      kmlFile = request.FILES['file']
      try:
        kmlDom = parse(kmlFile)
      except ExpatError, e:
        print 'ERROR: failed to parse KML - %s' % e
        return HttpResponseBadRequest('Invalid KML. Could not parse XML - %s' % e)
    else:
      kmlTxt = request.raw_post_data
      try:
        kmlDom = parseString(kmlTxt)
      except ExpatError, e:
        print 'ERROR: failed to parse KML - %s' % e
        return HttpResponseBadRequest('Invalid KML. Could not parse XML - %s' % e)
    
    # Parse KML into a dictionary and then serialize the dictionary to JSON
    try:
      kmlParser = KmlParser()
      dict = None
      try:
          dict = kmlParser.kml_to_dict(node = kmlDom.documentElement, baseUrl = '/')
      except ValueError, e:
          print 'ERROR: failed to serialize KML document to dictionary - %s' % e
          return HttpResponseBadRequest('Invalid KML. KML could not be converted to JSON - %s' % e)
      jsonTxt = None
      try:
          jsonTxt = json.dumps(dict, indent = 2)
      except ValueError, e:
          print 'ERROR: Failed to serialize dictionary to JSON - %s' % e
          return HttpResponseServerError('Couldn\'t serialize KML to JSON - %s' % e)
      response = HttpResponse(content = jsonTxt, content_type = 'application/json')
      if asAttach:
        response['Content-Disposition'] = 'attachment; filename=json.txt'
      return response
    finally:
        kmlDom.unlink()

@require_http_methods('GET')
@login_required
def get_current_user(request):
  currentUser = CoreUser.objects.select_related().get(username=request.user.username)
  return HttpResponse(content_type=utils.JSON_CONTENT_TYPE, 
                          content=utils.get_coreuser_json(currentUser))
