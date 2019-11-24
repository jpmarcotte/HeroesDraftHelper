// I hate having to duplicate this function from scrape_map_data.js but I haven't yet figured out
// how to put it in a common file for inclusion.
wait_for_state = function(test, execute, interval = 100) {
	if (test()) { execute(); }
	else { setTimeout(function(){ wait_for_state(test, execute, interval); }, interval); }
};

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

parse_int = function(string) {
    return parseInt(string.replace(/\D/g, ''), 10);
};

var profile_parsed = false;
var store_player_data = function() {
	// Provide feedback
	$('#HDH_PlayerProcessingIcon').removeClass().addClass('fa fa-spinner fa-spin');
	$('#HDH_StorePlayerDataButton .lbl').text("Processing...");
	$('#HDH_StorePlayerDataButton').removeClass().addClass('btn btn-info disabled');
	
	
	// Go collect & store the data
	document.dispatchEvent(new CustomEvent('Store_Player_Data', {
		'detail': collect_player_data()
	}));
	
	// Provide feedback
	wait_for_state(
		function(){return window.profile_parsed;},
		function() {
			$('#HDH_PlayerProcessingIcon').removeClass().addClass('fa fa-check');
			$('#HDH_StorePlayerDataButton .lbl').text("Profile Data Stored! (Click again to re-load data if you wish)");
			$('#HDH_StorePlayerDataButton').removeClass().addClass('btn btn-success');
		},
		1000);
};

var collect_player_data = function() {
	var map_hero_table = $('table#hero_chart');
	hero_keys = {};
	$(map_hero_table).find('th').each(function(i) {
		field_name = this.id;
		if (field_name) { hero_keys[field_name] = i; }
	});

	heroes_data = {};
	$(map_hero_table).find('tbody > tr').each(function(){
		hero_data = {};
		for (field in hero_keys) {
			value = $(this).find('td').eq(hero_keys[field]).text().trim()
			if (field == 'hero_column') { hero_name = value; }
			else if (field == 'games_played_column') { hero_data['Games Played'] = parse_int(value); }
			else if (field == 'win_rate_column') {
				// toFixed corrects computer rounding errors, but returns a string, so is parsed again.
				hero_data['Win Percent'] = parseFloat((parseFloat(value)/100).toFixed(3));
			}
			// TODO: Figure out something to do with these. Don't store until we do, though.
			// else if (field == 'qm_mmr_column') { hero_data['QM MMR'] = parse_int(value); }
			// else if (field == 'ud_mmr_column') { hero_data['UD MMR'] = parse_int(value); }
			// else if (field == 'hl_mmr_column') { hero_data['HL MMR'] = parse_int(value); }
			// else if (field == 'tl_mmr_column') { hero_data['TL MMR'] = parse_int(value); }
			// else if (field == 'sl_mmr_column') { hero_data['SL MMR'] = parse_int(value); }
		}

		heroes_data[hero_name] = hero_data;
	});

	player_data = {
		'heroes': heroes_data,
		'ID': urlParams['blizz_id'],
		'name': urlParams['battletag'],
		'timestamp': Date.now()
	};

	window.profile_parsed = true;
	return player_data;
};
