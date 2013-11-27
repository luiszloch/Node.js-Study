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
	res.writeHead(code, { "content-type": "application/json"});
	var error = { code: code, msg: msg};
	res.end(JSON.stringify(error) + "\n");
	console.log("Failure response sent with code " + code + ".");
}

function send_success(res, obj){
	res.writeHead(200, {"content-type": "application/json"});
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
			var max_files = page_num * page_size;
			var photo_counter = 0;
			var photos = [];
			
			(function iterator(index){
				if(index == files.length || photo_counter == max_files){
					callback(null, photos);
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
								photo_counter ++;
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
			if(err){
				if(err.code == 404){
					console.log("Sending failure response as album could not be found...");
					send_failure(res, 404, "Album could not be found.");
					return;
				}
				console.log("Sending failure response as request for album '" + album_name + "' could not be completed...");
				send_failure(res, 500, "Request could not be completed");
				return;
			}
			var page_count = Math.ceil(contents.length / page_size);
			var view = [];
			for (var i = 0; i < page_count; i++){
				var page_content = [];
				page_content = contents.slice(page_size * i, page_size * (i + 1));
				var obj = {page: page_content};
				view.push(obj); 
			}
			send_success(res, view);
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
	else if(pathname.substr(0,7) == "/albums" && pathname.substr(pathname.length - 5, pathname.length) == ".json"){
		console.log("Handling request to 'get_album_content'...");
		handle_get_album_content(req, res)
	}
	else if(pathname.substr(pathname.length - 5, pathname.length) != ".json") {
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

