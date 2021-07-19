import {IState, State} from "../../../../abstract/fsm/state";
import {Miner} from "../../../../entities/miner";
import {Telegram} from "../../../../abstract/messaging/telegram";
import {HasHouseComponent} from "../../../../components/has-house.component";
import {WorldRefComponent} from "../../../../components/world-ref.component";
import {HasBagComponent} from "../../../../components/has-bag.component";
import {BuildableComponent} from "../../../../components/buildable.component";
import {StateMachineComponent} from "../../../../components/state-machine.component";
import {GoLumberjackingState} from "../../go-lumberjacking/go-lumberjacking.state";
import {WanderOutsideState} from "../../go-wandering/wander-outside.state";
import {FarmerComponent} from "../../../../components/farmer.component";
import {HasOwnerComponent} from "../../../../components/has-owner.component";
import {GoRest} from "../../go-rest/go-rest";

export class BuildingHouseState extends State implements IState {

    name = "BuildingHouse";

    enter(entity:Miner) {
        const hasHouse = <HasHouseComponent>entity.getComponent('HAS-HOUSE');
        const farmer = <FarmerComponent>entity.getComponent('FARMER');

        if (!hasHouse) {

            if (farmer) {

                const desiredWidth = 60 + Math.round(Math.random() * 30);
                const desiredHeight = 60 + Math.round(Math.random() * 30);

                const existingFarm = entity.findEmptyFarm();
                if (existingFarm) {
                    if (existingFarm.house) {
                        existingFarm.house.addComponent(new HasOwnerComponent(entity));
                        entity.addComponent(new HasHouseComponent(existingFarm.house));
                        farmer.farm = existingFarm;
                        return;
                    }
                } else {
                    const farmLocation = entity.locatePlaceToBuildFarm(desiredWidth, desiredHeight);

                    if (farmLocation) {
                        const farm = farmLocation[0].buildFarm(farmLocation[1], farmLocation[2], farmLocation[3]);
                        if (farm.house) {
                            farm.house.addComponent(new HasOwnerComponent(entity));
                            entity.addComponent(new HasHouseComponent(farm.house));
                        }
                        farmer.farm = farm;
                        return;
                    }
                }




            } else {

                const desiredWidth = Math.round(10 + Math.round(Math.random() * 20));
                const desiredHeight = Math.round(10 + Math.round(Math.random() * 20));

                const existingHouse = entity.findEmptyHouse();
                if (existingHouse) {
                    entity.addComponent(new HasHouseComponent(existingHouse))
                    existingHouse.addComponent(new HasOwnerComponent(entity));
                    return;

                } else {
                    const houseLocation = entity.locatePlaceToBuildHouse(desiredWidth, desiredHeight);

                    if (houseLocation) {
                        const house = houseLocation[0].buildHouse(houseLocation[1], houseLocation[2], houseLocation[3]);
                        entity.addComponent(new HasHouseComponent(house))
                        house.addComponent(new HasOwnerComponent(entity));
                        return;
                    }
                }

            }


            // if no space for house found
            const sm = <StateMachineComponent>entity.getComponent('STATE-MACHINE');
            sm.getFSM().changeState(new WanderOutsideState());
            // sm.getFSM().changeState(new GoMiningState());
        }

    }

    execute(entity:Miner) {
        const stateMachine = <StateMachineComponent>entity.getComponent('STATE-MACHINE');
        const bag = <HasBagComponent>entity.getComponent('HAS-BAG');
        const hasHouse = <HasHouseComponent>entity.getComponent('HAS-HOUSE');
        const worldRef = <WorldRefComponent>entity.getComponent('WORLD-REF');
        const delta = worldRef.world.frame.deltaTime;

        if (bag.wood > 0) {
            const buildable = <BuildableComponent>hasHouse.house.getComponent('BUILDABLE');
            if (buildable) {

                const consume = 1;

                buildable.progress = Math.min(100, buildable.progress + (consume * 3 * delta));
                bag.wood = Math.max(0, bag.wood - (consume * delta));

                if (buildable.progress === 100) {
                    stateMachine.getFSM().changeState(new GoRest());
                }

            }
        } else {
            stateMachine.getFSM().changeState(new GoLumberjackingState());
        }

    }

    exit(entity:Miner) {

    }

    onMessage(owner:any, telegram:Telegram):boolean {
        return true;
    }

}