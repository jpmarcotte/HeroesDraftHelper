# HeroesDraftHelper - Data Collection
This folder will be used for the scripts that will collect data.

Initially this will probably be a web scraper that pulls data from various HotSLogs.com pages.

## Map Data
To collect map data, go to [Hero And Map Statistics](http://www.hotslogs.com/Sitewide/HeroAndMapStatistics), open the javascript/developer console and run the following:
```
$.getScript("https://cdn.rawgit.com/jpmarcotte/HeroesDraftHelper/master/collection/scrape_map_data.js")
```
Copy the result and put it into /data/maps/map_data.json

## Player Data
Create files in /data/players/ according to the README file there.
run the scrape_player_data.py file.
