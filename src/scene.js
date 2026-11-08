// Animated interpretation of the flat sun-and-hills artwork in token-design.jpeg.
// One draw call, no lights, textures, models, glass or full-page effects.
import { WebGLRenderer, Scene, OrthographicCamera, PlaneGeometry, ShaderMaterial, Mesh, Vector2, Vector3, SRGBColorSpace, Clock } from 'three';

export function createScene(canvas, { reducedMotion = false } = {}) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;
  const uniforms = {
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uScroll: { value: 0 },
    uPointer: { value: new Vector2() },
    // Raw display-space values: the shader outputs the reference's flat palette.
    uSand: { value: new Vector3(237 / 255, 227 / 255, 214 / 255) },
    uGold: { value: new Vector3(188 / 255, 155 / 255, 116 / 255) },
    uTaupe: { value: new Vector3(208 / 255, 194 / 255, 174 / 255) },
    uInk: { value: new Vector3(43 / 255, 38 / 255, 33 / 255) },
  };
  const material = new ShaderMaterial({
    uniforms,
    depthTest: false,
    depthWrite: false,
    vertexShader: `varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime, uAspect, uScroll;
      uniform vec2 uPointer;
      uniform vec3 uSand, uGold, uTaupe, uInk;
      void main() {
        vec2 uv = vUv;
        float t = uTime * 0.16;
        vec2 sun = vec2(0.58, 0.66 + sin(t) * 0.012);
        sun += uPointer * vec2(0.018, 0.012);
        sun.y += uScroll * 0.015;
        float d = length((uv - sun) * vec2(uAspect, 1.0));
        float disc = 1.0 - smoothstep(0.145, 0.151, d);
        vec3 color = mix(uSand, uGold, disc);
        float back = 0.24 + 0.065 * cos(uv.x * 7.6 + 0.4 + sin(t) * 0.12);
        back += 0.018 * sin(uv.x * 15.0 + 0.5);
        back += uPointer.x * 0.01;
        color = mix(color, uTaupe, 1.0 - smoothstep(back - 0.002, back + 0.002, uv.y));
        float front = 0.12 + 0.055 * sin(uv.x * 7.0 + 1.1 - sin(t) * 0.1);
        front += uPointer.x * 0.018;
        color = mix(color, uInk, 1.0 - smoothstep(front - 0.002, front + 0.002, uv.y));
        gl_FragColor = vec4(color, 1.0);
      }`,
  });
  const geometry = new PlaneGeometry(2, 2);
  scene.add(new Mesh(geometry, material));
  const clock = new Clock();
  const target = new Vector2();
  let running = true;

  function frame() {
    if (!running) return;
    clock.getDelta();
    uniforms.uTime.value = reducedMotion ? 0 : clock.elapsedTime;
    uniforms.uPointer.value.lerp(target, 0.04);
    renderer.render(scene, camera);
  }

  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    uniforms.uAspect.value = width / height;
    frame();
  }

  const host = canvas.parentElement;
  host.addEventListener('pointermove', (event) => {
    if (reducedMotion || event.pointerType === 'touch') return;
    const bounds = host.getBoundingClientRect();
    target.set((event.clientX - bounds.left) / bounds.width - 0.5, 0.5 - (event.clientY - bounds.top) / bounds.height);
  });
  host.addEventListener('pointerleave', () => target.set(0, 0));
  const observer = new ResizeObserver(resize);
  observer.observe(host);

  function setRunning(next) {
    if (running === next) return;
    running = next;
    renderer.setAnimationLoop(next && !reducedMotion ? frame : null);
    if (next) frame();
  }
  function setScroll(progress) {
    if (!reducedMotion) uniforms.uScroll.value = progress;
  }

  resize();
  if (!reducedMotion) renderer.setAnimationLoop(frame);
  return { setScroll, setRunning, resize };
}
