let map_data = {};
let player_data = {};
let current_map = null;
let hero_names = [];
let hero_duos = {};
let hero_matchups = {};
let hero_sub_roles = {};
let sub_role_classes = {};
let available_heroes = [];
let ally_heroes = [];
let opponent_heroes = [];
let num_ban_suggestions = 10;
let num_player_suggestions = 8;
let num_general_suggestions = 10;
let significant_factor_threshold = .5;

$(document).ready(function () {
    chrome.storage.local.get(function (items) {
        console.log(items);
        let map_select = $('select#map');
        for (let key in items) {
            let key_type = key.split(':')[0];
            if (key_type === 'map') {
                let map_name = items[key].map;
                if (Object.keys(items[key].heroes).length) {
                    map_data[map_name] = items[key].heroes;
                    map_select.append(`<OPTION>${map_name}</OPTION>`);
                }
            } else if (key_type === 'player') {
                let player = items[key];
                player_data[player.ID] = player.heroes;
                $('select.player_select').append(`<OPTION value='${player.ID}'>${player.name}</OPTION>`);
            } else if (key_type === 'hero_sub_roles') {
                hero_sub_roles = items[key];
                for (let hero in hero_sub_roles) {
                    let role = hero_sub_roles[hero];
                    sub_role_classes[role] = role.replace(' ', '');
                }

                hero_names = Object.keys(hero_sub_roles);
                hero_names.sort();
                for (let i = 0, len = hero_names.length; i < len; i++) {
                    $('select.hero_select').append("<OPTION>" + hero_names[i] + "</OPTION>");
                }
            } else if (key_type === 'hero_details') {
                let hero_name = items[key].hero;
                if (Object.keys(items[key].duos).length) {
                    hero_duos[hero_name] = items[key].duos;
                }
                if (Object.keys(items[key].matchups).length) {
                    hero_matchups[hero_name] = items[key].matchups;
                }
            }
        }

        // Set current map whenever map is changed.
        map_select.change(function () {
            current_map = $(this).val();
        });

        $('select').change(function () {
            update_suggestions();
        });

    });
});

function update_suggestions() {
    if (current_map) {
        available_heroes = get_available_heroes();
        ally_heroes = get_team_heroes('ally');
        opponent_heroes = get_team_heroes('opponent');

        // Get ban suggestions
        update_ban_suggestions();

        // Get players suggestions
        update_players_suggestions();

        // Get general suggestions
        update_general_suggestions();
    }
}

function hero_display(name, score, factors) {
    let factor_string = '';
    if (factors.length) {
        factor_string = '; ' + factors.join(', ');
    }
    return `
<SPAN class="hero ${sub_role_classes[hero_sub_roles[name]]}" title="${hero_sub_roles[name]}${factor_string}">
    ${name} (${score})
</SPAN>
`;
}

function update_ban_suggestions() {
    let ban_suggestions = get_ban_suggestions();
    let display = "";
    for (let i = 0; i < num_ban_suggestions; i++) {
        let hero = ban_suggestions[i];
        let name = hero['hero'];
        let score = hero['score'];
        let factors = hero['factors'];
        display += hero_display(name, score.toFixed(0), factors);
    }
    $('#suggested_bans').html(display);
}

function get_ban_suggestions() {
    let possible_bans = [];
    for (let i = 0, len = available_heroes.length; i < len; i++) {
        let hero = available_heroes[i];
        let m = map_data[current_map][hero];
        if (m) {
            let score = ( m['Games Banned'] + m['Games Played'] ) * m['Win Percent'];
            let factors = [];
            if (m['Win Percent'] > significant_factor_threshold) {
                factors.push(`WR: ${Math.round(m['Win Percent'] * 100)}%`);
            }
            possible_bans.push({'hero': hero, 'score': score, 'factors': factors});
        }
    }
    possible_bans.sort(function (a, b) {
        return a['score'] - b['score'];
    });

    return possible_bans.reverse();
}

function update_players_suggestions() {
    $('select.player_select').each(function () {
        let player_id = $(this).val();
        if (player_id) {
            let player_suggestions = get_player_suggestions(player_id);
            let display = "";
            for (let i = 0, num = Math.min(num_player_suggestions, player_suggestions.length); i < num; i++) {
                let hero = player_suggestions[i];
                let name = hero['hero'];
                let score = hero['score'];
                let factors = hero['factors'];
                display += hero_display(name, score.toFixed(0), factors);
            }
            $(this).closest('tr').find('.hero_suggestions').html(display);
        }
    });
}

function confidence(win_percent, games_played) {
    return ( win_percent * games_played + 1 ) / ( games_played + 2 );
}

function get_player_suggestions(player_id) {
    let possible_heroes = [];
    for (let i = 0, len = available_heroes.length; i < len; i++) {
        let hero = available_heroes[i];
        let m = map_data[current_map][hero];
        let p = player_data[player_id][hero];
        let a = get_ally_score(hero);
        if (m && p && p['Win Percent']) {
            let player_confidence = confidence(p['Win Percent'], p['Games Played']);
            let score = Math.pow(m['Win Percent'] * player_confidence, 1 / 2) * 10000;
            let factors = [];
            if (p['Win Percent'] > significant_factor_threshold) {
                factors.push(`Player: ${Math.round(p['Win Percent'] * 100)}%`);
            }
            if (m['Win Percent'] > significant_factor_threshold) {
                factors.push(`Map: ${Math.round(p['Win Percent'] * 100)}%`);
            }
            possible_heroes.push({'hero': hero, 'score': score, 'factors': factors});
        }
    }
    possible_heroes.sort(function (a, b) {
        return a['score'] - b['score'];
    });

    return possible_heroes.reverse();
}

function update_general_suggestions() {
    let general_suggestions = get_general_suggestions();
    let display = "";
    for (let i = 0; i < num_general_suggestions; i++) {
        let hero = general_suggestions[i];
        let name = hero['hero'];
        let score = hero['score'];
        let factors = hero['factors'];
        display += hero_display(name, score.toFixed(0), factors);
    }
    $('#general_suggestions').html(display);
}

function get_general_suggestions() {
    let possible_heroes = [];
    for (let i = 0, len = available_heroes.length; i < len; i++) {
        let hero = available_heroes[i];
        let m = map_data[current_map][hero];
        if (m) {
            let score = m['Win Percent'] * 1000;
            let factors = [];
            if (m['Win Percent'] > significant_factor_threshold) {
                factors.push(`WR: ${Math.round(m['Win Percent'] * 100)}%`);
            }
            possible_heroes.push({'hero': hero, 'score': score, 'factors': factors});
        }
    }
    possible_heroes.sort(function (a, b) {
        return a['score'] - b['score'];
    });

    return possible_heroes.reverse();
}


function get_available_heroes() {
    let heroes = {};
    for (let i = 0, len = hero_names.length; i < len; i++) {
        heroes[hero_names[i]] = null;
    }

    $('select.hero_select').each(function () {
        let hero_name = $(this).val();
        if (hero_name) {
            delete heroes[hero_name];
        }
    });

    return Object.keys(heroes);
}

function get_team_heroes(class_name) {
    let team_heroes = [];
    $(`select.hero_select.${class_name}`).each(function () {
        let hero_name = $(this).val();
        if (hero_name) {
            team_heroes.push(hero_name);
        }
    });

    return team_heroes;
}

function get_ally_score(hero_name) {
    let ally_scores = [];
    for (let ally_hero of ally_heroes) {
    }
}
