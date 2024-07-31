
## WIP alert!!!


### for neuroevolving rps
    - to do :
        - a slider to increase training speed ?
        - a network "brain" visualzer will be relly nice 


    - [x] make it predict
    - [x] when it loose, its score is zero and it gets mutated brain of the winner, winner score inc by 0.2x
    - [x] when game over, start the genetic algorithm process
        - [x] figure out how to get data of each type of agent. Remember this game ends when there is only type remaining
            - [x] caching brain ?
    - [x] generate -ve or not from brain
    - [x] limit score to a particular max score
    - [x] each agent will store numOfAgent agents of all types (maximum). If max is reached, we will remove one of the agent with smallest net score.
        - example if there are 6 agents (numOfAgents is 2), a rock agent will have a history property like: history: [rock: [(2 rock)], p: [(2 p)], s: [(2 s)]]
    - [x] a new generation will look at all of history for getting accurate fitness
    - [] every 100 generation, back up all the weights 
    - [x] use ml5js library and see that it works
        - [] can replace with own library later

    - try # right now, its not learning well. 
        - remove quad tree and make sure all agents visible to all agents (maybe its the blidness that is making it incapable of learning)
        - being stationary is still not solved (try punishing more harshly)
        - reevaluate its finess calculation, (I might be missing something here)


    - to check how its done in others:
        - normalization
        - is score never penalized ?
        - 
    - To think about
        - [] if I introduce obstacles, I will really know if this env is actully learning
        - [] why does my agents dont move towards left as much

    - we can use Array.slice() to get a copy of an Array
    