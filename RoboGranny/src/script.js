let fgCanvas = document.getElementById("fg");//getting canvas
let fgSurface = fgCanvas.getContext("2d");//setting canvas for drawing
fgSurface.imageSmoothingEnabled = false;

let bgCanvas = document.getElementById("bg");//getting canvas
let bgSurface = bgCanvas.getContext("2d");//setting canvas for drawing
bgSurface.imageSmoothingEnabled = false;

let uiCanvas = document.getElementById("ui");//getting canvas
let uiSurface = uiCanvas.getContext("2d");//setting canvas for drawing
uiSurface.imageSmoothingEnabled = false;

uiSurface.fillStyle = 'black';//text colour for text used on canvas ui, to be removed and replaced

let characterImage = new Image();//loading a spite sheet i downloaded
characterImage.src = "data/baseSprite.png";

let tilesImage = new Image();//loading a spite sheet i downloaded
tilesImage.src = "data/mapSpriteSheet.png";

let keysPressed = [];//an array that holds the keys currently down

document.addEventListener("keydown",keyDownHandler,false);
document.addEventListener("keyup",keyUpHandler,false);

let character = createCharacter();//creates and holds character
let tileList = [];//list of tiles and their locations and atributes
setTileList();//populates the list with hardcoded tile information

let currentRoom = generateRoomMap();

let drawHitboxes = false;

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
    drawBackground();
    requestAnimationFrame(gameLoop); //calls game loop 60 times a second
};

function gameLoop()
{
    render();
    userInputHandler();
    gameLogic();
    requestAnimationFrame(gameLoop);
}

function render() //clears screen and draws all elements in turn
{
    drawMain();
    drawUI();
    if(drawHitboxes)
        showHitboxes();
}

function drawBackground()// draws background layer should only be called during screen transitions
{

    bgSurface.clearRect(0,0,600,600);
    for(let i =0;i<currentRoom.features.length;i++)
    {
        bgSurface.drawImage(tilesImage,tileList[currentRoom.features[i].tileNum].x,tileList[currentRoom.features[i].tileNum].y,
            tileList[currentRoom.features[i].tileNum].w,tileList[currentRoom.features[i].tileNum].h,
            currentRoom.features[i].x,currentRoom.features[i].y,
            tileList[currentRoom.features[i].tileNum].w,tileList[currentRoom.features[i].tileNum].h);
    }
}

function drawMain() //draws all enemies player and interactive objects
{
    fgSurface.clearRect(0,0,600,600);
    character.draw();
}

function drawUI() // draws UI ontop of everything else currently showing debug info
{

    uiSurface.clearRect(0,0,600,100);
    uiSurface.font = "10px Courier New";
    uiSurface.fillText(keysPressed.toString(),10,10);
    uiSurface.fillText(character.canJump,30,10);
    uiSurface.fillText(character.moveVector.toString(),200,30);
}

function userInputHandler() //accepts and applies player input
{
    if(keysPressed.includes(37))//left
        character.moveVector[0]-=1;
    if(keysPressed.includes(39))//right
        character.moveVector[0]+=1;
    if(keysPressed.includes(38))//up
        character.jump();
}

function gameLogic() //updates all game functions and ai
{
    character.tick(); //ticks character
}

function generateRoomMap () //called by floor map generator to generate each room
{
    let obj = [];
    obj.features = [];
    obj.enemies = [];
    for(let i =0;i<20;i++)
        obj.features.push(returnTile(i*50,400,0)); // top left corner

    obj.features.push(returnTile(200,300,0));
    obj.features.push(returnTile(200,350,0));
    obj.features.push(returnTile(100,300,0));
    obj.features.push(returnTile(300,270,0));
    obj.features.push(returnTile(450,230,0));
    obj.features.push(returnTile(0,350,0));




    for(let i =0;i<20;i++)
        obj.features.push(returnTile(i*50,100,0)); // top left corner

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

function createCharacter() //generates and contains game character
{
    let obj = {};
    obj.coordinates = [100,150]; //player characters coordinates stored as x,y pair and player movement vector
    obj.moveVector = [0,0];//what directions the player is traveling only uses 1 0 and -1
    obj.sprite = [10,5,30,40];
    obj.attackChargeTimer = 0; //keeps track of reload time for weapon
    obj.maxSpeed= 5; //movement speed
    obj.canJump = false;
    obj.attack = function()
    {

    };
    obj.jump = function()
    {
        if(this.canJump)
            character.moveVector[1] = -4;

    };
    obj.tick = function ()
    {;
        this.coordinates[0] += this.moveVector[0];
        this.coordinates[1] += this.moveVector[1];
        this.moveVector[0] = Math.floor(0.5*Math.abs(this.moveVector[0])); //friction
        this.moveVector[1] += 0.1; //gravity
        this.canJump = false;
        collisionSystem();
    };
    obj.draw = function()
    {
        fgSurface.drawImage(characterImage, this.sprite[0], this.sprite[1], this.sprite[2], this.sprite[3],Math.floor(this.coordinates[0]), Math.floor(this.coordinates[1]), this.sprite[2], this.sprite[3]);
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
    tileList.push(tileInfo(0,0,50,50,1)); //tile 0 basic block with collision
}

function collisionSystem()
{
    for (let i= 0;i<currentRoom.features.length;i++)
    {
        gameOver = true;
        if(tileList[currentRoom.features[i].tileNum].passable !== 0)
           if(roughCollision(character.coordinates[0],character.coordinates[1],character.sprite[2],character.sprite[3],currentRoom.features[i].x, currentRoom.features[i].y,tileList[currentRoom.features[i].tileNum].w, tileList[currentRoom.features[i].tileNum].h))
           {
               if (tileList[currentRoom.features[i].tileNum].passable === 1)
               {
                   fineCollision(character.coordinates[0],character.coordinates[1],character.sprite[2],character.sprite[3],currentRoom.features[i].x, currentRoom.features[i].y,tileList[currentRoom.features[i].tileNum].w, tileList[currentRoom.features[i].tileNum].h);
               }
           }
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


    if (t_collision < b_collision && t_collision < l_collision && t_collision < r_collision )
    {
        character.canJump = true;
        character.moveVector[1]  -= (Math.abs(character.moveVector[1]));
        character.coordinates[1]  -= 1;
    }
    else if (b_collision < t_collision && b_collision < l_collision && b_collision < r_collision)
    {
        character.moveVector[1]  += (Math.abs(character.moveVector[1]));
    }
    else if (l_collision < r_collision && l_collision < t_collision && l_collision < b_collision)
    {
        character.moveVector[0] -= 1;
    }
    else if (r_collision < l_collision && r_collision < t_collision && r_collision < b_collision )
    {
        character.moveVector[0] += 1;
    }
}


function showHitboxes()  //dev tool to be removed in final
{
    fgSurface.beginPath();
    fgSurface.strokeStyle="red";
    fgSurface.rect(character.coordinates[0], character.coordinates[1], character.sprite[2], character.sprite[3]);
    fgSurface.stroke();
    fgSurface.closePath();
    for (let i= 0;i<currentRoom.features.length;i++) {
        fgSurface.beginPath();
        if (tileList[currentRoom.features[i].tileNum].passable === 1)
            fgSurface.strokeStyle = "green";

        fgSurface.rect(currentRoom.features[i].x, currentRoom.features[i].y, tileList[currentRoom.features[i].tileNum].w, tileList[currentRoom.features[i].tileNum].h);
        fgSurface.stroke();
        fgSurface.closePath();
    }
}