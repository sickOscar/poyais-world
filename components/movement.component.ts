import {Component} from "../abstract/ecs/component";
import {Vector} from "../abstract/geometry/vector";
import {World} from "../world";

export class MovementComponent implements Component {

    name = "MOVEMENT";

    velocity:Vector;
    acceleration:Vector;
    heading:Vector;
    sideVector:Vector;

    mass:number;
    maxSpeed = 20;
    maxForce = 200;
    maxTurnRate:number;

    seekTarget:Vector|null = null;
    // fleeOn:boolean = false;
    // arriveOn:boolean = false;
    // pursuitOn:boolean = false;
    wandering:boolean = false;


    wanderRadius:number = 100;
    wanderDistance:number = 50;
    wanderJitter:number = 20;
    wanderTarget:Vector;


    worldRef:World;

    constructor(world:World) {
        this.worldRef = world;

        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
        this.heading = new Vector(Math.random(), Math.random()).normalize();
        this.sideVector = this.heading.perp();

        this.wanderTarget = new Vector(Math.random(), Math.random())
            .normalize()
            .multiply(this.wanderRadius);

        this.mass = 1;
        this.maxTurnRate = 10;
    }

    isMoving() {
        return this.seekTarget || this.wandering;
    }

    freeze() {
        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
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


}