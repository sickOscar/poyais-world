import {GameEntity} from "../abstract/ecs/game-entity";
import {PositionComponent} from "../components/position.component";
import {Vector} from "../abstract/geometry/vector";
import {World} from "../world";
import {BuildingStatsComponent, BuildingTypes} from "../components/building-stats.component";

export interface WarehouseOptions {
    position:Vector
}

class Warehouse extends GameEntity {

    constructor(world:World, options:WarehouseOptions) {
        super();

        this.addComponent(new PositionComponent(options.position.x, options.position.y))
            .addComponent(new BuildingStatsComponent(BuildingTypes.WAREHOUSE, 'Warehouse'))

    }

}