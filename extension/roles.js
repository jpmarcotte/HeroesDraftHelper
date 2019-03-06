$.getScript(chrome.extension.getURL('scripts/role_data.js'));

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
