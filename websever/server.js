
var http = require('http');
var fs = require('fs'); 
var httpServer = http.createServer(requestHandler);
var url = require('url');
httpServer.listen(8080);

function requestHandler(req, res) {

	var parsedUrl = url.parse(req.url);
	console.log("The Request is: " + parsedUrl.pathname);
		
	fs.readFile(__dirname + parsedUrl.pathname, 
		// Callback function for reading
		function (err, data) {
			// if there is an error
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + parsedUrl.pathname);
			}
			// Otherwise, send the data, the contents of the file
			res.writeHead(200);
			res.end(data);
  		}
  	);
  	
  	/*
  	res.writeHead(200);
  	res.end("Life is wonderful");
  	*/
}


console.log("Server is running and waiting8080");

// WebSocket Portion
// WebSockets work with the HTTP server
var socketio = require('socket.io');
var io = socketio.listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {
	
		
		socket.on('newId',function(data){
            io.sockets.emit('newId',data);
          
        });

		socket.on('bone', function(bone) {
			//console.log(bone);
		     
			io.sockets.emit('bone', bone);
		});

		socket.on('user', function(a) {
			//console.log();
		
			io.sockets.emit('user', a);
		});
	
		socket.on('disconnect', function() {
			console.log("Client has disconnected");
		});
	}
);







