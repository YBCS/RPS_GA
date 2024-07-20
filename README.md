
## WIP alert!!!


### for neuroevolving rps
    - training mode ?
    - to do :
        - calculate nearest predator and prey but dont move in closer: that should be decided by the network
        - a slider to increase training speed
        - a network "brain" visualzer will be relly nice 
        - all the constrainst call be moved to a function and used -- cleanliness ?
    - to check how its done in others:
        - normalization
        - is score never penalized ?
        - 
    - to remove : 
        - 

    - [x] make it predict
    - [x] when it loose, its score is zero and it gets mutated brain of the winner, winner score inc by 0.2x
    - [x] when game over, start the genetic algorithm process
        - [x] figure out how to get data of each type of agent. Remember this game ends when there is only type remaining
            - [x] caching brain ?
    - [x] generate -ve or not from brain
    - [x] limit score to a particular max score
    - [] each agent will store numOfAgent agents of all types (maximum). If max is reached, we will remove one of the agent with smallest net score.
        - example if there are 6 agents (numOfAgents is 2), a rock agent will have a history property like: history: [rock: [(2 rock)], p: [(2 p)], s: [(2 s)]]
    - [] a new generation will look at all of history for getting accurate fitness
    
    - To think about
        - [] if I introduce obstacles, I will really know if this env is actully learning
        - [] what If I introduce some sort of health meter ?

    - every 100 generation, back up all the weights 
    - for first 60 generation --> restart in 400 frames
        - after that restart when frame is above 600 or 700
    - load the weights and see how it performs
    - noooo I forgot to use the cached brain; what about cached score
    - when it times out, I cannot really use agents[0] for the "winner" case 



    - we can use Array.slice() to get a copy of an Array
    