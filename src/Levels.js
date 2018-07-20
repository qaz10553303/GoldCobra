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
    obj.dashTime = 0;
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
    obj.projectileCd = 0;
    
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
            this.dashTime = 10;
            DashSFX.play();
            this.dashTap = false;
            this.dashGround = false;
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
        if(this.projectileTap && this.projectilePowerup && this.projectileCd < 1)
        {
            this.projectileCd = 60;
            this.projectiles.push(projectile(this.coordinates[0],this.coordinates[1],this.state));
            //DashSFX.play();
            this.projectileTap = false;
        }
                         
    };
    
    obj.tick = function ()
    {
        if(this.dead)
            resetGame();
        else if(this.health<1)
        {
            messageSystem("       You Are Dead        Press Enter to continue");
            this.dead = true;
        }
        
        userInputHandler();
        if (this.moveVector[1] == 0 && this.moveVector[0] != 0)
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
  
        if(this.dashTime >= 0)
        {
            this.dashTime--;
            if(this.state < 0)
                this.moveVector[0] = -this.dashTime*3;
            else
                this.moveVector[0] = this.dashTime*3;
            this.moveVector[1] = 0;
        }
        this.coordinates[0] += this.moveVector[0];
        this.coordinates[1] += this.moveVector[1];
        this.moveVector[0] = this.moveVector[0]*0.80; //friction
        if(Math.abs(this.moveVector[0])<0.9) //friction
            this.moveVector[0] = 0;
        this.moveVector[1] += 0.1; //gravity
	    if(this.moveVector[1]>5)
            this.moveVector[1] = 5; //gravity
        if(this.moveVector[1]< -5)
            this.moveVector[1] = -5; //gravity


        if(this.dashCd >= 0)
            this.dashCd--;
        if(this.iFrames > 0)
            this.iFrames--;
        if(this.projectileCd >= 0)
            this.projectileCd--;
        this.jump1 = false;
        for (let i= 0; i<currentRoom.static.length; i++)
        {
            if(tileList[currentRoom.static[i].tileNum].passable > 0)
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
        onScreenSurface.fillText(this.coordinates.toString(),70,70);*/


        if(this.iFrames%2 == 0)
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
        onScreenSurface.fillStyle = 'red';
        onScreenSurface.fillRect(this.coordinates[0]-camera.coordinates[0],this.coordinates[1]-camera.coordinates[1],this.coordinates[2],this.coordinates[3]);
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
    obj.tick = function()
    {
        for(let i = 0;i<character.projectiles.length;i++)
            if (roughCollision(this.coordinates[0],this.coordinates[1],64,32,character.projectiles[i].coordinates[0],character.projectiles[i].coordinates[1],20,20))
        {
                    SlimeSFX.play();						
                    currentRoom.active.splice(currentRoom.active.indexOf(this), 1);
                    levelPreventSpawn[this.num]= true;
                    character.projectiles.splice(character.projectiles.indexOf(i), 1);
        }
        
        if (roughCollision(character.coordinates[0],character.coordinates[1],character.sprite[2],character.sprite[3],this.coordinates[0],this.coordinates[1],64,32))
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
                if(roughCollision(this.coordinates[0],this.coordinates[1],64,32,currentRoom.static[i].x, currentRoom.static[i].y,tileList[currentRoom.static[i].tileNum].w*2, tileList[currentRoom.static[i].tileNum].h*2))
                    this.direction = !this.direction
            }
        }
        if(this.direction)
            this.coordinates[0]+=1;
        else
            this.coordinates[0]-=1;
    };
    obj.draw = function()
    {
        if(this.direction)
            onScreenSurface.drawImage(tilesImage,412,435,32,16,Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),64,32);
        else        
            onScreenSurface.drawImage(tilesImage,379,435,32,16,Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),64,32);
    };
    return obj;
}

function projectile(x,y,dir)
{
    let obj = {};
    obj.coordinates = [x+10,y+10];
    obj.direction;
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
       if(this.direction)
           this.coordinates[0]+=5;
        else      
           this.coordinates[0]-=5;
        this.ttl--;
        if(this.ttl < 0)
             character.projectiles.splice(character.projectiles.indexOf(this), 1);

        for (let i= 0; i<currentRoom.static.length; i++)
        {
            if(tileList[currentRoom.static[i].tileNum].passable > 0)
                if(roughCollision(this.coordinates[0],this.coordinates[1],30,30,currentRoom.static[i].x, currentRoom.static[i].y,tileList[currentRoom.static[i].tileNum].w*2, tileList[currentRoom.static[i].tileNum].h*2))
                     character.projectiles.splice(character.projectiles.indexOf(this), 1);
        }
    };
    obj.draw = function()
    {
        onScreenSurface.drawImage(tilesImage,259,467,15,15,Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),30,30);
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
        onScreenSurface.drawImage(heartImage,0,15,16,16,this.coordinates[0]-camera.coordinates[0],this.coordinates[1]-camera.coordinates[1],16*2,16*2);
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

function setTileList()
{
    tileList.push(tileInfo(0,0,256,32,0)); //skyTop top 0
    tileList.push(tileInfo(0,32,256,32,0)); //skyTop mid 1
    tileList.push(tileInfo(0,64,256,32,0)); //skyTop bot 2
    tileList.push(tileInfo(0,96,256,32,0)); //skyMid top 3
    tileList.push(tileInfo(0,128,256,32,0)); //skyMid mid 4
    tileList.push(tileInfo(0,160,256,32,0)); //skyMid bot 5
    tileList.push(tileInfo(0,198,256,26,0)); //skyBot top 6
    tileList.push(tileInfo(96,656,48,48,0)); //treeTop 7
    tileList.push(tileInfo(192,656,16,24,0)); //treeTrunk 8
    tileList.push(tileInfo(186,656+24,32,24,0)); //treeBase 9
    tileList.push(tileInfo(-100,0,10,5000,1)); //verticalBlocker Wall 10
    tileList.push(tileInfo(0,-100,5000,10,1)); //horisontalBlocker Wall 11
    tileList.push(tileInfo(0,-100,5000,10,2)); //horisontalDeathPlane 12
    tileList.push(tileInfo(0,688,16,16,1)); //grassTop left 13
    tileList.push(tileInfo(16,688,16,16,1)); //grassTop Middle 14
    tileList.push(tileInfo(32,688,16,16,1)); //grassTop right 15
    tileList.push(tileInfo(48,688,16,16,1)); //grassTop single 16
    tileList.push(tileInfo(0,672,16,16,1)); //grassFloat left 17
    tileList.push(tileInfo(16,672,16,16,1)); //grassFloat Middle 18
    tileList.push(tileInfo(32,672,16,16,1)); //grassFloat right 19
    tileList.push(tileInfo(48,672,16,16,1)); //grassFloat single 20
    tileList.push(tileInfo(0,747,16,16,1)); //ground left 21
    tileList.push(tileInfo(16,747,16,16,1)); //ground Middle 22
    tileList.push(tileInfo(32,747,16,16,1)); //ground right 23
    tileList.push(tileInfo(48,747,16,16,1)); //ground single 24
    tileList.push(tileInfo(80,672,16,32,0)); //sunflower 25
    tileList.push(tileInfo(64,672,16,16,0)); //smallBlue flower 26
    tileList.push(tileInfo(64,688,16,16,0)); //smallpink flower27
    tileList.push(tileInfo(81,495,14,32,0)); //vines 28
    tileList.push(tileInfo(128,704,32,16,0)); //rocks 29
    tileList.push(tileInfo(0,639,16,16,1)); //castleMid left 30
    tileList.push(tileInfo(16,639,16,16,1)); //castleMid Middle 31
    tileList.push(tileInfo(32,639,16,16,1)); //castleMid right 32
    tileList.push(tileInfo(48,639,16,16,1)); //castleMid single 33
    tileList.push(tileInfo(64,628,32,28,0)); //castleTop background 34
    tileList.push(tileInfo(174,243,10,10,-1)); //enemy Blocker 35
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

levelPreventSpawn=[false,false,false,false]

function level0()
{
    let obj = {};
    obj.static = [];
    obj.active = [];
    obj.maxCamera = [810,1000];
    
    sky(obj);
    levelBorders(obj);

    tree(obj,506,735);
    tree(obj,200,800);
    obj.static.push(returnTile(30,926,26)); //blue flower
    obj.static.push(returnTile(100,926,26)); //blue flower
    obj.static.push(returnTile(50,926,26)); //blue flower
    obj.static.push(returnTile(110,926,26)); //blue flower
    obj.static.push(returnTile(230,926,26)); //blue flower
    obj.static.push(returnTile(190,926,26)); //blue flower
    obj.static.push(returnTile(250,926,26)); //blue flower
    obj.static.push(returnTile(30,925,27)); //pink flower
    obj.static.push(returnTile(170,925,27)); //pink flower
    obj.static.push(returnTile(140,925,27)); //pink flower
    obj.static.push(returnTile(200,895,25)); //sunflower

    ground(obj,-10,958,11);
    platform(obj,0,700,4,17);
    ground(obj,525,894,2);
    platform(obj,630,850,6,17);
    ground(obj,730,958,4);
    platform(obj,220,550,11,17);
    platform(obj,620,470,7,17);

    
    obj.static.push(returnTile(200,530,35)); //enemy blocker
    obj.static.push(returnTile(573,530,35)); // enemy blocker


    obj.static.push(returnTile(15,700,28)); //vine
    obj.static.push(returnTile(70,700,28)); //vine
    obj.static.push(returnTile(230,550,28)); //vine
    obj.static.push(returnTile(380,550,28)); //vine
    obj.static.push(returnTile(430,550,28)); //vine
    obj.static.push(returnTile(500,550,28)); //vine
    obj.static.push(returnTile(650,470,28)); //vine
    obj.static.push(returnTile(780,470,28)); //vine


    if(!levelPreventSpawn[0])
        obj.active.push(shootPowerUp(45,670,0));

    obj.active.push(movingPlatform(380,800,2,17,380,950));
    obj.active.push(slime(380, 520));

    obj.active.push(fallingPlatform(175, 595));
    obj.active.push(fallingPlatform(135, 645));
    //take me to level 2
    obj.active.push(door(150, 400, 10, 100, 2, 770, 420));

    if(!levelPreventSpawn[1])
        obj.active.push(healthPickup(710,920,1));

    obj.active.push(door(800,750,10,100,1,10,805)); //door to level 1
    obj.active.push(door(800,875,10,100,1,10,915)); //door to level 1
    obj.active.push(door(800,370,10,100,1,10,420)); //door to level 1


    return obj;
}

function level1()
{
    let obj = {};
    obj.static = [];
    obj.active = [];
    obj.maxCamera = [2000,1000];
    
    sky(obj);
    levelBorders(obj);
    castleBack(obj,1639,170,10,20);

    
    tree(obj,320,800);
    tree(obj,870,620);

    obj.static.push(returnTile(30,825,27)); //pink flower
    obj.static.push(returnTile(70,825,27)); //pink flower
    obj.static.push(returnTile(140,825,27)); //pink flower
    obj.static.push(returnTile(120,925,26)); //blue flower
    obj.static.push(returnTile(450,925,27)); //pink flower
    obj.static.push(returnTile(460,925,26)); //blue flower
    obj.static.push(returnTile(420,925,26)); //pink flower
    obj.static.push(returnTile(1000,753,29)); //rock
    obj.static.push(returnTile(1335,703,29)); //rock




    ground(obj,240,885,1);
    platform(obj,-10,850,6,17);
    ground(obj,-10,958,18);
    platform(obj,-10,470,4,17);
    ground(obj,800,785,10);
    ground(obj,1318,735,10);
    castle(obj,1637,735,12,9);
    castle(obj,1637,170,2,15);
    castle(obj,1637,505,12,1);
    castle(obj,1637,473,4,1);
    castle(obj,1637,332,3,1);
    castle(obj,1800,300,7,1);
    castle(obj,1800,300,1,4);
    castle(obj,1768,396,1,1);
    castle(obj,1637,108,12,2);
    castle(obj,1637,44,2,2);
    castle(obj,1733,44,2,2);
    castle(obj,1829,44,2,2);
    platform(obj,1000,405,5,17);
    platform(obj,590,415,11,17);


    obj.static.push(returnTile(1050,405,28)); //vine
    obj.static.push(returnTile(1130,405,28)); //vine
    obj.static.push(returnTile(680,415,28)); //vine
    obj.static.push(returnTile(750,415,28)); //vine
    obj.static.push(returnTile(830,415,28)); //vine
    obj.static.push(returnTile(30,470,28)); //vine



    

    obj.active.push(fallingPlatform(1150,775));
    obj.active.push(fallingPlatform(1250,745));
    obj.active.push(movingPlatform(600,950,2,17,690,785));
    obj.active.push(movingPlatform(1468,700,2,17,1468,470));
    obj.active.push(fallingPlatform(1400,475));
    obj.active.push(fallingPlatform(1310,455));
    obj.active.push(fallingPlatform(1220,435));
    obj.active.push(fallingPlatform(180,465));
    obj.active.push(fallingPlatform(270,455));
    obj.active.push(fallingPlatform(360,445));
    obj.active.push(fallingPlatform(450,435));
    obj.active.push(fallingPlatform(540,425));



    
    
    obj.static.push(returnTile(570,395,35)); //enemy blocker
    obj.static.push(returnTile(945,395,35)); // enemy blocker
    

    obj.active.push(slime(600,383));
    if(!levelPreventSpawn[2])
        obj.active.push(breakable(70,862,2));
    if(!levelPreventSpawn[3])
        obj.active.push(breakable(1607,640,3));

    
    obj.active.push(door(0,750,10,100,0,770,805)); //door to level 0
    obj.active.push(door(0,875,10,100,0,770,915)); //door to level 0
    obj.active.push(door(0,370,10,100,0,770,420)); //door to level 0

    return obj;
}

function level2() {
    let obj = {};
    obj.static = [];
    obj.active = [];
    obj.maxCamera = [2000, 1000];

    sky(obj);
    levelBorders(obj);
    castleBack(obj, 1639, 170, 10, 20);


    tree(obj, 320, 800);
    tree(obj, 870, 620);

    obj.static.push(returnTile(30, 825, 27)); //pink flower
    obj.static.push(returnTile(70, 825, 27)); //pink flower
    obj.static.push(returnTile(140, 825, 27)); //pink flower
    obj.static.push(returnTile(120, 925, 26)); //blue flower
    obj.static.push(returnTile(450, 925, 27)); //pink flower
    obj.static.push(returnTile(460, 925, 26)); //blue flower
    obj.static.push(returnTile(420, 925, 26)); //pink flower
    obj.static.push(returnTile(1000, 753, 29)); //rock
    obj.static.push(returnTile(1335, 703, 29)); //rock




    ground(obj, 240, 885, 1);
    platform(obj, -10, 850, 6, 17);
    ground(obj, -10, 958, 18);
    platform(obj, -10, 470, 4, 17);
    ground(obj, 800, 785, 10);
    ground(obj, 1318, 735, 10);
    castle(obj, 1637, 735, 12, 9);
    castle(obj, 1637, 170, 2, 15);
    castle(obj, 1637, 505, 12, 1);
    castle(obj, 1637, 473, 4, 1);
    castle(obj, 1637, 332, 3, 1);
    castle(obj, 1800, 300, 7, 1);
    castle(obj, 1800, 300, 1, 4);
    castle(obj, 1768, 396, 1, 1);
    castle(obj, 1637, 108, 12, 2);
    castle(obj, 1637, 44, 2, 2);
    castle(obj, 1733, 44, 2, 2);
    castle(obj, 1829, 44, 2, 2);
    platform(obj, 1000, 405, 5, 17);
    platform(obj, 590, 415, 11, 17);


    obj.static.push(returnTile(1050, 405, 28)); //vine
    obj.static.push(returnTile(1130, 405, 28)); //vine
    obj.static.push(returnTile(680, 415, 28)); //vine
    obj.static.push(returnTile(750, 415, 28)); //vine
    obj.static.push(returnTile(830, 415, 28)); //vine
    obj.static.push(returnTile(30, 470, 28)); //vine





    obj.active.push(fallingPlatform(1150, 775));
    obj.active.push(fallingPlatform(1250, 745));
    obj.active.push(movingPlatform(600, 950, 2, 17, 690, 785));
    obj.active.push(movingPlatform(1468, 700, 2, 17, 1468, 470));
    obj.active.push(fallingPlatform(1400, 475));
    obj.active.push(fallingPlatform(1310, 455));
    obj.active.push(fallingPlatform(1220, 435));
    obj.active.push(fallingPlatform(180, 465));
    obj.active.push(fallingPlatform(270, 455));
    obj.active.push(fallingPlatform(360, 445));
    obj.active.push(fallingPlatform(450, 435));
    obj.active.push(fallingPlatform(540, 425));





    obj.static.push(returnTile(570, 395, 35)); //enemy blocker
    obj.static.push(returnTile(945, 395, 35)); // enemy blocker


    obj.active.push(slime(600, 383));
    if (!levelPreventSpawn[2])
        obj.active.push(breakable(70, 862, 2));
    if (!levelPreventSpawn[3])
        obj.active.push(breakable(1607, 640, 3));


    obj.active.push(door(0, 750, 10, 100, 0, 770, 805)); //door to level 0
    obj.active.push(door(0, 875, 10, 100, 0, 770, 915)); //door to level 0
    obj.active.push(door(0, 370, 10, 100, 0, 770, 420)); //door to level 0
    obj.active.push(door(0, 900, 10, 900, 2, 90, 50)); //door to level 0
    return obj;
}