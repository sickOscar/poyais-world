import {IState, State} from "../abstract/fsm/state";
import {GameEntity} from "../abstract/ecs/game-entity";
import {Telegram} from "../abstract/messaging/telegram";

export class EmptyState extends State implements IState {

    name = "WalkingToTavern";

    enter(entity:GameEntity) {

    }

    execute(entity:GameEntity) {
    }

    exit(entity:GameEntity) {

    }

    onMessage(owner:any, telegram:Telegram):boolean {
        return true;
    }

}