import {Component} from "../abstract/ecs/component";
import {Vector} from "../abstract/geometry/vector";
import {GameEntity} from "../abstract/ecs/game-entity";

export class IsInBuildingComponent implements Component {

    name = "IS-IN-BUILDING";

    building:GameEntity | null;

    constructor(building:GameEntity) {
        this.building = building;
    }

}