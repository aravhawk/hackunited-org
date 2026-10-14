"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement> & { as?: "div" | "a" } & React.AnchorHTMLAttributes<HTMLAnchorElement>;

// Panel whose border + surface light up under the pointer. Position is written
// to CSS variables directly so hovering never re-renders React.
export default function Spotlight({ className, children, as = "div", ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const Tag = as as React.ElementType;
  return (
    <Tag ref={ref} onPointerMove={onMove} className={cn("spotlight", className)} {...rest}>
      {children}
    </Tag>
  );
}
