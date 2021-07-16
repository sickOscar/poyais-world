
let heading
let velocity
let position

const maxSpeed = 10;

function setup() {


    heading = createVector(0, 0);
    velocity = createVector(0, 0);
    position = createVector(100, 100)

    createCanvas(600, 600);

}

function updatePosition() {

    const force = arrive(mouseX, mouseY);

    velocity.add(force)
    position.add(velocity);
}

function arrive(x, y) {
    const deceleration = 2;

    if (!x || !y) {
        return createVector(0, 0)
    }

    const toTarget = createVector(x, y).sub(position);
    const dist = toTarget.mag();
    if (dist > 0) {
        const decTweaker = 0.3;
        let speed = dist / (deceleration * decTweaker);
        speed = Math.min(speed, maxSpeed);

        const desiredVel = toTarget.copy().mult(speed).div(dist)

        return desiredVel.sub(velocity);
    }

    return createVector(0 ,0)
}

function draw() {
    updatePosition()

    background(51);
    fill("white")
    circle(position.x, position.y, 30)
}
