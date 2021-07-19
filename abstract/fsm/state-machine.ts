import {Telegram} from "../messaging/telegram";
import {IState, State} from "./state";
import {EmptyState} from "../../states/empty-state";
import {GameEntity} from "../ecs/game-entity";

export class StateMachine {

  owner: GameEntity;
  currentState: IState = new EmptyState();
  previousState: IState = new EmptyState();
  globalState: IState = new EmptyState();
  previousGlobalState: IState = new EmptyState();

  constructor(owner: any) {
    this.owner = owner;

  }

  update() {
    if (this.globalState) {
      this.globalState.execute(this.owner)
    }
    if (this.currentState) {
      this.currentState.execute(this.owner)
    }
  }

  changeState(newState: IState) {
    if (this.currentState) {
      this.previousState = this.currentState;
      this.currentState.exit(this.owner);
    }
    this.currentState = newState;
    this.currentState.enter(this.owner)
  }

  changeGlobalState(newState: IState) {
    if (this.globalState) {
      this.previousGlobalState = this.globalState;
      this.globalState.exit(this.owner);
    }
    this.globalState = newState;
    this.globalState.enter(this.owner)
  }

  revert() {
    if (this.previousState) {
      this.changeState(this.previousState);
    }
  }

  isInState(state: State) {
    return this.currentState === state;
  }

  handleMessage(telegram: Telegram):boolean {
    if (this.currentState && this.currentState.onMessage(this.owner, telegram)) {
      return true;
    }
    if (this.globalState && this.globalState.onMessage(this.owner, telegram)) {
      return true
    }
    return false;
  }

}
