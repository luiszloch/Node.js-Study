/* OBJECTIVE:
 * Server should to list albums and its contents upon requests.
 * DELVERABLES:
 * 1. Create a server.
 * 2. Route different requests.
 * 3. List albums.
 * 4. List the contents within the albums.
 * SPECIFICATIONS:
 * a. Handle and treat errors.
 * b. Communicate in JSON.
 * c. Accept only directories as albums.
 */


http = require('http');
fs = require('fs');

function send_failure(res, code, msg){
	res.writeHead(code, { "content-type" : "application/json" });
	var obj = { error: msg };
	res.end(JSON.stringify(obj) + "\n");
	console.log("Error reported to client.");
}

function send_success(res, albums){
	res.writeHead(200, { "content-type": "application/json"});
	res. end(JSON.stringify(albums) + "\n");
	console.log("Response sent to client.");
}

function load_album_list(callback){
	console.log("Trying to load list of albums...")
	fs.readdir(
		'albums',
		function(err, files){
			if(err){
				console.log("List of albums failed to load.");
				callback(err);
				return;
			}
			var albums_list = [];
			
			(function iterator(index){
				if(index == files.length){
					console.log("List of albums is done loading.")
					callback(null, albums_list);
					return;
				}
				
				fs.stat(
					'albums/' + files[index],
					function(err, stats){
						if(err){
							console.log("List of albums failed to load.");
							callback(err);
							return;
						}	
						if(stats.isDirectory()){
							var obj = { name: files[index]};
							albums_list.push(obj);
						}
						iterator(index + 1);
					}
				);
			})(0);
		}
	);
}

function load_album(album_name, callback){
	console.log("Trying to load list of content for album " + album_name + "...");
	fs.readdir(
		'albums/' + album_name,
		function(err, files){
			if(err){
				console.log("Album " + album_name + " coundn't be found.");
				err.code = 404;
				callback(err);
				return;
			}
			var album_contents = [];
			
			(function iterator(index){
				if(index == files.length){
					console.log(album_name + " content is done loading.");
					callback(null, album_contents);
					return;
				}
				
				fs.stat(
					'albums/' + album_name + '/' + files[index],
					function(err, stats){
						if(err){
							console.log("Failed to load content from album " + album_name + ".");
							err.code = 500;
							callback(err);
							return;
						}
						if(stats.isFile()){
							var obj = {photos: files[index]};
							album_contents.push(obj);
						}
						iterator(index + 1);
					}
				);
			})(0);
		} 
	);
}

function handle_get_album(req, res){
	// format of the request is for /albums/album_name.json
	var album_name = req.url.substr(8, req.url.length - 13);
	console.log("Handling request to load_album: " + album_name);
	load_album( 
		album_name,
		function(err, album_contents){
			if(err && err.code == 404){
				console.log("Sending a failure response because requested album coundn't be found");
				send_failure(res, 404, "The requested album coundn't be found.");
			} else if (err && err.code == 500){
				console.log("Sending a failure response due to unsuccessfull retrival of album content.");
				send_failure(res, 500, "The server couldn't answer your request.");
			} else {
				console.log("Sending a success response as album was successfully loaded.");
				send_success(res, { album: album_name, content: album_contents });
			}
		}
	);
}

function handle_list_albums(req, res){
	console.log("Handling request to load_album_list.");
	load_album_list( function(err, albums){
		if(err){
			console.log("Sending a failure response due to unsuccessfull retrival of album list.");
			send_failure(res, 500, "The server couldn't retrieve album list.");
			return;
		} 
		console.log("Sending a success response as album list was successfully retrieved.");
		send_success(res, { albums: albums});
	});
}

function handle_incoming_requests(req, res){
	
	/* Expected requests to:
	 * list albums: /albums.json
	 * list contents within the albums: /albums/album_name.json
	 */
	
	console.log("INCOMING REQUEST TO: " + req.method + " " + req.url);
	var path = req.url;
	
	if(path == "/albums.json"){
		console.log("Routing request to 'handle_list_albums'..");
		handle_list_albums(req, res);
		
	} else if(path.substr(0,8) == "/albums/" && path.substr(path.length - 5, 5) == ".json"){
		console.log("Routing request to 'handle_get_album'..");
		handle_get_album(req, res);
		
	} else {
		console.log("Sending failure due to non matching Request-URI..");
		send_failure(res, 404, "The server has not found anything matching the Request-URI");
	}
}

var svr = http.createServer(handle_incoming_requests).listen(8000);