import {IState, State} from "../../abstract/fsm/state";
import {Miner} from "../../entities/miner";
import {Telegram} from "../../abstract/messaging/telegram";

export class DiedState extends State implements IState {

    name = "DiedState";

    enter(entity:Miner) {

    }

    execute(entity:Miner) {

    }

    exit(entity:Miner) {

    }

    onMessage(owner:any, telegram:Telegram):boolean {
        return true;
    }

}