class Vec2{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    normalize(){
        let len = Math.sqrt(this.x * this.x + this.y * this.y);
        this.x /= len;
        this.y /= len;
    }

    multiply(n){
        this.x *= n;
        this.y *= n;
    }

    add(other){
        this.x += other.x;
        this.y += other.y;
    }
}