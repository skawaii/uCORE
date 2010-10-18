import os
import sys
import csv
import django
import settings
from ucore.models import Link, Tag

for filename in sys.argv:
  print arg
  insertLinksFromCSV(filename)

def insertLinksFromCSV(filename):
  if filename.endswith('.csv'):
    linkFile = csv.reader(open(filename))
    headers = linkFile.next()
    for row in linkFile:
      fields = zip(headers, row)
      link = {}
      for(field, value) in fields:
        link[field] = value.strip()

      link['tags']=link['tags'].strip('"')
      dblink = Link(name=link['name'], description=link['description'], url=link['url'])
      dblink.save()

      for tag in link['tags'].split(','):
	try:
	  storedTag=Tag.objects.get(name=tag)
	except Tag.DoesNotExist:
	  storedTag=Tag(name=tag).save()
	dblink.tags.add(storedTag)

      dblink.save()

      

