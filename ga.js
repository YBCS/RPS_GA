// genetic algorithm stuff

function nextGeneration() {
  GEN += 1
  normalizeFitness(agents)
  agents = generate(agents)
 if (!isLooping()) loop()
}

function generate(oldAgents) {
  let newAgents = []
  let per_agent = oldAgents.length / 3

  // select the winner first
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
  //  select the other types 
  for (let i = 0; i < per_agent; i++) {
    let newAgent = poolSelection(oldAgents, other_choice_1)
    newAgents.push(newAgent)
  }  
  for (let i = 0; i < per_agent; i++) {
    let newAgent = poolSelection(oldAgents, other_choice_2)
    newAgents.push(newAgent)
  }
  print('new agents ', newAgents)
  return newAgents
}

function poolSelection(agents, choice) {
  let index = 0

  let r = random(1)
  while (r > 0) {
    r -= agents[index].fitness
    index += 1
  }
  index -= 1
  
  return agents[index].copy(choice)
}

function normalizeFitness(agents) {
  let score_sum = agents.reduce((acc, agent) => acc + agent.score, 0)
  for (const agent of agents) {
    agent.fitness = agent.score / score_sum
  }
}
