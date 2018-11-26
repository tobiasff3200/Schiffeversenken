//Konstante
//Def die Menge und länge der Schiffe
const SHIPLENGTH = [2, 2, 2, 2, 3, 3, 3, 4, 4, 5];
//Simbol dass der andere dran ist --nur zum senden an den Server
const NEXTTURN = 5;
//versenktes Schiff --nur zum senden an den Server
const DESTROYED = 2;
//getroffenes Schiff
const HIT = 1;
//getroffenes wasser
const MISS = -1;
//noch nicht def. Feld (Wasser oder Schiff)
const EMPTY = 0;
//bestimmt die größe der Schiffe, Felder und Schüssen
const SIZE = 20;

function GameManager(dataManager){
                        //|\\
    //ist für die verarbeitung und das senden der Daten verantwortlich
    
    //Speichert alle Schiffe
    this.ships = [];
    //Speichert die beiden gameFields - 0 = oben 1 = unten
    this.gameFields = []
    //indikator dafür ob die Felder der Schiffe gültig und gespeichert sind
    this.shipPosSafed = false;
    //indikator dafür ob das Spiel angefangen hat oder nicht
    this.gameStarted = false;
    //speichert den aktuellen zug - n%2 == 0 -> spieler1 , n%2 != 0 -> spieler2
    this.gameTurn = 0;
    //speichert die Punkte eines Spielers. Bei jedem versenkten schiff wird er um eins erhöt
    //bis er die größe des Arrays der vorhandenen Schiffe hat -dann hat der spieler gewonnen
    this.gameScore = 0;
    //zeigt ob das Spiel zuende ist oder nicht
    this.gameEnd = false;
    //zeigt an ob momentan auf eine antwort vom server gewartet wird (blockiert alle inputs)
    this.waitingForServer = false;
    
    //initialiesiert alles wichtige für das Spiel
    //GameFields und Schiffe und ruft deren setup's auf
    this.setup = function(){
        this.gameFields[0] = new GameField(20, 20, 10, 10);
        this.gameFields[1] = new GameField(20, 240, 10, 10);
        this.gameFields[0].setup();
        this.gameFields[1].setup();
        for(var i = 0; i < SHIPLENGTH.length; i++){
            this.ships[i] = new Ship(30+(SIZE)*i, 500, SHIPLENGTH[i]);
            this.ships[i].setup();
        }
    }
    
    //zeichnet die GameInhalte in der richtigen Reihenfolge,
    //damit die Felder unter den Schiffen und die Schiffe unter den Schüssen sind
    this.show = function(){
        //zeichnet die GameFields
        this.gameFields[0].showField();
        this.gameFields[1].showField();
        //zeichnet SChiffe
        for(var ship of this.ships){
            //prüft ob das Schiff grade bewegt wird, wenn ja wird es auf 
            //der Maus Platziert
            if(ship.dragging){
               ship.setPositionInPixel(mouseX, mouseY, this.gameFields[1]); 
            }
            ship.show();
        }
        //zeichnet die Schüsse
        for(var game of this.gameFields){
            game.showShots();	
        }
    }
    
//-----------------------------------------inputs------------------------------------------//
    
    this.callInput = function(inputTyp, data){
        if(!this.waitingForServer && !this.gameEnd){ // && this.gameTurn%2 == (je nach Spieler)
            if(inputTyp == "MousePressed"){
                if(data.x != null && data.y != null){
                    this.mousePressedGame(data.x, data.y);
                    alert(data.x + " - " + data.y);
                }
            }
            if(inputTyp == "MouseReleased"){
                if(data.x != null && data.y != null){
                    this.mouseReleasedGame(data.x, data.y);
                }
            }
            if(inputTyp == "KeyPresed"){
                if(data != null){
                    this.keyPressedGame(key);
                }
            }
        }
    }
    
    //mousePressed Methode für den GameManager die von sketch.js aufgerufen wird
    this.mousePressedGame = function(mouseX, mouseY){
        //es wird zuerst gegrüft ob man ein Schiff hoch nimmt, da man nicht
        //schissen will wenn man ein Schiff vom oberen Feld runter nimmt
        if(!this.dragClickedShip(mouseX, mouseY)){
            this.shootAtClickedField(mouseX, mouseY, this.gameFields[0]);
        }
    }
    
    //mouseReleased Methode für den GameManager die von sketch.js aufgerufen wird  
    this.mouseReleasedGame = function(mouseX, mouseY){
        this.dropDraggingShips();
    }
    
    //keyPressed Methode für den GameManager die von sketch.js aufgerufen wird  
    this.keyPressedGame = function(key){
        if(key == 'r' || key ==  'R'){
            this.rotateShipMouseOver();
        }
        
        if(key == 's' || key == 'S'){
            this.safeShipPosition();
        }
        
        if(key == 'p' || key == 'P'){
            this.checkGameReadyToPlay();
        }
    }
//-----------------------------------------inputs------------------------------------------//
    
    //setzt die Var Dragging des angeklicketen Schiffes auf true, sodass es
    //in der show methode bewegt werden kann. Man kann nur ein Schiff bewegen
    //Es wird immer das oberste Schiff genommen
    this.dragClickedShip = function(xPix, yPix){
        //erstellt eine Hilfsvar in dem alle einträge in der falschen Reihenfolge sind
        //das führt dazu, dass das letzte gezeichnete Schiff als erstes abgefragt wird
        //und somit auch als erstes hochgenommen wird
        var revShips = this.ships.slice().reverse();
        for(var ship of revShips){
            if(ship.checkMouseInside()){
                ship.dragging = true;
                return true;
            }
        }
        return false;
    }
    
    //setzt die Var Dragging jedes Schiffs wieder auf false, falls
    //durch ein Fehler doch mehr als ein "hochgenommen" wurde
    this.dropDraggingShips = function(){
       for(var ship of this.ships){
            if(ship.dragging){
                ship.dragging = false;
            }
        } 
    }
    
    //rotiert das Schiff über dem die Mouse drüber ist
    this.rotateShipMouseOver = function(){
        for(var ship of this.ships){
            if(ship.checkMouseInside()){
                ship.rotate(this.gameFields[1]);
            }   
        }
    }
    
    //checkt ob alle Schiffe auf einem akzeptierten Feld stehen und 
    //Position speichter diese
    this.safeShipPosition = function(){
        this.shipPosSafed = true;
        for(var ship of this.ships){
            //checkValidPosition speichert die Position und prüft ob sie ok ist
            if(!ship.checkValidPosition(this.ships)){
                this.shipPosSafed = false;
                break;
            }
        }
        if(!this.shipPosSafed){
            //setzt die gespeicherte Position aller Schiffe auf null falls ein Schiff
            //keine akzeptierte Position hat
            for(var ship of this.ships){
                ship.coverdFields = null;
            }
            alert("Die Schiffe sind nicht richtig platziert worden, \n" + 
                  "Bitte beachten Sie die Regeln");
        }
        return this.shipPosSafed;
    }
    
    //prüft ob alle Schiffe versenkt wurden, wenn ja sendet er es an den gegner 
    //und beendet das spiel
    this.checkWin = function(){
        //wenn genauso viele (oder mehr) Schiffe versenkt wurden wie es Schiffe gibt,
        //dann hat man gewonnen
        if(gameScore >= SHIPLENGTH){
            this.gameEnd = true;
            //
            dataManager.send("GM", "Reply", "Finish");
            return true;
        }else{
            return false;
        }
    }
    
    //prüft im übergebenen GameField auf welches Feld geklickt wurde und
    //falls eins gefunden wird, auf das noch nicht geschossen wurde, wird darauf geschossen
    this.shootAtClickedField = function(xPix, yPix, game){
        var fieldInizes  = game.convertPixPosInFieldIndex(xPix, yPix);
        //prüft ob das Feld existiert und ob es noch nicht beschossen wurde
        if(fieldInizes != null && game.fieldStates[fieldInizes.x][fieldInizes.y] == EMPTY){
            //sende position an Server, und setzte waitingForServer auf true sodass alle 
            //inputs geblocked werden
            dataManager.send("GM", "Ask", [fieldInizes.x, fieldInizes.y]);
            this.waitingForServer = true;
        }
    }
    
    //wird aufgerufen wenn der Gegner eine Anfrage geschickt hat
    this.receiveQuestion = function(data, requestNumber){
        //prüft ob die Daten vorhanden und in der richtigen größe sind
        if(data != null && data.length >= 2){
            var x = data[0];
            var y = data[1];
            //prüft das Ergebnis
            var result = checkShootAt(x, y);
            if(result != null){
                //wenn das ergebnis nicht null ist schicke es an den Gegner
                dataManager.send("GM", "Ask", [x, y, result], requestNumber);
                //es wird nicht mehr auf den Server gewartet
                this.waitingForServer = true;
            }
        }
    }
    
    //wird aufgerufen, wenn der Gegner ein Ergebnis der Anfrage geschickt hat
    this.receiveResult = function(data){
        //prüft ob die daten vorhanden sind und die richtige größe haben
        if(data != null && data.length >= 3){
            var result = data[2];
            var x = data[0];
            var y = data[1];
            //verarbeitet das Ergebnis der Anfrage
            if(data[2] == MISS){
                //bei daneben :
                //setzte Status des Feldes auf MISS
                GameField.setState(x, y, MISS);
                //sag dem Server der andere Spieler ist dran
                dataManager.send("GM", "Reply", [NEXTTURN]);
                //erhöht die momentane Runde um 1 (gameTurn)
                this.gameTurn++;
            }else if(data[2] >= HIT){
                //mindestens ein Treffer:
                //setzte Status des Feldes auf HIT
                gameFields[0].setState(x, y, HIT);
                if(data[2] == DESTROEYED){
                    //sollte das Schiff versenkt worden sein erhöhe den gameScore
                    this.gameScore++;
                }
                //da man getroffen hat darf man nochmal schießen, deswegen wird die momentane
                //Runde nicht erhöht
                //sollte man gewonnen haben, wird der gegner benachrichtigt und das Spiel beendet
                if(this.checkWin()){
                    dataManager.send("GM", "Reply", ["Finish"]);
                    this.gameEnd = true;
                    alert("You've won the Game!");
                }else{
                    alert("You hit a ship. Shoot another one!");
                }
            }
            //es wird nicht mehr auf den Server gewartet
            this.waitingForServer = false;
        }
    }
    
    //wird aufgerufen wenn der Gegner eine Antwort geschickt hat
    this.receiveReply = function(data){
        if(data != null){
            if(data[0] == NEXTTURN){
                //nächste Runde, also wird gameTurn erhöht
                this.gameTurn++;
                //und die inputs freigegeben
                this.waitingForServer = false;
                alert("Its your turn!");
            }else if(data[0] == "Finish"){
                //der Gegner hat gewonnen, wenn er "Finish" schickt
                alert("You lose! Good luck next round");
            }
        }
    }
}