"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Magnetic from "@/components/effects/magnetic";
import { NEXT_HACKATHON, parts, phaseAt } from "@/lib/next-hackathon";
import { scrollToId } from "@/lib/scroll";
import FieldOff from "./field-off";

const two = (n: number) => String(n).padStart(2, "0");

// Full-width lavender colour block right under the hero: the next hackathon, live
// countdown, and a way to register, so the conversion is never buried.
export default function V8Strip() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const phase = now === null ? null : phaseAt(now);
  const left = now === null ? null : parts(NEXT_HACKATHON.start.getTime() - now);

  return (
    <FieldOff>
      <section aria-label="Next hackathon" className="relative z-10 bg-[#d4c4ff] text-[#0b0813]">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-5 py-6 sm:px-8 md:flex-row md:items-center md:justify-between md:gap-10 md:py-7">
          <div className="min-w-0">
            <p className="font-display text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
              {NEXT_HACKATHON.name}
              <span className="ml-3 font-mono text-sm font-medium tracking-normal opacity-70 sm:text-base">{NEXT_HACKATHON.dateLine}</span>
            </p>
            <p className="mt-1 font-mono text-xs opacity-70 sm:text-sm">{NEXT_HACKATHON.facts.join(" / ")} / {NEXT_HACKATHON.prizes}</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 md:justify-end md:gap-10">
            {phase === "upcoming" && left && (
              <p className="whitespace-nowrap font-mono text-xl font-medium tabular-nums sm:text-3xl" role="timer" aria-label="Time until V8 opens">
                {left.days}d {two(left.hours)}h {two(left.minutes)}m {two(left.seconds)}s
              </p>
            )}
            {phase === "live" && <p className="font-display text-2xl font-bold tracking-[-0.03em]">Happening now</p>}
            <Magnetic>
              <a
                href={phase === "over" ? NEXT_HACKATHON.siteUrl : NEXT_HACKATHON.registerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#0b0813] px-6 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Register
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </Magnetic>
            <button
              type="button"
              onClick={() => scrollToId("next")}
              className="hidden text-sm font-semibold underline decoration-[#0b0813]/40 underline-offset-4 transition-colors hover:decoration-[#0b0813] lg:inline"
            >
              Claim your badge
            </button>
          </div>
        </div>
      </section>
    </FieldOff>
  );
}
