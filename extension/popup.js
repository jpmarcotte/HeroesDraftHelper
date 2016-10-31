$(document).ready(function(){
	var key_types = {};
	var sub_role_count = 0;
	var data_errors = new Array();
	
	chrome.storage.sync.get(function(items) {
		for (key in items) {
			console.log(key);
			var key_type = key.split(':')[0];
			key_types[key_type] = (key_types[key_type] || 0) + 1;
			if (key == 'hero_sub_roles') { sub_role_count = key.length; }
		}

		console.log(key_types);
		var enable_draft_helper = true;

		if (key_types.player) {
			$('#num_players').text(key_types.player);
			if (key_types.player < 5) {
				$('#num_players').addClass('label-warning');
				data_errors.push({kind: "warning", msg: "You have fewer than a full party's Player data loaded."});
			} else {
				$('#num_players').addClass('label-default');
			}
		} else {
			$('#num_players').addClass('label-danger');
			data_errors.push({kind: "danger", msg: "You need to load at least one Player's data before usage."});
		}

		if(key_types.map) {
			$('#num_maps').text(key_types.map);
			$('#num_maps').addClass('label-default');
		} else {
			$('#num_maps').addClass('label-danger');
			data_errors.push({kind: "danger", msg: "You need to load maps data before usage."});
		}

		if (key_types.hero_sub_roles) {
			$('#num_herosubs').text(sub_role_count);
			$('#num_herosubs').addClass('label-default');
		} else {
			$('#num_herosubs').addClass('label-danger');
			data_errors.push({kind: "danger", msg: "You need to load Hero Sub-roles before usage."});
		}
		
		var html;
		
		if (data_errors.length > 0) {
			html = 
				html = `
					<div class="row">
						<div class="col-xs-12">`;
			data_errors.forEach(function(error) {
				html += `
							<div class="alert alert-` + error['kind'] + `">
								` + error['msg'] + `
							</div>`;
				if (error['kind'] == 'danger') {
					enable_draft_helper = false;
				}
			});
			html += `
						</div>
					</div>`;
			$('#messages').append(html);
		}

		if (enable_draft_helper) {
			html = `
				<div class="row">
					<div class="col-xs-6">
						You are good to go!
					</div>
					<div class="col-xs-6">
						<button id="draft_helper_button" type="button" class="btn btn-success">Open Draft Helper</button>
					</div>
				</div>`;
			$('body').append(html);
			$('#draft_helper_button').click(function(){
				chrome.tabs.create({url: chrome.extension.getURL('helper/helper.html')});
			});
		}

	});
	
	$('#collect_player_data').click(function(){
		chrome.tabs.create({url: "http://www.hotslogs.com/Player/Profile"});
	});
	$('#collect_map_data').click(function(){
		chrome.tabs.create({url: "http://www.hotslogs.com/Sitewide/HeroAndMapStatistics"});
	});
	$('#collect_role_data').click(function(){
		chrome.tabs.create({url: "http://www.hotslogs.com/Info/HeroSubRole"});
	});

});
