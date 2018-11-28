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
            this.sendedData.push(randNum);
        }

        // var json = '{'
		// 			+'"number":"'+randNum+'",'
		// 			+'"receiver": "'+receiver+'",'
		// 			+'"type": "'+type+'",'
		// 			+'"data": "'+data+'"'
		// 			+'}';

        //send as JSON
		// console.log(json);
		this.websocket.connection.send(
			JSON.stringify({ number: randNum, receiver: receiver, type: type, data: data}));
			console.log(JSON.stringify({ number: randNum, receiver: receiver, type: type, data: data}));
		// this.websocket.connection.send(json);
	}

	this.receiveData = function(input){

		if(!(typeof(input) === 'object')){
			try {
				var json = JSON.parse(input);
			} catch (e) {
				console.log('Invalid JSON: ', input);
				console.log(e);
				return;
			}
		}

		//if typ == "Reply" -> execute gameManager.receiveReply(data);
		if(json.type === "Reply"){
			gameManager.receiveReply(json.data);
		}
		//if typ == "Ask" && number in sendedData[] -> execute gameManager.receiveResult(data)
		var index = this.sendedData.indexOf(json.number);
        if(json.type === "Ask" && index != -1){
			gameManager.receiveResult(json.data);
            this.sendedData.splice(index, 1);
		}
		//if typ == "Ask" && number NOT in sendedData[] -> execute gameManager.receiveQuestion(data)
		if(json.type === "Ask" && index == -1){
			gameManager.receiveQuestion(json.data, json.number);
		}
	}
}
