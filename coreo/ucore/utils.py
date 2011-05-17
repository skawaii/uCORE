import csv
import xml.dom.minidom

from django.db.models import Q

from coreo.ucore.models import *

JSON_CONTENT_TYPE = 'application/json'

def http_accepts(request, content_type):
  accepts = []
  if ('HTTP_ACCEPT' in request.META):
    accepts = [a.split(';')[0] for a in request.META['HTTP_ACCEPT'].split(',')]
  return content_type in accepts;

def accepts_json(request):
  return http_accepts(request, JSON_CONTENT_TYPE)

def get_coreuser_json(coreuser):
  from django.core import serializers
  if not coreuser:
    return 'null'
  if isinstance(coreuser, list):
    coreuser = coreuser[0]
  coreuser = [coreuser];
  json = serializers.serialize('json', coreuser,
                               extras=('username','first_name','last_name','email'),
                               relations={'settings':{'relations':('skin',)}, 
                                          'libraries':{
                                            'relations': {
                                              'creator': None,
                                              'tags': None,
                                              'links': {
                                                          'relations': ('poc', 'tags', )
                                                        }
                                             }
                                          }})
  return unwrap_json_array(json)
  
# Serializes a single LinkLibrary instance
def get_linklibrary_json(library):
  from django.core import serializers
  if not library:
    return 'null'
  if isinstance(library, list):
    library = library[0]
  library = [library];
  json = serializers.serialize('json', library,
                               relations={'creator':None,
                                          'tags':None, 
                                          'links':{'relations':('poc','tags',)}})
  return unwrap_json_array(json)

def get_searchresults_json(results):
  from django.core import serializers
  return serializers.serialize('json', results,
                               relations={'creator':None,
                                          'tags':None, 
                                          'links':{'relations':('poc','tags',)}})

def unwrap_json_array(json):
  json = json.strip()
  if json.startswith('['):
    json = json[1:-1]
  return json
  
def insert_links_from_csv(csv_file):
  link_file = csv.reader(csv_file)

  # headers are name, description, url, tags, poc_first, poc_last, poc_phone, poc_email
  headers = link_file.next()

  for row in link_file:
    fields = zip(headers, row)
    poc = {}

    # create the POC obj if it doesn't already exist in the DB
    for field, value in fields[4:]:
      poc[field] = value.strip()

    db_poc = POC.objects.get_or_create(email=poc['poc_email'], defaults={'first_name': poc['poc_first'],
        'last_name': poc['poc_last'], 'phone_number': poc['poc_phone']})[0]

    # create the Link obj
    link = {}

    for field, value in fields[:4]:
      link[field] = value.strip()

    link['tags'] = link['tags'].strip('"')

    db_link = Link(name=link['name'], url=link['url'], desc=link['description'], poc=db_poc)
    db_link.save()

    for tag in link['tags'].split(','):
      tag = tag.strip()
      db_tag = Tag.objects.get_or_create(name=tag)[0]
      db_link.tags.add(db_tag)

    db_link.save()


def build_kml_from_library(link_library):
  doc = xml.dom.minidom.Document()

  kml = doc.createElement('kml')
  kml.setAttribute('xmlns', 'http://www.opengis.net/kml/2.2')
  kml.setAttribute('xmlns:gx', 'http://www.google.com/kml/ext/2.2')
  kml.setAttribute('xmlns:kml', 'http://www.opengis.net/kml/2.2')
  kml.setAttribute('xmlns:atom', 'http://www.w3.org/2005/Atom')

  doc.appendChild(kml)

  folder = doc.createElement('Folder')
  folder_name = doc.createElement('name')
  folder_name.appendChild(doc.createTextNode(link_library.name))
  folder.appendChild(folder_name)

  vis_element = doc.createElement('visibility')
  vis_element.appendChild(doc.createTextNode('0'))
  folder.appendChild(vis_element)
  
  kml.appendChild(folder)

  for link in link_library.links.all():
    net_link = doc.createElement('NetworkLink')
    
    name_element = doc.createElement('name')
    name_element.appendChild(doc.createTextNode(link.name))
    net_link.appendChild(name_element)

    net_link.appendChild(vis_element.cloneNode(True))

    desc_element = doc.createElement('description')
    desc_element.appendChild(doc.createTextNode(link.desc))
    net_link.appendChild(desc_element)

    link_element = doc.createElement('Link')
    href_element = doc.createElement('href')
    href_element.appendChild(doc.createTextNode(link.url))
    link_element.appendChild(href_element)
    net_link.appendChild(link_element)
    
    folder.appendChild(net_link)

  return doc


def search_ucore(models, terms):
  """
  Search the desc, name, and associated ``Tag`` names of ``models`` for the search terms specified in ``terms``.

  Example:
    ``search_core(('Link', 'LinkLibrary'), ['hot', 'pants'])`` will return all rows from the ``Link`` and ``LinkLibrary``
    models containing 'hot' or 'pants' in either the name, description, or ``Tag`` names.

  Parameters:
    ``models`` - a sequence of models to be searched, specified as strings.
    ``terms`` - a sequence of search terms

  Returns:
    a set containing the results of the search
  """
  results = set()

  for model in models:
    results |= set(eval(model).objects.filter(reduce(lambda x, y: x | y, map(lambda z: Q(desc__icontains=z), terms))).distinct())
    results |= set(eval(model).objects.filter(reduce(lambda x, y: x | y, map(lambda z: Q(name__icontains=z), terms))).distinct())
    results |= set(eval(model).objects.filter(reduce(lambda x, y: x | y, map(lambda z: Q(tags__name__icontains=z), terms))).distinct())

  return results

def get_keywords(term):
  from django.db import connection, transaction
  cursor = connection.cursor()
  query = """
  select distinct ktype, kval, pri
  from (
    select 1 as pri, 'Tag' as ktype, ucore_tag.name as kval from ucore_tag where ucore_tag.type = 'P' and lower(ucore_tag.name) like lower(%s)
    union
    select 3 as pri, 'Link Name' as ktype, ucore_link.name as kval from ucore_link where lower(ucore_link.name) like lower(%s)
    union
    select 4 as pri, 'Link URL' as ktype, ucore_link.url as kval from ucore_link where lower(ucore_link.url) like lower(%s)
    union
    select 6 as pri, 'Link Description' as ktype, ucore_link.desc as kval from ucore_link where lower(ucore_link.desc) like lower(%s)
    union
    select 2 as pri, 'Library Name' as ktype, ucore_linklibrary.name as kval from ucore_linklibrary where lower(ucore_linklibrary.name) like lower(%s)
    union
    select 5 as pri, 'Library Description' as ktype, ucore_linklibrary.desc as kval from ucore_linklibrary where lower(ucore_linklibrary.desc) like lower(%s)
  )
  order by pri
  """

  cursor.execute(query, ['%' + term + '%' for i in range(6)])
  return [dict(zip(('type', 'value'), row)) for row in cursor.fetchmany(size=20)]

def django_to_dict(instance):
  """
  Creates a Python dictionary representation of a Django model instance (or list of instances)
  suitable for encoding with the ``json`` Python module.

  Parameters:
    ``instance`` - a single Django model instance or a list of model instances. If ``instance``
                   (or the elements of ``instance``) is ``None``, then ``None`` is returned.

  Returns:
    a single Python dictionary representation of the model if ``instance`` is a single object;
    otherwise, a list of Python dictionaries.
  """
  from django.core import serializers

  is_list = isinstance(instance, list)

  if not is_list: instance = [instance]

  data = []

  for inst in instance:
    if inst: data.append(eval(serializers.serialize('json', [inst]))[0])
    else: data.append(None)

  if not is_list: data = data[0]

  return data


# XXX don't use this. It works, but I don't like the way I implemented it
def dict_to_django(dicts):
  """
  Creates a Django model instance (or list of instances) from a Python dictionary representation
  of the instance.

  Parameters:
    ``dicts`` - a single dictionary or a list of dictionaries. If ``dicts`` (or the elements of
    ``dicts``) is ``None``, then ``None`` is returned.

  Returns:
    a single Django model instance if ``dicts`` is a single object; otherwise, a list of Django
    model instances.
  """
  from django.core import serializers

  is_list = isinstance(dicts, list)

  if not is_list: dicts = [dicts]

  data = []

  for d in dicts:
    if d:
      # the Django deserializer expects a pretty specific string format. Have to
      # convert unicode to strings and use " for the keys
      #items = d.items()
      #d.clear()

      #for key, value in items:
      #  d[str(key)] = str(value) if isinstance(value, unicode) else value

      d = str([d]).replace('\'', '"')
      # XXX this is a really hacky why to do this and a bad assumption to be making...
      d = d.replace('u"', '"')

      for obj in serializers.deserialize('json', d):
        data.append(obj.object)
    else:
      data.append(None)

  if not is_list: data = data[0]

  return data

