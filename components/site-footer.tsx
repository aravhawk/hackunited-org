"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin, Twitter } from "lucide-react";

const socials = [
  { href: "https://instagram.com/hack_united", label: "Instagram", Icon: Instagram },
  { href: "https://linkedin.com/company/hack-united", label: "LinkedIn", Icon: Linkedin },
  { href: "https://x.com/hackunited_", label: "X (Twitter)", Icon: Twitter },
];

const WORD = "HACK UNITED".split("");

// Giant wordmark: each letter swells (variable-font weight) as the cursor nears it.
function Wordmark() {
  const ref = useRef<HTMLDivElement>(null);

  const frame = useRef(0);
  const pos = useRef({ x: 0, y: 0 });
  const letters = useRef<{ el: HTMLElement; cx: number; cy: number }[]>([]);

  // Measure letter centres once per pointer-enter (and on resize), not per move.
  const measure = () => {
    letters.current = Array.from(ref.current?.querySelectorAll<HTMLElement>("[data-l]") ?? []).map((el) => {
      const r = el.getBoundingClientRect();
      return { el, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    });
  };

  const onMove = (e: React.PointerEvent) => {
    pos.current = { x: e.clientX, y: e.clientY };
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const { x, y } = pos.current;
      for (const l of letters.current) {
        const d = Math.hypot(x - l.cx, (y - l.cy) * 0.6);
        const k = Math.max(0, 1 - d / 260);
        l.el.style.fontVariationSettings = `"wght" ${Math.round(520 + k * 280)}`;
        l.el.style.color = k > 0.05 ? `color-mix(in srgb, #d4c4ff ${Math.round(k * 100)}%, #3a3a40)` : "";
      }
    });
  };
  const reset = () => {
    ref.current?.querySelectorAll<HTMLElement>("[data-l]").forEach((el) => {
      el.style.fontVariationSettings = "";
      el.style.color = "";
    });
  };

  return (
    <div
      ref={ref}
      onPointerEnter={measure}
      onPointerMove={onMove}
      onPointerLeave={reset}
      aria-hidden="true"
      className="flex w-full select-none justify-between overflow-hidden font-display text-[calc((100vw_-_2.5rem)/5.75)] sm:text-[calc((100vw_-_4rem)/5.75)] min-[1500px]:text-[15.5rem] leading-[0.8] tracking-[-0.035em] text-[#30303a]"
    >
      {WORD.map((c, i) => (
        <span
          key={i}
          data-l
          data-fall
          className="inline-block transition-[font-variation-settings,color] duration-300 ease-out"
          style={{ fontVariationSettings: '"wght" 520' }}
        >
          {c === " " ? " " : c}
        </span>
      ))}
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/[0.07] bg-[#050505]">
      <div className="mx-auto max-w-[1500px] px-5 pb-6 pt-14 sm:px-8 sm:pt-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/images/globe-icon.png" alt="" width={28} height={28} className="h-7 w-7" />
              <span className="font-display text-xl font-bold tracking-[-0.035em] text-white">Hack United</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-neutral-400">
              501(c)(3) nonprofit running free hackathons and workshops for students.
            </p>
            <p className="font-mono text-xs text-neutral-500">EIN 81-2908499</p>
            <div className="flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-neutral-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d4c4ff] hover:text-[#d4c4ff]"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-display text-base font-semibold text-white">Company</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="mailto:humans@hackunited.org" className="footer-link">Sponsor Us</a>
              </li>
              <li>
                <a href="mailto:humans@hackunited.org" className="footer-link">Press/Media</a>
              </li>
              <li>
                <Link href="/apply" className="footer-link">Volunteer</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-display text-base font-semibold text-white">Contact</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="mailto:humans@hackunited.org" className="footer-link">humans@hackunited.org</a>
              </li>
              <li>
                <a href="https://discord.gg/hackunited" target="_blank" rel="noopener noreferrer" className="footer-link">
                  discord.gg/hackunited
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 sm:mt-24">
          <Wordmark />
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-white/[0.07] pt-5 text-xs text-neutral-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Hack United. All rights reserved.</p>
          <p className="font-mono">
            Press <kbd className="rounded border border-white/15 px-1.5 py-0.5 text-neutral-300">`</kbd> to open the terminal,{" "}
            <kbd className="rounded border border-white/15 px-1.5 py-0.5 text-neutral-300">Ctrl K</kbd> to jump anywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
