function Button(name, x, y, wid, heig, func){
    this.name = name;
    
    this.color = color(255);
    this.colorClicked = color(255, 0, 0);
    this.clicked = false;
    
    //zeichnet einen Button
    this.show = function(){
        rectMode(CENTER);
        fill(this.clicked ? this.colorClicked : this.color);
        rect(x, y, wid, heig);
        fill(0);
        text(name, x, y);
    }
    
    //prüft ob der Button gedruckt wurde
    this.mousePressed = function(){
        if(x-wid/2 < mouseX && mouseX < x+wid/2 &&
           y-heig/2 < mouseY && mouseY < y+heig/2){
            //wenn ja soll chlicked true, damit der Button die farbe kurz ändert
            this.clicked = true;
            //die funktion wird aufgerufen
            func(this);
            return true;
        }
        return false;
    }
    
    //wenn die mouse nicht mehr gedrückt wird -> der Button auch nicht
    this.mouseReleased = function(){
        //sobald der Button los gelassen wird, wird er wieder weiß
        this.clicked = false;
    }
    
}