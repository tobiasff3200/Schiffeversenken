function GameLog(x, y, wid, heig){
    //speichert den Gesamten chat
    this.chat = [];
    //speichert die momentan geschriebene Nachricht
    this.msg;
    
    //definiert die höhe des Textes
    this.heightT;
    
    
    this.fadeCount = 0;
    this.fadeMax = 60*2; //frames * sekunde
    
    this.setup = function(gameManager){
        this.gameManager = gameManager;
        this.msg = "";
        textSize(20);
        this.heightT = textAscent() + textDescent();
    }
    
    //zum darstellen des Textes und des Chats
    this.show = function(){
        push();
        //übersetzt den Ursprung auf die Mitte des Feldes
        translate(x+wid/2, y+heig/2);
        
        //print chatField
        fill(120, 100);
        rectMode(CENTER);
        rect(0, 0, wid, heig);

        noStroke();
        fill(255, 150);
        //print chat
        //für jeden inhalt im Chat eine neue Zeile
        for(var i = 0; i < this.chat.length; i++){
            //darf icht größer sein als das TextField
            if(heig/1.8-(this.heightT)*(this.chat.length-i) > -heig/3){
                if(i == this.chat.length-1){
                    //der letzte Zug soll farbig gekennzeichnet sein
                    var from = color(255, this.chat[i][1]%2==0 ? 220 : 130);
                    to = color(255, 114, 0, 240);
                    fill(lerpColor(from, to, this.fadeCount/this.fadeMax));
                    //color gray - fill(255, 155);
                    //color pint - fill(255, 0, 255, 240);
                    //& in der Mitte stehen
                    textAlign(CENTER, BOTTOM);
                    //& fett gedruckt sein
                    textStyle(BOLD);
                }else{
                    //macht die letzten Züge grau
                    fill(255, this.chat[i][1]%2==0 ? 220 : 130);
                    //& setzt des Spielers nach links und die des Gegners nach Rechts
                    textAlign(this.chat[i][1]%2==0 ? RIGHT : LEFT, BOTTOM);
                    //& schreibt sie normal
                    textStyle(NORMAL);
                }
                text(this.chat[i][0], 0, heig/2.1-(this.heightT)*(this.chat.length-i), wid-20, this.heightT);
            }
        }    
        
        this.fadeCount = this.fadeCount > 0 ? this.fadeCount-1 : 0; 
        
        //übersetzte den ursprung zurück auf 0,0
        translate(0, 0);
        pop();
        
        this.checkBox("Your turn", x+50, y+heig+20, (gameManager.gameTurn+1)%2);
        this.checkBox("Enemy's turn", x+185, y+heig+20, (gameManager.gameTurn)%2);
    }
    
    //schreibt die ÜBERGEBENE Nachricht in den chat, ohne dass man
    //eine nachricht schreiben muss
    this.postMsg = function(x, y, result, turn){
        var xString = (x<fieldNumbers.length) ? fieldNumbers[x] : null;
        var yString = (y<fieldChars.length) ? fieldChars[y] : null;
        var playerS = (turn%2==0) ? "You" : "Enemy";
        var resultS = (result == DESTROYED) ? "destroyed" : (result == HIT) ? "hit" : "missed";
        var newMsg = [playerS + " shot at " + yString + xString + " and " + resultS + " a ship", turn];
        this.chat.push(newMsg);
        this.fadeCount = this.fadeMax;
    }
    
    //function aus UserInterface
    this.checkBox = function(title, x, y, state){
        push();
        rectMode(CENTER);
        noFill();
        stroke(255);
        rect(x, y, 20, 20);
        
        fill(255);
        textAlign(LEFT);
        textStyle(NORMAL);
        textSize(14);
        text(title, x+15, y);
        
        fill(state ? color("Green") : color("Red"));
        ellipse(x+.5, y+.5, 10);     
        pop();
    }
}