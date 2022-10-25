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
        let boardx = (canvasWidth-boardWidth)/2;
        let boardy = (canvasHeight-boardHeight)/2;
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



class EnemyWave {
    constructor(target, amount, delay) {
        this.target = target;
        this.amount = amount;
        this.counter = 0;
        this.delay = delay;
        this.enemies = [];
        this.invulnerable = false;
    }

    isCleared(){
        return this.enemies.length === 0 && this.amount <= 0;
    }

    setEnemyHealth(health){
        this.enemyHealth = health;
    }

    getFirst(){
        return this.enemies[0];
    }

    update(){
        if(this.amount && this.enemyHealth !== undefined){
            if(this.counter >= this.delay){
                this.enemies.push(new Enemy(enemySpeed, this.enemyHealth, enemyDamage));
                this.counter = 0;
                this.amount--;
            }else this.counter++;
        }

        this.enemies.sort((a, b)=>(b.progress-a.progress));
        for(let i=0; i<this.enemies.length; i++){
            if(this.enemies[i].health <= 0 && !this.invulnerable){
                this.enemies.splice(i, 1);
                i--; continue;
            }
            this.enemies[i].update();
            if(this.enemies[i].progress >= 100){
                this.target.health = max(0, this.target.health-this.enemies[i].damage);
                this.enemies.splice(i, 1);
                i--; continue;
            }
        }
    }

    draw(){
        for(let enemy of this.enemies){
            enemy.draw();
        }
    }
}