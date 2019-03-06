wait_for_state = function(test, execute, interval = 100) {
	if (test()) { execute(); }
	else { setTimeout(function(){ wait_for_state(test, execute, interval); }, interval); }
};

page_ready = function() { return !$('div.RadAjax').is(':visible'); };

set_defaults = function() {
	window.curr_map_loading		= -1;	// Currently working on map
	window.last_map_loaded		= -1;	// Last map loaded
	window.curr_map_parsing		= -1;	// Currently working on map
	window.last_map_parsed		= -1;	// Last map parsed
	window.total_maps_parsed	= 0;	// Total maps parsed
	window.done_processing		= false;
};

load_map = function(idx) {
	window.curr_map_loading = idx;
	// Provide feedback
	$('#HDH_StoreMapDataButton .lbl').text("Processing map "+(idx+1)+" of "+window.maps.length+": "+ window.maps[idx] + "...");
//console.log("Loading map " + idx);

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
};

parse_int = function(string) {
    return parseInt(string.replace(/\D/g, ''), 10);
};

parse_map = function(idx) {
	window.curr_map_parsing = idx;

	//Provide feedback
//console.log("Parsing map " + idx + ": " + window.maps[idx]);
	$('#HDH_StoreMapDataButton .lbl').text("Processing map "+(idx+1)+" of "+window.maps.length+"...");

	///TODO: check data parsing
	map_name = window.maps[idx];
//console.log(map_name);
	
	map_hero_table = $('div#RadGridCharacterStatistics').find('table.rgMasterTable');
//console.log(map_hero_table);
	hero_keys = {};
	$(map_hero_table).find('thead > tr > th').each(function(i) {
		field_name = $(this).text().trim();
		if (field_name) { hero_keys[field_name] = i; }
	});
	
	heroes_data = {};
	hero_rows = $(map_hero_table).find('tbody > tr').each(function(){
		hero_data = {};
		for (field in hero_keys) {
			value = $(this).find('td').eq(hero_keys[field]).text().trim();
			if (field === 'Hero') { hero_name = value; }
			else if (field === 'Games Banned' || field === 'Games Played') { hero_data[field] = parse_int(value,10); }
			else if (field === 'Win Percent' || field === 'Popularity') {
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


	window.curr_map_parsing = -1;
	window.total_maps_parsed = window.total_maps_parsed + 1;
	window.last_map_parsed = idx;
	process_maps();
};

// Main recursive processing function
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
};

store_map_data = function() {
	set_defaults();
//	 Provide feedback
	$('#HDH_MapProcessingIcon').removeClass().addClass('fa fa-spinner fa-spin');
	$('#HDH_StoreMapDataButton .lbl').text("Processing...");
	$('#HDH_StoreMapDataButton').removeClass().addClass('btn btn-info disabled');
	
//console.log("Selecting Hero League");
	if ($("div#ctl00_MainContent_DropDownGameMode_DropDown li.rddlItemSelected:contains('Hero League')").length == 0) {
		$("div#ctl00_MainContent_DropDownGameMode_DropDown li:contains('Hero League')").click();
	}
	
	wait_for_state(page_ready, function() {
		// Determine maps
//console.log("Determining map list");
		window.maps = $("div#ctl00_MainContent_ComboBoxMapName_DropDown").find("label").map(function() {
		                 return $(this).text().trim();
		              }).get();
		
		// Start loading
//console.log("Starting main map processing loop");
		process_maps();
	});
	
	// Wait to be done
	wait_for_state(
		// We're done when we've parsed all the maps
		function(){return window.done_processing;},
		function() {
			// Provide feedback
//console.log("Finished All Maps");
			$('#HDH_MapProcessingIcon').removeClass().addClass('fa fa-check');
			$('#HDH_StoreMapDataButton .lbl').text("Map Data Stored! (Click again to re-load data if you wish)");
			$('#HDH_StoreMapDataButton').removeClass().addClass('btn btn-success');
			
			// Reset defaults in case they want to run it again
			set_defaults();
		},
		1000);
};
