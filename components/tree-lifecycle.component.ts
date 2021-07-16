import {Component} from "../abstract/ecs/component";

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

    constructor(options:TreeLifecycleOptions) {
        this.maxCapacity = options.maxCapacity;
        this.maxAge = options.maxAge;
        this.age = options.currentAge || Math.random() * options.maxAge;
        this.availability = this.maxCapacity;
    }

}