"use client";

import { useRef } from "react";
import SectionTitle from "./section-title";
import RevealWords from "./reveal-words";
import { useFieldScene } from "./use-field-scene";

const COPY =
  "Hack United is a 501(c)(3) nonprofit. We run free hackathons and workshops for students who want to build real projects, not just pad a resume. Alongside technical work, we focus on communication, teamwork, and presenting ideas clearly, because that's what sticks after the event ends.";

export default function AboutSection() {
  const ref = useRef<HTMLElement>(null);
  useFieldScene(ref, { shape: "globe", x: 1, scale: 1, opacity: 1 });

  return (
    <section id="who-are-we" ref={ref} className="relative z-10 min-h-[100dvh] px-5 py-20 sm:px-8 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-[1500px]">
        <SectionTitle first="About" second="us" />
        <RevealWords
          text={COPY}
          className="mt-14 max-w-[24ch] font-display text-[clamp(1.55rem,3.5vw,3.1rem)] font-medium leading-[1.14] tracking-[-0.025em] text-white sm:mt-20 sm:max-w-[26ch] lg:max-w-[28ch]"
        />
      </div>
    </section>
  );
}
