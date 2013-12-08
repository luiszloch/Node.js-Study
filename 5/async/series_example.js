var async = require("async");

// Async Series will run 1st function and will only start 2nd function upon conclusion.

async.series({
	
	numbers: function (callback){
		setTimeout(function (){
			callback(null, [1, 2, 3]);
		}, 1500);
	},
	strings: function (callback){
		setTimeout(function (){
			callback(null, ["a", "b", "c"]);
		}, 500);
	}	
},
function (err, results){
	console.log(results);
});