import {Component} from "../abstract/ecs/component";

export class HasBagComponent implements Component {

    name = "HAS-BAG";

    gold:number;
    wood:number;

    maxWood:number;

    constructor() {
        this.gold = 0;
        this.wood = 0;

        this.maxWood = 10;
    }

}