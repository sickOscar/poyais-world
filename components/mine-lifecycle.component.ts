import {Component} from "../abstract/ecs/component";
import {Vector} from "../abstract/geometry/vector";

export class MineLifecycleComponent implements Component {

    name = "MINE-LIFECYCLE";

    availability:number;
    maxCapacity:number;
    regenerationTime:number
    maxRegenerationTime:number;

    constructor(max = 1000, regenerationTime = 1000) {
        this.maxCapacity = max;
        this.availability = this.maxCapacity;
        this.regenerationTime = regenerationTime;
        this.maxRegenerationTime = regenerationTime;
    }

}