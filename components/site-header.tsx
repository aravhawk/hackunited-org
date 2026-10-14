"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { Menu, X, ArrowUpRight, Search } from "lucide-react";
import { OPEN_PALETTE_EVENT } from "@/components/command-palette";
import { NEXT_HACKATHON, parts, phaseAt } from "@/lib/next-hackathon";
import { scrollToId } from "@/lib/scroll";

const links = [
  { href: "/", label: "Home" },
  { href: "/donate", label: "Donate" },
  { href: "/team", label: "Team" },
  { href: "/apply", label: "Apply" },
  { href: "/social", label: "Socials" },
  { href: "https://blog.hackunited.org/", label: "Blog", external: true },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [chip, setChip] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // "V8 in 86d" chip: a standing reason to come back
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const phase = phaseAt(now);
      if (phase === "upcoming") setChip(`${NEXT_HACKATHON.short} in ${parts(NEXT_HACKATHON.start.getTime() - now).days}d`);
      else if (phase === "live") setChip(`${NEXT_HACKATHON.short} is live`);
      else setChip(null);
    };
    tick();
    const id = setInterval(tick, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const goNext = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      scrollToId("next");
    }
  };
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.07] bg-[#050505]/[0.97]">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="Hack United home">
          <Image
            src="/images/main-globe-icon.png"
            alt=""
            width={26}
            height={26}
            className="h-6 w-6 transition-transform duration-700 ease-out group-hover:rotate-[360deg]"
          />
          <span className="font-display text-[17px] font-bold tracking-[-0.035em] text-white">Hack United</span>
        </Link>

        <div className="hidden items-center md:flex">
        <nav className="flex items-center" onPointerLeave={() => setHovered(null)}>
          {links.map((l) => {
            const isActive = !l.external && pathname === l.href;
            const Comp = l.external ? "a" : Link;
            return (
              <Comp
                key={l.href}
                href={l.href}
                {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                onPointerEnter={() => setHovered(l.href)}
                onFocus={() => setHovered(l.href)}
                className={`relative px-4 py-2 text-[13px] font-medium transition-colors duration-200 ${
                  isActive || hovered === l.href ? "text-white" : "text-neutral-400"
                }`}
              >
                {hovered === l.href && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-white/[0.08]"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{l.label}</span>
                {isActive && <span className="absolute inset-x-4 -bottom-[11px] h-px bg-[#d4c4ff]" />}
              </Comp>
            );
          })}
        </nav>

        {chip && (
          <Link
            href="/#next"
            onClick={goNext}
            className="ml-3 hidden h-8 items-center rounded-full border border-[#d4c4ff]/35 bg-[#d4c4ff]/10 px-3.5 font-mono text-xs text-[#d4c4ff] transition-colors hover:bg-[#d4c4ff] hover:text-[#0b0813] lg:inline-flex"
          >
            {chip}
          </Link>
        )}

        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
          aria-label="Open command palette"
          className="ml-2 inline-flex h-8 items-center gap-2 rounded-full border border-white/10 px-3 text-xs text-neutral-400 transition-colors hover:border-[#d4c4ff]/60 hover:text-white"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="font-mono">Ctrl K</span>
        </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <motion.div style={{ scaleX: progress }} className="absolute inset-x-0 -bottom-px h-px origin-left bg-[#d4c4ff]" />

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 top-full z-40 h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-white/[0.07] bg-[#050505] px-5 pt-6 md:hidden"
          >
            <ul className="flex flex-col">
              {links.map((l, i) => {
                const Comp = l.external ? "a" : Link;
                return (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.05, type: "spring", stiffness: 160, damping: 20 }}
                    className="border-b border-white/[0.07]"
                  >
                    <Comp
                      href={l.href}
                      {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className={`flex items-center justify-between py-4 font-display text-4xl font-bold tracking-[-0.035em] ${
                        pathname === l.href ? "text-[#d4c4ff]" : "text-white"
                      }`}
                    >
                      {l.label}
                      {l.external && <ArrowUpRight className="h-6 w-6 text-neutral-500" />}
                    </Comp>
                  </motion.li>
                );
              })}
            </ul>
            {chip && (
              <a
                href={NEXT_HACKATHON.registerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#d4c4ff] text-base font-semibold text-[#0b0813]"
              >
                Register for {NEXT_HACKATHON.short}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
