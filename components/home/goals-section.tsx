"use client";

import { useEffect, useRef, useState } from "react";
import { goalPillars } from "@/lib/home-data";
import { fieldStore, type FieldShape } from "@/lib/field-store";
import SectionTitle from "./section-title";
import { useFieldScene } from "./use-field-scene";

const SHAPES: FieldShape[] = ["knot", "crystal", "galaxy"];

export default function GoalsSection() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  useFieldScene(ref, () => ({ shape: SHAPES[activeRef.current], x: -0.9, scale: 0.85, opacity: 1 }));

  const select = (i: number) => {
    activeRef.current = i;
    setActive(i);
    fieldStore.set({ shape: SHAPES[i] });
  };

  useEffect(() => {
    const rows = ref.current?.querySelectorAll<HTMLElement>("[data-goal]");
    if (!rows?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const i = Number((e.target as HTMLElement).dataset.goal);
          if (activeRef.current !== i) {
            activeRef.current = i;
            setActive(i);
            fieldStore.set({ shape: SHAPES[i] });
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    rows.forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  return (
    <section id="goals" ref={ref} className="relative z-10 border-t border-white/[0.07] px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1500px]">
        <SectionTitle first="Our" second="goals" />

        <div className="mt-8 lg:ml-[40%] lg:mt-0">
          {goalPillars.map((goal, i) => (
            <article
              key={goal.title}
              data-goal={i}
              onPointerEnter={() => select(i)}
              className="relative flex min-h-[40dvh] flex-col justify-center py-8 lg:min-h-[46dvh]"
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute -right-2 top-1/2 -translate-y-1/2 select-none font-display text-[clamp(10rem,26vw,24rem)] font-bold leading-none tracking-[-0.06em] text-transparent transition-[opacity,-webkit-text-stroke-color] duration-700 [-webkit-text-stroke:1.5px_rgba(212,196,255,0.5)] ${
                  i === active ? "opacity-[0.12] lg:opacity-[0.22]" : "opacity-[0.04] lg:opacity-[0.07]"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3
                className={`relative font-display text-[clamp(2.6rem,6.2vw,5.6rem)] font-bold leading-[0.95] tracking-[-0.035em] transition-colors duration-500 ${
                  i === active ? "text-white" : "text-white/25"
                }`}
              >
                {goal.title}
              </h3>
              <p
                className={`relative mt-6 max-w-[34rem] text-base leading-relaxed transition-[opacity,transform] duration-500 sm:text-lg ${
                  i === active ? "translate-y-0 text-neutral-300 opacity-100" : "translate-y-2 text-neutral-500 opacity-40"
                }`}
              >
                {goal.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
