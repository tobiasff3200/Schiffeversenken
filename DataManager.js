function DataManager(){

    this.websocket = new Websocket(this);
    this.sendedData = [];
    this.sendedDataComputer = [];
	//speichert in welchem Spiel sich der Nutzer befindet
	this.gameToken = null;


    this.setup = function(gameManager, chat, computer){
        this.gameManager = gameManager;
        this.chat = chat;
        this.computer = computer;
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
            if(computer != null && receiver == "GM"){
                this.sendedDataComputer.push(randNum);
            }else{
                this.sendedData.push(randNum);
            }
        }

        console.log("Erfolgreich gesendet: " + JSON.stringify({ number: randNum, receiver: receiver, type: type, data: data}));
        //wenn der empfänger nicht der Computer ist und es den Computer nicht gibt
        if(receiver != "Comp" && this.computer == null){ //
            this.websocket.connection.send(JSON.stringify({ number: randNum, receiver: receiver, type: type, data: data}));
            return;
        }

        //wenn der Empfänger der Computer ist oder der Computer exestiert, dann brauch die Nachricht nicht an der Server gesendet werden (spiel offline)
        this.receiveData(JSON.stringify({ number: randNum, receiver: receiver, type: type, data: data}));

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
            this.receiveDataForGame(json, "GM");
        }else
        //Nachricht an den Computer
        if(json.receiver == "Comp"){
            this.receiveDataForGame(json, "Comp");
        }else
        //Nachricht an den Chat
        if(json.receiver == "CH"){
            //wenn reply führe postMsg aus
            //vermutlich wird es nichts anderes mehr geben als Reply
            if(json.type === "Reply"){
                this.chat.postMsg(json.data);
            }
        }//else{
        //if(json.receiver == "DM"){

			if(json.type === "gameCreated"){
				this.gameCreated(json.data);
			}
			if(json.type === "gameJoined"){
				this.gameJoined(json.data);
			}
			if(json.type === "enemyDisconnected"){
				this.enemyDisconnected();
			}
        //}
	}


    this.receiveDataForGame = function(json, rec){
        var receiver = rec == "GM" ? this.gameManager : (rec == "Comp" ? this.computer : null);
        //if typ == "Reply" -> execute gameManager.receiveReply(data);
        if(json.type === "Reply"){
            receiver.receiveReply(json.data);
            return;
        }

        var arrayToSearch = [];
        if(rec == "GM"){
            arrayToSearch = this.sendedData;
        }else
        if(rec == "Comp"){
            arrayToSearch = this.sendedDataComputer;
        }
        var index = arrayToSearch.indexOf(json.number);
        //if typ == "Ask" && number in sendedData[] -> execute gameManager.receiveResult(data)
        if(json.type === "Ask" && index != -1){
            receiver.receiveResult(json.data);
            arrayToSearch.splice(index, 1);
            return;
        }
        //if typ == "Ask" && number NOT in sendedData[] -> execute gameManager.receiveQuestion(data)
        if(json.type === "Ask" && index == -1){
            receiver.receiveQuestion(json.data, json.number);
            return;
        }
    }

	//--------------GameSelect------------------------------------------------//
	this.createGame = function(){
        this.send("GM", "createGame", "", "");
	}

	this.gameCreated = function(token){
		this.gameToken = token;
		$("#createGame, #joinGame, #playOffline").addClass("hidden");
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

	this.createComputer = function(){
		playOffline = true;
		closeOverlay();
		setup();
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
	$("#createGame, #joinGame, #playOffline").addClass("hidden");
}

function closeOverlay(){
	$('#overlay').addClass('hidden');
    gameManager.waitingForServer = false;
}
