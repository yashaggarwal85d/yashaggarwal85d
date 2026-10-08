import { useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import type { KbDriver } from '../reel/kbDriver';

/**
 * Mechanical-keyboard backdrop.
 *
 * A 12 × 20 grid of keycaps seen through an orthographic camera. The pointer is
 * raycast onto an invisible ground plane and every key lifts by its distance to
 * the hit point, with an asymmetric spring (snappy press, softer release). Keys
 * draw in as corner brackets, complete their outline, then fill as they rise;
 * keys held up heat towards foam.
 *
 * The showreel steers it through a shared `KbDriver`: beat pumps, shock-waves,
 * a focused key, launching every key, and a crossfade between the espresso and
 * oat palettes. Technique inspired by the hero of yashahire.info.
 */

const ROWS = 12;
const COLS = 20;
const SPACING = 2;
const X0 = -((COLS - 1) * SPACING) / 2;
const Z0 = -((ROWS - 1) * SPACING) / 2;

const CAP_BOTTOM = 1.12;
const CAP_TOP = 0.7616;
const CAP_HEIGHT = 0.76;
const PAD_SIZE = 1.84;
const VIEW = 8.5;

const IDLE_MS = 1800;
const WAVE_MS = 7000;
const VIGNETTE_START = 0.55;

const PALETTE_DARK = ['#e9d9bf', '#d49a57', '#b8612f', '#8e2f2a'];
const PALETTE_LIGHT = ['#b8612f', '#d49a57', '#8e2f2a', '#5a4032'];
const CLEAR_DARK = new THREE.Color('#17100c');
const CLEAR_LIGHT = new THREE.Color('#f3eadb');
const BODY_DARK = new THREE.Color('#0d0907');
const BODY_LIGHT = new THREE.Color('#efe3cf');
const HOT_DARK = new THREE.Color('#fbf7ef');
const HOT_LIGHT = new THREE.Color('#8e2f2a');
const BEAN = new THREE.Color('#5a4032');

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => v * v * (3 - 2 * v);
const band = (v: number, a: number, b: number) => smooth(clamp01((v - a) / (b - a)));

function gradientAt(t: number, stops: string[]) {
  const n = stops.length - 1;
  const i = Math.min(Math.floor(t * n), n - 1);
  return new THREE.Color(stops[i]).lerp(new THREE.Color(stops[i + 1]), t * n - i);
}

/** Bottom/top square of the keycap frustum, as line endpoints. */
function keycapOutline() {
  const b = 0.56;
  const t = CAP_TOP / 2;
  const h = CAP_HEIGHT / 2;
  const base = [[b, -h, b], [b, -h, -b], [-b, -h, -b], [-b, -h, b]];
  const top = [[t, h, t], [t, h, -t], [-t, h, -t], [-t, h, t]];
  const lerp = (p: number[], q: number[], k: number) => p.map((v, i) => v + (q[i] - v) * k);
  const brackets: number[] = [];
  const middles: number[] = [];
  for (const ring of [base, top]) {
    for (let i = 0; i < 4; i++) {
      const p = ring[i];
      const q = ring[(i + 1) % 4];
      const p1 = lerp(p, q, 0.35);
      const q1 = lerp(q, p, 0.35);
      brackets.push(...p, ...p1, ...q, ...q1);
      middles.push(...p1, ...q1);
    }
  }
  for (let i = 0; i < 4; i++) brackets.push(...base[i], ...top[i]);
  return { brackets, middles };
}

type Props = { driver: RefObject<KbDriver> };

export default function KeyboardBackground({ driver }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = host.clientWidth;
    let height = host.clientHeight;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      return; // no WebGL: the page still works on its plain background
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(CLEAR_DARK);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 500);
    camera.position.set(-14, 20, 25);
    camera.lookAt(0, 0, 0);
    const fitCamera = () => {
      const aspect = width / height;
      // Portrait screens see a narrower slice; zoom out a little so it still reads as a board.
      const view = aspect < 1 ? VIEW * 1.25 : VIEW;
      camera.left = -view * aspect;
      camera.right = view * aspect;
      camera.top = view;
      camera.bottom = -view;
      camera.updateProjectionMatrix();
    };
    fitCamera();

    const ambient = new THREE.AmbientLight(0x3a2a20, 1.6);
    scene.add(ambient);
    const point = new THREE.PointLight(0xd49a57, 1.6);
    point.position.set(-5, 12, 8);
    scene.add(point);

    const groundGeo = new THREE.PlaneGeometry(50, 34);
    const groundMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, depthTest: false });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // A 4-sided cylinder rotated 45° is a square frustum: a keycap.
    const capGeo = new THREE.CylinderGeometry(CAP_TOP / Math.SQRT2, CAP_BOTTOM / Math.SQRT2, CAP_HEIGHT, 4, 1, false, Math.PI / 4);
    // Coffee bean for the easter egg: a squashed ellipsoid, roughly keycap-sized.
    const beanGeo = new THREE.SphereGeometry(0.5, 20, 14);
    beanGeo.scale(0.78, 0.76, 1.08);
    const outline = keycapOutline();
    const bracketGeo = new LineSegmentsGeometry().setPositions(outline.brackets);
    const middleGeo = new LineSegmentsGeometry().setPositions(outline.middles);
    const s = 0.92;
    const socketGeo = new LineSegmentsGeometry().setPositions([
      -s, 0, -s, s, 0, -s, s, 0, -s, s, 0, s, s, 0, s, -s, 0, s, -s, 0, s, -s, 0, -s,
    ]);
    const padGeo = new THREE.PlaneGeometry(PAD_SIZE, PAD_SIZE);

    const COUNT = ROWS * COLS;
    const keyX = new Float32Array(COUNT);
    const keyZ = new Float32Array(COUNT);
    const keyR = new Float32Array(COUNT); // distance from the board centre, in keys
    const vignette = new Float32Array(COUNT);
    const jitter = new Float32Array(COUNT);
    const lift = new Float32Array(COUNT);
    const held = new Float32Array(COUNT);
    const darkColor: THREE.Color[] = [];
    const lightColor: THREE.Color[] = [];

    const caps: THREE.Group[] = [];
    const bodies: THREE.Mesh[] = [];
    const bodyMats: THREE.MeshPhongMaterial[] = [];
    const bracketMats: LineMaterial[] = [];
    const middleMats: LineMaterial[] = [];
    const socketMats: LineMaterial[] = [];
    const padMats: THREE.MeshBasicMaterial[] = [];

    const lineMat = (color: THREE.Color, lw: number) =>
      new LineMaterial({ color: color.getHex(), linewidth: lw, transparent: true, opacity: 0, depthWrite: false });

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c;
        const t = (r + c) / (ROWS + COLS - 2);
        const dark = gradientAt(t, PALETTE_DARK);
        darkColor.push(dark);
        lightColor.push(gradientAt(t, PALETTE_LIGHT));
        const dx = (c - (COLS - 1) / 2) / ((COLS - 1) / 2);
        const dz = (r - (ROWS - 1) / 2) / ((ROWS - 1) / 2);
        vignette[i] = 1 - band(Math.min(1, Math.hypot(dx, dz)), VIGNETTE_START, 1);
        jitter[i] = 0.75 + 0.25 * Math.abs(Math.sin(i * 12.9898) * 43758.5453 % 1);

        const body = new THREE.MeshPhongMaterial({
          color: BODY_DARK.clone(),
          emissive: dark.clone(),
          emissiveIntensity: 0.12,
          shininess: 30,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        });
        const bracketMat = lineMat(dark, 3.6);
        const middleMat = lineMat(dark, 3.6);
        const socketMat = lineMat(dark, 4);
        const padMat = new THREE.MeshBasicMaterial({ color: dark.clone(), transparent: true, opacity: 0, depthWrite: false });

        const x = X0 + c * SPACING;
        const z = Z0 + r * SPACING;
        const cap = new THREE.Group();
        const bodyMesh = new THREE.Mesh(capGeo, body);
        cap.add(bodyMesh);
        cap.add(new LineSegments2(bracketGeo, bracketMat));
        cap.add(new LineSegments2(middleGeo, middleMat));
        cap.position.set(x, 0, z);
        cap.scale.set(1, 0.02, 1);
        scene.add(cap);

        const socket = new LineSegments2(socketGeo, socketMat);
        socket.position.set(x, 0, z);
        scene.add(socket);

        const pad = new THREE.Mesh(padGeo, padMat);
        pad.rotation.x = -Math.PI / 2;
        pad.position.set(x, 0.006, z);
        scene.add(pad);

        caps.push(cap);
        bodies.push(bodyMesh);
        keyX[i] = x;
        keyZ[i] = z;
        keyR[i] = Math.hypot(x, z) / SPACING;
        bodyMats.push(body);
        bracketMats.push(bracketMat);
        middleMats.push(middleMat);
        socketMats.push(socketMat);
        padMats.push(padMat);
      }
    }
    const allLineMats = [...bracketMats, ...middleMats, ...socketMats];
    allLineMats.forEach((m) => m.resolution.set(width, height));

    // Twinkling dots where the switch rows cross. Each dot carries both palettes.
    const buckets: number[][] = [[], [], []];
    for (let r = 0; r <= ROWS; r++) {
      for (let c = 0; c <= COLS; c++) {
        const t = (r + c) / (ROWS + COLS);
        const cd = gradientAt(t, PALETTE_DARK);
        const cl = gradientAt(t, PALETTE_LIGHT);
        const dx = (c - COLS / 2) / (COLS / 2);
        const dz = (r - ROWS / 2) / (ROWS / 2);
        const fade = 1 - band(Math.min(1, Math.hypot(dx, dz)), VIGNETTE_START, 1);
        const roll = Math.random();
        const b = roll < 0.55 ? 0 : roll < 0.85 ? 1 : 2;
        buckets[b].push(
          X0 - 1 + c * SPACING, 0.015, Z0 - 1 + r * SPACING,
          cd.r * fade, cd.g * fade, cd.b * fade,
          cl.r * fade, cl.g * fade, cl.b * fade,
          Math.random(), 0.5 + 0.8 * Math.random(),
        );
      }
    }
    const STRIDE = 11;
    const dotGeos: THREE.BufferGeometry[] = [];
    const dotMats: THREE.ShaderMaterial[] = [];
    const pr = renderer.getPixelRatio();
    [3, 5, 8].forEach((size, b) => {
      const data = buckets[b];
      const n = data.length / STRIDE;
      if (!n) return;
      const pos = new Float32Array(n * 3);
      const colD = new Float32Array(n * 3);
      const colL = new Float32Array(n * 3);
      const phase = new Float32Array(n);
      const speed = new Float32Array(n);
      for (let k = 0; k < n; k++) {
        const o = k * STRIDE;
        pos.set(data.slice(o, o + 3), k * 3);
        colD.set(data.slice(o + 3, o + 6), k * 3);
        colL.set(data.slice(o + 6, o + 9), k * 3);
        phase[k] = data[o + 9];
        speed[k] = data[o + 10];
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('colorDark', new THREE.BufferAttribute(colD, 3));
      geo.setAttribute('colorLight', new THREE.BufferAttribute(colL, 3));
      geo.setAttribute('phase', new THREE.BufferAttribute(phase, 1));
      geo.setAttribute('speed', new THREE.BufferAttribute(speed, 1));
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: size * pr * 0.75 },
          uOpacity: { value: 0.62 },
          uLight: { value: 0 },
        },
        vertexShader: /* glsl */ `
          attribute vec3 colorDark;
          attribute vec3 colorLight;
          attribute float phase;
          attribute float speed;
          uniform float uTime;
          uniform float uSize;
          uniform float uLight;
          varying vec3 vColor;
          varying float vTwinkle;
          void main() {
            vColor = mix(colorDark, colorLight, uLight);
            vTwinkle = 0.5 + 0.5 * sin(uTime * speed * 3.0 + phase * 6.28318);
            gl_PointSize = uSize * (0.45 + 0.85 * vTwinkle);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform float uOpacity;
          varying vec3 vColor;
          varying float vTwinkle;
          void main() {
            vec2 d = gl_PointCoord - vec2(0.5);
            if (dot(d, d) > 0.25) discard;
            gl_FragColor = vec4(vColor, uOpacity * (0.35 + 0.65 * vTwinkle));
          }`,
        transparent: true,
        depthWrite: false,
      });
      scene.add(new THREE.Points(geo, mat));
      dotGeos.push(geo);
      dotMats.push(mat);
    });

    // Distant star field, only visible on the espresso palette.
    const starPos = new Float32Array(660);
    for (let k = 0; k < starPos.length; k++) starPos[k] = 46 * (Math.random() - 0.5);
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xe9d9bf, size: 2, sizeAttenuation: false, transparent: true, opacity: 0.45, depthWrite: false });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2(-9999, -9999);
    const focusNdc = new THREE.Vector2();
    let lastInput = -Infinity;
    const onPointer = (e: PointerEvent) => {
      ndc.x = (e.clientX / window.innerWidth) * 2 - 1;
      ndc.y = -(e.clientY / window.innerHeight) * 2 + 1;
      lastInput = performance.now();
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerdown', onPointer, { passive: true });

    const waveFrom = new THREE.Vector3(X0, 0, Z0);
    const waveTo = new THREE.Vector3(-X0, 0, -Z0);
    const wave = new THREE.Vector3();
    const focusPoint = new THREE.Vector3();
    const pointerPoint = new THREE.Vector3();
    const tmp = new THREE.Color();
    const tmpBody = new THREE.Color();
    const tmpClear = new THREE.Color();

    let opacity = -1;
    let light = 0;
    let beans = false;
    let raf = 0;
    let prev = performance.now();

    const hitGround = (v: THREE.Vector2, out: THREE.Vector3) => {
      raycaster.setFromCamera(v, camera);
      const hit = raycaster.intersectObject(ground);
      if (!hit.length) return false;
      out.copy(hit[0].point);
      return true;
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const now = performance.now();
      if (document.hidden) {
        prev = now;
        return;
      }
      const d = driver.current;
      if (!d) return;
      const dt = Math.min(0.1, (now - prev) / 1000);
      prev = now;
      const step = dt * 60;

      // Fade the whole canvas; skip rendering entirely while it is invisible.
      const nextOpacity = opacity < 0 ? d.visible : opacity + (d.visible - opacity) * (1 - Math.pow(0.82, step));
      if (Math.abs(nextOpacity - opacity) > 0.002) host.style.opacity = nextOpacity.toFixed(3);
      opacity = nextOpacity;
      if (opacity < 0.01) return;

      light += (d.light - light) * (1 - Math.pow(0.9, step));
      if (Math.abs(d.light - light) < 0.001) light = d.light;

      if (d.beans !== beans) {
        beans = d.beans;
        bodies.forEach((m) => (m.geometry = beans ? beanGeo : capGeo));
      }

      if (!reduceMotion) dotMats.forEach((m) => (m.uniforms.uTime.value = now / 1000));
      dotMats.forEach((m) => (m.uniforms.uLight.value = light));
      starMat.opacity = 0.45 * (1 - light);
      renderer.setClearColor(tmpClear.copy(CLEAR_DARK).lerp(CLEAR_LIGHT, light));
      tmpBody.copy(BODY_DARK).lerp(BODY_LIGHT, light);

      // Pointer target
      const pointer = now - lastInput < IDLE_MS && hitGround(ndc, pointerPoint) ? pointerPoint : null;
      const idle = !pointer;
      let waveTarget: THREE.Vector3 | null = null;
      if (idle && d.idleWave && !reduceMotion) {
        const t = ((now % WAVE_MS) / WAVE_MS) * 2;
        waveTarget = wave.copy(waveFrom).lerp(waveTo, smooth(t < 1 ? t : 2 - t));
      }
      let focus: THREE.Vector3 | null = null;
      if (d.focus && d.focus.strength > 0) {
        focusNdc.set(d.focus.x * 2 - 1, -(d.focus.y * 2 - 1));
        if (hitGround(focusNdc, focusPoint)) focus = focusPoint;
      }

      const shockR = d.shockR;
      const shockAmp = d.shockAmp;
      const hot = light > 0.5 ? HOT_LIGHT : HOT_DARK;

      for (let i = 0; i < COUNT; i++) {
        let goal = 0;
        if (pointer) {
          const dist = Math.hypot(pointer.x - keyX[i], pointer.z - keyZ[i]) / SPACING;
          goal = smooth(Math.pow(clamp01(1 - dist / 2.3), 0.6));
        } else if (waveTarget) {
          const dist = Math.hypot(waveTarget.x - keyX[i], waveTarget.z - keyZ[i]) / SPACING;
          goal = smooth(Math.pow(clamp01(1 - dist / 6), 2.6));
        }
        if (focus && d.focus) {
          const dist = Math.hypot(focus.x - keyX[i], focus.z - keyZ[i]) / SPACING;
          goal = Math.max(goal, d.focus.strength * smooth(Math.pow(clamp01(1 - dist / d.focus.radius), 0.7)));
        }
        if (d.pump > 0) goal = Math.max(goal, d.pump * 0.32 * jitter[i]);
        if (shockR >= 0 && shockAmp > 0) {
          const k = (keyR[i] - shockR) / 1.1;
          goal = Math.max(goal, shockAmp * Math.exp(-k * k));
        }
        if (d.all > 0) goal = Math.max(goal, d.all * jitter[i]);

        const rate = goal > lift[i] ? 0.24 : 0.11;
        lift[i] += (goal - lift[i]) * (1 - Math.pow(1 - rate, step));
        const u = lift[i];
        const w = vignette[i];

        const sy = THREE.MathUtils.lerp(0.02, 1, u);
        caps[i].scale.set(1, sy, 1);
        caps[i].position.y = (sy * CAP_HEIGHT) / 2 + 0.1 * u;

        const lineFade = beans ? 0 : 1;
        bracketMats[i].opacity = band(u, 0, 0.35) * w * lineFade;
        middleMats[i].opacity = band(u, 0.2, 0.6) * w * lineFade;
        bodyMats[i].opacity = smooth(Math.max(0, (u - (beans ? 0.25 : 0.62)) / (beans ? 0.5 : 0.38))) * w;
        socketMats[i].opacity = THREE.MathUtils.lerp(d.socketFloor, 1, u) * w;
        padMats[i].opacity = 0.55 * smooth(u) * w;

        // Keys held up under the cursor heat towards foam (or cherry on oat).
        held[i] = pointer && u > 0.75 ? Math.min(6, held[i] + dt) : Math.max(0, held[i] - 2 * dt);
        tmp.copy(darkColor[i]).lerp(lightColor[i], light);
        if (held[i] > 0.02) tmp.lerp(hot, Math.min(0.75, held[i] * 0.35));
        bracketMats[i].color.copy(tmp);
        middleMats[i].color.copy(tmp);
        socketMats[i].color.copy(tmp);
        padMats[i].color.copy(tmp);
        if (beans) {
          bodyMats[i].color.copy(BEAN);
          bodyMats[i].emissive.copy(tmp).multiplyScalar(0.35);
        } else {
          bodyMats[i].color.copy(tmpBody);
          bodyMats[i].emissive.copy(tmp);
        }
        bodyMats[i].emissiveIntensity = THREE.MathUtils.lerp(0.12, 0.05, light);
      }

      if (!reduceMotion) stars.rotation.y += 0.00015 * step;
      renderer.render(scene, camera);
    };
    frame();

    const onResize = () => {
      width = host.clientWidth;
      height = host.clientHeight;
      fitCamera();
      renderer.setSize(width, height);
      allLineMats.forEach((m) => m.resolution.set(width, height));
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('resize', onResize);
      [groundGeo, capGeo, beanGeo, bracketGeo, middleGeo, socketGeo, padGeo, starGeo, ...dotGeos].forEach((g) => g.dispose());
      [groundMat, starMat, ...bodyMats, ...allLineMats, ...padMats, ...dotMats].forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [driver]);

  return <div ref={hostRef} aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden" />;
}
