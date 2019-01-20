wait_for_state = function (test, execute, interval = 100) {
  if (test()) {
    execute();
  }
  else {
    setTimeout(function () {
      wait_for_state(test, execute, interval);
    }, interval);
  }
};

parse_int = function(string) {
  return parseInt(string.replace(/\D/g, ''), 10);
};

page_ready = function () {
  return !$('div.RadAjax').is(':visible');
};

set_defaults = function () {
  window.curr_hero_loading = -1;	// Currently working on hero
  window.last_hero_loaded = -1;	// Last hero loaded
  window.curr_hero_parsing = -1;	// Currently working on hero
  window.last_hero_parsed = -1;	// Last hero parsed
  window.total_heroes_parsed = 0;	// Total heroes parsed
  window.done_processing = false;
};

load_hero = function (index) {
  window.curr_hero_loading = index;
  // Provide feedback
  $('#HDH_StoreHeroDetailsButton .lbl').text("Processing hero " + (index + 1) + " of " + window.heroes.length + ": " + window.heroes[index] + "...");
//console.log("Loading hero " + index);

  // Select proper hero
  $("div#ctl00_MainContent_DropDownHero_DropDown li").eq(index).click();

  // Hero loaded!
  wait_for_state(page_ready, function () {
    window.last_hero_loaded = index;
    window.curr_hero_loading = -1;
    parse_hero(index);
  }, 1000);
};

parse_hero = function (index) {
  window.curr_hero_parsing = index;

  //Provide feedback
  // console.log("Parsing hero " + index + ": " + window.heroes[index]);
  $('#HDH_StoreHeroDetailsButton .lbl').text("Processing hero " + (index + 1) + " of " + window.heroes.length + "...");

  hero_name = window.heroes[index];
  // console.log(hero_name);

  // Get Matchups Data
  hero_matchups_table = $('div#RadGridSitewideCharacterWinPercentVsOtherCharacters').find('table.rgMasterTable');
  // console.log(hero_matchups_table);
  matchup_keys = {};
  $(hero_matchups_table).find('thead > tr > th').each(function (i) {
    field_name = $(this).text().trim();
    if (field_name) {
      matchup_keys[field_name] = i;
    }
  });
  matchups_data = {};
  matchup_rows = $(hero_matchups_table).find('tbody > tr').each(function() {
    matchup_data = {};
    for (field in matchup_keys) {
      value = $(this).find('td').eq(matchup_keys[field]).text().trim();
      if (field === 'Opposing Hero') {
        matchup_name = value;
      } else if (field === 'Games Played Against') {
        matchup_data[field] = parse_int(value);
      } else if (field === 'Win Percent Against') {
        // toFixed corrects computer rounding errors, but returns a string, so is parsed again.
        matchup_data[field] = parseFloat((parseFloat(value) / 100).toFixed(3));
      }
    }
    matchups_data[matchup_name] = matchup_data;
  });

  // Get Duos Data
  hero_duos_table = $('div#RadGridSitewideCharacterWinPercentWithOtherCharacters').find('table.rgMasterTable');
  // console.log(hero_duos_table);
  duos_keys = {};
  $(hero_duos_table).find('thead > tr > th').each(function (i) {
    field_name = $(this).text().trim();
    if (field_name) {
      duos_keys[field_name] = i;
    }
  });
  duos_data = {};
  duo_rows = $(hero_duos_table).find('tbody > tr').each(function() {
    duo_data = {};
    for (field in duos_keys) {
      value = $(this).find('td').eq(duos_keys[field]).text().trim();
      if (field === 'Team Hero') {
        duo_name = value;
      } else if (field === 'Games Played With') {
        duo_data[field] = parse_int(value);
      } else if (field === 'Win Percent With') {
        // toFixed corrects computer rounding errors, but returns a string, so is parsed again.
        duo_data[field] = parseFloat((parseFloat(value) / 100).toFixed(3));
      }
    }
    duos_data[duo_name] = duo_data;
  });


  document.dispatchEvent(new CustomEvent('Store_Hero_Details', {
    'detail': {
      'hero': hero_name,
      'duos': duos_data,
      'matchups': matchups_data,
      'timestamp': Date.now()
    }
  }));


  window.curr_hero_parsing = -1;
  window.total_heroes_parsed = window.total_heroes_parsed + 1;
  window.last_hero_parsed = index;
  process_heroes();
};

// Main recursive processing function
process_heroes = function () {
  if (window.curr_hero_loading === -1 && window.last_hero_loaded === -1) {
    // We haven't even started yet.  Kick it off.
    load_hero(0);

  } else if (window.curr_hero_loading !== -1) {
    // Waiting on a load, don't worry

  } else if (window.curr_hero_parsing !== -1) {
    // Waiting on a parse, don't worry

  } else if ((window.last_hero_parsed === window.last_hero_loaded) && (window.total_heroes_parsed < window.heroes.length)) {
    // Load the next hero
    load_hero(window.last_hero_loaded + 1);

  } else {
    // All done!
    window.done_processing = true;
  }
};

store_hero_details = function () {
  set_defaults();
//	 Provide feedback
  $('#HDH_HeroProcessingIcon').removeClass().addClass('fa fa-spinner fa-spin');
  $('#HDH_StoreHeroDetailsButton .lbl').text("Processing...");
  $('#HDH_StoreHeroDetailsButton').removeClass().addClass('btn btn-info disabled');

//console.log("Selecting Hero League");
  if ($("div#ctl00_MainContent_DropDownGameMode_DropDown li.rddlItemSelected:contains('Hero League')").length == 0) {
    $("div#ctl00_MainContent_DropDownGameMode_DropDown li:contains('Hero League')").click();
  }

  wait_for_state(page_ready, function () {
    // Determine heroes
//console.log("Determining hero list");
    window.heroes = $("div#ctl00_MainContent_DropDownHero_DropDown").find("li").map(function () {
      return $(this).text().trim();
    });

    // Start loading
//console.log("Starting main hero processing loop");
    process_heroes();
  });

  // Wait to be done
  wait_for_state(
    // We're done when we've parsed all the heroes
    function () {
      return window.done_processing;
    },
    function () {
      // Provide feedback
//console.log("Finished All Heroes");
      $('#HDH_HeroProcessingIcon').removeClass().addClass('fa fa-check');
      $('#HDH_StoreHeroDetailsButton .lbl').text("Hero Details Stored! (Click again to re-load data if you wish)");
      $('#HDH_StoreHeroDetailsButton').removeClass().addClass('btn btn-success');

      // Reset defaults in case they want to run it again
      set_defaults();
    },
    1000);
};

// Moved button outside of UpdatePanel to avoid displacement in the DOM
$('#h1Title').append(`
	<button id="HDH_StoreHeroDetailsButton" type="button" class="btn btn-primary" onclick="store_hero_details()">
		<i id="HDH_HeroDetailsProcessingIcon" class="fa fa-download"></i>
		<span class="lbl">Store Hero Details for Heroes Draft Helper</span>
	</button>`
);

document.addEventListener('Get_Hero_Details', function (e) {
    chrome.storage.local.get(
        'hero_details:' + e.detail.hero,
        function (items) {
            console.log(items);
        });
});

document.addEventListener('Store_Hero_Details', function (e) {
    console.log("Storing Data for " + e.detail.hero);
    data = {};
    data["hero_details:" + e.detail.hero] = e.detail;
    chrome.storage.local.set(data);
});
