import {GameEntity} from "../abstract/ecs/game-entity";
import {PositionComponent, PositionComponentName} from "../components/position.component";
import {Vector} from "../abstract/geometry/vector";
import {ExportBuildingEntity, ExportEntity, World} from "../world";
import {BuildingStatsComponent, BuildingTypes} from "../components/building-stats.component";
import {DimensionsComponent} from "../components/dimensions.component";
import {HasEmployeesComponent} from "../components/has-employees.component";
import {Jobs} from "../components/job.component";
import {Depositables, DepositComponent} from "../components/has-deposit.component";

export interface WarehouseOptions {
    position:Vector
}

export class Warehouse extends GameEntity {

    constructor(world:World, options:WarehouseOptions) {
        super();

        this.addComponent(new PositionComponent(options.position.x, options.position.y))
            .addComponent(new BuildingStatsComponent(BuildingTypes.WAREHOUSE, 'Warehouse'))
            .addComponent(new DimensionsComponent({
                width: 50,
                height: 30
            }))
            .addComponent(new HasEmployeesComponent(10, Jobs.WAREHOUSEMAN))
            .addComponent(new DepositComponent([Depositables.MALT, Depositables.WOOD]));
    }

    export():ExportBuildingEntity {
        const positionComponent = <PositionComponent>this.getComponent(PositionComponentName);
        const dimensionsComponent = <DimensionsComponent>this.getComponent('DIMENSIONS');

        const exportEntity: ExportEntity = {
            id: this.id,
            name: 'Warehouse',
            type: 'warehouse',
            position: [positionComponent.position.x, positionComponent.position.y],
        }

        const exportBuilding: Partial<ExportBuildingEntity> = {};

        exportBuilding.dimensions = {
            width: dimensionsComponent.width,
            height: dimensionsComponent.height
        };

        return Object.assign({}, exportEntity, exportBuilding);
    }

}