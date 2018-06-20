var offScreenCanvas = document.createElement('canvas');
offScreenCanvas.width = '3000';
offScreenCanvas.height = '3000';
var offScreenSurface = offScreenCanvas.getContext("2d");
offScreenSurface.imageSmoothingEnabled = false;


let onScreenCanvas = document.getElementById("bg");//getting canvas
let onScreenSurface = onScreenCanvas.getContext("2d");//setting canvas for drawing
onScreenSurface.imageSmoothingEnabled = false;


let characterImage = new Image();//loading a spite sheet i downloaded
characterImage.src = "data/baseSprite.png";

let tilesImage = new Image();//loading a spite sheet i downloaded
tilesImage.src = "data/mapSpriteSheet.png";

enemyImage = new Image();
enemyImage.src = "data/Evil.png";

let augmentsImage = new Image();//loading a sprite sheet for the state machine
augmentsImage.src = "data/augmentsSpriteSheet.png";

let keysPressed = [];//an array that holds the keys currently down

document.addEventListener("keydown",keyDownHandler,false);
document.addEventListener("keyup",keyUpHandler,false);

let camera = createCamera();

let character = createCharacter();//creates and holds character
let tileList = [];//list of tiles and their locations and atributes
setTileList();//populates the list with hardcoded tile information

//Max size 12*12 scrolling not yet implemented
//please do not create maps that the player can escape
let mapArray = [
    [1,1,1,1,1,1,1,1 ,1,1,1,1,1,1,1,1,4,4,4,4,1,1,1],
    [1,0,0,0,0,0,0,0 ,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,4,4,4 ,4,4,0,0,0,0,0,0,0,0,0,0,0,7,1],
    [1,6,0,0,0,1,4,1 ,4,1,0,1,0,1,0,1,0,0,0,0,1,1,1],
    [1,1,1,1,0,1,1,1 ,4,1,0,1,1,1,1,1,0,0,0,0,1,1,1],
    [1,1,1,1,0,1,1,1 ,0,1,0,0,0,0,0,1,0,0,0,0,1,1,1],
    [1,1,1,1,0,1,1,0 ,0,0,1,1,1,1,0,1,0,0,0,0,1,1,1],
    [1,9,0,0,0,0,0,0 ,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
    [1,1,1,1,1,1,1,1 ,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1 ,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1 ,8,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

/*Empty: 0, deafult: 1, wood: 2, Stone 3, Metal 4, Destroyable Wall: 5,
Entrance: 6, Exit: 7, 8 instant death,9 double jump,10 dash
*/
let state = 0;

let currentRoom = generateRoomMap(mapArray);

function keyDownHandler(e) //appends key to array if it is not already present
{
    if(!keysPressed.includes(e.keyCode))
        keysPressed.push(e.keyCode)
}

function keyUpHandler(e) //removes specified key from array
{
    keysPressed.splice(keysPressed.indexOf(e.keyCode), 1);
}

window.onload = function() //this prevents game from starting before all assets are loaded
{
  mainMenu();
};

function mainMenu()
{
	state = 0;
	onScreenSurface.clearRect(0,0,600,600);
    onScreenSurface.fillStyle = 'black';
    onScreenSurface.fillRect(0,0,600,600);
	onScreenSurface.fillStyle = 'white';
	onScreenSurface.font = "30px Courier New";
	onScreenSurface.fillText("Press Enter To Start", 110, 260);
	if(keysPressed.includes(13))
	{
		state = 1;
	}
	if(state == 1)
	{
		drawBackground();
		requestAnimationFrame(gameLoop);
	}
	else
	{
		requestAnimationFrame(mainMenu);
	}

}


function gameLoop()
{
    render();
    userInputHandler();
    gameLogic();
	if(state == 1)
		requestAnimationFrame(gameLoop);
}

function render() //clears screen and draws all elements in turn
{
    drawUI();
    drawMain();
}

function drawBackground()// draws background layer should only be called during screen transitions
{

    offScreenSurface.clearRect(0,0,3000,3000);
    for(let i =0; i<currentRoom.static.length; i++)
    {
        offScreenSurface.drawImage(tilesImage,tileList[currentRoom.static[i].tileNum].x,tileList[currentRoom.static[i].tileNum].y,
            tileList[currentRoom.static[i].tileNum].w,tileList[currentRoom.static[i].tileNum].h,
            currentRoom.static[i].x,currentRoom.static[i].y,
            tileList[currentRoom.static[i].tileNum].w,tileList[currentRoom.static[i].tileNum].h);
    }
}

function drawMain() //draws all enemies player and interactive objects
{
    character.draw();
    ai1.drawAI();
}

function drawUI() // draws UI ontop of everything else currently showing debug info
{
	onScreenSurface.clearRect(0,0,600,600);
	onScreenSurface.drawImage(offScreenCanvas,camera.coordinates[0],camera.coordinates[1],600,600,0,0,600,600);
}

function userInputHandler() //accepts and applies player input
{
    if(keysPressed.includes(37))//left
        character.moveVector[0]-=1;
    if(keysPressed.includes(39))//right
        character.moveVector[0]+=1;
    if(keysPressed.includes(38))//up
        character.jump();
    if(keysPressed.includes(16))//shift
        character.dash();

}

function gameLogic() //updates all game functions and ai
{
    character.tick(); //ticks character
	camera.tick();
  ai1.aiPatrol();
}

function generateRoomMap (current) //called by floor map generator to generate each room
{
    let obj = [];
    obj.static = [];
    obj.enemies = [];

    for (let i =0;i<current.length;i++)
        for(let q = 0; q<current[i].length;q++)
        {
            if(current[i][q] == 1)
                obj.static.push(returnTile(q*50,i*50,0));
            else if (current[i][q] == 2)
                obj.static.push(returnTile(q*50,i*50,1));
            else if (current[i][q] == 3)
                obj.static.push(returnTile(q*50,i*50,2));
            else if (current[i][q] == 4)
                obj.static.push(returnTile(q*50,i*50,3));
            else if (current[i][q] == 5)
                obj.static.push(returnTile(q*50,i*50,4));
            else if (current[i][q] == 6)
            {
                obj.static.push(returnTile(q*50,i*50,5));
                character.coordinates = [q * 50, i * 50];
		camera.coordinates[0] = character.coordinates[0]-275;
		camera.coordinates[1] = character.coordinates[1]-275;
            }
            else if (current[i][q] == 7)
                obj.static.push(returnTile(q*50,i*50,6));
            else if (current[i][q] == 8)
                obj.static.push(returnTile(q*50,i*50,7));
            else if (current[i][q] == 9)
                obj.static.push(returnTile(q*50,i*50,8));
            else if (current[i][q] == 10)
                obj.static.push(returnTile(q*50,i*50,9));
            //else if (current[i][q] == 11)//STATE MACHINE TEMP
                // obj.static.push(returnTile(q*50,i*50,10));
        }


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

function drawAI(){

onScreenSurface.drawImage(enemyImage,0,0, 20, 50,Math.floor(this.xCord-camera.coordinates[0]), Math.floor(this.yCord-camera.coordinates[1]), 20, 50);
}

function Ai(startpoint, endpoint, yCord, xCord, MovementSpeed, UsePointSystem, MovementState){
      this.startpoint=startpoint;
      this.endpoint=endpoint;
      this.yCord=yCord;
      this.xCord=xCord;
      this.MovementSpeed=MovementSpeed;
      this.UsePointSystem=UsePointSystem;
      this.MovementState=MovementState;
    }

    // creates a new ai called ai1, starpoint and endpoint are ignored unless you set the UsePointSystem to 1
var ai1 = new Ai(325, 500, 400, 325, 1, 0, 1);
ai1.aiPatrol =aiPatrol;
ai1.drawAI = drawAI;


function aiPatrol(){console.log(this.xCord)
if(this.UsePointSystem){
  if (this.MovementState==1 && this.xCord < this.endpoint)
    {
        this.xCord +=this.MovementSpeed;
    }
    if (this.MovementState==1&& this.xCord >= this.endpoint)
    {
    this.MovementState=2
    }
    if (this.MovementState==2 && this.xCord > this.startpoint)
    {
      this.xCord -=this.MovementSpeed;
    }
    if (this.MovementState==2&& this.xCord<=this.startpoint)
    {
      this.MovementState=1
    }
}
else{
if(this.MovementState==1){
this.xCord++;}
else{
this.xCord--;
}
    for (let i= 0; i<currentRoom.static.length; i++){

          if(roughCollision(this.xCord,this.yCord,20,50,currentRoom.static[i].x, currentRoom.static[i].y,tileList[currentRoom.static[i].tileNum].w, tileList[currentRoom.static[i].tileNum].h))
            {if(this.MovementState==1){
              this.MovementState=2;
            }
            else if(this.MovementState==2){
              this.MovementState=1;
            }
            else{console.log("error");}
            break;
          }}}

}


function createCharacter() //generates and contains game character
{
    let obj = {};
    obj.coordinates = [100,150]; //player characters coordinates stored as x,y pair and player movement vector
    obj.moveVector = [0,0]; // character movement vector
    obj.sprite = [9,2,25,40];
    obj.jumpCharges = 0;
    obj.maxJumpCharges = 1;
    obj.dashPowerup = false;
    obj.jumpTimer = 0;
    obj.dashCd = 0;
    obj.dashTime = 0;
    //STATE MACHINE
    //obj.helmet = 0;
    //obj.body = 0;
    //obj.arms = 0;
    //obj.legs = 0;

    /*obj.equipAugment = function (augType, augId)//type 1 helmet, 2 body, 3 arms, 4 legs
    {
        switch(augType)
        {
            case 1:
            this.helmet = augId;
            break;
            case 2:
            this.body = audId;
            break;
            case 3:
            this.arms = augId;
            break;
            case 4:
            this.legs = augId;
            break;
        }

    }*/
    //
    obj.jump = function()
    {
        if(this.jumpCharges >0 && this.jumpTimer <= 0)
        {
            this.moveVector[1] = -4;
            this.jumpCharges--;
	        this.jumpTimer = 20;
        }
    };
    obj.dash = function()
    {
        if(this.dashCd <= 0 && this.dashPowerup)
        {
            this.dashCd = 60;
            this.dashTime = 10;
        }

    };
    obj.tick = function ()
    {
        if(this.dashTime >= 0)
        {
            this.dashTime--;
            this.moveVector[0] *= this.dashTime*2;
            this.moveVector[1] = 0;
        }
        this.coordinates[0] += this.moveVector[0];
        this.coordinates[1] += this.moveVector[1];
        this.moveVector[0] = 0; //friction
	if(this.moveVector[1]<5)
        	this.moveVector[1] += 0.1; //gravity
        if(this.dashCd >= 0)
            this.dashCd--;
        if(this.jumpTimer >= 0)
            this.jumpTimer--;
        for (let i= 0; i<currentRoom.static.length; i++)
        {
            if(tileList[currentRoom.static[i].tileNum].passable != 0)
                if(roughCollision(this.coordinates[0],this.coordinates[1],this.sprite[2],this.sprite[3],currentRoom.static[i].x, currentRoom.static[i].y,tileList[currentRoom.static[i].tileNum].w, tileList[currentRoom.static[i].tileNum].h))
                {
                    switch(tileList[currentRoom.static[i].tileNum].passable)
                    {
                    case 1:
                        fineCollision(this.coordinates[0],this.coordinates[1],this.sprite[2],this.sprite[3],currentRoom.static[i].x, currentRoom.static[i].y,tileList[currentRoom.static[i].tileNum].w, tileList[currentRoom.static[i].tileNum].h);
                        break;
                   case 2:
                   case 3:
                        resetLevel();
                        break;
                   case 4:
                        this.maxJumpCharges =2;
                        break;
                   case 5:
                        this.dashPowerup = true;
                        break;
                   //case 11://STATE MACHINE TEMP
                    //    this.equipAugment(1, 1);
                        break;
                    }

                }
        }
    };
    obj.draw = function()
    {

        onScreenSurface.drawImage(characterImage, this.sprite[0], this.sprite[1], this.sprite[2], this.sprite[3],Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]), this.sprite[2], this.sprite[3]);

        if (this.helmet != 0)
            onScreenSurface.drawImage(augmentsImage, this.sprite[0]+(this.sprite[2]*(this.helmet-1)), this.sprite[1], this.sprite[2]*this.helmet, this.sprite[3],Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]), this.sprite[2]*(this.helmet), this.sprite[3]);
        if (this.body != 0)
            onScreenSurface.drawImage(augmentsImage, this.sprite[0]+(this.sprite[2]*(this.body-1)), this.sprite[1], this.sprite[2]*this.body, this.sprite[3],Math.floor(this.coordinates[0]-camera.coordinates[0]), Math.floor(this.coordinates[1]-camera.coordinates[1]), this.sprite[2]*(this.body), this.sprite[3]);
    };
    return (obj);
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
    tileList.push(tileInfo(50,0,50,50,1)); //default 0
    tileList.push(tileInfo(100,0,50,50,1)); //wood 1
    tileList.push(tileInfo(150,0,50,50,1)); //stone 2
    tileList.push(tileInfo(0,0,50,50,1)); //metal 3
    tileList.push(tileInfo(250,0,50,50,1)); //destroyable 4
    tileList.push(tileInfo(450,0,50,50,0)); //entrance door 5
    tileList.push(tileInfo(500,0,50,50,2)); //exit door 6
    tileList.push(tileInfo(-50,-50,50,50,3)); //instant death reset level 7
    tileList.push(tileInfo(300,0,50,50,4)); //double Jump 8
    tileList.push(tileInfo(300,0,50,50,5)); //dash 9
   // tileList.push(tileInfo(300,0,50,50,11));
}


function roughCollision(x1,y1,w1,h1,x2,y2,w2,h2) //takes the x,y,width and height of 2 objects and checks for collision returns true or false
{
    return (x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && h1 + y1 > y2);
}


function fineCollision(x1,y1,w1,h1,x2,y2,w2,h2)//will use penetration testing to determine what vector to apply to character to move out of walls
{
    let b_collision = y2+h2-y1;
    let t_collision = y1+h1-y2;
    let l_collision = x1+w1-x2;
    let r_collision = x2+w2-x1;


    if (t_collision < b_collision && t_collision < l_collision && t_collision < r_collision )
    {
        character.jumpCharges = character.maxJumpCharges;
        character.moveVector[1]  = 0;
        character.coordinates[1]  -= t_collision;
    }
    else if (b_collision < t_collision && b_collision < l_collision && b_collision < r_collision)
    {
        character.moveVector[1]  = 0;
        character.coordinates[1]  += b_collision;
    }
    else if (l_collision < r_collision && l_collision < t_collision && l_collision < b_collision)
    {
        character.moveVector[0] = 0;
        character.coordinates[0]  -= l_collision;

    }
    else if (r_collision < l_collision && r_collision < t_collision && r_collision < b_collision )
    {
        character.moveVector[0] = 0;
        character.coordinates[0]  += r_collision;
    }
}

function resetLevel()
{
    character.moveVector[0] = 0;
    character.moveVector[1] = 0;
    character.maxJumpCharges =1;
    character.dashPowerup = false;
    currentRoom = generateRoomMap(mapArray);
	state = 0;
	mainMenu();
}

function createCamera()
{
	let obj = {};
	obj.coordinates = [0,0];
	obj.tick = function ()
	{
		if(character.coordinates[0]-this.coordinates[0] > 300)
			this.coordinates[0] += Math.ceil((character.coordinates[0]-this.coordinates[0]-300)/100);
		if(character.coordinates[0]-this.coordinates[0] < 200)
			this.coordinates[0] += Math.ceil((character.coordinates[0]-this.coordinates[0]-200)/100);
		if(character.coordinates[1]-this.coordinates[1] > 300)
			this.coordinates[1] += Math.ceil((character.coordinates[1]-this.coordinates[1]-300)/100);
		if(character.coordinates[1]-this.coordinates[1] < 200)
			this.coordinates[1] += Math.ceil((character.coordinates[1]-this.coordinates[1]-200)/100);
	}
	return obj;

}
