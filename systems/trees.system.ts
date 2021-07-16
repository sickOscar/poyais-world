import {System} from "../abstract/ecs/system";
import {World} from "../world";
import {GameEntity} from "../abstract/ecs/game-entity";
import {MineLifecycleComponent} from "../components/mine-lifecycle.component";
import {TreeLifecycleComponent} from "../components/tree-lifecycle.component";
import {DimensionsComponent} from "../components/dimensions.component";
import {Tree} from "../entities/tree";
import {Forest} from "../entities/forest";
import {GrowingForestComponent} from "../components/growing-forest.component";

export class TreesSystem implements System {

    world:World;

    constructor(world:World) {
        this.world = world;
    }

    update(delta:number, time:number) {
        this.world.em.entities.forEach((entity:GameEntity) => {

            const tree:TreeLifecycleComponent = <TreeLifecycleComponent>entity.getComponent('TREE-LIFECYCLE');
            const dimensions:DimensionsComponent = <DimensionsComponent>entity.getComponent('DIMENSIONS');

            if (tree) {
                tree.age += 1 * delta;
                if (tree.availability <= 0) {
                    this.removeTree(entity.id);
                }

                if (dimensions && dimensions.radius) {
                    const actualRatio = tree.availability / tree.maxCapacity;
                    const originalRadius = dimensions.radius / actualRatio;
                    dimensions.radius = originalRadius * actualRatio;
                }

                return;
            }

            const growing = <GrowingForestComponent>entity.getComponent('GROWING-FOREST');
            if (growing) {
                growing.currentGrowth = Math.min(growing.growthCycle, growing.currentGrowth + (growing.growthRate * delta));
                if (growing.currentGrowth === growing.growthCycle) {
                    const f = entity as Forest;
                    if (f.forest.length < f.trees) {
                        f.plantTree();
                    }
                    growing.currentGrowth = 0;
                }
            }



            // (entity as Tree).updateRadius();

        })



    }

    removeTree(id:number) {
        this.world.em.entities.forEach((entity:GameEntity) => {
            const growingForest = <GrowingForestComponent>entity.getComponent('GROWING-FOREST');
            if (growingForest) {
                (entity as Forest).removeTree(id);
            }
        })

    }

}