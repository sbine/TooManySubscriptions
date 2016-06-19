const RECENT_VIDEO_LIMIT = 75;

function Collection(label, channels) {
	this.id = _.uniqueId();
	this.label = label;
	this.channels = channels;
	this.updated = moment();

	this.fetchChannels();

	return this;
};

Collection.prototype.addChannel = function(channel) {
	this.channels.push(channel);
}

Collection.prototype.update = function() {
	if (this.channels.length > 0) {
		this.fetchChannels();
	}
	this.dispatchLoadedEvent(this);

	return this;
}

Collection.prototype.fetchChannels = function() {
	var collection = this;
	var channelsFinished = 0;
	_.each(collection.channels, function(channel, index) {
		channel.fetch()
		.then(function(data) {
			channelsFinished++;

			// When all channels are done updating, dispatch collection loaded event
			if (channelsFinished === collection.channels.length) {
				collection.dispatchLoadedEvent(collection);
			}
		});
	});
	collection.updated = moment();

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

Collection.prototype.serialize = function () {
	return JSON.stringify({
		"id": this.id,
		"label": this.label,
		"channels": _.pluck(this.channels, 'id'),
	});
};

Collection.unserialize = function (data) {
	data = JSON.parse(data);
	var collection = new Collection;
	collection.id = data.id;
	collection.label = data.label;
	collection.channels = [];
	_.each(data.channels, function(channelId) {
		collection.channels.push(new Channel(channelId));
	});
	return collection;
}
