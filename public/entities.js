export class Dino {
    constructor(x, y, width, height, jumpStrength) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.velocityY = 0;
      this.isJumping = false;
      this.jumpStrength = jumpStrength;
    }
  
    draw(gl, program, colorUniformLocation, drawObject) {
      gl.uniform4f(colorUniformLocation, 151 / 255, 208 / 255, 138 / 255, 1.0);
      drawObject(gl, program, colorUniformLocation, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
  
    update(groundHeight, gravity, jumpStrength) {
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
        this.velocityY = this.jumpStrength;
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
  
  export class Obstacle {
    constructor(x, y, width, height, speed) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.speed = speed;
    }
  
    draw(gl, program, colorUniformLocation, drawObject) {
      gl.uniform4f(colorUniformLocation, 151 / 255, 208 / 255, 138 / 255, 1.0);
      drawObject(gl, program, colorUniformLocation, this.x, this.y, this.width, this.height);
    }
  
    update() {
      this.x -= this.speed;
      if (this.x + this.width < -1) {
        this.x = 1;
      }
    }
  }
  
  export class Ground {
    constructor(height) {
      this.height = height;
    }
  
    draw(gl, program, colorUniformLocation, drawObject) {
      gl.uniform4f(colorUniformLocation, 0.5, 0.5, 0.5, 1.0);
      drawObject(gl, program, colorUniformLocation, -1, -0.5, 2, this.height);
    }
  }