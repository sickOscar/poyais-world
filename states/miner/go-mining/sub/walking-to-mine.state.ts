import {IState} from "../../../../abstract/fsm/state";
import {Miner} from "../../../../entities/miner";
import {Telegram} from "../../../../abstract/messaging/telegram";
import {StateMachineComponent} from "../../../../components/state-machine.component";
import {PositionComponent} from "../../../../components/position.component";
import {Vector} from "../../../../abstract/geometry/vector";
import {MovementComponent} from "../../../../components/movement.component";
import {WalkingTo} from "../../walking/walking-to.state";
import {BuildingTypes} from "../../../../components/building-stats.component";
import {MiningState} from "./mining.state";

export class WalkingToMineState extends WalkingTo implements IState {

    name = "WalkingToMine";

    enter(entity:Miner) {
        const mine = entity.locateClosestBuilding(BuildingTypes.MINE);
        const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');

        if (mine && movementComponent) {
            movementComponent.arriveOn(mine);
        } else {
            const sm = <StateMachineComponent>entity.getComponent('STATE-MACHINE');
            sm.getFSM().revert();
        }

    }

    execute(entity:Miner) {
        this.walk(entity);
        const positionComponent = <PositionComponent>entity.getComponent('POSITION');
        const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');


        if (movementComponent.arriveTarget && Vector.distance(positionComponent.position, movementComponent.arriveTarget) < 1) {
            const smComponent = <StateMachineComponent>entity.getComponent('STATE-MACHINE');
            const localFsm = smComponent.getFSM().currentState.localFsm;
            localFsm && localFsm.changeState(new MiningState());
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