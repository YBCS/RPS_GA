function uid() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

let MAX_SCORE = 200
let POINTS_PER_PREY = 0.4 * MAX_SCORE
let MUTATION_RATE = 0.1
// base class for all agents -> 🤘 📰 ✂
class Agent {
  constructor(x = random(width - 20), y = random(height - 20), brain) {
    this.id = uid()
    this.r = 20 // gets complicated if r is exposed

    this.position = createVector(x, y)
    this.velocity = createVector(random(-0.5, 0.5), random(-0.5, 0.5))
    this.constrainToBox() // too close to one of the edges

    this.score = 0                // how many frames it has been alive (upto MAX_SCORE)
    this.prey_score = 0           // how many prey it has eaten
    this.explorationScore = 0     // how many cells it has explored
    this.fitness = 0              // fitness is net-score normalized
    
    if (brain) {
      this.brain = brain.copy()
      this.brain.mutate(MUTATION_RATE)
    } else {
      this.brain = ml5.neuralNetwork({
        inputs: 7,
        outputs: 2,
        task: "regression", // todo : read source: what does this do ?
        neuroEvolution: true,
      });
    }
    this.visitedCells = new Set() // what happens in history
    this.history = { rock: [], paper: [], scissor: [] } // cache numOfAgents agents of each type
  }

  constrainToBox() {
    this.position.x = constrain(this.position.x, this.r / 2, width - this.r / 2)
    this.position.y = constrain(this.position.y, this.r / 2, height - this.r / 2)    
  }

  draw(i) {
    rect(this.position.x, this.position.y, this.r)
    stroke('green')
    if (i && debug) {
      text(
        `pos: (${int(this.position.x)}, ${int(this.position.y)}) ${str(i)}`,
        this.position.x,
        this.position.y
      )
    }
  }

  move() {
    this.position.add(this.velocity)

    // update fitness related hyperparameteres
    this.score = min(this.score + 1, MAX_SCORE)
    const cellKey = `${floor(this.position.x)},${floor(this.position.y)}`;
    if (!this.visitedCells.has(cellKey)) {
      this.visitedCells.add(cellKey);
      this.explorationScore += 1
    }
  }

  jitter() {
    let jitter = createVector(random(-1, 1), random(-1, 1))
    this.position.add(jitter)
    this.position.x = constrain(this.position.x, this.r / 2, width - this.r / 2)
    this.position.y = constrain(
      this.position.y,
      this.r / 2,
      height - this.r / 2
    )
  }

  boundary() {
    // bounce off the walls

    if (
      this.position.x > width - this.r / 2 ||
      this.position.x - this.r / 2 < 0
    ) {
      this.velocity.x *= -1
    }
    if (
      this.position.y > height - this.r / 2 ||
      this.position.y - this.r / 2 < 0
    ) {
      this.velocity.y *= -1
    }
  }
}

class AgentGeneric extends Agent {
  constructor(choice, x = random(width - 20), y = random(height - 20), brain) {
    super(x, y, brain)
    this.choice = choice
    this.choice_code = this.getChoiceCode(choice)

    this.choice_history = [this.choice]           // recording its transition
    this.choice_code_history = [this.choice_code] // recoring its transition
  }

  // mutates brain
  copy(brain) {
    return new AgentGeneric(
      this.choice,
      random(width - 20),
      random(height - 20),
      brain
    )
  }


  // rock 0, paper 1, scissor 2, unknown: -1
  getChoiceCode(choice) {
    return choice === 'rock'
      ? 0
      : choice === 'paper'
      ? 1
      : choice === 'scissor'
      ? 2
      : -1
  }

  updateHistory(agent) { // looser agent
    // add history to the agent
    // cannot push an agent directly because of reference error

    let cur_net_score = agent.score
    cur_net_score += agent.prey_score * POINTS_PER_PREY
    cur_net_score += agent.explorationScore * 10

    agent.history[agent.choice].push({
      choice: agent.choice,
      choice_code: this.getChoiceCode(agent.choice),
      score: 0.6 * cur_net_score, // save 60% score
      prey_score: agent.prey_score,
      explorationScore: agent.explorationScore,
      brain: agent.brain.copy(),
    })

    if (agent.history[agent.choice].length > numOfAgents) {
      // remove the one with least score


      let least_net_score = cur_net_score
      let least_net_score_index = -1

      for (let i = 0; i < agent.history[agent.choice].length; i++) {
        let past_agent = agent.history[agent.choice][i]
        let past_net_score = past_agent.score
        past_net_score += past_agent.prey_score * POINTS_PER_PREY
        past_net_score += past_agent.explorationScore * 10
        if (past_net_score < least_net_score) {
          least_net_score = past_net_score
          least_net_score_index = i
        }
      }
      if (least_net_score_index === -1) {
        agent.history[agent.choice].pop()
      } else {
        agent.history[agent.choice].splice(least_net_score_index, 1)
      }
    }
  }

  updateChoice(winner, looser) {
    /*
      update the choice of looser
      mutate the winner brain
      update score of looser and then winner
		*/

    looser.choice_history.push(winner.choice)
    looser.choice_code_history.push(winner.choice_code)

    looser.choice = winner.choice
    looser.choice_code = winner.choice_code

    let winner_brain = winner.brain.copy() // can it create unwanted reference ?
    winner_brain.mutate(MUTATION_RATE)
    looser.brain = winner_brain
    
    looser.score = 0
    looser.prey_score = 0
    looser.explorationScore = 0
    looser.visitedCells = new Set()
    winner.prey_score += 1
  }

  draw(i) {
    // super.draw(i) // for debugging
    switch (this.choice) {
      case 'rock':
        image(rock, this.position.x, this.position.y, this.r, this.r)
        break
      case 'paper':
        image(paper, this.position.x, this.position.y, this.r, this.r)
        break
      case 'scissor':
        image(scissor, this.position.x, this.position.y, this.r, this.r)
        break
      default:
        image(mask, this.position.x, this.position.y, this.r, this.r)
        break
    }
    if (debug) {
      // draw quadtree range
      strokeWeight(1)
      stroke("red")
      noFill()
      circle(this.position.x, this.position.y, this.r * 2 * 2)
    }    
  }

  update() {
    this.move()
    this.boundary()
    this.constrainToBox()
  }

  // todo : can I use a function so that DRY ?
  checkCollisionsAndDrawLine(others) {
    let closest_rock_from_paper
    let closest_scissor_from_paper
    let closest_rock_from_scissor
    let closest_paper_from_scissor
    let closest_paper_from_rock
    let closest_scissor_from_rock
    let closest_rock_from_paper_dist = max(width, height)
    let closest_rock_from_scissor_dist = max(width, height)
    let closest_paper_from_scissor_dist = max(width, height)
    let closest_paper_from_rock_dist = max(width, height)
    let closest_scissor_from_rock_dist = max(width, height)
    let closest_scissor_from_paper_dist = max(width, height)

    for (let i = 0; i < others.length; i++) {
      let item = others[i].userData
      if (this.choice_code !== item.choice_code) {
        let d = dist(
          this.position.x,
          this.position.y,
          item.position.x,
          item.position.y
        )

        if (this.choice_code === 0) {
          // rock
          // get the closest scissor
          if (item.choice_code == 2) {
            if (d < closest_scissor_from_rock_dist) {
              closest_scissor_from_rock = others[i]
              closest_scissor_from_rock_dist = d
              if (d < this.r) {
                // intersects
                this.collisionResolution(others[i])
              }
            }
          }
          // rock meets paper -> rock becomes paper
          if (item.choice_code == 1) {
            if (d < closest_paper_from_rock_dist) {
              closest_paper_from_rock = others[i]
              closest_paper_from_rock_dist = d
              if (d < this.r) {
                // intersects
                this.collisionResolution(others[i])
              }
            }
          }
        }

        if (this.choice_code === 1) {
          // paper
          // get the closest rock
          if (item.choice_code == 0) {
            if (d < closest_rock_from_paper_dist) {
              closest_rock_from_paper = others[i]
              closest_rock_from_paper_dist = d
              if (d < this.r) {
                // intersects
                this.collisionResolution(others[i])
              }
            }
          }
          // paper meets scissor -> paper becomes scissor
          if (item.choice_code == 2) {
            if (d < closest_scissor_from_paper_dist) {
              closest_scissor_from_paper = others[i]
              closest_scissor_from_paper_dist = d
              if (d < this.r) {
                // intersects
                this.collisionResolution(others[i])
              }
            }
          }
        }

        if (this.choice_code === 2) {
          // scissor
          // get the closest paper
          if (item.choice_code == 1) {
            if (d < closest_paper_from_scissor_dist) {
              closest_paper_from_scissor = others[i]
              closest_paper_from_scissor_dist = d
              if (d < this.r) {
                // intersects
                this.collisionResolution(others[i])
              }
            }
          }
          // scissor meets rock -> scissor becomes rock
          if (item.choice_code === 0) {
            if (d < closest_rock_from_scissor_dist) {
              closest_rock_from_scissor = others[i]
              closest_rock_from_scissor_dist = d
              if (d < this.r) {
                // intersects
                this.collisionResolution(others[i])
              }
            }
          }
        }
      }
    }

    let predator, prey
    if (this.choice_code === 2) {
      // scissors
      predator = closest_rock_from_scissor
      prey = closest_paper_from_scissor
    } else if (this.choice_code === 1) {
      // paper
      predator = closest_scissor_from_paper
      prey = closest_rock_from_paper
    } else if (this.choice_code === 0) {
      // rock
      predator = closest_paper_from_rock
      prey = closest_scissor_from_rock
    }

    this.think(predator, prey)
  }

  think(nearest_predatory, nearest_prey) {
    // Example: for scissor; nearest predator = rock, nearest prey = paper
    // inputs can be null too
    // inputs[i] needs to be in range[0,1]

    let inputs = [0, 0, 0, 0, 0, 0, 0] // position, predotor, prey
    let pos = this.position
    inputs[0] = pos.x / width
    inputs[1] = pos.y / height

    if (nearest_predatory) {
      let predator = nearest_predatory.userData.position
      inputs[2] = predator.x / width
      inputs[3] = predator.y / height
    }
    if (nearest_prey) {
      let prey = nearest_prey.userData.position
      inputs[4] = prey.x / width
      inputs[5] = prey.y / height
    }

    let curr_score = this.score
    curr_score += this.prey_score * POINTS_PER_PREY
    curr_score += this.explorationScore * 10
    let max_possible_score = MAX_SCORE + (numOfAgents * POINTS_PER_PREY) + (width * height * 10)
    inputs[6] = map(curr_score, 0, max_possible_score, 0, 1)

    let output = this.brain.predictSync(inputs)
    let angle = output[0].value * TWO_PI;
    let magnitude = output[1].value;
    let force = p5.Vector.fromAngle(angle).setMag(magnitude);
    this.position.add(force)
  }

  drawLineUtil(destination, color) {
    stroke(color)
    line(
      this.position.x,
      this.position.y,
      destination.position.x,
      destination.position.y
    )
  }

  collisionResolution(other) {
    let item = other.userData
    if (this.choice_code === item.choice_code) {
      return
    }

    if (debug) {
      // highlights the two boxes which are meeting
      stroke('green')
      rect(this.position.x, this.position.y, this.r, this.r)
      stroke('red')
      rect(item.position.x, item.position.y, item.r, item.r)
      // noLoop()
    }

    let winner, looser

    if (this.choice_code === 0 && item.choice_code === 1) {
      // other wins
      winner = item
      looser = this
    } else if (this.choice_code === 0 && item.choice_code === 2) {
      // mine wins
      winner = this
      looser = item
    } else if (this.choice_code === 1 && item.choice_code === 0) {
      // mine wins
      winner = this
      looser = item
    } else if (this.choice_code === 1 && item.choice_code === 2) {
      // other wins
      winner = item
      looser = this
    } else if (this.choice_code === 2 && item.choice_code === 0) {
      // other wins
      winner = item
      looser = this
    } else if (this.choice_code === 2 && item.choice_code === 1) {
      // mine wins
      winner = this
      looser = item
    }

    this.updateHistory(looser)
    this.updateChoice(winner, looser)
    return
  }
}
