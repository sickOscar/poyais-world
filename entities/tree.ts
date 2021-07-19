import {GameEntity} from "../abstract/ecs/game-entity";
import {PositionComponent} from "../components/position.component";
import {Vector} from "../abstract/geometry/vector";
import {ExportBuildingEntity, ExportEntity, World} from "../world";
import {WorldRefComponent} from "../components/world-ref.component";
import {TreeLifecycleComponent} from "../components/tree-lifecycle.component";
import {DimensionsComponent} from "../components/dimensions.component";
import {BuildingStatsComponent, BuildingTypes} from "../components/building-stats.component";
import {round} from "../abstract/geometry/numbers";

export interface TreeOptions {
    position: Vector,
    max?: number,
    name?:string
}

export class Tree extends GameEntity {

    constructor(world:World, options:TreeOptions) {
        super();

        const life = new TreeLifecycleComponent({
            maxAge: 1000,
            maxCapacity: options.max || 100,
            currentAge: 1000 * Math.random()
        });

        this.addComponent(new PositionComponent(options.position.x, options.position.y))
            .addComponent(new BuildingStatsComponent(BuildingTypes.TREE, ''))
            .addComponent(new WorldRefComponent(world))
            .addComponent(life)
            .addComponent(new DimensionsComponent({
                radius: 4 + (life.age / 1000) * 5
            }))

    }

    export():ExportBuildingEntity {
        const positionComponent = <PositionComponent>this.getComponent('POSITION');
        const dimensionsComponent = <DimensionsComponent>this.getComponent('DIMENSIONS')
        const life = <TreeLifecycleComponent>this.getComponent('TREE-LIFECYCLE');

        const exportEntity:ExportEntity = {
            id: this.id,
            type: 'tree',
            position: [positionComponent.position.x, positionComponent.position.y],

        }

        const exportBuilding:Partial<ExportBuildingEntity> = {}

        exportBuilding.dimensions = {
            radius: dimensionsComponent.radius ? Math.round(dimensionsComponent.radius) : 0
        };
        exportBuilding.availability = round(life.availability);

        return Object.assign({}, exportEntity, exportBuilding);

    }

    updateRadius():void {
        const dimensionsComponent = <DimensionsComponent>this.getComponent('DIMENSIONS')
        const life = <TreeLifecycleComponent>this.getComponent('TREE-LIFECYCLE');
        if (dimensionsComponent) {
            dimensionsComponent.radius = 4 + (life.age / 1000) * 5;
        }
    }

    print() {
    }

}