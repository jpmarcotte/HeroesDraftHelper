var map_data = {};
var form = this;
var player_data = {};
var current_map = null;
var hero_names = [];
var hero_sub_roles = {};
var sub_role_classes = {};
var num_ban_suggestions = 10;
var num_player_suggestions = 4;

function load_player_data(player_id) {
	$('#load_player_message').text('');
	$.ajax({
		dataType: 'json',
		url: '../data/players/'+player_id+'.JSON',
		success: function(data) {
			$('#load_player_message').text('Successfully loaded player data.');
			if (player_data[player_id] == undefined) {
				$('select.player_select').append("<OPTION value='"+player_id+"'>"+player_id+"</OPTION>");
			}
			player_data[player_id] = data;
		},
		error: function() {
			$('#load_player_message').text('Could not load player data.');
		}
	});
}

$(document).ready(function() {
	// Load Player functionality
	$('form#load_player_form').submit(function(e){
		e.preventDefault();
		var player_id = this.player_region.value + "_" + this.bt_name.value + "_" + this.bt_number.value;
		load_player_data(player_id);
	});

	// Set current map whenever map is changed.
	$('select#map').change(function(){
		current_map = $(this).val();
	});

	$('select').change(function() {
		update_suggestions();
	});

	$.getJSON(
		'../data/hero_sub_roles.json',
		function(data) {
			window.hero_sub_roles = data;
			for (hero in data) {
				role = data[hero];
				sub_role_classes[role] = role.replace(' ','');
			}
		}
	);

	$.getJSON(
		'../data/players/player_list.JSON',
		function(data) {
			for (var i = 0, len = data.length; i < len; i++) {
				load_player_data(data[i]);
			}
		}
	);

	// Load map data
	$.getJSON(
		'../data/maps/map_data.json',
		function(data) {
			window.map_data = data;
			for ( map_name in map_data ) {
				$('select#map').append("<OPTION>"+map_name+"</OPTION>");
			}
			for ( hero_name in map_data[map_name] ) {
				hero_names.push(hero_name);
			}
			hero_names.sort();
			for (var i = 0, len = hero_names.length; i < len; i++) {
				$('select.hero_select').append("<OPTION>"+hero_names[i]+"</OPTION>");
			}
		}
	);
});

function update_suggestions() {
	if (current_map) {
		// Get ban suggestions
		update_ban_suggestions();

		// Get players suggestions
		update_players_suggestions();
	} else {
		alert('Please select a map.');
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
	console.log(display);
	$('#suggested_bans').html(display);
}

function get_ban_suggestions() {
	available_heroes = get_available_heroes();
	possible_bans = [];
	for (var i=0, len=available_heroes.length; i < len; i++) {
		hero = available_heroes[i];
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
			for (var i = 0, num = Math.min(num_player_suggestions, player_suggestions.length); i < num; i++) {
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
	available_heroes = get_available_heroes();
	possible_heroes = [];
	for (var i=0, len=available_heroes.length; i < len; i++) {
		hero = available_heroes[i]
		m = map_data[current_map][hero]
		p = player_data[player_id][hero]
		if (m && p && p['Win Percent']) {
			player_confidence = ( p['Win Percent'] * p['Games Played'] - 1 ) / (p['Games Played'] + 1);
			score = Math.pow( m['Win Percent'] * player_confidence, 1/2 ) * 100
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

