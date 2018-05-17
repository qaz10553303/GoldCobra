//test//test
var mainStage = document.getElementById("mainStage");
var drawingSurface = mainStage.getContext("2d");

var fillRectX = 0;
var fillRectY = 0;

var UP = 38;
var DOWN = 40;
var RIGHT = 39;
var LEFT = 37;
var SPACE = 32;


var moveUp = false;
var moveDown = false;
var moveRight = false;
var moveLeft = false;
var spaceBar = false;


//Sample 2D map array system
var mapArray = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,6,5,2,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,1,1,1,0,1,1,1,0,1,0,1,1,1,1,1],
    [1,1,1,1,0,1,1,1,0,1,0,0,0,0,0,1],
    [1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1]
];

//map code
const EMPTY = 0;
const CEILING = 1;
const FLOOR = 2;
const DESTROY_WALL = 3;
const PLATFORM = 5;
const ITEM = 4;
const NOTIFICATION = 6;
const ENTRANCE = 7;
const EXIT = 8;

//size of each cell
var SIZE = 50;

//number of rows and columns
var ROWS = mapArray.length;
var COLUMNS = mapArray[0].length;

//number of columns on map sprite sheet
var mapSpriteSheetColumns = 8;

//arrays to store game objects
var sprites = [];
var messages = [];

var assetsToLoad = [];
var assetsLoaded = 0;

//loading the map sprite sheet image
var image = new Image();
image.addEventListener("load", loadHandler, false);
image.src = "../images/mapSpriteSheet.png";
assetsToLoad.push(image);

//game variables

//Game States
var LOADING = 0;
var BUILD_MAP = 1;
var PLAYING = 2;
var OVER = 3;
var gameState = LOADING;

//Keydown event listener to see if player presses key
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

update();

function update()
{
    //animation loop
    requestAnimationFrame(update, canvas);

    //switching the game state
    //Change what the game is doing based on the game state
    switch(gameState)
    {
        case LOADING:
            console.log("loading...");
            break;

        case BUILD_MAP:
            buildMap(map);
            buildMap(gameObjects);

            //createOtherObjects();
            gameState = PLAYING;
            break;

        case PLAYING:
            moveRect();
            break;

        case OVER:
            endGame();
            break;
    }
    //Render the game
    render();
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
                var tileSheetX = Math.floor((currentTile—1) % tilesheetColumns) *SIZE;
                var tileSheetY = Math.floor((currentTile—1) /tilesheetColumns) *SIZE;
                switch (currentTile) {
                    case CEILING: //number 1
                        var ceiling = Object.create(spriteObject);
                        ceiling.sourceX = tileSheetX;
                        ceiling.sourceY = tileSheetY;
                        ceiling.x = column * SIZE;
                        ceiling.y = row * SIZE;
                        sprites.push(ceiling);
                        break;

                    case FLOOR: //number 2
                        var floor = Object.create(spriteObject);
                        floor.sourceX = tileSheetX;
                        floor.sourceY = tileSheetY;
                        floor.x = column * SIZE;
                        floor.y = row * SIZE;
                        sprites.push(floor);
                        boxes.push(floor);
                        break;

                    case DESTROY_WALL: //number 3
                        var wall = Object.create(spriteObject);
                        wall.sourceX = tileSheetX;
                        wall.sourceY = tileSheetY;
                        wall.x = column * SIZE;
                        wall.y = row * SIZE;
                        sprites.push(wall);
                        break;

                    case ITEM: //number 4
                        var item = Object.create(spriteObject);
                        item.sourceX = tileSheetX;
                        item.sourceY = tileSheetY;
                        item.x = column * SIZE;
                        item.y = row * SIZE;
                        sprites.push(item);
                        break;

                    case WALL:
                        var wall = Object.create(spriteObject);
                        wall.sourceX = tileSheetX;
                        wall.sourceY = tileSheetY;
                        wall.x = column * SIZE;
                        wall.y = row * SIZE;
                        sprites.push(wall);
                        break;
                }
            }
        }
    }
}

function render() {
    drawingSurface.clearRect(0, 0, mainStage.width, mainStage.height);


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
}