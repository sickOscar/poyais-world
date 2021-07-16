import {GameEntity} from "../abstract/ecs/game-entity";
import {StateMachineComponent} from "../components/state-machine.component";
import {StateMachine} from "../abstract/fsm/state-machine";
import {HumanStatsComponent} from "../components/human-stats.component";
import {PositionComponent} from "../components/position.component";
import {LivingState} from "../states/miner/living.state";
import {MovementComponent} from "../components/movement.component";
import {WorldRefComponent} from "../components/world-ref.component";
import {ExportEntity, ExportHumanEntity, World} from "../world";
import {Vector} from "../abstract/geometry/vector";
import {BuildingStatsComponent, BuildingTypes} from "../components/building-stats.component";
import {HasMoneyToSpendComponent} from "../components/has-money-to-spend.component";
import {DiedState} from "../states/miner/died.state";
import {HasHouseComponent} from "../components/has-house.component";
import {HasBagComponent} from "../components/has-bag.component";
import {Bank} from "./bank";
import {IsInBuildingComponent} from "../components/is-in-building.component";
import {GoRest} from "../states/miner/go-rest/go-rest";
import {House} from "./house";
import {IState} from "../abstract/fsm/state";
import {BuildableComponent} from "../components/buildable.component";
import {HouseBlock} from "./house-block";
import {HouseBlockComponent} from "../components/house-block.component";
import {TreeLifecycleComponent} from "../components/tree-lifecycle.component";
import {MineLifecycleComponent} from "../components/mine-lifecycle.component";
import {MassComponent} from "../components/mass.component";

export interface MinerOptions {
    position?: Vector,
    house?: House,
    initialState?: IState
}

export class Miner extends GameEntity {

    constructor(world:World, options:MinerOptions) {

        const position = options.position || new Vector(0, 0);

        super();

        const fsmComponent = new StateMachineComponent();

        const weight = 80 + Math.round(Math.random() * 40);

        this.addComponent(fsmComponent)
            .addComponent(new HumanStatsComponent())
            .addComponent(new MassComponent(weight))
            .addComponent(new PositionComponent(position.x, position.y))
            .addComponent(new MovementComponent(world, this))
            .addComponent(new HasMoneyToSpendComponent())
            .addComponent(new WorldRefComponent(world))
            .addComponent(new HasBagComponent())


        if (options.house) {
            this.addComponent(new HasHouseComponent(options.house))
        }

        const stateMachine = new StateMachine(this);
        fsmComponent.setFSM(stateMachine);
        stateMachine.changeState(new GoRest());
        stateMachine.changeGlobalState(new LivingState());

    }

    locateClosestBuilding(type:BuildingTypes):Vector|null {

        const worldRefComponent = <WorldRefComponent>this.getComponent('WORLD-REF')
        
        const buildingsOfType:[string, GameEntity][] = (<[string, GameEntity][]>Array.from(worldRefComponent.world.em.entities))
            .filter(([key, entity]:[string, GameEntity]) => {
                const buildingComponent = <BuildingStatsComponent>entity.getComponent('BUILDING-STATS');
                return buildingComponent && buildingComponent.type === type
            })
        

        const minerPosition = <PositionComponent>this.getComponent('POSITION');

        let closestDistance = Infinity;
        let closestBuilding = null;
        for (let i = 0; i < buildingsOfType.length; i++) {
            const building = buildingsOfType[i][1];
            const positionComponent = <PositionComponent>building.getComponent('POSITION')
            const dist = Vector.distance(positionComponent.position, minerPosition.position);
            if (dist < closestDistance) {

                if (type === BuildingTypes.TREE) {
                    const tree = <TreeLifecycleComponent>building.getComponent('TREE-LIFECYCLE');
                    if (tree && tree.availability <= 0) {
                        continue;
                    }
                }

                if (type === BuildingTypes.MINE) {
                    const mine = <MineLifecycleComponent>building.getComponent('MINE-LIFECYCLE');
                    if (mine && mine.availability <= 0) {
                        continue
                    }
                }

                closestDistance = dist;
                closestBuilding = building;
            }
        }

        if (closestBuilding) {
            return (<PositionComponent>closestBuilding.getComponent('POSITION')).position.clone();
        } else {
            return null;
        }

    }

    locatePlaceToBuildHouse(width:number, height:number):[HouseBlock, Vector, number, number]|null {

        const w = <WorldRefComponent>this.getComponent('WORLD-REF');
        const ents:[number, GameEntity][] = Array.from(w.world.em.entities);

        const minWidth = 5;
        const minHeight = 5;

        for (let i = 0; i < ents.length; i++) {
            const entity:GameEntity = ents[i][1];
            const hb = <HouseBlockComponent>entity.getComponent('HOUSE-BLOCK');

            let iterations = 0;

            if (hb) {
                let w = width;
                let h = height;
                while (iterations < 10 && w > minWidth && h > minHeight) {
                    const placeFound = (entity as HouseBlock).findSuitablePlace(w, h);
                    if (placeFound) {
                        return [entity as HouseBlock, placeFound, w, h];
                    }
                    w -= 2;
                    h -= 2;
                    iterations++;
                }


            }




        }

        return null;
    }

    setPosition(x:number, y:number) {
        const positionComponent = <PositionComponent>this.getComponent('POSITION');
        positionComponent.position = new Vector(x, y);
    }

    die() {
        const stateMachineComponent = <StateMachineComponent>this.getComponent('STATE-MACHINE');

        this.removeComponent('HAS-MONEY');
        this.removeComponent('MOVEMENT');

        stateMachineComponent.getFSM().changeGlobalState(new DiedState())
        stateMachineComponent.getFSM().changeState(new DiedState());
    }

    export():ExportHumanEntity {
        const humanStatsComponent = <HumanStatsComponent>this.getComponent('HUMAN-STATS');
        const positionComponent = <PositionComponent>this.getComponent('POSITION');
        const movementComponent = <MovementComponent>this.getComponent('MOVEMENT');
        const smComponent = <StateMachineComponent>this.getComponent('STATE-MACHINE');
        const mass = <MassComponent>this.getComponent('MASS');

        const exportEntity:ExportEntity = {
            id: this.id,
            name: humanStatsComponent.characterFullName,
            type: 'human',
            state: smComponent.getFSM().currentState.name,
            position: [positionComponent.position.x, positionComponent.position.y],
        }

        const humanEntity:Partial<ExportHumanEntity> = {};

        if (movementComponent) {
            humanEntity.heading = [movementComponent.heading.x, movementComponent.heading.y];
            if (movementComponent.wandering) {

                const targetToWorld = Vector.pointToWorldSpace(
                    movementComponent.wanderTarget, movementComponent.heading, positionComponent.position
                )

                humanEntity.wandering = {
                    distance : movementComponent.wanderDistance,
                    radius : movementComponent.wanderRadius,
                    target: [targetToWorld.x, targetToWorld.y]
                }
            }
        }

        if (mass) {
            humanEntity.weight = mass.weight;
        }

        return Object.assign({}, exportEntity, humanEntity) as ExportHumanEntity;

    }

    print() {

        console.clear()

        const currentState = <StateMachineComponent>this.getComponent('STATE-MACHINE');
        let currentStateName = currentState.getFSM().currentState.name;
        const localFsm = currentState.getFSM().currentState.localFsm;
        if (localFsm) {
            currentStateName += ` - ${localFsm.currentState.name}`
        }


        const positionComponent = <PositionComponent>this.getComponent('POSITION');
        const humanStatsComponent = <HumanStatsComponent>this.getComponent('HUMAN-STATS');
        const hasMoneyComponent = <HasMoneyToSpendComponent>this.getComponent('MONEY-TO-SPEND');
        const hasBagComponent = <HasBagComponent>this.getComponent('HAS-BAG');
        const inBuilding = <IsInBuildingComponent>this.getComponent('IS-IN-BUILDING')

        const bankAccount = Bank.getAccount(this.id);


        let houseValue = 'NONE';
        const hasHouse = <HasHouseComponent>this.getComponent('HAS-HOUSE');
        if (hasHouse) {
            const buildable = <BuildableComponent>hasHouse.house.getComponent('BUILDABLE');
            houseValue = '0';
            if (buildable) {
                houseValue = `${buildable.progress}`;
            }
        }

        const line = `
            ${humanStatsComponent.characterName} ${humanStatsComponent.characterSurname} - ${currentStateName} - POS (x: ${positionComponent.position.x} | y: ${positionComponent.position.y})
            THIRST: ${humanStatsComponent.thirst} / ${humanStatsComponent.maxThirst}
            FATIGUE: ${humanStatsComponent.fatigue} / ${humanStatsComponent.maxFatigue}
            BOREDOM: ${humanStatsComponent.boredom} / ${humanStatsComponent.maxBoredom}
            MONEY: ${hasMoneyComponent.money}
            AGE: ${humanStatsComponent.age} / ${humanStatsComponent.maxAge}
            BANK ACCOUNT: ${bankAccount && bankAccount.amount}
            IN BUILDING: ${inBuilding && inBuilding.building && (<BuildingStatsComponent>inBuilding.building.getComponent('BUILDING-STATS')).type}
            HOUSE: ${houseValue}
            BAG
                GOLD: ${hasBagComponent.gold}
                WOOD: ${hasBagComponent.wood}
            `;

        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(line);

    }

}