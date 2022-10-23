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

    calculatePositions(){
        let boardx = (windowWidth-boardWidth)/2;
        let boardy = (windowHeight-boardHeight)/2;
        let blockSpace = (blockSize/2)/(max(columns, rows)-1);
        this.pixelPos.x = boardx + blockSize/4 + blockSize*this.boardPos.x + blockSpace*this.boardPos.x;
        this.pixelPos.y = boardy + blockSize/4 + blockSize*this.boardPos.y + blockSpace*this.boardPos.y;
        this.pixelPosTo.x = boardx + blockSize/4 + blockSize*this.boardPosTo.x + blockSpace*this.boardPosTo.x;
        this.pixelPosTo.y = boardy + blockSize/4 + blockSize*this.boardPosTo.y + blockSpace*this.boardPosTo.y;
    }

    updateConfigurations(){
        for(let type of typesOfBlocks){
            if(this.number === type.number){
                this.bg = type.bg;
                this.fg = type.fg;
                this.shootDelay = type.shootDelay;
                return;
            }
        }
        this.bg = typesOfBlocks[0].bg;
        this.fg = typesOfBlocks[0].fg;
        this.shootDelay = type.shootDelay;
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
        this.shootCounter += 1;
    }

    draw(){
        noStroke();
        fill(this.bg);
        rect(
            this.pixelPos.x, this.pixelPos.y,
            blockSize, blockSize, blockSize/8
        );
        fill(this.fg);
        textAlign(CENTER, CENTER);
        textSize(blockSize/2);
        text(
            this.number, 
            this.pixelPos.x+(blockSize/2), 
            this.pixelPos.y+(blockSize/2)
        );
    }
}