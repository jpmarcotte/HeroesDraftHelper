$.getScript(chrome.extension.getURL('scripts/player_data.js'));

$('div#MainContent_divDropDowns > div.RadDropDownList').last().after(
		'<DIV class="RadDropDownList RadDropDownList_Black" style="font-size:Larger; cursor:pointer"><SPAN class="rddlInner"><SPAN class="rddlFakeInput" onclick="store_player_data()">Store Player Data</SPAN></SPAN></DIV>'
);

document.addEventListener('Clear_Storage', function(e) {
	chrome.storage.sync.clear();
});

document.addEventListener('Get_Player_Data', function(e) {
	chrome.storage.sync.get(
		'player_data',
		function(items) {
			console.log(items.player_data);
		}
	);
});

document.addEventListener('Store_Player_Data', function(e) {
	console.log("Storing Data for player "+e.detail.name);
	chrome.storage.sync.get(
		'player_data',
		function(items) {
			player_data = items.player_data || {};
			player_data[e.detail.ID] = e.detail;
			chrome.storage.sync.set({'player_data': player_data});
		}
	);
});
