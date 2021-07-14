import {Telegram} from "../messaging/telegram";
import {GameEntity} from "../ecs/game-entity";
import {StateMachine} from "./state-machine";

export interface IState {
  name:string;
  localFsm?:StateMachine|null;
  execute(owner:GameEntity):void;
  enter(owner:GameEntity):void;
  exit(owner:GameEntity):void;
  onMessage(owner:GameEntity, telegram:Telegram):boolean
}

export abstract class State implements IState {

  name = "AbstractState";

  execute(owner: GameEntity) {
  }

  enter(owner: GameEntity) {
  }

  exit(owner: GameEntity) {
  }

  onMessage(owner: any, telegram: Telegram):boolean {
    return false;
  }
}
