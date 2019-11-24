$.getScript(chrome.extension.getURL('hotslogs/scripts/player_data.js'));

// Moved button to Title area for consistency with other data scrape pages
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
