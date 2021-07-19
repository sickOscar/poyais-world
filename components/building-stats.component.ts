import {Component} from "../abstract/ecs/component";
import {Vector} from "../abstract/geometry/vector";

export enum BuildingTypes {
    TAVERN = "TAVERN",
    HOUSE = "HOUSE",
    BANK = "BANK",
    MINE = "MINE",
    TREE = "TREE",
    FARM = "FARM",
    WAREHOUSE = "WAREHOUSE"
}


export class BuildingStatsComponent implements Component {

    name = "BUILDING-STATS";

    type:BuildingTypes;
    buildingName:string;

    constructor(buildingType:BuildingTypes, buildingName:string) {
        this.type = buildingType;
        this.buildingName = buildingName;
    }

}