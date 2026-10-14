"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useFieldScene } from "./use-field-scene";

gsap.registerPlugin(ScrollTrigger);

const ROWS = [
  { text: "Free hackathons", style: "outline", from: 4, to: -34 },
  { text: "Run by students", style: "solid", from: -38, to: 2 },
  { text: "For students worldwide", style: "accent", from: 2, to: -30 },
] as const;

// Three giant lines of type that slide sideways as you scroll past, each in its
// own direction. The motion is pure scroll position (scrubbed), not an autoplay loop.
export default function KineticBand() {
  const ref = useRef<HTMLElement>(null);
  const rows = useRef<(HTMLDivElement | null)[]>([]);
  useFieldScene(ref, { shape: "globe", x: 0, scale: 1.5, opacity: 0.5 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      rows.current.forEach((row, i) => {
        if (!row) return;
        gsap.fromTo(
          row,
          { xPercent: reduce ? ROWS[i].from : ROWS[i].from },
          {
            xPercent: reduce ? ROWS[i].from : ROWS[i].to,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.7 },
          }
        );
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      aria-label="Free hackathons, run by students, for students worldwide"
      className="relative z-10 overflow-hidden border-t border-white/[0.07] py-20 sm:py-28"
    >
      <div className="flex flex-col gap-2 sm:gap-4">
        {ROWS.map((r, i) => (
          <div
            key={r.text}
            ref={(n) => {
              rows.current[i] = n;
            }}
            aria-hidden="true"
            className="flex w-max select-none whitespace-nowrap font-display text-[clamp(4.2rem,15.5vw,15rem)] font-bold leading-[0.95] tracking-[-0.04em] will-change-transform"
          >
            {[0, 1].map((k) => (
              <span
                key={k}
                className={`pr-[0.5em] ${
                  r.style === "outline"
                    ? "text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.42)]"
                    : r.style === "accent"
                      ? "text-[#d4c4ff]"
                      : "text-white"
                }`}
              >
                {r.text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
