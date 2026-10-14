// United Hacks V8, as published at https://unitedhacks.hackunited.org
// Opening ceremony: Jan 8, 2027 at 7:00pm EST (UTC-5). Closing ceremony: Jan 10 at 8:00pm EST.
export const NEXT_HACKATHON = {
  name: "United Hacks V8",
  short: "V8",
  start: new Date("2027-01-09T00:00:00Z"),
  end: new Date("2027-01-11T01:00:00Z"),
  dateLine: "Jan 8-10, 2027",
  facts: ["Fully online", "Free"],
  opening: "Opening ceremony Jan 8, 7:00pm EST",
  prizes: "$25k+ in prizes across all tracks",
  registerUrl: "https://unitedhacksv8.devpost.com/",
  discordUrl: "https://discord.gg/hackunited",
  siteUrl: "https://unitedhacks.hackunited.org",
} as const;

export type HackathonPhase = "upcoming" | "live" | "over";

export function phaseAt(now: number): HackathonPhase {
  if (now < NEXT_HACKATHON.start.getTime()) return "upcoming";
  if (now < NEXT_HACKATHON.end.getTime()) return "live";
  return "over";
}

export function parts(ms: number) {
  const t = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(t / 86400),
    hours: Math.floor((t % 86400) / 3600),
    minutes: Math.floor((t % 3600) / 60),
    seconds: t % 60,
  };
}
