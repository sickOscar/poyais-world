import {IState, State} from "../../abstract/fsm/state";
import {Miner} from "../../entities/miner";
import {Telegram} from "../../abstract/messaging/telegram";
import {HumanStatsComponent} from "../../components/human-stats.component";
import {WorldRefComponent} from "../../components/world-ref.component";
import {StateMachineComponent} from "../../components/state-machine.component";
import {GoRest} from "./go-rest/go-rest";
import {HasHouseComponent} from "../../components/has-house.component";
import {BuildableComponent} from "../../components/buildable.component";

export class LivingState extends State implements IState {

    name = "LivingState";

    enter(entity: Miner) {

    }

    execute(entity: Miner) {
        const humanStats = <HumanStatsComponent>entity.getComponent('HUMAN-STATS');
        const worldComponent = <WorldRefComponent>entity.getComponent('WORLD-REF');
        const delta = worldComponent.world.frame.deltaTime;
        const fsmComponent = <StateMachineComponent>entity.getComponent('STATE-MACHINE');
        const currentStateName = fsmComponent.getFSM().currentState.name;

        humanStats.age += 1 / 10 * delta;


        if (
            humanStats.age >= humanStats.maxAge
            && currentStateName !== 'DiedState'
        ) {
            entity.die();
            return;
        }

        if (
            humanStats.fatigue >= humanStats.maxFatigue
            && currentStateName !== 'RestAtHome'
        ) {

            // check if he has a house
            const hasHouse = <HasHouseComponent>entity.getComponent('HAS-HOUSE');
            if (!hasHouse) {
                return;
            }

            // or if it is complete
            const buildable = <BuildableComponent>hasHouse.house.getComponent('BUILDABLE');
            if (buildable.progress < 100) {
                return;
            }

            fsmComponent.getFSM().changeState(new GoRest())
        }

        // if (humanStats.maxFatigue >= humanStats.maxFatigue) {
        //     fsmComponent.getFSM().changeState(new GoRest());
        // }

        // if (humanStats.thirst >= humanStats.maxThirst) {
        //     entity.die();
        // }
        //
        // if (humanStats.fatigue >= humanStats.maxFatigue) {
        //     entity.die();
        // }

    }

    exit(entity: Miner) {

    }

    onMessage(owner: any, telegram: Telegram): boolean {
        return true;
    }

}