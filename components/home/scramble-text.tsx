"use client";

import { useEffect, useRef } from "react";

const GLYPHS = "01<>/\\{}[]_=+*#";

type Props = {
  text: string;
  className?: string;
  /** seconds to wait after the element enters view */
  delay?: number;
};

// Headline that "decodes" into place once when it scrolls into view.
// The real text is always in the DOM (SSR, screen readers, reduced motion).
export default function ScrambleText({ text, className, delay = 0 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let timeout: ReturnType<typeof setTimeout>;
    const chars = text.split("");

    const run = () => {
      const start = performance.now();
      const duration = 700 + chars.length * 45;
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const settled = Math.floor(t * chars.length);
        el.textContent = chars
          .map((c, i) => (c === " " || i < settled ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join("");
        if (t < 1) raf = requestAnimationFrame(tick);
        else el.textContent = text;
      };
      raf = requestAnimationFrame(tick);
    };

    // start scrambled only once we know the element is going to be seen
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        el.textContent = chars.map((c) => (c === " " ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join("");
        timeout = setTimeout(run, delay * 1000);
      },
      { threshold: 0.6 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
      el.textContent = text;
    };
  }, [text, delay]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {text}
    </span>
  );
}
