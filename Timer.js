function Timer(x, y, radius){
    
    this.maxTime = 30;
    this.timeAtActivation = []; //index 0 = min, index 1 = sec
    this.timerActive = false;
        
    this.setup = function(gameManager, time){ // maxTime in sec
        this.gameManager = gameManager;
        if(time != null){
            this.maxTime = time;
        }
    }
    
    this.show = function(){
        if(this.timerActive && this.checkTimeOver())
            this.stopTimer();
        if(!this.gameManager.gameEnd)
            this.drawTimer();
    }
    
    this.startTimer = function(){
        var currTime = new Date();
        this.timeAtActivation[0] = currTime.getMinutes();
        this.timeAtActivation[1] = currTime.getSeconds();
        this.timerActive = true;
    }
    
    this.stopTimer = function(){
        this.gameManager.shootAtRandomPosition();
        this.timerActive = false;
        this.timeAtActivation = [0, 0];
    }
    
    this.cancleTimer = function(){
        this.timerActive = false;
        this.timeAtActivation = [0, 0];
    }
    
    //true = Zeit abgelaufen, false = Zeit noch nicht abgelaufen 
    this.checkTimeOver = function(){
        var currTime = new Date();
        var minsToComplete = this.timeAtActivation[0] + parseInt((this.timeAtActivation[1] + this.maxTime)/60);
        var secToComplete = (this.timeAtActivation[1] + this.maxTime)%60;
        return currTime.getMinutes() >= minsToComplete &&
                currTime.getSeconds() >= secToComplete;
    }
    
    this.drawTimer = function(){
        push();
        translate(x+radius, y+radius)
        noFill();
        stroke(color(this.timerActive ? "red" : "green"));
        strokeWeight(4);
        rotate(-HALF_PI);
        var end = TWO_PI*this.calcSecondsLeft()/this.maxTime*0.99999;
        arc(0, 0, radius, radius, 0, (this.timerActive && end > 0) ? end : TWO_PI*0.99999);
        
        rotate(HALF_PI);
        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(13);
        if(this.timerActive){
            text(this.calcSecondsLeft(), 0, 0);
        }
        pop();
    }
    
    this.calcSecondsLeft = function(){
        var currTime = new Date();
        var minsLeft = this.timeAtActivation[0] + parseInt(this.maxTime/60) - currTime.getMinutes();
        var secLeft =  this.timeAtActivation[1] + parseInt(this.maxTime%60) - currTime.getSeconds();
        var timeLeft = minsLeft*60 + secLeft;
        return timeLeft > 0 ? timeLeft : 0; 
    }
}