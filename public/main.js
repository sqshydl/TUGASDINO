const canvas = document.getElementById('gameCanvas');
const gl = canvas.getContext('webgl');
if (!gl) {
  console.error('WebGL not supported');
}

const aspectRatio = canvas.width / canvas.height;

const textCanvas = document.createElement('canvas');
const textCtx = textCanvas.getContext('2d');

// Dimensi dino, ground, dan rintangan
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

// Shader dan program
const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform vec4 u_color;
  void main() {
    gl_FragColor = u_color;
  }
`;

// Fungsi utilitas untuk membuat shader dan program
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(`Shader compilation error: ${gl.getShaderInfoLog(shader)}`);
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(`Program linking error: ${gl.getProgramInfoLog(program)}`);
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(program);

const colorUniformLocation = gl.getUniformLocation(program, "u_color");

// State keyboard
const keyStates = {};

// Penanganan input keyboard
function handleKeyDown(event) {
  const validKeys = ['ArrowRight', 'ArrowLeft', 'Space'];
  if (validKeys.includes(event.code)) {
    keyStates[event.code] = true;
  }  if (event.code === 'Space') {
    if (game.isGameOver) {
      game.resetGame();
    } else {
      game.dino.jump();
    }
  }
}

function handleKeyUp(event) {
  const validKeys = ['ArrowRight', 'ArrowLeft', 'Space'];
  if (validKeys.includes(event.code)) {
    keyStates[event.code] = false;
  }
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

function isKeyPressed(key) {
  return keyStates[key] || false;
}

// Fungsi menggambar objek
function drawObject(x, y, width, height) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [
    x, y,
    x, y + height,
    x + width, y,
    x, y + height,
    x + width, y + height,
    x + width, y
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
function drawText(text, x, y, scale) {
  textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
  textCtx.font = (scale * canvas.height) + "px Arial";
  textCtx.textAlign = "center";
  textCtx.fillStyle = 'white';
  textCtx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x - scale, y - scale,
    x + scale, y - scale,
    x - scale, y + scale,
    x - scale, y + scale,
    x + scale, y - scale,
    x + scale, y + scale
  ]), gl.STATIC_DRAW);

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

// Game entities
class Dino {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocityY = 0;
    this.isJumping = false;
  }

  draw() {
    gl.uniform4f(colorUniformLocation, 151 / 255, 208 / 255, 138 / 255, 1.0);
    drawObject(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }

  update() {
    if (this.isJumping) {
      this.y += this.velocityY;
      this.velocityY -= gravity;
      if (this.y <= -0.5 + groundHeight + this.height / 2) {
        this.y = -0.5 + groundHeight + this.height / 2;
        this.isJumping = false;
      }
    }
  }

  jump() {
    if (!this.isJumping) {
      this.velocityY = jumpStrength;
      this.isJumping = true;
    }
  }

  moveLeft() {
    const stepSize = 0.03;
    this.x -= stepSize;
    this.x = Math.max(this.x, -1 + this.width / 2);
  }

  moveRight() {
    const stepSize = 0.03;
    this.x += stepSize;
    this.x = Math.min(this.x, 1 - this.width / 2);
  }
}

class Obstacle {
  constructor(x, y, width, height, speed) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
  }

  draw() {
    gl.uniform4f(colorUniformLocation, 151 / 255, 208 / 255, 138 / 255, 1.0);
    drawObject(this.x, this.y, this.width, this.height);
  }

  update() {
    this.x -= this.speed;
    if (this.x + this.width < -1) {
      this.x = 1;
    }
  }
}

class Ground {
  constructor(height) {
    this.height = height;
  }

  draw() {
    gl.uniform4f(colorUniformLocation, 0.5, 0.5, 0.5, 1.0);
    drawObject(-1, -0.5, 2, this.height);
  }
}

// ... (previous code)

class Game {
  constructor() {
    this.dino = new Dino(-0.5, -0.5 + groundHeight + dinoHeight / 2, dinoWidth, dinoHeight);
    this.ground = new Ground(groundHeight);
    this.obstacles = [
      new Obstacle(1, -0.5 + groundHeight, obstacleWidth, obstacleHeight, obstacleSpeed),
      new Obstacle(1, 0.3, flyingObstacleWidth, flyingObstacleHeight, flyingObstacleSpeed)
    ];
    this.score = 0;
    this.isGameOver = false;
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
    gl.clearColor(0.0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    drawText("Game Over!", 0.0, 0.2, 0.2);
    drawText("Final Score: " + this.score, 0.0, 0, 0.1);

    drawObject(-0.1, -0.2, 0.2, 0.1);
    drawText("Play Again", -0.08, -0.18, 0.08);
  }

  handleInput() {
    if (isKeyPressed('ArrowRight')) {
      this.dino.moveRight();
    }
    if (isKeyPressed('ArrowLeft')) {
      this.dino.moveLeft();
    }
    if (isKeyPressed('Space')) {
      this.dino.jump();
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

  displayGameOver() {
    gl.clearColor(0.0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    drawText("Game Over!", 0.0, 0.2, 0.2);
    drawText("Final Score: " + this.score, 0.0, 0, 0.1);

    drawObject(-0.1, -0.2, 0.2, 0.1);
    drawText("Play Again", -0.08, -0.18, 0.08);
  }

  update() {
    if (!this.isGameOver) {
      this.handleInput();
      this.dino.update();
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
    gl.clearColor(74 / 255, 26 / 255, 185 / 255, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (!this.isGameOver) {
      this.dino.draw();
      this.ground.draw();
      for (const obstacle of this.obstacles) {
        obstacle.draw();
      }
    }
  }
}
canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const normalizedX = (x / rect.width) * 2 - 1;
  const normalizedY = (y / rect.height) * 2 - 1;

  if (
    normalizedX >= -0.1 - 0.2 && normalizedX <= -0.1 + 0.2 &&
    normalizedY >= -0.2 - 0.1 && normalizedY <= -0.2 + 0.1 &&
    game.isGameOver
  ) {
    game.resetGame();
  }
});

// Game instance and game loop
const game = new Game();

function gameLoop() {
  game.update();
  game.draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();