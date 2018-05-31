var mainStage = document.getElementById("mainStage");
var drawingSurface = mainStage.getContext("2d");

var fillRectX = 0;
var fillRectY = 0;

var UP = 38;
var DOWN = 40;
var RIGHT = 39;
var LEFT = 37;
var SPACE = 32;
var SHIFT = 16
var F = 70;


var moveUp = false;
var moveDown = false;
var moveRight = false;
var moveLeft = false;
var spaceBar = false;
var shiftKey = false;
var fkey = false;


//Sample 2D map array system
var mapArray = [
    [1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [7,0,0,0,0,2,0,2,0,2,0,2,0,2,0,2,0,0,0,0,2,2,2,2,2,2,2,2,2,2],
    [2,2,2,2,0,2,2,2,0,2,0,2,2,2,2,2,0,0,0,0,2,2,2,2,2,2,2,2,2,2],
    [2,2,2,2,0,2,2,2,0,2,0,0,0,0,0,2,0,0,0,0,2,2,2,2,2,2,2,2,2,2],
    [2,2,2,2,0,2,2,0,0,0,2,2,2,2,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,4,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,2,2,2,2,2,2,2,2,0,0],
    [2,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0]
];



//map code
var EMPTY = 0;
var CEILING = 1;
var FLOOR = 2;
var DESTROY_WALL = 3;
var ITEM = 4;
var PLATFORM = 5;
var NOTIFICATION = 6;
var ENTRANCE = 7;
var EXIT = 8;

//size of each cell
var SIZE = 50;

//number of rows and columns
var ROWS = mapArray.length;
var COLUMNS = mapArray[0].length;

//number of columns on map sprite sheet
var mapSpriteSheetColumns = 8;

//arrays to store game objects
var sprites = [];

var assetsToLoad = [];
var assetsLoaded = 0;

//loading the map sprite sheet image
var image = new Image();
image.addEventListener("load", loadHandler, false);
image.src = "img/mapSpriteSheet.png";
assetsToLoad.push(image);

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
        width: mapArray[0].length * 50,
        height: mapArray.length * 50
    };


//inner boundary "camera" that will be playable space that the player can see but will then also be impetus for visuals
//for what the player will see as they push to the edge of the canvas

//This playerCamera is also just the regular size of the canvas that we define it will also follow the player

var playerCamera =
    {
        x: 0,
        y:0,
        width: mainStage.width,
        height: mainStage.height,

        rightInnerBoundary: function()
        {
            return this.x + (this.width * 0.75);
        },
        leftInnerBoundary: function()
        {
            return this.x + (this.width * 0.25);
        },
        topInnerBoundary: function()
        {
            return this.y + (this.height * 0.25);
        },
        bottomInnerBoundary: function()
        {
            return this.y + (this.height * 0.75);
        }
    };
playerCamera.x = (gameWorld.x + gameWorld.width /2) - playerCamera.width/2;
playerCamera.y = (gameWorld.y + gameWorld.height /2) - playerCamera.height / 2 ;



//Game States
var LOADING = 0;
var BUILD_MAP = 1;
var PLAYING = 2;
var OVER = 3;
var gameState = LOADING;

//Key down event listener to see if player presses key
window.addEventListener("keydown", onKeyDown, false);

function onKeyDown(event) {

    switch (event.keyCode) {
        case UP:
            moveUp = true;
            break;
        case DOWN:
            moveDown = true;
            break;
        case LEFT:
            moveLeft = true;
            break;
        case RIGHT:
            moveRight = true;
            break;
        case SPACE:
            spaceBar = true;
            break;
        case SHIFT:
            shiftKey = true;
            break;
        case F:
            fkey = true;
            break;
    }
}

//event listener checking if the player has stopped pressing the key
window.addEventListener("keyup", onKeyUp, false);

function onKeyUp(event) {
    switch (event.keyCode) {
        case UP:
            moveUp = false;
            break;
        case DOWN:
            moveDown = false;
            break;
        case LEFT:
            moveLeft = false;
            break;
        case RIGHT:
            moveRight = false;
            break;
        case SPACE:
            spaceBar = false;
            break;
        case SHIFT:
            shiftKey = false;
            break;
        case F:
            fkey = false;
            break;
    }
}


//drawing rectangle shape as placeholder for game sprite
function drawRect()
{
    drawingSurface.fillStyle = "red";
    drawingSurface.fillRect(fillRectX,fillRectY,60,60);
}


//rendering the shape
function renderRect()
{
    drawRect();
}

//function to move the Rectangle shape
function moveRect()
{
    if (moveLeft && fillRectX > 0)
    {
        fillRectX -=5;
    }
    if (moveRight && fillRectX < mainStage.width - 60)
    {
        fillRectX+=5;
    }
    if (moveUp && fillRectY > 0)
    {
        fillRectY -=5;
    }
    if (moveDown && fillRectY < mainStage.height - 60 )
    {
        fillRectY+=5;
    }
}

function scrollCamera(player) {
    if (player.x < playerCamera.leftInnerBoundary()) {
        playerCamera.x = Math.max(0, Math.min
        (
            Math.floor(player.x - (playerCamera.width * 0.25)),
            gameWorld.width - playerCamera.width
        ));
    }
    if (player.y < playerCamera.topInnerBoundary()) {
        playerCamera.y = Math.max(0, Math.min
        (
            Math.floor(player.y - (playerCamera.height * 0.25)),
            gameWorld.height - playerCamera.height
        ));
    }
    if (player.x + player.width > playerCamera.rightInnerBoundary()) {
        playerCamera.x = Math.max(0, Math.min
        (
            Math.floor(player.x + player.width - (playerCamera.width * 0.75)),
            gameWorld.width - playerCamera.width
        ));
    }
    if (player.y + player.height > playerCamera.bottomInnerBoundary()) {
        playerCamera.y = Math.max(0, Math.min
        (
            Math.floor(player.y + player.height - (playerCamera.height * 0.75)),
            gameWorld.height - playerCamera.height
        ));
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
            buildMap(mapArray);
            //createOtherObjects();
            gameState = PLAYING;
            break;

        case PLAYING:
            moveRect();
            scrollCamera();
            break;

        case OVER:
            endGame();
            break;
    }
    //Render the game
    render();
    playerController();
    drawingSurface.drawImage(playerImg, playerX, playerY);
     //function located in player.js, handles movement.
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


function buildMap(levelMap) {
    for (var row = 0; row < ROWS; row++) {
        for (var column = 0; column < COLUMNS; column++) {
            var currentTile = levelMap[row][column];
            if (currentTile !== EMPTY) {
                //Find the tile's X and Y positions on the tilesheet
                var mapSpriteSheetX = Math.floor((currentTile -1) % mapSpriteSheetColumns) *SIZE;
                var mapSpriteSheetY = Math.floor((currentTile - 1) /mapSpriteSheetColumns) *SIZE;
                switch (currentTile) {
                    case CEILING: //number 1
                        var ceiling = Object.create(spriteObject);
                        ceiling.sourceX = mapSpriteSheetX;
                        ceiling.sourceY = mapSpriteSheetY;
                        ceiling.x = column * SIZE;
                        ceiling.y = row * SIZE;
                        sprites.push(ceiling);
                        break;

                    case FLOOR: //number 2
                        var floor = Object.create(spriteObject);
                        floor.sourceX = mapSpriteSheetX;
                        floor.sourceY = mapSpriteSheetY;
                        floor.x = column * SIZE;
                        floor.y = row * SIZE;
                        sprites.push(floor);
                        break;

                    case DESTROY_WALL: //number 3
                        var wall = Object.create(spriteObject);
                        wall.sourceX = mapSpriteSheetX;
                        wall.sourceY = mapSpriteSheetY;
                        wall.x = column * SIZE;
                        wall.y = row * SIZE;
                        sprites.push(wall);
                        break;

                    case ITEM: //number 4
                        var item = Object.create(spriteObject);
                        item.sourceX = mapSpriteSheetX;
                        item.sourceY = mapSpriteSheetY;
                        item.x = column * SIZE;
                        item.y = row * SIZE;
                        sprites.push(item);
                        break;
                    case PLATFORM: //map code number 5
                        var platform = Object.create(spriteObject);
                        platform.sourceX = mapSpriteSheetX;
                        platform.sourceY = mapSpriteSheetY;
                        platform.x = column * SIZE;
                        platform.y = row * SIZE;
                        sprites.push(platform);
                        break;
                    case NOTIFICATION: //map code number 6
                        var notification = Object.create(spriteObject);
                        notification.sourceX = mapSpriteSheetX;
                        notification.sourceY = mapSpriteSheetY;
                        notification.x = column * SIZE;
                        notification.y = row * SIZE;
                        sprites.push(notification);
                        break;
                    case ENTRANCE: //map code number 7
                        var entrance = Object.create(spriteObject);
                        entrance.sourceX = mapSpriteSheetX;
                        entrance.sourceY = mapSpriteSheetY;
                        entrance.x = column * SIZE;
                        entrance.y = row * SIZE;
                        sprites.push(entrance);
                        break;
                    case EXIT: //map code number 8
                        var exit = Object.create(spriteObject);
                        exit.sourceX = mapSpriteSheetX;
                        exit.sourceY = mapSpriteSheetY;
                        exit.x = column * SIZE;
                        exit.y = row * SIZE;
                        sprites.push(exit);
                        break;
                }
            }
        }
    }
}

function render() {
    drawingSurface.clearRect(0, 0, mainStage.width, mainStage.height);

    //saves the current state of the canvas to apply translational properties

    drawingSurface.save();

    /* translates the viewable canvas space through the playerCamera and shifts it towards the space that the player
     decides to move to, it uses the inverse of the playerCamera coordinates to do this
    */

    drawingSurface.translate(-playerCamera.x, -playerCamera.y);

    //Display the sprites
    if (sprites.length !== 0) {
        for (var i = 0; i < sprites.length; i++) {
            var sprite = sprites[i];
            if (sprite.visible) {
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
    renderRect();
    drawingSurface.restore();
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
