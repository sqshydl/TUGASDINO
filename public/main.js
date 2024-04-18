const canvas = document.getElementById('gameCanvas');
const gl = canvas.getContext('webgl');
if (!gl) {
  console.error('WebGL not supported');
}

const aspectRatio = canvas.width / canvas.height;
const dinoWidth = 0.1;
const dinoHeight = 0.1;
const groundHeight = 0.1;
const gravity = 0.01;
const jumpStrength = 0.125;
let dinoX = 0;
let dinoY = -0.5 + groundHeight + dinoHeight / 2;
let velocityY = 0;
let isJumping = false;
let isMovingLeft = false;
let isMovingRight = false;
let isGameOver = false;
const obstacleWidth = 0.05;
const obstacleHeight = 0.1;
const obstacleSpeed = 0.01;
let obstacleX = 1;
const flyingObstacleWidth = 0.1;
const flyingObstacleHeight = 0.05;
const flyingObstacleSpeed = 0.02;
let flyingObstacleX = 1;

function updateFlyingObstacle() {
  flyingObstacleX -= flyingObstacleSpeed;

  if (flyingObstacleX + flyingObstacleWidth < -1) {
    flyingObstacleX = 1;
  }
}

function drawFlyingObstacle() {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [
    flyingObstacleX,
    0.3,
    flyingObstacleX,
    0.3 + flyingObstacleHeight,
    flyingObstacleX + flyingObstacleWidth,
    0.3,
    flyingObstacleX,
    0.3 + flyingObstacleHeight,
    flyingObstacleX + flyingObstacleWidth,
    0.3 + flyingObstacleHeight,
    flyingObstacleX + flyingObstacleWidth,
    0.3,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}


function jump() {
  if (!isJumping) {
    velocityY = jumpStrength;
    isJumping = true;
  }
}

function moveDino(direction) {
  const stepSize = 0.03;
  if (direction === 'right') {
    dinoX += stepSize;
  } else if (direction === 'left') {
    dinoX -= stepSize;
  }

  const maxDinoX = 1 - dinoWidth / 2;
  const minDinoX = -1 + dinoWidth / 2;
  if (dinoX > maxDinoX) {
    dinoX = maxDinoX;
  } else if (dinoX < minDinoX) {
    dinoX = minDinoX;
  }
}

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    jump();
  } else if (event.code === 'ArrowRight') {
    isMovingRight = true;
  } else if (event.code === 'ArrowLeft') {
    isMovingLeft = true;
  }
});

document.addEventListener('keyup', (event) => {
  if (event.code === 'ArrowRight') {
    isMovingRight = false;
  } else if (event.code === 'ArrowLeft') {
    isMovingLeft = false;
  }
});

function update() {
  if (isMovingRight) {
    moveDino('right');
  }
  if (isMovingLeft) {
    moveDino('left');
  }

  if (isJumping) {
    dinoY += velocityY;
    velocityY -= gravity;
    if (dinoY <= -0.5 + groundHeight + dinoHeight / 2) {
      dinoY = -0.5 + groundHeight + dinoHeight / 2;
      isJumping = false;
    }
  }
}

function draw() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  if (!isGameOver) {
    update();
    drawDino();
    drawGround();
    updateObstacle();
    drawObstacle();
    updateFlyingObstacle();
    drawFlyingObstacle();
    checkCollisions();
  } else {
    displayGameOver();
  }

  requestAnimationFrame(draw);
}

function drawDino() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [
    dinoX - dinoWidth / 2,
    dinoY - dinoHeight / 2,
    dinoX - dinoWidth / 2,
    dinoY + dinoHeight / 2,
    dinoX + dinoWidth / 2,
    dinoY - dinoHeight / 2,
    dinoX - dinoWidth / 2,
    dinoY + dinoHeight / 2,
    dinoX + dinoWidth / 2,
    dinoY + dinoHeight / 2,
    dinoX + dinoWidth / 2,
    dinoY - dinoHeight / 2,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function drawGround() {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [
    -1,
    -0.5,
    -1,
    -0.5 + groundHeight,
    1,
    -0.5,
    -1,
    -0.5 + groundHeight,
    1,
    -0.5 + groundHeight,
    1,
    -0.5,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function updateObstacle() {
  obstacleX -= obstacleSpeed;

  if (
    obstacleX < dinoX + dinoWidth / 2 &&
    obstacleX + obstacleWidth > dinoX - dinoWidth / 2 &&
    dinoY + dinoHeight / 2 > -0.5 + groundHeight &&
    dinoY - dinoHeight / 2 < -0.5 + groundHeight + obstacleHeight
  ) {
    console.log('Collision occurred!');
    isGameOver = true;
  }

  if (obstacleX + obstacleWidth < -1) {
    obstacleX = 1;
  }
}

function checkCollisions() {
  if (
    (obstacleX < dinoX + dinoWidth / 2 &&
      obstacleX + obstacleWidth > dinoX - dinoWidth / 2 &&
      dinoY + dinoHeight / 2 > -0.5 + groundHeight &&
      dinoY - dinoHeight / 2 < -0.5 + groundHeight + obstacleHeight) ||
    (flyingObstacleX < dinoX + dinoWidth / 2 &&
      flyingObstacleX + flyingObstacleWidth > dinoX - dinoWidth / 2 &&
      dinoY + dinoHeight / 2 > 0.3 &&
      dinoY - dinoHeight / 2 < 0.3 + flyingObstacleHeight)
  ) {
    console.log('Collision occurred!');
    isGameOver = true;
  }
}

function displayGameOver() {
  gl.clearColor(0.8, 0, 0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  console.log('Game Over!');
}

function resetGame() {
  dinoX = 0;
  dinoY = -0.5 + groundHeight + dinoHeight / 2;
  velocityY = 0;
  isJumping = false;
  isGameOver = false;

  obstacleX = 1;
}

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && isGameOver) {
    resetGame();
  }
});

function drawObstacle() {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [
    obstacleX,
    -0.5 + groundHeight,
    obstacleX,
    -0.5 + groundHeight + obstacleHeight,
    obstacleX + obstacleWidth,
    -0.5 + groundHeight,
    obstacleX,
    -0.5 + groundHeight + obstacleHeight,
    obstacleX + obstacleWidth,
    -0.5 + groundHeight + obstacleHeight,
    obstacleX + obstacleWidth,
    -0.5 + groundHeight,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
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
    console.error('Program linking error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;
const fragmentShaderSource = `
    void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
`;

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(program);

draw();
