import {Component} from "../abstract/ecs/component";
import {Farm} from "../entities/farm";

export class FarmerComponent implements Component {
    name = 'FARMER';

    farm:Farm|null = null;

    constructor(farm?:Farm) {
        if (farm) {
            this.farm = farm;
        }

    }

}