var http = require('http');
var	fs = require('fs');
		
function load_album_list(callback){
	fs.readdir("albums", function (err,files){
		if(err){
			callback(err);
			return;
		} else {
			callback(null,files);
		}
	});
}

function handle_incoming_requests (req, res){
	
	console.log("INCOMING REQUEST: " + req.method + " " + req.url);
	
	load_album_list(function(err, albums){
		if(err){
			res.writeHead(503, {
				"Content-Type" : "application/json"
			});
			res.end(JSON.stringify(err) + "\n");
			return;
		}
		var out
	)};
}

var s = http.createServer(handle_incoming_requests);
s.listen(8080);
