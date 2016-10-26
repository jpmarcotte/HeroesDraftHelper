var urlParams;
(window.onpopstate = function () {
	var match,
		pl     = /\+/g,  // Regex for replacing addition symbol with a space
		search = /([^&=]+)=?([^&]*)/g,
		decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
		query  = window.location.search.substring(1);

    urlParams = {};
	while (match = search.exec(query)) {
	   urlParams[decode(match[1])] = decode(match[2]);
	}
})();

var store_player_data = function() {
	document.dispatchEvent(new CustomEvent('Store_Player_Data', {
		'detail': collect_player_data()
	}));
}

var collect_player_data = function() {
	var map_hero_table = $('table#ctl00_MainContent_RadGridCharacterStatistics_ctl00');
	hero_keys = {};
	$(map_hero_table).find('th').each(function(i) {
		field_name = $(this).text().trim();
		if (field_name) { hero_keys[field_name] = i; }
	});

	heroes_data = {};
	$(map_hero_table).find('tbody > tr').each(function(){
		hero_data = {};
		for (field in hero_keys) {
			value = $(this).find('td').eq(hero_keys[field]).text().trim()
			if (field == 'Hero') { hero_name = value; }
			else if (field == 'Games Banned' || field == 'Games Played') { hero_data[field] = parseInt(value,10); }
			else if (field == 'Popularity' || field == 'Win Percent') {
				// Double parseFloat prevents computer rounding errors.
				hero_data[field] = parseFloat((parseFloat(value)/100).toFixed(3));
			}
		}
		heroes_data[hero_name] = hero_data;
	});

	player_data = {
		'heroes': heroes_data,
		'ID': urlParams['PlayerID'],
		'name': $('h1.section-title').text().split(': ')[1],
		'timestamp': Date.now()
	};

	return player_data;
}



