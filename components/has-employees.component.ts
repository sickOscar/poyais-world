import {Component} from "../abstract/ecs/component";
import {GameEntity} from "../abstract/ecs/game-entity";
import {Jobs} from "./job.component";

export class HasEmployeesComponent implements Component {
    name = 'HAS-EMPLOYEES';

    employees:GameEntity[] = []
    maxEmployees:number;
    jobType:Jobs

    constructor(maxEmployess:number, jobType?:Jobs) {
        this.maxEmployees = maxEmployess;
        this.jobType = jobType || Jobs.WORKER;
    }

}