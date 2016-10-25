#!/usr/bin/python

import mechanize
import json
from bs4 import BeautifulSoup

# Browser
br = mechanize.Browser()

# Browser options
br.set_handle_equiv(True)
#br.set_handle_gzip(True)
br.set_handle_redirect(True)
br.set_handle_referer(True)
br.set_handle_robots(False)

# Follows refresh 0 but not hangs on refresh > 0
br.set_handle_refresh(mechanize._http.HTTPRefreshProcessor(), max_time=1)

# Want debugging messages?
#br.set_debug_http(True)
#br.set_debug_redirects(True)
#br.set_debug_responses(True)

# User-Agent (this is cheating, ok?)
br.addheaders = [('User-agent', 'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.0.1) Gecko/2008071615 Fedora/3.0.1-1.fc9 Firefox/3.0.1')]

WEB_URL = 'http://www.hotslogs.com/Info/HeroSubRole'
DATA_FILE = '../data/hero_sub_roles.JSON'

print "Collecting Hero Sub-Role Data."

br.open(WEB_URL)
soup = BeautifulSoup(br.response().read(), 'html.parser')

heroes = {}

# Get each role table
for hero_table in soup.find_all('table','alert-info'):
	role = hero_table.th.get_text()
	# Get each hero
	for hero_cell in hero_table.find_all('td'):
		heroes[hero_cell.get_text()] = role

# Put data in file
f = open(DATA_FILE,'w')
f.write(json.dumps(heroes))
