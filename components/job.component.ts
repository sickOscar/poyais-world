import {Component} from "../abstract/ecs/component";
import {GameEntity} from "../abstract/ecs/game-entity";

export enum Jobs {
    FARMER = 0,
    WORKER = 1,
    WAREHOUSEMAN = 2,
    BANKER = 3,
    BARTENDER= 4
}

export const Wages:{[key:number]: number} = {
    [Jobs.WAREHOUSEMAN]: 8,
    [Jobs.WORKER]: 6,
    [Jobs.BANKER]: 12,
    [Jobs.BARTENDER]: 8
}

export class JobComponent implements Component {
    name = 'JOB';

    job:Jobs;
    workplace:GameEntity;
    wage:number;

    constructor(job:Jobs, workplace:GameEntity) {
        this.job = job;
        this.workplace = workplace;

        this.wage = Wages[job];

    }

}