$.getScript(chrome.extension.getURL('scripts/player_data.js'));

$('div#MainContent_divDropDowns > div.RadDropDownList').last().after(
		'<DIV class="RadDropDownList RadDropDownList_Black" style="font-size:Larger; cursor:pointer"><SPAN class="rddlInner"><SPAN class="rddlFakeInput" onclick="store_player_data()">Store Player Data</SPAN></SPAN></DIV>'
);

document.addEventListener('Clear_Storage', function(e) {
	chrome.storage.sync.clear();
});

document.addEventListener('Get_All_Storage', function(e) {
	chrome.storage.sync.get(function(items){ console.log(items); });
});

document.addEventListener('Get_Player_Data', function(e) {
	chrome.storage.sync.get(
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
	chrome.storage.sync.set(data);
});
