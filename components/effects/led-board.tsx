"use client";

import { useEffect, useRef } from "react";

type Props = { text: string; className?: string };

// Dot-matrix board: the text is lit in dim lavender, and anything you draw
// across it glows brighter and fades out slowly. Text stays in the DOM via
// aria-label so the canvas is purely decorative.
export default function LedBoard({ text, className }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cols = 0;
    let rows = 0;
    let pitch = 12;
    let dpr = 1;
    let mask = new Uint8Array(0);
    let level = new Float32Array(0);
    let raf = 0;
    let last = performance.now();
    let pointer: { x: number; y: number; px: number; py: number; down: boolean } | null = null;
    let visible = true;

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = el.clientWidth;
      const h = el.clientHeight;
      pitch = w < 560 ? 8 : 12;
      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
      cols = Math.floor(w / pitch);
      rows = Math.floor(h / pitch);
      level = new Float32Array(cols * rows);

      // rasterise the text at grid resolution to get which dots are "on"
      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const o = off.getContext("2d", { willReadFrequently: true })!;
      o.fillStyle = "#fff";
      o.textAlign = "center";
      o.textBaseline = "alphabetic";
      const family = getComputedStyle(cv).fontFamily;
      let size = rows * 0.95;
      o.font = `700 ${size}px ${family}`;
      const wText = o.measureText(text).width;
      if (wText > cols * 0.92) size *= (cols * 0.92) / wText;
      o.font = `700 ${size}px ${family}`;
      const m = o.measureText(text);
      const capH = m.actualBoundingBoxAscent;
      o.fillText(text, cols / 2, rows / 2 + capH / 2);
      const data = o.getImageData(0, 0, cols, rows).data;
      mask = new Uint8Array(cols * rows);
      for (let i = 0; i < cols * rows; i++) mask[i] = data[i * 4 + 3] > 110 ? 1 : 0;
    };

    const stamp = (x: number, y: number) => {
      const cx = x / pitch;
      const cy = y / pitch;
      const r = 3.2;
      for (let j = Math.max(0, Math.floor(cy - r)); j <= Math.min(rows - 1, Math.ceil(cy + r)); j++) {
        for (let i = Math.max(0, Math.floor(cx - r)); i <= Math.min(cols - 1, Math.ceil(cx + r)); i++) {
          const d = Math.hypot(i + 0.5 - cx, j + 0.5 - cy);
          if (d < r) level[j * cols + i] = Math.max(level[j * cols + i], 1 - d / r);
        }
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) {
        last = now;
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (pointer) {
        const steps = Math.max(1, Math.ceil(Math.hypot(pointer.x - pointer.px, pointer.y - pointer.py) / (pitch * 0.7)));
        for (let s = 1; s <= steps; s++) {
          stamp(pointer.px + ((pointer.x - pointer.px) * s) / steps, pointer.py + ((pointer.y - pointer.py) * s) / steps);
        }
        pointer.px = pointer.x;
        pointer.py = pointer.y;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      const t = now / 1000;
      const decay = Math.exp(-dt * 1.1);
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          level[k] *= decay;
          const base = mask[k] ? 0.66 + (reduce ? 0 : 0.08 * Math.sin(t * 1.4 + i * 0.35)) : 0.05;
          const v = Math.min(1, base + level[k] * 0.9);
          const rad = pitch * (0.14 + v * 0.3);
          ctx.fillStyle = `rgba(212,196,255,${(0.18 + v * 0.82).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(i * pitch + pitch / 2, j * pitch + pitch / 2, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const local = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      if (!pointer) pointer = { ...p, px: p.x, py: p.y, down: false };
      pointer.x = p.x;
      pointer.y = p.y;
    };
    const onLeave = () => {
      pointer = null;
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
    });
    io.observe(el);
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerleave", onLeave);
    cv.addEventListener("pointercancel", onLeave);
    document.fonts.ready.then(build);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerleave", onLeave);
      cv.removeEventListener("pointercancel", onLeave);
    };
  }, [text]);

  return (
    <div ref={wrap} className={className}>
      <canvas ref={canvas} role="img" aria-label={text} className="block h-full w-full touch-none font-display" />
    </div>
  );
}
