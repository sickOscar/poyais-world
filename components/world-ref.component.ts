import {Component} from "../abstract/ecs/component";
import {World} from "../world";
import {GameEntity} from "../abstract/ecs/game-entity";

export const WorldRefComponentName = 'WORLD-REF';

export class WorldRefComponent implements Component {

    name = WorldRefComponentName;

    world:World;

    constructor(world:World) {
        this.world = world;
    }

    hasEntity(id:number):GameEntity | undefined {
        return this.world.em.entities.get(id);
    }

}