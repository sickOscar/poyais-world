import {GameEntity} from "../abstract/ecs/game-entity";
import {PositionComponent} from "../components/position.component";
import {Vector} from "../abstract/geometry/vector";
import {BuildingStatsComponent, BuildingTypes} from "../components/building-stats.component";
import {ExportEntity, World} from "../world";
import {WorldRefComponent} from "../components/world-ref.component";
import {BuildableComponent} from "../components/buildable.component";

export interface HouseOptions {
    position: Vector,
    name?: string
}

export class House extends GameEntity {

    constructor(world:World, options:HouseOptions) {
        super();

        const positionComponent = new PositionComponent(options.position.x, options.position.y);

        this.addComponent(positionComponent)
            .addComponent(new BuildingStatsComponent(BuildingTypes.HOUSE, options.name || 'A common house'))
            .addComponent(new WorldRefComponent(world))

    }

    export():ExportEntity {
        const positionComponent = <PositionComponent>this.getComponent('POSITION');

        let progressValue = 0;
        const buildable = <BuildableComponent>this.getComponent('BUILDABLE');
        if (buildable) {
            progressValue = buildable.progress;
        }


        const exportEntity:ExportEntity = {
            id: this.id,
            name: 'Some house',
            type: 'house',
            progress: progressValue,
            position: [positionComponent.position.x, positionComponent.position.y],
        }

        return exportEntity;

    }

    print() {
    }

}