"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollStore } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

// Inertial smooth scrolling for mouse/trackpad users, driven by GSAP's ticker so
// ScrollTrigger pins and scrubs stay frame-perfect. Touch devices and users who
// prefer reduced motion keep native scrolling.
export default function SmoothScroll() {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.95,
      smoothWheel: true,
    });
    scrollStore.set(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    // Headings lean into the scroll direction. Written straight to the few visible
    // elements (never to :root), so a scroll frame doesn't restyle the whole document.
    const tracked = new Set<HTMLElement>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement;
        if (e.isIntersecting) tracked.add(el);
        else {
          tracked.delete(el);
          el.style.transform = "";
        }
      }
    });
    const observed = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll<HTMLElement>(".skew-scroll").forEach((el) => {
        if (!observed.has(el)) {
          observed.add(el);
          io.observe(el);
        }
      });
    };
    scan();
    const scanId = setInterval(scan, 1500);

    let skew = 0;
    let applied = 0;
    const tick = (time: number) => {
      lenis.raf(time * 1000);
      skew += (Math.max(-7, Math.min(7, lenis.velocity * 0.16)) - skew) * 0.18;
      const v = Math.abs(skew) < 0.02 ? 0 : Math.round(skew * 20) / 20;
      if (v === applied || document.documentElement.dataset.gravity) return;
      applied = v;
      const t = v === 0 ? "" : `skewY(${v}deg)`;
      tracked.forEach((el) => (el.style.transform = t));
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // let anchor links and hash jumps use Lenis too
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")!.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { duration: 1.4 });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      clearInterval(scanId);
      io.disconnect();
      tracked.forEach((el) => (el.style.transform = ""));
      scrollStore.set(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
