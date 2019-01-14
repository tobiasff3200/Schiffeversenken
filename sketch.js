var cnv;

var gameManager;
var dataManager;
var chat;
var userInterface;
var computer;
var playOffline = false;

function setup() {
    cnv = createCanvas(700, 700);       //eigentliche größe 600, 550
    cnv.position((windowWidth - 600)/2, 0);
    gameManager = new GameManager();
    dataManager = new DataManager();
    if(playOffline){
        computer = new Computer();
    }
    chat = new Chat(285, 20, 250, 200);
    userInterface = new UserInterface(260, 310);
    dataManager.setup(gameManager, chat, computer);
    gameManager.setup(dataManager, playOffline);
    chat.setup();
    if(computer != null)
        computer.setup(dataManager);
    userInterface.setup(gameManager);
}

function draw() {
    background(0);
    gameManager.show();
    chat.show();
    if(computer != null)
        computer.show();
    if(!gameManager.gameStarted)
        userInterface.show();
}


//die Methode callInput gibt true zurück wenn sie mit "KeyPressed" aufgerufen wurde
//dadruch wird sichergestellt, dass wenn man was in den chat schreibt man keine
//Tastenkombination vom GameManager aufrufen möchte
//wird ggf. noch entfernt falls wir uns für buttons entscheiden
function keyPressed(){
    if(!chat.callInput("KeyPressed", [key, keyCode])){
        gameManager.callInput("KeyPressed", key);
    }
    if(this.playOffline){
        computer.callInput("KeyPressed", [key, keyCode]);
    }
}

function mousePressed(){
    gameManager.callInput("MousePressed", createVector(mouseX, mouseY));
    chat.callInput("MousePressed", createVector(mouseX, mouseY));
    userInterface.mousePressed();
}

function mouseReleased(){
    gameManager.callInput("MouseReleased", createVector(mouseX, mouseY));
    userInterface.mouserReleased();
}

function windowResized(){
    cnv.position((windowWidth - 600)/2, 0);
}

window.addEventListener("beforeunload", function (e) {
    var confirmationMessage = 'Do you really want to leave the game?';

	if (gameManager.gameEnd) {
            return undefined;
        }
    (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
});
