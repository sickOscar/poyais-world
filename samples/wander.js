let wanderTarget;
let wanderJitter = 2;
let wanderDistance = 100;
let wanderRadius = 50
let finalDest;
let position;
let velocity;
let headingV;
let side;

let basePoint
let targetWorld;
let targetLocal;

const maxSpeed = 1;

function setup() {
    createCanvas(600, 600);


    basePoint = createVector(100, 100);

    position = createVector(100, 100);
    headingV = createVector(1, 0).normalize();
    side = perp(headingV);

    velocity = createVector(0, 0);

    wanderTarget = createVector(1, 0).normalize().mult(wanderRadius);
}

function perp(v) {
    return createVector(-v.y, v.x);
}

function move(force) {
    velocity.add(force);

    if(velocity.mag() > maxSpeed) {
        velocity.setMag(maxSpeed)
    }

    position.add(velocity);



    if (velocity.mag() > 0.01) {
        headingV = velocity.copy().normalize();
        side = perp(headingV)
    }


}


function draw() {

    background(52);

    const steeringForce = wander(position.copy())

    move(steeringForce);


    noFill();
    stroke("white");
    circle(position.x, position.y, 10);

    fill("white");
    const worldPosition = toWorldSpace(createVector(0, 0), headingV, position)
    circle(worldPosition.x, worldPosition.y, 10)

    fill("red");
    circle(targetWorld.x, targetWorld.y, 5)

    noFill();
    stroke("green");
    const worldRound = toWorldSpace(createVector(wanderDistance, 0), headingV, position);
    circle(worldRound.x, worldRound.y, 5)

    stroke("black");
    line(worldPosition.x, worldPosition.y, worldPosition.x + headingV.x * 4, worldPosition.y + headingV.y * 4)


}

function wander(currentPosition) {

    wanderTarget.add(createVector(
        (-1 + Math.random()*2) * wanderJitter,
        (-1 + Math.random()*2) * wanderJitter)
    );
    wanderTarget.normalize();
    wanderTarget.mult(wanderRadius);
    targetLocal = wanderTarget.copy().add(createVector(wanderDistance, 0));

    targetWorld = toWorldSpace(targetLocal, headingV,  currentPosition);

    return targetWorld.copy().sub(currentPosition)

}


function toWorldSpace(point, headingVector, positionVector) {
    const p = point.copy();

    const angle = Math.atan2(positionVector.y - point.y, positionVector.x - point.x);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);


    const v = createVector(
        point.x * cos + point.y * -sin + positionVector.x,
        point.x * sin + point.y * cos + positionVector.y
    )


    return v;

}



