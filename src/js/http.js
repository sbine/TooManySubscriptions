function Http() {};

Http.prototype.getXML = function(url) {
	return new Promise(function (resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onload = function() {
			if (this.status >= 200 && this.status < 300) {
				var parser = new DOMParser();
				resolve(xhr.responseXML);
			}
		}
		xhr.onerror = function () {
			reject({
				status: this.status,
				statusText: xhr.statusText
			});
		};

		xhr.send();
	});
}