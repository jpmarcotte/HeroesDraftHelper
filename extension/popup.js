function fetch_hero_details(hero_name, api_key) {
    console.log("Fetching Hero " + hero_name);
    $.get(
        'https://api.heroesprofile.com/api/Heroes/Matchups',
        {
            "api_token": api_key,
            "mode": "json",
            "timeframe_type": "major",
            "timeframe": 2.48,
            "game_type": "Storm League",
            "group_by_map": false,
            "hero": hero_name
        },
        function (response) {
            console.log(response);
            hero_data = {
                "duos": {},
                "matchups": {}
            };
            for (matched_hero in response[hero_name]) {
                hero_data["duos"][matched_hero] = response[hero_name][matched_hero]["ally"];
                hero_data["matchups"][matched_hero] = response[hero_name][matched_hero]["enemy"];
            }
            data = {};
            data['hero_details:' + hero_name] = hero_data;
            chrome.storage.local.set(data);

            let hero_details_fetched = $('span#num_hero_details_fetched');
            hero_details_fetched.text(
                parseInt(hero_details_fetched.text(), 10) + 1
            );
        }
    );
}

$(document).ready(function () {
    let key_type_counts = {};
    let sub_role_count = 0;
    let hero_detail_count = 0;
    let data_errors = [];
    let api_key = '';
    let heroes_to_fetch = [];

    chrome.storage.local.get(function (items) {
        api_key = items['api_keys:heroes_profile'];

        $('#api_key_heroes_profile').val(api_key);

        for (key in items) {
            console.log(key);
            let key_type = key.split(':')[0];
            key_type_counts[key_type] = (key_type_counts[key_type] || 0) + 1;
            if (key === 'hero_sub_roles') {
                sub_role_count = Object.keys(items[key]).length;
            }
        }

        console.log(key_type_counts);
        let enable_draft_helper = true;

        let numPlayers = $('#num_players');
        if (key_type_counts.player) {
            numPlayers.text(key_type_counts.player);
            if (key_type_counts.player < 5) {
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
        if (key_type_counts.map) {
            numMaps.text(key_type_counts.map);
            numMaps.addClass('label-primary');
        } else {
            numMaps.addClass('label-danger');
            data_errors.push({kind: "danger", msg: "You need to load maps data before usage."});
        }

        let numHerosubs = $('#num_herosubs');
        if (key_type_counts.hero_sub_roles) {
            numHerosubs.text(sub_role_count);
            numHerosubs.addClass('label-primary');
        } else {
            numHerosubs.addClass('label-danger');
            data_errors.push({kind: "danger", msg: "You need to load Heroes/Roles data before usage."});
        }

        let numHeroDetails = $('#num_hero_details');
        if (key_type_counts.hero_details) {
            numHeroDetails.text(key_type_counts.hero_details);
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

    $('button#api_save_button_heroes_profile').click(function () {
        var api_key = document.getElementById('api_key_heroes_profile').value;
        chrome.storage.local.set({"api_keys:heroes_profile": api_key});
    });

    $('button#collect_map_data').click(function () {
        $.get(
            'https://api.heroesprofile.com/api/Heroes/Stats',
            {
                "api_token": api_key,
                "mode": "json",
                "timeframe_type": "major",
                "timeframe": "2.48",
                "game_type": "Storm League",
                "group_by_map": true
            },
            function (response) {
                console.log(response);
                for (map_name in response) {
                    for (hero in response[map_name]) {
                        response[map_name][hero]["ban_rate"] = response[map_name][hero]["ban_rate"] / 100;
                        response[map_name][hero]["pick_rate"] = response[map_name][hero]["pick_rate"] / 100;
                        response[map_name][hero]["popularity"] = response[map_name][hero]["popularity"] / 100;
                        response[map_name][hero]["win_rate"] = response[map_name][hero]["win_rate"] / 100;
                    }
                    data = {};
                    data['map:' + map_name] = response[map_name]
                    chrome.storage.local.set(data);
                }
            }
        )
    });

    $('button#collect_role_data').click(function () {
        $.get(
            'https://api.heroesprofile.com/api/Heroes',
            {
                "api_token": api_key,
                "mode": "json",
            },
            function (response) {
                console.log(response);
                data = {};
                for (hero_name in response) {
                    data[hero_name] = {
                        "old_role": response[hero_name]["role"],
                        "new_role": response[hero_name]["new_role"],
                        "type": response[hero_name]["type"]
                    }
                }
                chrome.storage.local.set({"hero_sub_roles": data});
            }
        )
    });

    $('button#collect_hero_detail_data').click(function () {
        let hero_details_fetched = $('span#num_hero_details_fetched');
        chrome.storage.local.get('hero_sub_roles', function (items) {
            console.log(items['hero_sub_roles']);
            hero_details_fetched.text(0);
            $('span#num_hero_details_total').text(Object.keys(items['hero_sub_roles']).length);
            $('span#hero_details_summary').show();

            heroes_to_fetch = Object.keys(items['hero_sub_roles']);

            setInterval(function () {
                if (heroes_to_fetch.length > 0) {
                    hero_name = heroes_to_fetch.shift();
                    fetch_hero_details(hero_name, api_key);
                }
            }, 2100);
        })
    });
});

