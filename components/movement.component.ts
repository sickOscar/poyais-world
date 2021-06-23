import {Component} from "../abstract/ecs/component";
import {Vector} from "../abstract/geometry/vector";

export class MovementComponent implements Component {

    name = "MOVEMENT";

    velocity:Vector;
    acceleration:Vector;
    heading:Vector;
    sideVector:Vector;

    mass:number;
    maxSpeed = 10;
    maxForce:number;
    maxTurnRate:number;

    seekTarget:Vector|null = null;
    // fleeOn:boolean = false;
    // arriveOn:boolean = false;
    // pursuitOn:boolean = false;
    // wanderOn:boolean = false;

    constructor() {
        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
        this.heading = new Vector(0, 0);
        this.sideVector = new Vector(1, 0);

        this.mass = 1;
        this.maxSpeed = 10;
        this.maxForce = 10;
        this.maxTurnRate = 10;
    }

    isMoving() {
        return this.seekTarget;
    }

    freeze() {
        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
    }

    updatePosition(currentPosition:Vector, delta:number):Vector {

        const steeringForce = this.calculateSteeringForce(currentPosition, delta);

        // a = F / m
        this.acceleration = steeringForce.divide(this.mass);
        this.velocity = this.velocity
            .add(this.acceleration.multiply(delta))
            .truncate(this.maxSpeed)

        if (this.velocity.magnitude() > 0.000001) {
            this.heading = this.velocity.normalize();
            this.sideVector = this.heading.perp();
        }

        return currentPosition.add(this.velocity.multiply(delta));
    }

    calculateSteeringForce(position:Vector, delta:number):Vector {
        let steeringForce = new Vector(0, 0);

        if (this.seekTarget) {
            steeringForce = steeringForce.add(this.seek(position));
        }

        return steeringForce;

    }


    seekOn(targetPosition:Vector) {
        this.seekTarget = targetPosition.clone();
    }

    seekOff() {
        this.seekTarget = null;
    }

    private seek(currentPosition:Vector):Vector {
        if (!this.seekTarget) {
            return new Vector(0, 0);
        }
        const desiredVelocity = this.seekTarget.subtract(currentPosition).normalize().multiply(this.maxSpeed);
        return desiredVelocity.subtract(this.velocity);
    }


}