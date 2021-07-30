import {GameEntity} from "../abstract/ecs/game-entity";
import {PositionComponent, PositionComponentName} from "../components/position.component";
import {Vector} from "../abstract/geometry/vector";
import {BuildingStatsComponent, BuildingTypes} from "../components/building-stats.component";
import {ExportBuildingEntity, ExportEntity, World} from "../world";
import {WorldRefComponent} from "../components/world-ref.component";
import {DimensionsComponent} from "../components/dimensions.component";
import {HasEmployeesComponent} from "../components/has-employees.component";
import {Jobs} from "../components/job.component";
import {Depositables, DepositComponent} from "../components/has-deposit.component";

export interface BankOptions {
    position: Vector,
    name:string
}

export interface BankAccount {
    amount:number;
}

export class Bank extends GameEntity {

    private static accounts:Map<number, BankAccount> = new Map();

    constructor(world:World, options:BankOptions) {
        super();

        const positionComponent = new PositionComponent(options.position.x, options.position.y);

        this.addComponent(positionComponent)
            .addComponent(new BuildingStatsComponent(BuildingTypes.BANK, options.name))
            .addComponent(new WorldRefComponent(world))
            .addComponent(new DimensionsComponent({
                width: 60,
                height: 60
            }))
            .addComponent(new HasEmployeesComponent(10, Jobs.BANKER))
            .addComponent(new DepositComponent([Depositables.GOLD]));


    }

    static addAccount(accountId: number, amount  = 0):void {
        Bank.accounts.set(accountId, {amount});
    }

    static getAccount(accountId:number) {
        return Bank.accounts.get(accountId);
    }

    static withdrawFromAccount(accountId:number, amount:number):{withdraw:number, newAmount:number}|undefined {
        if (amount < 0) {
            console.log('Invalid transaction');
        }
        const currentAccount = Bank.accounts.get(accountId);

        if (!currentAccount) {
            console.log('Invalid account id');
            return;
        }

        if (currentAccount.amount >= amount) {
            currentAccount.amount -= amount;
            Bank.accounts.set(accountId, currentAccount);
            return {
                withdraw: amount,
                newAmount: currentAccount.amount
            };
        }

        if (currentAccount.amount < amount) {
            const rest = currentAccount.amount;
            currentAccount.amount = 0;
            Bank.accounts.set(accountId, currentAccount);
            return {
                withdraw: amount,
                newAmount: rest
            }
        }

    }

    static depositToAccount(accountId:number, amount:number):{newAmount:number}|undefined {
        if (amount < 0) {
            console.log('Invalid transaction');
        }
        const currentAccount = Bank.accounts.get(accountId);
        if (!currentAccount) {
            console.log('Invalid account id');
            return;
        }

        currentAccount.amount += amount;
        Bank.accounts.set(accountId, currentAccount);
        return {
            newAmount: currentAccount.amount
        }

    }

    export():ExportBuildingEntity {
        const positionComponent = <PositionComponent>this.getComponent(PositionComponentName);
        const buildingStats = <BuildingStatsComponent>this.getComponent('BUILDING-STATS');
        const dimensions = <DimensionsComponent>this.getComponent('DIMENSIONS');

        const exportEntity:ExportEntity = {
            id: this.id,
            name: buildingStats.buildingName,
            type: 'bank',
            position: [positionComponent.position.x, positionComponent.position.y],
            dimensions: {
                width: dimensions.width,
                height: dimensions.height
            }
        }

        const buildingExport:ExportBuildingEntity = {
            ...exportEntity
        }

        return buildingExport;

    }

    print() {
    }

}