$.getScript(chrome.extension.getURL('scripts/scrape_map_data.js'));

// Moved button outside of UpdatePanel to avoid displacement in the DOM
$('#h1Title').append(`
	<button id="HDH_StoreMapDataButton" type="button" class="btn btn-primary" onclick="store_map_data()">
		<i id="HDH_MapProcessingIcon" class="fa fa-download"></i>
		<span class="lbl">Store Map Data for Heroes Draft Helper</span>
	</button>`
);

document.addEventListener('Get_Map_Data', function(e) {
	chrome.storage.sync.get(
		'map:'+e.detail.map,
		function(items) {
			console.log(items);
		});
});

document.addEventListener('Store_Map_Data', function(e) {
	console.log("Storing Data for "+e.detail.map);
	data = {};
	data["map:"+e.detail.map] = e.detail;
	chrome.storage.sync.set(data);
});
