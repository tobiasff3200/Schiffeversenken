#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
var clients = [];
// games = [gameid][user1,user2]
var games = [];

var server = http.createServer(function(request, response) {
	// process HTTP request. Since we're writing just WebSockets
	// server we don't have to implement anything.
});
server.listen(1337, function() {
	console.log((new Date()) + " Server is listening on port 1337");
});
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
	//var json = JSON.stringify({ type:'index', data: index });
	//clients[index].sendUTF(json);
	console.log(index);



	// This is the most important callback for us, we'll handle
	// all messages from users here.
	connection.on('message', function(message) {
		// trying to decode the JSON
		// try {
		// 	var json = JSON.parse(message.data);
		// } catch (e) {
		// 	console.log('Invalid JSON: ', message.data);
		// 	return;
		// }
		var message = JSON.stringify(message);
		console.log("Send message: "+message);
		clients[gameSelect(index)].sendUTF(message);

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
function gameSelect(index){
	if(index%2 == 0){
		return index+1;
	}
	return index-1;
}

// Send am json message
//var json = JSON.stringify({ type:'message', data: obj });
//for (var i=0; i < clients.length; i++) {
//  clients[i].sendUTF(json);
//}
