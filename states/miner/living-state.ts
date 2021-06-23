import {IState, State} from "../../abstract/fsm/state";
import {Miner} from "../../entities/miner";
import {Telegram} from "../../abstract/messaging/telegram";
import {HumanStatsComponent} from "../../components/human-stats-component";
import {StateMachineComponent} from "../../components/state-machine-component";
import {DiedState} from "./died-state";
import {WorldRefComponent} from "../../components/world-ref-component";

export class LivingState extends State implements IState {

    name = "LivingState";

    enter(entity:Miner) {

    }

    execute(entity:Miner) {
        const humanStats = <HumanStatsComponent>entity.getComponent('HUMAN-STATS');
        const worldComponent = <WorldRefComponent>entity.getComponent('WORLD-REF');
        const delta = worldComponent.world.frame.deltaTime;

        humanStats.age += 1/365 * delta;

        if (humanStats.age >= humanStats.max_age) {
            entity.die();
        }

        if (humanStats.thirst >= humanStats.max_thirst) {
            entity.die();
        }

        if (humanStats.fatigue >= humanStats.max_fatigue) {
            entity.die();
        }

    }

    exit(entity:Miner) {

    }

    onMessage(owner:any, telegram:Telegram):boolean {
        return true;
    }

}