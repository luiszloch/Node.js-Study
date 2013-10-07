net = require('net');

var sockets = [];

var server = net.createServer(function(socket){
	sockets.push(socket);
	
	socket.on('data', function(message){
		
		for (var i = 0; i < sockets.length; i++){
			if (sockets[i] == socket) continue;
			sockets[i].write(sockets.indexOf(socket.toString().concat(": ",message));
		}		
	});
	
	socket.on('end', function(){
		var i = sockets.indexOf(socket);
		sockets.splice(i, 1);
	});
});

server.listen(8000);