// genetic algorithm stuff

function nextGeneration() {
  GEN += 1
  frame = 0
  // I think I will need to do both things together to be more efficient ?
  //  you can think of efficiency later, first make it work
  normalizeFitness(agents)
  // agents = generate(agents)
//  if (!isLooping()) loop()
}

function generate(oldAgents) {
  let newAgents = []
  let per_agent = oldAgents.length / 3

  // select the winner first
  // todo : in case of timeout, this is not applicable so... 
  let winner_choice = oldAgents[0].choice
  for (let i = 0; i < per_agent; i++) {
    let newAgent = poolSelection(oldAgents, winner_choice)
    newAgents.push(newAgent)
  }

  let other_choice_1
  let other_choice_2
  if (winner_choice === "rock") {
    other_choice_1 = "paper"
    other_choice_2 = "scissor"
  }
  if (winner_choice === "paper") {
    other_choice_1 = "rock"
    other_choice_2 = "scissor"
  }
  if (winner_choice === "scissor") {
    other_choice_1 = "paper"
    other_choice_2 = "rock"
  }
  isOld = true
  //  select the other types 
  for (let i = 0; i < per_agent; i++) {
    let newAgent = poolSelection(oldAgents, other_choice_1, isOld)
    newAgents.push(newAgent)
  }  
  for (let i = 0; i < per_agent; i++) {
    let newAgent = poolSelection(oldAgents, other_choice_2, isOld)
    newAgents.push(newAgent)
  }
  print('new agents ', newAgents)
  return newAgents
}

function poolSelection(agents, choice, isOld=false) {
  let index = 0

  let r = random(1)
  while (r > 0) {
    r -= agents[index].fitness
    index += 1
  }
  index -= 1
  
  return agents[index].copy(choice, isOld)
}

// lets assume for a moment the game does finish
// there are 6 agents, 2 of each type
// lets say rock is winning that means at the moment all 6 agents are rock
// I can pick 2 of the best rock's score
// what about the score for paper and scissor
// does it make sense to use cached score ?
// yeah it does, that's why we cached it. Using it will calculate the accurate score_sum
// we need 2 sorted versions of agents
  // 1) sorted by score --> pick 2 best to get winner's scores 
  // 1) sorted by cached score (means we have to filter them out) --> pick 2 of each with best scores
function getNormalizeFitness(agents) {
  // I should be using cached score ?
  // also now there is a new points per prey

  // let score_sum = agents.reduce((acc, agent) => acc + agent.score, 0)
  // for (const agent of agents) {
  //   agent.fitness = agent.score / score_sum
  // }

  // get the winners score
  let per_agent = agents.length / 3
  let score_sum = 0



  /*
  what if this was a timeout
    - there is no winner 
    - how to pick the best ?
    - ideally the algorithm for normalizing should work the same way
  */
}
