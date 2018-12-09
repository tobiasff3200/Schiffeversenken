function DataManager(){

    this.websocket = new Websocket(this);
    this.sendedData = [];
	//speichert in welchem Spiel sich der Nutzer befindet
	this.gameToken = null;


    this.setup = function(gameManager, chat){
        this.gameManager = gameManager;
        this.chat = chat;
    }

	this.randomFloatNotInArray = function(){
		var number;
        do{
            number = Math.floor(Math.random()*100);
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

		this.websocket.connection.send(
			JSON.stringify({ number: randNum, receiver: receiver, type: type, data: data}));
			console.log("Erfolgreich gesendet: " + JSON.stringify({ number: randNum, receiver: receiver, type: type, data: data}));
		}

	this.receiveData = function(input){
        var json;
        if(!(typeof(input) === 'object')){
			try {
				json = JSON.parse(input);
			} catch (e) {
				console.log('Invalid JSON: ', input);
				console.log(e);
				return;
			}
        }else{
			json = input;
		}
        print("Empfangen:");
        console.log(json);

        //Nachricht an den GameManager
        if(json.receiver == "GM"){
            //if typ == "Reply" -> execute gameManager.receiveReply(data);
            if(json.type === "Reply"){
                this.gameManager.receiveReply(json.data);
            }
            //if typ == "Ask" && number in sendedData[] -> execute gameManager.receiveResult(data)
            var index = this.sendedData.indexOf(json.number);
            if(json.type === "Ask" && index != -1){
                this.gameManager.receiveResult(json.data);
                this.sendedData.splice(index, 1);
            }
            //if typ == "Ask" && number NOT in sendedData[] -> execute gameManager.receiveQuestion(data)
            if(json.type === "Ask" && index == -1){
                this.gameManager.receiveQuestion(json.data, json.number);
            }
			// if type == "gameCreated"
			if(json.type === "gameCreated"){
				this.gameCreated(json.data);
			}

			if(json.type === "gameJoined"){
				this.gameJoined(json.data);
			}
			if(json.type === "enemyDisconnected"){
				this.enemyDisconnected();
			}
        }else
        //Nachricht an den Chat
        if(json.receiver == "CH"){
            //wenn reply führe postMsg aus
            //vermutlich wird es nichts anderes mehr geben als Reply
            if(json.type === "Reply"){
                this.chat.postMsg(json.data);
            }
        }
	}

	//--------------GameSelect------------------------------------------------//
	this.createGame = function(){
			this.send("GM", "createGame", "", "");
	}
    
	this.gameCreated = function(token){
		this.gameToken = token;
		$("#createGame, #joinGame").addClass("hidden");
		$("#gameInfo").text("Game Token: "+token);
		$("#close, #gameInfo").removeClass("hidden");
	}
    
	this.joinGame = function(token){
			this.send("GM", "joinGame", token, "");
	}
    
	this.gameJoined = function(token){
		if(token == -1){
			alert("joining failed");
		}else{
			this.gameToken = token;
			$('#overlay').hide(1000);
			console.log("Joined succesfully");
		}
	}
	this.checkUrl = function(){
		var url_string = window.location.href;
		var url = new URL(url_string);
		var c = url.searchParams.get("game");
		if(c != null){
			console.log(c);
			this.joinGame(c);
		}else{
			console.log("No game found in URL");
		}
	}
    
	this.enemyDisconnected = function(){
		alert("Enemy disconnected");
	}
	//--------------End of GameSelect-----------------------------------------//
}

function changeOverlay(){
	$("#gameToken, #joinGame2").removeClass("hidden");
	$("#createGame, #joinGame").addClass("hidden");
}
function closeOverlay(){
	$('#overlay').addClass('hidden');
    gameManager.waitingForServer = false;
}
