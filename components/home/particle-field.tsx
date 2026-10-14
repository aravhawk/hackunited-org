"use client";

import { useEffect, useRef } from "react";
import { fieldStore, fieldSpin, type FieldShape } from "@/lib/field-store";
import { LAND_MASK_PNG } from "@/lib/land-mask";
import { scrollStore } from "@/lib/scroll";

const COUNT = 15000; // shared point budget for every shape

function rand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ---- Earth: dots on continents only, from a 256x128 equirectangular land mask ----
type Land = { data: Uint8Array; w: number; h: number };
let land: Land | null = null;

function loadLand(): Promise<void> {
  if (land) return Promise.resolve();
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext("2d", { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0);
        const px = ctx.getImageData(0, 0, c.width, c.height).data;
        const data = new Uint8Array(c.width * c.height);
        for (let i = 0; i < data.length; i++) data[i] = px[i * 4] > 127 ? 1 : 0;
        land = { data, w: c.width, h: c.height };
      } catch {
        land = null;
      }
      resolve();
    };
    img.onerror = () => resolve();
    img.src = LAND_MASK_PNG;
  });
}

function isLand(lat: number, lon: number) {
  if (!land || lat < -1.05) return false; // drop the Antarctic band
  const u = (lon + Math.PI) / (2 * Math.PI);
  const v = (Math.PI / 2 - lat) / Math.PI;
  const x = Math.min(land.w - 1, Math.max(0, Math.floor(u * land.w)));
  const y = Math.min(land.h - 1, Math.max(0, Math.floor(v * land.h)));
  return land.data[y * land.w + x] === 1;
}

function buildEarth(): Float32Array | null {
  if (!land) return null;
  const out = new Float32Array(COUNT * 3);
  const golden = Math.PI * (1 + Math.sqrt(5));
  const N = 90000;
  const cand: number[] = [];
  for (let k = 0; k < N; k++) {
    const y = 1 - (2 * (k + 0.5)) / N;
    const lat = Math.asin(y);
    let lon = (golden * k) % (2 * Math.PI);
    lon -= Math.PI;
    if (isLand(lat, lon)) cand.push(lat, lon);
  }
  const pts = cand.length / 2;
  const want = Math.floor(COUNT * 0.93);
  for (let j = 0; j < want; j++) {
    const idx = Math.floor((j * pts) / want) * 2;
    const lat = cand[idx];
    const lon = cand[idx + 1];
    const r = 1 + (rand(j + 3) - 0.5) * 0.01;
    out[j * 3] = r * Math.cos(lat) * Math.sin(lon);
    out[j * 3 + 1] = r * Math.sin(lat);
    out[j * 3 + 2] = r * Math.cos(lat) * Math.cos(lon);
  }
  // thin orbit ring for the remaining points
  for (let i = want; i < COUNT; i++) {
    const a = ((i - want) / (COUNT - want)) * Math.PI * 2;
    const rad = 1.42 + (rand(i + 9) - 0.5) * 0.03;
    out[i * 3] = rad * Math.cos(a);
    out[i * 3 + 1] = (rand(i + 17) - 0.5) * 0.02;
    out[i * 3 + 2] = rad * Math.sin(a);
  }
  return out;
}

function buildShape(shape: FieldShape): Float32Array {
  if (shape === "globe") {
    const earth = buildEarth();
    if (earth) return earth;
  }
  const out = new Float32Array(COUNT * 3);
  const set = (i: number, x: number, y: number, z: number) => {
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  };

  for (let i = 0; i < COUNT; i++) {
    const r1 = rand(i + 1);
    const r2 = rand(i + 9001);
    const r3 = rand(i + 4242);

    switch (shape) {
      case "globe": {
        // Fibonacci shell plus a thin equatorial orbit ring
        if (i < COUNT * 0.9) {
          const k = i / (COUNT * 0.9);
          const phi = Math.acos(1 - 2 * k);
          const theta = Math.PI * (1 + Math.sqrt(5)) * i;
          const rad = 1 + (r1 - 0.5) * 0.012;
          set(
            i,
            rad * Math.sin(phi) * Math.cos(theta),
            rad * Math.cos(phi),
            rad * Math.sin(phi) * Math.sin(theta)
          );
        } else {
          const a = ((i - COUNT * 0.9) / (COUNT * 0.1)) * Math.PI * 2;
          const rad = 1.42 + (r1 - 0.5) * 0.03;
          set(i, rad * Math.cos(a), (r2 - 0.5) * 0.02, rad * Math.sin(a));
        }
        break;
      }
      case "helix": {
        // double helix with rungs: a community growing, strand by strand
        const strandPts = Math.floor(COUNT * 0.88);
        const turns = 3.4;
        if (i < strandPts) {
          const k = i % 2;
          const t = Math.floor(i / 2) / (strandPts / 2);
          const ang = t * Math.PI * 2 * turns + k * Math.PI;
          const rad = 0.6 + (r1 - 0.5) * 0.05;
          set(i, Math.cos(ang) * rad, (t - 0.5) * 3.1, Math.sin(ang) * rad + (r2 - 0.5) * 0.05);
        } else {
          const t = r1;
          const ang = t * Math.PI * 2 * turns;
          const f = r2 * 2 - 1;
          const rad = 0.6 * f;
          set(i, Math.cos(ang) * rad, (t - 0.5) * 3.1, Math.sin(ang) * rad);
        }
        break;
      }
      case "knot": {
        // (2,3) torus knot with a fuzzy tube around it
        const t = (i / COUNT) * Math.PI * 2;
        const rr = 2 + Math.cos(3 * t);
        const cx = rr * Math.cos(2 * t) * 0.34;
        const cy = rr * Math.sin(2 * t) * 0.34;
        const cz = Math.sin(3 * t) * 0.5;
        const a = r1 * Math.PI * 2;
        const rad = 0.085 * Math.sqrt(r2);
        set(i, cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, cz + (r3 - 0.5) * rad * 2);
        break;
      }
      case "crystal": {
        // octahedron: bright edges, a nested core, and a sprinkle of face dust
        const V: [number, number, number][] = [
          [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
        ];
        const edges: [number, number][] = [];
        for (let a = 0; a < 6; a++) for (let b = a + 1; b < 6; b++) if (V[a].map((v, k) => v + V[b][k]).some((v) => v !== 0)) edges.push([a, b]);
        const sx = 0.92;
        const sy = 1.25;
        if (i < COUNT * 0.84) {
          const inner = i % 4 === 0;
          const [ea, eb] = edges[i % edges.length];
          const t = r1;
          const k = inner ? 0.5 : 1;
          const j = 0.012;
          set(
            i,
            (V[ea][0] + (V[eb][0] - V[ea][0]) * t) * sx * k + (r2 - 0.5) * j,
            (V[ea][1] + (V[eb][1] - V[ea][1]) * t) * sy * k + (r3 - 0.5) * j,
            (V[ea][2] + (V[eb][2] - V[ea][2]) * t) * sx * k + (rand(i + 55) - 0.5) * j
          );
        } else {
          let x = r1 - 0.5;
          let y = r2 - 0.5;
          let z = r3 - 0.5;
          const m = Math.abs(x) + Math.abs(y) + Math.abs(z) || 1;
          const sc = 0.5 / m;
          x *= sc * 2;
          y *= sc * 2;
          z *= sc * 2;
          set(i, x * sx * 2, y * sy * 2, z * sx * 2);
        }
        break;
      }
      case "galaxy": {
        const arm = i % 3;
        const rad = Math.pow(r1, 0.62) * 1.45;
        const spin = rad * 2.6 + (arm * Math.PI * 2) / 3;
        const spread = (r2 - 0.5) * 0.34 * (0.3 + rad * 0.5);
        set(
          i,
          Math.cos(spin) * rad + spread,
          (r3 - 0.5) * 0.12 * (1.4 - rad * 0.6),
          Math.sin(spin) * rad + (rand(i + 77) - 0.5) * 0.16 * rad
        );
        break;
      }
    }
  }
  return out;
}

const VERT = /* glsl */ `
  uniform float uT;
  uniform float uTime;
  uniform float uPx;
  uniform float uAspect;
  uniform vec2 uMouse;
  uniform float uOpacity;
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec3 aDir;
  attribute float aRand;
  attribute float aTone;
  varying float vAlpha;
  varying float vTone;

  void main() {
    float p = clamp((uT - aRand * 0.5) / 0.5, 0.0, 1.0);
    p = p * p * (3.0 - 2.0 * p);
    vec3 pos = mix(aFrom, aTo, p);
    pos += aDir * sin(p * 3.14159) * 0.55;
    pos += aDir * 0.012 * sin(uTime * 0.9 + aRand * 6.2831);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    vec2 d = ndc - uMouse;
    d.x *= uAspect;
    float f = smoothstep(0.42, 0.0, length(d));
    mv.xy += normalize(d + 1e-4) * f * 0.34;

    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.15 + aTone * 0.8 + f * 1.9) * uPx * (4.2 / -mv.z);
    vAlpha = uOpacity * (0.35 + 0.65 * smoothstep(-6.5, -2.6, mv.z));
    vTone = aTone;
  }
`;

const FRAG = /* glsl */ `
  varying float vAlpha;
  varying float vTone;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float edge = smoothstep(0.5, 0.2, r);
    vec3 silver = vec3(0.80, 0.82, 0.88);
    vec3 lav = vec3(0.83, 0.77, 1.0);
    vec3 col = mix(silver, lav, step(0.5, vTone));
    gl_FragColor = vec4(col, vAlpha * edge);
  }
`;

export default function ParticleField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      // The hero never shows the field, so stay out of the way of first paint and input.
      await new Promise<void>((resolve) => {
        const go = () => (window.requestIdleCallback ? window.requestIdleCallback(() => resolve(), { timeout: 2500 }) : setTimeout(resolve, 1200));
        if (document.readyState === "complete") go();
        else window.addEventListener("load", go, { once: true });
      });
      if (disposed) return;
      const [THREE] = await Promise.all([import("three"), loadLand()]);
      if (disposed) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
      } catch {
        return; // no WebGL: the page simply shows without the backdrop
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
      camera.position.z = 5;

      const shapes = new Map<FieldShape, Float32Array>();
      const getShape = (s: FieldShape) => {
        let v = shapes.get(s);
        if (!v) {
          v = buildShape(s);
          shapes.set(s, v);
        }
        return v;
      };

      const geo = new THREE.BufferGeometry();
      const position = new Float32Array(COUNT * 3);
      const aFrom = new Float32Array(getShape("globe"));
      const aTo = new Float32Array(getShape("globe"));
      const aDir = new Float32Array(COUNT * 3);
      const aRand = new Float32Array(COUNT);
      const aTone = new Float32Array(COUNT);
      for (let i = 0; i < COUNT; i++) {
        const u = rand(i + 31) * 2 - 1;
        const th = rand(i + 57) * Math.PI * 2;
        const s = Math.sqrt(1 - u * u);
        aDir[i * 3] = s * Math.cos(th);
        aDir[i * 3 + 1] = u;
        aDir[i * 3 + 2] = s * Math.sin(th);
        aRand[i] = rand(i + 5);
        aTone[i] = rand(i + 123) > 0.82 ? 1 : rand(i + 7) * 0.45;
      }
      geo.setAttribute("position", new THREE.BufferAttribute(position, 3));
      const fromAttr = new THREE.BufferAttribute(aFrom, 3);
      const toAttr = new THREE.BufferAttribute(aTo, 3);
      geo.setAttribute("aFrom", fromAttr);
      geo.setAttribute("aTo", toAttr);
      geo.setAttribute("aDir", new THREE.BufferAttribute(aDir, 3));
      geo.setAttribute("aRand", new THREE.BufferAttribute(aRand, 1));
      geo.setAttribute("aTone", new THREE.BufferAttribute(aTone, 1));

      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uT: { value: 1 },
          uTime: { value: 0 },
          uPx: { value: dpr },
          uAspect: { value: 1 },
          uMouse: { value: new THREE.Vector2(9, 9) },
          uOpacity: { value: 0 },
        },
      });
      const points = new THREE.Points(geo, mat);
      points.frustumCulled = false;
      const group = new THREE.Group();
      group.add(points);
      scene.add(group);

      let w = 1;
      let h = 1;
      const resize = () => {
        w = mount.clientWidth || window.innerWidth;
        h = mount.clientHeight || window.innerHeight;
        renderer.setSize(w, h, false);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        mat.uniforms.uAspect.value = w / h;
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(mount);

      // current morph state
      let currentShape: FieldShape = "globe";
      let t = 1;
      const snapshotCurrent = () => {
        for (let i = 0; i < COUNT; i++) {
          let p = Math.min(Math.max((t - aRand[i] * 0.5) / 0.5, 0), 1);
          p = p * p * (3 - 2 * p);
          for (let k = 0; k < 3; k++) {
            const idx = i * 3 + k;
            aFrom[idx] = aFrom[idx] + (aTo[idx] - aFrom[idx]) * p;
          }
        }
      };
      const morphTo = (s: FieldShape) => {
        if (s === currentShape) return;
        snapshotCurrent();
        aTo.set(getShape(s));
        fromAttr.needsUpdate = true;
        toAttr.needsUpdate = true;
        currentShape = s;
        t = reduce ? 1 : 0;
        if (reduce) {
          aFrom.set(aTo);
        }
      };

      // placement animates toward the store state
      const view = { x: 0, scale: 1, opacity: 0 };
      let target = fieldStore.get();
      morphTo(target.shape);
      const unsub = fieldStore.subscribe((s) => {
        target = s;
        morphTo(s.shape);
      });

      const mouse = { x: 9, y: 9, tx: 9, ty: 9, rx: 0, ry: 0 };
      const onMove = (e: PointerEvent) => {
        mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
      };
      const onLeave = () => {
        mouse.tx = 9;
        mouse.ty = 9;
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);

      let raf = 0;
      let scrollVel = 0;
      let last = performance.now();
      let running = true;
      const onVis = () => {
        running = !document.hidden;
        if (running) {
          last = performance.now();
          raf = requestAnimationFrame(loop);
        }
      };
      document.addEventListener("visibilitychange", onVis);

      const loop = (now: number) => {
        if (!running || disposed) return;
        raf = requestAnimationFrame(loop);
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;

        const k = 1 - Math.pow(0.0016, dt); // frame-rate independent damping
        const narrow = camera.aspect < 0.9;
        const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z * camera.aspect;
        const tx = narrow ? 0 : target.x * halfW * 0.5;
        const ts = target.scale * (narrow ? 0.72 : 1);
        const to = target.opacity * (narrow ? 0.34 : 1);
        view.x += (tx - view.x) * k;
        view.scale += (ts - view.scale) * k;
        view.opacity += (to - view.opacity) * k;

        if (view.opacity < 0.004 && target.opacity === 0) {
          // fully hidden: skip the draw entirely
          mat.uniforms.uOpacity.value = 0;
          if (renderer.domElement.style.visibility !== "hidden") renderer.domElement.style.visibility = "hidden";
          return;
        }
        renderer.domElement.style.visibility = "visible";

        if (t < 1) t = Math.min(1, t + dt / 1.7);
        mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 10);
        mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 10);
        mat.uniforms.uMouse.value.set(mouse.x, mouse.y);
        mat.uniforms.uT.value = t;
        mat.uniforms.uTime.value = now / 1000;
        mat.uniforms.uOpacity.value = view.opacity;

        const tiltX = mouse.tx > 5 ? 0 : mouse.ty * 0.18;
        const tiltY = mouse.tx > 5 ? 0 : mouse.tx * 0.25;
        mouse.rx += (tiltX - mouse.rx) * Math.min(1, dt * 3);
        mouse.ry += (tiltY - mouse.ry) * Math.min(1, dt * 3);
        // scroll velocity (Lenis) spins the cloud and stretches it along the scroll direction
        scrollVel += (scrollStore.velocity() - scrollVel) * Math.min(1, dt * 8);
        const sv = reduce ? 0 : scrollVel;
        group.rotation.y += dt * (reduce ? 0 : 0.14) + sv * 0.0042 + fieldSpin.v;
        fieldSpin.v *= Math.pow(0.03, dt);
        group.rotation.x = 0.2 + mouse.rx * -1 + Math.max(-0.35, Math.min(0.35, sv * 0.0016));
        group.position.x = view.x;
        group.scale.set(view.scale, view.scale * (1 + Math.min(Math.abs(sv) / 140, 0.28)), view.scale);
        camera.rotation.y = -mouse.ry * 0.2;

        renderer.render(scene, camera);
      };
      // compile the point shader off the main thread before the first frame
      const warm = typeof renderer.compileAsync === "function" ? renderer.compileAsync(scene, camera) : Promise.resolve();
      Promise.resolve(warm)
        .catch(() => undefined)
        .then(() => {
          if (disposed) return;
          last = performance.now();
          raf = requestAnimationFrame(loop);
        });

      cleanup = () => {
        fieldStore.set({ opacity: 0 }); // never leak a visible field into the next page
        cancelAnimationFrame(raf);
        running = false;
        unsub();
        ro.disconnect();
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerleave", onLeave);
        document.removeEventListener("visibilitychange", onVis);
        geo.dispose();
        mat.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
