class Block{
    constructor(x, y, number){
        this.boardPos = new Vec2(x, y);
        this.boardPosTo = new Vec2(x, y);
        this.pixelPos = new Vec2(0, 0);
        this.pixelPosTo = new Vec2(0, 0);
        this.calculatePositions();
        this.number = number;
        this.shootCounter = 0;
        this.updateConfigurations();
    }

    setNumber(n){
        this.number = n;
        this.updateConfigurations();
    }

    pointCollided(x, y){
        return (
            this.pixelPos.x <= x && 
            this.pixelPos.y <= y &&
            this.pixelPos.x + blockSize >= x &&
            this.pixelPos.y + blockSize >= y
        )
    }

    calculatePositions(){
        let boardx = (canvasWidth-boardWidth)/2;
        let boardy = (canvasHeight-boardHeight)/2;
        let blockSpace = (blockSize/2)/(max(columns, rows)-1);
        this.pixelPos.x = boardx + blockSize/4 + blockSize*this.boardPos.x + blockSpace*this.boardPos.x;
        this.pixelPos.y = boardy + blockSize/4 + blockSize*this.boardPos.y + blockSpace*this.boardPos.y;
        this.pixelPosTo.x = boardx + blockSize/4 + blockSize*this.boardPosTo.x + blockSpace*this.boardPosTo.x;
        this.pixelPosTo.y = boardy + blockSize/4 + blockSize*this.boardPosTo.y + blockSpace*this.boardPosTo.y;
    }

    updateConfigurations(){
        let type;
        for(type of typesOfBlocks) if(this.number === type.number) break;
        if(type){
            this.fontSizeMultiplier = type.fontSizeMultiplier;
            this.bg = type.bg;
            this.fg = type.fg;
            this.shootDelay = type.shootDelay;
        }else{
            this.fontSizeMultiplier = typesOfBlocks[0].fontSizeMultiplier;
            this.bg = typesOfBlocks[0].bg;
            this.fg = typesOfBlocks[0].fg;
            this.shootDelay = type.shootDelay;
        }
    }

    isMoving(){
        return (this.boardPosTo.x !== this.boardPos.x) || (this.boardPosTo.y !== this.boardPos.y)
    }

    update(){
        if(dist(this.pixelPos.x, this.pixelPos.y, this.pixelPosTo.x, this.pixelPosTo.y) > blockSpeed){
            let vector = new Vec2(this.boardPosTo.x - this.boardPos.x, this.boardPosTo.y - this.boardPos.y);
            vector.normalize();
            vector.multiply(blockSpeed);
            this.pixelPos.add(vector);
        }else{
            this.boardPos.x = this.boardPosTo.x;
            this.boardPos.y = this.boardPosTo.y;
            this.calculatePositions();
        }
        this.updateConfigurations();
    }

    draw(zoom=1, shadow=false){
        if(shadow){
            fill(100, 100, 100, 100);
            rect(
                this.pixelPos.x-((zoom-1)*blockSize/2) - 5, 
                this.pixelPos.y-((zoom-1)*blockSize/2) + 10,
                blockSize*zoom + 10, blockSize*zoom, blockSize*zoom/6
            );
        }
        noStroke();
        fill(this.bg);
        rect(
            this.pixelPos.x-((zoom-1)*blockSize/2), this.pixelPos.y-((zoom-1)*blockSize/2),
            blockSize*zoom, blockSize*zoom, blockSize*zoom/8
        );
        fill(this.fg);
        textAlign(CENTER, CENTER);
        textSize(blockSize*zoom*this.fontSizeMultiplier);
        text(
            this.number, 
            this.pixelPos.x+(blockSize/2), 
            this.pixelPos.y+(blockSize/2)
        );
    }

    showBorder(color, weight=4){
        stroke(color);
        strokeWeight(weight);
        fill(0, 0, 0, 0);
        rect(
            this.pixelPos.x+weight/2, this.pixelPos.y+weight/2,
            blockSize-weight, blockSize-weight, (blockSize-weight)/8
        );
    }
}