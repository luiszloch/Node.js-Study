http = require('http');
fs = require('fs');

// implement function send_success

// implement function send_failure

// implement function invalid_resource

// implement function no_such_album

function make_error(err, msg){
	var e = new Error(msg);
	e.code = err;
	return e;
}

function load_album_list(callback){
	fs.readdir(
		"albums",
		function (err, files){
			if(err){
				callback(make_error("file_error", JSON.stringify(err)));
				return;
			}
			
			var only_dirs = [];
			
			(function iterator(index){
				if (index == files.length){
					callback(null, only_dirs);
					return;
				}
				
				fs.stat(
					"albums/" + files[index],
					function (err, stats){
						if (err) {
							callback(make_error("file_error", JSON.stringify(err)));
							return;
						}
						if (stats.isDirectory()){
							var obj = { name: files[index]};
							only_dirs.push(obj);
						}
						iterator(index + 1)
					}
				);
			})(0);
		}
	);
}

function handle_list_albums(req, res){
	load_album_list(
		function (err, albums) {
			if(err){
				send_failure(res, 500, err);
				return;
			}
			send_success(res, { albums: albums});
		}
	);
}

// implement function load_album

function handle_get_album(req, res) {
	
	// format of request is /albums/album_name.json
	
	var album_name = req.url.substr(7, req.url.length - 12);
	
	load_album(
		album_name,
		function (err, album_contents){
			if (err && err.error == "no_such_album") {
				send_failure(res, 404, err);
			} else if (err) {
				send_failure (res, 500, err);
			} else {
				send_success(res, { album_data: album_contents});
			}
		}
	);
}

function handle_incoming_request(req, res){
	
	console.log("INCOMING REQUEST: " + req.method + " " + req.url );
	
	if (req.url == '/albums.json'){
		handle_list_albums(req, res);
	} else if (req.url.substr(0, 7) == '/albums' && req.url.substr(req.url.length - 5) == '.json'){
		handle_get_album(req, res);
	} else {
		send_failure(res, 404, invalid_resource());
	}
}

var s = http.createServer(handle_incoming_request).listen(8080);