function setTileList() //really belongs in objects file but is here for refernece while building levels
{
    tileList.push(tileInfo(0,0,256,32,0)); //skyTop top 0
    tileList.push(tileInfo(0,32,256,32,0)); //skyTop mid 1
    tileList.push(tileInfo(0,64,256,32,0)); //skyTop bot 2
    tileList.push(tileInfo(0,96,256,32,0)); //skyMid top 3
    tileList.push(tileInfo(0,128,256,32,0)); //skyMid mid 4
    tileList.push(tileInfo(0,160,256,32,0)); //skyMid bot 5
    tileList.push(tileInfo(0,198,256,26,0)); //skyBot top 6
    tileList.push(tileInfo(96,656,48,48,0)); //treeTop 7
    tileList.push(tileInfo(192,656,16,24,0)); //treeTrunk 8
    tileList.push(tileInfo(186,656+24,32,24,0)); //treeBase 9
    tileList.push(tileInfo(-100,0,10,5000,1)); //verticalBlocker Wall 10
    tileList.push(tileInfo(0,-100,5000,10,1)); //horisontalBlocker Wall 11
    tileList.push(tileInfo(0,-100,5000,10,2)); //horisontalDeathPlane 12
    tileList.push(tileInfo(0,688,16,16,1)); //grassTop left 13
    tileList.push(tileInfo(16,688,16,16,1)); //grassTop Middle 14
    tileList.push(tileInfo(32,688,16,16,1)); //grassTop right 15
    tileList.push(tileInfo(48,688,16,16,1)); //grassTop single 16
    tileList.push(tileInfo(0,672,16,16,1)); //grassFloat left 17
    tileList.push(tileInfo(16,672,16,16,1)); //grassFloat Middle 18
    tileList.push(tileInfo(32,672,16,16,1)); //grassFloat right 19
    tileList.push(tileInfo(48,672,16,16,1)); //grassFloat single 20
    tileList.push(tileInfo(0,747,16,16,1)); //ground left 21
    tileList.push(tileInfo(16,747,16,16,2)); //ground Middle 22
    tileList.push(tileInfo(32,747,16,16,1)); //ground right 23
    tileList.push(tileInfo(48,747,16,16,1)); //ground single 24
    tileList.push(tileInfo(80,672,16,32,0)); //sunflower 25
    tileList.push(tileInfo(64,672,16,16,0)); //smallBlue flower 26
    tileList.push(tileInfo(64,688,16,16,0)); //smallpink flower27
    tileList.push(tileInfo(81,495,14,32,0)); //vines 28
    tileList.push(tileInfo(128,704,32,16,0)); //rocks 29
    tileList.push(tileInfo(0,592,16,16,1)); //castleMid left 30
    tileList.push(tileInfo(16,592,16,16,1)); //castleMid Middle 31
    tileList.push(tileInfo(32,592,16,16,1)); //castleMid right 32
    tileList.push(tileInfo(48,592,16,16,1)); //castleMid single 33
    tileList.push(tileInfo(64,624,32,32,0)); //castleBack light 34
    tileList.push(tileInfo(174,243,10,10,-1)); //enemy Blocker 35
    tileList.push(tileInfo(112,624,16,16,0)); //torch 36
    tileList.push(tileInfo(96,624,16,32,0)); //castleBack dark 37
    tileList.push(tileInfo(64,592,60,32,0)); //castleBack holes1 38
    tileList.push(tileInfo(124,592,68,32,0)); //castleBack holes2 39
    tileList.push(tileInfo(192,752,16,32,0)); //ladder visual 40
    tileList.push(tileInfo(174,243,1,10,3)); //ladder climbable 41
    tileList.push(tileInfo(193,736,16,16,0)); //rope visual 41

}

levelPreventSpawn=[false,false,false,false,false]

function level0()
{
    let obj = {};
    obj.static = [];
    obj.active = [];
    obj.maxCamera = [810,1000];
    
    sky(obj);
    levelBorders(obj);

    tree(obj,506,735);
    tree(obj,200,800);
    obj.static.push(returnTile(30,926,26)); //blue flower
    obj.static.push(returnTile(100,926,26)); //blue flower
    obj.static.push(returnTile(50,926,26)); //blue flower
    obj.static.push(returnTile(110,926,26)); //blue flower
    obj.static.push(returnTile(230,926,26)); //blue flower
    obj.static.push(returnTile(190,926,26)); //blue flower
    obj.static.push(returnTile(250,926,26)); //blue flower
    obj.static.push(returnTile(30,925,27)); //pink flower
    obj.static.push(returnTile(170,925,27)); //pink flower
    obj.static.push(returnTile(140,925,27)); //pink flower
    obj.static.push(returnTile(200,895,25)); //sunflower


    ground(obj,-10,958,11);
    platform(obj,0,690,4,17);
    ground(obj,525,894,2);
    platform(obj,630,850,6,17);
    ground(obj,730,958,4);
    platform(obj,220,550,11,17);
    platform(obj,620,480,7,17);

    
    obj.static.push(returnTile(200,530,35)); //enemy blocker
    obj.static.push(returnTile(573,530,35)); // enemy blocker


    obj.static.push(returnTile(15,700,28)); //vine
    obj.static.push(returnTile(70,700,28)); //vine
    obj.static.push(returnTile(230,550,28)); //vine
    obj.static.push(returnTile(380,550,28)); //vine
    obj.static.push(returnTile(430,550,28)); //vine
    obj.static.push(returnTile(500,550,28)); //vine
    obj.static.push(returnTile(650,480,28)); //vine
    obj.static.push(returnTile(780,480,28)); //vine


    if(!levelPreventSpawn[0])
        obj.active.push(shootPowerUp(45,660,0));

    obj.active.push(movingPlatform(380,800,2,17,380,950));
    obj.active.push(slime(380, 518));

    obj.active.push(fallingPlatform(155, 615,110,1));
    //obj.active.push(fallingPlatform(135, 645,110,1));

    if(!levelPreventSpawn[1])
        obj.active.push(healthPickup(710,920,1));

    obj.active.push(door(800,750,10,100,1,10,805)); //door to level 1
    obj.active.push(door(800,875,10,100,1,10,915)); //door to level 1
    obj.active.push(door(800,380,10,100,1,10,430)); //door to level 1

    return obj;
}

function level1()
{
    let obj = {};
    obj.static = [];
    obj.active = [];
    obj.maxCamera = [2000,1000];
    
    sky(obj);
    levelBorders(obj);
    castleBackLight(obj,1650,429,7,2);
    castleBackHoles(obj,1650,173,2,4);
    castleBackDark(obj,1644,536,14,10);

    
    tree(obj,320,800);
    tree(obj,870,620);

    obj.static.push(returnTile(30,825,27)); //pink flower
    obj.static.push(returnTile(70,825,27)); //pink flower
    obj.static.push(returnTile(140,825,27)); //pink flower
    obj.static.push(returnTile(120,925,26)); //blue flower
    obj.static.push(returnTile(450,925,27)); //pink flower
    obj.static.push(returnTile(460,925,26)); //blue flower
    obj.static.push(returnTile(420,925,26)); //pink flower
    obj.static.push(returnTile(1000,753,29)); //rock
    obj.static.push(returnTile(1335,703,29)); //rock




    ground(obj,240,885,1);
    platform(obj,-10,850,6,17);
    ground(obj,-10,958,18);
    platform(obj,-10,480,4,17);
    ground(obj,800,785,10);
    ground(obj,1318,735,10);
    platform(obj,1000,405,5,17);
    platform(obj,590,415,11,17);
    castle(obj,1637,735,12,9);
    castle(obj,1637,170,2,15);
    castle(obj,1637,505,12,1);
    castle(obj,1860,330,5,1);
    castle(obj,1637,108,12,2);
    castle(obj,1637,44,2,2);
    castle(obj,1733,44,2,2);
    castle(obj,1829,44,2,2);
    castle(obj,1925,44,2,2);




    obj.static.push(returnTile(1050,405,28)); //vine
    obj.static.push(returnTile(1130,405,28)); //vine
    obj.static.push(returnTile(680,415,28)); //vine
    obj.static.push(returnTile(750,415,28)); //vine
    obj.static.push(returnTile(830,415,28)); //vine
    obj.static.push(returnTile(30,480,28)); //vine
    obj.static.push(returnTile(1765,600,36)); //torch
    obj.static.push(returnTile(1890,600,36)); //torch


    obj.active.push(movingPlatform(600,950,2,17,690,785));
    obj.active.push(movingPlatform(1468,700,2,17,1468,470));
    obj.active.push(movingPlatform(1701,330,3,30,1701,470));

    obj.active.push(fallingPlatform(1150,775,110,1));
    obj.active.push(fallingPlatform(1250,745,110,1));
    obj.active.push(fallingPlatform(1400,475,110,1));
    obj.active.push(fallingPlatform(1310,455,110,1));
    obj.active.push(fallingPlatform(1220,435,110,1));
    obj.active.push(fallingPlatform(180,465,110,1));
    obj.active.push(fallingPlatform(270,455,110,1));
    obj.active.push(fallingPlatform(360,445,110,1));
    obj.active.push(fallingPlatform(450,435,110,1));
    obj.active.push(fallingPlatform(540,425,110,1));

    
    obj.static.push(returnTile(570,195,35)); //enemy blocker
    obj.static.push(returnTile(945,195,35)); // enemy blocker

    obj.static.push(returnTile(780,765,35)); //enemy blocker
    obj.static.push(returnTile(1113,765,35)); // enemy blocker

    
    obj.active.push(bird(600,183));
    obj.active.push(slime(900,753));

    if(!levelPreventSpawn[2])
        obj.active.push(breakable(70,862,2));
    if(!levelPreventSpawn[3])
        obj.active.push(breakable(1700,640,3));

    
    obj.active.push(door(0,750,10,100,0,770,805)); //door to level 0
    obj.active.push(door(0,875,10,100,0,770,915)); //door to level 0
    obj.active.push(door(0,380,10,100,0,770,430)); //door to level 0
    obj.active.push(door(1990,630,10,100,2,15,689)); //door to level 2
    obj.active.push(door(1990,405,10,100,2,15,458)); //door to level 2
    obj.active.push(door(1990,230,10,100,2,15,282)); //door to level 2
    return obj;
}

function level2() 
{
    let obj = {};
    obj.static = [];
    obj.active = [];
    obj.maxCamera = [1000, 1000];

    sky(obj);
    levelBorders(obj);
    castleBackLight(obj,0,429,17,2);
    castleBackHoles(obj,0,173,4,4);
    castleBackDark(obj,0,536,34,10);
    
    castle(obj,-10,735,5,9);
    castle(obj,-10,505,27,1);
    castle(obj,148,975,27,1);
    castle(obj,-10,330,5,1);
    castle(obj,300,537,1,8);
    castle(obj,300,794,10,1);
    castle(obj,786,700,1,10);
    castle(obj,400,700,16,1);
    castle(obj,978,330,1,18);
    castle(obj, 690, 330, 10, 1);
    castle(obj,-10,108,3,2);
    castle(obj, 85, 140, 8, 1);
    castle(obj, 10, 173, 32, 1);

    ladder(obj,148,778,3,1); //wood ladder
    ladder(obj,910,361,18,2); //climable rope
    ladder(obj,347,535,6,2); //climable rope
    obj.static.push(returnTile(194,600,36)); //torch
    obj.static.push(returnTile(80,600,36)); //torch
    obj.static.push(returnTile(230,850,36)); //torch
    obj.static.push(returnTile(350,850,36)); //torch
    obj.static.push(returnTile(470,850,36)); //torch
    obj.static.push(returnTile(745,750,36)); //torch
    obj.static.push(returnTile(450,600,36)); //torch
    obj.static.push(returnTile(590,600,36)); //torch
    obj.static.push(returnTile(730,600,36)); //torch
    obj.static.push(returnTile(850,850,36)); //torch



    obj.static.push(returnTile(130,950,35)); //enemy blocker
    obj.static.push(returnTile(786,950,35)); // enemy blocker
    obj.static.push(returnTile(312,768,35)); //enemy blocker
    obj.static.push(returnTile(618,768,35)); // enemy blocker

    obj.active.push(slime(160,943));
    obj.active.push(slime(640,943));
    obj.active.push(slime(400,763));
    
    obj.static.push(returnTile(840,350,35)); //enemy blocker
    obj.static.push(returnTile(240,350,35)); // enemy blocker

    obj.active.push(bird(600,338));

    obj.active.push(movingPlatform(650,915,3,30,650,794));

    for(let i = 0;i<14;i++)
        obj.active.push(fallingPlatform(170+(i*32),330,30,2));

    if(!levelPreventSpawn[4])
        obj.active.push(breakable(973,880,4));

    obj.active.push(door(0,630,10,100,1,1954,689)); //door to level 1
    obj.active.push(door(0,405,10,100,1,1954,455)); //door to level 1
    obj.active.push(door(0, 230, 10, 100, 1, 1954, 282)); //door to level 1
    obj.active.push(door(990, 230, 10, 100, 3, 15, 282)); //door to level 3
    return obj;
}

function level3() {
    let obj = {};
    obj.static = [];
    obj.active = [];
    obj.maxCamera = [1000, 1000];

    sky(obj);
    levelBorders(obj);
    castleBackLight(obj, 0, 429, 17, 2);
    castleBackHoles(obj, 0, 173, 4, 4);
    castleBackDark(obj, 0, 536, 34, 10);

    castle(obj, -10, 735, 5, 9);
    castle(obj, -10, 505, 27, 1);
    castle(obj, 148, 975, 27, 1);
    castle(obj, -10, 330, 5, 1);
    castle(obj, 300, 537, 1, 8);
    castle(obj, 300, 794, 10, 1);
    castle(obj, 786, 700, 1, 10);
    castle(obj, 400, 700, 16, 1);
    castle(obj, 978, 330, 1, 18);
    castle(obj, 690, 330, 10, 1);
    castle(obj, -10, 108, 3, 2);
    castle(obj, 85, 140, 8, 1);
    castle(obj, 10, 173, 32, 1);

    ladder(obj, 148, 778, 3, 1); //wood ladder
    ladder(obj, 910, 361, 18, 2); //climable rope
    ladder(obj, 347, 535, 6, 2); //climable rope
    obj.static.push(returnTile(194, 600, 36)); //torch
    obj.static.push(returnTile(80, 600, 36)); //torch
    obj.static.push(returnTile(230, 850, 36)); //torch
    obj.static.push(returnTile(350, 850, 36)); //torch
    obj.static.push(returnTile(470, 850, 36)); //torch
    obj.static.push(returnTile(745, 750, 36)); //torch
    obj.static.push(returnTile(450, 600, 36)); //torch
    obj.static.push(returnTile(590, 600, 36)); //torch
    obj.static.push(returnTile(730, 600, 36)); //torch
    obj.static.push(returnTile(850, 850, 36)); //torch



    obj.static.push(returnTile(130, 950, 35)); //enemy blocker
    obj.static.push(returnTile(786, 950, 35)); // enemy blocker
    obj.static.push(returnTile(312, 768, 35)); //enemy blocker
    obj.static.push(returnTile(618, 768, 35)); // enemy blocker

    obj.active.push(slime(160, 943));
    obj.active.push(slime(640, 943));
    obj.active.push(slime(400, 763));

    obj.static.push(returnTile(840, 350, 35)); //enemy blocker
    obj.static.push(returnTile(240, 350, 35)); // enemy blocker

    obj.active.push(bird(600, 338));

    obj.active.push(movingPlatform(650, 915, 3, 30, 650, 794));

    for (let i = 0; i < 14; i++)
        obj.active.push(fallingPlatform(170 + (i * 32), 330, 30, 2));

    if (!levelPreventSpawn[4])
        obj.active.push(breakable(973, 880, 4));

    //obj.active.push(door(0, 630, 10, 100, 2, 1954, 689)); //door to level 1
    //obj.active.push(door(0, 405, 10, 100, 2, 1954, 455)); //door to level 1
    obj.active.push(door(0, 230, 10, 100, 2, 1954, 282)); //door to level 2
    //obj.active.push(door(990, 230, 10, 100, 2, 15, 282)); //door to level 2//next level door
    return obj;
}