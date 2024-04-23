import { createShader, createProgram } from './utils.js';
import { drawObject, drawText } from './draw.js';
import { Game } from './game.js';

const canvas = document.getElementById('gameCanvas');
const gl = canvas.getContext('webgl');
if (!gl) {
  console.error('WebGL not supported');
}

const aspectRatio = canvas.width / canvas.height;

const textCanvas = document.createElement('canvas');
const textCtx = textCanvas.getContext('2d');

// Shader and program
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

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(program);

// State keyboard
const keyStates = {};

// Penanganan input keyboard
function handleKeyDown(event) {
  const validKeys = ['ArrowRight', 'ArrowLeft', 'Space'];
  if (validKeys.includes(event.code)) {
    keyStates[event.code] = true;
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

export function isKeyPressed(key) {
  return keyStates[key] || false;
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
const game = new Game(gl, program, textCtx, textCanvas, canvas);

function gameLoop() {
  game.update();
  game.draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();