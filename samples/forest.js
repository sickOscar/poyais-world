
function Tree(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.colliding = false;
}




function Forest(options) {
    this.forest = [];
    this.center = options.center;
    this.radius = options.radius || 0;
    this.trees = options.trees || 1;
    this.minRadius = options.minRadius || 1;
    this.treeRadius = options.treeRadius || 1;
}

Forest.prototype.round = function() {
    for(let i = 0; i < this.trees; i++) {
        if (this.forest[i]) continue;
        const x = this.center.x + this.radius * Math.random() * Math.cos(Math.PI * 2 / this.trees * i);
        const y = this.center.y + this.radius * Math.random() * Math.sin(Math.PI * 2 / this.trees * i);
        const r = this.minRadius + this.treeRadius * Math.random();
        this.forest[i] = new Tree(x, y, r);
    }
}

Forest.prototype.square = function() {

    for (let i = 0; i < this.trees; i++) {
        if (this.forest[i]) continue;

        const x = this.center.x / 2 + this.radius * 2 * Math.random();
        const y = this.center.y / 2 + this.radius * 2 * Math.random();
        const r = this.minRadius + this.treeRadius * Math.random();

        this.forest[i] = new Tree(x, y, r)

    }
}

Forest.prototype.checkCollisions = function() {
    const trees = this.forest.length;
    for(let i = 0; i < trees; i++) {
        if (this.forest[i] === null) continue;
        for(let j = 0; j < trees; j++) {
            if(i === j) continue;
            if (this.forest[j] === null) continue;
            const distance = Math.sqrt(
                Math.pow(this.forest[j].x - this.forest[i].x, 2) + Math.pow(this.forest[j].y - this.forest[i].y, 2)
            )
            const sumOfRadi = this.forest[i].radius + this.forest[j].radius;


            const distanceFactor = 1;

            if (distance < (sumOfRadi * distanceFactor)) {
                this.forest[j] = null;
                console.log('colliding')
            }
        }
    }
}

Forest.prototype.render = function() {
    console.log(this.forest)
    for(let i = 0; i < this.forest.length; i++) {
        if (this.forest[i])
            circle(this.forest[i].x, this.forest[i].y, this.forest[i].radius * 2)
    }
}


function setup() {



    createCanvas(600, 600);

    center = createVector(200, 200)

    noStroke();
    fill("brown")



    const f = new Forest({
        center: createVector(200, 200),
        radius: 100,
        trees: 40,
        treeRadius: 10,
        minRadius: 1
    });

    f.round();
    f.checkCollisions();



    f.render()

//   const f1 = new Forest({
//     center: createVector(500,200),
//     radius: 100,
//     trees: 20,
//     treeRadius: 10,
//     minRadius: 1
//   });

//   f1.square();
//   f1.checkCollisions();
//   f1.render()

//   const f2 = new Forest({
//     center: createVector(300,400),
//     radius: 100,
//     trees: 50,
//     treeRadius: 10,
//     minRadius: 1
//   });

//   f2.square()
//   f2.checkCollisions();
//   f2.render()

}



function draw() {
    // background(255);


    // noStroke();
    // fill("brown")




}