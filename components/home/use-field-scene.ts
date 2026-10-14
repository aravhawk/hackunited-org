"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fieldStore, type FieldState } from "@/lib/field-store";

gsap.registerPlugin(ScrollTrigger);

// While `ref` is the section nearest the middle of the screen, push `scene`
// into the shared particle field.
export function useFieldScene(ref: RefObject<HTMLElement | null>, scene: Partial<FieldState> | (() => Partial<FieldState>)) {
  const sceneRef = useRef(scene);
  sceneRef.current = scene;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      const s = sceneRef.current;
      fieldStore.set(typeof s === "function" ? s() : s);
    };
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 60%",
      end: "bottom 60%",
      onToggle: (self) => {
        if (self.isActive) apply();
      },
    });
    if (st.isActive) apply();
    return () => st.kill();
  }, [ref]);
}
