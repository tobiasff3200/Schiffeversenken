//Konstante
//Def die Menge und länge der Schiffe
const SHIPLENGTH = [2, 2, 2, 2, 3, 3, 3, 4, 4, 5];
//Simbol dass der andere dran ist --nur zum senden an den Server
const NEXTTURN = "Nextturn";
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

function GameManager(){
    
    //ist für die verarbeitung und das senden der Daten verantwortlich
    this.dataManager = null;
    //ist für die darstellung des GameLog verandwortlich
    this.gameLog = null;
    //Speichert alle Schiffe
    this.ships = [];
    //Speichert die beiden gameFields - 0 = oben 1 = unten
    this.gameFields = []
    //indikator dafür ob die Felder der Schiffe gültig und gespeichert sind
    this.shipPosSafed = false;
    //indikator dafür ob das Spiel angefangen hat oder nicht
    this.gameStarted = false;
    //simbolisiert ob die Spieler bereit sind oder nicht
    this.youReady = false;
    this.enemyReady = false;
    //speichert den aktuellen zug - n%2 == 0 => man darf schießen
    //das wird durch denjenigen der später bereit drückt zufällig entschieden wer als erstes dran ist und
    //an den gegner geschickt, der seine "Start Runde", dahingehend verändert. Das heißt wenn man
    //als erster dran ist bleibt gameTurn bei 0 aber wenn der gegner zuerst dran ist wird 
    //gameTurn auf 1 gesetzt sodass sie immer unterschiedlich von einander sein (abstand 1)
    //das führt dazu dass in der einen Runde %2 bei dem einen funktioniert und in der nächsten Runde bei dem andere
    this.gameTurn = 0;
    //speichert die Punkte eines Spielers. Bei jedem versenkten schiff wird er um eins erhöt
    //bis er die größe des Arrays der vorhandenen Schiffe hat -dann hat der spieler gewonnen
    this.gameScore = 0;
    //zeigt an ob momentan auf eine antwort vom server gewartet wird (blockiert alle inputs)
    this.waitingForServer = false;

    //initialiesiert alles wichtige für das Spiel
    //GameFields und Schiffe und ruft deren setup's auf
    this.setup = function(dataManager){
        this.dataManager = dataManager;
        this.gameFields[0] = new GameField(20, 20, 10, 10);
        this.gameFields[1] = new GameField(20, 240, 10, 10);
        this.gameLog = new GameLog(260, 300, 300, 140);
        this.gameFields[0].setup();
        this.gameFields[1].setup();
        this.gameLog.setup(this);
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
        if(this.gameStarted){
           this.gameLog.show(); 
        }
        
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
//                                          \\//
    this.callInput = function(inputTyp, data){
        if(!this.waitingForServer && this.gameTurn%2 == 0){ 
            if(inputTyp == "MousePressed"){
                if(data.x != null && data.y != null){
                    this.mousePressedGame(data.x, data.y);
                }
            }else
            if(inputTyp == "MouseReleased"){
                if(data.x != null && data.y != null){
                    this.mouseReleasedGame(data.x, data.y);
                }
            }else
            if(inputTyp == "KeyPressed"){
                if(data != null){
                    this.keyPressedGame(key);
                }
            }
        }
    }

    //mousePressed Methode für den GameManager die von sketch.js aufgerufen wird
    this.mousePressedGame = function(mouseX, mouseY){
        //es wird zuerst gegrüft ob man ein Schiff hoch nimmt, da man nicht
        //schießen will wenn man ein Schiff vom oberen Feld runter nimmt
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
        //rotiert das Schiff auf dem die Maus liegt
        if(key == 'r' || key ==  'R'){
            this.rotateShipMouseOver();
        }
        //speichert die Poition der Schiffe
        if(key == 's' || key == 'S'){
            this.safeShipPosition();
        }
        //prüft ob beide Spieler "ready" sind
        if((key == 'p' || key == 'P')){
            this.checkGameReadyToPlay();
        }
    }
//                                          //\\
//-----------------------------------------inputs------------------------------------------//

    //setzt die Var Dragging des angeklicketen Schiffes auf true, sodass es
    //in der show methode bewegt werden kann. Man kann nur ein Schiff bewegen
    //Es wird immer das oberste Schiff genommen
    //es ist sichergestellt, dass das Schiff nicht bewegt werden kann wenn die
    //Position geseichert wurde
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
    //aber nur wenn die Schiffe noch nicht gespeichert wurden (abfrage in rotate())
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
        //wenn die schiffe schon gespeichert wurden kann man abbrechen
        if(this.shipPosSafed){
            return
        }
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
        }else{
            alert("Position der Schiffe wurde gespeichert")
        }
        return this.shipPosSafed;
    }

    //prüft ob alle Bedingungen erfüllt wurden um das Spiel zu starten
    //kann im Nachhinein noch erweitert werden
    this.checkGameReadyToPlay = function(){
        //wenn alle Schiffe richtig stehen wird der Spieler auf ready gesetzt
        //und der gegner wird informiert
        if(!this.gameStarted && this.shipPosSafed){
            this.youReady = true;
            this.sendReady();
        }
    }

    //prüft ob alle Schiffe versenkt wurden
    this.checkWin = function(){
        //wenn genauso viele (oder mehr) Schiffe versenkt wurden wie es Schiffe gibt,
        //dann hat man gewonnen
        if(this.gameScore >= SHIPLENGTH.length){
            this.gameEnd = true;
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
        //nur wenn das spiel gestartet hat
        if(this.gameStarted && fieldInizes != null && game.fieldStates[fieldInizes.x][fieldInizes.y] == EMPTY){
            //sende position an Server, und setzte waitingForServer auf true sodass alle
            //inputs geblocked werden
            this.dataManager.send("GM", "Ask", [fieldInizes.x, fieldInizes.y]);
            this.waitingForServer = true;
        }
    }

    //wird aufgerufen wenn der Gegner eine Anfrage geschickt hat
    this.receiveQuestion = function(data, requestNumber){
        //prüft ob die Daten vorhanden und in der richtigen größe sind
        if(data != null && data.length >= 2){
            var x = data[0];
            var y = data[1];
            //prüft das Ergebnis und zeichnet es
            var result = this.gameFields[1].checkShootAt(x, y, this.ships);
            if(result != null){
                //postet die Nachricht bei dem Schuss des Gegners passiert ist
                this.gameLog.postMsg(x, y, result, this.gameTurn);
                //wenn das ergebnis nicht null ist schicke es an den Gegner
                this.dataManager.send("GM", "Ask", [x, y, result], requestNumber);
                //es wird nicht mehr auf den Server gewartet
                this.waitingForServer = true;
            }
        }
    }

    //wird aufgerufen, wenn der Gegner ein Ergebnis der Anfrage geschickt hat
    this.receiveResult = function(data){
        //prüft ob die daten vorhanden sind und die richtige größe haben
        if(data != null && data.length >= 3){
            var x = data[0];
            var y = data[1];
            var result = data[2];
            //verarbeitet das Ergebnis der Anfrage
            if(data[2] == MISS){
                //bei daneben :
                //setzte Status des Feldes auf MISS
                this.gameFields[0].setState(x, y, MISS);
                //sag dem Server der andere Spieler ist dran
                this.dataManager.send("GM", "Reply", [NEXTTURN]);
                //postet die Nachricht dass nichts getroffen wrude
                this.gameLog.postMsg(x, y, MISS, this.gameTurn);
                alert("You miss. Nextturn!");
                //erhöht die momentane Runde um 1 (gameTurn)
                this.gameTurn++;
            }else if(data[2] >= HIT){
                //mindestens ein Treffer:
                //setzte Status des Feldes auf HIT
                this.gameFields[0].setState(x, y, HIT);
                if(data[2] == DESTROYED){
                    //sollte das Schiff versenkt worden sein erhöhe den gameScore
                    this.gameScore++;
                    //da man getroffen hat darf man nochmal schießen, deswegen wird die momentane
                    //Runde nicht erhöht
                    //sollte man gewonnen haben, wird der gegner benachrichtigt und das Spiel beendet
                    if(this.checkWin()){
                        this.dataManager.send("GM", "Reply", ["Finish"]);
                        this.gameEnd = true;
                        alert("Last ship destroyed, You've won the Game!");
                    }else{
                        //postet die Nachricht dass ein Schiff zerstört wurde im gameLog
                        this.gameLog.postMsg(x, y, DESTROYED, this.gameTurn);
                        //die anzahl aller Schiffe minus die schon zerstörten Schiffe = die restlichen Schiffe
                        alert("You have destroyed a Ship! " + (SHIPLENGTH.length - this.gameScore) + " left");
                    }
                }else{
                    //postet die Nachricht dass ein Schiff getroffen wurde im gameLog
                    this.gameLog.postMsg(x, y, HIT, this.gameTurn);
                    alert("You hit a Ship! Shoot another one!");
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
            }else
            if(data[0] == "Ready"){
                if(this.youReady){
                    this.enemyReady = true;
                    this.sendReady();
                }else{
                    //wenn nicht wird der Gegner auf Ready gesetzt und
                    //dem Spieler wird mitgeteilt dass der Gegner ready ist
                    alert("The enemy is Ready!");
                    this.enemyReady = true;
                }
            }else
            if(data[0] == "Start" && this.youReady){
                //Das Spiel hat gestartet
                this.enemyReady = true;
                this.gameStarted = true;
                this.gameTurn = data[1];
                var turnMsg = (this.gameTurn%2==0) ? "You go first!" : "Enemy goes first!";
                alert("The Game has started! " + turnMsg);   
            }else
                if(data[0] == "Finish"){
                //der Gegner hat gewonnen, wenn er "Finish" schickt
                alert("You lose! Good luck next round");
            }
        }
    }

    //soll dem gegner sagen ob der Spieler bereit ist, bzw das Spiel gestartet hat
    this.sendReady = function(){
        if(this.youReady){
            if(this.enemyReady){
                //wenn beide bereit sind wird zufällig entscheiden wer anfängt und es kann gestartet werden
                //eine zufallszahl wird generiert, welche entscheidet wer anfängt
                var first = (Math.random()>0.5) ? "You" : "Enemy";
                //sollte der Spieler anfangen bleibt gameTurn 0, wenn nicht wird es auf 1 gesetzt
                //da man nur "schießen" kann wenn gameTurn%2==0 ist 
                this.gameTurn = (first == "You") ? 0 : 1;
                //für den Gegner gilt genau das gleiche nur umgedreht und es wird ihm gesendet
                var enemeyTurn = (first == "Enemy") ? 0 : 1;
                this.dataManager.send("GM", "Reply", ["Start", enemeyTurn]);
                this.gameStarted = true;
                var turnMsg = (this.gameTurn%2==0) ? "You go first!" : "Enemy goes first!";
                alert("The game has started! " + turnMsg);
            }else{
                //wenn der Gegner noch nicht bereit wird ihm mitgeteilt, dass der
                //Speiler bereit ist
                this.dataManager.send("GM", "Reply", ["Ready"]);
                alert("Waiting for enemy");
            }
        }else{
            //sollte die Methode aufgerufen werden obwohl man nicht
            //Bereit ist wird ein Fehler aufgerufen
            throw "Error while starting";
        }
    }

    //zum aufrufen der rekusiven Methode und zum zurücksetzten der Speicherung die 
    //bei dem rekusiven Algorithmus benötigt wird
    this.placeShipsRandom = function(){
        //ruft die Methode mit dem umgedrehten array Ships auf, damit es mit dem größten startet
        this.placeShipsRandomRec(this.ships.reverse(), this.gameFields[1].centerPoints, 0, 5);
        this.ships.reverse();
        //setzt die gespeicherten Felder wieder auf null damit man die Schiffe noch bewegen kann 
        if(!this.shipPosSafed){
            for(var ship of this.ships){
                ship.coverdFields = null;
            }
        }
    }


    //die rekursive Methode zum zufälligen setzten der Schiffe
    //Parameter : 1. Das array mit den Schiffen, 2. die mittelpunkte,
    //            3. die momentane iteration, 4. die maximalen versuche eine Schiff zu positionieren
    //               bevor abgebrochen wird und das Schiff, welches davor plaziert wurde umgesetzt wird
    this.placeShipsRandomRec = function(ships_, centerPoints, i, rotations){
        //wenn alle Schiffe plaziert wurden return true
        if(i >= ships_.length){
            return true;
        }
        //prüft ob i einen validen wert hat
        if(0 <= i && i < ships_.length){
            //kopiert das Array der mittelpunkte, damit wir sie ohne bedenken löschen können
            var center = centerPoints.slice();
            //initialisiert restliche hilfvariablen
            var x;
            var y;
            var result;
            var curRotation = 0;
            //while oder do-while ist mehr oder weniger egal 
            //aus vorheriger version wurde do-While behalten 
            do{
                //zufälliges x und y erzeugt (floor "rundet" auf eine ganze Zahl)
                x = floor(random(0, center.length-1));
                y = floor(random(0, center[x].length-1));
                //wenn etwas nicht funktioniert hat wird es nochmal versucht
                if(center[x][y] == null){
                    continue;
                }
                //setzt das Schiff auf die übergebenen Koordinaten
                this.setPos(ships_[i], center[x][y].x, center[x][y].y);
                //prüft ob das neue Schiff den schon gesetzten Schiffen in die quere kommt
                result = ships_[i].checkValidPosition(this.ships);
                //entfernt die Position aus dem Array der Mittelpunkte damit wir eine endliche
                //Menge an möglichkeiten zum plazieren der Schiffe haben
                //sollten wir einen schritt zurück gehen steht das alte Array mit den bisdahing 
                //noch nicht benutzten Mittelpunkten noch zur verfügung da wir am anfang eine Kopie gemacht haben
                center = this.removeIndexFromArray(center, x, y);
                //wenn das Schiff auf einer Validen Position steht, wird die Rekusion aufgerufen
                //Wenn die Rekursion ohne fehler durch laufen kann ist die if-Bedingung true
                //und wir können sicher sein dass alle Schiffe richtig plaziert wurde
                if(result && this.placeShipsRandomRec(ships_, center, i+1, rotations)){
                    return true;
                }
                //sollte das Schiff an keiner Validen Position stehen erhöhen wir den counter 
                //und versuchen es an einer andere Position
                curRotation++;
                //es werden soviele Positionen versucht wie rotations groß ist
            }while(curRotation < rotations)
            //sollte garkeine Position passen wird false zurück gegeben
            return false;
        }
    }

    //setzt die Position an die x & y Koordonaten die Übergeben wurden
    this.setPos = function(ship, x, y){
        //setzt das Schiff auf x & y ins unsere GameField
        ship.setPositionInPixel(x, y, this.gameFields[1]);
        //es besteht eine 50% chance, dass das Schiff noch gedreht wird; 
        if(random() > 0.5){
            ship.rotate(this.gameFields[1]);
        }
        //am ende werden die Felder die belegt wurden gespeichert, damit man das Schiff mit den
        //anderen Schiffen die schon stehen oder die noch kommen werden vergleichen kann
        //das wird in der "Hauptmethode" wieder rückgängig gemacht
        ship.setCoverdFields();
    }
    
    //die Methode removed ein spezielles Element aus einem 2D Array
    this.removeIndexFromArray = function(center, x, y){
        //das array wird kopiert
        var arrayToShort = center.slice();
        //es wird die Reihe die gekürt werden soll festgelegt
        var rowToShort = arrayToShort[x];

        //alle werte von 0 - (y-1) werden aus der ausgewählten Reihe in eine HilfsV geschrieben
        var rowZeroToY = rowToShort.slice(0, y)
        //alle werte von (y+1) - ende werden aus der ausgewälten Reihe in eine HilfsV geschrieben
        var rowYToEnd  = rowToShort.slice(y+1);
        //das für dazu dass es in der neuen Zeile das Element an der Position Y nicht mehr gibt
        var newRow = rowZeroToY.concat(rowYToEnd);
        //das ersezten der neune Zeile X duch die alte Zeile X führt dazu dass das gleiche Array
        //ohne das Element X,Y zurückgegeben wird
        arrayToShort[x] = newRow;
        return arrayToShort;
    }
}
