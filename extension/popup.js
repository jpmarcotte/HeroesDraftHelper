$(document).ready(function(){
	var key_types = {};
	var sub_role_count = 0;
	var hero_detail_count = 0;
    var data_errors = new Array();
	
	chrome.storage.local.get(function(items) {
		for (key in items) {
			console.log(key);
			var key_type = key.split(':')[0];
			key_types[key_type] = (key_types[key_type] || 0) + 1;
			if (key == 'hero_sub_roles') {
				sub_role_count = Object.keys(items[key]).length;
			} else if (key == 'hero_details') {
				hero_detail_count = Object.keys(items[key]).length;
			}
		}

		//console.log(key_types);
		var enable_draft_helper = true;

		if (key_types.player) {
			$('#num_players').text(key_types.player);
			if (key_types.player < 5) {
				$('#num_players').addClass('label-warning');
				data_errors.push({kind: "warning", msg: "<span class='glyphicon glyphicon-exclamation-sign'></span> You have fewer than a full party's Player data loaded.  Do you need to Collect your teammates' data?"});
			} else {
				$('#num_players').addClass('label-primary');
			}
		} else {
			$('#num_players').addClass('label-danger');
			data_errors.push({kind: "danger", msg: "You need to load at least one Player's data before usage."});
		}

		if(key_types.map) {
			$('#num_maps').text(key_types.map);
			$('#num_maps').addClass('label-primary');
		} else {
			$('#num_maps').addClass('label-danger');
			data_errors.push({kind: "danger", msg: "You need to load maps data before usage."});
		}

		if (key_types.hero_sub_roles) {
			$('#num_herosubs').text(sub_role_count);
			$('#num_herosubs').addClass('label-primary');
		} else {
			$('#num_herosubs').addClass('label-danger');
			data_errors.push({kind: "danger", msg: "You need to load Heroes/Roles data before usage."});
		}

		if (key_types.hero_details) {
			$('#num_hero_details').text(hero_detail_count);
			$('#num_hero_details').addClass('label-primary');
		} else {
			$('#num_hero_details').addClass('label-warning');
			data_errors.push({kind: "warning", msg: "You need to load Hero Details before usage."})
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
					<div class="col-xs-12 text-center">
						<button id="draft_helper_button" type="button" class="btn btn-success">Open Draft Helper</button>
					</div>
				</div>`;
			$('body').append(html);
			$('#draft_helper_button').click(function(){
				chrome.tabs.create({url: chrome.extension.getURL('helper/helper.html')});
			});
		}

	});
	
	$('button.collect-data').click(function(){
		chrome.tabs.update({url: this.parentNode.href});
	});

});
