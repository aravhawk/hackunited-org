import type Lenis from "lenis";

// Shared handle on the smooth-scroll instance (null on touch / reduced motion).
let instance: Lenis | null = null;

export const scrollStore = {
  set(l: Lenis | null) {
    instance = l;
  },
  get: () => instance,
  /** Signed scroll velocity in px/frame-ish units; 0 when smooth scroll is off. */
  velocity: () => instance?.velocity ?? 0,
};

/** Scroll to an element id, using Lenis when active so the two never fight. */
export function scrollToId(id: string, offset = 0) {
  const el = document.getElementById(id);
  if (!el) return;
  if (instance) instance.scrollTo(el, { offset, duration: 1.4 });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Scroll to an absolute Y position. */
export function scrollToY(y: number) {
  if (instance) instance.scrollTo(y, { duration: 1.6 });
  else window.scrollTo({ top: y, behavior: "smooth" });
}
