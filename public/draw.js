export function drawObject(gl, program, colorUniformLocation, x, y, width, height) {
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
  
  export function drawText(gl, program, textCtx, textCanvas, canvas, text, x, y, scale) {
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