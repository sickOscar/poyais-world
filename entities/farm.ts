import {GameEntity} from "../abstract/ecs/game-entity";
import {WorldRefComponent} from "../components/world-ref.component";
import {PositionComponent, PositionComponentName} from "../components/position.component";
import {ExportBuildingEntity, ExportEntity, World} from "../world";
import {Vector} from "../abstract/geometry/vector";
import {DimensionsComponent} from "../components/dimensions.component";
import {BuildingStatsComponent, BuildingTypes} from "../components/building-stats.component";
import {BuildableComponent} from "../components/buildable.component";
import {House} from "./house";

export interface FarmOptions {
    position:Vector,
    width:number,
    height: number
}

export class Farm extends GameEntity {

    house:House|null = null;

    constructor(world:World, options:FarmOptions) {
        super();

        this.addComponent(new WorldRefComponent(world))
            .addComponent(new PositionComponent(options.position.x, options.position.y))
            .addComponent(new DimensionsComponent({
                width: options.width,
                height: options.height
            }))
            .addComponent(new BuildingStatsComponent(BuildingTypes.FARM, 'A farm'))
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
            type: 'farm',
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
}