let map_data = {};
let player_data = {};
let current_map = null;
let hero_names = [];
let hero_sub_roles = {};
let sub_role_classes = {};
let available_heroes = [];
let num_ban_suggestions = 10;
let num_player_suggestions = 8;
let num_general_suggestions = 10;

$(document).ready(function () {
    chrome.storage.sync.get(function (items) {
        console.log(items);
        let map_select = $('select#map');
        for (let key in items) {
            let key_type = key.split(':')[0];
            //console.log(key+" is a "+key_type);
            if (key_type === 'map') {
                let map_name = items[key].map;
                map_data[map_name] = items[key].heroes;
                map_select.append("<OPTION>" + map_name + "</OPTION>");
            } else if (key_type === 'player') {
                let player = items[key];
                player_data[player.ID] = player.heroes;
                $('select.player_select').append("<OPTION value='" + player.ID + "'>" + player.name + "</OPTION>");
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
        window.available_heroes = get_available_heroes();

        // Get ban suggestions
        update_ban_suggestions();

        // Get players suggestions
        update_players_suggestions();

        // Get general suggestions
        update_general_suggestions();
    }
}

function hero_display(name, score, data) {
    return `
<SPAN class="hero ${sub_role_classes[hero_sub_roles[name]]}" title="${hero_sub_roles[name]} data=${data}">
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
        display += hero_display(name, score.toFixed(0));
    }
    $('#suggested_bans').html(display);
}

function get_ban_suggestions() {
    let possible_bans = [];
    for (let i = 0, len = window.available_heroes.length; i < len; i++) {
        let hero = window.available_heroes[i];
        let m = map_data[current_map][hero];
        if (m) {
            let score = ( m['Games Banned'] + m['Games Played'] ) * m['Win Percent'];
            possible_bans.push({'hero': hero, 'score': score});
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
            for (let i = 0; i < num_player_suggestions; i++) {
                let hero = player_suggestions[i];
                let name = hero['hero'];
                let score = hero['score'];
                display += hero_display(name, score.toFixed(0));
            }
            $(this).closest('tr').find('.hero_suggestions').html(display);
        }
    });
}

function get_player_suggestions(player_id) {
    let possible_heroes = [];
    for (let i = 0, len = window.available_heroes.length; i < len; i++) {
        let hero = window.available_heroes[i];
        let m = map_data[current_map][hero];
        let p = player_data[player_id][hero];
        if (m && p && p['Win Percent']) {
            let player_confidence = ( p['Win Percent'] * p['Games Played'] + 1 ) / (p['Games Played'] + 2);
            let score = Math.pow(m['Win Percent'] * player_confidence, 1 / 2) * 10000;
            possible_heroes.push({'hero': hero, 'score': score});
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
        display += hero_display(name, score.toFixed(0));
    }
    $('#general_suggestions').html(display);
}

function get_general_suggestions() {
    let possible_heroes = [];
    for (let i = 0, len = window.available_heroes.length; i < len; i++) {
        let hero = window.available_heroes[i];
        let m = map_data[current_map][hero];
        if (m) {
            let score = m['Win Percent'] * 1000;
            possible_heroes.push({'hero': hero, 'score': score});
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

