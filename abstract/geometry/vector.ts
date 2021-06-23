export class Vector {

    x:number;
    y:number;

    constructor(x:number, y:number) {
        this.x = x;
        this.y = y;
    }

    static fromArray(array:[number, number]):Vector {
        return new Vector(array[0], array[1])
    }

    static distance(a:Vector, b:Vector):number {
        return Math.sqrt(Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2));
    }

    add(v:Vector):Vector {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    subtract(v:Vector):Vector {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    multiply(scalar:number):Vector {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    divide(scalar:number):Vector {
        return new Vector(this.x / scalar, this.y / scalar);
    }

    magnitude():number {
        return Math.sqrt((this.x * this.x) + (this.y * this.y) );
    }

    truncate(max:number):Vector {
        return new Vector(
            Math.min(this.x, max),
            Math.min(this.y, max)
        )
    }

    normalize():Vector {
        return this.divide(this.magnitude());
    }

    perp():Vector {
        return new Vector(-this.y, this.x);
    }

    clone():Vector {
        return new Vector(this.x, this.y);
    }

}
