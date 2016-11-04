wait_for_state = function(test, execute, interval = 100) {
	if (test()) { execute(); }
	else { setTimeout(function(){ wait_for_state(test, execute, interval); }, interval); }
}

page_ready = function() { return !$('div.RadAjax').is(':visible'); }

window.maps_opened = false;
process_map_rows = function() {
	if (window.map_rows.length) {
		console.log("Loading Map, "+window.map_rows.length+" remaining ");
		// Provide feedback
		$('#HDH_StoreMapDataButton .lbl').text("Loading Map, "+window.map_rows.length+" maps remaining...");
		row = window.map_rows.shift();
		$(row).find('button').click();
		wait_for_state(page_ready, process_map_rows, 100);
	} else { window.maps_opened = true; }
}

window.maps_parsed = false;
parse_maps = function() {
	map_keys = {};
	$("table#ctl00_MainContent_RadGridMapStatistics_ctl00 > thead > tr > th").each(function(i) {
		field_name = $(this).text().trim();
		if (field_name) { map_keys[field_name] = i; }
	});

	map_rows = $('table#ctl00_MainContent_RadGridMapStatistics_ctl00 > tbody').children().toArray();

	map_data = {};
	mapCount = 0;
	totalMapCount = (map_rows.length / 2);	// There are two rows displayed in the table for each map
	while (map_rows.length) {
		map_name_row = map_rows.shift();
		map_hero_row = map_rows.shift();

		map_name = $(map_name_row).find('td').eq(map_keys['Map Name']).text().trim();
		mapCount += 1;
		console.log("Collecting Data for "+map_name+" ("+mapCount+" / "+totalMapCount+")");
		// Provide feedback
		$('#HDH_StoreMapDataButton .lbl').text("Processing map "+mapCount+" of "+totalMapCount+"...");
		
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
				else if (field == 'Win Percent') {
					// toFixed corrects computer rounding errors, but returns a string, so is parsed again.
					hero_data[field] = parseFloat((parseFloat(value)/100).toFixed(3));
				}
			}
			heroes_data[hero_name] = hero_data;
		});

		document.dispatchEvent(new CustomEvent('Store_Map_Data', { 'detail': {
			'map': map_name,
			'heroes': heroes_data,
			'timestamp': Date.now()
		}}));
	}
	window.maps_parsed = true;
}

store_map_data = function() {
	// Provide feedback
	$('#HDH_MapProcessingIcon').removeClass().addClass('fa fa-spinner fa-spin');
	$('#HDH_StoreMapDataButton .lbl').text("Processing...");
	$('#HDH_StoreMapDataButton').removeClass().addClass('btn btn-info');
	
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
	
	// Provide feedback
	wait_for_state(
		function(){return window.maps_parsed;},
		function() {
			$('#HDH_MapProcessingIcon').removeClass().addClass('fa fa-check');
			$('#HDH_StoreMapDataButton .lbl').text("Map Data Stored!");
			$('#HDH_StoreMapDataButton').removeClass().addClass('btn btn-success');
		},
		1000);
}
