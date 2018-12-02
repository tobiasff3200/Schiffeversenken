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
        textAlign(LEFT, BOTTOM);
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
            if(heig*0.35-(this.heightT)*(this.chat.length-i) > -heig/3){
                //bekommt noch eine Nummer zugewiesen
                text(this.chat[i], -wid*0.45, heig*0.35-(this.heightT)*(this.chat.length-i));
            }
        }
        //übersetzte den ursprung zurück auf 0,0
        translate(0, 0);
        pop();
    }
    
    //schreibt die ÜBERGEBENE Nachricht in den chat, ohne dass man
    //eine nachricht schreiben muss
    this.postMsg = function(msg_){
        this.chat.push(msg_);
    }
}