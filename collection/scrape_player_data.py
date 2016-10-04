#!/usr/bin/python

import re
import mechanize
import cookielib
import json
from os import listdir
from os.path import isfile, join
from bs4 import BeautifulSoup

# Browser
br = mechanize.Browser()

# Cookie Jar
cj = cookielib.LWPCookieJar()
br.set_cookiejar(cj)

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

API_URL = 'https://api.hotslogs.com/Public/Players/'
WEB_URL = 'http://www.hotslogs.com/Player/Profile'
DATA_DIRECTORY = '../data/players/'

player_file_re = re.compile('^(\d)_(\w+_\d+).json$', re.IGNORECASE)

player_files = [f for f in listdir(DATA_DIRECTORY) if isfile(join(DATA_DIRECTORY, f))]
for file in player_files:
	print "Collecting data for %s" % file
	match = player_file_re.match(file);
	if match:
		# Get the player ID from the API call.
		print "Region %s, Player ID: %s" % (match.group(1), match.group(2))

		br.open('%s%s/%s' % (API_URL, match.group(1), match.group(2)))
		player_info = json.load(br.response())
		player_id = player_info['PlayerID']
		print "Player ID is %d" % player_id

		# Download the actual player page.
		br.open('%s?PlayerID=%d' % (WEB_URL, player_id))
		soup = BeautifulSoup(br.response().read(), 'html.parser')
		hero_table = soup.find(id='ctl00_MainContent_RadGridCharacterStatistics_ctl00')

		# Get Columns
		header = hero_table.thead.tr
		index = 0
		column_keys = dict()
		for column in header.find_all('th'):
			column_keys[index] = column.get_text().replace(u'\xa0', u'')
			index += 1
		#print column_keys

		# Iterate over rows
		hero_rows = hero_table.tbody.find_all('tr')
		player_data = dict()
		for hero_row in hero_rows:

			# Get data from table
			hero_data = dict();
			index = 0
			for cell in hero_row.find_all('td'):
				data_name = column_keys[index]
				if data_name:
					hero_data[data_name] = cell.get_text().replace(u'\xa0', u'')
				index += 1
			#print hero_data

			# Modify data into appropriate values
			hero_data['Hero Level'] = int(hero_data['Hero Level'])
			if hero_data['Win Percent']:
				hero_data['Win Percent'] = float(hero_data['Win Percent'].replace(' %',''))/100
			else:
				hero_data['Win Percent'] = 0.0
			hero_data['Games Played'] = int(hero_data['Games Played'])
			hero_name = hero_data['Hero']
			del hero_data['Hero']
			player_data[hero_name] = hero_data
			
		# Store Player Data
		f = open(join(DATA_DIRECTORY,file),'w')
		f.write(json.dumps(player_data))
