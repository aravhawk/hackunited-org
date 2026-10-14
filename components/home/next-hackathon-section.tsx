"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight, Download } from "lucide-react";
import { NEXT_HACKATHON, parts, phaseAt, type HackathonPhase } from "@/lib/next-hackathon";
import { drawBack, drawFront, drawStrap } from "@/lib/badge";
import { useFieldScene } from "./use-field-scene";
import ScrambleText from "./scramble-text";
import Magnetic from "@/components/effects/magnetic";

// three.js only loads when this section is near the viewport
const Lanyard = dynamic(() => import("@/components/effects/lanyard"), { ssr: false, loading: () => null });

const pad = (n: number) => String(n).padStart(2, "0");

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col">
      <div className="relative h-[clamp(3.6rem,9.4vw,8.4rem)] overflow-hidden">
        <span
          key={value}
          className="countdown-roll block font-display text-[clamp(3.6rem,9.4vw,8.4rem)] font-bold leading-none tracking-[-0.04em] text-white tabular-nums"
        >
          {pad(value)}
        </span>
      </div>
      <span className="mt-2 font-mono text-[11px] text-neutral-400 sm:text-xs">{label}</span>
    </div>
  );
}

export default function NextHackathonSection() {
  const ref = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [art, setArt] = useState<{ front?: string; back?: string; strap?: string }>({});
  const famRef = useRef<{ display: string; mono: string } | null>(null);
  const displayProbe = useRef<HTMLSpanElement>(null);
  const monoProbe = useRef<HTMLSpanElement>(null);

  useFieldScene(ref, { shape: "galaxy", x: 1, scale: 1.25, opacity: 0.55 });

  // live countdown
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // only mount the 3D badge once the section is close
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Warm up well before arrival (WebGL context + shader compile are the expensive part),
    // and only when the browser is idle so it never lands in the middle of a scroll frame.
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        if (window.requestIdleCallback) window.requestIdleCallback(() => setNear(true), { timeout: 1500 });
        else setTimeout(() => setNear(true), 300);
      },
      { rootMargin: "2200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const families = useCallback(async () => {
    if (famRef.current) return famRef.current;
    await document.fonts.ready;
    const d = displayProbe.current ? getComputedStyle(displayProbe.current).fontFamily : "sans-serif";
    const m = monoProbe.current ? getComputedStyle(monoProbe.current).fontFamily : "monospace";
    famRef.current = { display: d, mono: m };
    return famRef.current;
  }, []);

  // Canvas -> object URL via toBlob: PNG encoding happens off the main thread
  // (toDataURL would block it for each of the three images).
  const toUrl = (cv: HTMLCanvasElement) =>
    new Promise<string>((resolve) => cv.toBlob((b) => resolve(b ? URL.createObjectURL(b) : cv.toDataURL("image/png")), "image/png"));
  const urls = useRef<string[]>([]);
  useEffect(
    () => () => {
      urls.current.forEach((u) => u.startsWith("blob:") && URL.revokeObjectURL(u));
    },
    []
  );

  // back + strap once, front whenever the name changes (debounced)
  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    (async () => {
      const fam = await families();
      const [back, strap] = await Promise.all([drawBack(fam).then(toUrl), toUrl(drawStrap(fam))]);
      urls.current.push(back, strap);
      if (!cancelled) setArt((a) => ({ ...a, back, strap }));
    })();
    return () => {
      cancelled = true;
    };
  }, [near, families]);

  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      const fam = await families();
      const front = await toUrl(await drawFront(name, fam));
      urls.current.push(front);
      if (!cancelled) {
        setArt((a) => {
          if (a.front?.startsWith("blob:")) setTimeout(() => URL.revokeObjectURL(a.front!), 4000);
          return { ...a, front };
        });
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [near, name, families]);

  const download = async () => {
    const fam = await families();
    const cv = await drawFront(name, fam);
    cv.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "hack-united-v8-badge.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  };

  const phase: HackathonPhase | null = now === null ? null : phaseAt(now);
  const left = now === null ? null : parts(NEXT_HACKATHON.start.getTime() - now);

  return (
    <section
      id="next"
      ref={ref}
      className="relative z-10 border-t border-white/[0.07] px-5 py-24 sm:px-8 sm:py-32"
    >
      {/* font probes so the canvas artwork uses the site's real typefaces */}
      <span ref={displayProbe} aria-hidden="true" className="pointer-events-none absolute opacity-0 font-display">
        .
      </span>
      <span ref={monoProbe} aria-hidden="true" className="pointer-events-none absolute opacity-0 font-mono">
        .
      </span>

      <div className="mx-auto grid max-w-[1500px] items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div>
          <p className="font-mono text-xs text-[#d4c4ff] sm:text-sm">Next hackathon</p>
          <h2 className="mt-5 font-display text-[clamp(3.2rem,9vw,8.2rem)] font-bold leading-[0.9] tracking-[-0.04em] text-white">
            <ScrambleText text="United Hacks" />
            <br />
            <ScrambleText text="V8" className="text-[#d4c4ff]" delay={0.2} />
          </h2>

          <p className="mt-6 flex flex-wrap gap-x-5 gap-y-1 font-mono text-sm text-neutral-300">
            <span>{NEXT_HACKATHON.dateLine}</span>
            {NEXT_HACKATHON.facts.map((f) => (
              <span key={f}>{f}</span>
            ))}
          </p>

          {phase === "live" ? (
            <p className="mt-10 font-display text-[clamp(2.4rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.035em] text-[#d4c4ff]">
              Happening now.
            </p>
          ) : phase === "over" ? (
            <p className="mt-10 max-w-md font-display text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
              V8 has wrapped. See you at the next one.
            </p>
          ) : (
            <div className="mt-10 grid max-w-[640px] grid-cols-4 gap-3 sm:gap-6" role="timer" aria-label="Time until United Hacks V8 opens">
              <Unit value={left?.days ?? 0} label="days" />
              <Unit value={left?.hours ?? 0} label="hours" />
              <Unit value={left?.minutes ?? 0} label="minutes" />
              <Unit value={left?.seconds ?? 0} label="seconds" />
            </div>
          )}

          <p className="mt-8 max-w-md text-base leading-relaxed text-neutral-400 sm:text-lg">
            {NEXT_HACKATHON.prizes}. {NEXT_HACKATHON.opening}.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Magnetic>
            <a
              href={NEXT_HACKATHON.registerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#d4c4ff] px-8 text-base font-semibold text-[#0b0813] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-white active:scale-[0.98]"
            >
              Register on Devpost
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            </Magnetic>
            <Magnetic>
            <a
              href={NEXT_HACKATHON.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/25 px-8 text-base font-semibold text-white transition-colors duration-200 hover:border-[#d4c4ff] hover:text-[#d4c4ff] active:scale-[0.98]"
            >
              Join the Discord
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            </Magnetic>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <label htmlFor="badge-name" className="self-stretch text-center font-display text-xl font-semibold tracking-[-0.03em] text-white lg:text-left lg:text-2xl">
            Claim your hacker badge
          </label>
          <div className="mt-4 flex w-full max-w-md items-center gap-2 self-center lg:self-start">
            <input
              id="badge-name"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 26))}
              placeholder="Type your name"
              autoComplete="off"
              spellCheck={false}
              className="h-12 min-w-0 flex-1 rounded-full border border-white/15 bg-white/[0.04] px-5 text-base text-white placeholder:text-neutral-500 focus:border-[#d4c4ff] focus:outline-none"
            />
            <button
              type="button"
              onClick={download}
              aria-label="Download your badge as an image"
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition-colors hover:border-[#d4c4ff] hover:text-[#d4c4ff]"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>

          <div className="relative mt-2 h-[560px] w-full sm:h-[680px] lg:-ml-24 lg:w-[calc(100%+6rem)]" data-lenis-prevent-wheel>
            {near && art.front && art.back && art.strap && (
              <Lanyard
                frontImage={art.front}
                backImage={art.back}
                strapImage={art.strap}
                finish="holographic"
                metal="silver"
                cardColor="#0a0a0e"
                orientation="portrait"
                cornerRadius={0.28}
                strapLength={0.62}
                size={0.62}
                gravity={1}
                interactive
              />
            )}
          </div>
          <p className="font-mono text-xs text-neutral-500">drag the badge and throw it</p>
        </div>
      </div>
    </section>
  );
}
