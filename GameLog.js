function GameLog(x, y, wid, heig){
    //speichert den Gesamten chat
    this.chat = [];
    //speichert die momentan geschriebene Nachricht
    this.msg;
    
    //definiert die höhe des Textes
    this.heightT;
    
    this.dataManager;
    
    this.setup = function(dataManager){
        this.msg = "";
        textSize(20);
        this.heightT = textAscent() + textDescent();
    }
    
    //zum darstellen des Textes und des Chats
    this.show = function(){
        push();
        //übersetzt den Ursprung auf die Mitte des Feldes
        translate(x+wid/2, y+heig/2);
        //setzt die Textanlehnung auf Links und Unten
        textAlign(CENTER, BOTTOM);
        //es soll normal geschrieben werden
        textStyle(NORMAL);
               
        //print chatField
        fill(120, 100);
        rectMode(CENTER);
        rect(0, 0, wid, heig);


        fill(255, 150);
        //print chat
        //für jeden inhalt im Chat eine neue Zeile
        for(var i = 0; i < this.chat.length; i++){
            //darf icht größer sein als das TextField
            if(heig/1.8-(this.heightT)*(this.chat.length-i) > -heig/3){
                textAlign(this.chat[i][1]%2==0 ? RIGHT : LEFT);
                text(this.chat[i][0], 0, heig/2.1-(this.heightT)*(this.chat.length-i), wid-20, this.heightT);
            }
        }
        //übersetzte den ursprung zurück auf 0,0
        translate(0, 0);
        pop();
    }
    
    //schreibt die ÜBERGEBENE Nachricht in den chat, ohne dass man
    //eine nachricht schreiben muss
    this.postMsg = function(x, y, result, turn){
        var xString = (x<fieldNumbers.length) ? fieldNumbers[x] : null;
        var yString = (y<fieldChars.length) ? fieldChars[y] : null;
        var playerS = (turn%2==0) ? "You" : "The enemy";
        var resultS = (result == DESTROYED) ? "destroyed" : (result == HIT) ? "hit" : "miss";
        var newMsg = [playerS + " shot at " + yString + " " + xString + " and " + resultS + " a ship", turn];
        this.chat.push(newMsg);
    }
}