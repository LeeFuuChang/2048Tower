class Enemy{
    constructor(speed, health, damage){
        this.progress = 0;
        this.speed = speed;
        this.health = health;
        this.damage = damage;
        this.pixelPos = new Vec2(0, 0);
    }

    update(){
        this.progress += this.speed;
    }

    draw(){
        let boardx = (windowWidth-boardWidth)/2;
        let boardy = (windowHeight-boardHeight)/2;
        let pathSpace = blockSize/2;
        let thickness = pathSpace/10;

        let part1 = (boardHeight+pathSpace)-(thickness/2);
        let part2 = (boardWidth+pathSpace+pathSpace)-thickness;
        let part3 = (boardHeight+pathSpace)-(thickness/2);
        let fullLength = part1 + part2 + part3;

        let progressLength = fullLength*(this.progress/100);

        if(progressLength >= part1+part2){
            this.pixelPos.x = (boardx+pathSpace+boardWidth)+(thickness/2)
            this.pixelPos.y = (boardy-pathSpace)+(thickness/2)+(progressLength-part1-part2);
        }else if(progressLength >= part1){
            this.pixelPos.x = (boardx-pathSpace)+(thickness/2)+(progressLength-part1);
            this.pixelPos.y = (boardy-pathSpace)+(thickness/2);
        }else{
            this.pixelPos.x = (boardx-pathSpace)+(thickness/2);
            this.pixelPos.y = (boardy-pathSpace)+(boardHeight+pathSpace)-(progressLength);
        }

        noStroke();

        fill(enemyColor);
        rect(this.pixelPos.x-(enemySize/2), this.pixelPos.y-(enemySize/2), enemySize, enemySize);
    }
}