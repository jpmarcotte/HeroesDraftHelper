document.addEventListener('Clear_Storage', function(e) {
	chrome.storage.sync.clear();
});

document.addEventListener('Get_All_Storage', function(e) {
	chrome.storage.sync.get(function(items){ console.log(items); });
});

