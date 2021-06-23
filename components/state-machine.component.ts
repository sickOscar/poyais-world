import {Component} from "../abstract/ecs/component";
import {StateMachine} from "../abstract/fsm/state-machine";

export class StateMachineComponent implements Component {

    name = "STATE-MACHINE";
    fsm:StateMachine = new StateMachine(null);

    constructor() {

    }

    setFSM(stateMachine:StateMachine) {
        this.fsm = stateMachine;
    }

    getFSM():StateMachine {
        return this.fsm;
    }

    update() {
        if (this.fsm) {
            this.fsm.update();
        }
    }

}