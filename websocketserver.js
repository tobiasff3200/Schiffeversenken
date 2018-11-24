var WebSocketServer = require('websocket').server;
var http = require('http');
var clients = [];
// games = [gameid][user1,user2]
var games = [];

var server = http.createServer(function(request, response) {
	// process HTTP request. Since we're writing just WebSockets
	// server we don't have to implement anything.
});
server.listen(1337, function() { });
console.log((new Date()) + " Server is listening on port 1337");

// create the server
wsServer = new WebSocketServer({
	httpServer: server
});
//
//
//
// WebSocket server
wsServer.on('request', function(request) {
	console.log((new Date()) + ' Connection from origin '+ request.origin + '.');

	var connection = request.accept(null, request.origin);
	// we need to know client index to remove them on 'close' event
	var index = clients.push(connection) - 1;
	// sending the index to the client
	var json = JSON.stringify({ type:'index', data: index });
	clients[index].sendUTF(json);

	// remember witch game this client is playing
	// if no game is started it is null
	var game = null;


	// This is the most important callback for us, we'll handle
	// all messages from users here.
	connection.on('message', function(message) {
		// trying to decode the JSON
		try {
			var json = JSON.parse(message.data);
		} catch (e) {
			console.log('Invalid JSON: ', message.data);
			return;
		}

		if(json.type === 'shoot'){
			console.log("Shoot from "+index+" at "+column+":"+row);;
		}
	// end of onMessage
	});

	// user disconnected
	connection.on('close', function(connection) {
		console.log((new Date()) + " Peer "+ connection.remoteAddress + " disconnected.");

		// remove user from the list of connected clients
		clients.splice(index, 1);
	});

// end of onRequest
});
//
//
//


// Send am json message
//var json = JSON.stringify({ type:'message', data: obj });
//for (var i=0; i < clients.length; i++) {
//  clients[i].sendUTF(json);
//}
