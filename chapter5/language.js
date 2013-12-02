// Module to support language functions

function Greeter (lang, callback){
	
	(function translate (err, sentence){
		switch(lang){
			case "en": callback(null, "Hello!"); return;
			case "de": callback(null, "Hallo!"); return;
			case "pt": callback(null, "Olá!"); return;
			default: callback(err); return;
		}
	})(callback);
}

exports.create_greeter = function (lang, callback){
	Greeter(lang, callback);
}