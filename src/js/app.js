document.addEventListener('DOMContentLoaded', function () {
	main();
});

var fakeCollection = new Collection(
	'Favorites',
	[
		new Channel('UCD4INvKvy83OXwAkRjaQKtw'), // Sips
		new Channel('UCesAHOvWea6SmLWWvwz_LHg'), // Anklespankin
		new Channel('UC9-y-6csu5WGm29I7JiwpnA'), // Computerphile
		new Channel('UCRVruzlQF5cqpw9jQgIgNdw'), // mugumogu
		new Channel('UCK3eoeo-HGHH11Pevo1MzfQ') // Blitzkriegsler
	]
);

function main() {
	localforage.config({
		driver      : localforage.WEBSQL,
	    name        : 'Too Many Subscriptions',
	    version     : 1.0,
	    storeName   : 'toomanysubscriptions',
	});

	// TODO: remove placeholder data
	saveCollectionsToStorage([fakeCollection]);

	getCollectionsFromStorage();

	document.addEventListener('toomanysubscriptions.CollectionLoaded', function(e) {
		var videos = e.collection.recentVideos();
		_.each(videos, function(video, index) {
			renderTemplate(document.getElementById('collection-item-template'), document.getElementById('collection-list'), { video: video }, true);
		});
	});
}

function getCollectionsFromStorage()
{
	localforage.getItem('collections').then(function(collections) {
		if (collections != null) {
			console.log('Found cached collections:');
			console.log(collections);

			populateCollectionDropdown(collections);
		}
	}).catch(function(err) {
		console.log('Error retrieving collections:');
		console.log(err);
	});
}

function saveCollectionsToStorage(collections)
{
	localforage.setItem('collections', collections).then(function(value) {
	}).catch(function(err) {
		console.log('Error saving collection to localforage:');
		console.log(err);
	});
}

function populateCollectionDropdown(collections) {
	document.getElementById('collection-select').innerHTML = '';
	_.each(collections, function(collection, index) {
		var option = document.createElement('option');
		option.innerText = collection.label;
		document.getElementById('collection-select').insertBefore(option, null);
	});
}

function renderTemplate(template, target, data, append) {
	var tmpl = template.innerHTML;
	var rendered = _.template(tmpl)(data);
	if (append === true) {
		target.innerHTML += rendered;
	}
	else {
		target.innerHTML = rendered;
	}
	return target;
}