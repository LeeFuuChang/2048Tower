class Bullet{
    constructor(speed, parent){
        this.speed = speed;
        this.bgc = parent.bg;
        this.bdc = parent.fg;
        this.size = blockSize/10;
        this.damage = parent.number;
        this.target = undefined;
        this.pixelPos = new Vec2(
            parent.pixelPos.x+blockSize/2, 
            parent.pixelPos.y+blockSize/2
        );
    }

    setTarget(target){
        this.target = target;
    }

    getDistanceToTarget(){
        if(!this.target) return 0;
        return dist(
            this.target.pixelPos.x,
            this.target.pixelPos.y,
            this.pixelPos.x,
            this.pixelPos.y
        )
    }

    dealDamage(){
        if(!this.target) return;
        this.target.health -= this.damage;
    }

    update(){
        if(this.target){
            let velocity = new Vec2(
                this.target.pixelPos.x - this.pixelPos.x,
                this.target.pixelPos.y - this.pixelPos.y
            )
            velocity.normalize();
            velocity.multiply(this.speed);
            this.pixelPos.add(velocity);
        }
    }

    draw(){
        stroke(this.bdc);
        strokeWeight(this.size/3);
        fill(this.bgc);
        circle(this.pixelPos.x, this.pixelPos.y, this.size);
    }
}