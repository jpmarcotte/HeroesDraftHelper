# HeroesDraftHelper - Data Collection
This folder will be used for the scripts that will collect data.

Initially this will probably be a web scraper that pulls data from various HotSLogs.com pages.

To collect map data, go to [Hero And Map Statistics](http://www.hotslogs.com/Sitewide/HeroAndMapStatistics), open the console and run the following:
```
$.getScript("https://cdn.rawgit.com/jpmarcotte/HeroesDraftHelper/master/collection/scrape_map_data.js")
```
Copy the result and put it into /data/map_data.json
