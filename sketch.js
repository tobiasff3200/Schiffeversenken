var gameManager;
var dataManager;

function setup() {
    createCanvas(450, 600);
    gameManager = new GameManager();
    dataManager = new DataManager();
    gameManager.setup(dataManager);
    dataManager.setup(gameManager);
}

function draw() {
    background(0);
    gameManager.show();
}



function keyPressed(){
	gameManager.callInput("KeyPressed", key);
}

function mousePressed(){
    gameManager.callInput("MousePressed", createVector(mouseX, mouseY));
} 

function mouseReleased(){
    gameManager.callInput("MouseReleased", createVector(mouseX, mouseY));
}