import {Component} from "../abstract/ecs/component";
import {Vector} from "../abstract/geometry/vector";

export enum BuildingTypes {
    TAVERN
}


export class BuildingStatsComponent implements Component {

    name = "BUILDING-STATS";

    type:BuildingTypes;

    constructor(buildingType:BuildingTypes) {
        this.type = buildingType;
    }

}