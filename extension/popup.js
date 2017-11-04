$(document).ready(function () {
    let key_types = {};
    let sub_role_count = 0;
    let hero_detail_count = 0;
    let data_errors = [];

    chrome.storage.local.get(function (items) {
        for (key in items) {
            console.log(key);
            let key_type = key.split(':')[0];
            key_types[key_type] = (key_types[key_type] || 0) + 1;
            if (key === 'hero_sub_roles') {
                sub_role_count = Object.keys(items[key]).length;
            } else if (key === 'hero_details') {
                hero_detail_count = Object.keys(items[key]).length;
            }
        }

        //console.log(key_types);
        let enable_draft_helper = true;

        let numPlayers = $('#num_players');
        if (key_types.player) {
            numPlayers.text(key_types.player);
            if (key_types.player < 5) {
                numPlayers.addClass('label-warning');
                data_errors.push({
                    kind: "warning",
                    msg: "<span class='glyphicon glyphicon-exclamation-sign'></span> You have fewer than a full party's Player data loaded.  Do you need to Collect your teammates' data?"
                });
            } else {
                numPlayers.addClass('label-primary');
            }
        } else {
            numPlayers.addClass('label-danger');
            data_errors.push({kind: "danger", msg: "You need to load at least one Player's data before usage."});
        }

        let numMaps = $('#num_maps');
        if (key_types.map) {
            numMaps.text(key_types.map);
            numMaps.addClass('label-primary');
        } else {
            numMaps.addClass('label-danger');
            data_errors.push({kind: "danger", msg: "You need to load maps data before usage."});
        }

        let numHerosubs = $('#num_herosubs');
        if (key_types.hero_sub_roles) {
            numHerosubs.text(sub_role_count);
            numHerosubs.addClass('label-primary');
        } else {
            numHerosubs.addClass('label-danger');
            data_errors.push({kind: "danger", msg: "You need to load Heroes/Roles data before usage."});
        }

        let numHeroDetails = $('#num_hero_details');
        if (key_types.hero_details) {
            numHeroDetails.text(hero_detail_count);
            numHeroDetails.addClass('label-primary');
        } else {
            numHeroDetails.addClass('label-warning');
            data_errors.push({kind: "warning", msg: "You need to load Hero Details before usage."})
        }

        let html = '';

        if (data_errors.length > 0) {
            html += `
					<div class="row">
						<div class="col-xs-12">`;
            data_errors.forEach(function (error) {
                html += `
							<div class="alert alert-` + error['kind'] + `">
								` + error['msg'] + `
							</div>`;
                if (error['kind'] === 'danger') {
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
            $('#draft_helper_button').click(function () {
                chrome.tabs.create({url: chrome.extension.getURL('helper/helper.html')});
            });
        }

    });

    $('button.collect-data').click(function () {
        chrome.tabs.update({url: this.parentNode.href});
    });

});
