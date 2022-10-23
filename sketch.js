const playerMaxHealth = 100;

const miniumSwipeDistance = 20;
const blockSpeed = 50;
const bulletSpeed = 50;
const enemyDamage = 10;

const boardBackgroundColor = [187, 173, 160];
const pathBackgroundColor = [0, 0, 0];
const enemyColor = [255, 24, 103];

const typesOfBlocks = [
  {number:   2, bg:[238, 228, 218], fg:[119, 110, 101], shootDelay:66},
  {number:   4, bg:[237, 224, 200], fg:[119, 110, 101], shootDelay:60},
  {number:   8, bg:[242, 177, 121], fg:[249, 246, 242], shootDelay:54},
  {number:  16, bg:[245, 149,  99], fg:[249, 246, 242], shootDelay:48},
  {number:  32, bg:[246, 124,  95], fg:[249, 246, 242], shootDelay:42},
  {number:  64, bg:[246,  94,  59], fg:[249, 246, 242], shootDelay:36},
  {number: 128, bg:[237, 207, 114], fg:[249, 246, 242], shootDelay:30},
  {number: 256, bg:[237, 204,  97], fg:[249, 246, 242], shootDelay:24},
  {number: 512, bg:[237, 200,  80], fg:[249, 246, 242], shootDelay:18},
  {number:1024, bg:[237, 197,  63], fg:[249, 246, 242], shootDelay:12},
  {number:2048, bg:[237, 194,  46], fg:[249, 246, 242], shootDelay: 6},
];

let boardWidth, boardHeight, blockSize, enemySize, columns, rows, player;

function setup() {
  columns = 4;
  rows = 4;

  blockSize = min((windowWidth/2)/columns, (windowHeight/2)/rows);
  enemySize = blockSize/3;
  boardWidth = blockSize * (columns+1);
  boardHeight = blockSize * (rows+1);
  createCanvas(windowWidth, windowHeight);

  frameRate(60);

  player = new Player();
}

function draw() {
  noStroke();
  background(220);

  player.update();
  player.draw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  blockSize = min((windowWidth/2)/columns, (windowHeight/2)/rows);
  enemySize = blockSize/3;
  boardWidth = blockSize * (columns+1);
  boardHeight = blockSize * (rows+1);
}

function mousePressed() {
  if(
    mouseX >= (windowWidth-boardWidth)/2 &&
    mouseX <= (windowWidth+boardWidth)/2 &&
    mouseY >= (windowHeight-boardHeight)/2 &&
    mouseY <= (windowHeight+boardHeight)/2
  ){
    pressX = mouseX;
    pressY = mouseY;
  }else{
    pressX = -1;
    pressY = -1;
  }
}

function mouseReleased(){
  dx = mouseX - pressX;
  dy = mouseY - pressY;
  if(
    pressX >= 0 && pressY >= 0 && 
    (Math.abs(dx) >= miniumSwipeDistance ||
    Math.abs(dy) >= miniumSwipeDistance)
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
  }
  
}

function keyReleased() {
  switch (key) {
    default:
      console.log(key);
  }
}

function dist(x1, y1, x2, y2){
  return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
}