var cnv

var gameManager;
var dataManager;
var chat;
var userInterface;

function setup() {
    cnv = createCanvas(700, 700);
    //cnv.position((windowWidth - width)/2, (windowHeight - height)/2);
    gameManager = new GameManager();
    dataManager = new DataManager();
    chat = new Chat(285, 20, 250, 200);
    userInterface = new UserInterface(260, 300);
    dataManager.setup(gameManager, chat);
    gameManager.setup(dataManager);
    chat.setup();
    userInterface.setup(gameManager);
}

function draw() {
    background(0);
    gameManager.show();
    chat.show();
    if(!gameManager.gameStarted){
        userInterface.show();
    }
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
    userInterface.mousePressed();
}

function mouseReleased(){
    gameManager.callInput("MouseReleased", createVector(mouseX, mouseY));
    userInterface.mouserReleased();
}

function windowResized(){
    //cnv.position((windowWidth - width)/2, (windowHeight - height)/2);
}

window.addEventListener("beforeunload", function (e) {
    var confirmationMessage = 'Do you really want to leave the game?';

	if (gameManager.gameEnd) {
            return undefined;
        }
    (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
});
