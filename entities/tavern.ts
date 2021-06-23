import {GameEntity} from "../abstract/ecs/game-entity";
import {PositionComponent} from "../components/position-component";
import {Vector} from "../abstract/geometry/vector";
import {BuildingStatsComponent, BuildingTypes} from "../components/building-stats-component";
import {ExportEntity} from "../world";
import {HumanStatsComponent} from "../components/human-stats-component";
import {MovementComponent} from "../components/movement-component";

export class Tavern extends GameEntity {

    constructor() {
        super();

        const positionComponent = new PositionComponent();
        positionComponent.position = new Vector(100, 100);

        this.addComponent(positionComponent)
            .addComponent(new BuildingStatsComponent(BuildingTypes.TAVERN));

    }

    export():ExportEntity {
        const positionComponent = <PositionComponent>this.getComponent('POSITION');

        const exportEntity:ExportEntity = {
            id: this.id,
            name: 'U Tavernello',
            type: 'tavern',
            position: [positionComponent.position.x, positionComponent.position.y],
        }

        return exportEntity;

    }

    print() {
    }

}