import {Component} from "../abstract/ecs/component";

export class MassComponent implements Component {
    name = 'MASS';

    weight:number;

    constructor(m:number) {
        this.weight = m
    }

}