import {Component} from "../abstract/ecs/component";
import {Miner} from "../entities/miner";

export interface TreeLifecycleOptions {
    maxCapacity: number,
    maxAge:number;
    currentAge?: number | 0
}


export class TreeLifecycleComponent implements Component {

    name = "TREE-LIFECYCLE";

    availability:number;
    maxCapacity:number;
    age:number;
    maxAge:number

    cutting:number;
    maxCutting = 1;

    constructor(options:TreeLifecycleOptions) {
        this.maxCapacity = options.maxCapacity;
        this.maxAge = options.maxAge;
        this.age = options.currentAge || Math.random() * options.maxAge;
        this.availability = this.maxCapacity;
        this.cutting = 0;
    }

}