function Storage() {};

Storage.prototype.init = function() {
	localforage.config({
		driver      : localforage.WEBSQL,
		name        : 'Too Many Subscriptions',
		version     : 1.0,
		storeName   : 'toomanysubscriptions',
	});

	return this;
}

Storage.prototype.put = function(key, value) {
	return localforage.setItem(key, value).catch(function(err) {
		console.log('Error saving to localforage:');
		console.log(err);
	});
}

Storage.prototype.get = function(key) {
	return localforage.getItem(key).catch(function(err) {
		console.log('Error retrieving from localforage:');
		console.log(err);
	});
}