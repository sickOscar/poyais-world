import {System} from "../abstract/ecs/system";
import {World} from "../world";
import {GameEntity} from "../abstract/ecs/game-entity";
import {MineLifecycleComponent} from "../components/mine-lifecycle.component";

export class MinesSystem implements System {

    world:World;

    constructor(world:World) {
        this.world = world;
    }

    update(delta:number, time:number) {
        this.world.em.entities.forEach((entity:GameEntity) => {

            const mine:MineLifecycleComponent = <MineLifecycleComponent>entity.getComponent('MINE-LIFECYCLE');
            if (mine) {
                mine.regenerationTime -= 1 * delta;

                if (mine.regenerationTime <= 0) {
                    mine.regenerationTime = mine.maxRegenerationTime;
                    mine.availability = mine.maxCapacity;
                }
            }

        })


    }

}