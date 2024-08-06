let agents
let loadedAgents
let rock
let paper
let scissor
let mask
let rock_sound
let paper_sound
let scissor_sound
let button
let button_load
let button_reset
let checkbox
let timeSlider
let numOfAgents
var debug = false
var isPreloadAgents = false // just a flag for now
var GEN = 1 // generation
var frame = 0

function handleData(data) {
  print('loaded json', data)
  loadedAgents = []
  for (let agent of data) {
    let agentFromJSON = AgentGeneric.fromJSON(agent)
    loadedAgents.push(agentFromJSON)
  }
  print('all agents loaded ', loadedAgents)
}

function handleLoadError(err) {
  console.error("FAILED TO LOAD JSON ", err)
}

function preload() {
  rock = loadImage('assets/rock.png')
  paper = loadImage('assets/paper.png')
  scissor = loadImage('assets/scissor.png')
  mask = loadImage('assets/performing-arts.png')
  // rock_sound = loadSound("assets/rock_effect.wav");
  // paper_sound = loadSound("assets/paper_effect.wav");
  // scissor_sound = loadSound("assets/scissor_effect.mp3");

  isPreloadAgents ? loadJSON("checkpoint/data1050.json", handleData, handleLoadError) : null
}

function resetSketch(loadFromJson) {
  print('reset pressed ', loadFromJson)
  GEN = 1
  frame = 0
  if (loadFromJson) {
    agents = loadedAgents
  } else {
    agents = []
    numOfAgents = 3
    for (let i = 0; i < numOfAgents; i++) {
      agents.push(new AgentGeneric('rock'))
      agents.push(new AgentGeneric('paper'))
      agents.push(new AgentGeneric('scissor'))
    }
  }
if (!isLooping()) loop()
}

function loadAgents() {
  resetSketch(true)
}
function resetSketchWithoutLoad() {
  resetSketch(false)
}

function setup() {
  rectMode(CENTER)
  imageMode(CENTER)
  createCanvas(250, 250)
  ml5.tf.setBackend("cpu");
  resetSketch()
  button = createButton('Pause/Play')
  button.position(width / 2 - 50, height)
  button.mousePressed(toggleLoop)
  
  // button_load = createButton('Load Agents')
  // button_load.position(width / 2 - 50, height + 30)
  // button_load.mousePressed(loadAgents)
  
  button_reset = createButton('Reset')
  button_reset.position(width - 50, height)
  button_reset.mousePressed(resetSketchWithoutLoad)

  checkbox = createCheckbox(' Debug!')
  checkbox.position(0, height)

  timeSlider = createSlider(1, 20, 1);
  timeSlider.position(10, height + 30);
}

function toggleLoop() {
  isLooping() ? noLoop() : loop()
}

function draw() {
  strokeWeight(0)
  debug = checkbox.checked() ? true : false
  let qtree = QuadTree.create()
  background(0)
  fill('white')
  textSize(10)
  text(`Generation : ${GEN}`, 5, 10)
  text(`frames : ${frame}`, 5, 20)
  noFill() // cleanup

  for (let cycle = 0; cycle < timeSlider.value(); cycle++) {
    frame += 1
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
      let range = new Circle(curr.position.x, curr.position.y, curr.r * 2)
      let points = qtree.query(range)
      curr.checkCollisionsAndDrawLine(points)
      curr.draw()
      // curr.jitter()
      curr.update()
    }
    if (debug) show(qtree)
  }
  if (agents.every((agent) => agent.choice === agents[0].choice)) {
    getNextGeneration(`GAME OVER !!! ${agents[0].choice} WINS.`, false)
  }
  if (GEN <= 100 && frame > 400) {
      getNextGeneration("TIMEOUT !!!", true)
  }
  if (GEN > 100 && frame > 800) {
      getNextGeneration("TIMEOUT !!!", true)
  }

  if (GEN % 50 === 0 && frame === 0) {
    // // every 50 generation save progress
    // print('Saving weights...')
    // let agentWriter = createWriter(`data${GEN}`, 'json')
    // agentWriter.print(JSON.stringify(agents))
    // agentWriter.close()
  }
}

function getNextGeneration(text, isTimeout) {
  console.log(text)
  noLoop()
  nextGeneration(isTimeout)
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
