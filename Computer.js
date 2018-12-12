function Computer(){
    const FIELDSIZE = 10;
    
    //neue Konstanten für den Computer
    const EMPTYFIELD = 49;  //leeres Feld           -> unklar
    const POSHIT = 50;      //ein möglicher Treffer -> vermutung
    const DEFMISS = 51;     //defenitiv Vorbei      -> sicher (ausschlussverfahren)
    //nur zur Erinnerung
    const HIT = HIT;        //getroffene Schüsse    -> sicher
    const MISS = MISS       //nicht getroffen       -> sicher
    
    //ist zum speichern und senden der Daten des Computers zuständig
    this.gameManager = null;
    //speichert die möglichkeiten die der Computer hat zu schießen (siehe Konstaten)
    this.stateField = [];
    
    //speichert die Koordinaten von den getroffenen schüssen des zuletzt getroffenen Schiffes
    this.lastShipDestroyed = [];
    //speichert die Längen der noch nicht zerstörten Schiffe
    this.shipsAliveLength = SHIPLENGTH.slice();
    
    
    
    this.setup = function(){   
        this.gameManager = new GameManager();
        this.gameManager.setup();
        //initialisiert alle Felder als leeres Feld ()
        for(var i = 0; i < FIELDSIZE; i++){
			this.positionsToShoot[i] = [];
            for(var j = 0; j < FIELDSIZE; j++){
                this.positionsToShoot[i][j] = EMPTYFIELD;
            }
		}
    }
    
    //Shoot functions
    this.shootRandom = function(){
        this.gameManager.shootAtRandomPosition();
    }
    
       
    // auf die Felder um ein zerstörtes Schiff kann man auf keinen fall treffen 
    this.fieldAroundDestroyedShip = function(){
        for(var pos of this.lastShipDestroyed){
           this.setDEFMISSAroundHit(pos.x, pos.y); 
        }
    }
    
    this.setDEFMISSAroundHit = function(x, y){
        var currField = this.stateField[x+1][y];
        this.stateField[x+1][y] = (currField != MISS && currField != HIT) ? DEFMISS : EMPTYFIELD; 
        currField = this.stateField[x-1][y];
        this.stateField[x-1][y] = (currField != MISS && currField != HIT) ? DEFMISS : EMPTYFIELD;
        currField = this.stateField[x][y+1];
        this.stateField[x][y+1] = (currField != MISS && currField != HIT) ? DEFMISS : EMPTYFIELD;
        currField = this.stateField[x][y-1];
        this.stateField[x][y-1] = (currField != MISS && currField != HIT) ? DEFMISS : EMPTYFIELD;   
    }
    
    
    this.areaToSmallForShips = function(){
        this.setDEFMISSArea(this.shipsAliveLength[0]);
    }
    
    this.setDEFMISSArea = function(areaSize){
        for(var x in this.stateField){
            for(var y in this.stateField[x]){
                if(this.shipNotPossibleToPlace(x, y, areaSize)){
                    this.stateField[x][y] = DEFMISS;
                }
            }
        }
    }
    
    this.shipNotPossibleToPlace = function(x, y, areaSize){
        return this.calcRowPossiblity(x, y, areaSize) && this.calcColPossibility(x, y, areaSize);    
    }
    
    this.calcRowPossiblity = function(x, y, areaSize){
        return (this.calcRightRowEnd(x, y, areaSize) - this.calcLeftRowEnd(x, y, areaSize)) < areaSize;
    }
    
    this.calcColPossibility = function(x, y, areaSize){
        return (this.calcTopColEnd(x, y, areaSize) - this.calcBotColEnd(x, y, areaSize)) < areaSize;
    }
    
    //gibt die Position des letzten validen feldes zurück
    this.calcLeftRowEnd = function(x, y, areaSize){
        for(var i = x-1; i >= x-areaSize; i--){
            if(i < 0){
                return 0;
            }else       
            if(this.stateField[i][y] == MISS || this.stateField[i][y] == DEFMISS){
                return i+1;
            }
        }
        return null;
    }
    
    //gibt die Position des ersten NICHT validen Feldes zurück
    this.calcRightRowEnd = function(x, y, areaSize){
        for(var i = x+1; i <= x+areaSize; i--){
            if(i >= FIELDSIZE){
                return FIELDSIZE;
            }else
            if(this.stateField[i][y] == MISS || this.stateField[i][y] == DEFMISS){
                return i;
            }
        }
        return null;
    }
    
    this.calcTopColEnd = function(x, y, areaSize){
        for(var i = y-1; i >= y-areaSize; i--){
            if(i < 0){
                return 0;
            }else       
            if(this.stateField[x][i] == MISS || this.stateField[x][i] == DEFMISS){
                return i+1;
            }
        }
        return null;
    }
    
    this.calcBotColEnd = function(x, y, areaSize){
        for(var i = y+1; i <= y+areaSize; i--){
            if(i >= FIELDSIZE){
                return FIELDSIZE;
            }else
            if(this.stateField[x][i] == MISS || this.stateField[x][i] == DEFMISS){
                return i;
            }
        }
        return null;
    }
}