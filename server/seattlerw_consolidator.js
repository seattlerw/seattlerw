var fs = require('fs');

var seattletimes = JSON.parse(fs.readFileSync('seattletimes/seattletimes.json'));
var yelp = JSON.parse(fs.readFileSync('yelp/yelp.json'));

for (var i = 0; i < seattletimes.length; i++) {	
	seattletimes[i].yelp = yelp[seattletimes[i].id];
};

fs.writeFile('seattlerw.json', JSON.stringify(seattletimes), function (err) {
  if (err) throw err;
});

fs.writeFile('../app/scripts/seattlerw.json', JSON.stringify(seattletimes), function (err) {
  if (err) throw err;
});
