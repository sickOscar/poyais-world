import {GameEntity} from "../abstract/ecs/game-entity";
import {StateMachineComponent} from "../components/state-machine.component";
import {StateMachine} from "../abstract/fsm/state-machine";
import {HumanStatsComponent} from "../components/human-stats.component";
import {PositionComponent, PositionComponentName} from "../components/position.component";
import {LivingState} from "../states/miner/living.state";
import {MovementComponent} from "../components/movement.component";
import {WorldRefComponent} from "../components/world-ref.component";
import {ExportEntity, ExportHumanEntity, World} from "../world";
import {Vector} from "../abstract/geometry/vector";
import {BuildingStatsComponent, BuildingTypes} from "../components/building-stats.component";
import {HasMoneyToSpendComponent} from "../components/has-money-to-spend.component";
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
import {FarmerComponent} from "../components/farmer.component";
import {FarmBlockComponent} from "../components/farm-block.component";
import {FarmBlock} from "./farm-block";
import {GoDrinkingState} from "../states/miner/go-drinking/go-drinking.state";
import {GoFarmingState} from "../states/miner/go-farming/go-farming.state";
import {EmptyState} from "../states/empty-state";
import {round} from "../abstract/geometry/numbers";
import {HasOwnerComponent} from "../components/has-owner.component";
import {Farm} from "./farm";
import {HasEmployeesComponent} from "../components/has-employees.component";
import {Game} from "../game";
import {JobComponent, Jobs} from "../components/job.component";


export interface ClosestBuildingOptions {
    considerCutting: boolean | true
}

export interface MinerOptions {
    position?: Vector,
    house?: House,
    initialState?: IState
    job?: Jobs
}

export class Miner extends GameEntity {

    constructor(world: World, options: MinerOptions) {

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

        if (options.job === Jobs.FARMER) {
            this.addComponent(new FarmerComponent())
        } else {
            this.findAJob()
        }

        const stateMachine = new StateMachine(this);
        fsmComponent.setFSM(stateMachine);
        stateMachine.changeState(new GoRest());
        stateMachine.changeGlobalState(new LivingState());

    }

    findAJob() {
        const worldRef = <WorldRefComponent>this.getComponent('WORLD-REF');

        const placesWithJobsAvailable = (<[string, GameEntity][]>Array.from(worldRef.world.em.entities))
            .filter(([id, entity]:[string, GameEntity]) => {
                const hasEmployees = <HasEmployeesComponent>entity.getComponent('HAS-EMPLOYEES');
                return hasEmployees && hasEmployees.employees.length < hasEmployees.maxEmployees;
            })


        if (placesWithJobsAvailable.length === 0) {
            return
        }

        const workplace:GameEntity = placesWithJobsAvailable[Math.floor(Math.random()*placesWithJobsAvailable.length)][1];
        // console.log('GOT PLACE', workplace)

        const hasEmployees = <HasEmployeesComponent>workplace.getComponent('HAS-EMPLOYEES');
        if (hasEmployees) {
            hasEmployees.employees.push(this);
            this.addComponent(new JobComponent(hasEmployees.jobType, workplace))
        }


    }

    findEmptyHouse(): House | null {
        const w = <WorldRefComponent>this.getComponent('WORLD-REF');
        const ents: [number, GameEntity][] = Array.from(w.world.em.entities);
        for (let i = 0; i < ents.length; i++) {
            const entity: GameEntity = ents[i][1];
            const hb = <HouseBlockComponent>entity.getComponent('HOUSE-BLOCK');

            if (hb) {
                let block = entity as HouseBlock;
                for (let j = 0; j < block.houses.length; j++) {
                    const owner = <HasOwnerComponent>block.houses[j].getComponent('HAS-OWNER');
                    if (!owner) {
                        return block.houses[j];
                    }
                }
            }
        }
        return null;
    }

    findEmptyFarm(): Farm | null {
        const w = <WorldRefComponent>this.getComponent('WORLD-REF');
        const ents: [number, GameEntity][] = Array.from(w.world.em.entities);
        for (let i = 0; i < ents.length; i++) {
            const entity: GameEntity = ents[i][1];
            const fb = <HouseBlockComponent>entity.getComponent('FARM-BLOCK');

            if (fb) {
                let block = entity as FarmBlock;
                for (let j = 0; j < block.farms.length; j++) {
                    const h = block.farms[j].house;
                    if (!h) continue;
                    const owner = <HasOwnerComponent>h.getComponent('HAS-OWNER');
                    if (!owner) {
                        return block.farms[j];
                    }
                }
            }
        }
        return null;
    }

    locateClosestBuilding(type: BuildingTypes, options?: ClosestBuildingOptions): Vector | null {

        const worldRefComponent = <WorldRefComponent>this.getComponent('WORLD-REF')

        const buildingsOfType: [string, GameEntity][] = (<[string, GameEntity][]>Array.from(worldRefComponent.world.em.entities))
            .filter(([key, entity]: [string, GameEntity]) => {
                const buildingComponent = <BuildingStatsComponent>entity.getComponent('BUILDING-STATS');
                return buildingComponent && buildingComponent.type === type
            })


        const minerPosition = <PositionComponent>this.getComponent(PositionComponentName);

        let closestDistance = Infinity;
        let closestBuilding = null;
        for (let i = 0; i < buildingsOfType.length; i++) {
            const building = buildingsOfType[i][1];
            const positionComponent = <PositionComponent>building.getComponent(PositionComponentName)
            const dist = Vector.distance(positionComponent.position, minerPosition.position);
            if (dist < closestDistance) {

                if (type === BuildingTypes.TREE) {
                    const life = <TreeLifecycleComponent>building.getComponent('TREE-LIFECYCLE');
                    if (life) {
                        if (life.availability <= 0) continue;

                        if (!options || (options && options.considerCutting)) {
                            if (life.cutting >= life.maxCutting) continue;
                        }

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
            return (<PositionComponent>closestBuilding.getComponent(PositionComponentName)).position.clone();
        } else {
            return null;
        }

    }

    locatePlaceToBuildHouse(width: number, height: number): [HouseBlock, Vector, number, number] | null {

        const w = <WorldRefComponent>this.getComponent('WORLD-REF');
        const ents: [number, GameEntity][] = Array.from(w.world.em.entities);

        const minWidth = 5;
        const minHeight = 5;

        const houseBlocks = ents
            .filter(([id, entity]) => {
                const hb = <HouseBlockComponent>entity.getComponent('HOUSE-BLOCK');
                return hb;
            })
            .sort(() => (Math.random() > .5) ? 1 : -1);

        for (let i = 0; i < houseBlocks.length; i++) {
            const entity: GameEntity = houseBlocks[i][1];

            let iterations = 0;

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

        return null;
    }

    locatePlaceToBuildFarm(width: number, height: number): [FarmBlock, Vector, number, number] | null {

        const w = <WorldRefComponent>this.getComponent('WORLD-REF');
        const ents: [number, GameEntity][] = Array.from(w.world.em.entities);

        const minWidth = 5;
        const minHeight = 5;

        for (let i = 0; i < ents.length; i++) {
            const entity: GameEntity = ents[i][1];
            const hb = <FarmBlockComponent>entity.getComponent('FARM-BLOCK');

            let iterations = 0;

            if (hb) {
                let w = width;
                let h = height;
                while (iterations < 10 && w > minWidth && h > minHeight) {
                    const placeFound = (entity as FarmBlock).findSuitablePlace(w, h);
                    if (placeFound) {
                        return [entity as FarmBlock, placeFound, w, h];
                    }
                    w -= 2;
                    h -= 2;
                    iterations++;
                }
            }

        }

        return null;
    }

    die() {
        const world = <WorldRefComponent>this.getComponent('WORLD-REF');
        const sm = <StateMachineComponent>this.getComponent('STATE-MACHINE');

        const hasHouse = <HasHouseComponent>this.getComponent('HAS-HOUSE');
        if (hasHouse && hasHouse.house) {
            hasHouse.house.removeComponent('HAS-OWNER');
            this.removeComponent('HAS-HOUSE');
        }

        const job = <JobComponent>this.getComponent('JOB');
        if (job) {
            const hasEmployees = <HasEmployeesComponent>job.workplace.getComponent('HAS-EMPLOYEES');
            hasEmployees.employees = hasEmployees.employees.filter(e => e.id !== this.id);
            this.removeComponent('JOB');
        }

        sm.getFSM().changeState(new EmptyState());
        sm.getFSM().changeGlobalState(new EmptyState());

        world.world.removeEntity(this.id);
    }

    doRandomAction() {
        const chance = Math.random();

        const fsmComponent = <StateMachineComponent>this.getComponent('STATE-MACHINE');
        const farmer = <FarmerComponent>this.getComponent('FARMER');

        if (farmer) {
            fsmComponent.getFSM().changeState(new GoFarmingState());
            return;
        }

        fsmComponent.getFSM().changeState(new GoRest());
        fsmComponent.getFSM().changeState(new GoDrinkingState())

    }

    export(): ExportHumanEntity {
        const humanStatsComponent = <HumanStatsComponent>this.getComponent('HUMAN-STATS');
        const positionComponent = <PositionComponent>this.getComponent(PositionComponentName);
        const movementComponent = <MovementComponent>this.getComponent('MOVEMENT');
        const smComponent = <StateMachineComponent>this.getComponent('STATE-MACHINE');
        const mass = <MassComponent>this.getComponent('MASS');

        const exportEntity: ExportEntity = {
            id: this.id,
            name: humanStatsComponent.characterFullName,
            type: 'human',
            state: smComponent.getFSM().currentState.name,
            position: [round(positionComponent.position.x), round(positionComponent.position.y)],
        }

        const humanEntity: Partial<ExportHumanEntity> = {
            gender: humanStatsComponent.gender
        };

        if (movementComponent) {
            humanEntity.heading = [round(movementComponent.heading.x), round(movementComponent.heading.y)];
            if (movementComponent.wandering) {

                const targetToWorld = Vector.pointToWorldSpace(
                    movementComponent.wanderTarget, movementComponent.heading, positionComponent.position
                )

                humanEntity.wandering = {
                    distance: movementComponent.wanderDistance,
                    radius: movementComponent.wanderRadius,
                    target: [round(targetToWorld.x), round(targetToWorld.y)]
                }
            }
        }

        if (mass) {
            humanEntity.weight = mass.weight;
        }

        const bag = <HasBagComponent>this.getComponent('HAS-BAG')
        humanEntity.bag = {
            gold: round(bag.gold),
            wood: round(bag.wood),
            malt: round(bag.malt)
        }

        const job = <JobComponent>this.getComponent('JOB');
        if (job) {
            humanEntity.job = job.job;
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


        const positionComponent = <PositionComponent>this.getComponent(PositionComponentName);
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

        const line = `${currentStateName}`

        // const line = `
        //     ${humanStatsComponent.characterName} ${humanStatsComponent.characterSurname} - ${currentStateName} - POS (x: ${positionComponent.position.x} | y: ${positionComponent.position.y})
        //     THIRST: ${humanStatsComponent.thirst} / ${humanStatsComponent.maxThirst}
        //     FATIGUE: ${humanStatsComponent.fatigue} / ${humanStatsComponent.maxFatigue}
        //     BOREDOM: ${humanStatsComponent.boredom} / ${humanStatsComponent.maxBoredom}
        //     MONEY: ${hasMoneyComponent.money}
        //     AGE: ${humanStatsComponent.age} / ${humanStatsComponent.maxAge}
        //     BANK ACCOUNT: ${bankAccount && bankAccount.amount}
        //     IN BUILDING: ${inBuilding && inBuilding.building && (<BuildingStatsComponent>inBuilding.building.getComponent('BUILDING-STATS')).type}
        //     HOUSE: ${houseValue}
        //     BAG
        //         GOLD: ${hasBagComponent.gold}
        //         WOOD: ${hasBagComponent.wood}
        //         MALT: ${hasBagComponent.malt} / ${hasBagComponent.maxMalt}
        //     `;

        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(line);

    }

}