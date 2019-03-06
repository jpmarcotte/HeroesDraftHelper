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
  var map_hero_table = $('table#ctl00_MainContent_RadGridCharacterStatistics_ctl00');
  hero_keys = {};
  $(map_hero_table).find('th').each(function(i) {
    field_name = $(this).text().trim();
    if (field_name) { hero_keys[field_name] = i; }
  });

  heroes_data = {};
  $(map_hero_table).find('tbody > tr').each(function(){
    hero_data = {};
    for (field in hero_keys) {
      value = $(this).find('td').eq(hero_keys[field]).text().trim()
      if (field == 'Hero') { hero_name = value; }
      else if (field == 'Games Played') { hero_data[field] = parse_int(value); }
      else if (field == 'Win Percent') {
        // toFixed corrects computer rounding errors, but returns a string, so is parsed again.
        hero_data[field] = parseFloat((parseFloat(value)/100).toFixed(3));
      }
    }
    if (hero_data['Games Played'] >= 5) {
      heroes_data[hero_name] = hero_data;
    } // else gnore heroes that don't have enough games played.
  });

  player_data = {
    'heroes': heroes_data,
    'ID': urlParams['PlayerID'],
    'name': $('h1.section-title').text().split(': ')[1],
    'timestamp': Date.now()
  };

  window.profile_parsed = true;
  return player_data;
};


$('#h1Title').append(`
	<button id="HDH_StorePlayerDataButton" type="button" class="btn btn-primary" style="margin-bottom:10px;" onclick="store_player_data()">
		<i id="HDH_PlayerProcessingIcon" class="fa fa-download"></i>
		<span class="lbl">Store Player Data for Heroes Draft Helper</span>
	</button>`
);

document.addEventListener('Get_Player_Data', function(e) {
	chrome.storage.local.get(
		'player:'+e.detail.ID,
		function(items) {
			console.log(items);
		}
	);
});

document.addEventListener('Store_Player_Data', function(e) {
	console.log("Storing Data for "+e.detail.name);
	data = {};
	data["player:"+e.detail.ID] = e.detail;
	chrome.storage.local.set(data);
});
