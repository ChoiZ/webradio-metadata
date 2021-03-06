// Copyright (c) 2017 Alexandre Storelli
// This file is licensed under the Affero General Public License version 3 or later.
// See the LICENSE file.

var get = require("./get.js");

module.exports = function(exturl, callback) {
	get(exturl, function(err, result, corsEnabled) {
		if (err) {
			return callback(err, null, null);
		}

		try {
			parsedResult = JSON.parse(result);
		} catch(e) {
			return callback(e.message, null, null);
		}

		var now = Math.floor(new Date() / 1000);
		for (ip = parsedResult.length - 1; ip >= 0; ip--) {
			var item = parsedResult[ip];
			if (now < item.end && (now >= item.start || (ip > 0 && now >= parsedResult[ip-1].end))) {
				var artist = null;
				if (item["conceptParentTitle"]) {
					artist = item["conceptParentTitle"];
				}
				var title = item["conceptTitle"];
				if (title.indexOf(item["expressionTitle"]) < 0 && item["expressionTitle"].indexOf(title) < 0) {
					if (artist == null) {
						artist = title;
						title = item["expressionTitle"];
					} else {
						title += " - " + item["expressionTitle"];
					}
				}
				var cover = (item["visual"] && item["visual"]["imgUrl"]) ? item["visual"]["imgUrl"] : null;
				return callback(null, { artist: artist, title: title, cover: cover }, corsEnabled);
			}
		}
		/*for (ip = 0; ip<parsedResult.length; ip++) {
			var item = parsedResult[ip];
			console.log("item.start=" + item.start + " item.end=" + item.end);
		}*/
		return callback("program not found at time stamp " + now, null, null);
	});
}
