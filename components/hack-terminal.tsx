"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { editions, impactHighlights, judges } from "@/lib/home-data";
import { dropEverything, isGravityActive, restore } from "@/lib/gravity";
import { NEXT_HACKATHON, parts, phaseAt } from "@/lib/next-hackathon";
import { scrollToId } from "@/lib/scroll";

export const OPEN_TERMINAL_EVENT = "hu:open-terminal";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const FILES: Record<string, string[]> = {
  "mission.txt": ["Hack United is a 501(c)(3) nonprofit running free hackathons and workshops for students."],
  "judges.txt": [judges.map((j) => j.alt).join("   ")],
  "readme.md": ["Try: stats, hackathons, apply, donate, deploy, gravity.", "There may be one more command. Konami fans know."],
};

const COMMANDS = ["help", "ls", "cat", "whoami", "stats", "hackathons", "judges", "v8", "countdown", "badge", "team", "apply", "donate", "discord", "deploy", "gravity", "restore", "root", "clear", "exit"];

// In-page terminal. Opens with the backtick key, the Konami code, or the command palette.
export default function HackTerminal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<{ t: string; kind?: "cmd" | "ok" | "dim" }[]>([
    { t: "hackunited shell. type `help` to see commands.", kind: "dim" },
  ]);
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);
  const hist = useRef<string[]>([]);
  const hi = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  const end = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  const print = (...t: string[]) => setLines((p) => [...p, ...t.map((x) => ({ t: x }))]);
  const printKind = (t: string, kind: "cmd" | "ok" | "dim") => setLines((p) => [...p, { t, kind }]);

  // open triggers: backtick, Konami, custom event
  useEffect(() => {
    const seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let i = 0;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key === "`" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (e.key === "Escape") setOpen(false);
      i = e.key === seq[i] ? i + 1 : e.key === seq[0] ? 1 : 0;
      if (i === seq.length) {
        i = 0;
        document.documentElement.dataset.mode = "root";
        setOpen(true);
        setLines((p) => [...p, { t: "konami accepted. root mode on. type `root off` to leave.", kind: "ok" }]);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_TERMINAL_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_TERMINAL_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => input.current?.focus(), 40);
  }, [open]);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  const run = async (raw: string) => {
    const [cmd, ...args] = raw.trim().split(/\s+/);
    printKind(`$ ${raw}`, "cmd");
    if (!cmd) return;
    switch (cmd) {
      case "help":
        return print(
          "stats          impact numbers",
          "hackathons     every United Hacks so far",
          "judges         who has judged",
          "v8             the next hackathon",
          "countdown      time until it opens",
          "badge          jump to your 3D hacker badge",
          "ls / cat       read a file",
          "team  apply  donate  discord   jump somewhere",
          "deploy         ship it",
          "gravity        let go of the page (restore to undo)",
          "clear  exit"
        );
      case "ls":
        return print(Object.keys(FILES).join("   "));
      case "cat":
        return print(...(FILES[args[0]] ?? [`cat: ${args[0] ?? ""}: no such file`]));
      case "whoami":
        return print("visitor. building something soon, we hope.");
      case "stats":
        return print(...impactHighlights.map((h) => `${h.value.toLocaleString("en-US")}${h.suffix}  ${h.label.toLowerCase()}`));
      case "hackathons":
        return print(...editions.map((e) => `${e.id.toUpperCase()}  ${e.date.padEnd(15)}${e.theme}`));
      case "judges":
        return print(judges.map((j) => j.alt).join(" / "));
      case "v8":
        return print(
          `${NEXT_HACKATHON.name}  ${NEXT_HACKATHON.dateLine}`,
          NEXT_HACKATHON.facts.join(", ").toLowerCase(),
          NEXT_HACKATHON.prizes,
          `register: ${NEXT_HACKATHON.registerUrl}`
        );
      case "countdown": {
        const now = Date.now();
        const phase = phaseAt(now);
        if (phase !== "upcoming") return print(phase === "live" ? "V8 is live right now." : "V8 has wrapped.");
        const p = parts(NEXT_HACKATHON.start.getTime() - now);
        return print(`${p.days}d ${p.hours}h ${p.minutes}m ${p.seconds}s until the V8 opening ceremony`);
      }
      case "badge":
        print("loading your badge");
        await sleep(250);
        close();
        await sleep(150);
        return scrollToId("next");
      case "team":
      case "apply":
      case "donate":
        print(`opening /${cmd}`);
        await sleep(280);
        close();
        return router.push(`/${cmd}`);
      case "discord":
        print("opening discord.gg/hackunited");
        window.open("https://discord.gg/hackunited", "_blank", "noopener,noreferrer");
        return;
      case "deploy": {
        const steps = ["installing dependencies", "building", "running 7 hackathons of winning projects", "shipping"];
        setBusy(true);
        for (let i = 0; i < steps.length; i++) {
          print(`[${i + 1}/${steps.length}] ${steps[i]}`);
          await sleep(reduced() ? 0 : 450);
        }
        setBusy(false);
        return printKind("deployed to production. now go build something.", "ok");
      }
      case "gravity": {
        if (reduced()) return print("gravity is off because you prefer reduced motion.");
        if (isGravityActive()) return print("already falling. `restore` to undo.");
        print("g = 9.8. drag things, throw them.");
        await sleep(250);
        close();
        await sleep(200);
        dropEverything();
        return;
      }
      case "restore":
        restore();
        return print("everything is back where it was.");
      case "root":
        if (args[0] === "off") {
          delete document.documentElement.dataset.mode;
          return print("root mode off.");
        }
        document.documentElement.dataset.mode = "root";
        return printKind("root mode on. `root off` to leave.", "ok");
      case "sudo":
        return print("nice try. but we love the energy. `apply`");
      case "clear":
        return setLines([]);
      case "exit":
        return close();
      default:
        return print(`${cmd}: command not found. try \`help\``);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !busy) {
      hist.current.push(val);
      hi.current = hist.current.length;
      run(val);
      setVal("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      hi.current = Math.max(0, hi.current - 1);
      setVal(hist.current[hi.current] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      hi.current = Math.min(hist.current.length, hi.current + 1);
      setVal(hist.current[hi.current] ?? "");
    } else if (e.key === "Tab") {
      e.preventDefault();
      const m = COMMANDS.filter((c) => c.startsWith(val.trim()));
      if (m.length === 1) setVal(m[0]);
    }
  };

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-label="Terminal"
      className="terminal-panel fixed inset-x-3 bottom-3 z-[110] mx-auto max-w-3xl overflow-hidden rounded-[14px] border border-white/[0.12] bg-[#050505]/[0.97] font-mono text-[13px] text-neutral-300 shadow-[0_30px_90px_rgba(0,0,0,0.7)]"
      onClick={() => input.current?.focus()}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-neutral-500">
        <span>~/hackunited</span>
        <button onClick={close} className="transition-colors hover:text-[#d4c4ff]" aria-label="Close terminal">
          esc
        </button>
      </div>
      <div className="max-h-[42vh] overflow-y-auto p-4" aria-live="polite" data-lenis-prevent>
        {lines.map((l, i) => (
          <div key={i} className={l.kind === "cmd" ? "text-[#d4c4ff]" : l.kind === "ok" ? "text-white" : l.kind === "dim" ? "text-neutral-500" : ""}>
            {l.t}
          </div>
        ))}
        <div className="flex gap-2">
          <span className="text-[#d4c4ff]">$</span>
          <input
            ref={input}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={onKey}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            aria-label="Terminal input"
            className="w-full bg-transparent text-white outline-none focus-visible:outline-none"
          />
        </div>
        <div ref={end} />
      </div>
    </div>
  );
}
