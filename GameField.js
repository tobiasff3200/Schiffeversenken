//import * as con from "./Constants.js";

function GameField(x, y, wid, heig){
    
    //zur darstellung der Nummern und Buchstaben neben den Feldern
    const fieldNumbers  = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const fieldChars    = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    
    //Mittelpunkte der Felder des GameFields    
	this.centerPoints = []; //2D Array
	//mögliche Werte : -1 = daneben, 0 = leer, 1 = treffer
    this.fieldStates = [];	//2D Array
	//jedes Schiff kennt seine Länge und Position (indizes von centerPoints)
	this.ships = [];				 
	
    //zum initialisieren der Mittelpunkte des GameFields
	this.setup = function(){
		for(var i = 0; i < wid; i++){
			this.centerPoints[i] = [];
			this.fieldStates[i] = [];
			for(var j = 0; j < heig; j++){
				//Setzte Mittelpunkte der einzelnen Felder
				this.centerPoints[i][j] = createVector(x+(SIZE/2)+i*SIZE, y+(SIZE/2)+j*SIZE);
				//Setzte den Status jedes Feldes auf 0(=leer)
				this.fieldStates[i][j] = EMPTY;
			}
		}
	}
	
    //zum darstellen des GameFields und der Beschriftung
    this.showField = function(){
        stroke(0);
        textAlign(CENTER, CENTER);
        textSize(14);
        textStyle(BOLD);
        //sorgt dafür, dass der Mittelpunkt auch die Mitte ist
        rectMode(CENTER);
        for(let x in this.centerPoints){
            for(var y in this.centerPoints[x]){
                var center = this.centerPoints[x][y];
                //zeichnet immer wenn es am Anfang außen ist die jeweilige
                //Nummder oder den Buchstaben vor das nächste Quadrat
                fill(255);
                if(y == 0){
                    text(fieldNumbers[x], center.x, center.y-SIZE);
                }
                if(x == 0){
                    text(fieldChars[y], center.x-SIZE, center.y);
                }
                //zeichne an jede Mittelposition ein Rechteck
                fill(120);
                rect(center.x, center.y, SIZE, SIZE);
            }		
        }
        
    }
    
    //extra Methode für die SChüsse, damit man erst das Feld, dann die Schiffe und dann
    //die Schüsse darstellen kann und sich so nichts überschneidet
    this.showShots = function(){
        for(let x in this.centerPoints){
            for(var y in this.centerPoints[x]){
                var center = this.centerPoints[x][y];
                var state = this.fieldStates[x][y];
                //falls auf das Feld geschossen wurde zeichen Elippse mit passender Farbe
                if(state != EMPTY){
                    if(state == HIT){
                        fill(255, 0, 0);
                    }else{
                        fill(0, 0, 255);
                    }
                    ellipse(center.x, center.y, SIZE/2, SIZE/2);
                }
            }		
        }
    }
    
    //wird aufgerufen sobald der Server antwortet
    //zum individuellen setzten eines Feldes auf HIT oder MISS
    //es wird zusätzlich geprüft ob das die Indizes auf ein Feld verweisen
	this.setState = function(x, y, state = EMPTY){
        if(this.checkInField(x, y)){
            var newState = EMPTY;
            if(state != EMPTY){
                //falls eine Positive Zahl übergeben wurde setzte newState auf Hit, sonst auf MISS
                if(state >= HIT){
                    newState = HIT;
                }else{
                    newState = MISS;
                }
            }
            //setzte auf dem übergebenen Feld den neuen Status
            this.fieldStates[x][y] = newState;
            return true;
        }else{
            return false;
        }
	}
	
    //wird aufgerufen wenn der Server eine ShotAt anfrage schickt
    //checkt ob ein Schiff auf dem Feld mit den übergebenen Indizes steht 
    //und speichert das Ergebnis ins fieldStates falls des Feld nicht belegt ist
	this.checkShootAt = function(x, y, ships){
        if(this.checkInField(x, y)){
            //checkt ob das Feld leer ist
            if(this.fieldStates[x][y] == EMPTY){
                //checkt ob die überdeckten Felder des Schiffes gespeichert wurden
                //und ob ein Schiff auf dem Feld steht		
                for(var ship of ships){           
                    if(ship.coverdFields != null && ship.checkHit(x, y, this)){
                        this.fieldStates[x][y] = HIT;
                        return true;
                    }
                }
                //falls kein Schiff gefunden setzt Status auf daneben und gibt es zurück
                this.fieldStates[x][y] = MISS;
                return false;
            }
        }
        //das Feld ist bereits belegt oder exestiert garnicht und es wird abgebrochen
        return null;
	}
    
    this.checkInField = function(x, y){
        return (0 <= x && x < this.centerPoints.length && 0 <= y && y < this.centerPoints[x].length);
    }
    
    //um eine Pixelposition in einen Vector mit den Indizes des Feldes an der Position zu wandeln
    //sollte kein Feld an dieser Position sein, wird null returnt
    this.convertPixPosInFieldIndex = function(xPix, yPix){
        //errechne die Höhe und Breite des Feldes
        var fieldWid = (wid+1)*SIZE;
        var fieldHeig = (heig+1)*SIZE;
        //checke ob die xPix und yPix in dem Feld liegen
        if(x < xPix && xPix < x + fieldWid && y < yPix && yPix < y + fieldHeig){
            //durchlaufe alle Mittelpunkte des Feldes
            for(var xField in this.centerPoints){
                for(var yField in this.centerPoints[xField]){
                    var center = this.centerPoints[xField][yField];
                    //falls xPix und yPix in einem Rechteck Liegen return die Indizes als Vector
                    //mittelpunkt +- hälfte der breite 
                    if(center.x-(SIZE/2) <= xPix && xPix < center.x + (SIZE/2) &&
                       center.y-(SIZE/2) <= yPix && yPix < center.y + (SIZE/2)){
                        return createVector(xField, yField);
                    }
                }
            }    
        }
        return null;
    }
}