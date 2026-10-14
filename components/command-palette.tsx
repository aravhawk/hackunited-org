"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import { OPEN_TERMINAL_EVENT } from "@/components/hack-terminal";
import { scrollStore, scrollToId } from "@/lib/scroll";
import { NEXT_HACKATHON } from "@/lib/next-hackathon";
import {
  ArrowUpRight,
  Compass,
  CornerDownLeft,
  FileText,
  Gavel,
  HeartHandshake,
  Home,
  Mail,
  MessagesSquare,
  Sparkles,
  SquareTerminal,
  Target,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";

export const OPEN_PALETTE_EVENT = "hu:open-palette";

type Item = {
  id: string;
  label: string;
  hint?: string;
  keywords?: string;
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
};

// Terminal-style command palette (Cmd/Ctrl+K, or "/" outside inputs).
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
    };
  }, []);

  // pause smooth scrolling underneath while the palette is open
  useEffect(() => {
    const l = scrollStore.get();
    if (open) l?.stop();
    else l?.start();
    return () => l?.start();
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router]
  );

  const jump = useCallback(
    (id: string) => {
      close();
      if (pathname === "/") {
        // wait a frame so the dialog's scroll lock is released first
        setTimeout(() => scrollToId(id), 60);
      } else {
        router.push(`/#${id}`);
      }
    },
    [close, pathname, router]
  );

  const external = (href: string) => () => {
    close();
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const pages: Item[] = [
    { id: "home", label: "Home", icon: Home, run: () => go("/") },
    { id: "team", label: "Team", hint: "/team", keywords: "people founders executives", icon: Users, run: () => go("/team") },
    { id: "apply", label: "Apply", hint: "/apply", keywords: "volunteer jobs roles join", icon: UserPlus, run: () => go("/apply") },
    { id: "donate", label: "Donate", hint: "/donate", keywords: "give support fund", icon: HeartHandshake, run: () => go("/donate") },
    { id: "social", label: "Socials", hint: "/social", keywords: "instagram linkedin x youtube", icon: MessagesSquare, run: () => go("/social") },
    { id: "organizer", label: "Organizer applications", hint: "V8", keywords: "united hacks v8", icon: Sparkles, run: () => go("/organizer") },
  ];

  const sections: Item[] = [
    { id: "s-about", label: "About us", hint: "#who-are-we", keywords: "mission nonprofit", icon: Compass, run: () => jump("who-are-we") },
    { id: "s-impact", label: "Our impact", hint: "#impact", keywords: "numbers engineers countries fund", icon: Target, run: () => jump("impact") },
    { id: "s-goals", label: "Our goals", hint: "#goals", keywords: "soft skills projects community", icon: Target, run: () => jump("goals") },
    { id: "s-archive", label: "Previous hackathons", hint: "#archive", keywords: "united hacks v1 v2 v3 v4 v5 v6 v7 winners", icon: Trophy, run: () => jump("archive") },
    { id: "s-next", label: "Next hackathon: United Hacks V8", hint: "#next", keywords: "countdown register badge devpost jan 2027", icon: Sparkles, run: () => jump("next") },
    { id: "s-judges", label: "Judges from", hint: "#judges", keywords: "amazon google microsoft stanford visa", icon: Gavel, run: () => jump("judges") },
    { id: "s-discord", label: "Discord", hint: "#discord", keywords: "chat community", icon: MessagesSquare, run: () => jump("discord") },
  ];

  const actions: Item[] = [
    { id: "a-badge", label: "Claim your hacker badge", hint: "3D", keywords: "name lanyard download", icon: Sparkles, run: () => jump("next") },
    {
      id: "a-term",
      label: "Open terminal",
      hint: "`",
      keywords: "shell hack gravity deploy konami",
      icon: SquareTerminal,
      run: () => {
        close();
        setTimeout(() => window.dispatchEvent(new Event(OPEN_TERMINAL_EVENT)), 80);
      },
    },
  ];

  const links: Item[] = [
    { id: "l-v8", label: "Register for United Hacks V8", hint: "devpost", keywords: "sign up join compete", icon: ArrowUpRight, run: external(NEXT_HACKATHON.registerUrl) },
    { id: "l-uh", label: "United Hacks (current hackathon)", hint: "unitedhacks.hackunited.org", icon: ArrowUpRight, run: external("https://unitedhacks.hackunited.org") },
    { id: "l-fund", label: "United Fund", hint: "fund.hackunited.org", icon: ArrowUpRight, run: external("https://fund.hackunited.org/") },
    { id: "l-blog", label: "Blog", hint: "blog.hackunited.org", icon: FileText, run: external("https://blog.hackunited.org/") },
    { id: "l-discord", label: "Join the Discord", hint: "discord.gg/hackunited", icon: ArrowUpRight, run: external("https://discord.gg/hackunited") },
    {
      id: "l-mail",
      label: copied ? "Copied humans@hackunited.org" : "Copy email address",
      hint: "humans@hackunited.org",
      keywords: "contact sponsor press",
      icon: Mail,
      run: () => {
        navigator.clipboard?.writeText("humans@hackunited.org");
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      },
    },
  ];

  const group = (heading: string, items: Item[]) => (
    <Command.Group heading={heading} className="palette-group">
      {items.map(({ id, label, hint, keywords, icon: Icon, run }) => (
        <Command.Item key={id} value={`${label} ${keywords ?? ""} ${hint ?? ""}`} onSelect={run} className="palette-item">
          <Icon className="h-4 w-4 shrink-0 text-neutral-500" />
          <span className="flex-1 truncate">{label}</span>
          {hint && <span className="hidden truncate font-mono text-[11px] text-neutral-500 sm:inline">{hint}</span>}
        </Command.Item>
      ))}
    </Command.Group>
  );

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      overlayClassName="palette-overlay"
      contentClassName="palette-content"
      loop
    >
      <Dialog.Title className="sr-only">Command palette</Dialog.Title>
      <Dialog.Description className="sr-only">Search pages, sections and links, then press enter to open.</Dialog.Description>
      <div className="flex items-center gap-3 border-b border-white/10 px-4">
        <span className="font-mono text-sm text-[#d4c4ff]" aria-hidden="true">
          &gt;
        </span>
        <Command.Input placeholder="Type a page, section, or link" className="palette-input" autoFocus />
        <kbd className="hidden rounded border border-white/15 px-1.5 py-0.5 font-mono text-[10px] text-neutral-400 sm:block">esc</kbd>
      </div>
      <Command.List className="palette-list" data-lenis-prevent>
        <Command.Empty className="px-4 py-10 text-center font-mono text-sm text-neutral-500">
          command not found. try &quot;team&quot; or &quot;donate&quot;
        </Command.Empty>
        {group("Pages", pages)}
        {group("On this site", sections)}
        {group("Links", links)}
        {group("Actions", actions)}
      </Command.List>
      <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 font-mono text-[11px] text-neutral-500">
        <span>↑↓ move</span>
        <span className="inline-flex items-center gap-1">
          <CornerDownLeft className="h-3 w-3" /> open
        </span>
        <span>` terminal</span>
      </div>
    </Command.Dialog>
  );
}
