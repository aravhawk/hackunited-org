"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import ParticleField from "@/components/home/particle-field";
import ScrambleText from "@/components/home/scramble-text";
import Spotlight from "@/components/home/spotlight";
import { useFieldScene } from "@/components/home/use-field-scene";
import { fieldStore } from "@/lib/field-store";
import { ORGANIZER_APPLY_URL, ORGANIZER_DEADLINE, ORGANIZER_DEADLINE_LABEL } from "@/lib/organizer";

const teams = [
  {
    name: "Marketing",
    description:
      "Build the United Hacks brand, create content, grow our reach, work on partnerships and help bring more hackers to V8.",
  },
  {
    name: "R&D",
    description:
      "Experiment with new ideas, technology, and experiences that can make United Hacks better. Help research and build new features, tools, and initiatives for V8.",
  },
  {
    name: "Logistics & Operations",
    description:
      "Help make the event actually happen. Work on scheduling, coordination, event logistics, resources, communication, and everything needed to keep V8 running smoothly.",
  },
  {
    name: "Generalists",
    description:
      "Not sure where you fit? Join as a generalist. Work across different parts of United Hacks, take on high-impact problems, and help wherever the team needs you most.",
  },
];

const steps = [
  {
    number: "01",
    title: "Application",
    description:
      "Submit the organizer application form and tell us a little about yourself, your experience, and why you want to join United Hacks.",
  },
  {
    number: "02",
    title: "15-Minute Behavioral Interview",
    description:
      "Selected applicants will be invited to a short 15-minute interview. We want to learn more about you, how you work with others, and what you could bring to the team.",
  },
  {
    number: "03",
    title: "Decision",
    description:
      "After your interview, our team will review your application and send you a final decision.",
  },
];

function useDeadline() {
  const [state, setState] = useState<{ daysLeft: number; closed: boolean } | null>(null);

  useEffect(() => {
    const update = () => {
      const diff = ORGANIZER_DEADLINE.getTime() - Date.now();
      setState({
        daysLeft: Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))),
        closed: diff <= 0,
      });
    };
    update();
    const id = setInterval(update, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return state;
}

function ApplyButton({ closed, children, className = "" }: { closed: boolean; children: React.ReactNode; className?: string }) {
  if (closed) {
    return (
      <span
        aria-disabled="true"
        className={`inline-flex h-14 items-center justify-center rounded-full border border-white/15 px-8 text-base font-semibold text-neutral-400 ${className}`}
      >
        Applications Closed
      </span>
    );
  }
  return (
    <a
      href={ORGANIZER_APPLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#d4c4ff] px-8 text-base font-semibold text-[#0b0813] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-white active:scale-[0.98] ${className}`}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
    </a>
  );
}

export default function OrganizerPage() {
  const deadline = useDeadline();
  const closed = deadline?.closed ?? false;

  const heroRef = useRef<HTMLElement>(null);
  const teamsRef = useRef<HTMLElement>(null);
  const processRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  // The shared particle field tells the story as you scroll: globe, crystal, helix, galaxy.
  useFieldScene(heroRef, { shape: "globe", x: 1, scale: 1, opacity: 1 });
  useFieldScene(teamsRef, { shape: "crystal", x: 1, scale: 0.8, opacity: 0.55 });
  useFieldScene(processRef, { shape: "helix", x: 1, scale: 0.85, opacity: 0.7 });
  useFieldScene(ctaRef, { shape: "galaxy", x: 0, scale: 1.25, opacity: 0.4 });

  useEffect(() => {
    fieldStore.set({ shape: "globe", x: 1, scale: 1, opacity: 1 });
    return () => {
      fieldStore.set({ opacity: 0 });
    };
  }, []);

  const daysLeft =
    deadline && !closed
      ? deadline.daysLeft === 0
        ? "Last day to apply"
        : `${deadline.daysLeft} day${deadline.daysLeft === 1 ? "" : "s"} left`
      : null;

  return (
    <main className="relative bg-[#050505] text-white">
      <ParticleField />

      {/* Hero */}
      <section ref={heroRef} className="relative z-10 flex min-h-[calc(100dvh-56px)] items-center px-5 py-20 sm:px-8">
        <div className="mx-auto w-full max-w-[1500px]">
          <h1 className="max-w-[16ch] font-display text-[clamp(3rem,9.2vw,8.6rem)] font-bold leading-[0.9] tracking-[-0.04em] text-white">
            UH<span className="text-[#d4c4ff]">V8</span> Organizer
            <br />
            <span className="text-[#d4c4ff]">Applications</span>{" "}
            <span className={deadline ? "" : "opacity-0"}>{closed ? "Closed" : "Open"}</span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-neutral-300 sm:mt-10 sm:text-xl">
            Help build the next United Hacks. Join the team behind V8 and work alongside other students to create an
            unforgettable hackathon experience.
          </p>

          <div className="mt-10 flex flex-col items-start gap-5 sm:mt-12">
            <ApplyButton closed={closed} className="w-full sm:w-auto sm:min-w-[260px]">
              Apply Now
            </ApplyButton>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-neutral-400">
              <span>{closed ? "Closed" : "Closes"} {ORGANIZER_DEADLINE_LABEL}</span>
              <span>No exceptions</span>
              {daysLeft && <span className="text-white">{daysLeft}</span>}
            </p>
          </div>
        </div>
      </section>

      {/* Find your team */}
      <section ref={teamsRef} id="find-your-team" className="relative z-10 scroll-mt-20 border-t border-white/[0.07] px-5 py-28 sm:px-8 sm:py-36">
        <div className="mx-auto max-w-[1500px]">
          <h2 className="font-display text-[clamp(2.8rem,8vw,7rem)] font-bold leading-[0.92] tracking-[-0.04em] text-white">
            <ScrambleText text="Four teams." />
            <br />
            <ScrambleText text="One event." className="text-[#d4c4ff]" delay={0.2} />
          </h2>
          <p className="mt-8 max-w-xl text-base text-neutral-400 sm:text-lg">
            Applicants can join one of four teams depending on their interests and strengths.
          </p>

          <div className="mt-14 grid gap-px overflow-hidden rounded-[14px] border border-white/10 bg-white/10 sm:mt-20 md:grid-cols-6">
            {teams.map((team, i) => {
              const generalist = i === teams.length - 1;
              const span = ["md:col-span-4", "md:col-span-2", "md:col-span-2", "md:col-span-4"][i];
              return (
                <Spotlight
                  key={team.name}
                  className={`flex min-h-[240px] flex-col justify-between p-7 sm:p-9 ${span} ${
                    generalist ? "bg-[#d4c4ff] text-[#0b0813]" : "bg-[#070708]"
                  }`}
                >
                  <h3
                    className={`font-display text-[clamp(1.8rem,3.4vw,3rem)] font-bold leading-[0.95] tracking-[-0.035em] ${
                      generalist ? "" : "text-white"
                    }`}
                  >
                    {team.name}
                  </h3>
                  <p className={`mt-10 max-w-xl text-[15px] leading-relaxed sm:text-base ${generalist ? "text-[#0b0813]/75" : "text-neutral-400"}`}>
                    {team.description}
                  </p>
                </Spotlight>
              );
            })}
          </div>
        </div>
      </section>

      {/* Application process */}
      <section ref={processRef} className="relative z-10 border-t border-white/[0.07] px-5 py-28 sm:px-8 sm:py-36">
        <div className="mx-auto max-w-[1500px]">
          <h2 className="font-display text-[clamp(2.8rem,8vw,7rem)] font-bold leading-[0.92] tracking-[-0.04em] text-white">
            <ScrambleText text="Three steps." />
            <br />
            <ScrambleText text="Two weeks." className="text-[#d4c4ff]" delay={0.2} />
          </h2>

          <ol className="mt-16 max-w-3xl sm:mt-24">
            {steps.map((step) => (
              <li key={step.number} className="grid gap-x-8 gap-y-3 border-t border-white/10 py-9 sm:grid-cols-[110px_1fr] sm:py-11">
                <p className="font-display text-[clamp(2.8rem,5vw,4.2rem)] font-bold leading-none tracking-[-0.04em] text-[#d4c4ff]">
                  {step.number}
                </p>
                <div>
                  <h3 className="font-display text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">{step.title}</h3>
                  <p className="mt-3 max-w-lg text-base leading-relaxed text-neutral-400">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Final CTA */}
      <section ref={ctaRef} className="relative z-10 overflow-hidden border-t border-white/[0.07] px-5 py-32 text-center sm:px-8 sm:py-44">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center">
          <h2 className="max-w-[14ch] font-display text-[clamp(2.8rem,8vw,7rem)] font-bold leading-[0.92] tracking-[-0.04em] text-white">
            Ready to help build <span className="text-[#d4c4ff]">UHV8?</span>
          </h2>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-neutral-300 sm:text-lg">
            We&rsquo;re looking for people who want to create, experiment, and take ownership. You don&rsquo;t need to know
            everything already. We care about what you can bring to the team and your willingness to contribute.
          </p>
          <div className="mt-10 w-full sm:mt-12 sm:w-auto">
            <ApplyButton closed={closed} className="w-full sm:w-auto sm:min-w-[320px]">
              Apply to Join the V8 Team
            </ApplyButton>
          </div>
          <p className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-xs text-neutral-400">
            <span>{closed ? "Closed" : "Closes"} {ORGANIZER_DEADLINE_LABEL}</span>
            <span>No exceptions</span>
          </p>
          <a
            href="mailto:humans@hackunited.org"
            className="group mt-5 inline-flex items-center gap-1.5 text-sm text-neutral-400 transition-colors hover:text-white"
          >
            Questions? humans@hackunited.org
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </section>
    </main>
  );
}
