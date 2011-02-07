import csv
import xml.dom.minidom

from coreo.ucore.models import *


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

