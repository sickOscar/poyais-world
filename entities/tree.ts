import {GameEntity} from "../abstract/ecs/game-entity";
import {PositionComponent} from "../components/position.component";
import {Vector} from "../abstract/geometry/vector";
import {ExportEntity, World} from "../world";
import {WorldRefComponent} from "../components/world-ref.component";
import {TreeLifecycleComponent} from "../components/tree-lifecycle.component";
import {DimensionsComponent} from "../components/dimensions.component";
import {BuildingStatsComponent, BuildingTypes} from "../components/building-stats.component";

export interface TreeOptions {
    position: Vector,
    max?: number,
    name?:string
}

export class Tree extends GameEntity {

    constructor(world:World, options:TreeOptions) {
        super();

        const life = new TreeLifecycleComponent();

        this.addComponent(new PositionComponent(options.position.x, options.position.y))
            .addComponent(new BuildingStatsComponent(BuildingTypes.TREE, ''))
            .addComponent(new WorldRefComponent(world))
            .addComponent(life)
            .addComponent(new DimensionsComponent({
                radius: (life.age / 1000) * 15
            }))

    }

    export():ExportEntity {
        const positionComponent = <PositionComponent>this.getComponent('POSITION');
        const dimensionsComponent = <DimensionsComponent>this.getComponent('DIMENSIONS')

        const exportEntity:ExportEntity = {
            id: this.id,
            type: 'tree',
            position: [positionComponent.position.x, positionComponent.position.y],
            dimensions: {
                radius: dimensionsComponent.radius
            }
        }

        return exportEntity;

    }

    updateRadius():void {
        const dimensionsComponent = <DimensionsComponent>this.getComponent('DIMENSIONS')
        const life = <TreeLifecycleComponent>this.getComponent('TREE-LIFECYCLE');
        if (dimensionsComponent) {
            dimensionsComponent.radius = (life.age / 1000) * 15;
        }
    }

    print() {
    }

}