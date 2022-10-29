class SwappingArea {
    constructor(){
        this.active = false;
        this.prevScrollx = 0;
        this.scrollx = 0;
        this.toggledNumber = 0;
        this.minNumber = typesOfBlocks.reduce(function(a, b) {
            return a.number < b.number ? a : b;
        }).number;
        this.displayMaxNumber = typesOfBlocks.reduce((a, b)=>{
            if(a.isGoal && b.isGoal){
                return a.number<b.number ? a:b;
            }else return a.isGoal?a:b;
        }).number;

        this.unlocked = this.minNumber;
        this.blockTypes = [...Array(typesOfBlocks.length)];
        for(let type of typesOfBlocks){
            let index = log(type.number, this.minNumber)-1;
            this.blockTypes[index] = new Block(index, 0, type.number);
        }
        this.blockTypes.splice(this.blockTypes.length-1, 1);
    }

    pressedAt(mx, my){
        let areaWidth = min(canvasWidth, canvasHeight);
        let padding = (blockSize/2)/(max(columns, rows)-1);
        typesOfBlocks.sort((a, b)=>a.number - b.number);
        for(let i=0; i<typesOfBlocks.length; i++){
            let x1 = -this.scrollx + (canvasWidth-areaWidth)/2 + padding*(i+1) + blockSize*i;
            let y1 = canvasHeight - (padding + blockSize);
            let x2 = -this.scrollx + (canvasWidth-areaWidth)/2 + padding*(i+1) + blockSize*(i+1);
            let y2 = canvasHeight - padding;

            if(x1 <= mx && mx <= x2 && y1 <= my && my <= y2){
                this.toggledNumber = (typesOfBlocks[i].number <= this.unlocked) * typesOfBlocks[i].number;
                break;
            }
        }
    }

    activate(){
        this.active = true;
    }

    deactivate(){
        this.toggledNumber = 0;
        this.prevScrollx = 0;
        this.scrollx = 0;
        this.active = false;
    }

    setScroll(v){
        if(v === undefined){
            this.prevScrollx = this.scrollx;
        }else{
            this.prevScrollx = v;
            this.scrollx = v;
        }
    }

    scroll(v){
        let padding = (blockSize/2)/(max(columns, rows)-1);
        let typeCount = log(this.displayMaxNumber, this.minNumber)-1;
        let widthTaken = blockSize*typeCount + padding*(typeCount-1);
        let maxScroll = widthTaken - canvasWidth+padding*2;
        this.scrollx = this.prevScrollx-v;
        if(this.scrollx < 0 || widthTaken <= canvasWidth-(padding*2)) this.scrollx = 0;
        else if(this.scrollx > maxScroll) this.scrollx = maxScroll;
    }

    setUnlocked(unlocked){
        this.unlocked = unlocked;
        this.displayMaxNumber = max(this.displayMaxNumber, this.unlocked);
    }

    pointOnSwappingArea(px, py){
        let padding = (blockSize/2)/(max(columns, rows)-1);
        return (
            px >= 0 && px <= canvasWidth &&
            py >= canvasHeight-(padding*2 + blockSize) &&
            py <= canvasHeight
        )
    }

    draw(){
        let toggledStrokeWeight = 4;
        let areaWidth = min(canvasWidth, canvasHeight);
        let padding = (blockSize/2)/(max(columns, rows)-1);

        noStroke();

        fill(boardBackgroundColor);
        rect(
            (canvasWidth-areaWidth)/2, canvasHeight-(padding*2 + blockSize), 
            areaWidth, padding*2 + blockSize, 
            blockSize/6, blockSize/6, 0, 0
        );

        for(let i=0; i<this.blockTypes.length; i++){
            if(this.blockTypes[i].number >= this.displayMaxNumber) break;
            this.blockTypes[i].pixelPos.x = -this.scrollx + (canvasWidth-areaWidth)/2 + padding*(i+1) + blockSize*i;
            this.blockTypes[i].pixelPos.y = canvasHeight - (padding + blockSize);
            this.blockTypes[i].draw(1);

            this.blockTypes[i].disabled = this.blockTypes[i].number > this.unlocked;

            if(this.blockTypes[i].number === this.toggledNumber && this.active){
                fill(0, 0);
                stroke(swappingAreaToggledColor);
                strokeWeight(toggledStrokeWeight);
                rect(
                    -this.scrollx + (canvasWidth-areaWidth)/2 + padding*(i+1) + blockSize*i + toggledStrokeWeight/2, 
                    canvasHeight - (padding + blockSize) + toggledStrokeWeight/2, 
                    blockSize-toggledStrokeWeight, blockSize-toggledStrokeWeight, (blockSize/4 - toggledStrokeWeight)/2
                );
            }
        }

        noStroke();
        fill(boardBackgroundColor);
        rect(
            (canvasWidth-areaWidth)/2, canvasHeight-(padding*2 + blockSize), 
            padding, padding*2 + blockSize, 
            padding, 0, 0, 0
        );
        rect(
            (canvasWidth+areaWidth)/2 - padding, canvasHeight-(padding*2 + blockSize), 
            padding, padding*2 + blockSize, 0, padding, 0, 0
        );

        if(!this.active){
            fill(0, 0, 0, 125);
            rect(
                (canvasWidth-areaWidth)/2, canvasHeight-(padding*2 + blockSize), 
                areaWidth, padding*2 + blockSize, 
                padding/2, padding/2, 0, 0
            );
        }
    }
}



class EntryUI {
    constructor(){
        this.fakePlayer = new Player();
        this.fakePlayer.sendEnemyWave();

        this.minGoal = typesOfBlocks.reduce((a, b)=>{
            if(a.isGoal && b.isGoal){
                return a.number<b.number ? a:b;
            }else return a.isGoal?a:b;
        }).number;
        this.representativeBlock = new Block(0, 0, this.minGoal);

        this.gameStart = false;
    }

    pressedAt(mx, my){
        let btnX = canvasWidth/2 - blockSize;
        let btnY = canvasHeight/2 + blockSize*0.5;
        let btnW = blockSize*2;
        let btnH = blockSize*0.75;
        if(
            btnX <= mx && btnY <= my &&
            btnX + btnW >= mx &&
            btnY + btnH >= my
        ) return GAME_START_CODE;
    }

    update(mx, my){
        this.fakePlayer.update();
        this.fakePlayer.enemyWave.amount = 100;
        this.fakePlayer.enemyWave.invulnerable = true;
        this.fakePlayer.health = 100;

        this.representativeBlock.pixelPos.x = (canvasWidth - blockSize)/2;
        this.representativeBlock.pixelPos.y = canvasHeight/2 - blockSize;
    }

    draw(){
        this.fakePlayer.draw();
        noStroke();
        fill(0, 0, 0, 127);
        rect(0, 0, canvasWidth, canvasHeight);

        this.representativeBlock.draw(3, [60, 60, 60, 120, 4, 8]);

        // start button
        fill([60, 60, 60, 120]);
        rect(
            canvasWidth/2 - blockSize - 3,
            canvasHeight/2 + blockSize*0.5 + 6,
            blockSize*2 + 6, blockSize*0.75, blockSize*0.15
        );
        fill(continueButtonColor);
        rect(
            canvasWidth/2 - blockSize,
            canvasHeight/2 + blockSize*0.5,
            blockSize*2, blockSize*0.75, blockSize*0.15
        );
        stroke([255, 255, 255]);
        strokeWeight(1.5);
        textSize(blockSize*0.75*0.5);
        textAlign(CENTER, CENTER);
        fill([255, 255, 255]);
        text(
            "進入遊戲", 
            canvasWidth/2,
            canvasHeight/2 + blockSize*0.875,
        );
    }
}



class ResultUI {
    constructor(player){
        this.data = player.getResult();
        this.bestBlockIndex = this.data.blockDamage.indexOf(max(this.data.blockDamage));
        this.bestBlock = new Block(0, 0, Math.pow(this.data.minNumber, this.bestBlockIndex+1));
        this.fakePlayer = player;
        this.gameStart = false;
        this.fakePlayer.pause = true;
    }

    pressedAt(mx, my){
        let cardWidth = blockSize*3.5;
        let cardHeight = blockSize*5.25;
        let nextGameButtonX = (canvasWidth-cardWidth/3*2)/2;
        let nextGameButtonY = (canvasHeight*1.5 + cardHeight*0.5 + blockSize*0.2625 - cardHeight/6)/2;
        let nextGameButtonW = cardWidth/3*2;
        let nextGameButtonH = cardHeight/6;
        if(
            nextGameButtonX <= my && nextGameButtonY <= my &&
            nextGameButtonX + nextGameButtonW >= mx &&
            nextGameButtonY + nextGameButtonH >= my
        ) return this.data.dead?GAME_START_CODE:GAME_RESUME_CODE;
    }

    update(){}

    draw(){
        this.fakePlayer.update();
        this.fakePlayer.draw();
        noStroke();
        fill(0, 0, 0, 127);
        rect(0, 0, canvasWidth, canvasHeight);


        // game result text
        let areaWidth = min(canvasWidth, canvasHeight);
        let areaHeight = blockSize;
        stroke(this.data.victory?victoryStrokeColor:gameOverStrokeColor);
        strokeJoin(ROUND);
        strokeWeight(areaHeight*0.1);
        fill(this.data.victory?victoryTextColor:gameOverTextColor);
        textAlign(CENTER, CENTER);
        textSize(areaHeight*0.52);
        text(this.data.victory?"Victorious":"GameOver", areaWidth/2, (blockSize/3 + (canvasHeight-boardHeight-blockSize)/2)/2);


        // game result card
        let cardWidth = blockSize*3.5;
        let cardHeight = blockSize*5.25;
        let weight = cardWidth/20;
        noStroke();
        fill([255, 255, 255]);
        rect(
            (canvasWidth-cardWidth)/2 - weight,
            (canvasHeight-cardHeight-weight)/2,
            cardWidth+weight*2, cardHeight+weight*2, blockSize/6 + weight
        );
        stroke(resultCardStrokeColor);
        strokeWeight(weight);
        fill(resultCardBackgroundColor);
        rect(
            (canvasWidth-cardWidth)/2,
            (canvasHeight-cardHeight+weight)/2,
            cardWidth, cardHeight, (blockSize+weight)/6
        );

        // best block
        noStroke();
        fill(bestBlockBackgroundColor);
        rect(
            (canvasWidth-cardWidth)/2,
            (canvasHeight-cardHeight)/2 - weight,
            cardWidth, cardHeight/5*2, blockSize/6
        );
        this.bestBlock.pixelPos.x = (canvasWidth-blockSize)/2;
        this.bestBlock.pixelPos.y = (canvasHeight-cardHeight)/2;
        this.bestBlock.draw(1.75, [60, 60, 60, 80, 4, 8]);

        let lineHeight = blockSize*0.3, by = (canvasHeight-cardHeight)/2 - weight + cardHeight/5*2 - blockSize/3;
        fill(0, 0, 0, 100);
        rect(
            (canvasWidth-cardWidth)/2 - weight*1.5 + 6, by + 3,
            cardWidth + weight*3 - 12, blockSize/4*3 + 3, blockSize/8, blockSize/8, 0, 0
        );
        fill(resultBannerColor);
        rect(
            (canvasWidth-cardWidth)/2 - weight*1.5, by,
            cardWidth + weight*3, blockSize/4*3, blockSize/8, blockSize/8, 0, 0
        );
        textAlign(CENTER, CENTER);
        textSize(lineHeight/2);
        fill([255, 255, 255])
        text("最佳方塊", (canvasWidth)/2, by + blockSize/8*3 - lineHeight/3*2);
        stroke(192);
        strokeWeight(1.5);
        textSize(lineHeight*1.2);
        text(
            `造成 ${this.data.blockDamage[this.bestBlockIndex]} 傷害`, 
            (canvasWidth)/2, by + blockSize/8*3 + lineHeight/3
        );

        let x1 = (canvasWidth-cardWidth)/2 + weight, x2 = (canvasWidth+cardWidth)/2 - weight;
        let sy = (canvasHeight-cardHeight)/2 - weight + cardHeight/5*2 + blockSize/3*2;
        let pairs = [
            ["最大的方塊", this.data.maxNumber],
            ["合併的數值", this.data.addedNumber],
            ["造成的傷害", this.data.damageDealt],
            ["擊破的敵人", this.data.enemyKilled]
        ];
        noStroke();
        for(let i=0; i<pairs.length; i++){
            textSize(lineHeight/3*2);
            fill([255, 255, 255])
            textAlign(LEFT, CENTER);
            text(pairs[i][0], x1, sy + lineHeight*i);
            fill(resultCardTextColor);
            textAlign(RIGHT, CENTER);
            text(pairs[i][1], x2, sy + lineHeight*i);
        }


        // continue button
        fill([100, 100, 100]);
        rect(
            (canvasWidth-cardWidth/3*2)/2,
            (canvasHeight*1.5 + cardHeight*0.5 + weight*1.5 - cardHeight/6)/2 + 5,
            cardWidth/3*2, cardHeight/6, blockSize/6
        );
        fill(continueButtonColor);
        rect(
            (canvasWidth-cardWidth/3*2)/2,
            (canvasHeight*1.5 + cardHeight*0.5 + weight*1.5 - cardHeight/6)/2,
            cardWidth/3*2, cardHeight/6, blockSize/6
        );
        stroke([255, 255, 255]);
        strokeWeight(1.5);
        textSize(lineHeight*1.2);
        textAlign(CENTER, CENTER);
        fill([255, 255, 255]);
        text(
            this.data.dead?"再來一局":"繼續突破", 
            (canvasWidth-cardWidth/3*2)/2 + cardWidth/3,
            (canvasHeight*1.5 + cardHeight*0.5 + weight*1.5 - cardHeight/6)/2 + cardHeight/12
        );
    }
}



class HintUI {
    constructor(text, duration, gap, blinks){
        this.t = 0; this.a = 255;
        this.text = text;
        this.gap = gap;
        this.duration = duration;
        this.blinks = blinks;
    }

    update(){
        this.t += 1;
        if(this.blinks){
            if(this.t <= this.blinks * this.gap){
                this.a = Math.abs( (Math.floor(this.t/this.gap + 1)%2)*255 - ((this.t%this.gap) / this.gap)*255 );
            }else this.a = 255;
        }else{
            this.a = Math.abs( (Math.floor(this.t/this.gap + 1)%2)*255 - ((this.t%this.gap) / this.gap)*255 );
        }
        if(this.duration){
            return (this.t >= this.duration);
        }
    }

    draw(){
        let areaWidth = min(canvasWidth, canvasHeight);
        let areaHeight = blockSize;
        fill([128, 128, 128, this.a]);
        textAlign(CENTER, CENTER);
        textSize(areaHeight*0.4);
        text(this.text, areaWidth/2, (blockSize/3 + (canvasHeight-boardHeight-blockSize)/2)/2);
    }
}