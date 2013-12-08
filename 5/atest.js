/* Get list of photos per album
 * step 1: get list of albums by calling 'albums' function in 'albums.js' module.
 * Step 2 : ask for list of photos within a give album by calling 'Album.photo' function
 * in 'album.js' module
 * Step 3: log results.
 */


var amgr = require('./test_proj/node_modules/album_manager');
//var albums = require('./album_mgr/lib/albums.js')

amgr.albums('./test_proj/', function (err, albums){
	if (err) {
		console.log("Unexpected error: " + JSON.stringify(err));
		return;
	}
	
	(function iterator(index){
		if(albums.length == index){
			console.log("Done");
			return;
		}
		
		albums[index].photos(function(err, photos){
			if(err) {
				console.log("Err loading album: " + JSON.stringify(err));
				return;
			}
			console.log(albums[index].name);
			console.log(JSON.stringify(photos));
			console.log("");
			iterator (index + 1);
		});
	})(0);
});