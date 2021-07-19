import {IState, State} from "../../../../abstract/fsm/state";
import {Miner} from "../../../../entities/miner";
import {Telegram} from "../../../../abstract/messaging/telegram";
import {HumanStatsComponent} from "../../../../components/human-stats.component";
import {StateMachineComponent} from "../../../../components/state-machine.component";
import {StateMachine} from "../../../../abstract/fsm/state-machine";
import {WorldRefComponent} from "../../../../components/world-ref.component";
import {WanderOutsideState} from "../../go-wandering/wander-outside.state";
import {GoDrinkingState} from "../../go-drinking/go-drinking.state";
import {IsInBuildingComponent} from "../../../../components/is-in-building.component";
import {HasHouseComponent} from "../../../../components/has-house.component";
import {FarmerComponent} from "../../../../components/farmer.component";

export class RestingAtHomeState extends State implements IState {

    name = "RestingAtHome";


    enter(entity: Miner) {
        const hasHouseComponent = <HasHouseComponent>entity.getComponent('HAS-HOUSE');

        const house = hasHouseComponent.house;
        if (house) {
            entity.addComponent(new IsInBuildingComponent(house))
        }
    }

    execute(entity: Miner) {

        const humanStats = <HumanStatsComponent>entity.getComponent('HUMAN-STATS');
        const worldComponent = <WorldRefComponent>entity.getComponent('WORLD-REF');
        const delta = worldComponent.world.frame.deltaTime;
        const stateMachineComponent = <StateMachineComponent>entity.getComponent('STATE-MACHINE')
        const fsm = <StateMachine>stateMachineComponent.getFSM();
        const farmer = <FarmerComponent>entity.getComponent('FARMER')


        humanStats.boredom += 1 * delta;
        humanStats.thirst += 1 * delta;
        humanStats.fatigue = Math.max(0, humanStats.fatigue - (20 * delta));

        if (humanStats.fatigue > 10) {
            return;
        }

        // wander if bored
        if (humanStats.boredom >= humanStats.maxBoredom) {
            humanStats.boredom = 0;
            fsm.changeState(new WanderOutsideState());
            return;
        }

        if (
            fsm.previousState
            && (fsm.previousState.name !== 'RestAtHome' && fsm.previousState.name !== 'EmptyState')
        ) {
            fsm.revert();
        }

    }

    exit(entity: Miner) {
        entity.removeComponent('IS-IN-BUILDING');
    }

    onMessage(owner: any, telegram: Telegram): boolean {
        return true;
    }

}