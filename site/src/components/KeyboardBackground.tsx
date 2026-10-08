import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

/**
 * Mechanical-keyboard backdrop.
 *
 * A 12 × 20 grid of keycaps seen through an orthographic camera. The pointer is
 * raycast onto an invisible ground plane and every key lifts by its distance to
 * the hit point, with an asymmetric spring (snappy press, softer release). Keys
 * draw in as corner brackets, complete their outline, then fill as they rise;
 * keys held up shift hue. After 1.8 s without input a wave sweeps the board.
 *
 * Technique inspired by the hero of yashahire.info.
 */

const ROWS = 12;
const COLS = 20;
const SPACING = 2;
const X0 = -((COLS - 1) * SPACING) / 2; // -19
const Z0 = -((ROWS - 1) * SPACING) / 2; // -11

const CAP_BOTTOM = 1.12;
const CAP_TOP = 0.7616;
const CAP_HEIGHT = 0.76;
const PAD_SIZE = 1.84;
const VIEW = 8.5; // half-height of the orthographic frustum

const IDLE_MS = 1800;
const WAVE_MS = 7000;
const VIGNETTE_START = 0.55;

const PALETTES = {
  dark: ['#2de8c0', '#3f7bff', '#9b3bff', '#ff3fb0'],
  light: ['#0f9e86', '#2f5bcc', '#6a29b8', '#b82f8a'],
};

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
  const b = 0.56; // half-width at the base
  const t = CAP_TOP / 2; // half-width at the top
  const h = CAP_HEIGHT / 2;
  const base = [
    [b, -h, b],
    [b, -h, -b],
    [-b, -h, -b],
    [-b, -h, b],
  ];
  const top = [
    [t, h, t],
    [t, h, -t],
    [-t, h, -t],
    [-t, h, t],
  ];
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
  for (let i = 0; i < 4; i++) brackets.push(...base[i], ...top[i]); // vertical edges
  return { brackets, middles };
}

type Props = { theme: 'dark' | 'light' };

export default function KeyboardBackground({ theme }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const dark = theme === 'dark';
    const palette = PALETTES[theme];
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
    renderer.setClearColor(dark ? 0x05050a : 0xf2f2f7);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 500);
    camera.position.set(-14, 20, 25);
    camera.lookAt(0, 0, 0);
    const fitCamera = () => {
      const aspect = width / height;
      camera.left = -VIEW * aspect;
      camera.right = VIEW * aspect;
      camera.top = VIEW;
      camera.bottom = -VIEW;
      camera.updateProjectionMatrix();
    };
    fitCamera();

    scene.add(new THREE.AmbientLight(dark ? 0x223355 : 0x9999bb, 1.6));
    const point = new THREE.PointLight(dark ? 0x3366ff : 0x6688cc, 1.6);
    point.position.set(-5, 12, 8);
    scene.add(point);

    // Invisible plane the pointer is projected onto.
    const groundGeo = new THREE.PlaneGeometry(50, 34);
    const groundMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, depthTest: false });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Shared geometry. A 4-sided cylinder rotated 45° is a square frustum: a keycap.
    const capGeo = new THREE.CylinderGeometry(
      CAP_TOP / Math.SQRT2,
      CAP_BOTTOM / Math.SQRT2,
      CAP_HEIGHT,
      4,
      1,
      false,
      Math.PI / 4,
    );
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
    const vignette = new Float32Array(COUNT);
    const lift = new Float32Array(COUNT);
    const held = new Float32Array(COUNT);
    const baseHSL: { h: number; s: number; l: number }[] = [];
    const baseColor: THREE.Color[] = [];
    const tinted = new Uint8Array(COUNT);

    const caps: THREE.Group[] = [];
    const bodyMats: THREE.MeshPhongMaterial[] = [];
    const bracketMats: LineMaterial[] = [];
    const middleMats: LineMaterial[] = [];
    const socketMats: LineMaterial[] = [];
    const padMats: THREE.MeshBasicMaterial[] = [];

    const lineMat = (color: THREE.Color, lw: number) =>
      new LineMaterial({
        color: color.getHex(),
        linewidth: lw,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c;
        const color = gradientAt((r + c) / (ROWS + COLS - 2), palette);
        const dx = (c - (COLS - 1) / 2) / ((COLS - 1) / 2);
        const dz = (r - (ROWS - 1) / 2) / ((ROWS - 1) / 2);
        const d = Math.min(1, Math.hypot(dx, dz));
        vignette[i] = 1 - band(d, VIGNETTE_START, 1);
        const hsl = { h: 0, s: 0, l: 0 };
        color.getHSL(hsl);
        baseHSL.push(hsl);
        baseColor.push(color);

        const body = new THREE.MeshPhongMaterial({
          color: dark ? 0x050508 : 0xe4e4ee,
          emissive: color,
          emissiveIntensity: dark ? 0.12 : 0.05,
          shininess: dark ? 30 : 6,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        });
        const bracketMat = lineMat(color, dark ? 3.8 : 3);
        const middleMat = lineMat(color, dark ? 3.8 : 3);
        const socketMat = lineMat(color, dark ? 4.2 : 3.2);
        const padMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false });

        const x = X0 + c * SPACING;
        const z = Z0 + r * SPACING;

        const cap = new THREE.Group();
        cap.add(new THREE.Mesh(capGeo, body));
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
        keyX[i] = x;
        keyZ[i] = z;
        bodyMats.push(body);
        bracketMats.push(bracketMat);
        middleMats.push(middleMat);
        socketMats.push(socketMat);
        padMats.push(padMat);
      }
    }
    const allLineMats = [...bracketMats, ...middleMats, ...socketMats];
    allLineMats.forEach((m) => m.resolution.set(width, height));

    // Twinkling dots where the switch rows cross, in three size buckets.
    const buckets: number[][] = [[], [], []];
    for (let r = 0; r <= ROWS; r++) {
      for (let c = 0; c <= COLS; c++) {
        const color = gradientAt((r + c) / (ROWS + COLS), palette);
        const dx = (c - COLS / 2) / (COLS / 2);
        const dz = (r - ROWS / 2) / (ROWS / 2);
        const fade = 1 - band(Math.min(1, Math.hypot(dx, dz)), VIGNETTE_START, 1);
        const roll = Math.random();
        const b = roll < 0.55 ? 0 : roll < 0.85 ? 1 : 2;
        buckets[b].push(
          X0 - 1 + c * SPACING, 0.015, Z0 - 1 + r * SPACING,
          color.r * fade, color.g * fade, color.b * fade,
          Math.random(), 0.5 + 0.8 * Math.random(),
        );
      }
    }
    const dotGeos: THREE.BufferGeometry[] = [];
    const dotMats: THREE.ShaderMaterial[] = [];
    const pr = renderer.getPixelRatio();
    [3, 5, 8].forEach((size, b) => {
      const data = buckets[b];
      const n = data.length / 8;
      if (!n) return;
      const pos = new Float32Array(n * 3);
      const col = new Float32Array(n * 3);
      const phase = new Float32Array(n);
      const speed = new Float32Array(n);
      for (let k = 0; k < n; k++) {
        pos.set(data.slice(k * 8, k * 8 + 3), k * 3);
        col.set(data.slice(k * 8 + 3, k * 8 + 6), k * 3);
        phase[k] = data[k * 8 + 6];
        speed[k] = data[k * 8 + 7];
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      geo.setAttribute('phase', new THREE.BufferAttribute(phase, 1));
      geo.setAttribute('speed', new THREE.BufferAttribute(speed, 1));
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: size * pr * 0.75 },
          uOpacity: { value: dark ? 0.62 : 0.8 },
        },
        vertexShader: /* glsl */ `
          attribute vec3 color;
          attribute float phase;
          attribute float speed;
          uniform float uTime;
          uniform float uSize;
          varying vec3 vColor;
          varying float vTwinkle;
          void main() {
            vColor = color;
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

    // Distant star field (dark theme only).
    let stars: THREE.Points | null = null;
    if (dark) {
      const pos = new Float32Array(660);
      for (let k = 0; k < pos.length; k++) pos[k] = 46 * (Math.random() - 0.5);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      stars = new THREE.Points(
        geo,
        new THREE.PointsMaterial({ color: 0x88aacc, size: 2, sizeAttenuation: false, transparent: true, opacity: 0.5, depthWrite: false }),
      );
      scene.add(stars);
    }

    // Scrolling raises a faint "socket" grid so the board stays legible as a texture.
    let scrollProgress = 0;
    const onScroll = () => {
      scrollProgress = clamp01(window.scrollY / (0.9 * window.innerHeight));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2(-9999, -9999);
    let lastInput = -Infinity;
    const onPointer = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      lastInput = performance.now();
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerdown', onPointer, { passive: true });

    const waveFrom = new THREE.Vector3(X0, 0, Z0);
    const waveTo = new THREE.Vector3(-X0, 0, -Z0);
    const wave = new THREE.Vector3();
    const tint = new THREE.Color();

    let raf = 0;
    let prev = performance.now();
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) {
        prev = performance.now();
        return;
      }
      const now = performance.now();
      const dt = Math.min(0.1, (now - prev) / 1000);
      prev = now;
      const step = dt * 60; // normalise the springs to 60 fps

      if (!reduceMotion) dotMats.forEach((m) => (m.uniforms.uTime.value = now / 1000));

      let target: THREE.Vector3 | null = null;
      let idle = now - lastInput > IDLE_MS;
      if (!idle) {
        raycaster.setFromCamera(ndc, camera);
        const hit = raycaster.intersectObject(ground);
        target = hit.length ? hit[0].point : null;
        idle = !target;
      }
      if (idle && !reduceMotion) {
        const t = ((now % WAVE_MS) / WAVE_MS) * 2;
        target = wave.copy(waveFrom).lerp(waveTo, smooth(t < 1 ? t : 2 - t));
      }

      const radius = idle ? 6 : 2.3;
      const falloff = idle ? 2.6 : 0.6;
      const socketFloor = 0.16 * scrollProgress;

      for (let i = 0; i < COUNT; i++) {
        let goal = 0;
        if (target) {
          const dist = Math.hypot(target.x - keyX[i], target.z - keyZ[i]) / SPACING;
          goal = smooth(Math.pow(clamp01(1 - dist / radius), falloff));
        }
        const rate = goal > lift[i] ? 0.22 : 0.12;
        lift[i] += (goal - lift[i]) * (1 - Math.pow(1 - rate, step));
        const u = lift[i];
        const w = vignette[i];

        const sy = THREE.MathUtils.lerp(0.02, 1, u);
        caps[i].scale.set(1, sy, 1);
        caps[i].position.y = (sy * CAP_HEIGHT) / 2 + 0.1 * u;

        bracketMats[i].opacity = band(u, 0, 0.35) * w;
        middleMats[i].opacity = band(u, 0.2, 0.6) * w;
        bodyMats[i].opacity = smooth(Math.max(0, (u - 0.62) / 0.38)) * w;
        socketMats[i].opacity = THREE.MathUtils.lerp(socketFloor, 1, u) * w;
        padMats[i].opacity = 0.55 * smooth(u) * w;

        // Keys held down under the cursor slowly cycle through the spectrum.
        held[i] = !idle && u > 0.75 ? Math.min(30, held[i] + dt) : Math.max(0, held[i] - 2 * dt);
        if (held[i] > 0.05) {
          const hsl = baseHSL[i];
          tint.setHSL((hsl.h + 0.12 * held[i]) % 1, hsl.s, hsl.l);
          tinted[i] = 1;
        } else if (tinted[i]) {
          tint.copy(baseColor[i]);
          tinted[i] = 0;
        } else continue;
        bracketMats[i].color.copy(tint);
        middleMats[i].color.copy(tint);
        socketMats[i].color.copy(tint);
        bodyMats[i].emissive.copy(tint);
        padMats[i].color.copy(tint);
      }

      if (stars && !reduceMotion) stars.rotation.y += 0.00015 * step;
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
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('resize', onResize);
      [groundGeo, capGeo, bracketGeo, middleGeo, socketGeo, padGeo, ...dotGeos].forEach((g) => g.dispose());
      [groundMat, ...bodyMats, ...allLineMats, ...padMats, ...dotMats].forEach((m) => m.dispose());
      if (stars) {
        stars.geometry.dispose();
        (stars.material as THREE.Material).dispose();
      }
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [theme]);

  return (
    <div
      ref={hostRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    />
  );
}
