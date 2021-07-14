import {IState, State} from "../../../abstract/fsm/state";
import {Miner} from "../../../entities/miner";
import {Telegram} from "../../../abstract/messaging/telegram";
import {WalkingToTavernState} from "./sub/walking-to-tavern.state";
import {StateMachine} from "../../../abstract/fsm/state-machine";

export class GoDrinkingState extends State implements IState {

    name = "GoDrinking";

    localFsm:StateMachine | null = null;

    enter(entity:Miner) {
        this.localFsm = new StateMachine(entity);
        this.localFsm.changeState(new WalkingToTavernState())
    }

    execute(entity:Miner) {
        this.localFsm && this.localFsm.update();
    }

    exit(entity:Miner) {
        this.localFsm && this.localFsm.currentState.exit(entity);
    }

    onMessage(owner:any, telegram:Telegram):boolean {
        return true;
    }

}