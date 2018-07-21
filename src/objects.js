function createCharacter() //generates and contains game character
{
    let obj = {};
    obj.coordinates = [0,0]; //player characters coordinates stored as x,y pair and player movement vector
    obj.moveVector = [0,0]; // character movement vector
    obj.sprite = [0,0,30,46];
    
    obj.jump1 = true;
    obj.jump2 = false;
    obj.jumpPowerup = false;
    obj.jumpTap = true;
        
    obj.dashPowerup = false;
    obj.dashTap = false;
    obj.dashGround = false;
    obj.dashCd = 0;
    
    obj.state = 1;
    obj.animationFrame = 1;
    
    obj.health = 4;
    obj.maxHealth = 4;
    
    obj.respawnLocation = [0,0];
    obj.dead = false;

    obj.projectiles = [];
    obj.projectilePowerup = false;
    obj.projectileTap = false;
    
    obj.iFrames = 0;
    
    obj.jump = function()
    {
        if((this.jump1 && this.jumpTap) || (this.jump2 && this.jumpTap))
        {
            this.moveVector[1] = -4;
            this.jumpCharges--;
            if(this.jump1)
                this.jump1 =false;
            else
                this.jump2 =false;
            JumpSFX.play();
            this.jumpTap = false;
        }
    };
    obj.dash = function()
    {
        if(this.dashTap && this.dashPowerup && this.dashGround && this.dashCd < 0)
        {
            this.dashCd = 60;
            DashSFX.play();
            this.dashTap = false;
            this.dashGround = false;
            this.moveVector[0] += 20*Math.sign(this.state);

        }
                         
    };
    
      obj.hurt = function()
    {
        if(this.iFrames <= 0)
        {
            this.health--;
            this.iFrames = 30
        }
    };
    
    obj.shoot = function()
    {
        if(this.projectileTap && this.projectilePowerup)
        {
            this.projectiles.push(projectile(this.coordinates[0],this.coordinates[1],this.state));
            this.projectileTap = false;
        }
                         
    };
    
    obj.tick = function ()
    {
        if(this.dead)//death handler
            resetGame();
        else if(this.health<1)
        {
            messageSystem("       You Are Dead        Press Enter to continue");
            this.dead = true;
        }
        
        userInputHandler();//user input 
        
        if (this.moveVector[1] == 0 && this.moveVector[0] != 0)//player animation handler
            this.state = 1;
        else if (this.moveVector[1] > 0 && this.moveVector[0] != 0)
             this.state = 2;
        else if (this.moveVector[1] < 0 && this.moveVector[0] != 0)
             this.state = 3; 
        if(this.moveVector[0] < 0)
            this.state = this.state*(-1);
        if(this.moveVector[0] != 0)
            this.animationFrame ++;
        if(this.animationFrame > 10000)
            this.animationFrame = 1;
        
        this.coordinates[0] += this.moveVector[0];//physics handler
        this.coordinates[1] += this.moveVector[1];
        this.moveVector[0] = this.moveVector[0]*0.8; //friction
        if(Math.abs(this.moveVector[0])<0.1) //friction
            this.moveVector[0] = 0;
        this.moveVector[1] += 0.1; //gravity
	    if(this.moveVector[1]>5)
            this.moveVector[1] = 5; //gravity

        if(this.dashCd >= 0) //dash timer
            this.dashCd--;
        if(this.iFrames > 0) //invincibility frame timer
            this.iFrames--;
        this.jump1 = false; //prevents using first jump after leaving platform
        
        for (let i= 0; i<currentRoom.static.length; i++)//handles all collision with static objects
        {
            if(tileList[currentRoom.static[i].tileNum].passable > 0)//ignores background elemnts and enemy blockers
                if(roughCollision(this.coordinates[0],this.coordinates[1],this.sprite[2],this.sprite[3],currentRoom.static[i].x, currentRoom.static[i].y,tileList[currentRoom.static[i].tileNum].w*2, tileList[currentRoom.static[i].tileNum].h*2))
                {
                    switch(tileList[currentRoom.static[i].tileNum].passable)
                    {
                    case 1:
                        fineCollision(this.coordinates[0],this.coordinates[1],this.sprite[2],this.sprite[3],currentRoom.static[i].x, currentRoom.static[i].y,tileList[currentRoom.static[i].tileNum].w*2, tileList[currentRoom.static[i].tileNum].h*2);
                        break;
                    case 2:
                        this.hurt();
                        this.coordinates = [this.respawnLocation[0],this.respawnLocation[1]];
                        FallSFX.play();
                        break;
                    }

                }
        }

    };
    obj.draw = function()
    {
        
        /*onScreenSurface.font = "20px Courier New";
        onScreenSurface.fillStyle = 'White';
        onScreenSurface.fillText(this.coordinates.toString(),70,70);//Debug info */

        if(this.iFrames%2 == 0) //strobes player for invincibility frames
        {
            if(Math.abs(this.state) == 1)// on the ground 
            {
                if(this.state > 0) // facing right
                    onScreenSurface.drawImage(characterImage, 9+(32*((Math.floor(this.animationFrame/10))%4)), 41, 15 ,23,
                        Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),character.sprite[2],character.sprite[3]);
                else // facing left           
                    onScreenSurface.drawImage(characterImage, 711-(32*((Math.floor(this.animationFrame/10))%4)), 7, 15 ,23,
                        Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),character.sprite[2],character.sprite[3]);

            }
            else if (Math.abs(this.state) == 3)// in the air moving up
            {
                if(this.state > 0) // facing right
                    onScreenSurface.drawImage(characterImage, 201, 41, 15 ,23,
                        Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),character.sprite[2],character.sprite[3]);
                else // facing left           
                    onScreenSurface.drawImage(characterImage, 711-192, 7, 15 ,23,
                        Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),character.sprite[2],character.sprite[3]);

            }
            else if (Math.abs(this.state) == 2)// in the air moving down
            {
                if(this.state > 0) // facing right
                    onScreenSurface.drawImage(characterImage, 233, 41, 15 ,23,
                        Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),character.sprite[2],character.sprite[3]);
                else // facing left           
                    onScreenSurface.drawImage(characterImage, 711-224, 7, 15 ,23,
                        Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),character.sprite[2],character.sprite[3]);

            }
        }
    };
    return (obj);
}

function door(x,y,w,h,level,cx,cy)
{
    let obj = {};
    obj.coordinates = [x,y,w,h];
    obj.destination = [cx,cy,level]
    obj.tick = function()
    {
        if (roughCollision(this.coordinates[0],this.coordinates[1],this.coordinates[2],this.coordinates[3],
                           character.coordinates[0],character.coordinates[1],character.sprite[2],character.sprite[3]))
            nextLevel(this.destination[2],this.destination[0],this.destination[1]);
    };
    obj.draw = function()
    {
        //onScreenSurface.fillStyle = 'red';
        //onScreenSurface.fillRect(this.coordinates[0]-camera.coordinates[0],this.coordinates[1]-camera.coordinates[1],this.coordinates[2],this.coordinates[3]);
    };
    return obj;
}

function breakable(x,y,num)
{
    let obj = {};
    obj.coordinates = [x,y];
    obj.num = num;
    obj.tick = function()
    {
        for(let i = 0;i<character.projectiles.length;i++)
            if (roughCollision(this.coordinates[0],this.coordinates[1],32,96,character.projectiles[i].coordinates[0],character.projectiles[i].coordinates[1],20,20))
            {
                    BreakSFX.play();						
                    currentRoom.active.splice(currentRoom.active.indexOf(this), 1);
                    levelPreventSpawn[this.num]= true;
                    character.projectiles.splice(character.projectiles.indexOf(i), 1);
            }
        
        if (roughCollision(character.coordinates[0],character.coordinates[1],character.sprite[2],character.sprite[3],
                           this.coordinates[0],this.coordinates[1],32,96))
                fineCollision(character.coordinates[0],character.coordinates[1],character.sprite[2],character.sprite[3],
                    this.coordinates[0],this.coordinates[1],32,96);

    };
    obj.draw = function()
    {
        onScreenSurface.drawImage(tilesImage,192,607,16,48,Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),32,96);
    };
    return obj;
}

function slime(x,y)
{
    let obj = {};
    obj.coordinates = [x,y];
    obj.direction = true;
    obj.bounceAngle = 0;
    obj.animationTimer = 0;
    obj.dead = false;
    obj.tick = function()
    {
        if(!this.dead)
        {
            for(let i = 0;i<character.projectiles.length;i++)
                if (roughCollision(this.coordinates[0],this.coordinates[1],32,32,character.projectiles[i].coordinates[0],character.projectiles[i].coordinates[1],20,20))
                {
                    SlimeSFX.play();
                    this.dead = true;
                    this.animationTimer =0;
                    character.projectiles.splice(character.projectiles.indexOf(i), 1);
                    i = character.projectiles.length;
                }
            if (roughCollision(character.coordinates[0],character.coordinates[1],character.sprite[2],character.sprite[3],this.coordinates[0],this.coordinates[1],32,32))
            {
                FallSFX.play();						
                this.bounceAngle = Math.atan2((this.coordinates[0]+16)-(character.coordinates[0]+15),(this.coordinates[1]+16)-(character.coordinates[1]+23));
                character.hurt();
                character.moveVector[0] -= 20*Math.sin(this.bounceAngle);
                character.moveVector[1] = -5*Math.cos(this.bounceAngle);
            }
            for (let i= 0; i<currentRoom.static.length; i++)
            {
                if(tileList[currentRoom.static[i].tileNum].passable == -1)
                {
                    if(roughCollision(this.coordinates[0],this.coordinates[1],32,32,currentRoom.static[i].x, currentRoom.static[i].y,tileList[currentRoom.static[i].tileNum].w*2, tileList[currentRoom.static[i].tileNum].h*2))
                        this.direction = !this.direction
                }
            }
            if(this.direction)
                this.coordinates[0]+=1;
            else
                this.coordinates[0]-=1;
        }
        else
        {            
            if(this.animationTimer == 59)
                currentRoom.active.splice(currentRoom.active.indexOf(this), 1);
        }
        this.animationTimer ++;
        if(this.animationTimer > 10000)
            this.animationTimer = 0;

    };
    obj.draw = function()
    {
        if(!this.direction)
        {
            if(!this.dead)
            {
                onScreenSurface.drawImage(tilesImage,242+(32*(Math.floor(this.animationTimer/6)%10)),235,16,16,Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),32,32);
            }
            else 
            {
                onScreenSurface.drawImage(tilesImage,242+(32*(Math.floor(this.animationTimer/6)%10)),255,16,16,Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),32,32);
            }
        }
        else
        {
            if(!this.dead)
            {
                onScreenSurface.drawImage(tilesImage,531-(32*(Math.floor(this.animationTimer/6)%10)),274,16,16,Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),32,32);
            }
            else
            {
                onScreenSurface.drawImage(tilesImage,251-(32*(Math.floor(this.animationTimer/6)%10)),296,16,16,Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),32,32);
            }
        }
    };
    return obj;
}

function bird(x,y)
{
    let obj = {};
    obj.coordinates = [x,y];
    obj.returnCoordinates = [x,y];
    obj.targetCoordinates = [x,y];
    obj.diveState = false;
    obj.direction = true;
    obj.visualState = true;
    obj.diveTimer = 0;
    obj.characterDistance = 250;
    obj.bounceAngle = 0;
    obj.diveAngle = 0;
    obj.animationTimer = 0;
    obj.tick = function()
    {
        if(this.characterDistance < 190 && !this.diveState) //checks if enemy should dive
        {
            this.diveState = true;
            this.targetCoordinates = [character.coordinates[0]+15,character.coordinates[1]+23]
            this.diveTimer = 0;
            this.diveAngle = Math.atan2(this.targetCoordinates[0]-(this.coordinates[0]+32),(this.targetCoordinates[1]-this.coordinates[1]+32));
            if(this.diveAngle > 0)
                this.visualState = true;
            else
                this.visualState = false;
        }
        
        if(this.direction)
            this.returnCoordinates[0]+=1;
        else if (!this.direction)
            this.returnCoordinates[0]-=1;

        if(!this.diveState) //normal state
        {
            this.coordinates = [this.returnCoordinates[0],this.returnCoordinates[1]];
            this.characterDistance = Math.sqrt(Math.pow(((character.coordinates[0]+15)-(this.coordinates[0]+32)),2)
                            +Math.pow(((character.coordinates[1]+23)-(this.coordinates[1]+32)),2));
            this.visualState = this.direction;
        }
        else if (this.diveTimer == 0) //dive
        {
            this.coordinates[0] += 2*Math.sin(this.diveAngle);
            this.coordinates[1] += 2*Math.cos(this.diveAngle);
            if((Math.abs(this.coordinates[1]-this.targetCoordinates[1]) <=3))
            {
                this.diveTimer++;
            }
        }
        else if (this.diveTimer <= 50) //move after dive
        {
            if(this.visualState)
                this.coordinates[0] +=1;
            else
                this.coordinates[0] -= 1;
            this.diveTimer ++;
        }
        else // return to normal state
        {
            this.diveAngle = Math.atan2(this.returnCoordinates[0]-this.coordinates[0],this.returnCoordinates[1]-this.coordinates[1]);
            this.coordinates[0] += 1*Math.sin(this.diveAngle);
            this.coordinates[1] += 1*Math.cos(this.diveAngle);
            if(this.diveAngle > 0)
                this.visualState = true;
            else
                this.visualState = false;
            if(Math.abs(this.coordinates[1] - this.returnCoordinates[1]) <=3)
            {
                this.diveState = false;
                this.direction = this.visualState;
                this.characterDistance = Math.sqrt(Math.pow(((character.coordinates[0]+15)-(this.coordinates[0]+32)),2)
                    +Math.pow(((character.coordinates[1]+23)-(this.coordinates[1]+32)),2));
            }
        }
        
        for(let i = 0;i<character.projectiles.length;i++)
            if (roughCollision(this.coordinates[0],this.coordinates[1],64,64,character.projectiles[i].coordinates[0],character.projectiles[i].coordinates[1],20,20))
        {
                    SlimeSFX.play();						
                    currentRoom.active.splice(currentRoom.active.indexOf(this), 1);
                    character.projectiles.splice(character.projectiles.indexOf(i), 1);
        }
        
        if (roughCollision(character.coordinates[0],character.coordinates[1],character.sprite[2],character.sprite[3],this.coordinates[0],this.coordinates[1],64,64))
        {
            FallSFX.play();						
            this.bounceAngle = Math.atan2((this.coordinates[0]+32)-(character.coordinates[0]+15),(this.coordinates[1]+32)-(character.coordinates[1]+23));
            character.hurt();
            character.moveVector[0] -= 20*Math.sin(this.bounceAngle);
            character.moveVector[1] = -5*Math.cos(this.bounceAngle);
        }
        for (let i= 0; i<currentRoom.static.length; i++)
        {
            if(tileList[currentRoom.static[i].tileNum].passable == -1)
            {
                if(roughCollision(this.returnCoordinates[0],this.returnCoordinates[1],64,64,currentRoom.static[i].x, currentRoom.static[i].y,tileList[currentRoom.static[i].tileNum].w*2, tileList[currentRoom.static[i].tileNum].h*2))
                    this.direction = !this.direction;
            }
        }
        this.animationTimer ++;
        if(this.animationTimer > 10000)
            this.animationTimer = 0;

    
    };
    obj.draw = function()
    {
        if(!this.visualState)
        {
            if(!this.diveState || this.diveTimer != 0)
                onScreenSurface.drawImage(tilesImage,261+(32*(Math.floor(this.animationTimer/6)%5)),76,32,52,Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),64,104);
            else
                onScreenSurface.drawImage(tilesImage,261+(32*2),76,32,52,Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),64,104);
        }
        else
        {
            if(!this.diveState || this.diveTimer != 0)
                onScreenSurface.drawImage(tilesImage,397-(32*(Math.floor(this.animationTimer/6)%5)),136,32,44,Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),64,88);
            else
                onScreenSurface.drawImage(tilesImage,397-(32*2),136,32,44,Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),64,88);

        }
    };
    return obj;
}

function projectile(x,y,dir)
{
    let obj = {};
    obj.coordinates = [x+10,y+10];
    obj.direction;
    ShootSFX.currentTime = 0;						
    ShootSFX.play();						
    if(dir>0)
        obj.direction = true;
    else
        obj.direction = false;
    
    if(!obj.direction)
        obj.coordinates[0]-=25;
    obj.ttl = 100;
    
    obj.tick = function()
    {
        for (let i = 0; i<currentRoom.static.length; i++)
        {
            if(tileList[currentRoom.static[i].tileNum].passable > 0)
            {
                if(roughCollision(this.coordinates[0],this.coordinates[1],30,30,currentRoom.static[i].x, currentRoom.static[i].y,tileList[currentRoom.static[i].tileNum].w*2, tileList[currentRoom.static[i].tileNum].h*2))
                {
                    character.projectiles.splice(character.projectiles.indexOf(this), 1);
                    i =currentRoom.static.length;
                }
            }
        }
        if(this.direction)
           this.coordinates[0]+=5;
        else      
           this.coordinates[0]-=5;
        this.ttl--;
        if(this.ttl < 0)
             character.projectiles.splice(character.projectiles.indexOf(this), 1);

    };
    obj.draw = function()
    {
        onScreenSurface.drawImage(tilesImage,268,8,15,15,Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),30,30);
    };
    return obj;
}

function movingPlatform(x,y,length,type,x2,y2)
{
    let obj = {};
    obj.coordinates = [x,y];
    obj.start = [x,y];
    obj.destination = [x2,y2];
    obj.hitbox = [length*32,32];
    
    obj.wait = 0;
    obj.remainingDistance = Math.sqrt(Math.pow((obj.destination[0]-obj.start[0]),2)+Math.pow((obj.destination[1]-obj.start[1]),2));
    obj.movementAngle = Math.atan2(obj.destination[0] - obj.coordinates[0],obj.destination[1]- obj.coordinates[1]);
    
    obj.platformCanvas = document.createElement('canvas');
    obj.platformCanvas.width = (length*32);
    obj.platformCanvas.height = 32;
    obj.platformSurface = obj.platformCanvas.getContext("2d");
    obj.platformSurface.imageSmoothingEnabled = false;   
    if (length > 1)
    {
        obj.platformSurface.drawImage(tilesImage,tileList[type].x,tileList[type].y,
                                  tileList[type].w,tileList[type].h,0,0,tileList[type].w*2,tileList[type].h*2);
        for(let i = 1;i<length-1;i++)
            obj.platformSurface.drawImage(tilesImage,tileList[type+1].x,tileList[type+1].y,
                                          tileList[type+1].w,tileList[type+1].h,i*32,0,tileList[type+1].w*2,tileList[type+1].h*2);
        obj.platformSurface.drawImage(tilesImage,tileList[type+2].x,tileList[type+2].y,
                                  tileList[type+2].w,tileList[type+2].h,((length-1)*32),0,tileList[type+2].w*2,tileList[type+2].h*2);
    }
    else
        obj.platformSurface.drawImage(tilesImage,tileList[type+3].x,tileList[type+3].y,
                                  tileList[type+3].w,tileList[type+3].h,0,0,tileList[type+3].w*2,tileList[type+3].h*2);
    obj.tick = function()
    {    
        if(this.wait < 1)
        {
            this.coordinates[0] += 1*Math.sin(this.movementAngle);
            this.coordinates[1] += 1*Math.cos(this.movementAngle);
            this.remainingDistance--;
            if(this.remainingDistance<1)
            {
                this.remainingDistance = Math.sqrt(Math.pow((this.destination[0]-this.start[0]),2)+Math.pow((this.destination[1]-this.start[1]),2));
                this.movementAngle += Math.PI
                if(this.movementAngle> Math.PI*2)
                    this.movementAngle - Math.PI*2;
                this.wait = 60;
            }
        }
        else
            this.wait--;
        
        if (roughCollision(character.coordinates[0],character.coordinates[1],character.sprite[2],character.sprite[3],
                           this.coordinates[0],this.coordinates[1],this.hitbox[0],this.hitbox[1]))
        {
            fineCollision(character.coordinates[0],character.coordinates[1],character.sprite[2],character.sprite[3],
                this.coordinates[0],this.coordinates[1],this.hitbox[0],this.hitbox[1]);
            if(this.wait < 1)
            {
                character.coordinates[0] += 1*Math.sin(this.movementAngle);
                character.coordinates[1] += 1*Math.cos(this.movementAngle);
            }
        }
     
    };
    obj.draw = function()
    {
        onScreenSurface.drawImage(this.platformCanvas,0,0,this.hitbox[0],this.hitbox[1],Math.floor(this.coordinates[0]-camera.coordinates[0]),
            Math.floor(this.coordinates[1]-camera.coordinates[1]),this.hitbox[0],this.hitbox[1]);
    };

    return obj;
   
}

function fallingPlatform(x,y)
{
    let obj = {};
    obj.coordinates = [x,y];
    obj.start = [x,y];    
    obj.timer = -1;
    
    obj.tick = function()
    {    
        if(this.timer>-1)
            this.timer++;
        
        if(this.timer < 20)
            {}
        else if (this.timer < 130)
        {
            if(Math.floor(this.timer/3)%2)
                this.coordinates[1] +=1;
            else
                this.coordinates[1] -=1;
        }
        else if(this.timer < 300)
        {
            this.coordinates[1] +=5;
            if(this.timer == 130)
                FallSFX.play();
        }
        else
        {
            this.timer=-1;
            this.coordinates[1] = this.start[1];
        }
        
        if (roughCollision(character.coordinates[0],character.coordinates[1],character.sprite[2],character.sprite[3],
                           this.coordinates[0],this.coordinates[1],32,32))
            {
            fineCollision(character.coordinates[0],character.coordinates[1],character.sprite[2],character.sprite[3],
                this.coordinates[0],this.coordinates[1],32,32);
                if(this.timer == -1)
                    this.timer++;
            }

    };
    obj.draw = function()
    {
        onScreenSurface.drawImage(tilesImage,48,672,16,16,Math.floor(this.coordinates[0]-camera.coordinates[0]),Math.floor(this.coordinates[1]-camera.coordinates[1]),32,32);
    };
    return obj;
}

function doubleJumpPowerUp(x,y,num)
{
    let obj = {};
    obj.floatTimer = Math.floor(Math.random()*100);
    obj.coordinates = [x,y-(obj.floatTimer*0.1)];
    obj.direction = false;
    obj.num = num;

    obj.tick = function()
    {
        if (this.floatTimer >= 100)
        {
            this.floatTimer = 0;
            this.direction = !this.direction;
        }
        else
            this.floatTimer++;
        if(this.direction)
            this.coordinates[1] += 0.1;
        else
            this.coordinates[1] -= 0.1;

        if (roughCollision(this.coordinates[0],this.coordinates[1],34,34,character.coordinates[0],character.coordinates[1],character.sprite[2],character.sprite[3]))
        {
            character.jumpPowerup = true;
            PowerupSFX.play();						
            currentRoom.active.splice(currentRoom.active.indexOf(this), 1);
            levelPreventSpawn[this.num]= true;
        }
    };

    obj.draw = function()
    {
        onScreenSurface.drawImage(PowerUpImage,0,0,34,34,Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),34,34);
    };

    return obj;
}

function dashPowerUp(x,y,num)
{
    let obj = {};
    obj.floatTimer = Math.floor(Math.random()*100);
    obj.coordinates = [x,y-(obj.floatTimer*0.1)];
    obj.direction = false;
    obj.num = num;
    obj.tick = function()
    {
        if (this.floatTimer >= 100)
        {
            this.floatTimer = 0;
            this.direction = !this.direction;
        }
        else
            this.floatTimer++;
        if(this.direction)
            this.coordinates[1] += 0.1;
        else
            this.coordinates[1] -= 0.1;

        if (roughCollision(this.coordinates[0],this.coordinates[1],50,50,character.coordinates[0],character.coordinates[1],character.sprite[2],character.sprite[3]))
        {
            character.dashPowerup = true;
            PowerupSFX.play();
            levelPreventSpawn[this.num]= true;
            currentRoom.active.splice(currentRoom.active.indexOf(this), 1);
        }
    };

    obj.draw = function()
    {
        onScreenSurface.drawImage(PowerUpImage,34,0,34,34,Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),34,34);
    };

    return obj;
}

function shootPowerUp(x,y,num)
{
    let obj = {};
    obj.floatTimer = Math.floor(Math.random()*100);
    obj.coordinates = [x,y-(obj.floatTimer*0.1)];
    obj.num = num;
    obj.direction = false;

    obj.tick = function()
    {
        if (this.floatTimer >= 100)
        {
            this.floatTimer = 0;
            this.direction = !this.direction;
        }
        else
            this.floatTimer++;
        if(this.direction)
            this.coordinates[1] += 0.1;
        else
            this.coordinates[1] -= 0.1;

        if (roughCollision(this.coordinates[0],this.coordinates[1],50,50,character.coordinates[0],character.coordinates[1],character.sprite[2],character.sprite[3]))
        {
            character.projectilePowerup = true;
            messageSystem("    You Have Picked up           an ability            Hit Z to shoot and       destroy obstacles     Press Enter to continue");
            PowerupSFX.play();
            levelPreventSpawn[this.num]= true;
            currentRoom.active.splice(currentRoom.active.indexOf(this), 1);
        }
    };

    obj.draw = function()
    {
        onScreenSurface.drawImage(PowerUpImage,68,0,34,34,Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),34,34);
    };

    return obj;
}

function healthPickup(x,y,num)
{
    let obj = {};
    obj.floatTimer = Math.floor(Math.random()*100);
    obj.coordinates = [x,y-(obj.floatTimer*0.1)];
    obj.num = num;
    obj.direction = false;

    obj.tick = function()
    {
        if (this.floatTimer >= 100)
        {
            this.floatTimer = 0;
            this.direction = !this.direction;
        }
        else
            this.floatTimer++;
        if(this.direction)
            this.coordinates[1] += 0.1;
        else
            this.coordinates[1] -= 0.1;

        if (roughCollision(this.coordinates[0],this.coordinates[1],50,50,character.coordinates[0],character.coordinates[1],character.sprite[2],character.sprite[3]))
        {
            if(character.health<character.maxHealth)
            {
                character.health++;
                HealSFX.play();						
                currentRoom.active.splice(currentRoom.active.indexOf(this), 1);
                levelPreventSpawn[this.num]= true;
            }
        }
    };

    obj.draw = function()
    {
        onScreenSurface.drawImage(heartImage,0,15,16,16,Math.floor(this.coordinates[0]-camera.coordinates[0]),Math.floor(this.coordinates[1]-camera.coordinates[1]),16*2,16*2);
    };

    return obj;
}

function returnTile(x,y,tileNum)
{
    let obj = {};
    obj.x = x;
    obj.y = y;
    obj.tileNum = tileNum;
    return obj;
}

function tileInfo(x,y,w,h,passable)
{
    let obj = {};
    obj.x = x;
    obj.y = y;
    obj.w = w;
    obj.h = h;
    obj.passable = passable;
    return obj;
}

function tree(obj,x,y)
{
    obj.static.push(returnTile(x,y,7));
    obj.static.push(returnTile(x+32,y+96,8));
    obj.static.push(returnTile(x+20,y+126,9));
}

function platform(obj,x,y,length,type)
{
    if (length > 1)
    {
        obj.static.push(returnTile(x,y,type));
        for(let i = 1;i<length-1;i++)
            obj.static.push(returnTile(x+(i*32),y,type+1));
        obj.static.push(returnTile(x+((length-1)*32),y,type+2));
    }
    else
        obj.static.push(returnTile(x,y,type+3));    
}

function ground(obj,x,y,length)
{
    let height = Math.ceil((obj.maxCamera[1]-y)/32);
    platform(obj,x,y,length,13);
    for(let i =1;i<height;i++)
        platform(obj,x,y+(32*i),length,21);
}

function castle(obj,x,y,length,height)
{
    for(let i =0;i<height;i++)
        platform(obj,x,y+(32*i),length,30);
}

function sky(obj)
{
    let num = Math.ceil(obj.maxCamera[0]/512);
    let num2 = Math.ceil(obj.maxCamera[1]/64);

    for(let i = 0;i<num;i++)
        obj.static.push(returnTile(512*i,0,0));
    for(let i = 0;i<Math.ceil(((num2-3)*num)/2);i++)
        obj.static.push(returnTile((i%num)*512,64+(Math.floor(i/num)*64),1));
    for(let i = 0;i<num;i++)
        obj.static.push(returnTile(512*i,64+(Math.floor(Math.ceil(((num2-3)*num)/2)/num)*64),2));
    for(let i = 0;i<num;i++)
        obj.static.push(returnTile(512*i,128+(Math.floor(Math.ceil(((num2-3)*num)/2)/num)*64),3));
    for(let i = 0;i<num;i++)
        obj.static.push(returnTile(512*i,192+(Math.floor(Math.ceil(((num2-3)*num)/2)/num)*64),4));
    for(let i = 0;i<num;i++)
        obj.static.push(returnTile(512*i,256+(Math.floor(Math.ceil(((num2-3)*num)/2)/num)*64),5));
    for(let i = 0;i<Math.ceil(((num2-3)*num)/2);i++)
        obj.static.push(returnTile((i%num)*512,320+(Math.floor(Math.ceil(((num2-3)*num)/2)/num)*64)+(Math.floor(i/num)*52),6));
}

function castleBack(obj,x,y,w,h)
{ 
    for(let i = 0;i<w;i++)
        for(let q = 0;q<h;q++)
            obj.static.push(returnTile(x+(i*64),y+(q*56),34));
}

function levelBorders(obj)
{
    for(let i = 0;i<Math.ceil(obj.maxCamera[1]/5000);i++)
        obj.static.push(returnTile(-20,0+(i*5000),10)); // left blocker
    for(let i = 0;i<Math.ceil(obj.maxCamera[1]/5000);i++)
        obj.static.push(returnTile(obj.maxCamera[0],0+(i*5000),10)); // right blocker
    for(let i = 0;i<Math.ceil(obj.maxCamera[0]/5000);i++)
        obj.static.push(returnTile(0+(i*5000),-20,11)); // top blocker
    for(let i = 0;i<Math.ceil(obj.maxCamera[0]/5000);i++)
        obj.static.push(returnTile(0+(i*5000),obj.maxCamera[1]+50,12)); // bottom death plane
}
