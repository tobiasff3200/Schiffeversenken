function DataManager(){

    this.websocket = new Websocket(this);
    this.sendedData = [];


    this.setup = function(gameManager, chat){
        this.gameManager = gameManager;
        this.chat = chat;
    }
    
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
        
        //try to send as JSON
        this.websocket.connection.send(json);
	}

	this.receiveData = function(input){
        //Nachricht an den GameManager
        if(input.receiver == "GM"){
            //if typ == "Reply" -> execute gameManager.receiveReply(data);
            if(input.type === "Reply"){
                this.gameManager.receiveReply(input.data);
            }
            //if typ == "Ask" && number in sendedData[] -> execute gameManager.receiveResult(data)
            var index = this.sendedData.indexOf(input.number);
            if(input.type === "Ask" && index != -1){
                this.gameManager.receiveResult(input.data);
                this.sendedData.splice(index, 1);
            }
            //if typ == "Ask" && number NOT in sendedData[] -> execute gameManager.receiveQuestion(data)
            if(input.type === "Ask" && index == -1){
                this.gameManager.receiveQuestion(input.data, input.number);
            }   
        }else
        //Nachricht an den Chat
        if(input.receiver == "CH"){
            //wenn reply führe postMsg aus
            //vermutlich wird es nichts anderes mehr geben als Reply
            if(input.type === "Reply"){
                this.chat.postMsg(input.data);
            }
        }
	}
}
