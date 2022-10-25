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