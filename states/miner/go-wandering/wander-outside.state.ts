import {IState} from "../../../abstract/fsm/state";
import {Miner} from "../../../entities/miner";
import {Telegram} from "../../../abstract/messaging/telegram";
import {WalkingTo} from "../walking/walking-to.state";
import {MovementComponent} from "../../../components/movement.component";
import {WorldRefComponent} from "../../../components/world-ref.component";

export class WanderOutsideState extends WalkingTo implements IState {

    name = "WanderOutside";

    timePassedWandering = 0;
    maxTimeWandering = 5 + Math.random() * 5;

    onMessage(owner: Miner, telegram: Telegram): boolean {
        return false;
    }

    enter(owner: Miner) {
        const movement = <MovementComponent>owner.getComponent("MOVEMENT");
        movement && movement.wanderOn()
    }

    execute(owner: Miner) {
        this.walk(owner);

        const w = <WorldRefComponent>owner.getComponent('WORLD-REF');
        const delta = w.world.frame.deltaTime;

        this.timePassedWandering += delta;
        if (this.timePassedWandering >= this.maxTimeWandering) {
            owner.doRandomAction();
        }


    }

    exit(owner: Miner): void {
        const movement = <MovementComponent>owner.getComponent("MOVEMENT");
        movement && movement.wanderOff();
    }


}