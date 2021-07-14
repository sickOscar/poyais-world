import {GameEntity} from "../abstract/ecs/game-entity";
import {PositionComponent} from "../components/position.component";
import {Vector} from "../abstract/geometry/vector";
import {BuildingStatsComponent, BuildingTypes} from "../components/building-stats.component";
import {ExportEntity, World} from "../world";
import {WorldRefComponent} from "../components/world-ref.component";
import {MineLifecycleComponent} from "../components/mine-lifecycle.component";

export interface MineOptions {
    position: Vector,
    regenerationTime?: number,
    max?: number,
    name?:string
}

export class Mine extends GameEntity {

    constructor(world:World, options:MineOptions) {
        super();

        this.addComponent(new PositionComponent(options.position.x, options.position.y))
            .addComponent(new BuildingStatsComponent(BuildingTypes.MINE, options.name || 'A beautiful mine'))
            .addComponent(new WorldRefComponent(world))
            .addComponent(new MineLifecycleComponent())

    }

    export():ExportEntity {
        const positionComponent = <PositionComponent>this.getComponent('POSITION');

        const exportEntity:ExportEntity = {
            id: this.id,
            name: 'Some house',
            type: 'mine',
            position: [positionComponent.position.x, positionComponent.position.y],
        }

        return exportEntity;

    }

    print() {
    }

}