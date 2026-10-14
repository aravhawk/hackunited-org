"use client";

import { useRef } from "react";
import { useFieldScene } from "./use-field-scene";

// Invisible marker: hides the particle field while the wrapped section is on screen.
export default function FieldOff({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useFieldScene(ref, { opacity: 0 });
  return (
    <div ref={ref} id={id} className={className}>
      {children}
    </div>
  );
}
