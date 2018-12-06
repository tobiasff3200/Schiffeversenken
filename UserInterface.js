function UserInterface(x, y){    // 260, 440
    //alle Buttons in einem Array gespeichert
    this.buttons = [];
      
    this.setup = function(gameManager){
        //gameManager um die neusten Daten zu bekommen
        this.gameManager = gameManager;
        //die Buttons werden mit Text, Position und der aufzurufenden Funktion wenn ein Button gedrückt wird
        this.buttons.push(new Button("Place ships random", x+100, y+20, 200, 40, this.buttonPressed));
        this.buttons.push(new Button("Safe ships position", x+100, y+80, 200, 40, this.buttonPressed));
        this.buttons.push(new Button("Ready", x+100, y+140, 200, 40, this.buttonPressed));  
    }
    
    this.show = function(){
        for(var button of this.buttons){
            button.show();
        }
        //zeichnet eine "checkBox" an x und y und übergibt den status der angezeigt werden soll
        this.checkBox("You are Ready", x+220, y+130, gameManager.youReady);
        this.checkBox("Enemy is Ready", x+220, y+150, gameManager.enemyReady);
        this.checkBox("Ships safed", x+220, y+80, gameManager.shipPosSafed);
    }
    
    //prüft welcher button gedruückt wurde
    this.buttonPressed = function(button){
        if(button.name == "Place ships random")
            gameManager.placeShipsRandom();
        
        if(button.name == "Safe ships position")
            gameManager.safeShipPosition();
        
        if(button.name == "Ready")
            gameManager.checkGameReadyToPlay();
    }
    
    //pfrüt ob eine button gedrückt wurde
    this.mousePressed = function(mouseX, mouseY){
        for(var button of this.buttons){
            button.mousePressed();
        }
    }
    //pfrüt ob eine button nicht mehr gedrückt wird
    this.mouserReleased = function(mouseX, mouseY){
        for(var button of this.buttons){
            button.mouseReleased();
        }
    }
    
    //zeichnet eine art checkBox
    this.checkBox = function(title, x, y, state){
        push();
        //zeichnet ein Rechteck
        rectMode(CENTER);
        noFill();
        stroke(255);
        rect(x, y, 20, 20);
        //füllt das Rechteck mit dem Indikator des Status
        fill(state ? color("Green") : color("Red"));
        ellipse(x+.5, y+.5, 10);
        //schreibt den Text neben die Box
        fill(255);
        textAlign(LEFT);
        textStyle(NORMAL);
        textSize(14);
        text(title, x+15, y);
        pop();
    }
    
}