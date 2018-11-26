class DataManager{
	constructor(GameManager){

	}
	this.sendedData = [];

	send(receiver, type, data){
		//convert data in JSON
		if(type == "Ask"){
			do{
				var number = Math.random();
			}
			while(this.sendedData.indexOf(number)!=-1);
			var json = "{"
					+"\"number\":\""+number+"\","
					+"\"receiver\": \""+receiver+"\","
					+"\"type\": \""+type+"\","
					+"\"data\": \""+data+"\""
					+"}";
			//send as JSON
			connection.send(json);
			this.sendedData.push(number);
		}
		var json = "{"
				+"\"receiver\": \""+receiver+"\","
				+"\"type\": \""+type+"\","
				+"\"data\": \""+data+"\""
				+"}";
		//send as JSON
		connection.send(json);
	}

	receiveData(data){
		//if typ == "Reply" -> execute gameManager.receiveReply(data);
		if(data.type === "Reply"){
			GameManager.receiveReply(data);
		}
		//if typ == "Ask" && number in sendedData[][] -> execute gameManager.receiveResult(data)
		if(data.type === "Ask" && this.sendedData.indexOf(data.number) != -1){
			GameManager.receiveResult(data);
		}
		//if typ == "Ask" && number NOT in sendedData[][] -> execute gameManager.receiveQuestion(data)
		if(data.type === "Ask" && this.sendedData.indexOf(data.number) == -1){
			GameManager.receiveQuestion(data);
		}
	}
}
