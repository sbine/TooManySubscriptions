const CACHE_UPDATE_SECONDS = 120;

function Channel(id) {
	this.id = id;
	this.name = '';
	this.url = '';
	this.videos = [];
	this.updated = moment();
};

Channel.prototype.fetch = function() {
	var channel = this;
	return new Promise(function (resolve, reject) {
		// Fetch latest videos every CACHE_UPDATE_SECONDS, or if videos are empty
		if (moment().diff(channel.updated, 'seconds') > CACHE_UPDATE_SECONDS || channel.videos.length === 0) {
			console.log('Channel cache miss: ' + moment().diff(channel.updated, 'seconds'));

			var xml = new Http().getXML("https://www.youtube.com/feeds/videos.xml?channel_id=" + channel.id)
			.then(function (xml) {
				var xmlParser = new ChannelXMLParser(xml);

				channel.url = xmlParser.parseURL();
				channel.name = xmlParser.parseName();
				channel.videos = xmlParser.parseVideos();
				channel.updated = moment();

				channel.dispatchLoadedEvent(this);

				resolve(channel);
			});
		} else {
			channel.dispatchLoadedEvent(this);
		}
	});
}

Channel.prototype.dispatchLoadedEvent = function(channel) {
	var channelLoadedEvent = new CustomEvent('toomanysubscriptions.ChannelLoaded');
	channelLoadedEvent.channel = channel;
	document.body.dispatchEvent(channelLoadedEvent);
}

/*
 Channel XML parser
 https://www.youtube.com/feeds/videos.xml?channel_id=<channelId>
*/
function ChannelXMLParser(xml) {
	this.xml = xml;
};

ChannelXMLParser.prototype.parseAuthor = function() {
	return this.xml.getElementsByTagName('author')[0].textContent;
}

ChannelXMLParser.prototype.parseName = function() {
	return this.xml.getElementsByTagName('name')[0].textContent;
}

ChannelXMLParser.prototype.parseURL = function() {
	return this.xml.querySelectorAll('link[rel="alternate"]')[0].getAttribute('href');
}

ChannelXMLParser.prototype.parseVideos = function() {
	var videoElements = this.xml.getElementsByTagName('entry');
	var videos = [];

	for (var i = 0; i < videoElements.length; i++) {
		videos[i] = new Video().loadFromXML(videoElements[i]);
	}
	return videos;
}