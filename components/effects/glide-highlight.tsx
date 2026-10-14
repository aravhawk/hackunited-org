"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  radius?: number;
};

// One lavender wash that glides between whichever `[data-glide]` child is
// hovered or focused. It is positioned straight through the DOM (no React
// state), so moving across a grid never re-renders it.
export default function GlideHighlight({ children, className, radius = 14 }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const shown = useRef(false);

  const move = (target: Element | null) => {
    const r = root.current;
    const p = pill.current;
    if (!r || !p) return;
    const item = target?.closest<HTMLElement>("[data-glide]");
    if (!item || !r.contains(item)) return;
    const a = r.getBoundingClientRect();
    const b = item.getBoundingClientRect();
    if (!shown.current) {
      p.style.transition = "opacity 0.2s ease";
    } else {
      p.style.transition = "transform 0.35s cubic-bezier(0.16,1,0.3,1), width 0.35s cubic-bezier(0.16,1,0.3,1), height 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease";
    }
    p.style.transform = `translate(${b.left - a.left}px, ${b.top - a.top}px)`;
    p.style.width = `${b.width}px`;
    p.style.height = `${b.height}px`;
    p.style.opacity = "1";
    shown.current = true;
  };

  const hide = () => {
    if (pill.current) pill.current.style.opacity = "0";
    shown.current = false;
  };

  return (
    <div
      ref={root}
      className={cn("relative", className)}
      onPointerOver={(e) => move(e.target as Element)}
      onFocusCapture={(e) => move(e.target as Element)}
      onPointerLeave={hide}
      onBlurCapture={hide}
    >
      {children}
      <span
        ref={pill}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-10 bg-[#d4c4ff]/[0.09] opacity-0 ring-1 ring-inset ring-[#d4c4ff]/25"
        style={{ borderRadius: radius }}
      />
    </div>
  );
}
