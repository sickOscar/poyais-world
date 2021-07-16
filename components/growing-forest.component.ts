import {Component} from "../abstract/ecs/component";

export class GrowingForestComponent implements Component {

    name = 'GROWING-FOREST';

    growthRate = 1;
    growthCycle =  60;
    currentGrowth = 0;

}