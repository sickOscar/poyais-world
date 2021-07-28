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

    static randomUnit() {
        const theta = Math.random() * 2 * Math.PI;
        return new Vector(
            Math.cos(theta),
            Math.sin(theta)
        )
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

    inverse(): Vector {
        return new Vector(-this.x, -this.y);
    }

    length(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
    }

    opposite(): Vector {
        return this.inverse();
    }

    equals(v: Vector) {
        return this.x === v.x && this.y === v.y;
    }

    // t between 0 and 1
    lerp(a: Vector, t: number): Vector {
        return new Vector(
            this.x + (a.x - this.x) * t,
            this.y + (a.y - this.y) * t,
        )
    }

    dot(a: Vector): number {
        return this.x * a.x + this.y * a.y;
    }

    heading(): number {
        return Math.atan2(this.y, this.x);
    }

    static findNearestPointToLine(point: Vector, lineStart: Vector, lineEnd:Vector) {
        var atob = {x: lineEnd.x - lineStart.x, y: lineEnd.y - lineStart.y};
        var atop = {x: point.x - lineStart.x, y: point.y - lineStart.y};
        var len = atob.x * atob.x + atob.y * atob.y;
        var dot = atop.x * atob.x + atop.y * atob.y;
        var t = Math.min(1, Math.max(0, dot / len));
        dot = (lineEnd.x - lineStart.x) * (point.y - lineStart.y) - (lineEnd.y - lineStart.y) * (point.x - lineStart.x);
        return new Vector(lineStart.x + atob.x * t, lineStart.y + atob.y * t);
    }

    static linesIntersect(a: number, b: number, c: number, d: number, p: number, q: number, r: number, s: number) {
        var det, gamma, lambda;
        det = (c - a) * (s - q) - (r - p) * (d - b);
        if (det === 0) {
            return false;
        } else {
            lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
            gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
            return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
        }
    }

}
