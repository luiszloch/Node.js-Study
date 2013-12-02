/* OBJECTIVE: Create a server that can respond to two distincts requests:
 * 1) retrieve list of albums;
 * 2) retrieve list of contents of a particular album;
 * SCPECIFICATIONS:
 * a) Communication should be done in JSON;
 * b) List of albums must contain only directories;
 * c) List of contents of a given album should contain only files;
 * d) Failed responses should inform the error type (404 vs. 500);
 * STRUCTURE:
 * a) Handle requests and route to the specific handler;
 * b) Handle specific request and forward to the get info function. On callback,
 *	  forward success or failure to the respective sender function;
 * c) Get lists of albums and contents;
 */

http = require('http');
fs = require('fs');
url = require('url');

function send_failure(res, code, msg){
	res.writeHead(code, { "Content-Type": "application/json"});
	var error = { code: code, msg: msg};
	res.end(JSON.stringify(error) + "\n");
	console.log("Failure response sent with code " + code + ".");
}

function send_success(res, obj){
	res.writeHead(200, {"Content-Type": "application/json"});
	res.end(JSON.stringify(obj) + "\n");
	console.log("Success response sent.");
}

function load_album_list(callback){
	console.log("Loading list of albums...");
	
	fs.readdir(
		"albums",
		function(err, files){
			if(err){
				callback(err);
				return;
			}
			var list = [];
			(function iterator(index){
				if(index == files.length){
					callback(null, list);
					return;
				}
				fs.stat(
					"albums/" + files[index],
					function(err, stats){
						if(err){
							callback(err);
							return;
						}
						if(stats.isDirectory()){
							var obj = { name: files[index]};
							list.push(obj);
						}
						iterator(index + 1);
					}
				);
			})(0);
		}
	);
}

function handle_get_albums_list(req, res){
	console.log("Handling request to load album list...");
	
	load_album_list(
		function(err, albums){
			if(err){
				console.log("Sending failure response as album list could not be retrieved.");
				send_failure(res, 500, "Request could not be completed.");
				return;
			}
			console.log("Sending success response as list of albums was correctly retrieved.");
			var obj = {albums: albums};
			send_success(res, obj);
		}
	);
}

function load_album(page_num, page_size, album_name, callback){
	console.log("Loading contents for album '" + album_name + "'.");
	
	fs.readdir(
		"albums/" + album_name,
		function(err, files){
			if(err){
				err.code = 404;
				callback(err);
				return;
			}
			var photos = [];
			
			(function iterator(index){
				if(index == files.length){
					var ps;
					// slice fails gracefully if params are out of range
					ps = photos.splice(page_num * page_size, page_size);
					var obj = { short_name: album_name,
								photos: ps };
					callback(null, obj);
					return;
				}
				fs.stat(
					"albums/" + album_name + "/" +  files[index],
					function (err, stats){
						if(err){
							err.code = 500,
							callback(err);
							return;
						}
						if(stats.isFile()){
							if(files[index].substr(files[index].length - 4, files[index].length) == ".jpg"){
								var obj = { photo: files[index] };
								photos.push(obj);
							}
						}
						iterator(index + 1);
					}
				);
			})(0);
		}
	);
}

function handle_get_album_content(req, res){
	var pathname = url.parse(req.url,true,false).pathname; // '/albums/italy.json'
	var page_num = url.parse(req.url,true,false).query.page; // 1
	var page_size = url.parse(req.url,true,false).query.page_size; // 20
	var album_name = pathname.substr(8, pathname.length - 13); 
	
	if (isNaN(parseInt(page_num))) page_num = 0;
	if (isNaN(parseInt(page_size))) page_size = 100;
	
	/* Alternative way to get query paramenters: 
	 * var parsed_query = url.parse(req.url,true,false).query;
	 * var page_num_alt = parsed_query.page ? parsed_query.page : 0;
	 * console.log(page_num_alt); 
	 */
	
	console.log("Handling request to load content for album '" + album_name + "'." );
	
	load_album(
		page_num,
		page_size,
		album_name,
		function(err, contents){
			if(err && err.code == 404){
				console.log("Sending failure response as album could not be found...");
				send_failure(res, 404, "Album could not be found.");
			} else if (err && err.code == 500){
				console.log("Sending failure response as request for album '" + album_name + "' could not be completed...");
				send_failure(res, 500, "Request could not be completed");
			} else {
				var obj = { album_contents: contents };
				send_success(res, obj);
			}
		}
	);
}

function do_rename (old_album_name, new_album_name, callback){

	fs.rename(
		"albums/" + old_album_name,
		"albums/" + new_album_name,
		callback);
}

function handle_rename_album(req, res){
	
	// 1. Get the album name from the URL
	var pathname = url.parse(req.url,true,false).pathname; // '.../albums/italy/rename.json'
	var parts = pathname.split("/");
	if (parts.length != 4){
		send_failure(res, 404, "Invalid resource: " + pathname);
		return;
	}
	
	var album_name = parts[2]; 
	
	// 2. Get the POST data for the request. This will have the JSON for the new name for the album.
	
	var json_body = '';
	req.on(
		'readable',
		function(){
			var d = req.read();
			if(d){
				if(typeof d == 'string'){
					json_body += d;
				} else if (typeof d == 'object' && d instanceof Buffer){
					json_body += d.toString('utf8');
				}
			}
		}
	);
	
	// 3. When we have all the post data, amke sure we have a valid data and then try to do the rename.
	
	req.on(
		'end',
		function (){
			// did we get a valid body?
			if(json_body){
				try {
					var album_data = JSON.parse(json_body);
					if(!album_data.album_name){
						// Body came without album name.
						console.log("JSON without album name.");
						send_failure(res, 400, "JSON without album name.");
						return;
					}
				} catch (e) {
					//Got body but not valid JSON
					console.log("The body is not a valid JSON.")
					send_failure(res, 400, "The body is not a valid JSON");
					return;
				}
				
				// 4. Perform rename!
				
				do_rename(
					album_name,				// old
					album_data.album_name,	// new
					function (err, results){
						if(err && err.code == "ENOENT") {
							console.log("Could not find album " + album_name + ".");
							send_failure(res, 404, "Could not find album " + album_name);
							return;
						}
						else if(err){
							console.log("Could not rename album " + album_name + ".");
							send_failure(res, 500, "Could not rename album " + album_name);
							return;
						} 
						console.log("Album renamed from " + album_name + " to " + album_data.album_name + " successfully.");
						send_success(res, {status: "Album renamed from " + album_name + " to " + album_data.album_name });
					}
				);
			}
			else {
				// didn't get a body
				console.log("JSON without body." );
				send_failure(res, 400, "JSON without body.");
			}
		}
	);
}

function handle_incoming_requests(req, res){
	var pathname = url.parse(req.url,true,false).pathname; // '/albums/italy.json'
	console.log("INCOMING REQUEST TO: " + req.method + " " + pathname);
	
	if(pathname == "/albums.json"){
		console.log("Handling request to 'get_albums_list'...");
		handle_get_albums_list(req, res);
	}
	else if (pathname.substr(pathname.length - 12) == '/rename.json' && req.method.toLowerCase() == 'post'){
		console.log("Sending request to 'handle_rename_album'");
		handle_rename_album(req, res);
	}
	else if(pathname.substr(0,7) == "/albums" && pathname.substr(pathname.length - 5) == ".json"){
		console.log("Handling request to 'get_album_content'...");
		handle_get_album_content(req, res)
	}
	else if(pathname.substr(pathname.length - 5) != ".json") {
		console.log("Sending failure response as request in not JSON...");
		send_failure(res, 400, "Request format is invalid. It needs to be JSON.");
	}
	else if(path.substr(0,12) == "/collections") {
		console.log("Sending failure response as request URL has been moved to 'albums'...");
		send_failure(res, 301, "The requested URI has moved permanently to '/albums'.");
	}
	else{
		console.log("Sending failure response due to invalid URI...");
		send_failure(res, 404, "This URI is invalid.");
	}
}

var svr = http.createServer(handle_incoming_requests).listen(8888);

