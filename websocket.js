function Websocket(DataM){

    this.setup = function(){
        this.checkBrowser();
        this.initializeConnection();
    }

	this.checkBrowser = function(){
		// if user is running mozilla then use it's built-in WebSocket
		window.WebSocket = window.WebSocket || window.MozWebSocket;
		// if browser doesn't support WebSocket, just show some notification and exit
		if (!window.WebSocket) {
			alert('Sorry, but your browser doesn\'t support WebSocket.');
		}
	}

	// open connection
	this.connection = new WebSocket('ws://schiffeversenken.ddns.net:1337');

	// catching errors with the connection
	this.connection.onerror = function (error) {
		alert('Sorry, but there\'s some problem with your connection or the server is down.');
	};

	// onopen() is executed once the connection is established
	this.connection.onopen = function () {
		console.log('Connected to the Server');
	};

	// This event is trigert everytime a message is send from the server
	this.connection.onmessage = function (message){
		// trying to decode the JSON
		if(!(typeof(message.data) === 'object')){
			try {
				var json = JSON.parse(message.data);
			} catch (e) {
				console.log('Invalid JSON: ', message);
				console.log(e);
				return;
			}
		}else{
			json = message;
		}
		//this.dataManager.receiveData(json);
		DataM.receiveData(json.utf8Data);
	}
}
