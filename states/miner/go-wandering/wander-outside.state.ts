import {IState, State} from "../../../abstract/fsm/state";
import {Miner} from "../../../entities/miner";
import {Telegram} from "../../../abstract/messaging/telegram";
import {WalkingTo} from "../walking/walking-to.state";
import {MovementComponent} from "../../../components/movement.component";
import {StateMachineComponent} from "../../../components/state-machine.component";
import {GoDrinkingState} from "../go-drinking/go-drinking.state";
import {GoMiningState} from "../go-mining/go-mining.state";
import {GoLumberjackingState} from "../go-lumberjacking/go-lumberjacking.state";
import {GoRest} from "../go-rest/go-rest";

export class WanderOutsideState extends WalkingTo implements IState {

    name = "WanderOutside";

    exit(owner: Miner): void {
        (<MovementComponent>owner.getComponent("MOVEMENT")).wanderOff();
    }

    onMessage(owner: Miner, telegram: Telegram): boolean {
        return false;
    }

    enter(owner: Miner) {
        (<MovementComponent>owner.getComponent("MOVEMENT")).wanderOn();
    }

    execute(owner: Miner) {
        this.walk(owner);

        const chance = Math.random();

        const fsmComponent = <StateMachineComponent>owner.getComponent('STATE-MACHINE');

        if (chance < 0.01) {
            fsmComponent.getFSM().changeState(new GoRest());
            fsmComponent.getFSM().changeState(new GoDrinkingState())
            return;
        }

        if (chance > 0.01 && chance < 0.02) {
            fsmComponent.getFSM().changeState(new GoRest());
            fsmComponent.getFSM().changeState(new GoMiningState())
            return;
        }

        if (chance > 0.02 && chance < 0.03) {
            fsmComponent.getFSM().changeState(new GoRest());
            fsmComponent.getFSM().changeState(new GoLumberjackingState())
            return;
        }


    }


}