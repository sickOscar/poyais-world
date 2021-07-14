import {Component} from "../abstract/ecs/component";
import {Vector} from "../abstract/geometry/vector";

export class TreeLifecycleComponent implements Component {

    name = "TREE-LIFECYCLE";

    availability:number;
    maxCapacity:number;
    age:number;

    constructor(max = 300) {
        this.maxCapacity = max;
        this.availability = this.maxCapacity;
        this.age = Math.random() * 1000;
    }

}