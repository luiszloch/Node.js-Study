var fs = require('fs');

fs.open('notes.txt', 'r', function (err, handle){
	if (err){
		console.log("Error: " + err.code + " (" + err.message + " )");
		return;
	} var buf = new Buffer(10000);
	fs.read(handle, buf, 0, 10000, null, function(err, length){
		if(err){
			console.log("Error: " + err.code + "( " + err.message + " )");
		} console.log(buf.toString('utf8', 0, length));
		fs.close(handle, function(){
			// Do nothing...
		});
	});
});

/* fs.read(fd, buffer, offset, length, position, callback)#
 * Read data from the file specified by fd.
 * buffer is the buffer that the data will be written to.
 * offset is the offset in the buffer to start writing at.
 * length is an integer specifying the number of bytes to read.
 * position is an integer specifying where to begin reading from in the file.
 * If position is null, data will be read from the current file position.
 * The callback is given the three arguments, (err, bytesRead, buffer).
 */