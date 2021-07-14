import {IState, State} from "../../../abstract/fsm/state";
import {Miner} from "../../../entities/miner";
import {Telegram} from "../../../abstract/messaging/telegram";
import {StateMachine} from "../../../abstract/fsm/state-machine";
import {WalkToTreeState} from "./sub/walk-to-tree.state";

export class GoLumberjackingState extends State implements IState {

    name = "GoLumberjacking";

    localFsm:StateMachine | null = null;

    enter(entity:Miner) {
        this.localFsm = new StateMachine(entity);
        this.localFsm.changeState(new WalkToTreeState())
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