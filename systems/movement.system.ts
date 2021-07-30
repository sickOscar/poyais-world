import {System} from "../abstract/ecs/system";
import {World} from "../world";
import {GameEntity} from "../abstract/ecs/game-entity";
import {StateMachineComponent} from "../components/state-machine.component";
import {MovementComponent} from "../components/movement.component";
import {PositionComponent, PositionComponentName} from "../components/position.component";

export class MovementSystem implements System {

    world:World;

    constructor(world:World) {
        this.world = world;
    }

    update(delta:number, time:number) {
        this.world.em.entities.forEach((entity:GameEntity) => {

            const movementComponent:MovementComponent = <MovementComponent>entity.getComponent('MOVEMENT');
            if (movementComponent) {

                if (movementComponent.isMoving()) {

                    const positionComponent:PositionComponent = <PositionComponent>entity.getComponent(PositionComponentName);

                    if (positionComponent) {
                        positionComponent.position = movementComponent.updatePosition(positionComponent.position, delta);
                    }

                }

            }

        })


    }

}