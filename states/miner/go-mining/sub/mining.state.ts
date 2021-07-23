import {IState, State} from "../../../../abstract/fsm/state";
import {Miner} from "../../../../entities/miner";
import {Telegram} from "../../../../abstract/messaging/telegram";
import {HumanStatsComponent} from "../../../../components/human-stats.component";
import {StateMachineComponent} from "../../../../components/state-machine.component";
import {WorldRefComponent} from "../../../../components/world-ref.component";
import {MovementComponent} from "../../../../components/movement.component";
import {HasBagComponent} from "../../../../components/has-bag.component";
import {Mine} from "../../../../entities/mine";
import {BuildingTypes} from "../../../../components/building-stats.component";
import {PositionComponent} from "../../../../components/position.component";
import {Vector} from "../../../../abstract/geometry/vector";
import {Tree} from "../../../../entities/tree";
import {WalkingToMineState} from "./walking-to-mine.state";
import {MineLifecycleComponent} from "../../../../components/mine-lifecycle.component";
import {GoDeposit} from "../../go-deposit/go-deposit.state";

export class MiningState extends State implements IState {

    name = "Mining";

    timePassedMining = 0;
    maxTimeMining = 10;

    mine:Mine|null = null;

    enter(entity:Miner) {
        const closestMinePosition = entity.locateClosestBuilding(BuildingTypes.MINE);
        const position = <PositionComponent>entity.getComponent('POSITION');
        const sm = <StateMachineComponent>entity.getComponent('STATE-MACHINE');

        if (!closestMinePosition) {
            sm.getFSM().revert();
            return;
        }

        if (Vector.distance(closestMinePosition, position.position) > 0.1) {
            const localFsm = sm.getFSM().currentState.localFsm;
            localFsm && localFsm.changeState(new WalkingToMineState())
            return;
        }

        const world = <WorldRefComponent>entity.getComponent('WORLD-REF');
        this.mine = <Tree>world.world.locateBuildingAtPosition(closestMinePosition, BuildingTypes.MINE);
    }

    execute(entity:Miner) {

        const humanStats = <HumanStatsComponent>entity.getComponent('HUMAN-STATS');
        const worldComponent = <WorldRefComponent>entity.getComponent('WORLD-REF');
        const delta = worldComponent.world.frame.deltaTime;
        const hasBag = <HasBagComponent>entity.getComponent('HAS-BAG');

        humanStats.thirst += 2 * delta;
        humanStats.fatigue = Math.max(0, humanStats.fatigue + (6 * delta));

        this.timePassedMining += 1 * delta;
        if (hasBag) {

            if (this.mine) {
                const mineLife = <MineLifecycleComponent>this.mine.getComponent('MINE-LIFECYCLE');
                if (mineLife.availability > 0) {
                    hasBag.gold += 1 * delta / 2;
                    mineLife.availability = Math.max(0, mineLife.availability - (1 * delta / 2));
                } else {
                    this.timePassedMining = this.maxTimeMining;
                }
            } else {
                this.timePassedMining = this.maxTimeMining;
            }
        }


        if (this.timePassedMining >= this.maxTimeMining) {
            const stateMachine = <StateMachineComponent>entity.getComponent('STATE-MACHINE');
            stateMachine.getFSM().changeState(new GoDeposit());
        }

    }

    exit(entity:Miner) {

    }

    onMessage(owner:any, telegram:Telegram):boolean {
        return true;
    }

}