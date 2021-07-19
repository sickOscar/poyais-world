import {Telegram} from "../messaging/telegram";
import {Component} from "./component";
import {ExportEntity} from "../../world";
import {HumanStatsComponent} from "../../components/human-stats.component";
import {PositionComponent} from "../../components/position.component";
import {MovementComponent} from "../../components/movement.component";

export abstract class GameEntity {

  id:number;
  components:Map<string, Component> = new Map();

  static maxInt:number = 0;

  protected constructor() {
    GameEntity.maxInt++;
    this.id = GameEntity.maxInt;
  }

  getId():number {
    return this.id;
  }

  addComponent(component:Component) {
    this.components.set(component.name, component);
    return this;
  }

  hasComponent(componentName:string) {
    return !!this.components.get(componentName);
  }

  getComponent(componentName:string):Component | undefined {
    return this.components.get(componentName)
  }

  removeComponent(componentName:string) {
    this.components.delete(componentName);
    return this;
  }

  clearComponents() {
    this.components = new Map();
  }

  print() {
    console.log(JSON.stringify(this));
  }

  export():ExportEntity {
    return {
      id: this.id,
      name: 'unknown',
      type: 'unknown',
      position: [0, 0]
    }
  }

  // abstract handleMessage(telegram:Telegram):void;

}
