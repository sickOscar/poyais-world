import {Component} from "../abstract/ecs/component";
import {World} from "../world";
import {GameEntity} from "../abstract/ecs/game-entity";

export class WorldRefComponent implements Component {

    name = "WORLD-REF";

    world:World;

    constructor(world:World) {
        this.world = world;
    }

    hasEntity(id:number):GameEntity | undefined {
        return this.world.em.entities.get(id);
    }

}