import {Component} from "../abstract/ecs/component";
import {GameEntity} from "../abstract/ecs/game-entity";

export class HasOwnerComponent implements Component {
    name  = 'HAS-OWNER';

    owner:GameEntity;
    ownershipLife = 0;

    constructor(owner:GameEntity) {
        this.owner = owner;
    }
}