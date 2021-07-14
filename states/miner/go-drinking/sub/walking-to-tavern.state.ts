import {IState} from "../../../../abstract/fsm/state";
import {Miner} from "../../../../entities/miner";
import {Telegram} from "../../../../abstract/messaging/telegram";
import {MovementComponent} from "../../../../components/movement.component";
import {Vector} from "../../../../abstract/geometry/vector";
import {PositionComponent} from "../../../../components/position.component";
import {StateMachineComponent} from "../../../../components/state-machine.component";
import {DrinkingInTavernState} from "./drinking-in-tavern.state";
import {WalkingTo} from "../../walking/walking-to.state";
import {BuildingTypes} from "../../../../components/building-stats.component";

export class WalkingToTavernState extends WalkingTo implements IState {

    name = "WalkingToTavern";

    enter(entity:Miner) {
        const tavern = entity.locateClosestBuilding(BuildingTypes.TAVERN);
        (<MovementComponent>entity.getComponent("MOVEMENT")).seekOn(tavern);
    }

    execute(entity:Miner) {

        this.walk(entity);

        const positionComponent = <PositionComponent>entity.getComponent('POSITION');
        const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');

        if (movementComponent.seekTarget && Vector.distance(movementComponent.seekTarget, positionComponent.position) < 1) {
            const smComponent = <StateMachineComponent>entity.getComponent('STATE-MACHINE');
            const localFsm = smComponent.getFSM().currentState.localFsm;
            localFsm && localFsm.changeState(new DrinkingInTavernState());
        }

    }

    exit(entity:Miner) {
        const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');
        if (movementComponent) {
            movementComponent.seekOff();
        }
    }

    onMessage(owner:any, telegram:Telegram):boolean {
        return true;
    }

}