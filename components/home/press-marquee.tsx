"use client";

import { useEffect, useRef } from "react";
import { pressLogos } from "@/lib/home-data";
import FieldOff from "./field-off";

const BASE_SPEED = -46; // px per second

// The single marquee on the page: it drifts on its own, but you can grab it,
// drag it, and throw it. Hovering eases it to a stop so logos can be read.
export default function PressMarquee() {
  const trackRef = useRef<HTMLUListElement>(null);
  const row = [...pressLogos, ...pressLogos];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let pos = 0;
    let vel = 0;
    let hover = false;
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let lastT = 0;
    let raf = 0;
    let last = performance.now();
    let visible = true;

    const half = () => track.scrollWidth / 2;
    const wrap = () => {
      const h = half();
      if (h > 0) pos = ((pos % h) - h) % h;
    };

    const onDown = (e: PointerEvent) => {
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      lastT = performance.now();
      track.setPointerCapture(e.pointerId);
      track.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      moved += Math.abs(dx);
      pos += dx;
      const dt = Math.max(1, now - lastT) / 1000;
      vel = vel * 0.6 + (dx / dt) * 0.4;
      lastX = e.clientX;
      lastT = now;
    };
    const onUp = () => {
      dragging = false;
      track.style.cursor = "grab";
    };
    // a drag must not count as a click on a logo link
    const onClickCapture = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const onEnter = () => (hover = true);
    const onLeave = () => (hover = false);

    track.addEventListener("pointerdown", onDown);
    track.addEventListener("pointermove", onMove);
    track.addEventListener("pointerup", onUp);
    track.addEventListener("pointercancel", onUp);
    track.addEventListener("click", onClickCapture, true);
    track.addEventListener("pointerenter", onEnter);
    track.addEventListener("pointerleave", onLeave);

    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
    });
    io.observe(track);

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!visible || dragging) return;
      const target = reduce || hover ? 0 : BASE_SPEED;
      vel += (target - vel) * (1 - Math.exp(-dt * 1.6)); // throw decays back to cruising speed
      pos += vel * dt;
      wrap();
      track.style.transform = `translate3d(${pos}px,0,0)`;
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      track.removeEventListener("pointerdown", onDown);
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerup", onUp);
      track.removeEventListener("pointercancel", onUp);
      track.removeEventListener("click", onClickCapture, true);
      track.removeEventListener("pointerenter", onEnter);
      track.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <FieldOff>
      <section aria-label="Recognized by" className="relative border-y border-white/[0.07] bg-[#050505] py-7 sm:py-8">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-6 px-5 sm:px-8 lg:flex-row lg:items-center lg:gap-12">
          <h2 className="shrink-0 font-display text-xl font-semibold tracking-[-0.03em] text-white sm:text-2xl">Recognized By</h2>
          <div className="marquee-mask relative min-w-0 flex-1 overflow-hidden">
            <ul
              ref={trackRef}
              className="flex w-max cursor-grab select-none items-center will-change-transform"
              style={{ touchAction: "pan-y" }}
            >
              {row.map((logo, i) => (
                <li key={`${logo.alt}-${i}`} aria-hidden={i >= pressLogos.length} className="flex items-center px-6 sm:px-9">
                  <a
                    href={logo.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    draggable={false}
                    tabIndex={i >= pressLogos.length ? -1 : 0}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      loading="lazy"
                      draggable={false}
                      className={`w-auto object-contain opacity-60 transition-opacity duration-300 hover:opacity-100 ${
                        logo.alt === "TechBullion" ? "h-11 sm:h-12" : "h-[72px] sm:h-[88px]"
                      }`}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </FieldOff>
  );
}
