import {IState} from "../../../../abstract/fsm/state";
import {Miner} from "../../../../entities/miner";
import {Telegram} from "../../../../abstract/messaging/telegram";
import {StateMachineComponent} from "../../../../components/state-machine.component";
import {PositionComponent, PositionComponentName} from "../../../../components/position.component";
import {Vector} from "../../../../abstract/geometry/vector";
import {MovementComponent} from "../../../../components/movement.component";
import {WalkingTo} from "../../walking/walking-to.state";
import {BuildingTypes} from "../../../../components/building-stats.component";
import {LumberjackState} from "./lumberjack.state";
import {WorldRefComponent} from "../../../../components/world-ref.component";

export class WalkToTreeState extends WalkingTo implements IState {

    name = "WalkToTree";

    seekInterval = 2;

    enter(entity: Miner) {
        this.locateTree(entity);
    }

    execute(entity: Miner) {
        this.walk(entity);

        const positionComponent = <PositionComponent>entity.getComponent(PositionComponentName);
        const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');

        if (movementComponent.arriveTarget && Vector.distance(positionComponent.position, movementComponent.arriveTarget) < 1) {
            const smComponent = <StateMachineComponent>entity.getComponent('STATE-MACHINE');
            const localFsm = smComponent.getFSM().currentState.localFsm;
            localFsm && localFsm.changeState(new LumberjackState());
        }

        const w = <WorldRefComponent>entity.getComponent('WORLD-REF');
        const delta = w.world.frame.deltaTime
        this.seekInterval = Math.max(0, this.seekInterval - delta);

        if (this.seekInterval === 0) {
            this.seekInterval = 2;
            this.locateTree(entity);
        }


    }

    exit(entity: Miner) {
        const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');
        movementComponent && movementComponent.arriveOff();
    }

    onMessage(owner: any, telegram: Telegram): boolean {
        return true;
    }

    locateTree(entity:Miner) {
        const tree = entity.locateClosestBuilding(BuildingTypes.TREE);
        const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');

        if (!tree) {
            const smComponent = <StateMachineComponent>entity.getComponent('STATE-MACHINE');
            smComponent.getFSM().revert();
            return;
        }

        movementComponent && movementComponent.arriveOn(tree);
    }

}