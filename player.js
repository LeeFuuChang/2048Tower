class Player {
    constructor(){
        this.reset();
    }

    reset(){
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
        this.enemies = [];
        this.unlocked = 2;

        this.moveStack = [];
        this.movingStage = 0;
        this.movingDirection = new Vec2(0, 0);

        this.addBlock();
        this.addBlock();
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

    isDead(){
        if(rows*columns - this.blocks.length !== 0) return 1;
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

    addBlock(sx, sy){
        if(rows*columns - this.blocks.length === 0) return;
        let x = sx!==undefined?sx:Math.floor(Math.random()*columns);
        let y = sy!==undefined?sy:Math.floor(Math.random()*rows);
        if(this.empty[y][x]){
            this.blocks.push(new Block(x, y, 2));
            this.empty[y][x] = false;
        }else{
            this.addBlock();
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
                            this.unlocked = max(this.unlocked, tempRows[r][c].number);
                            this.blocks.splice(this.blocks.indexOf(tempRows[r][c-1]), 1);
                            c--;
                        }
                    }
                }else{
                    for(let c=0; c<rcount-1; c++){
                        if(tempRows[r][c].number === tempRows[r][c+1].number){
                            tempRows[r][c].number *= 2;
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
                            this.unlocked = max(this.unlocked, tempCols[c][r].number);
                            this.blocks.splice(this.blocks.indexOf(tempCols[c][r-1]), 1);
                            r--;
                        }
                    }
                }else{
                    for(let r=0; r<ccount-1; r++){
                        if(tempCols[c][r].number === tempCols[c][r+1].number){
                            tempCols[c][r].number *= 2;
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

    update(){
        if(this.movingStage === 0){
            if(this.moveStack.length !== 0){
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
            this.enemies.push(new Enemy(0.1, this.unlocked*(rows+columns), enemyDamage));
        }

        this.enemies.sort((a, b)=>(b.progress-a.progress));
        for(let i=0; i<this.enemies.length; i++){
            if(this.enemies[i].health <= 0){
                this.enemies.splice(i, 1);
                i--; continue;
            }
            this.enemies[i].update();
            if(this.enemies[i].progress >= 100){
                this.health -= this.enemies[i].damage;
                console.log(this.health);
                this.enemies.splice(i, 1);
                i--; continue;
            }
        }

        for(let block of this.blocks){
            block.update();
            if(block.shootCounter > block.shootDelay){
                block.shootCounter = 0;
                this.bullets.push(new Bullet(bulletSpeed, block));
            }
        }

        for(let i=0; i<this.bullets.length; i++){
            this.bullets[i].setTarget(this.enemies[0]);
            this.bullets[i].update();
            if(this.bullets[i].getDistanceToTarget() < this.bullets[i].speed){
                this.bullets[i].dealDamage();
                this.bullets.splice(i, 1);
                i--; continue;
            }
        }
    }

    draw(){
        let x = (windowWidth-boardWidth)/2;
        let y = (windowHeight-boardHeight)/2;
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
        rect(x, y, boardWidth, boardHeight, blockSize/4);
        for(let block of this.blocks) block.draw();
        for(let enemy of this.enemies) enemy.draw();
        for(let bullet of this.bullets) bullet.draw();
    }
}