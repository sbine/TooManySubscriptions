const CACHE_UPDATE_SECONDS = 120;
const RECENT_VIDEO_LIMIT = 75;

function Collection(label, channels) {
	this.label = label;
	this.channels = channels;
	this.updated = moment();

	this.fetchChannels();

	return this;
};

Collection.prototype.fetchChannels = function() {
	var collection = this;
	var channelsFinished = 0;
	_.each(collection.channels, function(channel, index) {
		channel.fetch()
		.then(function(data) {
			channelsFinished++;

			if (channelsFinished === collection.channels.length) {
				collection.dispatchLoadedEvent(collection);
			}
		});
	});

	collection.updated = moment();
}

Collection.prototype.update = function() {
	if (moment().diff(this.updated) > CACHE_UPDATE_SECONDS) {
		console.log('Collection cache miss');
		this.fetchChannels();
	} else {
		this.dispatchLoadedEvent(this);
	}

	return this;
}

Collection.prototype.recentVideos = function() {
	// Merge videos from each channel
	var videos = _.reduceRight(_.map(this.channels, function(channel) {
		return channel.videos;
	}), function(a, b) { return a.concat(b); }, []);

	// Sort by date and limit to RECENT_VIDEO_LIMIT
	return _.first(_.sortBy(videos, function(v) { return -v.date.format('x'); }), RECENT_VIDEO_LIMIT);
}

Collection.prototype.dispatchLoadedEvent = function(collection) {
	var collectionLoadedEvent = new CustomEvent('toomanysubscriptions.CollectionLoaded');
	collectionLoadedEvent.collection = collection;
	document.dispatchEvent(collectionLoadedEvent);
}