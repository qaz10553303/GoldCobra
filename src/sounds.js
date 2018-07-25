let JumpSFX= new Audio();
let PowerupSFX = new Audio();
let DeathSFX= new Audio();
let DashSFX= new Audio();
let FallSFX= new Audio();
let BreakSFX= new Audio();
let HealSFX= new Audio();
let ShootSFX= new Audio();
let SlimeSFX= new Audio();
let BirdSFX= new Audio();
let LevelTheme= new Audio();




JumpSFX.src = "sounds/Jump.wav";
PowerupSFX.src = "sounds/Poweup.wav";
DeathSFX.src = "sounds/Death.wav";
DashSFX.src = "sounds/Dash.wav";
FallSFX.src = "sounds/Fall.wav";
BreakSFX.src = "sounds/Break.wav";
HealSFX.src = "sounds/Heal.wav";
ShootSFX.src = "sounds/Shoot.wav";
SlimeSFX.src = "sounds/Slime.wav";
BirdSFX.src = "sounds/Bird.mp3";
LevelTheme.src = "sounds/Level.mp3";
LevelTheme.loop = true;

let PowerUpImage = new Image();//PowerUp graphics 
let tilesImage = new Image();//background and enemy elements
let characterImage = new Image();//character sprites
let heartImage = new Image();//used for health meter and health pickup
let explosionImage = new Image();//used for explosions when character projectiles die



explosionImage.src = "data/explosion.png";
PowerUpImage.src = "data/spriteSheet.png";
heartImage.src = "data/hearts.png";
characterImage.src = "data/characters.png";
tilesImage.src = "data/MainSpriteSheet.png";