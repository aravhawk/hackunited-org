"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { editions } from "@/lib/home-data";
import { fieldStore } from "@/lib/field-store";
import ScrambleText from "./scramble-text";
import { scrollToY } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

const N = editions.length;
const GAP = 4.4;

const clamp = (v: number, a = 0, b = 1) => Math.min(Math.max(v, a), b);
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export default function ArchiveFlythrough() {
  const wrapRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const railFillRef = useRef<HTMLDivElement>(null);
  const targetP = useRef(0);
  const stRef = useRef<ScrollTrigger | null>(null);
  const reducedRef = useRef(false);
  const [active, setActive] = useState(0);
  const [glReady, setGlReady] = useState(false);
  const activeRef = useRef(0);
  activeRef.current = active;

  const goTo = useCallback((i: number) => {
    const p = i / (N - 1);
    const st = stRef.current;
    if (st && !reducedRef.current) {
      scrollToY(st.start + (st.end - st.start) * p);
    } else {
      targetP.current = p;
    }
  }, []);

  // left/right arrows step through editions while the section owns the screen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const r = wrapRef.current?.getBoundingClientRect();
      const st = stRef.current;
      const pinned = st ? st.isActive : false;
      if (!r || !(pinned || (r.top < window.innerHeight * 0.4 && r.bottom > window.innerHeight * 0.6))) return;
      const next = Math.min(N - 1, Math.max(0, activeRef.current + (e.key === "ArrowRight" ? 1 : -1)));
      if (next === activeRef.current) return;
      e.preventDefault();
      goTo(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    const mount = mountRef.current;
    if (!wrap || !stage || !mount) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;
    let cleanupNear: (() => void) | undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reducedRef.current = reduce;

    // Hide the shared particle field while this section owns the screen.
    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: wrap,
        start: "top 56px",
        end: () => `+=${Math.round(window.innerHeight * (N - 1) * 1.05)}`,
        pin: reduce ? false : stage,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (!reducedRef.current) targetP.current = self.progress;
        },
        onToggle: (self) => {
          if (self.isActive) fieldStore.set({ opacity: 0 });
        },
      });
      stRef.current = st;
    }, wrap);

    (async () => {
      // Don't pay for three.js, WebGL and 7 textures until the section is close.
      await new Promise<void>((resolve) => {
        const near = new IntersectionObserver(
          ([e]) => {
            if (e.isIntersecting) {
              near.disconnect();
              resolve();
            }
          },
          { rootMargin: "200% 0px" }
        );
        near.observe(wrap);
        cleanupNear = () => near.disconnect();
      });
      if (disposed) return;
      const THREE = await import("three");
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: (window.devicePixelRatio || 1) < 1.5,
          powerPreference: "high-performance",
        });
      } catch {
        return;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      mount.appendChild(renderer.domElement);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x050505, 0.075);
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 80);

      // Each edition is a cluster of 6 individual cards cut from its winners screenshot
      // (3 x 2 grid). Cards share one texture; only their UV window differs.
      const loader = new THREE.TextureLoader();
      const COLS = 3;
      const ROWS = 2;
      const PW = 2.7;
      const GAP_TILE = 0.07;
      // depth, entry stagger and tilt per card so the cluster feels hand-arranged
      const DEPTH = [0.1, 0.55, 0.2, 0.42, 0.02, 0.7];
      const TILT: [number, number][] = [
        [0.22, -0.4],
        [-0.15, 0.3],
        [0.3, 0.5],
        [-0.25, -0.3],
        [0.12, 0.35],
        [-0.3, -0.5],
      ];
      type Tile = {
        mesh: import("three").Mesh;
        mat: import("three").MeshBasicMaterial;
        frame: import("three").LineSegments;
        frameMat: import("three").LineBasicMaterial;
        bx: number;
        by: number;
        bz: number;
        dir: import("three").Vector3;
        order: number;
        lift: number;
      };
      type Cluster = { group: import("three").Group; tiles: Tile[]; height: number };

      const geos: import("three").BufferGeometry[] = [];
      // GPU uploads (and mipmap generation) are spread over frames, never all at once
      const uploadQueue: import("three").Texture[] = [];
      const clusters: Cluster[] = editions.map((ed, i) => {
        const group = new THREE.Group();
        group.position.set(0, 0, -i * GAP);
        scene.add(group);
        const cluster: Cluster = { group, tiles: [], height: PW * 0.75 };
        loader.load(ed.texture, (t) => {
          if (disposed) return;
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
          uploadQueue.push(t);
          const aspect = t.image.width / t.image.height;
          cluster.height = PW / aspect;
          cluster.tiles.forEach((tile, k) => {
            const col = k % COLS;
            const row = Math.floor(k / COLS);
            const tw = PW / COLS;
            const th = cluster.height / ROWS;
            tile.mesh.geometry.dispose();
            const g = new THREE.PlaneGeometry(tw - GAP_TILE, th - GAP_TILE);
            const uv = g.getAttribute("uv");
            const inset = 0.004;
            const u0 = col / COLS + inset;
            const u1 = (col + 1) / COLS - inset;
            const v1 = 1 - row / ROWS - inset;
            const v0 = 1 - (row + 1) / ROWS + inset;
            for (let n = 0; n < uv.count; n++) {
              uv.setXY(n, u0 + uv.getX(n) * (u1 - u0), v0 + uv.getY(n) * (v1 - v0));
            }
            tile.mesh.geometry = g;
            geos.push(g);
            tile.frame.geometry.dispose();
            tile.frame.geometry = new THREE.EdgesGeometry(new THREE.PlaneGeometry(tw - GAP_TILE + 0.03, th - GAP_TILE + 0.03));
            tile.bx = (col - 1) * tw;
            tile.by = ((ROWS - 1) / 2 - row) * th;
            tile.mat.map = t;
            tile.mat.color.set(0xffffff);
            tile.mat.needsUpdate = true;
          });
        });
        for (let k = 0; k < COLS * ROWS; k++) {
          const mat = new THREE.MeshBasicMaterial({ color: 0x555555, transparent: true, fog: true });
          const geo = new THREE.PlaneGeometry(PW / COLS - GAP_TILE, (PW * 0.75) / ROWS - GAP_TILE);
          geos.push(geo);
          const mesh = new THREE.Mesh(geo, mat);
          const frameMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2, fog: true });
          const frame = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.PlaneGeometry(PW / COLS - GAP_TILE + 0.03, (PW * 0.75) / ROWS - GAP_TILE + 0.03)),
            frameMat
          );
          mesh.add(frame);
          group.add(mesh);
          const col = k % COLS;
          const row = Math.floor(k / COLS);
          const tw = PW / COLS;
          const th = (PW * 0.75) / ROWS;
          const bx = (col - 1) * tw;
          const by = ((ROWS - 1) / 2 - row) * th;
          const dir = new THREE.Vector3(bx * 1.2 + (col - 1) * 0.6, by * 1.2 + (row === 0 ? 0.5 : -0.5), -2.2 - k * 0.15).normalize();
          cluster.tiles.push({ mesh, mat, frame, frameMat, bx, by, bz: DEPTH[k], dir, order: k / 5, lift: 0 });
        }
        return cluster;
      });

      // Dust that sells the speed of the flight
      const DUST = 1800;
      const dustPos = new Float32Array(DUST * 3);
      for (let i = 0; i < DUST; i++) {
        dustPos[i * 3] = (Math.random() - 0.5) * 16;
        dustPos[i * 3 + 1] = (Math.random() - 0.5) * 9;
        dustPos[i * 3 + 2] = 8 - Math.random() * (N * GAP + 20);
      }
      const dustGeo = new THREE.BufferGeometry();
      dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
      const dust = new THREE.Points(
        dustGeo,
        new THREE.PointsMaterial({ color: 0xc9cdd8, size: 0.028, transparent: true, opacity: 0.75, fog: true, depthWrite: false })
      );
      scene.add(dust);

      let dist = 4.6;
      let baseFov = 40;
      let clusterScale = 1;
      let shiftX = 1.1;
      let shiftY = 0;
      const resize = () => {
        const w = mount.clientWidth || window.innerWidth;
        const h = mount.clientHeight || window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        const narrow = camera.aspect < 0.95;
        dist = narrow ? 9 : 4.6;
        (scene.fog as import("three").FogExp2).density = narrow ? 0.045 : 0.075;
        baseFov = narrow ? 44 : 40;
        camera.fov = baseFov;
        camera.updateProjectionMatrix();
        const halfW = Math.tan((camera.fov * Math.PI) / 360) * dist * camera.aspect;
        shiftX = narrow ? 0 : halfW * 0.37;
        shiftY = narrow ? 1.8 : 0;
        clusterScale = narrow ? 0.9 : 1;
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(mount);

      const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      let pointerIn = false;
      const onMove = (e: PointerEvent) => {
        mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
        const r = mount.getBoundingClientRect();
        pointerIn = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      let p = targetP.current;
      let lastIdx = -1;
      let raf = 0;
      let last = performance.now();
      let visible = false;
      const io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
        },
        { rootMargin: "20% 0px" }
      );
      io.observe(wrap);

      const loop = (now: number) => {
        if (disposed) return;
        raf = requestAnimationFrame(loop);
        if (!visible || document.hidden) {
          last = now;
          return;
        }
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;

        const pending = uploadQueue.shift();
        if (pending) renderer.initTexture(pending);

        p += (targetP.current - p) * (reduce ? 1 : 1 - Math.pow(0.0009, dt));
        mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 5);
        mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 5);

        // each edition gets a dwell: the camera holds, then glides to the next one
        const u = clamp(p) * (N - 1);
        const base = Math.min(Math.floor(u), N - 2);
        const sGlide = smooth(0.28, 0.72, u - base);
        const eased = base + sGlide;
        const pe = clamp(u >= N - 1 ? 1 : eased / (N - 1));
        const camZ = dist - pe * (N - 1) * GAP;

        // travel feel: FOV punch and a small roll while the camera glides between editions
        const bump = u >= N - 1 || u <= 0 ? 0 : Math.sin(Math.PI * sGlide);
        const fov = baseFov + bump * 15;
        if (Math.abs(camera.fov - fov) > 0.02) {
          camera.fov = fov;
          camera.updateProjectionMatrix();
        }
        camera.position.set(mouse.x * 0.22, mouse.y * 0.12, camZ);
        camera.rotation.set(mouse.y * 0.025, -mouse.x * 0.04, bump * 0.075 * (base % 2 === 0 ? 1 : -1));

        const activeEd = Math.round(pe * (N - 1));
        // hover: ray against the cards of the edition in front of the camera
        let hovered: Tile | null = null;
        if (pointerIn && !reduce) {
          raycaster.setFromCamera(ndc, camera);
          const hits = raycaster.intersectObjects(clusters[activeEd].tiles.map((t) => t.mesh), false);
          if (hits.length) hovered = clusters[activeEd].tiles.find((t) => t.mesh === hits[0].object) ?? null;
        }
        mount.style.cursor = hovered ? "pointer" : "";

        clusters.forEach((cl, i) => {
          const z = -i * GAP;
          const d = camZ - z; // distance in front of the camera
          const emph = 1 - clamp(Math.abs(d - dist) / GAP);
          const e = emph * emph * (3 - 2 * emph);
          const fadeNear = smooth(dist - GAP * 0.62, dist - GAP * 0.12, d);
          const passed = Math.max(0, dist - d);
          const fadeFar = 1 - smooth(GAP * 3.2, GAP * 4.4, d);
          const vis = fadeNear * fadeFar;
          const lean = i % 2 === 0 ? 0.5 : -0.5;

          cl.group.position.x = shiftX + lean * passed * 1.1;
          cl.group.position.y = shiftY;
          cl.group.scale.setScalar(clusterScale);
          cl.group.rotation.y = (-0.3 + mouse.x * 0.18) * e;
          cl.group.rotation.x = mouse.y * -0.08 * e;

          cl.tiles.forEach((t, k) => {
            // cards assemble from deep and wide as the camera arrives, staggered
            const te = reduce ? 1 : smooth(t.order * 0.35, 1, e);
            const ex = 1 - te;
            const isHover = hovered === t;
            t.lift += ((isHover ? 1 : 0) - t.lift) * Math.min(1, dt * 10);
            const par = mouse.x * 0.14 * t.bz * e;
            t.mesh.position.set(
              t.bx + t.dir.x * ex * 3.2 + par,
              t.by + t.dir.y * ex * 2.4 + mouse.y * 0.09 * t.bz * e,
              t.bz * e + t.dir.z * ex * 5.5 + t.lift * 0.28
            );
            t.mesh.rotation.set(TILT[k][0] * ex + mouse.y * -0.06 * e, TILT[k][1] * ex + mouse.x * 0.05 * e, TILT[k][0] * 0.5 * ex);
            t.mesh.scale.setScalar(0.94 + 0.06 * e + t.lift * 0.05);
            t.mat.opacity = vis * (0.2 + 0.8 * te);
            const b = 0.34 + 0.66 * e;
            if (t.mat.map) t.mat.color.setScalar(b);
            t.frameMat.opacity = (0.1 + 0.5 * e + t.lift * 0.4) * vis;
            const lv = Math.min(1, e * 0.7 + t.lift);
            t.frameMat.color.setRGB(1 - 0.17 * lv, 1 - 0.23 * lv, 1);
          });
        });

        renderer.render(scene, camera);

        const idx = activeEd;
        if (idx !== lastIdx) {
          lastIdx = idx;
          setActive(idx);
        }
        if (railFillRef.current) railFillRef.current.style.transform = `scaleY(${pe})`;
      };
      raf = requestAnimationFrame(loop);
      setGlReady(true);

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("pointermove", onMove);
        clusters.forEach((cl) =>
          cl.tiles.forEach((t) => {
            t.mat.dispose();
            t.frame.geometry.dispose();
            t.frameMat.dispose();
          })
        );
        clusters.forEach((cl) => cl.tiles[0]?.mat.map?.dispose());
        geos.forEach((g) => g.dispose());
        dustGeo.dispose();
        (dust.material as import("three").Material).dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanupNear?.();
      ctx.revert();
      stRef.current = null;
      cleanup?.();
    };
  }, []);

  return (
    <section id="archive" ref={wrapRef} className="relative z-10 bg-[#050505]">
      <div ref={stageRef} className="relative h-[calc(100dvh-56px)] min-h-[600px] w-full overflow-hidden">
        {/* soft fallback image so the section never reads empty without WebGL */}
        {!glReady && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={editions[active].image}
            alt={editions[active].imageAlt}
            className="absolute right-[6%] top-1/2 hidden w-[42%] -translate-y-1/2 border border-white/10 object-cover opacity-70 lg:block"
          />
        )}
        <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />

        {/* oversized outlined edition numeral behind the info card */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 mx-auto max-w-[1500px] overflow-hidden px-5 sm:px-8">
          {editions.map((ed, i) => (
            <span
              key={ed.id}
              className={`absolute bottom-[-4%] right-[2%] select-none font-display text-[clamp(14rem,34vw,34rem)] font-bold leading-[0.8] tracking-[-0.06em] text-transparent transition-opacity duration-500 [-webkit-text-stroke:1.5px_rgba(212,196,255,0.28)] ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
            >
              {ed.id.toUpperCase()}
            </span>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-[1500px] flex-col justify-between px-5 pb-6 pt-8 sm:px-8 lg:pb-10 lg:pt-12">
          <h2 className="font-display text-[clamp(2rem,7.2vw,6.4rem)] font-bold leading-[0.92] tracking-[-0.035em] text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.75)]">
            <ScrambleText text="Previous" />
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            <ScrambleText text="hackathons" className="text-[#d4c4ff]" delay={0.25} />
          </h2>

          <div className="relative flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
            <div className="pointer-events-auto relative w-full max-w-[520px]" aria-live="polite">
              <div className="grid">
                {editions.map((ed, i) => (
                  <article
                    key={ed.id}
                    inert={i !== active}
                    aria-hidden={i !== active}
                    className={`col-start-1 row-start-1 flex flex-col self-stretch rounded-[14px] border border-white/10 bg-[#0a0a0c]/95 p-4 transition-[opacity,transform] ease-out sm:p-6 ${
                      i === active
                        ? "translate-y-0 opacity-100 duration-500 delay-150"
                        : "pointer-events-none translate-y-3 opacity-0 duration-200"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-display text-2xl font-bold tracking-[-0.03em] text-white sm:text-3xl">{ed.name}</h3>
                      <span className="shrink-0 font-mono text-xs text-neutral-400">{ed.date}</span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-[#d4c4ff]">{ed.theme} theme</p>
                    <p className="mb-3 mt-2 text-[13px] leading-relaxed text-neutral-300 sm:mb-4 sm:mt-3 sm:text-sm">{ed.blurb}</p>

                    <dl className="mt-auto grid grid-cols-3 gap-x-3 gap-y-2 border-t border-white/10 pt-3 sm:gap-x-4 sm:gap-y-3 sm:pt-4">
                      {ed.stats.map((s) => (
                        <div key={s.label} className="flex flex-col-reverse">
                          <dt className="text-[11px] leading-tight text-neutral-400">{s.label}</dt>
                          <dd className="font-mono text-base font-medium text-white sm:text-lg">{s.value}</dd>
                        </div>
                      ))}
                    </dl>

                    {ed.note && (
                      <p className="mt-3 text-xs text-neutral-400">
                        <span className="text-white">{ed.note.title}.</span> {ed.note.detail}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
                      {ed.recap && (
                        <a
                          href={ed.recap}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-semibold text-black transition-transform duration-200 hover:-translate-y-px active:scale-[0.97]"
                        >
                          Article Recap
                          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                      )}
                      <a
                        href={ed.devpost}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex h-9 items-center gap-1.5 rounded-full border border-white/25 px-4 text-[13px] font-semibold text-white transition-colors duration-200 hover:border-[#d4c4ff] hover:text-[#d4c4ff] active:scale-[0.97]"
                      >
                        DEVPOST
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <nav
              aria-label="Hackathon editions"
              className="pointer-events-auto order-first flex flex-row items-center justify-between rounded-full border border-white/10 bg-[#050505]/90 px-2 lg:order-none lg:flex-col lg:items-end lg:px-0 lg:py-2"
            >
              <div className="relative hidden h-[220px] w-px bg-white/15 lg:absolute lg:right-[22px] lg:top-1/2 lg:block lg:h-[200px] lg:-translate-y-1/2">
                <div ref={railFillRef} className="h-full w-full origin-top bg-[#d4c4ff]" style={{ transform: "scaleY(0)" }} />
              </div>
              {editions.map((ed, i) => (
                <button
                  key={ed.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to ${ed.name}`}
                  aria-current={i === active}
                  className={`relative z-10 flex h-10 flex-1 items-center justify-center gap-2 font-mono text-xs transition-colors duration-200 lg:w-14 lg:flex-none lg:justify-end ${
                    i === active ? "text-white" : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <span className="lg:order-1">{ed.id.toUpperCase()}</span>
                  <span
                    className={`hidden h-2 w-2 rounded-full border transition-all duration-300 lg:block ${
                      i === active ? "scale-125 border-[#d4c4ff] bg-[#d4c4ff]" : "border-white/30 bg-[#050505]"
                    }`}
                  />
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
