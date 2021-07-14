import {System} from "../abstract/ecs/system";
import {World} from "../world";
import {GameEntity} from "../abstract/ecs/game-entity";
import {MineLifecycleComponent} from "../components/mine-lifecycle.component";
import {TreeLifecycleComponent} from "../components/tree-lifecycle.component";
import {DimensionsComponent} from "../components/dimensions.component";
import {Tree} from "../entities/tree";

export class TreesSystem implements System {

    world:World;

    constructor(world:World) {
        this.world = world;
    }

    update(delta:number, time:number) {
        this.world.em.entities.forEach((entity:GameEntity) => {

            const tree:TreeLifecycleComponent = <TreeLifecycleComponent>entity.getComponent('TREE-LIFECYCLE');
            if (tree) {
                tree.age += 1 * delta;
                if (tree.availability <= 0) {
                    this.world.em.entities.delete(entity.id);
                }
            }

            // (entity as Tree).updateRadius();



        })


    }

}