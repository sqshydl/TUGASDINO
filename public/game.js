import { Dino, Obstacle, Ground } from './entities.js';
import { drawObject, drawText } from './draw.js';
import { isKeyPressed } from './main.js';

const dinoWidth = 0.11;
const dinoHeight = 0.11;
const groundHeight = 0.1;
const gravity = 0.01;
const jumpStrength = 0.125;
const obstacleWidth = 0.05;
const obstacleHeight = 0.3;
const obstacleSpeed = 0.01;
const flyingObstacleWidth = 0.1;
const flyingObstacleHeight = 0.09;
const flyingObstacleSpeed = 0.02;

export class Game {
  constructor(gl, program, textCtx, textCanvas, canvas) {
    this.gl = gl;
    this.program = program;
    this.textCtx = textCtx;
    this.textCanvas = textCanvas;
    this.canvas = canvas;
    this.dino = new Dino(-0.5, -0.5 + groundHeight + dinoHeight / 2, dinoWidth, dinoHeight, jumpStrength);
    this.ground = new Ground(groundHeight);
    this.obstacles = [
      new Obstacle(1, -0.5 + groundHeight, obstacleWidth, obstacleHeight, obstacleSpeed),
      new Obstacle(1, 0.3, flyingObstacleWidth, flyingObstacleHeight, flyingObstacleSpeed)
    ];
    this.score = 0;
    this.isGameOver = false;
    this.colorUniformLocation = gl.getUniformLocation(program, "u_color");
  }

  resetGame() {
    this.dino.x = -0.5;
    this.dino.y = -0.5 + groundHeight + dinoHeight / 2;
    this.dino.velocityY = 0;
    this.dino.isJumping = false;
    this.isGameOver = false;
    this.score = 0;
    this.obstacles = [
      new Obstacle(1, -0.5 + groundHeight, obstacleWidth, obstacleHeight, obstacleSpeed),
      new Obstacle(1, 0.3, flyingObstacleWidth, flyingObstacleHeight, flyingObstacleSpeed)
    ];
  }

  displayGameOver() {
    this.gl.clearColor(0.0, 0, 0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    drawText(this.gl, this.program, this.textCtx, this.textCanvas, this.canvas, "Game Over!", 0.0, 0.2, 0.2);
    drawText(this.gl, this.program, this.textCtx, this.textCanvas, this.canvas, "Final Score: " + this.score, 0.0, 0, 0.1);

    drawObject(this.gl, this.program, this.colorUniformLocation, -0.1, -0.2, 0.2, 0.1);
    drawText(this.gl, this.program, this.textCtx, this.textCanvas, this.canvas, "Play Again", -0.08, -0.18, 0.08);
  }

  handleInput() {
    if (isKeyPressed('ArrowRight')) {
      this.dino.moveRight();
    }
    if (isKeyPressed('ArrowLeft')) {
      this.dino.moveLeft();
    }
    if (isKeyPressed('Space')) {
      if (this.isGameOver) {
        this.resetGame();
      } else {
        this.dino.jump();
      }
    }
  }

  updateScoreDisplay() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    scoreDisplay.textContent = 'Score: ' + this.score;
  }

  checkCollisions() {
    const dinoTop = this.dino.y + this.dino.height / 2;
    const dinoBottom = this.dino.y - this.dino.height / 2;
    for (const obstacle of this.obstacles) {
      const obstacleLeft = obstacle.x;
      const obstacleRight = obstacle.x + obstacle.width;
      const obstacleTop = obstacle.y + obstacle.height;
      const obstacleBottom = obstacle.y;

      if (
        obstacleRight > this.dino.x - this.dino.width / 2 &&
        obstacleLeft < this.dino.x + this.dino.width / 2 &&
        dinoTop > obstacleBottom &&
        dinoBottom < obstacleTop
      ) {
        console.log('Collision occurred!');
        this.isGameOver = true;
        break;
      }
    }
  }

  update() {
    if (!this.isGameOver) {
      this.handleInput();
      this.dino.update(groundHeight, gravity);
      this.score += 1;
      this.updateScoreDisplay();

      for (const obstacle of this.obstacles) {
        obstacle.update();
      }

      this.checkCollisions();
    } else {
      this.displayGameOver();
    }
  }

  draw() {
    this.gl.clearColor(74 / 255, 26 / 255, 185 / 255, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    if (!this.isGameOver) {
      this.dino.draw(this.gl, this.program, this.colorUniformLocation, drawObject);
      this.ground.draw(this.gl, this.program, this.colorUniformLocation, drawObject);
      for (const obstacle of this.obstacles) {
        obstacle.draw(this.gl, this.program, this.colorUniformLocation, drawObject);
      }
    }
  }
}