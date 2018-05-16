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

/*
//Sample 2D map array system
var mapArray = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,1,1,1,0,1,1,1,0,1,0,1,1,1,1,1],
    [1,1,1,1,0,1,1,1,0,1,0,0,0,0,0,1],
    [1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1]
];
const WALL = 1;
var SIZE = 50;
var EMPTY = 0;
var BLOCK = 1;
var ROWS = mapArray.length;
var COLUMNS = mapArray[0].length;
var tilesheetColumns = 1;
*/

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

animate();

function animate()
{
    drawingSurface.clearRect(0,0,mainStage.width,mainStage.height); //clearing the canvas to update the movement each time animate called
    renderRect();
    moveRect();
    requestAnimationFrame(animate);
}