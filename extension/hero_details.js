$.getScript(chrome.extension.getURL('scripts/scrape_hero_details.js'));

// Moved button outside of UpdatePanel to avoid displacement in the DOM
$('#h1Title').append(`
	<button id="HDH_StoreHeroDetailsButton" type="button" class="btn btn-primary" onclick="store_hero_details()">
		<i id="HDH_HeroDetailsProcessingIcon" class="fa fa-download"></i>
		<span class="lbl">Store Hero Details for Heroes Draft Helper</span>
	</button>`
);

document.addEventListener('Get_Hero_Details', function (e) {
    chrome.storage.local.get(
        'hero_details:' + e.detail.hero,
        function (items) {
            console.log(items);
        });
});

document.addEventListener('Store_Hero_Duos', function (e) {
    console.log("Storing Duo Data for " + e.detail.hero);
    data = {};
    data["hero_duos:" + e.detail.hero] = e.detail;
    chrome.storage.local.set(data);
});

document.addEventListener('Store_Hero_Matchups', function (e) {
    console.log("Storing Matchup Data for " + e.detail.hero);
    data = {};
    data["hero_matchups:" + e.detail.hero] = e.detail;
    chrome.storage.local.set(data);
});
