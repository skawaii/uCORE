#!/usr/local/bin/python

import codecs
import csv
import cStringIO
import re

from BeautifulSoup import BeautifulStoneSoup


KML_FILE = 'doc.kml'
OUTPUT_FILE = 'links_doc.csv'
HEADER_ROW = ('name', 'description', 'url', 'tags') 


def strip_html(html_string):
  html_tag = re.compile('<.*?>')
  
  return html_tag.sub(' ', html_string).strip()


if __name__ == '__main__':
  soup = BeautifulStoneSoup(open(KML_FILE, 'rb'))
  links = soup.findAll('networklink')

  writer = csv.writer(open(OUTPUT_FILE, 'wb'))
  writer.writerow(HEADER_ROW)

  for link in links:
    name = link.contents[1].string
    href = link.href.string
    desc = ''

    if link.description: desc = strip_html(link.description.string)

    # the csv module can't handle unicode, so encode as utf-8
    writer.writerow([s.encode('utf-8') for s in (name, desc, href, '')])

