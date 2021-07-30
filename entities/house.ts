import {GameEntity} from "../abstract/ecs/game-entity";
import {PositionComponent, PositionComponentName} from "../components/position.component";
import {Vector} from "../abstract/geometry/vector";
import {BuildingStatsComponent, BuildingTypes} from "../components/building-stats.component";
import {ExportBuildingEntity, ExportEntity, World} from "../world";
import {WorldRefComponent} from "../components/world-ref.component";
import {BuildableComponent} from "../components/buildable.component";
import {DimensionsComponent} from "../components/dimensions.component";

export interface HouseOptions {
    position: Vector,
    name?: string,
    width: number,
    height: number
}

export class House extends GameEntity {

    constructor(world:World, options:HouseOptions) {
        super();

        const positionComponent = new PositionComponent(options.position.x, options.position.y);

        this.addComponent(positionComponent)
            .addComponent(new BuildingStatsComponent(BuildingTypes.HOUSE, options.name || 'A common house'))
            .addComponent(new WorldRefComponent(world))
            .addComponent(new DimensionsComponent({
                width: options.width,
                height: options.height
            }))

    }

    export():ExportBuildingEntity {
        const positionComponent = <PositionComponent>this.getComponent(PositionComponentName);
        const dimensions = <DimensionsComponent>this.getComponent('DIMENSIONS');
        const building  = <BuildingStatsComponent>this.getComponent('BUILDING-STATS');

        let progressValue = 0;
        const buildable = <BuildableComponent>this.getComponent('BUILDABLE');
        if (buildable) {
            progressValue = buildable.progress;
        }


        const exportEntity:ExportEntity = {
            id: this.id,
            name: building.buildingName,
            type: 'house',
            position: [positionComponent.position.x, positionComponent.position.y],
        }

        const buildingExport:Partial<ExportBuildingEntity> = {
            progress: progressValue,
            dimensions: {
                width: dimensions.width,
                height: dimensions.height
            },
        }

        return Object.assign({}, exportEntity, buildingExport);

    }

    print() {
    }

}