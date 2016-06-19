document.addEventListener('DOMContentLoaded', function () {
	main();
});

var storage = new Storage().init();

var activeCollectionId = '';
var tooManyCollections = {};

var fakeCollection1 = new Collection(
	'Science & Technology',
	[
		new Channel('UC6nSFpj9HTCZ5t-N3Rm3-HA'), // Vsauce
		new Channel('UC9-y-6csu5WGm29I7JiwpnA'), // Computerphile
		new Channel('UCXuqSBlHAE6Xw-yeJA0Tunw'), // Linus Tech Tips
		new Channel('UCHnyfMqiRRG1u-2MsSQLbXA'), // Veritasium
	]
);
var fakeCollection2 = new Collection(
	'Favorites',
	[
		new Channel('UCD4INvKvy83OXwAkRjaQKtw'), // Sips
		new Channel('UCMtFAi84ehTSYSE9XoHefig'), // The Late Show
		new Channel('UCRVruzlQF5cqpw9jQgIgNdw'), // mugumogu
	]
);

function main() {
	// TODO: remove placeholder data
	saveCollectionsToStorage([fakeCollection2, fakeCollection1]);

	storage.get('collections').then(function(collections) {
		if (collections === null) {
			// Default collection
			collections = [new Collection('My Collection', [])];
		}

		_.each(collections, function(collection) {
			collection = Collection.unserialize(collection);
			tooManyCollections[collection.id] = collection.update();
		});

		console.log('Retrieved saved collections:');
		console.log(tooManyCollections);

		setActiveCollection(_.first(_.sortBy(tooManyCollections, 'label')).id);
	});

	registerEventListeners();
}

function setActiveCollection(collectionId) {
	if (collectionId !== activeCollectionId) {
		activeCollectionId = collectionId;

		populateCollectionDropdown(tooManyCollections);
		populateCollectionForm(tooManyCollections);

		tooManyCollections[collectionId].update();
	}
}

function saveCollectionsToStorage(collections) {
	return storage.put('collections', _.map(collections, function(collection) {
		return collection.serialize();
	}));
}

function populateCollectionDropdown(collections) {
	var collectionSelect = document.getElementById('collection-select');
	if (collectionSelect !== null) {
		while (collectionSelect.firstChild) {
			collectionSelect.removeChild(collectionSelect.firstChild);
		}
		collections = _.sortBy(collections, 'label');
		_.each(collections, function(collection, index) {
			var option = document.createElement('option');
			option.innerText = collection.label;
			option.dataset.collectionId = collection.id;
			collectionSelect.insertBefore(option, null);
			if (collection.id === activeCollectionId) {
				collectionSelect.value = collection.label;
			}
		});
	}
}

function populateCollectionForm(collections) {
	var collectionFormItemTemplate = document.getElementById('collection-form-item-template');
	if (collectionFormItemTemplate !== null) {
		var collectionList = document.getElementById('collection-list');
		while (collectionList.firstChild) {
			collectionList.removeChild(collectionList.firstChild);
		}
		renderTemplate(collectionFormItemTemplate, collectionList, { collection: tooManyCollections[activeCollectionId] }, true);

		var collectionIdEditors = document.getElementsByClassName('collection-ids');
		_.each(collectionIdEditors, function(element, index) {
			var collectionId = element.dataset.collectionId;
			// Re-populate collection.channels on textarea blur
			element.addEventListener('blur', function() {
				tooManyCollections[collectionId].channels = [];
				var channelIds = element.value.split("\n");
				_.each(channelIds, function(id) {
					if (id.length > 0) {
						tooManyCollections[collectionId].addChannel(new Channel(id));
					}
				});

				saveCollectionsToStorage(tooManyCollections);
			});
		});

		upgradeMaterialInputs();
	}
}

function addCollection(label) {
	var collection = new Collection(label, []);
	tooManyCollections[collection.id] = collection;
	saveCollectionsToStorage(tooManyCollections).then(function() {
		document.location.reload();
	});
}

function deleteCollection(id) {
	saveCollectionsToStorage(_.omit(tooManyCollections, id)).then(function() {
		document.location.reload();
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

function registerEventListeners() {
	// Open extension in a dedicated tab when nav item is clicked
	document.querySelector('.collection-dedicated-tab').addEventListener('click', function() {
		chrome.tabs.create({url: "popup.html"});
	});

	// Add new collection when create button is clicked
	var createButton = document.querySelector('.collection-create-button');
	if (createButton !== null) {
		createButton.addEventListener('click', function(e) {
			addCollection('New Collection');
		});
	}

	// Delete active collection when delete button is clicked
	var deleteButton = document.querySelector('.collection-delete-button');
	if (deleteButton !== null) {
		deleteButton.addEventListener('click', function(e) {
			deleteCollection(activeCollectionId);
		});
	}

	// Set active collection when main dropdown is changed
	document.getElementById('collection-select').addEventListener('change', function(e) {
		var collectionId = e.target.options[e.target.selectedIndex].dataset.collectionId;
		setActiveCollection(collectionId);
		document.querySelector('.mdl-selectfield').classList.remove('is-focused');
	});

	// Render video list when collections have loaded
	document.addEventListener('toomanysubscriptions.CollectionLoaded', function(e) {
		if (e.collection.id === activeCollectionId) {
			document.getElementById('collection-loading').style.display = 'block';

			var videoList = document.getElementById('video-list');
			if (videoList !== null) {
				while (videoList.firstChild) {
					videoList.removeChild(videoList.firstChild);
				}
				var videos = e.collection.recentVideos();
				var collectionItemTemplate = document.getElementById('collection-item-template');
				if (collectionItemTemplate !== null) {
					_.each(videos, function(video, index) {
						renderTemplate(collectionItemTemplate, videoList, { video: video }, true);
					});
				}
			}

			// Hide loading bar
			document.getElementById('collection-loading').style.display = 'none';
		}
	});
}

// https://getmdl.io/started/index.html#dynamic
function upgradeMaterialInputs() {
	var materialInputs = document.getElementsByClassName('mdl-textfield');
	_.each(materialInputs, function(elem) {
		componentHandler.upgradeElement(elem);
	});
}