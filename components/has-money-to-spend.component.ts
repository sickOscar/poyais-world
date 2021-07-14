import {Component} from "../abstract/ecs/component";

export class HasMoneyToSpendComponent implements Component {

    name = "MONEY-TO-SPEND";

    money:number;

    constructor() {
        this.money = Math.round(Math.random()*10);
    }

}