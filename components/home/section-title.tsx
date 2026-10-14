import ScrambleText from "./scramble-text";

type Props = { first: string; second?: string; className?: string };

export default function SectionTitle({ first, second, className = "" }: Props) {
  return (
    <h2 data-fall className={`skew-scroll w-fit font-display text-[clamp(3.9rem,11vw,8.5rem)] font-bold leading-[0.9] tracking-[-0.04em] text-white ${className}`}>
      <ScrambleText text={first} />
      {second && (
        <>
          <br />
          <ScrambleText text={second} className="text-[#d4c4ff]" delay={0.2} />
        </>
      )}
    </h2>
  );
}
