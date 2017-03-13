var map_data = {};
var form = this;
var player_data = {};
var current_map = null;
var hero_names = [];
var hero_sub_roles = {};
var sub_role_classes = {};
var available_heroes = [];
var num_ban_suggestions = 10;
var num_player_suggestions = 8;
var num_general_suggestions = 10;

$(document).ready(function() {
	chrome.storage.sync.get(function(items) {
		console.log(items);
		for (key in items) {
			key_type = key.split(':')[0];
			//console.log(key+" is a "+key_type);
			if (key_type == 'map') {
				map_name = items[key].map;
				map_data[map_name] = items[key].heroes;
				$('select#map').append("<OPTION>"+map_name+"</OPTION>");
			} else if (key_type == 'player') {
				player = items[key];
				player_data[player.ID] = player.heroes;
				$('select.player_select').append("<OPTION value='"+player.ID+"'>"+player.name+"</OPTION>");
			} else if (key_type == 'hero_sub_roles') {
				hero_sub_roles = items[key];
				for (hero in hero_sub_roles) {
					role = hero_sub_roles[hero];
					sub_role_classes[role] = role.replace(' ','');
				}

				hero_names = Object.keys(hero_sub_roles);
				hero_names.sort();
				for (var i = 0, len = hero_names.length; i < len; i++) {
					$('select.hero_select').append("<OPTION>"+hero_names[i]+"</OPTION>");
				}
			}
		}

		// Set current map whenever map is changed.
		$('select#map').change(function(){
			current_map = $(this).val();
		});

		$('select').change(function() {
			update_suggestions();
		});

	});
});

function update_suggestions() {
	if (current_map) {
		window.available_heroes = get_available_heroes();

		// Get ban suggestions
		update_ban_suggestions();

		// Get players suggestions
		update_players_suggestions();

		// Get general suggestions
		update_general_suggestions();
	}
}

function hero_display(name, score) {
	return '<SPAN class="hero '+sub_role_classes[hero_sub_roles[name]]+'" title="'+hero_sub_roles[name]+'">'+ name + ' (' + score + ')</SPAN>';
}

function update_ban_suggestions() {
	ban_suggestions = get_ban_suggestions();
	display = "";
	for (var i = 0; i < num_ban_suggestions; i++) {
		hero = ban_suggestions[i];
		name = hero['hero'];
		score = hero['score'];
		display += hero_display(name,score.toFixed(0));
	}
	$('#suggested_bans').html(display);
}

function get_ban_suggestions() {
	possible_bans = [];
	for (var i=0, len=window.available_heroes.length; i < len; i++) {
		hero = window.available_heroes[i];
		if (m = map_data[current_map][hero]) {
			score = ( m['Games Banned'] + m['Games Played'] ) * m['Win Percent'] ;
			possible_bans.push({'hero':hero, 'score':score});
		}
	}
	possible_bans.sort(function(a,b){
		return a['score'] - b['score'];
	});

	return possible_bans.reverse();
}

function update_players_suggestions() {
	$('select.player_select').each(function(){
		if (player_id = $(this).val()) {
			player_suggestions = get_player_suggestions(player_id);
			display = "";
			for (var i = 0; i < num_player_suggestions; i++) {
				hero = player_suggestions[i];
				name = hero['hero'];
				score = hero['score'];
				display += hero_display(name,score.toFixed(0));
			}
			$(this).closest('tr').find('.hero_suggestions').html(display);
		}
	});
}

function get_player_suggestions(player_id) {
	possible_heroes = [];
	for (var i=0, len=window.available_heroes.length; i < len; i++) {
		hero = window.available_heroes[i]
		m = map_data[current_map][hero]
		p = player_data[player_id][hero]
		if (m && p && p['Win Percent']) {
			player_confidence = ( p['Win Percent'] * p['Games Played'] - 1 ) / (p['Games Played'] + 1);
			score = Math.pow( m['Win Percent'] * player_confidence, 1/2 ) * 1000
			possible_heroes.push({'hero':hero, 'score':score});
		}
	}
	possible_heroes.sort(function(a,b){
		return a['score'] - b['score'];
	});

	return possible_heroes.reverse();
}

function update_general_suggestions() {
	general_suggestions = get_general_suggestions();
	display = "";
	for (var i = 0; i < num_general_suggestions; i++) {
		hero = general_suggestions[i];
		name = hero['hero'];
		score = hero['score'];
		display += hero_display(name,score.toFixed(0));
	}
	$('#general_suggestions').html(display);
}

function get_general_suggestions() {
	possible_heroes = [];
	for (var i=0, len=window.available_heroes.length; i < len; i++) {
		hero = window.available_heroes[i];
		if (m = map_data[current_map][hero]) {
			score = m['Win Percent'] * 10000;
			possible_heroes.push({'hero':hero, 'score':score});
		}
	}
	possible_heroes.sort(function(a,b){
		return a['score'] - b['score'];
	});

	return possible_heroes.reverse();
}


function get_available_heroes() {
	heroes = {};
	for (var i = 0, len = hero_names.length; i < len; i++) {
		heroes[hero_names[i]] = null;
	}

	$('select.hero_select').each(function(){
		if ( hero_name = $(this).val() ) {
			delete heroes[hero_name];
		}
	});

	return Object.keys(heroes);
}

