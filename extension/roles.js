// I hate having to duplicate this function from scrape_map_data.js but I haven't yet figured out
// how to put it in a common file for inclusion.
wait_for_state = function(test, execute, interval = 100) {
  if (test()) { execute(); }
  else { setTimeout(function(){ wait_for_state(test, execute, interval); }, interval); }
}

var roles_parsed = false;
var store_role_data = function() {
  // Provide feedback
  $('#HDH_RoleProcessingIcon').removeClass().addClass('fa fa-spinner fa-spin');
  $('#HDH_StoreRoleDataButton .lbl').text("Processing...");
  $('#HDH_StoreRoleDataButton').removeClass().addClass('btn btn-info disabled');

  document.dispatchEvent(new CustomEvent('Store_Role_Data', {
    'detail': collect_role_data()
  }));


  // Provide feedback
  wait_for_state(
    function(){return window.roles_parsed;},
    function() {
      $('#HDH_RoleProcessingIcon').removeClass().addClass('fa fa-check');
      $('#HDH_StoreRoleDataButton .lbl').text("Hero SubRole Data Stored! (Click again to re-load data if you wish)");
      $('#HDH_StoreRoleDataButton').removeClass().addClass('btn btn-success');
    },
    1000);
}

var collect_role_data = function() {
  var role_data = {};

  $('table.alert-info').each(function(){
    role = $(this).find('th').text();
    $(this).find('td').each(function(){
      hero = $(this).text();
      console.log(hero+" is a "+role);
      role_data[hero] = role;
    });
  });

  window.roles_parsed = true;
  return role_data;
}

// Moved button to Title area for consistency with other data scrape pages
$('header').append(`
	<button id="HDH_StoreRoleDataButton" type="button" class="btn btn-primary" style="margin-bottom:10px;" onclick="store_role_data()">
		<i id="HDH_RoleProcessingIcon" class="fa fa-download"></i>
		<span class="lbl">Store Role Data for Heroes Draft Helper</span>
	</button>`
);

document.addEventListener('Get_Role_Data', function(e) {
	chrome.storage.local.get(
		'hero_sub_roles',
		function(items) {
			console.log(items);
		}
	);
});

document.addEventListener('Store_Role_Data', function(e) {
	console.log("Storing Hero Sub-Role Data");
	chrome.storage.local.set({'hero_sub_roles': e.detail});
});
