function DataManager(gameManager){

    this.websocket = new Websocket(this);
    this.sendedData = [];


	this.randomFloatNotInArray = function(){
		var number;
        do{
				number = Math.random();
		}
		while(this.sendedData.indexOf(number)!=-1);
		return number;
	}

	this.send = function(receiver, type, data, number){
		//convert data in JSON
        var randNum = number;
		if(type == "Ask" && randNum == null){
            randNum = this.randomFloatNotInArray();
            this.sendedData.push(number);
        }

        var json = "{"
					+"\"number\":\""+number+"\","
					+"\"receiver\": \""+receiver+"\","
					+"\"type\": \""+type+"\","
					+"\"data\": \""+data+"\""
					+"}";

        //send as JSON
		this.websocket.connection.send(json);
	}

	this.receiveData = function(input){
		//if typ == "Reply" -> execute gameManager.receiveReply(data);
		if(input.type === "Reply"){
			gameManager.receiveReply(input.data);
		}
		//if typ == "Ask" && number in sendedData[] -> execute gameManager.receiveResult(data)
		var index = this.sendedData.indexOf(input.number);
        if(input.type === "Ask" && index != -1){
			gameManager.receiveResult(input.data);
            this.sendedData.splice(index, 1);
		}
		//if typ == "Ask" && number NOT in sendedData[] -> execute gameManager.receiveQuestion(data)
		if(input.type === "Ask" && index == -1){
			gameManager.receiveQuestion(input.data, input.number);
		}
	}
}
