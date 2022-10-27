const GAME_START_CODE = 0;
const GAME_ENDED_CODE = 1;

const playerMaxHealth = 100;

const miniumSwipeDistance = 20;
const blockSpeed = 50;
const bulletSpeed = 50;
const enemyHealthIncreaseRate = 0.5;
const enemyDamage = 10;
const enemySpeed = 0.1;

const bestBlockBackgroundColor = [234, 234, 11];
const resultBannerColor = [204, 18, 1];
const victoryTextColor = [253, 255, 11];
const victoryStrokeColor = [106, 7, 4];
const gameOverTextColor = [239, 34, 7];
const gameOverStrokeColor = [76, 6, 5];
const continueButtonColor = [15, 210, 70];
const resultCardTextColor = [136, 254, 18];
const resultCardStrokeColor = [95, 142, 213];
const resultCardBackgroundColor = [62, 96, 140];
const healthBackgroundColor = [105, 105, 105];
const healthTextColor = [255, 255, 255];
const healthBarColor = [63, 118, 29];
const boardBackgroundColor = [187, 173, 160];
const pathBackgroundColor = [0, 0, 0];
const enemyColor = [255, 24, 103];
const swappingAreaToggledColor = [255, 24, 103];

const typesOfBlocks = [
  {number:   2, fontSizeMultiplier:0.55, bg:[238, 228, 218], fg:[119, 110, 101], shootDelay: 6},
  {number:   4, fontSizeMultiplier:0.55, bg:[237, 224, 200], fg:[119, 110, 101], shootDelay:12},
  {number:   8, fontSizeMultiplier:0.55, bg:[242, 177, 121], fg:[249, 246, 242], shootDelay:18},
  {number:  16, fontSizeMultiplier:0.50, bg:[245, 149,  99], fg:[249, 246, 242], shootDelay:24},
  {number:  32, fontSizeMultiplier:0.50, bg:[246, 124,  95], fg:[249, 246, 242], shootDelay:30},
  {number:  64, fontSizeMultiplier:0.50, bg:[246,  94,  59], fg:[249, 246, 242], shootDelay:36},
  {number: 128, fontSizeMultiplier:0.45, bg:[237, 207, 114], fg:[249, 246, 242], shootDelay:42},
  {number: 256, fontSizeMultiplier:0.45, bg:[237, 204,  97], fg:[249, 246, 242], shootDelay:48},
  {number: 512, fontSizeMultiplier:0.45, bg:[237, 200,  80], fg:[249, 246, 242], shootDelay:54},
  {number:1024, fontSizeMultiplier:0.40, bg:[237, 197,  63], fg:[249, 246, 242], shootDelay:60},
  {number:2048, fontSizeMultiplier:0.40, bg:[237, 194,  46], fg:[249, 246, 242], shootDelay:66},
];

let canvasWidth, canvasHeight;
let boardWidth, boardHeight;
let blockSize, enemySize, columns, rows, player, currentInterface={update:()=>{}, draw:()=>{}};
let controlling = {
  board: false, swappingArea: false,
  initialX: -1, initialY: -1
}

function setup() {
  columns = 4;
  rows = 4;

  blockSize = min((windowWidth/2)/columns, (windowHeight/2)/rows);
  enemySize = blockSize/3;
  boardWidth = blockSize * (columns+1);
  boardHeight = blockSize * (rows+1);
  canvasWidth = min(windowWidth, windowHeight);
  canvasHeight = windowHeight;
  createCanvas(canvasWidth, windowHeight);

  frameRate(60);
  
  player = new Player();

  currentInterface = new EntryUI(player);
}

function gameStart(){
  currentInterface = player;
  currentInterface.reset();
}

function gameEnded(){
  currentInterface = new ResultUI(player);
}

function draw() {
  noStroke();
  background(220);

  switch(currentInterface.update()){
    case GAME_START_CODE:
      gameStart();
      break;
    case GAME_ENDED_CODE:
      gameEnded();
      break;
  }
  currentInterface.draw();
}

function windowResized(event) {
  canvasWidth = min(windowWidth, windowHeight);
  canvasHeight = windowHeight;
  createCanvas(canvasWidth, windowHeight);
  blockSize = min((windowWidth/2)/columns, (windowHeight/2)/rows);
  enemySize = blockSize/3;
  boardWidth = blockSize * (columns+1);
  boardHeight = blockSize * (rows+1);
}

function mousePressed(event) {
  controlling.interface = currentInterface !== player;
  controlling.board = player.pointOnBoard(mouseX, mouseY) && !controlling.interface;
  controlling.swappingArea = player.pointOnSwappingArea(mouseX, mouseY) && !controlling.interface;
  controlling.initialX = mouseX;
  controlling.initialY = mouseY;
}

function mouseReleased(event){
  dx = mouseX - controlling.initialX;
  dy = mouseY - controlling.initialY;
  if(controlling.interface){
    switch(currentInterface.pressedAt(mouseX, mouseY)){
      case GAME_START_CODE:
        gameStart();
        break;
      case GAME_ENDED_CODE:
        gameEnded();
        break;
    }
  }else if(controlling.board){
    if(
      (Math.abs(dx) >= miniumSwipeDistance ||
      Math.abs(dy) >= miniumSwipeDistance) &&
      !player.swappingArea.active
    ){
      if( Math.abs(dx) >= Math.abs(dy) ){
        dir = Math.sign(dx);
        console.log(dir>0?"往右":"往左");
        player.moveStack.push(new Vec2(dir, 0));
      }else{
        dir = Math.sign(dy);
        console.log(dir>0?"往下":"往上");
        player.moveStack.push(new Vec2(0, dir));
      }
    }else{
      player.pressedAt(mouseX, mouseY);
    }
  }else if(controlling.swappingArea){
    player.swappingArea.setScroll();
    if(
      Math.abs(dx) <= miniumSwipeDistance ||
      Math.abs(dy) <= miniumSwipeDistance
    ){
      player.swappingArea.pressedAt(mouseX, mouseY);
    }
  }
}

function mouseDragged(event){
  dx = mouseX - controlling.initialX;
  dy = mouseY - controlling.initialY;
  if(controlling.swappingArea){
    player.swappingArea.scroll(dx);
  }
}

function keyReleased(event) {
  if(!player.swappingArea.active){
    switch(keyCode){
      case 38:
        player.moveStack.push(new Vec2( 0, -1));
        break;
      case 40:
        player.moveStack.push(new Vec2( 0,  1));
        break;
      case 37:
        player.moveStack.push(new Vec2(-1,  0));
        break;
      case 39:
        player.moveStack.push(new Vec2( 1,  0));
        break;
    }
  }
}

const dist = (x1, y1, x2, y2)=>{
  return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
}

const log = (val, base)=>{
  return Math.log(val) / (base ? Math.log(base) : 1);
}