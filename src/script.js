var offScreenCanvas = document.createElement('canvas');
offScreenCanvas.width = '5000';
offScreenCanvas.height = '5000';
var offScreenSurface = offScreenCanvas.getContext("2d");
offScreenSurface.imageSmoothingEnabled = false;


let onScreenCanvas = document.getElementById("bg");//getting canvas
let onScreenSurface = onScreenCanvas.getContext("2d");//setting canvas for drawing
onScreenSurface.imageSmoothingEnabled = false;


let PowerUpImage = new Image();//everything else
PowerUpImage.src = "data/spriteSheet.png";

let tilesImage = new Image();//background elements
tilesImage.src = "data/MainSpriteSheet.png";

let characterImage = new Image();//loading a spite sheet i downloaded
characterImage.src = "data/characters.png";

let heartImage = new Image();//loading a spite sheet i downloaded
heartImage.src = "data/hearts.png";


let currentAnimationFrame;

let keysPressed = [];//an array that holds the keys currently down

document.addEventListener("keydown",keyDownHandler,false);
document.addEventListener("keyup",keyUpHandler,false);

let camera = createCamera();

let character = createCharacter();//creates and holds character
let tileList = [];//list of tiles and their locations and atributes
setTileList();//populates the list with hardcoded tile information

let menuWait = 60;

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
    mainMenuBackground();
};

function mainMenuBackground()
{
    LevelTheme.pause();
    LevelTheme.currentTime = 0;
    window.cancelAnimationFrame(currentAnimationFrame);
    nextLevel(0,0,700);
    generateRoomMap(0);
    generateBackground()
    menuWait = 60;
    mainMenu();   
}

function mainMenu()
{
    drawBackground();
	onScreenSurface.fillStyle = 'white';
	onScreenSurface.font = "30px Courier New";
	onScreenSurface.fillText("Game for class", 150, 260);
    onScreenSurface.font = "20px Courier New";
    if(Math.floor(menuWait/30)%2)
        onScreenSurface.fillText("Press enter to play", 170, 360);
    if(menuWait>-1000)
        menuWait--;
    if(menuWait<-950)
        menuWait = 0;
	if(keysPressed.includes(13) && menuWait< 5)
    {
        LevelTheme.play();	
        character = createCharacter();
		nextLevel(0,50,920);
        //nextLevel(1,1800,620);
        window.cancelAnimationFrame(currentAnimationFrame);
		currentAnimationFrame = window.requestAnimationFrame(gameLoop);
	}
	else
		currentAnimationFrame = window.requestAnimationFrame(mainMenu);
}

function gameLoop()
{
    render();
    gameLogic();
    if(!character.dead)
        currentAnimationFrame = window.requestAnimationFrame(gameLoop);
}

function render() //clears screen and draws all elements in turn
{
    drawBackground();
    drawMain();
}

function generateBackground()// draws background layer should only be called during screen transitions
{

    offScreenSurface.clearRect(0,0,3000,3000);
    for(let i =0; i<currentRoom.static.length; i++)
    {
        offScreenSurface.drawImage(tilesImage,tileList[currentRoom.static[i].tileNum].x,tileList[currentRoom.static[i].tileNum].y,
            tileList[currentRoom.static[i].tileNum].w,tileList[currentRoom.static[i].tileNum].h,
            currentRoom.static[i].x,currentRoom.static[i].y,
            tileList[currentRoom.static[i].tileNum].w*2,tileList[currentRoom.static[i].tileNum].h*2);
        /*if(tileList[currentRoom.static[i].tileNum].passable == -1)
            {
                offScreenSurface.fillStyle = 'green';
                offScreenSurface.fillRect(currentRoom.static[i].x,currentRoom.static[i].y,20,20);
            }*///shows enemy blockers

    }
}

function drawMain() //draws all enemies player and interactive objects
{
    for(let i=0;i<Math.floor(character.health/2);i++) //draws full hearts ui
        onScreenSurface.drawImage(heartImage,0,0,16,16,5+(35*i),5,16*2,16*2);
    if(character.health%2 === 1) // draws half hearts for ui
        onScreenSurface.drawImage(heartImage,0,15,16,16,5+(35*(Math.floor(character.health/2))),5,16*2,16*2);
    for(let i=0;i<Math.ceil((character.maxHealth-character.health)/2)-character.health%2;i++) // draws empty hearts for ui
        onScreenSurface.drawImage(heartImage,1,30,16,16,5+(35*(i+Math.ceil(character.health/2))),5,16*2,16*2);
    character.draw();
    for(let i = 0; i < currentRoom.active.length;i++)
        currentRoom.active[i].draw();
    for(let i = 0; i < character.projectiles.length;i++)
        character.projectiles[i].draw();
}

function drawBackground() // draws UI ontop of everything else currently showing debug info
{
	onScreenSurface.clearRect(0,0,600,600);
	onScreenSurface.drawImage(offScreenCanvas,camera.coordinates[0],camera.coordinates[1],600,600,0,0,600,600);
}

function userInputHandler() //accepts and applies player input
{
    if(keysPressed.includes(37))//left
        character.moveVector[0] -= 0.3;
    if(keysPressed.includes(39))//right
        character.moveVector[0] += 0.3;
    if(keysPressed.includes(38))//up
        character.jump();
    else
        character.jumpTap = true;
    if(keysPressed.includes(16))//shift
        character.dash();
    else
        character.dashTap = true;
    if(keysPressed.includes(90))//z
        character.shoot();
    else
        character.projectileTap = true;
}

function gameLogic() //updates all game functions and ai
{
    for(let i = 0; i < character.projectiles.length;i++)
        character.projectiles[i].tick();
    character.tick(); //ticks character
    for(let i = 0; i < currentRoom.active.length;i++)
        currentRoom.active[i].tick();
	camera.tick();
}

function generateRoomMap (goto) //called by floor map generator to generate each room
{
    switch(goto)
    {
        case 0:
            return level0();
            break;
        case 1:
            return level1();
            break;
        case 2:
            return level2();
            break;
        case 3:
            return level3();
            break;
    }
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



    if (t_collision < b_collision && t_collision < l_collision && t_collision < r_collision && character.moveVector[1]>0 )
    {
        character.jump1 = true;
        if(character.jumpPowerup)
            character.jump2 = true;
        if(character.dashCd < 0)
            character.dashGround = true;
        character.moveVector[1]  = 0;
        character.coordinates[1]  -= t_collision-1;
    }
    else if (b_collision < t_collision && b_collision < l_collision && b_collision < r_collision && character.moveVector[1]<0)
    {
        character.moveVector[1]  = 0;
        character.coordinates[1]  += b_collision;
    }
    else if (l_collision < r_collision && l_collision < t_collision && l_collision < b_collision && character.moveVector[0]>=0)
    {
        character.coordinates[0]  -= l_collision;
    }
    else if (r_collision < l_collision && r_collision < t_collision && r_collision < b_collision && character.moveVector[0]<=0)
    {
        character.coordinates[0]  += r_collision;
    }

}

function resetGame()
{
    DeathSFX.play();
    window.cancelAnimationFrame(currentAnimationFrame);
    mainMenuBackground();
}

function nextLevel(goto,x,y)
{
    currentRoom = generateRoomMap(goto);
    character.coordinates[0] = x;
    character.coordinates[1] = y;
    character.respawnLocation = [character.coordinates[0],character.coordinates[1]];
    character.moveVector[0] = 0;
    character.moveVector[1] = 0;
    camera.coordinates = [character.coordinates[0],character.coordinates[1]];
    if(camera.coordinates[0]<0)
        camera.coordinates[0] = 0;
    if(camera.coordinates[0]>currentRoom.maxCamera[0]-600)
        camera.coordinates[0] = currentRoom.maxCamera[0]-600;
    if(camera.coordinates[1]<0)
        camera.coordinates[1] = 0;
    if(camera.coordinates[1]>currentRoom.maxCamera[1]-600)
        camera.coordinates[1] = currentRoom.maxCamera[1]-600;
    generateBackground();
}

function createCamera()
{
	let obj = {};
	obj.coordinates = [0,0];
	obj.tick = function ()
	{
		if(character.coordinates[0]-this.coordinates[0] > 300 && this.coordinates[0] < currentRoom.maxCamera[0]-600)
			this.coordinates[0] += Math.ceil((character.coordinates[0]-this.coordinates[0]-300)/100);
		if(character.coordinates[0]-this.coordinates[0] < 300 && this.coordinates[0] > 0)
			this.coordinates[0] += Math.ceil((character.coordinates[0]-this.coordinates[0]-300)/100);		
		if(character.coordinates[1]-this.coordinates[1] > 300 && this.coordinates[1] < currentRoom.maxCamera[1]-600)
			this.coordinates[1] += Math.ceil((character.coordinates[1]-this.coordinates[1]-300)/100);
		if(character.coordinates[1]-this.coordinates[1] < 300 && this.coordinates[1] > 0)
			this.coordinates[1] += Math.ceil((character.coordinates[1]-this.coordinates[1]-300)/100);
	};
	return obj;
}

function messageSystem(message)
{
    window.cancelAnimationFrame(currentAnimationFrame);
    let lines = [];
    for(let i =0;i<=Math.ceil(message.length/25);i++)
        lines[i]= message.substring(i*25-25,i*25);
    
    onScreenSurface.fillStyle = 'black';
    onScreenSurface.fillRect(200,295-(lines.length*6),250,(lines.length*12));
    
    onScreenSurface.fillStyle = 'white';
	onScreenSurface.font = "15px Courier New";
    for(let i = 0;i<lines.length;i++)
        onScreenSurface.fillText(lines[i],205, 300 -(lines.length*6)+(12*i));
    if(keysPressed.includes(13))
    {
        window.cancelAnimationFrame(currentAnimationFrame);
		currentAnimationFrame = window.requestAnimationFrame(gameLoop);
	}
	else
		currentAnimationFrame = window.requestAnimationFrame(messageSystem);
}