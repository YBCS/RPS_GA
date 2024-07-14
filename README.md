
## A study of rock paper scissor simulation

Based on the [viral tweet](https://x.com/juanbuis/status/1600155605112496129)

This is an attempt to recreate the program which is running in the tweet.

I think its preety close. 

Uses p5js; quadtree implementation from the coding train.

Features:

    - Interactive  
    - Uses QuadTrees for collision detection
    - Debug view!

Foreward:

    - repel mechanism
    - adding sound
    - more interaction elements
    - visualizing statistics

### Play it [HERE!](https://ybcs.github.io/RPS_Play/)

### Read its corresponding blog [HERE!](https://ybcs.github.io/tech/blog/2024/05/23/a-rock-paper-scissor-moment.html)


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
    - [] when game over, start the genetic algorithm process
        - [] figure out how to get data of each type of agent. Remember this game ends when there is only type remaining
            - [] caching brain ?
    - [] generate -ve or not from brain
    
    - To think about
        - [] if I introduce obstacles, I will really know if this env is actully learning
        - [] what If I introduce some sort of health meter ?