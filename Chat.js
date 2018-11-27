function Chat(x, y, wid, heig){
    //speichert den Gesamten chat
    this.chat = [];
    //speichert die momentan geschriebene Nachricht
    this.msg;
    
    //definiert die höhe des Textes
    this.heightT;
    //indikator für den Focus auf dem textField
    this.focus;
    //indikator für den Status des
    //"Momentane Positions Strich" im textField
    this.blink;
    //wird benötigt um regelmäßig zu blinken
    this.count;
    
    this.dataManager;
    
    this.setup = function(dataManager){
        this.msg = "";
        textSize(20);
        this.heightT = textAscent() + textDescent();
        this.focus = false;
        this.blink = false;
        this.count = 0;
        this.dataManager = dataManager;
        
    }
    
    //zum darstellen des Textes und des Chats
    this.show = function(){
        //übersetzt den Ursprung auf die Mitte des Feldes
        translate(x+wid/2, y+heig/2);
        //setzt die Textanlehnung auf Links und Unten
        textAlign(LEFT, BOTTOM);
        //es soll normal geschrieben werden
        textStyle(NORMAL);
               
        //print chatField
        fill(120);
        rectMode(CENTER);
        rect(0, 0, wid, heig);
        
        //print msg box
        fill(255);
        rect(0, heig*0.4, wid-wid/15, heig/30*4);

        //alle 30 frames soll der Strich blinken
        if(this.count%30 == 0){
          this.blink = this.blink ? false : true;
        }
        this.count++;
        
        //zeichne den Strich wenn es focusiert ist und blinken soll
        if(this.focus && this.blink){
            line(-wid*0.45 + textWidth(this.msg), heig*0.4-(this.heightT/2), -wid*0.45 + textWidth(this.msg), heig*0.4+(this.heightT/2));
        } 
        
        //print msg
        fill(0);
        text(this.msg, -wid*0.45, heig*0.4 + this.heightT/3);
        
        //print chat
        //für jeden inhalt im Chat eine neue Zeile
        for(var i = 0; i < this.chat.length; i++){
            //darf icht größer sein als das TextField
            if(heig*0.35-(this.heightT)*(this.chat.length-i) > -heig/2){
                //bekommt noch eine Nummer zugewiesen
                text((i+1)+": "+this.chat[i], -wid*0.45, heig*0.35-(this.heightT)*(this.chat.length-i));
            }
        }
        //übersetzte den ursprung zurück auf 0,0
        translate(0, 0);
    }
    
//---------------------------inputs--------------------------------//
    //wird aufgerufen wenn ein input betätigt wurde und
    //entscheidet welche Inputmethode aufgerufen wird
    this.callInput = function(inputTyp, data){
        if(inputTyp == "KeyPressed"){
            this.keyPressedChat(data[0], data[1]);
        }
        if(inputTyp == "MousePressed"){
            this.mousePressedChat(data.x, data.y);
        }
    }
    
    //wenn eine Taste gedrückt wurde
    this.keyPressedChat = function(key, keyCode){
        //führe das nur aus wenn der focus auf dem textfield liegt
        if(this.focus){
            //nur zugelassene Tasten sollen zur neuen Nachricht
            //hinzugefügt werden und die Nachricht darf nicht zu lang sein
            if(keyCode != ENTER && 
               keyCode != BACKSPACE && 
               ((key+"").length) <= 1 &&
               this.checkValidKey(key+"") && 
               textWidth(this.msg) < wid-wid/15-textWidth("W")){
                //hänge den gedrückten buchstaben an die Nachicht an
                this.msg += key;
            }
            //wenn enter gedrückt wurde sende die nachricht
            if(keyCode == ENTER){
                this.printMsg(); 
                dataManager.send("CH", "Reply", this.msg);
            }
            //lösche den letzten buchstaben wenn Backspace gedrückt wurde
            if(keyCode == BACKSPACE){
              if(this.msg.equals != "")
                this.msg = this.msg.substring(0, this.msg.length-1);
            }
        }
    }
    
    //wird aufgerufen wenn due maus aufgerufen wird
    this.mousePressedChat = function(mX, mY){
        if(mX > x+wid/15 && mX < x+wid-wid/15 && mY > y+heig/2+heig*1/3 && mY < y+heig/2+heig*7/15){
            //wenn ins Textfield gedrückt wird, setzte den focus und
            //den count und starte zu blinken
            this.focus = true;
            this.blink = true;
            this.count = 31;
        }else{
            //
            this.focus = false;
        }
    }
    
    //um die scrollDown function zu unterbinden
    window.onkeydown = function(e) {
      if (e.keyCode == 32 && e.target == document.body) {
        e.preventDefault();
      }
    };
    
//---------------------------inputs--------------------------------//
    //prüft ob ein gultiger Buchstabe oder ein Zeichen gefrückt wurde
    this.checkValidKey = function(key){
        return new RegExp("^[a-zA-Z0-9 .öäü!?/()_-]+$").test(key);
    }
    
    //schreibt die geschriebene Massage in den chat
    this.printMsg = function(){
        //entfernt leerzeichen vor und nach dem String, aber ändert
        //den string nicht -> leerziechen im String werden ignoriert
        this.msg = this.msg.trim();
        //wenn die msg größer als 0 ist 
        if(this.msg.length > 0){
            //hänge die Nachricht and den Chat dran
            this.chat.push(this.msg);
            //setzte die nachricht wieder auf 0, bzw einen leeren String
            this.msg = "";
        }
    }
    
    //schreibt die ÜBERGEBENE Nachricht in den chat, ohne dass man
    //eine nachricht schreiben muss
    this.postMsg = function(msg_){
        this.chat.push(msg_);
    }
    
    //gibt den Text an der Position index zurück
    //(1 <= index < arr.length) wie im chat dargestellt
    this.getMsg = function(index){
        if(0 < index && index <= this.chat.length){
            return this.chat[index-1];
        }
        return null;
    }
}