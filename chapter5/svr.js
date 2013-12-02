var http = require('http');
var language = require('./language');
var url = require('url');

function handle_incoming_request(req, res){
	var lang = url.parse(req.url,true,false).query.lan;
	
	language.create_greeter(
		lang,
		function (err, response){
			if(err){
				res.writeHead(500, {"Content-Type": "application/json"});
				res.end(JSON.stringify({error: "Language not available"}) + "\n");
			} else {
				res.writeHead(200, {"Content-Type": "application/json"} );
				res.end(JSON.stringify(response) + "\n");
			}
		}
	);
}


var svr = http.createServer(handle_incoming_request).listen(8888);