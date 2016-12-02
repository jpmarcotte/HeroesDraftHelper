wait_for_state = function(test, execute, interval = 100) {
	if (test()) { execute(); }
	else { setTimeout(function(){ wait_for_state(test, execute, interval); }, interval); }
}

page_ready = function() { return !$('div.RadAjax').is(':visible'); }

//window.maps_opened = false;
//process_map_rows = function() {
//	if (window.map_rows.length) {
//		console.log("Loading Map, "+window.map_rows.length+" remaining ");
//		// Provide feedback
//		$('#HDH_StoreMapDataButton .lbl').text("Loading Map, "+window.map_rows.length+" maps remaining...");
//		row = window.map_rows.shift();
//		$(row).find('button').click();
//		wait_for_state(page_ready, process_map_rows, 100);
//	} else { window.maps_opened = true; }
//}
//
//window.maps_parsed = false;
//parse_maps = function() {
//	map_keys = {};
//	$("table#ctl00_MainContent_RadGridMapStatistics_ctl00 > thead > tr > th").each(function(i) {
//		field_name = $(this).text().trim();
//		if (field_name) { map_keys[field_name] = i; }
//	});
//
//	map_rows = $('table#ctl00_MainContent_RadGridMapStatistics_ctl00 > tbody').children().toArray();
//
//	map_data = {};
//	mapCount = 0;
//	totalMapCount = (map_rows.length / 2);	// There are two rows displayed in the table for each map
//	while (map_rows.length) {
//		map_name_row = map_rows.shift();
//		map_hero_row = map_rows.shift();
//
//		map_name = $(map_name_row).find('td').eq(map_keys['Map Name']).text().trim();
//		mapCount += 1;
//		console.log("Collecting Data for "+map_name+" ("+mapCount+" / "+totalMapCount+")");
//		// Provide feedback
//		$('#HDH_StoreMapDataButton .lbl').text("Processing map "+mapCount+" of "+totalMapCount+"...");
//		
//		map_hero_table = $(map_hero_row).find('table');
//		hero_keys = {};
//		$(map_hero_table).find('th').each(function(i) {
//			field_name = $(this).text().trim();
//			if (field_name) { hero_keys[field_name] = i; }
//		});
//		
//		heroes_data = {};
//		$(map_hero_table).find('tbody > tr').each(function(){
//			hero_data = {};
//			for (field in hero_keys) {
//				value = $(this).find('td').eq(hero_keys[field]).text().trim()
//				if (field == 'Hero') { hero_name = value; }
//				else if (field == 'Games Banned' || field == 'Games Played') { hero_data[field] = parseInt(value,10); }
//				else if (field == 'Win Percent') {
//					// toFixed corrects computer rounding errors, but returns a string, so is parsed again.
//					hero_data[field] = parseFloat((parseFloat(value)/100).toFixed(3));
//				}
//			}
//			heroes_data[hero_name] = hero_data;
//		});
//
//		document.dispatchEvent(new CustomEvent('Store_Map_Data', { 'detail': {
//			'map': map_name,
//			'heroes': heroes_data,
//			'timestamp': Date.now()
//		}}));
//	}
//	window.maps_parsed = true;
//}

window.curr_map_loading = -1;	// Currently working on map
window.last_map_loaded = -1;		// Last map loaded
load_map = function(idx) {
	window.curr_map_loading = idx;
	// Provide feedback
//	$('#HDH_StoreMapDataButton .lbl').text("Processing map "+(idx+1)+" of "+window.maps.length+": "+ window.maps[idx] + "...");
console.log("Loading map " + idx);

	// Open dropdown
	$('div#ctl00_MainContent_ComboBoxMapName button.rcbActionButton').click();
	
	// Select proper map
	wait_for_state(page_ready, function() {
		$('div#ctl00_MainContent_ComboBoxMapName_DropDown div.rcbScroll ul.rcbList li').find('input[type=checkbox]').each(function(index) {
			if (($(this).attr('checked') && (index != idx)) || (!$(this).attr('checked') && (index == idx))) {
				$(this).click();
			}
		});
	});
	
	// Close dropdown
	$('div#ctl00_MainContent_ComboBoxMapName button.rcbActionButton').click();
	
	// Map loaded!
	wait_for_state(page_ready, function() {
		window.last_map_loaded = idx;
		window.curr_map_loading = -1;
		parse_map(idx);
	}, 1000);
}

window.curr_map_parsing = -1;	// Currently working on map
window.last_map_parsed = -1;		// Last map parsed
window.total_maps_parsed = 0;		// Total maps parsed
parse_map = function(idx) {
	window.curr_map_parsing = idx;

	//Provide feedback
console.log("Parsing map " + idx);

	///TODO: actually parse & store the map data here

	window.curr_map_parsing = -1;
	window.total_maps_parsed = window.total_maps_parsed + 1;
	window.last_map_parsed = idx;
}

// Main recursive processing function
window.done_processing = false;
process_maps = function() {
	if (window.curr_map_loading == -1 && window.last_map_loaded == -1) {
		// We haven't even started yet.  Kick it off.
		load_map(0);
		
	} else if (window.curr_map_loading != -1) {
		// Waiting on a load, don't worry
	
	} else if (window.curr_map_parsing != -1) {
		// Waiting on a parse, don't worry
		
	} else if ((window.last_map_parsed == window.last_map_loaded) && (window.total_maps_parsed < window.maps.length)) {
		// Load the next map
		load_map(window.last_map_loaded + 1);
		
	} else {
		// All done!
		window.done_processing = true;
	}
	
	// Keep going until we're done
	wait_for_state(window.done_processing, process_maps(), 1000);
}

store_map_data = function() {
//	 Provide feedback
	$('#HDH_MapProcessingIcon').removeClass().addClass('fa fa-spinner fa-spin');
	$('#HDH_StoreMapDataButton .lbl').text("Processing...");
	$('#HDH_StoreMapDataButton').removeClass().addClass('btn btn-info disabled');
	
console.log("Selecting Hero League");
	$("div#ctl00_MainContent_DropDownGameMode_DropDown li:contains('Hero League')").click();
	
	wait_for_state(page_ready, function() {
		// Determine maps
console.log("Determining map list");
		window.maps = $('div#ctl00_MainContent_ComboBoxMapName_DropDown').find('label').toArray();
		
		// Start loading
console.log("Starting main map processing loop");
		process_maps();
	});
	
	// Wait to be done
	wait_for_state(
		// We're done when we've parsed all the maps
		function(){return window.done_processing;},
		function() {
			// Provide feedback
			$('#HDH_MapProcessingIcon').removeClass().addClass('fa fa-check');
			$('#HDH_StoreMapDataButton .lbl').text("Map Data Stored! (Click again to re-load data if you wish)");
			$('#HDH_StoreMapDataButton').removeClass().addClass('btn btn-success');
		},
		1000);
}
