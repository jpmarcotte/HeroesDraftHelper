wait_for_state = function(test, execute, interval = 100) {
	if (test()) { execute(); }
	else { setTimeout(function(){ wait_for_state(test, execute, interval); }, interval); }
}

page_ready = function() { return !$('div.RadAjax').is(':visible'); }

window.maps_opened = false;
process_map_rows = function() {
	if (window.map_rows.length) {
		console.log("Loading Map, "+window.map_rows.length+" remaining ");
		row = window.map_rows.shift();
		$(row).find('button').click();
		wait_for_state(page_ready, process_map_rows, 100);
	} else { window.maps_opened = true; }
}

parse_maps = function() {
	map_keys = {};
	$("table#ctl00_MainContent_RadGridMapStatistics_ctl00 > thead > tr > th").each(function(i) {
		field_name = $(this).text().trim();
		if (field_name) { map_keys[field_name] = i; }
	});

	map_rows = $('table#ctl00_MainContent_RadGridMapStatistics_ctl00 > tbody').children().toArray();

	map_data = {};
	while (map_rows.length) {
		map_name_row = map_rows.shift();
		map_hero_row = map_rows.shift();

		map_name = $(map_name_row).find('td').eq(map_keys['Map Name']).text().trim();
		console.log("Collecting Data for "+map_name);

		map_hero_table = $(map_hero_row).find('table');
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
				else if (field == 'Popularity' || field == 'Win Percent') { hero_data[field] = (parseFloat(value)/100).toFixed(3); }
			}
			heroes_data[hero_name] = hero_data;
		});

		document.dispatchEvent(new CustomEvent('Store_Map_Data', { 'detail': {
			'map': map_name,
			'heroes': heroes_data,
			'timestamp': Date.now()
		}}));
	}

}

store_map_data = function() {
	console.log("Selecting Hero League");
	$("div#ctl00_MainContent_DropDownGameMode_DropDown li:contains('Hero League')").click();
	window.maps_ready = false;
	wait_for_state(page_ready, function() {
		window.maps_ready = true;
	});

	wait_for_state(function(){return window.maps_ready;}, function() {
		window.map_rows = $('table#ctl00_MainContent_RadGridMapStatistics_ctl00 > tbody').children().toArray();
		console.log("Opening Maps");
		wait_for_state(page_ready,process_map_rows);
	});

	wait_for_state(function(){return window.maps_opened;}, parse_maps, 1000);
}
