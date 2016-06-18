function Video() {
	this.date = null;
	this.title = '';
	this.description = '';
	this.thumbnail = '';
	this.url = '';
	this.stars = 0;
	this.views = 0;
	this.channel = {
		name: '',
		url: ''
	};
};

Video.prototype.loadFromXML = function(xml) {
	var xmlParser = new VideoXMLParser(xml);

	this.date = xmlParser.parseCreatedDate();
	this.title = xmlParser.parseTitle();
	this.description = xmlParser.parseDescription();
	this.thumbnail = xmlParser.parseThumbnail();
	this.url = xmlParser.parseURL();
	this.stars = xmlParser.parseStarRating();
	this.views = xmlParser.parseViews();
	this.channel.name = xmlParser.parseChannelName();
	this.channel.url = xmlParser.parseChannelURL();

	return this;
}

/*
 Video XML Parser
*/
function VideoXMLParser(xml) {
	this.xml = xml;
};

VideoXMLParser.prototype.parseCreatedDate = function() {
	return moment(this.xml.getElementsByTagName('published')[0].textContent);
}

VideoXMLParser.prototype.parseTitle = function() {
	return this.xml.getElementsByTagName('title')[0].textContent;
}

VideoXMLParser.prototype.parseDescription = function() {
	return this.xml.getElementsByTagNameNS('*', 'description')[0].textContent;
}

VideoXMLParser.prototype.parseThumbnail = function() {
	return this.xml.getElementsByTagNameNS('*', 'thumbnail')[0].getAttribute('url');
}

VideoXMLParser.prototype.parseURL = function() {
	return this.xml.querySelectorAll('link[rel="alternate"]')[0].getAttribute('href');
}

VideoXMLParser.prototype.parseStarRating = function() {
	// TODO: Number.parseFloat
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/parseFloat
	return parseFloat(this.xml.getElementsByTagNameNS('*', 'starRating')[0].getAttribute('average'));
}

VideoXMLParser.prototype.parseViews = function() {
	return parseInt(this.xml.getElementsByTagNameNS('*', 'statistics')[0].getAttribute('views'));
}

VideoXMLParser.prototype.parseChannelName = function() {
	return this.xml.getElementsByTagName('author')[0].getElementsByTagName('name')[0].textContent;
}

VideoXMLParser.prototype.parseChannelURL = function() {
	return this.xml.getElementsByTagName('author')[0].getElementsByTagName('uri')[0].textContent;
}