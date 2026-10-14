import Link from "next/link";
import LedBoard from "@/components/effects/led-board";

export default function NotFound() {
  return (
    <main className="atelier">
      <section className="mx-auto flex min-h-[78vh] max-w-[1500px] flex-col justify-center px-5 py-16 sm:px-8">
        <LedBoard text="404" className="h-[38vh] min-h-[220px] w-full sm:h-[46vh]" />
        <h1 className="atelier-sub mt-10">This page does not exist.</h1>
        <p className="atelier-lead mt-4">The link may be old or mistyped. Draw on the board if you like, then head back.</p>
        <div className="mt-8">
          <Link href="/" className="atelier-btn">
            Return to home
          </Link>
        </div>
      </section>
    </main>
  );
}
