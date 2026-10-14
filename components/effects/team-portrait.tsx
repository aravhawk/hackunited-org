"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import HalftoneReveal from "./halftone-reveal";

let webgl2: boolean | null = null;
const supportsWebGL2 = () => {
  if (webgl2 === null) {
    try {
      const gl = document.createElement("canvas").getContext("webgl2");
      webgl2 = !!gl;
      gl?.getExtension("WEBGL_lose_context")?.loseContext(); // don't hold a context just for the probe
    } catch {
      webgl2 = false;
    }
  }
  return webgl2;
};

// WebGL contexts are expensive to create and browsers cap them (~16), so portraits
// take a turn: one new context per idle slot (at least 140ms apart), and at most MAX_LIVE at once.
const MAX_LIVE = 8;
let liveCount = 0;
const waiting: (() => void)[] = [];
let pumping = false;
const idle = (fn: () => void) =>
  typeof window !== "undefined" && window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout: 400 }) : setTimeout(fn, 60);
function pump() {
  if (pumping) return;
  pumping = true;
  const step = () => {
    if (liveCount < MAX_LIVE && waiting.length) {
      liveCount++;
      waiting.shift()!();
      setTimeout(() => idle(step), 140);
    } else if (waiting.length) setTimeout(() => idle(step), 250);
    else pumping = false;
  };
  idle(step);
}

// Portrait that rests as a lavender halftone print and develops into the real
// photo under the pointer. The WebGL canvas only exists while the portrait is
// on screen (browsers cap live contexts), and the plain <img> is always there
// as the accessible / reduced-motion / no-WebGL fallback.
export default function TeamPortrait({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !supportsWebGL2()) return;
    let holding = false;
    let queued: (() => void) | null = null;
    const release = () => {
      if (holding) {
        holding = false;
        liveCount = Math.max(0, liveCount - 1);
      }
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          queued = () => {
            holding = true;
            setLive(true);
          };
          waiting.push(queued);
          pump();
        } else {
          const i = queued ? waiting.indexOf(queued) : -1;
          if (i >= 0) waiting.splice(i, 1);
          queued = null;
          setLive(false);
          release();
        }
      },
      { rootMargin: "80px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      const i = queued ? waiting.indexOf(queued) : -1;
      if (i >= 0) waiting.splice(i, 1);
      release();
    };
  }, []);

  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  return (
    <div ref={ref} className="absolute inset-0">
      <Image src={src} alt={alt} fill className="object-cover" sizes="160px" />
      {live && (
        <div className="absolute inset-0">
          <HalftoneReveal
            src={src}
            fit="cover"
            mode="mono"
            shape="dot"
            invert
            cellSize={5}
            angle={35}
            contrast={1.25}
            brightness={-0.1}
            inkColor="#d4c4ff"
            paperColor="#0a0a0c"
            revealRadius={90}
            softness={0.7}
            linger={1.6}
            wander={coarse}
            clickBurst
          />
        </div>
      )}
    </div>
  );
}
