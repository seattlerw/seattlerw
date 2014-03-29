var fs = require('fs');
var cheerio = require('cheerio');

function __main() {

	var files = fs.readdirSync('pages/');
	var restaurants = [];

	for (var i = 0; i < files.length; i++) {
		if(files[i].indexOf('html') != -1) {
			var restaurant = new RESTAURANT();
			var $ = cheerio.load(fs.readFileSync('pages/' + files[i]));

			restaurant.name = $('#content h1').text();
			restaurant.id = files[i].replace(".html", "");
			//restaurant.meal = [[[],[],[],[]],[[],[],[],[]],[[],[],[],[]]]


			//console.log($('#content h1').html() + " - " + files[i]);
			var lines = $('.columns12').text().replace(/\t/g,'').split('\n');
			//restaurant.rawdata = lines;

			var meal = {
				'unknown' : 0,
				'lunch':  1,
				'dinner': 2		
			}
			var course = {
				'unknown' : 0,
				'appetizers' : 1,
				'entrees' : 2,
				'desserts' : 3
			}

			var current_meal = 0;
			var current_course = 0;
			var other = false;
			var other_index = 0;
			for (var j = 0; j < lines.length; j++) {
				if(lines[j].indexOf("View all participating restaurants") != -1){
					continue;
				}

				if(lines[j].trim() == "" ){ 
					continue;
				}

				//Vegetarian
				var re_veg = /\(.*V.*\)/;
				var veggie = re_veg.exec(lines[j]);
				if(veggie != null && veggie.length > 0) {
					restaurant.isVegetarian = true;
				}

				//Gluten Free
				var re_gf = /\(.*GF.*\)/;
				var gf = re_gf.exec(lines[j]);
				if(gf != null && gf.length > 0) {
					restaurant.isGlutenFree = true;
				}

				//Phone
				var re_phone = /Phone/;
				var phone = re_phone.exec(lines[j]);
				if(phone != null && phone.length > 0) {
					restaurant.phone = lines[j].trim().replace("Phone: ", "");
					continue;
				}

				//clear line
				if(lines[j].indexOf("Menus are subject to change") != -1) {
					continue;
				}


				//determine meal
				if(lines[j].trim().indexOf("Lunch -") != -1) {
					current_meal = meal.lunch;
					restaurant.lunchDetails = lines[j].trim();
					continue;
				}
				if(lines[j].trim().indexOf("Dinner -") != -1) {
					current_meal = meal.dinner;
					restaurant.dinnerDetails = lines[j].trim();
					continue;
				}

				//determine course
				if(lines[j].trim().indexOf("Appetizers") != -1) {
					current_course = course.appetizers;
					continue;
				}
				if(lines[j].trim().indexOf("Entrées") != -1) {
					current_course = course.entrees;
					continue;
				}
				if(lines[j].trim().indexOf("Desserts") != -1) {
					current_course = course.desserts;
					continue;
				}


				if(lines[j].trim().indexOf("Offer details") != -1) {
					other = true;
					continue;
				}

				if(!other) {
					if(current_meal == meal.lunch) {
						if(current_course == course.appetizers) {
							restaurant.lunch.appetizers.push(lines[j].trim());
							continue;
						}
						if(current_course == course.entrees) {
							restaurant.lunch.entrees.push(lines[j].trim());
							continue;
						}
						if(current_course == course.desserts) {
							restaurant.lunch.desserts.push(lines[j].trim());
							continue;
						}
						if(current_course == course.unknown) {
							restaurant.lunch.unknown.push(lines[j].trim());
							continue;
						}
					}
					if(current_meal == meal.dinner) {
						if(current_course == course.appetizers) {
							restaurant.dinner.appetizers.push(lines[j].trim());
							continue;
						}
						if(current_course == course.entrees) {
							restaurant.dinner.entrees.push(lines[j].trim());
							continue;
						}
						if(current_course == course.desserts) {
							restaurant.dinner.desserts.push(lines[j].trim());
							continue;
						}
						if(current_course == course.unknown) {
							restaurant.dinner.unknown.push(lines[j].trim());
							continue;
						}
					}
					if(current_meal == meal.unknown) {
						if(current_course == course.appetizers) {
							restaurant.unknown.appetizers.push(lines[j].trim());
							continue;
						}
						if(current_course == course.entrees) {
							restaurant.unknown.entrees.push(lines[j].trim());
							continue;
						}
						if(current_course == course.desserts) {
							restaurant.unknown.desserts.push(lines[j].trim());
							continue;
						}
						if(current_course == course.unknown) {
							restaurant.unknown.unknown.push(lines[j].trim());
							continue;
						}
					}
				}

				var re_address = /^[0-9]+/;
				var address = re_address.exec(lines[j]);
				if(other && other_index < 2) {
					if(address != null && address.length > 0) {
						restaurant.address = lines[j].trim() + " " + lines[j+2].trim();
						j = j+2;
						other_index = 2;
						continue;
					} else {
						restaurant.notes += lines[j].trim() + " ";
					}
				}
				restaurant.rawlines.push(lines[j].trim());
				//console.log(lines[j].trim());
			};
			restaurants.push(restaurant);
		}
	};


	var manual_overrides = JSON.parse(fs.readFileSync('manual.json'));
	for (var i = 0; i < restaurants.length; i++) {
		if(manual_overrides.hasOwnProperty(restaurants[i].id)) {
			var manual_keys = Object.keys(manual_overrides[restaurants[i].id]);
			for (var j = 0; j < manual_keys.length; j++) {
				restaurants[i][manual_keys[j]] = manual_overrides[restaurants[i].id][manual_keys[j]];
			};
			
		}
	};

	console.log(restaurants);

	fs.writeFile('seattletimes.json', JSON.stringify(restaurants), function (err) {
	  if (err) throw err;
	});
	//presenter(restaurants);
}

function presenter(restaurants) {
	//console.log(restaurants);
	for (var i = 0; i < restaurants.length; i++) {
		console.log(restaurants[i].name + " - " + restaurants[i].id);
		console.log("Vegetarian: " + restaurants[i].isVegetarian);
		console.log("Phone: " + restaurants[i].phone);
		console.log("Address: " + restaurants[i].address);
		console.log("----");

		//Lunch
		if(restaurants[i].hasLunch()) {
			console.log(restaurants[i].lunchDetails);

			//Appetizers
			if(restaurants[i].hasLunchAppetizers()) {
				console.log("\tAppetizers");
				for (var j = 0; j < restaurants[i].lunch.appetizers.length; j++) {
					console.log("\t\t" + restaurants[i].lunch.appetizers[j]);
				};
			}

			//Entrees
			if(restaurants[i].hasLunchEntrees()) {
				console.log("\tEntrees");
				for (var j = 0; j < restaurants[i].lunch.entrees.length; j++) {
					console.log("\t\t" + restaurants[i].lunch.entrees[j]);
				};
			}

			//Desserts
			if(restaurants[i].hasLunchDesserts()) {
				console.log("\tDesserts");
				for (var j = 0; j < restaurants[i].lunch.desserts.length; j++) {
					console.log("\t\t" + restaurants[i].lunch.desserts[j]);
				};
			}

			//Other
			if(restaurants[i].hasLunchOther()) {
				console.log("\tOther");
				for (var j = 0; j < restaurants[i].lunch.unknown.length; j++) {
					console.log("\t\t" + restaurants[i].lunch.unknown[j]);
				};
			}
		}

		//Dinner
		if(restaurants[i].hasDinner()) {
			console.log(restaurants[i].dinnerDetails);

			//Appetizers
			if(restaurants[i].hasDinnerAppetizers()) {
				console.log("\tAppetizers");
				for (var j = 0; j < restaurants[i].dinner.appetizers.length; j++) {
					console.log("\t\t" + restaurants[i].dinner.appetizers[j]);
				};
			}

			//Entrees
			if(restaurants[i].hasDinnerEntrees()) {
				console.log("\tEntrees");
				for (var j = 0; j < restaurants[i].dinner.entrees.length; j++) {
					console.log("\t\t" + restaurants[i].dinner.entrees[j]);
				};
			}

			//Desserts
			if(restaurants[i].hasDinnerDesserts()) {
				console.log("\tDesserts");
				for (var j = 0; j < restaurants[i].dinner.desserts.length; j++) {
					console.log("\t\t" + restaurants[i].dinner.desserts[j]);
				};
			}

			//Other
			if(restaurants[i].hasDinnerOther()) {
				console.log("\tOther");
				for (var j = 0; j < restaurants[i].dinner.unknown.length; j++) {
					console.log("\t\t" + restaurants[i].dinner.unknown[j]);
				};
			}
		}

		console.log(restaurants[i].rawlines);


		//Dinner

		//Unknown
		
	};

}

var RESTAURANT = function() {
	this.name = "";
	this.id = "";
	this.isVegetarian = false;
	this.isGlutenFree = false;
	this.adresss = "";
	this.phone = "";
	this.notes = "";
	this.lunchDetails = "";
	this.lunch = {
		"appetizers" : [],
		"entrees" : [],
		"desserts" : [],
		"unknown" : []
	};
	this.dinnerDetails = [];
	this.dinner ={
		"appetizers" : [],
		"entrees" : [],
		"desserts" : [],
		"unknown" : []
	};
	this.unknown ={
		"appetizers" : [],
		"entrees" : [],
		"desserts" : [],
		"unknown" : []
	};
	this.rawlines = [];

}

RESTAURANT.prototype.hasLunch = function() {
	var hasLunch = false;
	if(this.hasLunchAppetizers())
		return true;
	if(this.hasLunchEntrees())
		return true;
	if(this.hasLunchDesserts())
		return true;
	if(this.hasLunchOther())
		return true;
}

RESTAURANT.prototype.hasLunchAppetizers = function() {
	if(this.lunch.appetizers.length > 0)
		return true;	
}

RESTAURANT.prototype.hasLunchEntrees = function() {
	if(this.lunch.entrees.length > 0)
		return true;	
}

RESTAURANT.prototype.hasLunchDesserts = function() {
	if(this.lunch.desserts.length > 0)
		return true;	
}

RESTAURANT.prototype.hasLunchOther = function() {
	if(this.lunch.unknown.length > 0)
		return true;	
}
RESTAURANT.prototype.hasDinner = function() {
	var hasDinner = false;
	if(this.hasDinnerAppetizers())
		return true;
	if(this.hasDinnerEntrees())
		return true;
	if(this.hasDinnerDesserts())
		return true;
	if(this.hasDinnerOther())
		return true;
}

RESTAURANT.prototype.hasDinnerAppetizers = function() {
	if(this.dinner.appetizers.length > 0)
		return true;	
}

RESTAURANT.prototype.hasDinnerEntrees = function() {
	if(this.dinner.entrees.length > 0)
		return true;	
}

RESTAURANT.prototype.hasDinnerDesserts = function() {
	if(this.dinner.desserts.length > 0)
		return true;	
}

RESTAURANT.prototype.hasDinnerOther = function() {
	if(this.dinner.unknown.length > 0)
		return true;	
}


__main();