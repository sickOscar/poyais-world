let running = true;

let walls = [];
const map = [
    [0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 1, 1, 1, 1, 0, 1],
    [0, 1, 1, 0, 1, 1, 1, 0, 1],
    [0, 1, 1, 0, 1, 1, 1, 1, 1],
    [0, 1, 1, 0, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 1, 1, 1, 1],
]
const tileSize = 40;

function getTileColor(x, y) {
    switch (map[y][x]) {
        case 0:
            return "blue"
        case 1:
            return "brown"
    }
}


function findWalls() {

    const walls = [];

    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {

            if (map[i][j] === 1) continue

            const x0 = Math.max(0, j - 1);
            const x1 = Math.min(map[i].length - 1, j + 1)

            const y0 = Math.max(0, i - 1);
            const y1 = Math.min(map.length - 1, i + 1);


            for (let x = x0; x <= x1; x++) {
                for (let y = y0; y <= y1; y++) {

                    if (x === j && y === i) continue; // center
                    if (x !== j && y !== i) continue; // angles
                    if (map[y][x] === 0) continue;

                    let begin = createVector(0, 0);
                    let end = createVector(0, 0);

                    // terrain on the left
                    if (x < j) {
                        begin = createVector(tileSize * j, tileSize * i);
                        end = createVector(tileSize * j, tileSize * (i+1))
                        walls.push([begin, end])
                    }

                    // terrain on the right
                    if (x > j) {
                        end = createVector(
                            tileSize * x, tileSize * y
                        )
                        begin = createVector(
                            tileSize * x, tileSize * (y+1)
                        )
                        walls.push([begin, end])

                    }

                    // terrain on the top
                    if (y < i) {
                        end = createVector(
                            tileSize * x, tileSize * i
                        )
                        begin = createVector(
                            tileSize * (x+1), tileSize * i
                        )
                        walls.push([begin, end])

                    }

                    // terrain on the bottom
                    if (y > i) {
                        begin = createVector(
                            tileSize * x, tileSize * y
                        )
                        end = createVector(
                            tileSize * (x + 1), tileSize * y
                        )
                        walls.push([begin, end])
                    }


                }
            }

        }
    }


    return walls;

}

function optimizeWalls() {

    for (let i = walls.length - 1; i >= 0 ; i--) {

        // find next starting on this end
        let j = walls.length - 1;
        let nextWall;
        for (j; j >= 0; j--) {
            if (j !== i && walls[i][1].equals(walls[j][0])) {
                nextWall = walls[j];
                break;
            }
        }

        if (!nextWall) continue

        const heading = walls[i][0].copy().sub(walls[i][1]).normalize().heading();
        const nextWallheading = nextWall[0].copy().sub(nextWall[1]).normalize().heading();

        if(heading === nextWallheading) {
            // console.log(walls[i], heading, nextWall, nextWallheading)

            const newWall = [
                createVector(walls[i][0].x, walls[i][0].y),
                createVector(walls[j][1].x, walls[j][1].y)
            ]

            if (i > j) {
                walls[j] = newWall;
                walls.splice(i, 1);
            }

            if (i < j) {
                walls[i] = newWall;
                walls.splice(j, 1)
            }
        }
    }

    console.log('walls', walls)

}

let position, velocity, acceleration;
const maxSpeed = 1;
const maxSteeringForce = 0.1;

function seek() {
    const desiredVelocity = createVector(mouseX, mouseY).sub(position).normalize().mult(maxSpeed)
    return desiredVelocity.sub(velocity)
}

function intersects(a,b,c,d,p,q,r,s) {
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
        return false;
    } else {
        lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
        gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
}

function findNearest( p, a, b )
{
    var atob = { x: b.x - a.x, y: b.y - a.y };
    var atop = { x: p.x - a.x, y: p.y - a.y };
    var len = atob.x * atob.x + atob.y * atob.y;
    var dot = atop.x * atob.x + atop.y * atob.y;
    var t = Math.min( 1, Math.max( 0, dot / len ) );
    dot = ( b.x - a.x ) * ( p.y - a.y ) - ( b.y - a.y ) * ( p.x - a.x );
    return createVector(a.x + atob.x * t,a.y + atob.y * t);
}


let feelers = [];

function updateFeelers() {
    const heading = velocity.copy().heading()
    feelers = [
        createVector(Math.cos(heading), Math.sin(heading)).setMag(50)
    ]
}

function mouseClicked() {
    running = true;
}

function wallAvoidance() {

    let wallIndex = -1;
    let steering = createVector(0, 0)

    for (let i = 0; i < feelers.length; i++) {

        for (let w = 0; w < walls.length; w++) {

            const intersection = intersects(
                position.x,
                position.y,
                position.x + feelers[i].x,
                position.y + feelers[i].y,
                walls[w][0].x,
                walls[w][0].y,
                walls[w][1].x,
                walls[w][1].y
            )

            if (intersection) {
                wallIndex = w;
            }

        }

        if (wallIndex >= 0) {
            const nearest = findNearest(position, walls[wallIndex][0], walls[wallIndex][1])
            const overShoot = createVector(position.x + feelers[i].x, position.y + feelers[i].y).sub(nearest)


            const wallVec  = walls[wallIndex][1].copy().sub(walls[wallIndex][0]);
            const wallNormal = createVector(-wallVec.y, wallVec.x);

            steering = wallNormal.mult(overShoot.mag())
            return steering
        }


    }

    return steering

}

let seekForce;
let avoidForce;

function steeringForce() {

    seekForce = seek();
    avoidForce = wallAvoidance()

    // console.log(seekForce)


    return seekForce.copy().add(avoidForce)
        .limit(maxSteeringForce)
}

function updatePos() {
    // running = false;
    acceleration = steeringForce()

    // console.log(acceleration)

    velocity.add(acceleration).limit(maxSpeed);

    position.add(velocity)

}


function setup() {

    position = createVector(150, 100)
    velocity = createVector(0, 0);
    acceleration = createVector(0, 0);

    createCanvas(600, 600);

    walls = findWalls()
    optimizeWalls()

}



function draw() {

    if (!running) return;

    updatePos()
    updateFeelers();

    background(220);
    stroke("white")

    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {

            let c = getTileColor(j, i)

            fill(c)
            square(j * tileSize, i * tileSize, tileSize)

        }
    }

    for (let i = 0; i < walls.length; i++) {
        stroke("red")
        line(
            walls[i][0].x, walls[i][0].y,
            walls[i][1].x, walls[i][1].y
        )
    }

    noStroke()
    fill("white");
    circle(position.x, position.y, 10);

    const heading = velocity.heading();
    const headingVector = createVector(
        Math.cos(heading), Math.sin(heading)
    ).setMag(10)



//     stroke("blue")
//     for (let i = 0; i < feelers.length; i++) {
//         line(position.x, position.y, position.x + feelers[i].x, position.y + feelers[i].y)
//     }


//     stroke("green")
//     line(position.x, position.y, position.x + seekForce.x * 30, position.y + seekForce.y * 30)

//     stroke("yellow")
//     line(position.x, position.y, position.x + avoidForce.x, position.y + avoidForce.y)

    stroke("white")
    line(position.x, position.y, position.x + headingVector.x, position.y + headingVector.y)

}