var gameManager;
var dataManager;
var chat;

function setup() {
    createCanvas(600, 600);
    gameManager = new GameManager();
    dataManager = new DataManager();
    chat = new Chat(285, 20, 250, 200);
    gameManager.setup(dataManager);
    chat.setup();
    dataManager.setup(gameManager, chat);
}

function draw() {
    background(0);
    gameManager.show();
    chat.show();
}


//die Methode callInput gibt true zurück wenn sie mit "KeyPressed" aufgerufen wurde
//dadruch wird sichergestellt, dass wenn man was in den chat schreibt man keine 
//Tastenkombination vom GameManager aufrufen möchte
//wird ggf. noch entfernt falls wir uns für buttons entscheiden
function keyPressed(){
    if(!chat.callInput("KeyPressed", [key, keyCode])){
        gameManager.callInput("KeyPressed", key);
    }
    
}   

function mousePressed(){
    gameManager.callInput("MousePressed", createVector(mouseX, mouseY));
    chat.callInput("MousePressed", createVector(mouseX, mouseY));
} 

function mouseReleased(){
    gameManager.callInput("MouseReleased", createVector(mouseX, mouseY));
}