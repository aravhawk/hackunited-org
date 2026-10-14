"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { NEXT_HACKATHON, parts, phaseAt } from "@/lib/next-hackathon";

// Floating pill that follows the visitor down the page and steps aside when the
// full V8 section or the footer is already on screen.
export default function RegisterDock() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (pathname !== "/") return;
    const tick = () => {
      const now = Date.now();
      const ph = phaseAt(now);
      setLabel(ph === "upcoming" ? `${NEXT_HACKATHON.short} opens in ${parts(NEXT_HACKATHON.start.getTime() - now).days}d` : ph === "live" ? "V8 is live" : "");
    };
    tick();
    const id = setInterval(tick, 60 * 1000);

    let pastHero = false;
    const hidden = new Set<Element>();
    const update = () => setShow(pastHero && hidden.size === 0);
    const hero = document.querySelector(".hero-root");
    const targets = [document.getElementById("next"), document.getElementById("archive"), document.querySelector("footer")].filter(Boolean) as Element[];
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) pastHero = !e.isIntersecting;
        else if (e.isIntersecting) hidden.add(e.target);
        else hidden.delete(e.target);
      }
      update();
    });
    if (hero) io.observe(hero);
    targets.forEach((t) => io.observe(t));
    return () => {
      clearInterval(id);
      io.disconnect();
      setShow(false);
    };
  }, [pathname]);

  if (pathname !== "/" || !label) return null;
  return (
    <a
      href={NEXT_HACKATHON.registerUrl}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      className={`fixed bottom-5 left-1/2 z-40 inline-flex h-12 -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-full border border-[#d4c4ff]/40 bg-[#0a0a0c]/95 pl-5 pr-2 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(0,0,0,0.6)] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#d4c4ff] ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-24 opacity-0"
      }`}
    >
      <span className="font-mono text-xs text-neutral-300">{label}</span>
      <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#d4c4ff] px-4 text-[#0b0813]">
        Register
        <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </a>
  );
}
