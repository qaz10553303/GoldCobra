//**************************** GAME OBJECTS **************************************
function createCharacter() //generates and contains game character
{
    let obj = {};
    obj.coordinates = [0,0]; //player characters coordinates stored as x,y pair and player movement vector
    obj.moveVector = [0,0]; // character movement vector
    obj.sprite = [0,0,30,46];
    obj.directionFacing = 1;
    
    obj.jump1 = false;
    obj.jump2 = false;
    obj.jumpPowerup = false;
    obj.jumpTap = false;
        
    obj.dashPowerup = true;
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
    obj.projectilePowerup = true;
    obj.projectileTap = false;
    
    obj.iFrames = 0;
    obj.ladder = false;
    obj.ladderDir = 0;
    
    obj.jump = function()
    {
        if((this.jump1 && this.jumpTap) || (this.jump2 && this.jumpTap))
        {
            this.ladderDir = -1;
            this.moveVector[1] = -4;
            if(this.ladder)
                this.moveVector[1] = -2;
            this.jumpCharges--;
            if(!this.ladder)
            {
                if(this.jump1)
                    this.jump1 =false;
                else
                    this.jump2 =false;
                if(!this.ladder)
                JumpSFX.play();
                this.jumpTap = false;
            }
        }
    };
    
    obj.grounded = function()
    {
        character.jump1 = true;
        if(character.jumpPowerup || this.ladder)
            character.jump2 = true;
        if(character.dashCd < 0)
            character.dashGround = true;
    }
    
    obj.dash = function()
    {
        if(this.dashTap && this.dashPowerup && this.dashGround && this.dashCd < 0)
        {
            this.dashCd = 60;
            DashSFX.play();
            this.dashTap = false;
            this.dashGround = false;
            this.moveVector[0] += 40*Math.sign(this.directionFacing);

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
    
    obj.respawn = function()
    {
            FallSFX.play();
            character.hurt();
            character.coordinates = [character.respawnLocation[0],character.respawnLocation[1]];
    };
    
    obj.updateTimers = function()
    {
        if(this.health<1)
        {
            this.dead = true;
            messageSystem("       You Are Dead        Press Enter to continue");
        }
        if(this.dashCd >= 0) //dash timer
            this.dashCd--;
        if(this.iFrames > 0) //invincibility frame timer
            this.iFrames--;
        this.jump1 = false; //prevents using first jump after leaving platform
        this.ladder = false;
        this.ladderDir = 0;
        this.ladderTop = false;
        if(this.moveVector[0] < 0)
            this.directionFacing = -1;
        else if (this.moveVector[0] > 0)
            this.directionFacing = 1;
    };

    obj.applyCollision = function()
    {
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
                        this.respawn();
                        break;
                    case 3:
                        this.ladder = true;
                        this.jumpTap = true;
                        this.grounded();
                        this.moveVector[1] = 0; //gravity
                        break;
                    }

                }
        } 
    };
    
    obj.animationSystem = function()
    {
        if (this.moveVector[1] == 0 && this.moveVector[0] != 0)//player animation handler
            this.state = 1;
        else if (this.moveVector[1] > 0 && this.moveVector[0] != 0)
             this.state = 2;
        else if (this.moveVector[1] < 0 && this.moveVector[0] != 0)
             this.state = 3; 
        if(this.moveVector[0] < 0)
            this.state = this.state*(-1);
        if(this.moveVector[0] != 0 || this.ladderDir != 0)
            this.animationFrame ++;
        if(this.animationFrame > 10000)
            this.animationFrame = 1;
        if(this.ladder)
        {
            this.state = 4*this.ladderDir;
            if(this.ladderDir == 0)
                this.state = 4;
        }

    };

    obj.shoot = function()
    {
        if(this.projectileTap && this.projectilePowerup)
        {
            this.projectiles.push(projectile(this.coordinates[0],this.coordinates[1],this.directionFacing));
            this.projectileTap = false;
        }
    };
    
    obj.applyPhysics = function()
    {
        this.moveVector[0] = this.moveVector[0]*0.8; //friction
        if(Math.abs(this.moveVector[0])<0.1) //friction
            this.moveVector[0] = 0;
        if(!this.ladder)
            this.moveVector[1] += 0.1; //gravity
	    if(this.moveVector[1]>5)
            this.moveVector[1] = 5; //gravity
    };
    
    obj.applyMovement = function()
    {
        this.coordinates[0] += this.moveVector[0]/2;
        this.coordinates[1] += this.moveVector[1]/2;
    };
    
    obj.tick = function ()
    {
        this.jump2 = true;
        this.applyMovement(); //i am applying the movement vector in 2 half steps and checking collision after each to attemp to reduce tunneling
        this.applyCollision();
        userInputHandler();//user input 
        this.animationSystem();
        this.applyPhysics();
        this.updateTimers();
        this.applyMovement(); 
        this.applyCollision();

    };
    obj.draw = function()
    {
        onScreenSurface.fillStyle = 'white';
        onScreenSurface.font = "20px Courier New";
        onScreenSurface.fillText(this.coordinates[0].toString(), 70, 70);
        onScreenSurface.fillText(this.coordinates[1].toString(), 70, 100);

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
            else if (Math.abs(this.state) == 4)// in the air moving down
            {
                if(this.state > 0) // down
                    onScreenSurface.drawImage(characterImage, 9+(32*(19+((Math.floor(this.animationFrame/10))%4))), 41, 15 ,23,
                        Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),character.sprite[2],character.sprite[3]);
                else // up          
                    onScreenSurface.drawImage(characterImage, 9+(32*(22-((Math.floor(this.animationFrame/10))%4))), 41, 15 ,23,
                        Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),character.sprite[2],character.sprite[3]);
            }

        }
    };
    return (obj);
}

function door(x,y,w,h,level,cx,cy) // x,y location    width,height of door   destination level      destination x,y
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

function breakable(x,y,num) // i am still unsure if breakable walls need a num variable to prevent them from respawning, this is a design issue not a programming one
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
                    currentRoom.active.push(explosion(this.coordinates[0],this.coordinates[1]));
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
    obj.animationTimer = Math.floor(Math.random()*60);
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
                    currentRoom.active.push(explosion(this.coordinates[0],this.coordinates[1]));
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
                onScreenSurface.drawImage(tilesImage,532-(32*(Math.floor(this.animationTimer/6)%10)),295,16,16,Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),32,32);
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
    obj.characterDistance = 500;
    obj.bounceAngle = 0;
    obj.diveAngle = 0;
    obj.animationTimer = 0;
    obj.dead = false;
    obj.tick = function()
    {
        if(!this.dead)
        {
            if(this.characterDistance < 190 && !this.diveState) //checks if enemy should dive
            {
                this.diveState = true;
                this.targetCoordinates = [character.coordinates[0]+15,character.coordinates[1]+23]
                this.diveTimer = 0;
                this.diveAngle = Math.atan2(this.targetCoordinates[0]-(this.coordinates[0]+32),(this.targetCoordinates[1]+25-this.coordinates[1]+32));
                if(this.diveAngle > 0)
                    this.visualState = true;
                else
                    this.visualState = false;
            }

            if(this.direction)
                this.returnCoordinates[0]+=2;
            else if (!this.direction)
                this.returnCoordinates[0]-=2;

            if(!this.diveState) //normal state
            {
                this.coordinates = [this.returnCoordinates[0],this.returnCoordinates[1]];
                this.characterDistance = Math.sqrt(Math.pow(((character.coordinates[0]+15)-(this.coordinates[0]+32)),2)
                                +Math.pow(((character.coordinates[1]+23)-(this.coordinates[1]+32)),2));
                this.visualState = this.direction;
            }
            else if (this.diveTimer == 0) //dive
            {
                this.coordinates[0] += 3*Math.sin(this.diveAngle);
                this.coordinates[1] += 3*Math.cos(this.diveAngle);
                if((Math.abs(this.coordinates[1]-this.targetCoordinates[1]) <=3) || (Math.abs(this.coordinates[0]-this.targetCoordinates[0]) <=3))
                {
                    this.diveTimer++;
                }
            }
            else if (this.diveTimer <= 50) //move after dive
            {
                if(this.visualState)
                    this.coordinates[0] +=2;
                else
                    this.coordinates[0] -= 2;
                this.diveTimer ++;
            }
            else // return to normal state
            {
                this.diveAngle = Math.atan2(this.returnCoordinates[0]-this.coordinates[0],this.returnCoordinates[1]-this.coordinates[1]);
                this.coordinates[0] += 2*Math.sin(this.diveAngle);
                this.coordinates[1] += 2*Math.cos(this.diveAngle);
                if(this.diveAngle > 0)
                    this.visualState = true;
                else
                    this.visualState = false;
                if(Math.abs(this.coordinates[1] - this.returnCoordinates[1]) <=3 && (Math.abs(this.coordinates[0]-this.targetCoordinates[0]) <=3))
                {
                    this.diveState = false;
                    this.characterDistance = Math.sqrt(Math.pow(((character.coordinates[0]+15)-(this.coordinates[0]+32)),2)
                        +Math.pow(((character.coordinates[1]+23)-(this.coordinates[1]+32)),2));
                }
            }

            for(let i = 0;i<character.projectiles.length;i++)
                if (roughCollision(this.coordinates[0],this.coordinates[1]+25,64,39,character.projectiles[i].coordinates[0],character.projectiles[i].coordinates[1],20,20))
                {
                    BirdSFX.play();
                    this.dead = true;
                    this.animationTimer = 0;
                    character.projectiles.splice(character.projectiles.indexOf(i), 1);
                    currentRoom.active.push(explosion(this.coordinates[0]-5,this.coordinates[1]-20));
                }

            if (roughCollision(character.coordinates[0],character.coordinates[1],character.sprite[2],character.sprite[3],this.coordinates[0],this.coordinates[1]+25,64,39))
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
        }
        else
        {
            this.coordinates[1] +=3;
            if(this.animationTimer>200)
                currentRoom.active.splice(currentRoom.active.indexOf(this), 1);
        }
        this.animationTimer ++;
        if(this.animationTimer > 10000)
            this.animationTimer = 0;

    
    };
    obj.draw = function()
    {
        if(!this.dead)
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
        }
        else
        {
            onScreenSurface.drawImage(tilesImage,428,88,22,31,Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),44,62);
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
            if(tileList[currentRoom.static[i].tileNum].passable == 1)
            {
                if(roughCollision(this.coordinates[0],this.coordinates[1],30,30,currentRoom.static[i].x, currentRoom.static[i].y,tileList[currentRoom.static[i].tileNum].w*2, tileList[currentRoom.static[i].tileNum].h*2))
                {
                    character.projectiles.splice(character.projectiles.indexOf(this), 1);
                    currentRoom.active.push(explosion(this.coordinates[0],this.coordinates[1]));
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
        {
             character.projectiles.splice(character.projectiles.indexOf(this), 1);
             currentRoom.active.push(explosion(this.coordinates[0],this.coordinates[1]));
        }

    };
    obj.draw = function()
    {
        onScreenSurface.drawImage(tilesImage,268,8,15,15,Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]),30,30);
    };
    return obj;
}

function movingPlatform(x,y,length,type,x2,y2)// x,y start coordinates ,     length of platform  ,   graphic to use for platform   ,     end of path x,y
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

function fallingPlatform(x,y,time,type)
{
    let obj = {};
    obj.coordinates = [x,y];
    obj.start = [x,y];
    obj.time = time;
    obj.type = type;
    obj.timer = -1;
    
    obj.tick = function()
    {    
        if(this.timer>-1)
            this.timer++;
        
        if(this.timer < 20)
            {}
        else if (this.timer < 20+this.time)
        {
            if(Math.floor(this.timer/3)%2)
                this.coordinates[0] +=1;
            else
                this.coordinates[0] -=1;
        }
        else if(this.timer < this.time+190)
        {
            this.coordinates[1] +=5;
            if(this.timer == this.time+20)
            {
                FallSFX.currentTime = 0;						
                FallSFX.play();
            }
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
        if(type == 1)
            onScreenSurface.drawImage(tilesImage,48,672,16,16,Math.floor(this.coordinates[0]-camera.coordinates[0]),Math.floor(this.coordinates[1]-camera.coordinates[1]),32,32);
        if(type == 2)
            onScreenSurface.drawImage(tilesImage,48,592,16,16,Math.floor(this.coordinates[0]-camera.coordinates[0]),Math.floor(this.coordinates[1]-camera.coordinates[1]),32,32);
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

function explosion(x,y)
{
    let obj = {};
    obj.coordinates = [x,y];
    obj.ticks = 0;
    obj.tick = function ()
    {
        this.ticks++;
        if(this.ticks>30)
            currentRoom.active.splice(currentRoom.active.indexOf(this), 1);
    };
    obj.draw = function ()
    {
        onScreenSurface.drawImage(explosionImage,Math.floor(this.ticks/3)*32,0,32,32,
            Math.floor(this.coordinates[0]-(this.ticks/2)-camera.coordinates[0]),Math.floor(this.coordinates[1]-camera.coordinates[1]),32,32);
    };
    return obj;
}

// ************** BELOW THIS POINT ARE SETUP METHODS FOR GENERATING LEVELS ******************
function ground(obj,x,y,length)  //object reference , x,ytop left corner  ,    length of ground
{
    let height = Math.ceil((obj.maxCamera[1]-y)/32);
    platform(obj,x,y,length,13);
    for(let i =1;i<height;i++)
        platform(obj,x,y+(32*i),length,21);
}

function castle(obj,x,y,length,height) //object reference , x,ytop left corner,  length castle ,height of castle
{
    for(let i =0;i<height;i++)
        platform(obj,x,y+(32*i),length,30);
}

function sky(obj)
{
    let num = Math.ceil(obj.maxCamera[0]/512/1.5);
    let num2 = Math.ceil(obj.maxCamera[1]/64);

    for(let i = 0;i<num;i++)
        skySurface.drawImage(tilesImage,tileList[0].x,tileList[0].y,tileList[0].w,tileList[0].h,512*i,0,tileList[0].w*2,tileList[0].h*2);
    for(let i = 0;i<Math.ceil(((num2-3)*num)/3);i++)
        skySurface.drawImage(tilesImage,tileList[1].x,tileList[1].y,tileList[1].w,tileList[1].h,(i%num)*512,64+(Math.floor(i/num)*64),tileList[1].w*2,tileList[1].h*2);
    for(let i = 0;i<num;i++)
        skySurface.drawImage(tilesImage,tileList[2].x,tileList[2].y,tileList[2].w,tileList[2].h,
            512*i,64+(Math.floor(Math.ceil(((num2-3)*num)/3)/num)*64),tileList[2].w*2,tileList[2].h*2);
    for(let i = 0;i<num;i++)
        skySurface.drawImage(tilesImage,tileList[3].x,tileList[3].y,tileList[3].w,tileList[3].h,
            512*i,128+(Math.floor(Math.ceil(((num2-3)*num)/3)/num)*64),tileList[3].w*2,tileList[3].h*2);
    for(let i = 0;i<num;i++)
        skySurface.drawImage(tilesImage,tileList[4].x,tileList[4].y,tileList[4].w,tileList[4].h,
            512*i,192+(Math.floor(Math.ceil(((num2-3)*num)/3)/num)*64),tileList[4].w*2,tileList[4].h*2);
    for(let i = 0;i<num;i++)
        skySurface.drawImage(tilesImage,tileList[5].x,tileList[5].y,tileList[5].w,tileList[5].h,
            512*i,256+(Math.floor(Math.ceil(((num2-3)*num)/3)/num)*64),tileList[5].w*2,tileList[5].h*2);
    for(let i = 0;i<Math.ceil(((num2-3)*num)/(3/2));i++)
        skySurface.drawImage(tilesImage,tileList[6].x,tileList[6].y,tileList[6].w,tileList[6].h,
            (i%num)*512,320+(Math.floor(Math.ceil(((num2-3)*num)/3)/num)*64)+(Math.floor(i/num)*52),tileList[6].w*2,tileList[6].h*2);
}

function castleBackLight(obj,x,y,w,h) //object reference , x,ytop left corner,  length castle background ,height of castle background
{ 
    y=(y+((h-1)*50)-(h*64))
    for(let i = 0;i<w;i++)
        for(let q = 0;q<h;q++)
            obj.static.push(returnTile(x+(i*64),y+(h*64)-(q*50),34));
}

function castleBackDark(obj,x,y,w,h) //object reference , x,ytop left corner,  length castle background ,height of castle background
{ 
    y=(y+((h-1)*50)-(h*64))
    for(let i = 0;i<w;i++)
        for(let q = 0;q<h;q++)
            obj.static.push(returnTile(x+(i*32),y+(h*64)-(q*50),37));
}

function castleBackHoles(obj,x,y,w,h) //object reference , x,ytop left corner,  length castle background ,height of castle background
{ 
    for(let i = 0;i<w;i++)
        for(let q = 0;q<h;q++)
        {
            if(q%2 == 0)
            {
                obj.static.push(returnTile(x+(i*256),y+(q*64),38));
                obj.static.push(returnTile(x+120+(i*256),y+(q*64),39));
            }
            else
            {
                obj.static.push(returnTile(x+(i*256),y+(q*64),39));
                obj.static.push(returnTile(x+136+(i*256),y+(q*64),38));
            }
        }
}

function levelBorders(obj) //applys blockers to left right and top of level and a death plane to the bottom
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

function platform(obj,x,y,length,type) //object reference , x,ytop left corner  ,   length of platform  , type of platform
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

function ladder(obj,x,y,height,type)
{
    if(type == 1)
        for(let i = 0;i<height;i++)
        {
            obj.static.push(returnTile(x,y+(i*64),40)); //ladder visual
            obj.static.push(returnTile(x+16,y+16+(i*64),41)); //ladder climbable
        }
    if(type == 2)
        for(let i = 0;i<height;i++)
        {
            obj.static.push(returnTile(x,y+(i*32),42)); //ladder visual
            if(i%2 == 0)
                obj.static.push(returnTile(x+16,y+16+(i*32),41)); //ladder climbable
        }
}

