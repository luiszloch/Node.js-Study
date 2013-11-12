http = require('http');
fs = require('fs');

function list_albums(callback){
	fs.readdir(
		"Albums",
		function (err, files){
			if(err){
				callback(err);
				return;
			}
			callback(null,files);
		}
	);
}




function handle_incoming_request(req, res){
	
	console.log("INCOMING REQUEST: " + req.method + " " + req.url );
	
	list_albums(
		function(err, albums){
			if(err){
				res.writeHead(503, { 'Content-Type' : 'application/JSON'});
				res.end(JSON.stringify(err) + "\n");
				return;
			}
			var out = { error : null, 
				data : { albums : albums } };
			res.writeHead(200, { 'Content-Type' : 'text/plain'});
			res.end(JSON.stringify(out) + "\n");
		}
	);
}

var s = http.createServer(handle_incoming_request).listen(8080);