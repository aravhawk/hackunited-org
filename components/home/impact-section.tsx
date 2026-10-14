"use client";

import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { impactHighlights } from "@/lib/home-data";
import SectionTitle from "./section-title";
import CountUp from "./count-up";
import Spotlight from "./spotlight";
import { useFieldScene } from "./use-field-scene";
import { fieldSpin } from "@/lib/field-store";

export default function ImpactSection() {
  const ref = useRef<HTMLElement>(null);
  useFieldScene(ref, { shape: "globe", x: 1, scale: 1.12, opacity: 1 });
  const [lead, ...rest] = impactHighlights;

  return (
    <section id="impact" ref={ref} className="relative z-10 border-t border-white/[0.07] px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1500px]">
        <SectionTitle first="Our" second="impact" />

        <div className="relative mx-auto mt-10 aspect-square w-[min(88vw,520px)] lg:absolute lg:right-0 lg:top-4 lg:mx-0 lg:mt-0 lg:w-[min(46vw,640px)]">
          {/* Invisible grab layer: dragging here spins the particle Earth behind it. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 cursor-grab touch-pan-y select-none active:cursor-grabbing"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              e.currentTarget.dataset.x = String(e.clientX);
            }}
            onPointerMove={(e) => {
              const el = e.currentTarget;
              if (!el.hasPointerCapture(e.pointerId)) return;
              const last = Number(el.dataset.x ?? e.clientX);
              fieldSpin.v += (e.clientX - last) * 0.0026;
              el.dataset.x = String(e.clientX);
            }}
          />
        </div>

        <div className="mt-10 sm:mt-24 lg:mt-24">
          <p className="font-display text-[clamp(4.2rem,13.2vw,13rem)] font-bold leading-[0.85] tracking-[-0.035em] text-white tabular-nums">
            <CountUp value={lead.value} suffix={lead.suffix} />
          </p>
          <h3 className="mt-5 font-display text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">{lead.label}</h3>
          <p className="mt-2 max-w-md text-base leading-relaxed text-neutral-400">{lead.detail}</p>
        </div>

        <div className="gravity-hide-bg mt-16 grid gap-px overflow-hidden rounded-[14px] border border-white/10 bg-white/10 sm:mt-24 md:grid-cols-[1fr_1fr_1.35fr]">
          {rest.map((item) => (
            <Spotlight key={item.label} data-fall className="flex min-h-[190px] flex-col justify-between md:min-h-[260px] bg-[#070708] p-7 sm:p-9">
              <p className="font-display text-[clamp(3rem,6vw,5.5rem)] font-bold leading-none tracking-[-0.04em] text-white tabular-nums">
                <CountUp value={item.value} suffix={item.suffix} />
              </p>
              <div>
                <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-white">{item.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">{item.detail}</p>
              </div>
            </Spotlight>
          ))}
          <Spotlight
            as="a"
            href="https://fund.hackunited.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex min-h-[190px] flex-col justify-between md:min-h-[260px] bg-[#d4c4ff] p-7 text-[#0b0813] sm:p-9"
          >
            <p className="font-display text-[clamp(3rem,6vw,5.5rem)] font-bold leading-none tracking-[-0.04em]">Fund</p>
            <div className="pt-8">
              <h3 className="font-display text-xl font-semibold tracking-[-0.02em]">United Fund</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#0b0813]/75">
                Small grants ($50-$500) so student projects can ship past the prototype.
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold">
                Learn more
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </span>
            </div>
          </Spotlight>
        </div>
      </div>
    </section>
  );
}
