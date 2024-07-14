function mutate_fn(x) {
	if (random(1) < 0.1) {
		let offset = randomGaussian() * 0.5;
		let newx = x + offset;
		return newx;
	} else {
		return x;
	}
}

// base class for all agents -> 🤘 📰 ✂
class Agent {
	constructor(x = random(width - 20), y = random(height - 20), brain) {
		this.r = 20; // gets complicated if r is exposed

		this.highlight = false;
		this.position = createVector(x, y);
		this.velocity = createVector(random(-0.5, 0.5), random(-0.5, 0.5));

		// too close to one of the edges
		this.position.x = constrain(this.position.x, this.r, width - this.r);
		this.position.y = constrain(this.position.y, this.r, height - this.r);

		this.score = 0; //  score is how many frames it has been alive
		this.fitness = 0; // to get fitness; we simply normalize the score
		if (brain) {
			this.brain = brain.copy();
			this.brain.mutate(mutate_fn);
		} else {
			this.brain = new NeuralNetwork(6, 10, 4); // pos(x,y),  prey(x,y), predator(x,y)
			// velocity need not be an input coz here its simply used as a constant to not be stationary
			// output should tell us if to use negetive position or not ?
		}
		this.cache_brain = null; // cache its original weights
		this.cache_score = null; // cache its original score
		// suppose there are 6 agents
		// in the end only 1 type of agent survive
		// how to get genetic information of those other agents which are now extinct
		// so we just back up its initial brain so that we can use that for next generation
	}

	draw(i) {
		if (this.highlight) {
			fill(255, 100);
		} else {
			fill("white");
		}
		rect(this.position.x, this.position.y, this.r);
		stroke("green");
		if (i && debug) {
			text(
				`pos: (${int(this.position.x)}, ${int(this.position.y)}) ${str(i)}`,
				this.position.x,
				this.position.y
			); // order matters
		}
	}

	move() {
		this.position.add(this.velocity);
		this.score += 1; // TODO:is it growing too fast ?
	}

	jitter() {
		let jitter = createVector(random(-1, 1), random(-1, 1));
		this.position.add(jitter);
		this.position.x = constrain(
			this.position.x,
			this.r / 2,
			width - this.r / 2
		);
		this.position.y = constrain(
			this.position.y,
			this.r / 2,
			height - this.r / 2
		);
	}

	boundary() {
		// bounce off the walls

		if (
			this.position.x > width - this.r / 2 ||
			this.position.x - this.r / 2 < 0
		) {
			this.velocity.x *= -1;
		}
		if (
			this.position.y > height - this.r / 2 ||
			this.position.y - this.r / 2 < 0
		) {
			this.velocity.y *= -1;
		}
	}
}

class AgentGeneric extends Agent {
	constructor(choice, x = random(width - 20), y = random(height - 20), brain) {
		super(x, y, brain);
		this.choice = choice;
		this.choice_code = this.getChoiceCode(choice);
		this.choices = [this.choice]; // recording its transition
		this.choice_codes = [this.choice_code];
	}

	// this will also mutate the brain
	copy(choice) {
		return new AgentGeneric(
			choice,
			random(width - 20),
			random(height - 20),
			this.brain
		);
	}

	// rock 0, paper 1, scissor 2, unknown: -1
	getChoiceCode(choice) {
		return choice === "rock"
			? 0
			: choice === "paper"
			? 1
			: choice === "scissor"
			? 2
			: -1;
	}

	updateChoice(winner, looser) {
		looser.choices.push(winner.choice);
		looser.choice_codes.push(winner.choice_code);
		looser.choice = winner.choice;
		looser.choice_code = winner.choice_code;
		if (!this.cache_brain) this.cache_brain = looser.brain.copy();
		if (!this.cache_score) this.cache_score = 0.8 * looser.score; // save 80 percent score
		let winner_brain = winner.brain.copy(); // can it create unwanted reference ?
		winner_brain.mutate(mutate_fn);
		looser.brain = winner_brain;
		looser.score = 0;
		winner.score += 0.2 * winner.score; // increase by 20 percent
	}

	draw(i) {
		// super.draw(i) // for debugging
		switch (this.choice) {
			case "rock":
				image(rock, this.position.x, this.position.y, this.r, this.r);
				break;
			case "paper":
				image(paper, this.position.x, this.position.y, this.r, this.r);
				break;
			case "scissor":
				image(scissor, this.position.x, this.position.y, this.r, this.r);
				break;
			default:
				image(mask, this.position.x, this.position.y, this.r, this.r);
				break;
		}
	}

	update() {
		super.move();
		super.boundary();
	}

	// todo : can I use a function so that DRY ?
	checkCollisionsAndDrawLine(others) {
		let closest_rock_from_paper;
		let closest_scissor_from_paper;
		let closest_rock_from_scissor;
		let closest_paper_from_scissor;
		let closest_paper_from_rock;
		let closest_scissor_from_rock;
		let closest_rock_from_paper_dist = max(width, height);
		let closest_rock_from_scissor_dist = max(width, height);
		let closest_paper_from_scissor_dist = max(width, height);
		let closest_paper_from_rock_dist = max(width, height);
		let closest_scissor_from_rock_dist = max(width, height);
		let closest_scissor_from_paper_dist = max(width, height);

		for (let i = 0; i < others.length; i++) {
			let item = others[i].userData;
			if (this.choice_code !== item.choice_code) {
				let d = dist(
					this.position.x,
					this.position.y,
					item.position.x,
					item.position.y
				);

				if (this.choice_code === 0) {
					// rock
					// get the closest scissor
					if (item.choice_code == 2) {
						if (d < closest_scissor_from_rock_dist) {
							closest_scissor_from_rock = others[i];
							closest_scissor_from_rock_dist = d;
							if (d < this.r) {
								// intersects
								this.collisionResolution(others[i]);
							}
						}
					}
					// rock meets paper -> rock becomes paper
					if (item.choice_code == 1) {
						if (d < closest_paper_from_rock_dist) {
							closest_paper_from_rock = others[i];
							closest_paper_from_rock_dist = d;
							if (d < this.r) {
								// intersects
								this.collisionResolution(others[i]);
							}
						}
					}
				}

				if (this.choice_code === 1) {
					// paper
					// get the closest rock
					if (item.choice_code == 0) {
						if (d < closest_rock_from_paper_dist) {
							closest_rock_from_paper = others[i];
							closest_rock_from_paper_dist = d;
							if (d < this.r) {
								// intersects
								this.collisionResolution(others[i]);
							}
						}
					}
					// paper meets scissor -> paper becomes scissor
					if (item.choice_code == 2) {
						if (d < closest_scissor_from_paper_dist) {
							closest_scissor_from_paper = others[i];
							closest_scissor_from_paper_dist = d;
							if (d < this.r) {
								// intersects
								this.collisionResolution(others[i]);
							}
						}
					}
				}

				if (this.choice_code === 2) {
					// scissor
					// get the closest paper
					if (item.choice_code == 1) {
						if (d < closest_paper_from_scissor_dist) {
							closest_paper_from_scissor = others[i];
							closest_paper_from_scissor_dist = d;
							if (d < this.r) {
								// intersects
								this.collisionResolution(others[i]);
							}
						}
					}
					// scissor meets rock -> scissor becomes rock
					if (item.choice_code === 0) {
						if (d < closest_rock_from_scissor_dist) {
							closest_rock_from_scissor = others[i];
							closest_rock_from_scissor_dist = d;
							if (d < this.r) {
								// intersects
								this.collisionResolution(others[i]);
							}
						}
					}
				}
			}
		}

		let predator, prey;
		if (this.choice_code === 2) {
			// scissors
			predator = closest_rock_from_scissor;
			prey = closest_paper_from_scissor;
		} else if (this.choice_code === 1) {
			// paper
			predator = closest_scissor_from_paper;
			prey = closest_rock_from_paper;
		} else if (this.choice_code === 0) {
			// rock
			predator = closest_paper_from_rock;
			prey = closest_scissor_from_rock;
		}

		this.think(predator, prey);

		// // todo : this behaviour should evolve over time
		// this.moveTowardsTarget(closest_scissor_from_rock, "red")
		// ...
	}

	think(nearest_predatory, nearest_prey) {
		// if we are scissor; nearest predator = rock, nearest prey = paper
		// inputs can be null too
		// prepare input
		// process -> forward propage through brain
		// use output for direction of movement?
		let inputs = [0, 0, 0, 0, 0, 0]; // pos, predotor, prey
		let pos = this.position;
		inputs[0] = map(pos.x, 0, width, 0, 1); // 	todo : how does FlappyLearning does this normalization
		inputs[1] = map(pos.y, 0, height, 0, 1); // todo : please confirm what are these inputs to map()
		if (nearest_predatory) {
			let predator = nearest_predatory.userData.position;
			inputs[2] = map(predator.x, 0, width, 0, 1);
			inputs[3] = map(predator.y, 0, height, 0, 1);
		}
		if (nearest_prey) {
			let prey = nearest_prey.userData.position;
			inputs[4] = map(prey.x, 0, width, 0, 1);
			inputs[5] = map(prey.y, 0, height, 0, 1);
		}

		let output = this.brain.predict(inputs); // output is 2 numbers between o and 1 right ? --> its not negetive and that's a problem
		// todo : check ecosystem project how it use output
		// // create direction vector out of output  --> does it evolve attract/repel behaviour
		// this negetive values should be decided by the brain   --> then make it output 4 values and use them
		let direction = createVector(
			(output[0] > 0.5 ? -1 : 1) * output[1],
			(output[2] > 0.5 ? -1 : 1) * output[3]
		);
		direction.setMag(1);
		// print('direction ', direction)
		this.position.add(direction);
	}

	moveTowardsTarget(closest_dst_from_src, color) {
		if (closest_dst_from_src) {
			debug ? this.drawLineUtil(closest_dst_from_src.userData, color) : null;
			let direction = p5.Vector.sub(
				closest_dst_from_src.userData.position,
				this.position
			);
			print("the direction in move towards ", direction);
			direction.setMag(1);
			this.position.add(direction);
			// I think something should happen to the velocity here too
			// like target should inherit velocity of source ???
		}
	}

	drawLineUtil(destination, color) {
		stroke(color);
		line(
			this.position.x,
			this.position.y,
			destination.position.x,
			destination.position.y
		);
	}

	collisionResolution(other) {
		let item = other.userData;
		if (this.choice_code === item.choice_code) {
			return;
		}

		if (debug) {
			// highlights the two boxes which are meeting
			stroke("green");
			rect(this.position.x, this.position.y, this.r, this.r);
			stroke("red");
			rect(item.position.x, item.position.y, item.r, item.r);
			// noLoop()
		}

		let winner, looser;

		if (this.choice_code === 0 && item.choice_code === 1) {
			// other wins
			winner = item;
			looser = this;
		} else if (this.choice_code === 0 && item.choice_code === 2) {
			// mine wins
			winner = this;
			looser = item;
		} else if (this.choice_code === 1 && item.choice_code === 0) {
			// mine wins
			winner = this;
			looser = item;
		} else if (this.choice_code === 1 && item.choice_code === 2) {
			// other wins
			winner = item;
			looser = this;
		} else if (this.choice_code === 2 && item.choice_code === 0) {
			// other wins
			winner = item;
			looser = this;
		} else if (this.choice_code === 2 && item.choice_code === 1) {
			// mine wins
			winner = this;
			looser = item;
		}

		this.updateChoice(winner, looser);
		return;
	}
}
