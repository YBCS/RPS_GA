// genetic algorithm stuff

function nextGeneration(isTimeout) {
  print('all agents ', agents)
  let { rocks, papers, scissors } = segregate(agents, isTimeout)
  normalizeFitness(rocks)
  normalizeFitness(papers)
  normalizeFitness(scissors)

  // print('rocks after normalizing ', rocks )
  // print('paper after normalizing ', papers)
  // print('scissors after normalizing ', scissors)
  
  new_rocks = generate(rocks)
  new_papers = generate(papers)
  new_scissors = generate(scissors)
  
  // print('generated new rocks ', new_rocks)
  // print('generated new papers ', new_papers)
  // print('generated new scissors ', new_scissors)

  agents = [...new_rocks, ...new_papers, ...new_scissors]
  GEN += 1
  frame = 0
  if (!isLooping()) loop()
}

function segregate(oldAgents, isTimeout) { // todo: is isTimeout necessary
  const rocks = []
  const papers = []
  const scissors = []

  function pushToAgentList(agent) {
    if (!isTimeout) agent.score *= 3
    let net_score = agent.score
    net_score += agent.prey_score * POINTS_PER_PREY
    net_score += agent.explorationScore * 10
    net_score += agent.survivalTime * 5
    const agentData = {
      net_score: net_score,
      brain: agent.brain,
      fitness: 0,
      choice: agent.choice,
    }

    switch (agent.choice) {
      case 'rock':
        rocks.push(agentData)
        break
      case 'paper':
        papers.push(agentData)
        break
      case 'scissor':
        scissors.push(agentData)
        break
    }

    for (let rock of agent.history['rock']) {
      rocks.push({
        net_score: rock.score,
        brain: rock.brain,
        fitness: 0,
        choice: rock.choice,
      })
    }
    for (let paper of agent.history['paper']) {
      papers.push({
        net_score: paper.score,
        brain: paper.brain,
        fitness: 0,
        choice: paper.choice,
      })
    }
    for (let scissor of agent.history['scissor']) {    
      scissors.push({
        net_score: scissor.score,
        brain: scissor.brain,
        fitness: 0,
        choice: scissor.choice,
      })
    }
  }

  for (let agent of oldAgents) {
    pushToAgentList(agent)
  }

  return { rocks, papers, scissors }
}

function generate(oldAgents) {
  const newAgents = []
  for (let i = 0; i < numOfAgents; i++) {
    let newAgent = poolSelection(oldAgents)
    newAgents.push(newAgent)
  }

  return newAgents
}

function poolSelection(agents) {
  let index = 0

  let r = random(1)
  while (r > 0) {
    r -= agents[index].fitness
    index += 1
  }
  index -= 1

  agent = agents[index]
  return new AgentGeneric(
    agent.choice,
    random(width - 20),
    random(height - 20),
    agent.brain
  )
}

function normalizeFitness(agents) {
  let total_net_score = 0
  for (const agent of agents) {
    total_net_score += agent.net_score
  }
  for (const agent of agents) {
    agent.fitness = agent.net_score / total_net_score
  }
}
