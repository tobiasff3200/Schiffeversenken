var gameManager;

function setup() {
    createCanvas(450, 600);
    gameManager = new GameManager();
    gameManager.setup(); 
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