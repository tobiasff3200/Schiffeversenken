function Chat(x, y, wid, heig){
    
    this.chat = [];
    this.msg;
    
    this.heightT;
    this.focus;
    this.count;
    this.blink;
    
    this.setup = function(){
        this.msg = "";
        textSize(20);
        this.heightT = textAscent() + textDescent();
        this.focus = false;
        this.count = 0;
        this.blink = false;
    }
    
    this.show = function(){
        translate(x+wid/2, y+heig/2);
        textAlign(LEFT, BOTTOM);
        textStyle(NORMAL);
        //print chat
        fill(120);
        rectMode(CENTER);
        rect(0, 0, wid, heig);
        //print msg box
        fill(255);
        rect(0, heig*0.4, wid-wid/15, heig/30*4);

        if(this.count%30 == 0){
          this.blink = this.blink ? false : true;
        }
        if(this.focus && this.blink){
            line(-wid*0.45 + textWidth(this.msg), heig*0.4-(this.heightT/2), -wid*0.45 + textWidth(this.msg), heig*0.4+(this.heightT/2));
        }
        this.count++; 
        
        //print msg
        fill(0);
        text(this.msg, -wid*0.45, heig*0.4 + this.heightT/3);
        //print chat
        for(var i = 0; i < this.chat.length; i++){
          if(heig*0.35-(this.heightT)*(this.chat.length-i) > -heig/2){
            text((i+1)+": "+this.chat[i], -wid*0.45, heig*0.35-(this.heightT)*(this.chat.length-i));
          }
        }
        translate(0, 0);
    }
    
    this.printMsg = function(){
        this.msg = this.msg.trim();
        if(this.msg.length > 0){
          this.chat.push(this.msg);
          this.msg = "";
        }
    }
    
    this.postMsg = function(msg_){
        if(Array.isArray(msg_)){
            this.chat = Array.concat(this.chat, msg_);
        }else{
            this.chat += msg_;
        }
    }
    
    this.getMsg = function(index){
        if(0 <= index && index < this.chat.length){
            return this.chat[index];
        }
        return null;
    }
    
    this.callInput = function(inputTyp, data){
        if(inputTyp == "KeyPressed"){
            this.keyPressedChat(data[0], data[1]);
        }
        if(inputTyp == "MousePressed"){
            this.mousePressedChat(data.x, data.y);
        }
    }
    
    this.keyPressedChat = function(key, keyCode){
        if(keyCode != ENTER && 
           keyCode != BACKSPACE && 
           ((key+"").length) <= 1 &&
           this.checkValidKey(key+"") && 
           textWidth(this.msg) < wid-wid/15-textWidth("W")){
          this.msg += key;
        }
        if(keyCode == ENTER){
          this.printMsg();
        }
        if(keyCode == BACKSPACE){
          if(this.msg.equals != "")
            this.msg = this.msg.substring(0, this.msg.length-1);
        }
    }
    
    this.mousePressedChat = function(mX, mY){
        if(mX > x+wid/15 && mX < x+wid-wid/15 && mY > y+heig/2+heig*1/3 && mY < y+heig/2+heig*7/15){
            this.focus = true;
            this.blink = true;
            this.count = 31;
        }else{
            this.focus = false;
        }
    }
    
    this.checkValidKey = function(key){
        return new RegExp("^[a-zA-Z0-9 .öäü]+$").test(key);
    }
}