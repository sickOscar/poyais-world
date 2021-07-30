import {Component} from "../abstract/ecs/component";

export const DepositComponentName = 'DEPOSIT';

export enum Depositables {
    GOLD,
    WOOD,
    MALT
}

export class DepositComponent implements Component {

    name = DepositComponentName;

    accept:Depositables[] = [];
    storage:{[key:number]:number};

    constructor(accept:Depositables[]) {
        this.accept = accept;
        this.storage = accept.reduce((acc:{[key:number]:number}, next) => {
            acc[next] = 0;
            return acc;
        }, {})
    }

    doAccept(d:Depositables) {
        return this.accept.indexOf(d) > -1;
    }

}