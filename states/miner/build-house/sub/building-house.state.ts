import {IState, State} from "../../../../abstract/fsm/state";
import {Miner} from "../../../../entities/miner";
import {Telegram} from "../../../../abstract/messaging/telegram";
import {HasHouseComponent} from "../../../../components/has-house.component";
import {WorldRefComponent} from "../../../../components/world-ref.component";
import {House} from "../../../../entities/house";
import {HasBagComponent} from "../../../../components/has-bag.component";
import {BuildableComponent} from "../../../../components/buildable.component";
import {StateMachineComponent} from "../../../../components/state-machine.component";
import {GoLumberjackingState} from "../../go-lumberjacking/go-lumberjacking.state";

export class BuildingHouseState extends State implements IState {

    name = "BuildingHouse";

    enter(entity:Miner) {
        const hasHouse = <HasHouseComponent>entity.getComponent('HAS-HOUSE');

        if (!hasHouse) {
            const housePosition = entity.locatePlaceToBuildHouse();
            const worldRef = <WorldRefComponent>entity.getComponent('WORLD-REF');

            const house = new House(worldRef.world, {
                position: housePosition
            })
            worldRef.world.em.entities.set(house.id, house);
            house.addComponent(new BuildableComponent());

            entity.addComponent(new HasHouseComponent(house))
            return;
        }

    }

    execute(entity:Miner) {

        const bag = <HasBagComponent>entity.getComponent('HAS-BAG');
        const hasHouse = <HasHouseComponent>entity.getComponent('HAS-HOUSE');
        const worldRef = <WorldRefComponent>entity.getComponent('WORLD-REF');
        const delta = worldRef.world.frame.deltaTime;

        if (bag.wood > 0) {
            const buildable = <BuildableComponent>hasHouse.house.getComponent('BUILDABLE');
            if (buildable) {

                const consume = 1;

                buildable.progress = Math.min(100, buildable.progress + (consume * delta));
                bag.wood = Math.max(0, bag.wood - (consume * delta));

            }
        } else {
            const stateMachine = <StateMachineComponent>entity.getComponent('STATE-MACHINE');
            stateMachine.getFSM().changeState(new GoLumberjackingState());
        }

    }

    exit(entity:Miner) {

    }

    onMessage(owner:any, telegram:Telegram):boolean {
        return true;
    }

}