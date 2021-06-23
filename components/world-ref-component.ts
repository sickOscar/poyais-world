import {Component} from "../abstract/ecs/component";
import {World} from "../world";

export class WorldRefComponent implements Component {

    name = "WORLD-REF";

    world:World;

    constructor(world:World) {
        this.world = world;
    }

}