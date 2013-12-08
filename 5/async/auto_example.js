var async = require("async");

async.auto({
	numbers: function(callback){
		setTimeout(function(){
			callback(null, [1, 2, 3]);
		}, 10);
	},
	strings: function(callback){
		setTimeout(function(){
			callback(null, ["a", "b", "c"]);
		}, 1000);
	},
	// do not execute this function until numbers and strings are done
	// thus_far is an object with numbers and strings as arrays.
	assemble: [ 'numbers', 'strings', function (cb, arr){
		cb(null, {
			numbers: arr.numbers.join(", "),
			strings: "'" + arr.strings.join("', '") + "'"
		});
	}]
},
// this is called at the end when all other functions have executed.
function (err, results){
	if(err)
		console.log(err);
	else
		console.log(results);
});