"use client";

import { useEffect, useState } from "react";
import { ORGANIZER_DEADLINE } from "@/lib/organizer";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";

export default function AnnouncementBanner() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);
  const [expired, setExpired] = useState(() => Date.now() > ORGANIZER_DEADLINE.getTime());

  // hide the announcement once applications have closed
  useEffect(() => {
    const check = () => setExpired(Date.now() > ORGANIZER_DEADLINE.getTime());
    check();
    const id = setInterval(check, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (pathname !== "/" || dismissed || expired) return null;

  return (
    <div className="relative w-full border-b border-white/[0.07] bg-[#0a0a0c] text-neutral-300">
      <div className="mx-auto flex min-h-[40px] max-w-7xl items-center justify-center px-12 py-2 text-center text-[12px] sm:text-[13px] leading-snug">
        <p>
          Organizer Applications for V8 are open!{" "}
          <Link
            href="/organizer"
            className="group inline-flex items-center gap-1 whitespace-nowrap font-semibold text-[#d4c4ff]"
          >
            See more
            <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-sm text-neutral-500 transition-colors hover:bg-white/5 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
