class Player {
    constructor(){
        this.reset();
    }

    reset(){
        this.waiting = true;

        this.swappingArea = new SwappingArea();

        this.health = playerMaxHealth;

        this.empty = [];
        for(let r=0; r<rows; r++){
            this.empty.push([]);
            for(let c=0; c<columns; c++){
                this.empty[r].push(true);
            }
        }
        this.blocks = [];
        this.bullets = [];
        this.enemyWave = null;

        this.unlocked = typesOfBlocks.reduce((a, b)=>a.number<b.number?a:b).number;
        this.damageDealt = 0;
        this.enemyKilled = 0;
        this.addedNumber = 0;
        this.blockDamageDealt = [...Array(typesOfBlocks.length)];

        this.minNumber = this.unlocked;
        for(let type of typesOfBlocks) this.blockDamageDealt[log(type.number, this.minNumber)-1] = 0;

        this.moveStack = [];
        this.movingStage = 0;
        this.movingDirection = new Vec2(0, 0);

        this.addBlock();
        this.addBlock();
    }

    getResult(){
        return {
            enemyKilled: this.enemyKilled,
            damageDealt: this.damageDealt,
            blockDamage: this.blockDamageDealt,
            minNumber  : this.minNumber,
            maxNumber  : this.unlocked,
            addedNumber: this.addedNumber,
            victory    : this.checkWon()
        }
    }

    checkEmptyPositions(){
        for(let r=0; r<rows; r++){
            this.empty.push([]);
            for(let c=0; c<columns; c++){
                this.empty[r][c] = true;
            }
        }
        for(let block of this.blocks) this.empty[block.boardPos.y][block.boardPos.x] = false;
    }

    checkWon(){
        return this.unlocked === typesOfBlocks.reduce((a, b)=>a.number>b.number?a:b).number;
    }

    checkDead(){
        if(this.health <= 0) return true;
        if(rows*columns - this.blocks.length !== 0) return false;
        for(let i=0; i<rows*columns; i++){
            for(let j=i; j<rows*columns; j++){
                if(this.blocks[i].number !== this.blocks[j].number) continue;
                if(dist(
                    this.blocks[i].boardPos.x,
                    this.blocks[i].boardPos.y,
                    this.blocks[j].boardPos.x,
                    this.blocks[j].boardPos.y,
                ) === 1) return false;
            }
        }
        return true;
    }

    addBlock(sx, sy, number){
        if(rows*columns - this.blocks.length === 0) return;
        let x = sx!==undefined?sx:Math.floor(Math.random()*columns);
        let y = sy!==undefined?sy:Math.floor(Math.random()*rows);
        let n = number!==undefined?number:2;
        if(this.empty[y][x]){
            this.blocks.push(new Block(x, y, n));
            this.empty[y][x] = false;
        }else{
            this.addBlock(sx, sy, number);
        }
    }

    addCollidedBlocks(){
        if(this.movingDirection.x !== 0){
            let tempRows = [];
            for(let r=0; r<rows; r++) tempRows.push([]);
            for(let block of this.blocks) tempRows[block.boardPos.y].push(block);
            for(let r=0; r<rows; r++){
                let rcount = tempRows[r].length;
                tempRows[r].sort((a, b)=> a.boardPos.x-b.boardPos.x);
                if(this.movingDirection.x === 1){
                    for(let c=rcount-1; c>0; c--){
                        if(tempRows[r][c].number === tempRows[r][c-1].number){
                            tempRows[r][c].number *= 2;
                            this.addedNumber += tempRows[r][c].number;
                            this.unlocked = max(this.unlocked, tempRows[r][c].number);
                            this.blocks.splice(this.blocks.indexOf(tempRows[r][c-1]), 1);
                            c--;
                        }
                    }
                }else{
                    for(let c=0; c<rcount-1; c++){
                        if(tempRows[r][c].number === tempRows[r][c+1].number){
                            tempRows[r][c].number *= 2;
                            this.addedNumber += tempRows[r][c].number;
                            this.unlocked = max(this.unlocked, tempRows[r][c].number);
                            this.blocks.splice(this.blocks.indexOf(tempRows[r][c+1]), 1);
                            c++;
                        }
                    }
                }
            }
        }else if(this.movingDirection.y !== 0){
            let tempCols = [];
            for(let c=0; c<columns; c++) tempCols.push([]);
            for(let block of this.blocks) tempCols[block.boardPos.x].push(block);
            for(let c=0; c<columns; c++){
                let ccount = tempCols[c].length;
                tempCols[c].sort((a, b)=> a.boardPos.y-b.boardPos.y);
                if(this.movingDirection.y === 1){
                    for(let r=ccount-1; r>0; r--){
                        if(tempCols[c][r].number === tempCols[c][r-1].number){
                            tempCols[c][r].number *= 2;
                            this.addedNumber += tempCols[c][r].number;
                            this.unlocked = max(this.unlocked, tempCols[c][r].number);
                            this.blocks.splice(this.blocks.indexOf(tempCols[c][r-1]), 1);
                            r--;
                        }
                    }
                }else{
                    for(let r=0; r<ccount-1; r++){
                        if(tempCols[c][r].number === tempCols[c][r+1].number){
                            tempCols[c][r].number *= 2;
                            this.addedNumber += tempCols[c][r].number;
                            this.unlocked = max(this.unlocked, tempCols[c][r].number);
                            this.blocks.splice(this.blocks.indexOf(tempCols[c][r+1]), 1);
                            r++;
                        }
                    }
                }
            }
        }

    }

    doneMoving(){
        for(let block of this.blocks){
            if(block.isMoving()){
                return false;
            }
        }
        return true;
    }

    preCalculateMove(){
        if(this.movingDirection.x !== 0){
            let tempRows = [];
            for(let r=0; r<rows; r++) tempRows.push([]);
            for(let block of this.blocks) tempRows[block.boardPos.y].push(block);
            for(let r=0; r<rows; r++){
                let rcount = tempRows[r].length;
                tempRows[r].sort((a, b)=> a.boardPos.x-b.boardPos.x);
                for(let c=0; c<rcount; c++){
                    tempRows[r][c].boardPosTo.x = (columns-rcount)*(
                        this.movingDirection.x === 1)+c;
                    tempRows[r][c].boardPosTo.y = tempRows[r][c].boardPos.y;
                    tempRows[r][c].calculatePositions();
                }
            }
        }else if(this.movingDirection.y !== 0){
            let tempCols = [];
            for(let c=0; c<columns; c++) tempCols.push([]);
            for(let block of this.blocks) tempCols[block.boardPos.x].push(block);
            for(let c=0; c<columns; c++){
                let ccount = tempCols[c].length;
                tempCols[c].sort((a, b)=> a.boardPos.y-b.boardPos.y);
                for(let r=0; r<ccount; r++){
                    tempCols[c][r].boardPosTo.x = tempCols[c][r].boardPos.x;
                    tempCols[c][r].boardPosTo.y = (rows-ccount)*(
                        this.movingDirection.y === 1)+r;
                    tempCols[c][r].calculatePositions();
                }
            }
        }
    }

    pressedAt(mx, my){
        let clicked;
        for(let block of this.blocks){
            if(!block.pointCollided(mx, my)) continue;
            clicked = block;
        }
        if(!clicked) return;
        if(this.swappingArea.active && this.swappingArea.toggledNumber !== 0){
            clicked.setNumber(this.swappingArea.toggledNumber);
            this.swappingArea.deactivate();
        }
    }

    pointOnBoard(px, py){
        let x = (canvasWidth-boardWidth)/2;
        let y = (canvasHeight-boardHeight)/2;
        return (
            px >= x && py >= y &&
            px <= x+boardWidth && 
            py <= y+boardHeight
        )
    }

    pointOnSwappingArea(px, py){
        return this.swappingArea.pointOnSwappingArea(px, py);
    }

    sendEnemyWave(){
        let amount = 20, delay = 30;
        let speed = enemySpeed;
        this.enemyWave = new EnemyWave(this, 20, 30);
        let attackDuration = 100/speed + amount*delay;
        let type = typesOfBlocks[0];
        for(type of typesOfBlocks) if(this.unlocked === type.number) break;
        let totalEnemyHealth = (attackDuration/type.shootDelay)*type.number;
        let enemyHealthRD = Math.random()+1;
        totalEnemyHealth *= enemyHealthRD*2;
        let enemyHealth = Math.floor(totalEnemyHealth/amount);
        this.enemyWave.setEnemyHealth(enemyHealth);
    }

    update(){
        if(!this.swappingArea.active && !(this.checkDead()||this.checkWon())){
            if(this.movingStage === 0){
                if(this.moveStack.length !== 0){
                    if(this.waiting){
                        this.sendEnemyWave();
                        this.waiting = false;
                    }
                    this.movingDirection = this.moveStack[0];
                    this.addCollidedBlocks();
                    this.preCalculateMove();
                    this.movingStage = 1;
                }
            }else if(this.movingStage === 1 && this.doneMoving()){
                this.moveStack = this.moveStack.slice(1);
                this.movingStage = 0;
                this.checkEmptyPositions();
                this.addBlock();
                this.addBlock();
            }

            if(this.enemyWave) this.enemyWave.update();

            for(let block of this.blocks){
                block.update();
                block.shootCounter += 1;
                if(block.shootCounter > block.shootDelay){
                    block.shootCounter = 0;
                    this.bullets.push(new Bullet(bulletSpeed, block));
                }
            }

            if(this.enemyWave){
                for(let i=0; i<this.bullets.length; i++){
                    if(this.enemyWave.isCleared()){
                        this.bullets.splice(0, this.bullets.length);
                        break;
                    }
                    this.bullets[i].setTarget(this.enemyWave.getFirst());
                    this.bullets[i].update();
                    if(this.bullets[i].getDistanceToTarget() < this.bullets[i].speed){
                        if(this.bullets[i].dealDamage()){
                            this.enemyKilled += (this.bullets[i].target.health <= 0);
                            this.damageDealt += this.bullets[i].damage;
                            this.blockDamageDealt[log(this.bullets[i].parentNumber, this.minNumber)-1] += this.bullets[i].damage;
                        }
                        this.bullets.splice(i, 1);
                        i--; continue;
                    }
                }
                if(this.enemyWave.isCleared()){
                    this.enemyWave = null;
                    this.swappingArea.activate();
                    this.waiting = true;
                }
            } else this.bullets.splice(0, this.bullets.length);
        }else{
            this.moveStack = [];
            this.movingStage = 0;
            this.bullets = [];
            this.enemyWave = null;
            for(let block of this.blocks) block.update();
        }

        this.swappingArea.setUnlocked(this.unlocked);

        if(this.checkDead() || this.checkWon()) return GAME_ENDED_CODE;
    }

    draw(){
        let x = (canvasWidth-boardWidth)/2;
        let y = (canvasHeight-boardHeight)/2;
        let pathSpace = blockSize/2;
        let thickness = pathSpace/10;

        noStroke();

        // path
        fill(pathBackgroundColor);
        rect(x-pathSpace, y-pathSpace, thickness, boardHeight+pathSpace);
        rect(x-pathSpace, y-pathSpace, boardWidth+pathSpace+pathSpace, thickness);
        rect(x+pathSpace+boardWidth, y-pathSpace, thickness, boardHeight+pathSpace);

        // board
        fill(boardBackgroundColor);
        rect(x, y, boardWidth, boardHeight, blockSize/6);
        for(let block of this.blocks){
            block.draw();
            if(this.swappingArea.active){
                block.showBorder([57, 57, 57], 4);
            }
        }

        if(this.enemyWave) this.enemyWave.draw();

        for(let bullet of this.bullets) bullet.draw();

        // health ui
        noStroke();
        let barWidth = min(canvasWidth, canvasHeight);
        let barHeight = blockSize/3;
        fill(healthBackgroundColor);
        rect((canvasWidth-barWidth)/2, 0, barWidth, barHeight);
        fill(healthBarColor);
        rect((canvasWidth-barWidth)/2, 0, barWidth*(this.health/playerMaxHealth), barHeight);
        fill(healthTextColor);
        textAlign(CENTER, CENTER);
        textSize(barHeight*0.8);
        text(this.health, barWidth/2, barHeight/2);

        // swapping area ui
        this.swappingArea.draw()
    }
}