const FIELDSIZE = 10;
    
//neue Konstanten für den Computer
const EMPTYFIELD = 0;  //leeres Feld           -> unklar
const MAYMISS = -3;    //vermutlich vorbei     -> vermutung
const DEFMISS = -4;    //defenitiv Vorbei      -> sicher (ausschlussverfahren)
//neue Konstate für hit und miss damit sie < 0 sind
const HITState = -2;   //getroffene Schüsse    -> sicher
const MISSState = -1;  //nicht getroffen       -> sicher

function Computer(){
    
    //ermittelt den höchsten wert der möglich ist zu erreichen. Auf 10x10 mit 10 Schiffen a [2,2,2,2,3,3,3,4,4,5] ist es 60 
    this.maxValue = 60+20; //ggf später berechnet
    //ist zum speichern und senden der Daten des Computers zuständig
    this.gameHandler = null;
    //speichert die möglichkeiten die der Computer hat zu schießen (siehe Konstaten)
    this.stateField = [];
	// setzt die Schwierigkeit
	this.randomShootPercent = 0;

    //speichert die Koordinaten von den getroffenen Schüssen des zuletzt getroffenen Schiffes
    this.lastPositionsHit = [];
    //speichert die Position aller zerstörten Schiffe
    this.destroyedShips = [];
    //speichert die Längen der noch nicht zerstörten Schiffe
    this.shipsAliveLength = SHIPLENGTH.slice();
    
    this.showStateField = false;
    
    this.firstShots;
    
    this.setup = function(dataManager){   
        this.gameHandler = new GameManager();
        this.gameHandler.setup(dataManager, false);
        this.centerPoints = centerPoints = this.gameHandler.gameFields[1].centerPoints;
        this.stateField = this.convertGamesFieldStatesInComputerStateField(gameManager.gameFields[1].fieldStates);
        this.firstShots = 0;
        this.frameCount = 0;
    }

    this.show = function(){
        if(this.showStateField){
            this.calcAndSetTheValuesForStateField();
            this.displayStateGameField();
        }
        
        if(this.gameHandler.gameStarted && !this.gameHandler.gameEnd 
           && this.gameHandler.gameTurn%2 == 0 && this.frameCount%120 == 0){
            this.shoot();
            this.frameCount = 0;
        }
        if(this.frameCount%120 == 0)
            this.frameCount = 0;
        this.frameCount++;
    }
    
    this.callInput = function(input, data){
        if(input == "KeyPressed"){
            this.keyPressed(data[0], data[1]);
        }
    }
    
    this.keyPressed = function(key, keyCode){
        if(key == "%"){
            this.showStateField = this.showStateField ? false : true;
        }
    }
    
    this.setDificulty = function(dificulty){
		console.log("Dificulty set");
		if(dificulty != null){
			switch (dificulty) {
				case "Easy":
					this.randomShootPercent = 0.9;
					break;
				case "Middle":
					this.randomShootPercent = 0.6;
					break;
				case "Hard":
					this.randomShootPercent = 0.3;
					break;
                case "Intermediate":
                    this.randomShootPercent = 0.0;
                    break;
				default:
                    //default is easy
					this.randomShootPercent = 0.9;
			}
		}
	}
    
    this.shoot = function(){
        var rnd = random();
        if(this.lastPositionsHit.length != 0 || rnd > this.randomShootPercent){
            this.shootAtBestField();
            console.log("best");
        }else{
            this.shootRandom();
            console.log("rnd");
        }
        
    }
    
    this.shootAtBestField = function(){
        if(this.firstShots < 5 && this.lastPositionsHit.length <= 0){
            this.shootRandom();
            this.firstShots++;
        }else{
            this.calcAndSetTheValuesForStateField();
            var bestField = this.searchHighstValue();
            this.shootAtField(bestField.x, bestField.y);
        }
    }
    
    this.shootAtField = function(x, y){
        var pos = this.gameHandler.gameFields[0].centerPoints[x][y];
        this.gameHandler.shootAtClickedField(pos.x, pos.y, this.gameHandler.gameFields[0], "Computer");
    }
    
    this.searchHighstValue = function(){
        var best = createVector(0, 0);
        for(var x in this.stateField){
            for(var y in this.stateField[x]){
                if(this.stateField[best.x][best.y] < this.stateField[x][y]){
                    best = createVector(x, y);
                }
            }
        }
        return best;
    }
    
    //Shoot functions
    this.shootRandom = function(){
        this.gameHandler.shootAtRandomPosition();
    }
    
    //ruft die Methoden welche die Werte errechnen und setzten in der richtigen Reihenfolge auf
    this.calcAndSetTheValuesForStateField = function(){
        this.stateField = this.convertGamesFieldStatesInComputerStateField(gameManager.gameFields[1].fieldStates);
        this.setFieldAroundDestroyedShipsToDefMiss();
        this.setValueForPossbileHit();
        this.increaseValueForBestEvaluatedShotAtShip();
    }
    
    // auf die Felder um ein zerstörtes Schiff kann man auf keinen fall treffen 
    this.setFieldAroundDestroyedShipsToDefMiss = function(){
        for(var ship of this.destroyedShips){
            for(var pos of ship){
                this.setDEFMISSAroundHit(pos.x, pos.y);   
            }          
        }
    }
    
    //legt die Wahrscheinlichkeit fest die jedes Feld hat dass ein Schiff auf ihm steht
    //sollte ein Feld die Wahrscheinlichkeit 0 habe wird es auf DEFMISS gesetzt
    this.setValueForPossbileHit = function(){
        for(var x = 0; x < FIELDSIZE; x++){
            for(var y = 0; y < FIELDSIZE; y++){
                this.setPossibleHitForAllShips(x, y);
            }
        }
    }
    
    //basierend darauf wie viele Schüsse getroffen haben werden die Werte erhöht
    this.increaseValueForBestEvaluatedShotAtShip = function(){
        if(this.lastPositionsHit.length <= 0){
            return;
        }else
        if(this.lastPositionsHit.length == 1){
            this.increaseValueAroundLastHit();
        }else
        if(this.lastPositionsHit.length > 1){
            this.calcDirectionAndIncreaseValueForLeftAndRight();       
        }
    }    
    
//----------------Receive-Methoden-----------------------------------------------------------------//
    //es wird mit den Konstanten aus dem GameManager gerechnet!!
    this.receiveResult = function(data){
        this.gameHandler.receiveResult(data);
        if(data != null && data.length >= 3){
            var x = data[0];
            var y = data[1];
            var result = data[2];
            if(result == HIT){
                this.lastPositionsHit.push(createVector(x, y));
            }else
            if(result == DESTROYED){
                this.lastPositionsHit.push(createVector(x, y));
                this.destroyedShips.push(this.lastPositionsHit);
                this.deleteShipWithLength(this.lastPositionsHit.length);
                this.lastPositionsHit = [];
            } 
        }
        console.log("receiveResult");
    }
    
    this.receiveQuestion = function(data, requestNumber){
        console.log("receiveQuestion");
        this.gameHandler.receiveQuestion(data, requestNumber, "Computer");       
    }
         
    this.receiveReply = function(data){
        console.log("receiveReply");
        this.gameHandler.receiveReply(data);
        if(data[0] == "Ready"){
            this.gameHandler.placeShipsRandom();
            this.gameHandler.safeShipPosition();
            this.gameHandler.youReady = true;
            this.gameHandler.sendReady();
        }
    }
        
    
    
//-----------------Hilfs-Methoden------------------------------------------------------------------//
    
    this.setDEFMISSAroundHit = function(x, y){
        var x1 = parseInt(x)+1;
        var y1 = parseInt(y)+1;
        if(x-1 >= 0){
            var currField = this.stateField[x-1][y];
            this.stateField[x-1][y] = (currField != HITState) ? DEFMISS : currField;   
        }
        if(x1 < FIELDSIZE){
            currField = this.stateField[x1][y];
            this.stateField[x1][y] = (currField != HITState) ? DEFMISS : currField;  
        }
        if(y-1 >= 0){
            currField = this.stateField[x][y-1];
            this.stateField[x][y-1] = (currField != HITState) ? DEFMISS : currField;  
        }
        if(y1 < FIELDSIZE){
            currField = this.stateField[x][y1];
            this.stateField[x][y1] = (currField != HITState) ? DEFMISS : currField;  
        } 
    }

//hilfsmethoden für setValueForPossbileHit
    
    //prüft ob an der Position x, y und allen die das Schiff an der Position überdecken würde ob
    //es eine Valide Position ist und erhört den Wert der möglichen Felder
    this.setPossibleHitForAllShips = function(x, y){
        var rowImpossible = true;
        var colImpossible = true;
        for(var shipSize of this.shipsAliveLength){
            if(this.checkPossiblePosForShipInRow(x, y, shipSize) && this.stateField[x][y] >= 0){
                this.increaseValueForPossbileHitInRow(x, y, shipSize);
                rowImpossible = false;
            }
            
            if(this.checkPossiblePosForShipInCol(x, y, shipSize) && this.stateField[x][y] >= 0){
                this.increaseValueForPossbileHitInCol(x, y, shipSize);
                colImpossible = false;
            }
        }
        if(this.stateField[x][y] == EMPTYFIELD && 
           rowImpossible && colImpossible){
            this.stateField[x][y] = MAYMISS;
        }    
    }
    
    //wenn vom x wert bis zu x+shipSize keine "Hindernis" ist return true
    this.checkPossiblePosForShipInRow = function(x, y, shipSize){
        for(var i = x; i < x+shipSize; i++){
            if(i >= FIELDSIZE || this.stateField[i][y] < EMPTYFIELD){
                return false;
            }
        }
        return true;
    }
    
    //wenn vom y wert bis zu y+shipSize keine "Hindernis" ist return true
    this.checkPossiblePosForShipInCol = function(x, y, shipSize){
        for(var i = y; i < y+shipSize; i++){
            if(i >= FIELDSIZE || this.stateField[x][i] < EMPTYFIELD){
                return false;
            }
        }
        return true;
    }
    
    //es wurde bereits überprüft ob es eine Valide Position ist
    this.increaseValueForPossbileHitInRow = function(x, y, shipSize){
        for(var i = x; i < x+shipSize; i++){
            this.stateField[i][y]++;
        }
    }
    
    //es wurde bereits überprüft ob es eine Valide Position ist
    this.increaseValueForPossbileHitInCol = function(x, y, shipSize){
        for(var i = y; i < y+shipSize; i++){
            this.stateField[x][i]++;
        }
    }
    
    this.shipNotPossibleToPlace = function(x, y, areaSize){
        return this.calcRowImpossiblity(x, y, areaSize) && this.calcColImpossibility(x, y, areaSize);    
    }
    
    this.calcRowImpossiblity = function(x, y, areaSize){
        return (this.calcRightRowEnd(x, y, areaSize) - this.calcLeftRowEnd(x, y, areaSize)) < areaSize;
    }
    
    this.calcColImpossibility = function(x, y, areaSize){
        return (this.calcBotColEnd(x, y, areaSize) - this.calcTopColEnd(x, y, areaSize)) < areaSize;
    }
    
    //gibt die Position des letzten validen feldes zurück
    this.calcLeftRowEnd = function(x, y, areaSize){
        for(var i = x-1; i >= x-areaSize; i--){
            if(i < 0){
                return 0;
            }else       
            if(this.stateField[i][y] == MISSState || this.stateField[i][y] == DEFMISS){
                return i+1;
            }
        }
        return -1;
    }
    
    //gibt die Position des ersten NICHT validen Feldes zurück
    this.calcRightRowEnd = function(x, y, areaSize){
        for(var i = x+1; i <= x+areaSize; i++){
            if(i >= FIELDSIZE){
                return FIELDSIZE;
            }else
            if(this.stateField[i][y] == MISSState || this.stateField[i][y] == DEFMISS){
                return i;
            }
        }
        return FIELDSIZE;
    }
    
    this.calcTopColEnd = function(x, y, areaSize){
        for(var i = y-1; i >= y-areaSize; i--){
            if(i < 0){
                return 0;
            }else       
            if(this.stateField[x][i] == MISSState || this.stateField[x][i] == DEFMISS){
                return i+1;
            }
        }
        return -1;
    }
    
    this.calcBotColEnd = function(x, y, areaSize){
        for(var i = y+1; i <= y+areaSize; i++){
            if(i >= FIELDSIZE){
                return FIELDSIZE;
            }else
            if(this.stateField[x][i] == MISSState || this.stateField[x][i] == DEFMISS){
                return i;
            }
        }
        return FIELDSIZE;
    }
    
    
//Hilfmethoden für increaseValueForBestEvaluatedShotAtShip
    
    //erhöht die 4 Werte um das Schiff herrum um eine Richtung zu bestimmen
    this.increaseValueAroundLastHit = function(){
        var x = this.lastPositionsHit[0].x;
        var y = this.lastPositionsHit[0].y;
        var x1 = parseInt(x)+1;
        var y1 = parseInt(y)+1;
        if(x-1 >= 0){
            currField = this.stateField[x-1][y];
            this.stateField[x-1][y] += (currField != MISSState && currField != DEFMISS) ? this.maxValue : 0;
        } 
        if(x1 < FIELDSIZE){
            var currField = this.stateField[x1][y];
            this.stateField[x1][y] += (currField != MISSState && currField != DEFMISS) ? this.maxValue : 0;
        }
        if(y-1 >= 0) {
            currField = this.stateField[x][y-1];
            this.stateField[x][y-1] += (currField != MISSState && currField != DEFMISS) ? this.maxValue : 0; 
        }
        if(y1 < FIELDSIZE) {
            currField = this.stateField[x][y1];
            this.stateField[x][y1] += (currField != MISSState && currField != DEFMISS) ? this.maxValue : 0;
        }    
    }
    
    //errechnet die Richtung und erhöht die Werte je nach richtung davor und dahinter (drüber und drunter)
    this.calcDirectionAndIncreaseValueForLeftAndRight = function(){
        var fieldOne = this.lastPositionsHit[0];
        var fieldTwo = this.lastPositionsHit[1];
        if(fieldOne.x == fieldTwo.x && fieldOne.y == fieldTwo.y) return;
        var dir = createVector(fieldOne.x == fieldTwo.x ? 0 : 1, fieldOne.y == fieldTwo.y ? 0 : 1);
        var first = this.calcFirstOne(dir);
        var last = this.calcLastOne(dir);
        this.increaseValueBeforeAndBehindeHit(first, dir);
        this.increaseValueBeforeAndBehindeHit(last, dir);
    }
    
    //es wird die erste Position errechnet
    this.calcFirstOne = function(dir){
        var min = this.lastPositionsHit[0];
        for(var pos of this.lastPositionsHit){
            if(pos.y == min.y && pos.x < min.x){
                min = pos;
            }else
            if(pos.x == min.x && pos.y < min.y){
                min = pos;
            }else
            if(pos.x != min.x && pos.y != min.y){
                throw "Error while calc first one";
            }
        }
        return createVector(parseInt(min.x), parseInt(min.y));
    }
    
    //es wird die letzte Positon errechnet
    this.calcLastOne = function(dir){
        var max = this.lastPositionsHit[0];
        for(var pos of this.lastPositionsHit){
            if(pos.y == max.y && pos.x > max.x){
                max = pos;
            }else
            if(pos.x == max.x && pos.y > max.y){
                max = pos;
            }else
            if(pos.x != max.x && pos.y != max.y){
                throw "Error while calc first one";
            }
        }
        return createVector(parseInt(max.x), parseInt(max.y));
     }
     
     //erhöht die Wert vor und hinter einem Treffer, je nach Richtung des Schiffes
     this.increaseValueBeforeAndBehindeHit = function(pos, dir){
         var posx = parseInt(pos.x);
         var posy = parseInt(pos.y);
         var dirx = parseInt(dir.x);
         var diry = parseInt(dir.y);
         if(posx-dirx >= 0 && posx+dirx < FIELDSIZE){
            var state = this.stateField[(posx + dirx)][(posy + diry)];
            this.stateField[(posx + dirx)][(posy + diry)] += (state != MISSState && state != DEFMISS && state != HITState) ? this.maxValue : 0;
         }
         if(posx-dirx >= 0 && posy+diry < FIELDSIZE){
            var state = this.stateField[(posx - dirx)][(posy - diry)];
            this.stateField[(posx - dirx)][(posy - diry)] += (state != MISSState && state != DEFMISS && state != HITState) ? this.maxValue : 0;
         }
     }
     
    this.deleteShipWithLength = function(size){
        for(var i in this.shipsAliveLength){
            if(this.shipsAliveLength[i] == size){
                this.shipsAliveLength.splice(i, 1);
                return;
            }
        }
    }
    
    //convertiert die Konstanten
    this.convertGamesFieldStatesInComputerStateField = function(gameFieldState){
        //weil .slice() nicht funktioniert nicht deswegen "manuelle" kopie
        //ggf. auch effizenter
        var computerGameField = [];
        for(var x in gameFieldState){
            computerGameField[x] = [];
            for(var y in gameFieldState[x]){
                var state = gameFieldState[x][y];
                if(state != EMPTY){
                    computerGameField[x][y] = (state >= HIT) ? HITState : MISSState;
                }else{
                    computerGameField[x][y] = EMPTYFIELD;
                }
            }
        }
        return computerGameField;
    }
    
    //zeichnet die Werte der Felder 
    this.displayStateGameField = function(){
        push();
        var value, pos;
        for(var x in this.centerPoints){
            for(var y in this.centerPoints[x]){
                value = this.stateField[x][y];
                pos = this.centerPoints[x][y];
                fill(0);
                noStroke();
                textAlign(CENTER, CENTER);
                textSize(10);
                text(value, pos.x, pos.y);
            }
        }
        pop();
    }  
}