"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import FieldOff from "./field-off";
import Magnetic from "@/components/effects/magnetic";
import { NEXT_HACKATHON } from "@/lib/next-hackathon";

const WORD = "Discord".split("");
const CHANNELS = ["Help channels", "Announcements", "Team chat during hackathons"];

// Giant word whose letters swell (variable-font weight + width) as the pointer nears them.
function ProximityWord() {
  const root = useRef<HTMLHeadingElement>(null);

  const frame = useRef(0);
  const pos = useRef({ x: 0, y: 0 });
  const letters = useRef<{ el: HTMLElement; cx: number; cy: number }[]>([]);

  const measure = () => {
    letters.current = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-l]") ?? []).map((el) => {
      const r = el.getBoundingClientRect();
      return { el, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    });
  };

  const move = (e: React.PointerEvent) => {
    pos.current = { x: e.clientX, y: e.clientY };
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const { x, y } = pos.current;
      for (const l of letters.current) {
        const d = Math.hypot(x - l.cx, (y - l.cy) * 0.5);
        const k = Math.max(0, 1 - d / 320);
        l.el.style.fontVariationSettings = `"wght" ${Math.round(640 + k * 160)}, "wdth" 100`;
        l.el.style.color = k > 0.04 ? `color-mix(in srgb, #d4c4ff ${Math.round(k * 100)}%, #ffffff)` : "";
        l.el.style.transform = `translateY(${(-k * 14).toFixed(1)}px)`;
      }
    });
  };
  const reset = () =>
    root.current?.querySelectorAll<HTMLElement>("[data-l]").forEach((el) => {
      el.style.fontVariationSettings = "";
      el.style.color = "";
      el.style.transform = "";
    });

  return (
    <h2
      ref={root}
      aria-label="Discord"
      onPointerEnter={measure}
      onPointerMove={move}
      onPointerLeave={reset}
      className="flex w-full select-none justify-between font-display text-[clamp(4rem,24.5vw,23rem)] font-bold leading-[0.85] tracking-[-0.04em] text-white"
    >
      {WORD.map((c, i) => (
        <span
          key={i}
          data-l
          aria-hidden="true"
          className="inline-block transition-[font-variation-settings,color,transform] duration-300 ease-out"
          style={{ fontVariationSettings: '"wght" 640, "wdth" 100' }}
        >
          {c}
        </span>
      ))}
    </h2>
  );
}

type Counts = { online: number; members: number };

export default function DiscordSection() {
  const [counts, setCounts] = useState<Counts | null>(null);

  // Public invite endpoint: only shown if it answers, never invented.
  useEffect(() => {
    let alive = true;
    fetch("https://discord.com/api/v9/invites/hackunited?with_counts=true")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.approximate_presence_count && d?.approximate_member_count) {
          setCounts({ online: d.approximate_presence_count, members: d.approximate_member_count });
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <FieldOff>
      <section id="discord" className="relative z-10 overflow-hidden border-t border-white/[0.07] bg-[#050505] px-5 pb-24 pt-20 sm:px-8 sm:pb-32 sm:pt-28">
        <div className="mx-auto max-w-[1500px]">
          <ProximityWord />

          <div className="mt-12 grid gap-10 sm:mt-16 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="max-w-lg text-base leading-relaxed text-neutral-400 sm:text-lg">
                Most coordination happens here: help channels, announcements, and team chat during hackathons.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {CHANNELS.map((c) => (
                  <li key={c} className="rounded-full border border-white/[0.12] px-4 py-2 font-mono text-xs text-neutral-300">
                    {c}
                  </li>
                ))}
              </ul>
              {counts && (
                <p className="mt-6 font-mono text-sm text-neutral-300">
                  <span className="text-[#d4c4ff]">{counts.online.toLocaleString("en-US")}</span> online now
                  <span className="mx-3 text-neutral-600">/</span>
                  {counts.members.toLocaleString("en-US")} members
                </p>
              )}
            </div>

            <Magnetic>
              <a
                href={NEXT_HACKATHON.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-16 items-center justify-center gap-3 rounded-full bg-[#d4c4ff] px-10 text-lg font-semibold text-[#0b0813] transition-[transform,background-color] duration-200 hover:bg-white active:scale-[0.98]"
              >
                Join the Discord
                <ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </Magnetic>
          </div>
        </div>
      </section>
    </FieldOff>
  );
}
