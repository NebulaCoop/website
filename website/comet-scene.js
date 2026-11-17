// The home page's scene: a small planet of our own with every player's comet in orbit around it. Clicking the sky
// launches another player, up to the 16 a room can hold. Everything here is drawn in code; there are no models
// or textures from the game.
import * as THREE from 'three';
import { pageMessage } from './page-copy.js';

const MAX_PLAYERS = 16;
const START_PLAYERS = 2;
// Player colours, in the order players join.
const COLORS = [
  '#ff79c6',
  '#5fe1ff',
  '#7ef0c0',
  '#ffd15c',
  '#b79bff',
  '#ff9f5a',
  '#8fb8ff',
  '#ff6f7d',
  '#c6f36b',
  '#f7a8ff',
  '#63f2e0',
  '#ffc28a',
  '#9fa8ff',
  '#ff8fb1',
  '#a6ffcb',
  '#ffe680',
];
const TRAIL = 56;

const host = document.querySelector('#space');
const status = document.querySelector('#orbit-status');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: 'low-power',
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
host.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
camera.position.set(0, 0.9, 10);
const world = new THREE.Group();
scene.add(world);

// A seeded random, so the planet looks the same on every visit.
let seed = 7;
const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

/* Stars that twinkle. */
{
  const count = 1400;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const tints = new Float32Array(count * 3);
  const palette = [
    new THREE.Color('#ffffff'),
    new THREE.Color('#ffe9a8'),
    new THREE.Color('#c9b8ff'),
    new THREE.Color('#a8eaff'),
  ];
  for (let i = 0; i < count; i++) {
    const direction = new THREE.Vector3(
      random() * 2 - 1,
      random() * 2 - 1,
      random() * 2 - 1,
    ).normalize();
    direction.multiplyScalar(40 + random() * 60);
    positions.set([direction.x, direction.y, direction.z - 30], i * 3);
    sizes[i] = 0.6 + random() ** 3 * 3.2;
    phases[i] = random() * Math.PI * 2;
    const tint = palette[Math.floor(random() * palette.length)];
    tints.set([tint.r, tint.g, tint.b], i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('tint', new THREE.BufferAttribute(tints, 3));
  const material = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, scale: { value: renderer.getPixelRatio() } },
    vertexShader: `
      attribute float size; attribute float phase; attribute vec3 tint;
      uniform float time; uniform float scale;
      varying float vLight; varying vec3 vTint;
      void main() {
        vLight = 0.55 + 0.45 * sin(time * 1.3 + phase);
        vTint = tint;
        gl_PointSize = size * scale;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      varying float vLight; varying vec3 vTint;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float glow = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vTint, glow * vLight);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const stars = new THREE.Points(geometry, material);
  stars.name = 'stars';
  scene.add(stars);
}
const starMaterial = scene.getObjectByName('stars').material;

/* The planet: a lumpy little world with toon shading. */
const PLANET_RADIUS = 1.25;
let halo;
const planet = new THREE.Group();
world.add(planet);
{
  const geometry = new THREE.IcosahedronGeometry(PLANET_RADIUS, 24);
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);
  // A handful of soft bumps make hills and hollows.
  const bumps = Array.from({ length: 46 }, () => ({
    at: new THREE.Vector3(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1).normalize(),
    height: (random() - 0.45) * 0.04,
    width: 0.16 + random() * 0.24,
  }));
  const deep = new THREE.Color('#2a7f9a');
  const shore = new THREE.Color('#7fe3b0');
  const meadow = new THREE.Color('#9be86f');
  const peak = new THREE.Color('#fff1c8');
  const v = new THREE.Vector3();
  const color = new THREE.Color();
  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i).normalize();
    let lift = 0;
    for (const bump of bumps)
      lift += bump.height * Math.exp(-(v.distanceToSquared(bump.at) / bump.width ** 2));
    v.multiplyScalar(PLANET_RADIUS * (1 + lift));
    position.setXYZ(i, v.x, v.y, v.z);
    if (lift < -0.008) color.copy(deep);
    else if (lift < 0.008) color.copy(shore).lerp(meadow, (lift + 0.008) / 0.016);
    else color.copy(meadow).lerp(peak, Math.min(1, (lift - 0.008) / 0.03));
    colors.set([color.r, color.g, color.b], i * 3);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const tones = new THREE.DataTexture(new Uint8Array([90, 160, 220, 255]), 4, 1, THREE.RedFormat);
  tones.minFilter = tones.magFilter = THREE.NearestFilter;
  tones.needsUpdate = true;
  planet.add(
    new THREE.Mesh(
      geometry,
      new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: tones }),
    ),
  );

  // A glow around the planet, brightest at its edge.
  halo = new THREE.Mesh(
    new THREE.SphereGeometry(PLANET_RADIUS * 1.38, 48, 32),
    new THREE.ShaderMaterial({
      uniforms: { glow: { value: new THREE.Color('#8f7bff') } },
      // Drawn from the inside: brightest just outside the planet's edge, fading to nothing at the halo's own.
      vertexShader: `
        varying float vInner;
        void main() {
          vec3 n = normalize(normalMatrix * normal);
          vec3 view = normalize(-(modelViewMatrix * vec4(position, 1.0)).xyz);
          vInner = clamp(-dot(n, view), 0.0, 1.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 glow; varying float vInner;
        void main() { gl_FragColor = vec4(glow, pow(vInner, 2.2) * 0.85); }`,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  world.add(halo);

  // The observatory on top: a dome with a lit window and a telescope pointing at the sky.
  const observatory = new THREE.Group();
  const stone = new THREE.MeshToonMaterial({ color: '#efe6ff', gradientMap: tones });
  const roof = new THREE.MeshToonMaterial({ color: '#7d63e8', gradientMap: tones });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.2, 24), stone);
  base.position.y = 0.08;
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    roof,
  );
  dome.position.y = 0.18;
  const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.32, 12), stone);
  scope.position.set(0.08, 0.36, 0);
  scope.rotation.z = -0.7;
  const window_ = new THREE.Mesh(
    new THREE.CircleGeometry(0.06, 16),
    new THREE.MeshBasicMaterial({ color: '#ffd15c' }),
  );
  window_.position.set(0, 0.1, 0.261);
  observatory.add(base, dome, scope, window_);
  const up = new THREE.Vector3(0.18, 1, 0.42).normalize();
  observatory.position.copy(up).multiplyScalar(PLANET_RADIUS * 1.02);
  observatory.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
  planet.add(observatory);

  planet.rotation.set(0.28, 0, -0.12);
}

const sun = new THREE.DirectionalLight('#fff4dc', 2.6);
sun.position.set(-4, 5, 6);
scene.add(sun, new THREE.AmbientLight('#7a6cff', 0.9));

/* Comets: a glowing head and a fading tail on a tilted circular orbit. */
function glowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.18, 'rgba(255,255,255,0.85)');
  gradient.addColorStop(0.45, 'rgba(255,255,255,0.22)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
const glow = glowTexture();
// The tail: a run of soft dots that shrink and fade behind the head.
const trailMaterial = new THREE.ShaderMaterial({
  uniforms: { scale: { value: 1 } },
  vertexShader: `
    attribute float fade; attribute vec3 color;
    uniform float scale;
    varying float vFade; varying vec3 vColor;
    void main() {
      vFade = fade; vColor = color;
      vec4 view = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = (2.0 + 16.0 * fade) * scale * (10.0 / -view.z);
      gl_Position = projectionMatrix * view;
    }`,
  fragmentShader: `
    varying float vFade; varying vec3 vColor;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      gl_FragColor = vec4(mix(vColor, vec3(1.0), vFade * 0.35), smoothstep(0.5, 0.1, d) * vFade * 0.55);
    }`,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

const comets = [];
function addComet(index, launch) {
  const color = new THREE.Color(COLORS[index % COLORS.length]);
  const radius = 1.95 + (index % 6) * 0.22 + random() * 0.12;
  const tilt = new THREE.Quaternion().setFromEuler(
    new THREE.Euler((random() - 0.5) * 1.2, random() * Math.PI * 2, (random() - 0.5) * 0.9),
  );
  const head = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glow,
      color,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  head.scale.setScalar(0.8);
  const core = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glow,
      color: '#ffffff',
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  core.scale.setScalar(0.3);
  head.add(core);
  const trailGeometry = new THREE.BufferGeometry();
  const trailPositions = new Float32Array(TRAIL * 3);
  const fades = new Float32Array(TRAIL);
  const trailColors = new Float32Array(TRAIL * 3);
  for (let i = 0; i < TRAIL; i++) {
    fades[i] = 1 - i / (TRAIL - 1);
    trailColors.set([color.r, color.g, color.b], i * 3);
  }
  trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
  trailGeometry.setAttribute('fade', new THREE.BufferAttribute(fades, 1));
  trailGeometry.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));
  const trail = new THREE.Points(trailGeometry, trailMaterial);
  trail.frustumCulled = false;
  world.add(head, trail);
  const comet = {
    head,
    trail,
    radius,
    tilt,
    speed: 0.9 / radius ** 1.5,
    angle: random() * Math.PI * 2,
    born: launch ? clock : -10,
  };
  comets.push(comet);
  place(comet, clock);
  return comet;
}
function removeComets() {
  for (const comet of comets.splice(0)) {
    world.remove(comet.head, comet.trail);
    comet.head.material.dispose();
    comet.head.children[0].material.dispose();
    comet.trail.geometry.dispose();
  }
}

const point = new THREE.Vector3();
function orbitPoint(comet, angle, age, target) {
  // A launched comet spirals out from the planet's surface over its first 1.4 seconds.
  const grow = Math.min(1, Math.max(0, age / 1.4));
  const eased = 1 - (1 - grow) ** 3;
  const radius = PLANET_RADIUS + (comet.radius - PLANET_RADIUS) * eased;
  target.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius).applyQuaternion(comet.tilt);
  return target;
}
// The tail is where the comet was over the last TRAIL_SECONDS, so it looks the same at any frame rate.
const TRAIL_SECONDS = 1.6;
function place(comet, time) {
  const array = comet.trail.geometry.attributes.position.array;
  for (let i = 0; i < TRAIL; i++) {
    const then = time - (i / (TRAIL - 1)) * TRAIL_SECONDS;
    orbitPoint(comet, comet.angle + then * comet.speed * 2, then - comet.born, point);
    array.set([point.x, point.y, point.z], i * 3);
    if (i === 0) comet.head.position.copy(point);
  }
  comet.trail.geometry.attributes.position.needsUpdate = true;
}

/* Layout: the planet sits right of the copy on wide screens and above it on narrow ones. */
let wide = true;
function resize() {
  const width = host.clientWidth;
  const height = host.clientHeight;
  if (!width || !height) return;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  wide = width > 700;
  const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.length();
  const halfWidth = halfHeight * camera.aspect;
  if (wide) {
    world.position.set(Math.min(halfWidth * 0.48, halfWidth - 3.4), 0.1, 0);
    world.scale.setScalar(Math.min(1.15, Math.max(0.75, halfWidth / 7)));
  } else {
    world.position.set(0, 0.15, 0);
    world.scale.setScalar(0.92);
  }
  camera.updateProjectionMatrix();
  starMaterial.uniforms.scale.value = renderer.getPixelRatio();
  trailMaterial.uniforms.scale.value = renderer.getPixelRatio() * world.scale.x;
  if (!running) render();
}
new ResizeObserver(resize).observe(host);

/* Gentle parallax from the pointer. */
const look = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener(
  'pointermove',
  (event) => {
    look.tx = (event.clientX / innerWidth - 0.5) * 2;
    look.ty = (event.clientY / innerHeight - 0.5) * 2;
  },
  { passive: true },
);

/* Click or tap the sky: another player joins, until the room is full. */
function announce() {
  status.textContent =
    comets.length >= MAX_PLAYERS
      ? pageMessage('full', { max: MAX_PLAYERS })
      : pageMessage('launched', { count: comets.length, max: MAX_PLAYERS });
}
let fullAt = -1;
const haloColor = new THREE.Color('#8f7bff');
const fullColor = new THREE.Color('#ffd15c');
host.addEventListener('click', () => {
  if (comets.length >= MAX_PLAYERS) {
    removeComets();
    for (let i = 0; i < START_PLAYERS; i++) addComet(i, true);
  } else {
    addComet(comets.length, true);
    if (comets.length === MAX_PLAYERS) fullAt = clock;
  }
  announce();
  if (!running) {
    // Without motion, show the new player in place at once.
    for (const comet of comets) comet.born = -10;
    for (const comet of comets) place(comet, clock);
    render();
  }
});

let clock = 0;
for (let i = 0; i < START_PLAYERS; i++) addComet(i, false);

function render() {
  renderer.render(scene, camera);
}
let running = false;
let last = performance.now();
let visible = true;
function frame(now) {
  if (!running) return;
  const delta = Math.min(0.05, (now - last) / 1000);
  last = now;
  clock += delta;
  starMaterial.uniforms.time.value = clock;
  planet.rotation.y += delta * 0.12;
  look.x += (look.tx - look.x) * 0.04;
  look.y += (look.ty - look.y) * 0.04;
  camera.position.x = look.x * 0.6;
  camera.position.y = 0.9 - look.y * 0.4;
  camera.lookAt(0, 0, 0);
  for (const comet of comets) place(comet, clock);
  // A full room flashes the halo gold once.
  const flash = fullAt >= 0 ? Math.max(0, 1 - (clock - fullAt) / 1.2) : 0;
  halo.material.uniforms.glow.value.copy(haloColor).lerp(fullColor, flash);
  render();
  requestAnimationFrame(frame);
}
function setRunning() {
  const should = visible && !document.hidden && !reduced.matches;
  if (should === running) return;
  running = should;
  if (running) {
    last = performance.now();
    requestAnimationFrame(frame);
  }
}
new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  setRunning();
}).observe(host);
document.addEventListener('visibilitychange', setRunning);
reduced.addEventListener('change', setRunning);

camera.lookAt(0, 0, 0);
resize();
render();
setRunning();
host.classList.add('is-ready');
