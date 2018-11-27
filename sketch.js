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



function keyPressed(){
	gameManager.callInput("KeyPressed", key);
    chat.callInput("KeyPressed", [key, keyCode]);
}   

function mousePressed(){
    gameManager.callInput("MousePressed", createVector(mouseX, mouseY));
    chat.callInput("MousePressed", createVector(mouseX, mouseY));
} 

function mouseReleased(){
    gameManager.callInput("MouseReleased", createVector(mouseX, mouseY));
}