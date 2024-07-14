let agents
let rock
let paper
let scissor
let mask
let rock_sound
let paper_sound
let scissor_sound
let button
let button_reset
let checkbox
var debug = false
var GEN = 1 // generation

function preload() {
    rock = loadImage('assets/rock.png')
    paper = loadImage('assets/paper.png')
    scissor = loadImage('assets/scissor.png')
    mask = loadImage('assets/performing-arts.png')
    // rock_sound = loadSound("assets/rock_effect.wav");
    // paper_sound = loadSound("assets/paper_effect.wav");
    // scissor_sound = loadSound("assets/scissor_effect.mp3");
}

function resetSketch() {
    agents = []
    numOfAgents = 5
    for (let i = 0; i < numOfAgents; i++) {
        agents.push(new AgentGeneric('rock'))
        agents.push(new AgentGeneric('paper'))
        agents.push(new AgentGeneric('scissor'))
    }
    if (!isLooping()) loop()
}

function setup() {
    rectMode(CENTER)
    imageMode(CENTER)
    createCanvas(200, 200)
    resetSketch()
    button = createButton('Pause/Play')
    button.position(width / 2 - 50, height)
    button.mousePressed(toggleLoop)
    button = createButton('Reset')
    button.position(width - 50, height)
    button.mousePressed(resetSketch)
    checkbox = createCheckbox(' Debug!')
    checkbox.position(0, height)
}

function toggleLoop() {
    isLooping() ? noLoop() : loop()
}

// maybe replace with own settimeout loop ?
function draw() {
    debug = checkbox.checked() ? true : false
    qtree = QuadTree.create()
    background(0)
    fill("white")
    textSize(10);
    text(`Generation : ${GEN}`, 5, 10);
    // show GEN text

    for (let cycle = 0; cycle < 3; cycle++) {
        for (let i = 0; i < agents.length; i++) {
            let curr = agents[i]
            rectangle = new Rectangle(
                curr.position.x,
                curr.position.y,
                curr.r,
                curr.r,
                curr
            )
            qtree.insert(rectangle)
            let range = new Circle(curr.position.x, curr.position.y, curr.r * 2) // range kinda small ?
            let points = qtree.query(range)
            curr.checkCollisionsAndDrawLine(points)
            // order matters because we set highlight in checkCollisions. draw() is called after this
            curr.draw()
            curr.jitter()
            curr.update()
            // curr.boundary()
        }
        if (debug) show(qtree)        
    }
    if (agents.every((agent) => agent.choice === agents[0].choice)) {
        console.log(`GAME OVER !!! ${agents[0].choice} WINS.`)
        noLoop()
        // alert(`GAME OVER !!! ${agents[0].choice} WINS.`)

        // START new generation process
        nextGeneration()
    }
}

function show(qtree) {
    noFill()
    strokeWeight(1)
    rectMode(CENTER)
    stroke(255, 41)
    rect(qtree.boundary.x, qtree.boundary.y, qtree.boundary.w, qtree.boundary.h)

    stroke(255)
    strokeWeight(2)

    if (qtree.divided) {
        show(qtree.northeast)
        show(qtree.northwest)
        show(qtree.southeast)
        show(qtree.southwest)
    }
}

