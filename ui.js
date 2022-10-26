class SwappingArea {
    constructor(){
        this.active = false;
        this.prevScrollx = 0;
        this.scrollx = 0;
        this.toggledNumber = 0;
        this.unlocked = typesOfBlocks.reduce(function(a, b) {
            return a.number < b.number ? a : b;
        });
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
        let typeCount = typesOfBlocks.length;
        let maxScroll = blockSize*typeCount + padding*(typeCount+1) - canvasWidth;
        this.scrollx = this.prevScrollx-v;
        if(this.scrollx > maxScroll) this.scrollx = maxScroll;
        else if(this.scrollx < 0) this.scrollx = 0;
    }

    setUnlocked(unlocked){
        this.unlocked = unlocked;
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

        typesOfBlocks.sort((a, b)=>a.number - b.number);
        for(let i=0; i<typesOfBlocks.length; i++){
            let b_r = typesOfBlocks[i].bg[0];
            let b_g = typesOfBlocks[i].bg[1];
            let b_b = typesOfBlocks[i].bg[2];

            let f_r = typesOfBlocks[i].fg[0];
            let f_g = typesOfBlocks[i].fg[1];
            let f_b = typesOfBlocks[i].fg[2];

            let a = 50 + 205*(typesOfBlocks[i].number <= this.unlocked);

            noStroke();

            fill(b_r, b_g, b_b, a);
            rect(
                -this.scrollx + (canvasWidth-areaWidth)/2 + padding*(i+1) + blockSize*i, 
                canvasHeight - (padding + blockSize),
                blockSize, blockSize, blockSize/8
            );
            fill(f_r, f_g, f_b, a);
            textAlign(CENTER, CENTER);
            textSize(blockSize*typesOfBlocks[i].fontSizeMultiplier);
            text(
                typesOfBlocks[i].number, 
                -this.scrollx + (canvasWidth-areaWidth)/2 + padding*(i+1) + blockSize*(i+0.5), 
                canvasHeight - (padding + blockSize) + (blockSize/2)
            );

            if(typesOfBlocks[i].number === this.toggledNumber && this.active){
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

        this.gameStart = false;
    }

    pressedAt(mx, my){
        return GAME_START_CODE;
    }

    update(mx, my){
        this.fakePlayer.update();
        this.fakePlayer.enemyWave.amount = 100;
        this.fakePlayer.enemyWave.invulnerable = true;
        this.fakePlayer.health = 100;
    }

    draw(){
        this.fakePlayer.draw();
        noStroke();
        fill(0, 0, 0, 127);
        rect(0, 0, canvasWidth, canvasHeight);
    }
}



class ResultUI {
    constructor(player){
        this.data = player.getResult();
        this.bestBlockIndex = this.data.blockDamage.indexOf(max(this.data.blockDamage));
        this.bestBlock = new Block(0, 0, Math.pow(this.data.minNumber, this.bestBlockIndex+1));
        this.fakePlayer = player;
        this.gameStart = false;
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
        ){
            return GAME_START_CODE;
        }
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
        this.bestBlock.draw(1.75, true);

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
            "再來一局", 
            (canvasWidth-cardWidth/3*2)/2 + cardWidth/3,
            (canvasHeight*1.5 + cardHeight*0.5 + weight*1.5 - cardHeight/6)/2 + cardHeight/12
        );
    }
}