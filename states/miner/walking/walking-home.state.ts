import {IState} from "../../../abstract/fsm/state";
import {Miner} from "../../../entities/miner";
import {Telegram} from "../../../abstract/messaging/telegram";
import {StateMachineComponent} from "../../../components/state-machine.component";
import {PositionComponent} from "../../../components/position.component";
import {Vector} from "../../../abstract/geometry/vector";
import {MovementComponent} from "../../../components/movement.component";
import {HasHouseComponent} from "../../../components/has-house.component";
import {WalkingTo} from "./walking-to.state";

export class WalkingHomeState extends WalkingTo implements IState {

    name = "WalkingHome";

    enter(entity:Miner) {
        const hasHouse = <HasHouseComponent>entity.getComponent('HAS-HOUSE');
        const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');

        if (hasHouse) {
            movementComponent.arriveOn((<PositionComponent>hasHouse.house.getComponent('POSITION')).position);
        }


    }

    execute(entity:Miner) {

        const hasHouse = <HasHouseComponent>entity.getComponent('HAS-HOUSE');

        this.walk(entity);

        const positionComponent = <PositionComponent>entity.getComponent('POSITION');
        const housePosition = (<PositionComponent>hasHouse.house.getComponent('POSITION')).position;

        if (Vector.distance(positionComponent.position, housePosition) < 1) {
            const smComponent = <StateMachineComponent>entity.getComponent('STATE-MACHINE');
            const localFsm = smComponent.getFSM().currentState.localFsm;

            if (localFsm) {
                localFsm.revert()
            }
        }

    }

    exit(entity:Miner) {
        const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');
        movementComponent && movementComponent.arriveOff();
    }

    onMessage(owner:any, telegram:Telegram):boolean {
        return true;
    }

}