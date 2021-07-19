import {GameEntity} from "../abstract/ecs/game-entity";
import {PositionComponent} from "../components/position.component";
import {Vector} from "../abstract/geometry/vector";
import {BuildingStatsComponent, BuildingTypes} from "../components/building-stats.component";
import {ExportBuildingEntity, ExportEntity, World} from "../world";
import {WorldRefComponent} from "../components/world-ref.component";
import {MineLifecycleComponent} from "../components/mine-lifecycle.component";
import {DimensionsComponent} from "../components/dimensions.component";

export interface MineOptions {
    position: Vector,
    regenerationTime?: number,
    max?: number,
    name?: string
}

export class Mine extends GameEntity {

    constructor(world: World, options: MineOptions) {
        super();

        this.addComponent(new PositionComponent(options.position.x, options.position.y))
            .addComponent(new BuildingStatsComponent(BuildingTypes.MINE, options.name || 'A beautiful mine'))
            .addComponent(new WorldRefComponent(world))
            .addComponent(new MineLifecycleComponent())
            .addComponent(new DimensionsComponent({
                radius: 30
            }))

    }

    export(): ExportBuildingEntity {
        const positionComponent = <PositionComponent>this.getComponent('POSITION');
        const dimensionsComponent = <DimensionsComponent>this.getComponent('DIMENSIONS');
        const mine = <MineLifecycleComponent>this.getComponent('MINE-LIFECYCLE');

        const exportEntity: ExportEntity = {
            id: this.id,
            name: 'Gold mine',
            type: 'mine',
            position: [positionComponent.position.x, positionComponent.position.y],
        }

        const exportBuilding: Partial<ExportBuildingEntity> = {};

        exportBuilding.dimensions = {
            radius: dimensionsComponent.radius
        };
        exportBuilding.availability = mine.availability

        return Object.assign({}, exportEntity, exportBuilding);

    }

    print() {
    }

}