import {System} from "../abstract/ecs/system";
import {World} from "../world";
import {GameEntity} from "../abstract/ecs/game-entity";
import {StateMachineComponent} from "../components/state-machine-component";

export class StateMachineSystem implements System {

    world:World;

    constructor(world:World) {
        this.world = world;
    }

    update(delta:number, time:number) {
        this.world.em.entities.forEach((entity:GameEntity) => {

            // entity.print();

            const stateMachineComponent:StateMachineComponent = <StateMachineComponent>entity.getComponent('STATE-MACHINE');
            if (stateMachineComponent) {
                stateMachineComponent.update();
            }

        })


    }

}