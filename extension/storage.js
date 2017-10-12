document.addEventListener('Clear_Storage', function(e) {
	chrome.storage.local.clear();
});

document.addEventListener('Get_All_Storage', function(e) {
	chrome.storage.local.get(function(items){ console.log(items); });
});

