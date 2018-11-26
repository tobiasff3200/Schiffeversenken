function DataManager(GameM){

		this.gameManager = GameM;
		this.websocket = new Websocket(this);
		this.sendedData = [];


	this.randomFloatNotInArray = function(){
		do{
				var number = Math.random();
		}
		while(this.sendedData.indexOf(number)!=-1);
		return number;
	}

	this.send = function(receiver, type, data, number = this.randomFloatNotInArray()){
		//convert data in JSON
		if(type == "Ask"){
			var json = "{"
					+"\"number\":\""+number+"\","
					+"\"receiver\": \""+receiver+"\","
					+"\"type\": \""+type+"\","
					+"\"data\": \""+data+"\""
					+"}";
			//send as JSON
			this.websocket.connection.send(json);
			this.sendedData.push(number);
		}
		var json = "{"
				+"\"receiver\": \""+receiver+"\","
				+"\"type\": \""+type+"\","
				+"\"data\": \""+data+"\""
				+"}";
		//send as JSON
		this.websocket.connection.send(json);
	}

	this.receiveData = function(data){
		//if typ == "Reply" -> execute gameManager.receiveReply(data);
		if(data.type === "Reply"){
			gameManager.receiveReply(data);
		}
		//if typ == "Ask" && number in sendedData[][] -> execute gameManager.receiveResult(data)
		if(data.type === "Ask" && this.sendedData.indexOf(data.number) != -1){
			gameManager.receiveResult(data);
		}
		//if typ == "Ask" && number NOT in sendedData[][] -> execute gameManager.receiveQuestion(data)
		if(data.type === "Ask" && this.sendedData.indexOf(data.number) == -1){
			gameManager.receiveQuestion(data);
		}
	}
}
