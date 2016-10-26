var store_role_data = function() {
	document.dispatchEvent(new CustomEvent('Store_Role_Data', {
		'detail': collect_role_data()
	}));
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

	return role_data;
}



