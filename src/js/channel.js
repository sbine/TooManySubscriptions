function Channel(id) {
	this.id = id;
	this.name = '';
	this.url = '';
	this.videos = [];
};

Channel.prototype.fetch = function() {
	var channel = this;
	return new Promise(function (resolve, reject) {
		var xml = new Http().getXML("https://www.youtube.com/feeds/videos.xml?channel_id=" + channel.id)
		.then(function (xml) {
			var xmlParser = new ChannelXMLParser(xml);

			channel.url = xmlParser.parseURL();
			channel.name = xmlParser.parseName();
			channel.videos = xmlParser.parseVideos();

			var channelLoadedEvent = new CustomEvent('toomanysubscriptions.ChannelLoaded');
			channelLoadedEvent.channel = channel;
			document.body.dispatchEvent(channelLoadedEvent);

			resolve(channel);
		});
	});
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