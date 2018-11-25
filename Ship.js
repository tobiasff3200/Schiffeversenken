function Ship(x, y, length){
    //interne Konstante
    //besagt, dass ein Schiff nach oben gerichtet ist
    const UP = 99;
    //besagt, dass ein Schiff nach rechts greichtet ist
    const RIGHT = 98;
    
	//speichert die Position in "Pixel" als Vector
	this.position = createVector(x, y);
	//zeigt die momentane Rotation an
	this.rotation = UP;
    //speichert das momentan mittlere Feld, falls vorhanden
    this.momentField = null;
	//speichert die Indizes der überdeckten Felder und ob diese bereits beschossen wurden
    // x = row des Feldes, y = col des Feldes, z = {0, 1} 0 = nicht, 1 = beschossen
    //zudem indikator dafür ob das Spiel angefangen hat oder nicht, da am Anfang des Spieles    
    //die Felder jedes Schiffes in der Var gespeichert werden
	this.coverdFields = null;
    //idikator ob das schiff zerstört wurde oder nicht
    this.destroyed = false;
    //indikator ob das Schiff grade von der mouse bewegt wird oder nicht
    this.dragging = false;
	
    //zum initialisieren der Größe des Schiffes
	this.setup = function(){
		//die gleiche Größe wie ein Rechteck - 1/6 auf jeder Seite
		this.wid = SIZE-SIZE/3;
		this.heig = length*SIZE-SIZE/3; 
	}
	
    //zum darstellen der Schiffes
	this.show = function(){
		rectMode(CENTER);
        if(this.destroyed){
            fill(235, 80, 0);
        }else{
            fill(255);
        }
		rect(this.position.x, this.position.y, this.wid, this.heig);
	}
    
    //rotiert das Schiff um seine eigene Achse
	this.rotate = function(game){
        if(this.coverdFields == null){
            //wechselt die Höhe und die Breite
            var temp = this.wid;
            this.wid = this.heig;
            this.heig = temp;
            //wechselt die Rotation 
            this.rotation = (this.rotation == UP) ? RIGHT : UP;
            //setzt das Schiff auf die neue richtige Position
            if(this.momentField != null){
                var posPix = game.centerPoints[this.momentField.x][this.momentField.y];
                this.setShipInsideField(posPix.x, posPix.y, game);  
            }
        }     
	}
    
    //verbindet alle oberen setPosition methoden zu einer der man pixel(mouse)Koordinaten
    //übergeben kann und das Schiff damit bewegen kann, sodass es auf dem übergebenen Feld 
    //einrastet, aber überall sonst nicht
    this.setPositionInPixel = function(xPix, yPix, game){
        //prüft ob das Spiel angefangen hat oder nicht 
        // -> wenn ja dann müssen die überdeckten Felder gespeichert sein
        if(this.coverdFields == null){
            //wenn des Schiff über dem Feld ist soll es einrasten
            if(!this.setShipInsideField(xPix, yPix, game)){
                //wenn nicht setzt das Schiff auf die übergebenen koordinaten ohne was zu ändern
                this.setPositionOutOfField(xPix, yPix);
            }
        } 
    }
    
    //setzt das Schiff inherhalb des Feldes ab sodass es nicht "übersteht"
    this.setShipInsideField = function(xPix, yPix, game){
        //convertiert die PixelPos in FelderIndizes
        //falls xPix und yPix außerhalb des feldes wird abgebrochen und false returnt
        this.momentField = game.convertPixPosInFieldIndex(xPix, yPix);
        var pos = this.momentField;
        //sollte diese indizes null sein wird abgebrochen 
        //zb wenn der mittelpunkt des schiffes außerhalb ist wird das Schiff nicht
        //auf das Feld gerückt
        if(pos != null && this.setCoverdFields(pos.x, pos.y)){            
            //falls etwas übersteht wird es hier gefunden
            var lowestX = 0;
            var lowestY = 0;
            var maxX = game.centerPoints.length-1;
            var maxY = game.centerPoints[maxX].length-1;
            for(var coverdField of this.coverdFields){
                //entweder steht es "unten" oder "oben" raus aber nicht beides
                if(coverdField.x < lowestX){
                    lowestX = coverdField.x;
                }else if(coverdField.x > maxX){
                    maxX = coverdField.x;
                }
                if(coverdField.y < lowestY){
                    lowestY = coverdField.y;
                }else if(coverdField.y > maxY){
                    maxY = coverdField.y;
                }
            }
            /**detailierte Beschreibung**
            *   wenn es links übersteht (negativer Übertrag) soll overflow der Betrag sein,
            *   damit man diesen nachher auf die Position addieren kann und der Mittelpunkt
            *   um besagten übertrag nach rechts verschoben wird.
            *
            *   wenn es rechts übersteht (zu großer positvier Übertrag) soll um den Übertrag
            *   der Mittelpunkt nach links verschoben werden. Das passiert indem man die 
            *   maximal größe von dem zu großen wert abzieht. Der übertrag wird negiert, damit
            *   man nacher auch einfach addieren kann um den Mittelpunkt nach rechts,
            *   und nicht nach links(ohne negierung) zu verschieben.
            *   
            *   ist kein Übertrag vorhanden wird Overflow mit 0 initalisiert
            **/
            var overflowX = (lowestX < 0) ? Math.abs(lowestX) : 
            (maxX > game.centerPoints.length-1) ? -(maxX - (game.centerPoints.length-1)) : 0;

            var overflowY = (lowestY < 0) ? Math.abs(lowestY) : 
            (maxY > game.centerPoints[0].length-1) ? -(maxY - (game.centerPoints[0].length-1)) : 0;       

            this.coverdFields = null;
            //das Schiff wird auf die Position + übertrag gestellt
            return this.setAtField(parseInt(pos.x) + overflowX, parseInt(pos.y) + overflowY, game);  
        }else{
          //print("FEHLER!!!");  
            return false;
        }
    }
    
    //setzt das Schiff je nach Größe auf das richtige Feld
	this.setAtField = function(x, y, game){
        //checkt ob das Feld x,y existiert, bricht ab falls nicht 
        if(0 <= x && x < game.centerPoints.length && 0 <= y && y < game.centerPoints[x].length){
            this.momentField = createVector(x, y);
            //check ob das Schiff eine grade Länge hat
            if(length%2 != 0){
                //wenn nicht kann der Mittelpunkt als Position genommen werden
                this.position = game.centerPoints[x][y].copy();
            }else{ 
                //wenn doch muss die Rotation mit bedacht werden		
                var dir = (this.rotation == UP) ? createVector(0,1) : createVector(1,0);
                var center = game.centerPoints[x][y].copy();
                //wenn es nach Oben zeigt muss es nach "unten" korrigiert 
                //werden sonst nach "Links" korrigiert werden
                this.position = center.add(createVector((SIZE/2)*dir.x, (SIZE/2)*dir.y, 0));
            }
            return true;
        }
        return false;       
    }
    
    //setzt das schiff auf die übergebene Position ohne irgendetwas zu prüfen
    this.setPositionOutOfField = function(xPix, yPix){
        this.position = createVector(xPix, yPix);        
    }
    
    //prüft ob das Schiff an einer akzeptierten Position steht
    //überdecken sowie direktes nebeneinander stehen von Schiffen ist nicht erlaubt
    this.checkValidPosition = function(ships){
        //prüft ob das Schiff selbst überhaupt auf dem Feld plaziert ist
        if(this.setCoverdFields()){
            //durchläuft jede schiffe
            for(var ship of ships){
                //ignoriert sich selbst und die bei denen die Position noch nicht
                //bestimmt worden ist
                if(ship != this && ship.coverdFields != null){
                    //durchläuft bei beiden Schiffen (das was geprüft wird und das
                    //was momentan ausgewählt ist durch die schleife davor) die
                    //überdeckten Felder
                    for(var otherField of ship.coverdFields){
                        for(var thisField of this.coverdFields){
                            //sollte sich herrausstellen, dass das Schiff nicht richtig
                            //positioniert worden ist werden die Felder gelöscht und es
                            //wird false zurück gegeben
                            if(this.checkShipNextAndOverEachOther(thisField, otherField)){
                                this.coverdFields = null;
                                return false;
                            }
                        }
                    }
                }
            }
            return true;
        }else{
            return false;
        }
    }
        
    //bekommt 2 Felder Felder Übergeben. Das eine ist ein Feld diese Schiffes (fieldFlex)
    //und wir auch benutzt um die Felder um das Schiff herum zu prüfen
    //das andere ist vom jeweiligen anderen Schiff(fieldStat) und ändert sich nicht
    //die methode Prüft für jedes Feld ob das Feld selbst oder die 4 direkt drumherum
    //liegenden, vom festenFeld des anderen Schiffes überdeckt werden
    //ist das der Fall wird true zurück gegeben, sonst false
    this.checkShipNextAndOverEachOther = function(fieldFlex, fieldStat){
        return  (fieldFlex.x   == fieldStat.x && fieldFlex.y   == fieldStat.y) ||
                (fieldFlex.x-1 == fieldStat.x && fieldFlex.y   == fieldStat.y) ||
                (fieldFlex.x   == fieldStat.x && fieldFlex.y-1 == fieldStat.y) ||
                (fieldFlex.x+1 == fieldStat.x && fieldFlex.y   == fieldStat.y) ||
                (fieldFlex.x   == fieldStat.x && fieldFlex.y+1 == fieldStat.y);
    }
    
    //speichert die übereckten Felder des Schiffes in coverdFields
    this.setCoverdFields = function(){
        if(this.momentField != null){
            var index = 0;
            this.coverdFields = [];
            var start;
            var end;
            var index = 0;
            if(length%2 != 0){
                if(this.rotation == UP){
                    //wenn ungrade länge-1(=grade Zahl) halbieren und auf momentanePos rechnen
                    start = this.momentField.y - (length-1)/2;
                    //parseInt da sonst + als "concat" verstanden wird
                    end = parseInt(this.momentField.y) + (length-1)/2;
                    //wenn direction nach oben ändere den y wert bei jedem index
                    while(start+index <= end){
                       this.coverdFields[index] = createVector(this.momentField.x, start+index, EMPTY);
                       index++;
                    }                 
                }else{
                    //wenn ungrade länge-1(=grade Zahl) halbieren und auf momentanePos rechnen
                    start = this.momentField.x - (length-1)/2;
                    //parseInt da sonst + als "concat" verstanden wird
                    end = parseInt(this.momentField.x) + (length-1)/2;
                    //wenn direction nach rechts ändere den x wert bei jedem index
                    while(start+index <= end){
                       this.coverdFields[index] = createVector(start+index, this.momentField.y, EMPTY);
                       index++;
                    }
                }              
            }else{
                if(this.rotation == UP){
                    //wenn grade halbiere die länge und setzte den start "zurück"
                    //bsp. länge 4 : ■■■■ halb 2 aber momPos ist nicht in der mitte deswegen +1
                    start = this.momentField.y - (length)/2 + 1;
                    //parseInt da sonst + als "concat" verstanden wird
                    end = parseInt(this.momentField.y) + length/2;
                    //wenn direction nach oben ändere den y wert bei jedem index
                    while(start+index <= end){
                       this.coverdFields[index] = createVector(this.momentField.x, start+index, EMPTY);
                       index++;
                    }                 
                }else{
                    //wenn grade halbiere die länge und setzte den start "zurück"
                    //bsp. länge 4 : ■■■■ halb 2 aber momPos ist nicht in der mitte deswegen +1
                    start = this.momentField.x - (length)/2 + 1;
                    //parseInt da sonst + als "concat" verstanden wird
                    end = parseInt(this.momentField.x) + length/2;
                    //wenn direction nach rechts ändere den x wert bei jedem index
                    while(start+index <= end){
                       this.coverdFields[index] = createVector(start+index, this.momentField.y, EMPTY);
                       index++;
                    }
                }        
            }
            return true;
        }
        return false;
	}
    
    //errechnet vom Schiffmittelpunkt die äußersten Enden und checkt ob die mouse innerhalb ist
    this.checkMouseInside = function(){
        return (this.position.x-(this.wid/2) < mouseX && mouseX < this.position.x+(this.wid/2) &&
               this.position.y-(this.heig/2) < mouseY && mouseY < this.position.y+(this.heig/2))      
    }
    
    //prüft ob das Schiff auf dem Feld steht was beschossen wurde
    this.checkHit = function(x, y, game){
        //check ob das angegebene Feld und gespeicherte Felder exestieren
        if(0 <= x && x < game.centerPoints.length && 
           0 <= y && y < game.centerPoints[x].length && this.coverdFields != null){
            //durchlaufe alle gespeicherten Felder und prüfe auf übereinstimung
            for(var index in this.coverdFields){
                var coverdField = this.coverdFields[index];
                if(coverdField.x == x && coverdField.y == y && coverdField.z == EMPTY){
                    //wenn ja jetzte den Status des Feldes auf HIT und return true;
                    //hier wird nicht die hilfsVar benutzt, da der wert sonst nicht richtig
                    //zugewiesen wird
                    this.coverdFields[index] = createVector(x, y, HIT);
                    return true;
                }
            }
        }
        return false;
    }
    
    //prüft ob das Schiff versenkt wurde
    this.checkDown = function(){
        //checkt ob die überdeckten Felder gespeichert wurden
        if(this.coverdFields != null){
            //durchläuft alle überdeckten Felder und prüft die z koordinate welche den Status
            //des Feldes enthält. Falls alle getroffen worden sind return true
            for(var coverdField of this.coverdFields){
                if(coverdField.z != HIT){
                    //wenn einer nicht getroffen wurde kann man abbrechen
                    return false;
                }
            }
            //setzt destroyed auf true und returnt dass es zerstört wurde
            this.destroyed = true;
            return true;
        }
        //wenn die Felder noch nicht gespeichert wurden (das spiel hat noch nicht angefangen)
        return false;
    }
}	
