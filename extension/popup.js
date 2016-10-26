$(document).ready(function(){
	var key_types = {};
	chrome.storage.sync.get(function(items) {
		for (key in items) {
			console.log(key);
			var key_type = key.split(':')[0];
			key_types[key_type] = (key_types[key_type] || 0) + 1;
		}

		console.log(key_types);
		var enable_draft_helper = true;

		if (key_types.player) {
			$('#num_players').text(key_types.player);
		} else {
			$('body').append('<BUTTON id=collect_player_data class=row>Collect Player Data</BUTTON>');
			$('#collect_player_data').click(function(){
				chrome.tabs.create({url: "http://www.hotslogs.com/Player/Profile"});
			});
			enable_draft_helper = false;
		}

		if(!key_types.map) {
			$('body').append('<BUTTON id=collect_map_data class=row>Collect Map Data</BUTTON>');
			$('#collect_map_data').click(function(){
				chrome.tabs.create({url: "http://www.hotslogs.com/Sitewide/HeroAndMapStatistics"});
			});
			enable_draft_helper = false;
		}

		if (!key_types.hero_sub_roles) {
			$('body').append('<BUTTON id=collect_role_data class=row>Collect Role Data</BUTTON>');
			$('#collect_role_data').click(function(){
				chrome.tabs.create({url: "http://www.hotslogs.com/Info/HeroSubRole"});
			});
		}

		if (enable_draft_helper) {
			$('body').append('<BUTTON id=draft_helper_button class=row>Open Draft Helper</BUTTON>');
			$('#draft_helper_button').click(function(){
				chrome.tabs.create({url: chrome.extension.getURL('helper/helper.html')});
			});
		}

	});

});
