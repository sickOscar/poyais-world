import {System} from "../abstract/ecs/system";
import {World} from "../world";
import {GameEntity} from "../abstract/ecs/game-entity";
import {HasOwnerComponent} from "../components/has-owner.component";

export class OwnershipSystem implements System {

    world:World;

    constructor(world:World) {
        this.world = world;
    }

    update(delta:number, time:number) {
        this.world.em.entities.forEach((entity:GameEntity) => {


            const ownership = <HasOwnerComponent>entity.getComponent('HAS-OWNER');
            if (ownership) {
                ownership.ownershipLife += delta;
            }

        })


    }

}