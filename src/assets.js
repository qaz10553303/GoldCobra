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
let StartSFX= new Audio();
let LevelTheme= new Audio();

JumpSFX.src = "sounds/Jump.mp3";
PowerupSFX.src = "sounds/Poweup.mp3";
DeathSFX.src = "sounds/Death.mp3";
DashSFX.src = "sounds/Dash.mp3";
FallSFX.src = "sounds/Fall.mp3";
BreakSFX.src = "sounds/Break.mp3";
HealSFX.src = "sounds/Heal.mp3";
ShootSFX.src = "sounds/Shoot.mp3";
SlimeSFX.src = "sounds/Slime.mp3";
BirdSFX.src = "sounds/Bird.mp3";
StartSFX.src = "sounds/Start.mp3";
LevelTheme.src = "sounds/Level.mp3";
LevelTheme.loop = true;

let powerUpImage = new Image();//PowerUp graphics 
let tilesImage = new Image();//background and enemy elements
let characterImage = new Image();//character sprites
let heartImage = new Image();//used for health meter and health pickup
let explosionImage = new Image();//used for explosions when character projectiles die

explosionImage.src = "data/explosion.png";
powerUpImage.src = "data/spriteSheet.png";
heartImage.src = "data/hearts.png";
characterImage.src = "data/characters.png";
tilesImage.src = "data/mainSpriteSheet.png";