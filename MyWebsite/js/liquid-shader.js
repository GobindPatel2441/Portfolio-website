/**
 * LIQUID SHADER BACKGROUND
 * Inspired by ShaderGradient & Liquid-Logo
 * Real-time WebGL fluid mesh with mouse reactivity and graceful Canvas 2D fallback.
 */

(function () {
  const canvas = document.getElementById('liquid-bg-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  // Mouse coordinates with lerp
  let mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', onResize);
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX / window.innerWidth;
    mouse.targetY = 1.0 - e.clientY / window.innerHeight;
  });

  function onResize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    if (gl) gl.viewport(0, 0, width, height);
  }

  if (!gl) {
    // Canvas 2D Fallback
    const ctx = canvas.getContext('2d');
    let t = 0;
    function render2D() {
      t += 0.005;
      ctx.clearRect(0, 0, width, height);
      const grad = ctx.createRadialGradient(
        width * (0.3 + 0.2 * Math.sin(t)),
        height * (0.3 + 0.2 * Math.cos(t)),
        50,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.8
      );
      grad.addColorStop(0, 'rgba(0, 242, 254, 0.08)');
      grad.addColorStop(0.5, 'rgba(138, 43, 226, 0.06)');
      grad.addColorStop(1, '#07090e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      requestAnimationFrame(render2D);
    }
    render2D();
    return;
  }

  // WebGL Implementation
  const vertexShaderSrc = `
    attribute vec2 position;
    varying vec2 vUv;
    void main() {
      vUv = position * 0.5 + 0.5;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSrc = `
    precision mediump float;
    varying vec2 vUv;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    // Simplex-inspired noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                         -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
            + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
      vec2 p = (uv - 0.5) * aspect;
      vec2 m = (u_mouse - 0.5) * aspect;

      // Mouse influence wave
      float mouseDist = length(p - m);
      float mouseWave = sin(mouseDist * 12.0 - u_time * 2.0) * exp(-mouseDist * 3.5) * 0.15;

      // Dynamic fluid layering
      float n1 = snoise(p * 1.4 + vec2(u_time * 0.08, u_time * 0.06) + mouseWave);
      float n2 = snoise(p * 2.2 - vec2(u_time * 0.05, -u_time * 0.07) + n1 * 0.5);
      float fluid = n1 * 0.6 + n2 * 0.4;

      // Color Palette: Deep Obsidian, Electric Cyan, Neon Violet, Royal Deep Blue
      vec3 colDeep    = vec3(0.027, 0.035, 0.055);
      vec3 colCyan    = vec3(0.0, 0.949, 0.996);
      vec3 colViolet  = vec3(0.541, 0.168, 0.886);
      vec3 colMidBlue = vec3(0.055, 0.12, 0.28);

      vec3 color = colDeep;
      color = mix(color, colMidBlue, smoothstep(-0.6, 0.4, fluid));
      color = mix(color, colViolet, smoothstep(0.1, 0.8, fluid) * 0.35);
      color = mix(color, colCyan, smoothstep(0.5, 1.0, fluid) * 0.22);

      // Mouse glow accent
      color += colCyan * (exp(-mouseDist * 4.0) * 0.08);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('Shader error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
  const fShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
  if (!vShader || !fShader) return;

  const program = gl.createProgram();
  gl.attachShader(program, vShader);
  gl.attachShader(program, fShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  const posAttr = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(posAttr);
  gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(program, 'u_time');
  const uRes = gl.getUniformLocation(program, 'u_resolution');
  const uMouse = gl.getUniformLocation(program, 'u_mouse');

  let startTime = performance.now();

  function render() {
    // Lerp mouse
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    const elapsed = (performance.now() - startTime) * 0.001;
    gl.viewport(0, 0, width, height);
    gl.uniform1f(uTime, elapsed);
    gl.uniform2f(uRes, width, height);
    gl.uniform2f(uMouse, mouse.x, mouse.y);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
