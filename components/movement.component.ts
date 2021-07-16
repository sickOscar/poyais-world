import {Component} from "../abstract/ecs/component";
import {Vector} from "../abstract/geometry/vector";
import {World} from "../world";
import {GameEntity} from "../abstract/ecs/game-entity";
import {MassComponent} from "./mass.component";

export class MovementComponent implements Component {

    name = "MOVEMENT";

    velocity:Vector;
    acceleration:Vector;
    heading:Vector;
    sideVector:Vector;

    mass:number;
    maxSpeed:number;
    maxForce = 200;
    maxTurnRate:number;

    seekTarget:Vector|null = null;
    arriveTarget:Vector|null = null;
    // fleeOn:boolean = false;
    // pursuitOn:boolean = false;
    wandering:boolean = false;


    wanderRadius:number = 100;
    wanderDistance:number = 50;
    wanderJitter:number = 20;
    wanderTarget:Vector;


    worldRef:World;

    constructor(world:World, entity:GameEntity) {
        this.worldRef = world;

        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
        this.heading = new Vector(Math.random(), Math.random()).normalize();
        this.sideVector = this.heading.perp();

        this.wanderTarget = new Vector(Math.random(), Math.random())
            .normalize()
            .multiply(this.wanderRadius);

        const mass = <MassComponent>entity.getComponent('MASS');
        if (mass) {
            this.mass = 100 / mass.weight
            this.maxSpeed = (1 / this.mass) * 80;
        } else {
            this.mass = 1;
            this.maxSpeed = 80
        }

        this.maxTurnRate = 10;
    }

    isMoving() {
        return this.seekTarget || this.wandering || this.arriveTarget;
    }

    updatePosition(currentPosition:Vector, delta:number):Vector {

        const steeringForce = this.calculateSteeringForce(currentPosition, delta);

        // a = F / m
        this.acceleration = steeringForce
            .divide(this.mass)
            // .truncate(this.maxForce)
            .multiply(delta)

        this.velocity = this.velocity
            .add(this.acceleration)
            .truncate(this.maxSpeed)

        if (this.velocity.magnitude() > 0.01) {
            this.heading = this.velocity.normalize();
            this.sideVector = this.heading.perp();
        }
        
        const newPos = currentPosition.add(
            this.velocity
                .multiply(delta)

        );

        if (!this.worldRef.validatePositionAgainstMap(newPos)) {
            this.velocity = new Vector(0, 0);
            this.heading = this.heading.inverse();
            this.sideVector = this.heading.perp();
            return currentPosition
        }

        return newPos;
    }

    calculateSteeringForce(position:Vector, delta:number):Vector {
        let steeringForce = new Vector(0, 0);

        if (this.seekTarget) {
            steeringForce = steeringForce.add(this.seek(position));
        }
        if (this.arriveTarget) {
            steeringForce = steeringForce.add(this.arrive(position));
        }
        if (this.wandering) {
            const wanderForce = this.wander(position);
            steeringForce = steeringForce.add(wanderForce);
        }

        return steeringForce;

    }


    seekOn(targetPosition:Vector) {
        this.seekTarget = targetPosition.clone();
    }

    seekOff() {
        this.seekTarget = null;
    }

    arriveOn(targetPosition:Vector) {
        this.arriveTarget = targetPosition.clone()
    }

    arriveOff() {
        this.arriveTarget = null;
    }

    wanderOn() {
        this.wandering = true
    }

    wanderOff() {
        this.wandering = false;
    }

    private wander(currentPosition:Vector):Vector {

        const clamp = Vector.randomClamped();

        this.wanderTarget = this.wanderTarget
            .add(new Vector(
                clamp.x * this.wanderJitter,
                clamp.y * this.wanderJitter
            ))
            .normalize()
            .multiply(this.wanderRadius)

        const targetLocal = this.wanderTarget.add(new Vector(this.wanderDistance, 0));

        const targetWorld = Vector.pointToWorldSpace(
            targetLocal,
            this.heading,
            currentPosition
        )

        return targetWorld.subtract(currentPosition);
    }

    private seek(currentPosition:Vector):Vector {

        if (!this.seekTarget) {
            return new Vector(0, 0);
        }

        const desiredVelocity = this.seekTarget.subtract(currentPosition)
            .normalize()
            .multiply(this.maxSpeed);
        return desiredVelocity.subtract(this.velocity);
    }


    private arrive(currentPosition:Vector): Vector {

        const deceleration = 3;

        if (!this.arriveTarget) {
            return new Vector(0, 0)
        }

        const toTarget = this.arriveTarget.subtract(currentPosition);
        const dist = toTarget.length();
        if (dist > 0) {

            let speed = dist / deceleration;
            speed = Math.min(speed, this.maxSpeed);

            const desiredVel:Vector = toTarget.multiply(speed).divide(dist)

            return desiredVel.subtract(this.velocity);
        }

        return new Vector(0, 0);
    }


}