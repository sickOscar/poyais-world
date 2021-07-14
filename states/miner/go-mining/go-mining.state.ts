import {IState, State} from "../../../abstract/fsm/state";
import {Miner} from "../../../entities/miner";
import {Telegram} from "../../../abstract/messaging/telegram";
import {StateMachine} from "../../../abstract/fsm/state-machine";
import {WalkingToMineState} from "./sub/walking-to-mine.state";

export class GoMiningState extends State implements IState {

    name = "GoMiningState";

    localFsm:StateMachine | null = null;

    enter(entity:Miner) {
        this.localFsm = new StateMachine(entity);
        this.localFsm.changeState(new WalkingToMineState())
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