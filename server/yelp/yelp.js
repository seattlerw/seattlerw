"use strict;"

var fs = require("fs");
var Q = require("q");
var Log = require("log")
  , log = new Log('debug', fs.createWriteStream('yelp.log'));
var yelp = require("yelp").createClient({
	consumer_key: "AJZQhUWqiWm6pL3jh_r-9A", 
	consumer_secret: "9WnYpVzbKKIgk91oXEl3BUakFXc",
	token: "LACINWhEukvrjAOQhvqmEYF2vGpoT-a4",
	token_secret: "ZCVM8z8twsZO_v_G5979KiSSI7s"
});

var restaurants = JSON.parse('../seattletimes/seattletimes.json');
var requests = [];
var request_ids = [];


for (var i = 0; i < restaurants.length; i++) { " " + restaurants[i].address;
	if(restaurants[i].name != null | restaurants[i].name != "") {
		var r_id = restaurants[i].id;
		//console.log(r_id + " - " );

		requests[i] = yelp_search(restaurants[i].name,restaurants[i].address);
		request_ids[i] = r_id;
	}
};

function yelp_search (term, address) {
	if(address == null || address == "") {
		address = "Seattle, WA";
	}
	var deferred = Q.defer();
	yelp.search({
		term: term, 
		location: address,
		limit: 1
	}, function (err, data) {
	    if (err) deferred.reject(err) // rejects the promise with `er` as the reason
	    else deferred.resolve(data) // fulfills the promise with `data` as the value
	});
	return deferred.promise;// the promise is returned
}

Q.allSettled(requests).then(
	function(results) {
		//console.log(results);
		var responses = {};
		for (var i = 0; i < results.length; i++) {
			if(results[i].state == 'fulfilled') {
				responses[request_ids[i]] = results[i].value;
			}
		log.debug(results[i].value);
		};

		//console.log(JSON.stringify(responses));

		fs.writeFile('yelp.json', JSON.stringify(responses), function (err) {
		  if (err) throw err;
		});
	}

);