import {IState} from "../../../../abstract/fsm/state";
import {Miner} from "../../../../entities/miner";
import {Telegram} from "../../../../abstract/messaging/telegram";
import {StateMachineComponent} from "../../../../components/state-machine.component";
import {PositionComponent} from "../../../../components/position.component";
import {Vector} from "../../../../abstract/geometry/vector";
import {MovementComponent} from "../../../../components/movement.component";
import {WalkingTo} from "../../walking/walking-to.state";
import {BuildingTypes} from "../../../../components/building-stats.component";
import {LumberjackState} from "./lumberjack.state";

export class WalkToTreeState extends WalkingTo implements IState {

    name = "WalkToTree";

    enter(entity: Miner) {
        const tree = entity.locateClosestBuilding(BuildingTypes.TREE);
        const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');

        if (!tree) {
            const smComponent = <StateMachineComponent>entity.getComponent('STATE-MACHINE');
            smComponent.getFSM().revert();
            return;
        }

        movementComponent && movementComponent.arriveOn(tree);

    }

    execute(entity: Miner) {
        this.walk(entity);
        const positionComponent = <PositionComponent>entity.getComponent('POSITION');
        const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');

        if (movementComponent.arriveTarget && Vector.distance(positionComponent.position, movementComponent.arriveTarget) < 0.1) {
            const smComponent = <StateMachineComponent>entity.getComponent('STATE-MACHINE');
            const localFsm = smComponent.getFSM().currentState.localFsm;
            localFsm && localFsm.changeState(new LumberjackState());
        }

    }

    exit(entity: Miner) {
        const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');
        movementComponent && movementComponent.arriveOff();
    }

    onMessage(owner: any, telegram: Telegram): boolean {
        return true;
    }

}