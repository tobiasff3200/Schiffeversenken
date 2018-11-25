function DataManager(gameManager){

  this.sendedData = [];
  
  this.setup = function(){
    this.sendedData[0] = [];
  }
  
  this.send = function(receiver, typ, data){
    //convert data in JSON
    //send as JSON
    //if typ == "Ask" safe in sendedData with generated random Number
  }
  
  this.receiveData = function(data){
    //decodeJSON in array
    //if typ == "Reply" -> execute gameManager.receiveReply(data);
    
    //if typ == "Ask" && number in sendedData[][] -> execute gameManager.receiveResult(data)
    
    //if typ == "Ask" && number NOT in sendedData[][] -> execute gameManager.receiveQuestion(data)
  
  }
}
