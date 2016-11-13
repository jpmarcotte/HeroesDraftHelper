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



