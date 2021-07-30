import {IState} from "../../../../abstract/fsm/state";
import {Miner} from "../../../../entities/miner";
import {Telegram} from "../../../../abstract/messaging/telegram";
import {StateMachineComponent} from "../../../../components/state-machine.component";
import {PositionComponent, PositionComponentName} from "../../../../components/position.component";
import {Vector} from "../../../../abstract/geometry/vector";
import {MovementComponent} from "../../../../components/movement.component";
import {WalkingTo} from "../../walking/walking-to.state";
import {JobComponent} from "../../../../components/job.component";

export class WalkToWorkplaceState extends WalkingTo implements IState {

    name = "WalkToWorkplace";

    enter(entity:Miner) {
        const job = <JobComponent>entity.getComponent('JOB');
        const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');

        if (job && movementComponent) {
            movementComponent.arriveOn((<PositionComponent>job.workplace.getComponent(PositionComponentName)).position);
        }


    }

    execute(entity:Miner) {

        const job = <JobComponent>entity.getComponent('JOB');

        this.walk(entity);

        const positionComponent = <PositionComponent>entity.getComponent(PositionComponentName);
        const jobPosition = (<PositionComponent>job.workplace.getComponent(PositionComponentName)).position;

        if (Vector.distance(positionComponent.position, jobPosition) < 1) {
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