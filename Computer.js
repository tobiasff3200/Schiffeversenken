function Computer(){
    const FIELDSIZE = 10;
    
    //neue Konstanten für den Computer
    const EMPTYFIELD = 0;  //leeres Feld           -> unklar
    const DEFMISS = -3;    //defenitiv Vorbei      -> sicher (ausschlussverfahren)
    //neue Konstate für hit und miss damit sie < 0 sind
    const HITState = -2;   //getroffene Schüsse    -> sicher
    const MISSState = -1;  //nicht getroffen       -> sicher
    
    //ermittelt den höchsten wert der möglich ist zu erreichen. Auf 10x10 mit 10 Schiffen a [2,2,2,2,3,3,3,4,4,5] ist es 60 
    this.maxValue = 60; //ggf später berechnet
    //ist zum speichern und senden der Daten des Computers zuständig
    this.gameManager = null;
    //speichert die möglichkeiten die der Computer hat zu schießen (siehe Konstaten)
    this.stateField = [];
    
    //speichert die Koordinaten von den getroffenen Schüssen des zuletzt getroffenen Schiffes
    this.lastPositionsHit = [];
    //speichert die Position aller zerstörten Schiffe
    this.destroyedShips = [];
    //speichert die Längen der noch nicht zerstörten Schiffe
    this.shipsAliveLength = SHIPLENGTH.slice();
    
    this.centerPoints = null;
    
    this.setup = function(){   
        this.gameManager = new GameManager();
        this.gameManager.setup();
        this.stateField = this.convertGamesFieldStatesInComputerStateField(gameManager.gameFields[0].fieldStates);
    }
    
    this.show = function(){
        if(this.centerPoints != null){
            this.displayStateGameField(this.centerPoints)
        }
        
    }
    
    //Shoot functions
    this.shootRandom = function(){
        this.gameManager.shootAtRandomPosition();
    }
    
    
    
    //legt die Wahrscheinlichkeit fest die jedes Feld hat dass ein Schiff auf ihm steht
    //sollte ein Feld die Wahrscheinlichkeit 0 habe wird es auf DEFMISS gesetzt
    this.setValueForPossbileHit = function(){
        this.stateField = this.convertGamesFieldStatesInComputerStateField(gameManager.gameFields[0].fieldStates);
        for(var x = 0; x < FIELDSIZE; x++){
            for(var y = 0; y < FIELDSIZE; y++){
                this.setPossibleHitForAllShips(x, y);
            }
        }
    }
    
    
    
    // auf die Felder um ein zerstörtes Schiff kann man auf keinen fall treffen 
    this.setFieldAroundDestroyedShipsToDefMiss = function(){
        for(var ship of this.destroyedShips){
            for(var pos of ship){
                this.setDEFMISSAroundHit(pos.x, pos.y);   
            }          
        }
    }
    
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
    
    this.increaseValueAroundLastHit = function(){
        var x = this.lastPositionsHit[0].x;
        var y = this.lastPositionsHit[0].y;
        
        var currField = this.stateField[x+1][y];
        this.stateField[x+1][y] += (currField != MISSState || currField != DEFMISS) ? this.maxValue : 0;
        currField = this.stateField[x-1][y];
        this.stateField[x-1][y] += (currField != MISSState || currField != DEFMISS) ? this.maxValue : 0;
        currField = this.stateField[x][y+1];
        this.stateField[x][y+1] += (currField != MISSState || currField != DEFMISS) ? this.maxValue : 0;
        currField = this.stateField[x][y-1];
        this.stateField[x][y-1] += (currField != MISSState || currField != DEFMISS) ? this.maxValue : 0; 
    }
    
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
        return min;
    }
    
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
         return max;
    }
     
     this.increaseValueBeforeAndBehindeHit = function(pos, dir){
         //TODO: prüfe ob außerhalb des Feldes
         if(pos.x-dir.x < 0 || pos.x+dir.x >= FIELDSIZE || pos.y-dir.y < 0 || pos.y+dir.y >= FIELDSIZE) return;
         var state = this.stateField[(pos.x + dir.x)][(pos.y + dir.y)];
         this.stateField[(pos.x + dir.x)][(pos.y + dir.y)] += (state != MISSState && state != DEFMISS && state != HITState) ? this.maxValue : 0;
         var state = this.stateField[pos.x - dir.x][pos.y - dir.y];
         this.stateField[(pos.x - dir.x)][(pos.y - dir.y)] += (state != MISSState && state != DEFMISS && state != HITState) ? this.maxValue : 0;
     }

    
    
//----------------Receive-Methoden-----------------------------------------------------------------//

    this.receiveData = function(data){
        
    }
    
//-----------------Hilfs-Methoden------------------------------------------------------------------//
    
    this.setDEFMISSAroundHit = function(x, y){
        var currField = this.stateField[x+1][y];
        this.stateField[x+1][y] = (currField != HITState) ? DEFMISS : currField; 
        currField = this.stateField[x-1][y];
        this.stateField[x-1][y] = (currField != HITState) ? DEFMISS : currField; 
        currField = this.stateField[x][y+1];
        this.stateField[x][y+1] = (currField != HITState) ? DEFMISS : currField; 
        currField = this.stateField[x][y-1];
        this.stateField[x][y-1] = (currField != HITState) ? DEFMISS : currField;   
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
            this.stateField[x][y] = DEFMISS;
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
    
    
    
    this.displayStateGameField = function(centerPoints){
        push();
        var value, pos;
        for(var x in centerPoints){
            for(var y in centerPoints[x]){
                value = this.stateField[x][y];
                pos = centerPoints[x][y];
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