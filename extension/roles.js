$.getScript(chrome.extension.getURL('scripts/role_data.js'));

$('header').append(
		'<DIV class="RadDropDownList RadDropDownList_Black" style="font-size:Larger; cursor:pointer" onclick="store_role_data()"><SPAN class="rddlInner"><SPAN class="rddlFakeInput">Store Role Data</SPAN></SPAN></DIV>'
);

document.addEventListener('Get_Role_Data', function(e) {
	chrome.storage.sync.get(
		'hero_sub_roles',
		function(items) {
			console.log(items);
		}
	);
});

document.addEventListener('Store_Role_Data', function(e) {
	console.log("Storing Hero Sub-Role Data");
	chrome.storage.sync.set({'hero_sub_roles': e.detail});
});
