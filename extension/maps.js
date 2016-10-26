$.getScript(chrome.extension.getURL('scripts/scrape_map_data.js'));

$('#MainContent_divControlContainer > div.divInline').first().append(
		'<DIV class="RadComboBox RadComboBox_Black" style="font-size:Larger;"><SPAN class="rcbInner rcbReadOnly"><SPAN class="rcbInput radPreventDecorate" onclick="store_map_data()" style="cursor:pointer">Store Map Data</SPAN></SPAN></DIV>'
);

document.addEventListener('Get_Map_Data', function(e) {
	chrome.storage.sync.get(
		'map:'+e.detail.map,
		function(items) {
			console.log(items);
		}
	);
});

document.addEventListener('Store_Map_Data', function(e) {
	console.log("Storing Data for "+e.detail.map);
	data = {};
	data["map:"+e.detail.map] = e.detail.heroes
	chrome.storage.sync.set(data);
});
