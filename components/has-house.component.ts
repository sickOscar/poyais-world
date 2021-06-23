import {Component} from "../abstract/ecs/component";
import {Vector} from "../abstract/geometry/vector";

export class HasHouseComponent implements Component {

    name = "HAS-HOUSE";

    housePosition:Vector;

    constructor(x:number, y:number) {
        this.housePosition = new Vector(x, y);
    }

}