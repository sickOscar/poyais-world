
export class Vector {

    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static fromArray(array: [number, number]): Vector {
        return new Vector(array[0], array[1])
    }

    static distance(a: Vector, b: Vector): number {
        return Math.sqrt(Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2));
    }

    static randomClamped(): Vector {

        const x = Math.random() > 0.5 ? 1 : -1;
        const y = Math.random() > 0.5 ? 1 : -1

        return new Vector(x, y);
    }

    static pointToWorldSpace(point: Vector, heading: Vector, position: Vector): Vector {

        const angle = Math.atan2(position.y - point.y, position.x - point.x);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        return new Vector(
            point.x * cos + (point.y * -sin) + position.x,
            point.x * sin + point.y * cos + position.y
        )
    }


    add(v: Vector): Vector {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    subtract(v: Vector): Vector {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    multiply(scalar: number): Vector {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    divide(scalar: number): Vector {
        return new Vector(this.x / scalar, this.y / scalar);
    }

    magnitude(): number {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    truncate(max: number): Vector {

        if (this.length() < max) {
            return this;
        }

        return this.normalize().multiply(max);

    }

    normalize(): Vector {
        return this.divide(this.magnitude());
    }

    perp(): Vector {
        return new Vector(-this.y, this.x);
    }

    clone(): Vector {
        return new Vector(this.x, this.y);
    }

    inverse():Vector {
        return new Vector(-this.x, -this.y);
    }

    length():number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
    }

    opposite():Vector {
        return this.inverse();
    }

    equals(v:Vector) {
        return this.x === v.x && this.y === v.y;
    }

}
