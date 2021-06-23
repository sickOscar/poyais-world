import {Component} from "../abstract/ecs/component";
import {Vector} from "../abstract/geometry/vector";

export class PositionComponent implements Component {

    name = "POSITION";

    position = new Vector(0, 0)

    constructor(x:number, y:number) {
        this.position = new Vector(x, y);
    }

}