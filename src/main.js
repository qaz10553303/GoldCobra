var mainStage = document.getElementById("mainStage");
var drawingSurface = mainStage.getContext("2d");


//Sample 2D map array system
var mapArray = [
    [1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,9,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [10,0,0,0,0,2,0,2,0,2,0,2,0,2,0,2,0,0,0,0,2,2,2,2,2,2,2,2,2,2],
    [2,2,2,2,0,2,2,2,0,2,0,2,2,2,2,2,0,0,0,0,2,2,2,2,2,2,2,2,2,2],
    [2,2,2,2,0,2,2,2,0,2,0,0,0,0,0,2,0,0,0,0,2,2,2,2,2,2,2,2,2,2],
    [2,2,2,2,0,2,2,0,0,0,2,2,2,2,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,7,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,2,2,2,2,2,2,2,2,0,0],
    [2,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0]
];

/*Empty: 0, Ceiling: 1, Floor: 2, Wood Floor: 3, Stone Floor: 4, Metal Floor: 5, Destroyable Wall: 6,
Item: 7, Platform: 8, Notification: 9, Entrance: 10, Exit: 11
*/


//map code
var EMPTY = 0;
var CEILING = 1;
var FLOOR = 2;
var WOOD_FLOOR = 3;
var STONE_FLOOR = 4;
var METAL_FLOOR = 5;
var DESTROY_WALL = 6;
var ITEM = 7;
var PLATFORM = 8;
var NOTIFICATION = 9;
var ENTRANCE = 10;
var EXIT = 11;

//size of each cell
var SIZE = 50;

//number of rows and columns
var ROWS = mapArray.length;
var COLUMNS = mapArray[0].length;

//number of columns on map sprite sheet
var mapSpriteSheetColumns = 12;

//arrays to store game objects
var sprites = [];

//array to store keys
var keys = [];

var assetsToLoad = [];
var assetsLoaded = 0;

//loading the map sprite sheet image
var image = new Image();
image.addEventListener("load", loadHandler, false);
image.src = "img/spriteSheet1.png";
assetsToLoad.push(image);

//loading the player sprite image
let characterImage = new Image ();
characterImage.src = "img/baseSprite.png";
let player = createCharacter();


/*
//game variables
var playerXVelocity = 0.00;
var playerX = 100;
var playerYVelocity = 0.00;
var playerY = 150;
var playerFriction = 999; //higher value, more stick.
var playerGrounded = true;
var playerJumpHeight = 5.00;
var playerGravity = 0;
var playerGravityDefault = 0.098;
var playerGravityScale = 0.01;
var moveLeftDisabled = false;
var moveRightDisabled = false;

var playerSpeed = 4.00;

var playerImg = new Image();
var spriteRes = 50;//in pixels

playerImg.src = 'img/baseSprite.png';
*/


//sprite object
var spriteObject =
    {
        sourceX: 0,
        sourceY: 0,
        sourceWidth: 50,
        sourceHeight: 50,
        width: 50,
        height: 50,
        x: 0,
        y: 0,
        visible: true
    };

//This is defining how big the world space is that the player can explore it doesn't display anything
var gameWorld =
    {
        x:0,
        y:0,
        width: mapArray[0].length * SIZE,
        height: mapArray.length * SIZE
    };


//inner boundary "camera" that will be playable space that the player can see but will then also be impetus for visuals
//for what the player will see as they push to the edge of the canvas

//This playerCamera is also just the regular size of the canvas that we define it will also follow the player

var playerCamera =
    {
        x: 0,
        y:0,
        width: mainStage.width,
        height: mainStage.height
    };
function updateCamera()
{

    if ( player.x > (playerCamera.width / 2) && player.x < gameWorld.width - (playerCamera.width / 2) ) {
        playerCamera.x = player.x - (playerCamera.width / 2);
    }
    if ( player.y > (playerCamera.height / 2) && player.y < gameWorld.height - (playerCamera.height / 2) ) {
        playerCamera.y = player.y - (playerCamera.height / 2);
    }

   /* playerCamera.x = (gameWorld.x + gameWorld.width / 2) - playerCamera.width / 2;
    playerCamera.y = (gameWorld.y + gameWorld.height / 2) - playerCamera.height / 2;
    */
}


//Game States
var LOADING = 0;
var BUILD_MAP = 1;
var PLAYING = 2;
var OVER = 3;
var gameState = LOADING;

window.addEventListener("keydown", function (e) {keys[e.keyCode] = true;});
window.addEventListener("keyup", function (e) {keys[e.keyCode] = false;});

function playerMove(e)
{
    //up key
    if (keys[38])
    {
        player.y -= 5;
        if (player.y - (player.height / 2) < playerCamera.y)
        {
            player.y = playerCamera.y + (player.height / 2);
        }
    }
    //down
    if (keys[40])
    {
        player.y += 5;
        if (player.y + (player.height / 2) >= playerCamera.y + playerCamera.height)
        {
            player.y = playerCamera.y + playerCamera.height - (player.height / 2);
        }
    }
    //left
    if (keys[37])
    {
        player.x -= 5;
        if (player.x - (player.width / 2) < playerCamera.x)
        {
            player.x = playerCamera.x + (player.width / 2);
        }
    }
    //right
    if (keys[39])
    {
        player.x += 5;
        if (player.x + (player.width / 2) >= gameWorld.width) {
            player.x = playerCamera.x + playerCamera.width - (player.width / 2);
        }
    }
    //f key
    if (keys[70])
    {
        console.log("f");
    }

    player.x = Math.max(0, Math.min(player.x, gameWorld.width - player.width));
    player.y = Math.max(0, Math.min(player.y, gameWorld.height - player.height));

    return false;
}

function createCharacter()
{
    let obj = {};
    obj.x = 0;
    obj.y = 0;
    obj.sourceX = 10;
    obj.sourceY = 5;
    obj.width = 30;
    obj.height = 40;
    obj.coordinates = [100,150]; //player characters coordinates stored as x,y pair and player movement vector
    obj.moveVector = [0,0];//what directions the player is traveling only uses 1 0 and -1
    obj.sprite = [10,5,30,40];
    obj.draw = function()
    {
        drawingSurface.drawImage(characterImage, this.sourceX, this.sourceY, this.width, this.height,Math.floor(this.x), Math.floor(this.y), this.width, this.height);
    };
    return (obj);
}

function renderBackgroundSprites ()
{
    if (sprites.length !== 0)
    {
        for (var i = 0; i < sprites.length; i++)
        {
            var sprite = sprites[i];
            if (sprite.visible)
            {
                drawingSurface.drawImage
                (
                    image,
                    sprite.sourceX, sprite.sourceY,
                    sprite.sourceWidth, sprite.sourceHeight,
                    Math.floor(sprite.x), Math.floor(sprite.y),
                    sprite.width, sprite.height
                );
            }
        }
    }
}

update();

function update()
{
    //animation loop
    requestAnimationFrame(update);

    //switching the game state
    //Change what the game is doing based on the game state
    switch(gameState)
    {
        case LOADING:
            console.log("loading...");
            break;

        case BUILD_MAP:
            //buildMap(mapArray);
            gameState = PLAYING;
            break;

        case PLAYING:

            playerMove();
            updateCamera();
            buildMap(mapArray);
            render();
           //scrollCamera(player.x, player.y);
            break;

        case OVER:
            endGame();
            break;
    }
}

function loadHandler()
{
    assetsLoaded++;
    if(assetsLoaded === assetsToLoad.length)
    {
        //Remove the load handlers
        image.removeEventListener("load", loadHandler, false);

        //Build the map
        gameState = BUILD_MAP;
    }
}


/*Empty: 0, Ceiling: 1, Floor: 2, Wood Floor: 3, Stone Floor: 4, Metal Floor: 5, Destroyable Wall: 6,
Item: 7, Platform: 8, Notification: 9, Entrance: 10, Exit: 11
*/


function buildMap(levelMap)
{
    var onXTile = Math.floor((playerCamera.x + (playerCamera.width / 2)) / SIZE);
    var onYTile = Math.floor((playerCamera.y + (playerCamera.height / 2)) / SIZE);
    var drawTilesY = Math.floor((playerCamera.height/SIZE) + 1);
    var drawTilesX = Math.floor((playerCamera.width/SIZE) + 1);

    for (var row = onYTile - drawTilesY; row < onYTile + drawTilesY; row++)
    {
        for (var column = onXTile - drawTilesX; column < onXTile + drawTilesX; column++)
        {
            if ( row >= 0 && column >= 0 && row < mapArray.length && column < mapArray[row].length)
            {
                var currentTile = levelMap[row][column];
                //Find the tile's X and Y positions on the tile sheet
                var mapSpriteSheetX = Math.floor((currentTile -1) % mapSpriteSheetColumns) *SIZE;
                var mapSpriteSheetY = Math.floor((currentTile - 1) /mapSpriteSheetColumns) *SIZE;
                switch (currentTile)
                {
                    case CEILING: //number 1
                        var ceiling = Object.create(spriteObject);
                        ceiling.sourceX = mapSpriteSheetX;
                        ceiling.sourceY = mapSpriteSheetY;
                        ceiling.x = column * SIZE - playerCamera.x;
                        ceiling.y = row * SIZE - playerCamera.y;
                        sprites.push(ceiling);
                        break;

                    case FLOOR: //number 2
                        var floor = Object.create(spriteObject);
                        floor.sourceX = mapSpriteSheetX;
                        floor.sourceY = mapSpriteSheetY;
                        floor.x = column * SIZE - playerCamera.x;
                        floor.y = row * SIZE - playerCamera.y;
                        sprites.push(floor);
                        break;

                    case WOOD_FLOOR: //number 3
                        var woodFloor = Object.create(spriteObject);
                        woodFloor.sourceX = mapSpriteSheetX;
                        woodFloor.sourceY = mapSpriteSheetY;
                        woodFloor.x = column * SIZE - playerCamera.x;
                        woodFloor.y = row * SIZE - playerCamera.yE;
                        sprites.push(woodFloor);
                        break;

                    case STONE_FLOOR: //number 4
                        var stoneFloor = Object.create(spriteObject);
                        stoneFloor.sourceX = mapSpriteSheetX;
                        stoneFloor.sourceY = mapSpriteSheetY;
                        stoneFloor.x = column * SIZE - playerCamera.x;
                        stoneFloor.y = row * SIZE - playerCamera.y;
                        sprites.push(stoneFloor);
                        break;

                    case METAL_FLOOR: //number 5
                        var metalFloor = Object.create(spriteObject);
                        metalFloor.sourceX = mapSpriteSheetX;
                        metalFloor.sourceY = mapSpriteSheetY;
                        metalFloor.x = column * SIZE - playerCamera.x;
                        metalFloor.y = row * SIZE - playerCamera.y;
                        sprites.push(metalFloor);
                        break;
                    case DESTROY_WALL: //number 6
                        var wall = Object.create(spriteObject);
                        wall.sourceX = mapSpriteSheetX;
                        wall.sourceY = mapSpriteSheetY;
                        wall.x = column * SIZE - playerCamera.x;
                        wall.y = row * SIZE - playerCamera.y;
                        sprites.push(wall);
                        break;
                    case ITEM: //number 7
                        var item = Object.create(spriteObject);
                        item.sourceX = mapSpriteSheetX;
                        item.sourceY = mapSpriteSheetY;
                        item.x = column * SIZE - playerCamera.x;
                        item.y = row * SIZE - playerCamera.y;
                        sprites.push(item);
                        break;
                    case PLATFORM: //map code number 8
                        var platform = Object.create(spriteObject);
                        platform.sourceX = mapSpriteSheetX;
                        platform.sourceY = mapSpriteSheetY;
                        platform.x = column * SIZE - playerCamera.x;
                        platform.y = row * SIZE - playerCamera.y;
                        sprites.push(platform);
                        break;
                    case NOTIFICATION: //map code number 9
                        var notification = Object.create(spriteObject);
                        notification.sourceX = mapSpriteSheetX;
                        notification.sourceY = mapSpriteSheetY;
                        notification.x = column * SIZE - playerCamera.x;
                        notification.y = row * SIZE - playerCamera.y;
                        sprites.push(notification);
                        break;
                    case ENTRANCE: //map code number 10
                        var entrance = Object.create(spriteObject);
                        entrance.sourceX = mapSpriteSheetX;
                        entrance.sourceY = mapSpriteSheetY;
                        entrance.x = column * SIZE - playerCamera.x;
                        entrance.y = row * SIZE - playerCamera.y;
                        sprites.push(entrance);
                        break;
                    case EXIT: //map code number 11
                        var exit = Object.create(spriteObject);
                        exit.sourceX = mapSpriteSheetX;
                        exit.sourceY = mapSpriteSheetY;
                        exit.x = column * SIZE - playerCamera.x;
                        exit.y = row * SIZE - playerCamera.y;
                        sprites.push(exit);
                        break;
                }
            }
        }
    }
}

function render()
{
    drawingSurface.clearRect(0, 0, mainStage.width, mainStage.height);
    //Display the sprites
    renderBackgroundSprites();
    player.draw();

}

function endGame()
{
    console.log("game over");
}


//DaveTheMedic-jumping
function playerController(){
    //changing movement direction and velocity speed
    if(moveRight && !moveLeft){
        playerXVelocity = playerSpeed;
    }
    if(moveLeft && !moveRight){
        playerXVelocity = -playerSpeed;
    }
    if(moveUp){
        if(playerGrounded /*|| doubleJumpAvailable*/){
            playerYVelocity = -playerJumpHeight;
            playerGrounded = false;
        }
    }

    //applying friction and gravity effect
    if(playerXVelocity > 0 && !moveRight){
        playerXVelocity = playerXVelocity - playerFriction;
        if(playerXVelocity < 0.5)
            playerXVelocity = 0;
    }
    if(playerXVelocity < 0 && !moveLeft){
        playerXVelocity = playerXVelocity + playerFriction;
        if(playerXVelocity > 0.5)
            playerXVelocity = 0;
    }

    if(!playerGrounded){
        playerYVelocity += playerGravity;
        playerGravity += playerGravityScale;
        if (!(playerYVelocity < 0 && getTileAboveY(mapArray) == 0)  && !(playerYVelocity > 0 && getTileBelowY(mapArray) == 0)) { // ADDED THIS CHECK HERE
            playerY += playerYVelocity;
        }/* else {
            playerY = getTileBelowY(mapArray) * spriteRes + 1;
        }*/
    }

    //Resetting the force of gravity
    if(playerGrounded){
        playerGravity = playerGravityDefault;
        playerYVelocity = 0;

        //playerY = getTileBelowY(mapArray) + 1; CHANGED HERE
    }

    //applying movement to characters, preventing from going out of bounds
        if(playerX > 0 && playerX < 750) {//!(moveLeftDisabled || moveRightDisabled)) {
            if (playerXVelocity > 0 && getTileRightX(mapArray) != 0) {
                playerX = getTileX(mapArray) * spriteRes;
            } else if (playerXVelocity < 0 && getTileLeftX(mapArray) != 0) {
                playerX = getTileX(mapArray) * spriteRes;
            } else {
              playerX = playerX + playerXVelocity;
            }
            
        }

        /*if(moveLeftDisabled && moveRight && !moveLeft){
                playerX = playerX + playerXVelocity;
                moveLeftDisabled = false;
        }
        else if(moveRightDisabled && moveLeft && !moveRight)
        {
            playerX = playerX + playerXVelocity;
            moveRightDisabled = false;
        }*/
        if(playerX >= 750){
            playerX = 750;
            moveRightDisabled = true;
        }
        if(playerX <= 0){
            playerX = 0;
            moveLeftDisabled = true;
        }
    console.log("tile x: " + getTileRightX(mapArray)*spriteRes);
    if(getTileRightType(mapArray) != 0){
        var tempTileX = getTileRightX(mapArray)*spriteRes;
        if(tempTileX - playerX <= spriteRes)
            moveRightDisabled = true;
    }else{
        moveRightDisabled = false;
    }
    if(getTileLeftType(mapArray) != 0){
        var tempTileX = getTileLeftX(mapArray)*spriteRes;
        if(playerX - (tempTileX+spriteRes) <= 0)
            moveLeftDisabled = true;
    }else{
        moveLeftDisabled = false;
    }

    //console.log("left disabled: " + moveLeftDisabled + " right disabled: " + moveRightDisabled);

    //grounding nana :bless:
    if(getTileBelowType(mapArray) != 0 && !playerGrounded){
        playerGrounded = true;
        playerY = (getTileBelowY(mapArray)-1) * spriteRes;
    }
    //making nana fall :evil:
    if(getTileBelowType(mapArray) == 0){
        playerGrounded = false;
    }
    //console.log(getTileBelowType(mapArray));
    //console.log("player on ground:" + playerGrounded);
    //console.log("playerGravityDefault" + playerGravityDefault);
    //console.log("playerGravity" + playerGravity);
    //console.log("playerGravityScale" + playerGravityScale);
    //console.log("Player y velocity: " + playerYVelocity)
}


//tile finder/selector functions
function getTileInType(mapArray){
    var tileX, tileY;
    tileX = Math.floor((playerX+25)/spriteRes);
    tileY = Math.floor((playerY+25)/spriteRes);
    //console.log("Tile in coords: x="+tileX+" y="+tileY);
    //console.log("real x: " + playerX + " real y: " + playerY);
    var tileType = mapArray[tileY][tileX];
    return tileType;
}
function getTileAboveType(mapArray){
    var tileX, tileY;
    tileX = Math.floor((playerX+25)/spriteRes);
    tileY = Math.floor((playerY)/spriteRes) - 1;
    //console.log("Tile below coords: x="+tileX+" y="+tileY);
    //console.log(mapArray[tileY][tileX]);
    return mapArray[tileY][tileX];
}
function getTileBelowType(mapArray){
    var tileX, tileY;
    tileX = Math.floor((playerX+25)/spriteRes);
    tileY = Math.floor((playerY)/spriteRes) + 1;
    //console.log("Tile below coords: x="+tileX+" y="+tileY);
    //console.log(mapArray[tileY][tileX]);
    return mapArray[tileY][tileX];
}
function getTileRightType(mapArray){
    var tileX, tileY;
    tileX = Math.floor((playerX+25)/spriteRes) + 1;
    tileY = Math.floor((playerY)/spriteRes);
    //console.log("Tile right coords: x="+tileX+" y="+tileY);
    //console.log("Right type: " + mapArray[tileY][tileX]);
    return mapArray[tileY][tileX];
}
function getTileLeftType(mapArray){
    var tileX, tileY;
    tileX = Math.floor((playerX+25)/spriteRes) - 1;
    tileY = Math.floor((playerY)/spriteRes);
    //console.log("Tile left coords: x="+tileX+" y="+tileY);
    //console.log("Left type:" + mapArray[tileY][tileX]);
    return mapArray[tileY][tileX];
}

function getTileX(mapArray){
    var tileX;
    tileX = Math.floor((playerX+25)/spriteRes);
    return tileX;
}
function getTileY(mapArray){
    var tileY;
    tileY = Math.floor((playerY)/spriteRes);
    return tileY;
}
function getTileAboveY(mapArray){
    var tileY;
    tileY = Math.floor((playerY)/spriteRes) - 1;
    return tileY;
}
function getTileBelowY(mapArray){
    var tileY;
    tileY = Math.floor((playerY)/spriteRes) + 1;
    return tileY;
}
function getTileRightX(mapArray) {
    var tileX;
    tileX = Math.floor((playerX + 25) / spriteRes) + 1;
    return tileX;
}
function getTileLeftX(mapArray){
    var tileX;
    tileX = Math.floor((playerX+25)/spriteRes) - 1;
    return tileX;
}

