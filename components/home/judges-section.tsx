import { judges } from "@/lib/home-data";
import SectionTitle from "./section-title";
import Spotlight from "./spotlight";
import FieldOff from "./field-off";
import GlideHighlight from "@/components/effects/glide-highlight";

export default function JudgesSection() {
  return (
    <FieldOff>
      <section id="judges" className="relative z-10 border-t border-white/[0.07] bg-[#050505] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-[1500px] gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
          <div>
            <SectionTitle first="Judges" second="from" />
            <p className="mt-8 text-base text-neutral-400 sm:text-lg">
              Want to judge?{" "}
              <a
                href="mailto:humans@hackunited.org"
                className="text-[#d4c4ff] underline decoration-[#d4c4ff]/40 underline-offset-4 transition-colors hover:decoration-[#d4c4ff]"
              >
                humans@hackunited.org
              </a>
            </p>
          </div>

          <GlideHighlight className="gravity-hide-bg overflow-hidden rounded-[14px]" radius={0}><ul className="gravity-hide-bg grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-white/10 bg-white/10 sm:grid-cols-3 lg:grid-cols-2">
            {judges.map((j) => (
              <li key={j.alt} className="contents">
                <Spotlight data-fall data-glide className="flex h-32 items-center justify-center bg-[#070708] p-6 sm:h-40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={j.src}
                    alt={j.alt}
                    loading="lazy"
                    className={`max-h-12 w-auto max-w-[70%] object-contain opacity-70 transition-opacity duration-300 hover:opacity-100 sm:max-h-14 ${
                      j.alt === "Y Combinator" ? "" : "brightness-0 invert"
                    }`}
                  />
                </Spotlight>
              </li>
            ))}
          </ul></GlideHighlight>
        </div>
      </section>
    </FieldOff>
  );
}
