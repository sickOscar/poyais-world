import {GameEntity} from "../abstract/ecs/game-entity";
import {PositionComponent, PositionComponentName} from "../components/position.component";
import {Vector} from "../abstract/geometry/vector";
import {BuildingStatsComponent, BuildingTypes} from "../components/building-stats.component";
import {ExportBuildingEntity, ExportEntity, World} from "../world";
import {WorldRefComponent} from "../components/world-ref.component";
import {DimensionsComponent} from "../components/dimensions.component";
import {HasEmployeesComponent} from "../components/has-employees.component";
import {Jobs} from "../components/job.component";

export interface TavernOptions {
    position: Vector,
    name:string
}

export class Tavern extends GameEntity {

    constructor(world:World, options:TavernOptions) {
        super();

        const positionComponent = new PositionComponent(options.position.x, options.position.y);

        this.addComponent(positionComponent)
            .addComponent(new BuildingStatsComponent(BuildingTypes.TAVERN, options.name))
            .addComponent(new WorldRefComponent(world))
            .addComponent(new DimensionsComponent({
                width: 60,
                height: 60
            }))
            .addComponent(new HasEmployeesComponent(4, Jobs.BARTENDER))

    }

    export():ExportBuildingEntity {
        const positionComponent = <PositionComponent>this.getComponent(PositionComponentName);
        const buildingStats = <BuildingStatsComponent>this.getComponent('BUILDING-STATS');
        const dim = <DimensionsComponent>this.getComponent('DIMENSIONS');

        const exportEntity:ExportBuildingEntity = {
            id: this.id,
            name: buildingStats.buildingName,
            type: 'tavern',
            position: [positionComponent.position.x, positionComponent.position.y],
            dimensions: {
                width: dim.width,
                height: dim.height
            }
        }

        return exportEntity;

    }

    print() {
    }

}