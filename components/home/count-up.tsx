"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Props = { value: number; suffix?: string; className?: string };

// Counts up once when scrolled into view. Final value is in the DOM from the start.
export default function CountUp({ value, suffix = "", className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const fmt = (n: number) => Math.round(n).toLocaleString("en-US") + suffix;
    const state = { n: 0 };
    el.textContent = fmt(0);

    const tween = gsap.to(state, {
      n: value,
      duration: 2.2,
      ease: "power3.out",
      paused: true,
      onUpdate: () => {
        el.textContent = fmt(state.n);
      },
    });
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => tween.play(),
    });

    return () => {
      st.kill();
      tween.kill();
      el.textContent = fmt(value);
    };
  }, [value, suffix]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
