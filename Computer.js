function Computer(){
    const FIELDSIZE = 10;
    
    //neue Konstanten für den Computer
    const EMPTYFIELD = 0;  //leeres Feld           -> unklar
    const DEFMISS = -3;    //defenitiv Vorbei      -> sicher (ausschlussverfahren)
    //neue Konstate für hit und miss damit sie < 0 sind
    const HITState = -2;   //getroffene Schüsse    -> sicher
    const MISSState = -1;  //nicht getroffen       -> sicher
    
    //ist zum speichern und senden der Daten des Computers zuständig
    this.gameManager = null;
    //speichert die möglichkeiten die der Computer hat zu schießen (siehe Konstaten)
    this.stateField = [];
    
    //speichert die Koordinaten von den getroffenen Schüssen des zuletzt getroffenen Schiffes
    this.lastShipDestroyed = [];
    //speichert die Position aller zerstörten Schiffe
    this.destroyedShips = [];
    //speichert die Längen der noch nicht zerstörten Schiffe
    this.shipsAliveLength = SHIPLENGTH.slice();
    
    
    
    this.setup = function(){   
        this.gameManager = new GameManager();
        this.gameManager.setup();
        //initialisiert alle Felder als leeres Feld
        this.stateField = this.convertGamesFieldStatesInComputerStateField(gameManager.gameFields[0].fieldStates);
    }
    
    //Shoot functions
    this.shootRandom = function(){
        this.gameManager.shootAtRandomPosition();
    }
    
       
    // auf die Felder um ein zerstörtes Schiff kann man auf keinen fall treffen 
    this.setFieldAroundDestroyedShipDefMiss = function(){
        for(var pos of this.lastShipDestroyed){
           this.setDEFMISSAroundHit(pos.x, pos.y); 
        }
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

    
//-----------------Hilfs-Methoden------------------------------------------------------------------//
    
    this.setDEFMISSAroundHit = function(x, y){
        var currField = this.stateField[x+1][y];
        this.stateField[x+1][y] = (currField != MISSState && currField != HITState) ? DEFMISS : EMPTYFIELD; 
        currField = this.stateField[x-1][y];
        this.stateField[x-1][y] = (currField != MISSState && currField != HITState) ? DEFMISS : EMPTYFIELD;
        currField = this.stateField[x][y+1];
        this.stateField[x][y+1] = (currField != MISSState && currField != HITState) ? DEFMISS : EMPTYFIELD;
        currField = this.stateField[x][y-1];
        this.stateField[x][y-1] = (currField != MISSState && currField != HITState) ? DEFMISS : EMPTYFIELD;   
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
    

//hilfsmethoden für setValueForPossbileHit
    
    //prüft ob an der Position x, y und allen die das Schiff an der Position überdecken würde ob
    //es eine Valide Position ist und erhört den Wert der möglichen Felder
    this.setPossibleHitForAllShips = function(x, y){
        var rowImpossible = true;
        var colImpossible = true;
        for(var shipSize of this.shipsAliveLength){
            if(this.checkPossiblePosForShipInRow(x, y, shipSize)){
                this.increaseValueForPossbileHitInRow(x, y, shipSize);
                rowImpossible = false;
            }
            
            if(this.checkPossiblePosForShipInCol(x, y, shipSize)){
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
}