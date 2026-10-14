"use client";

import GlideHighlight from "@/components/effects/glide-highlight";

const allSponsors = [
  { src: "/images/sponsors/launchx.png", alt: "LaunchX" },
  { src: "/images/sponsors/YRI.jpg", alt: "YRI" },
  { src: "/images/sponsors/cp-logo-dark.svg", alt: "CodePath" },
  { src: "/images/sponsors/Coder.com_logo.png", alt: "Coder.com" },
  { src: "/images/sponsors/incogni_black.png", alt: "Incogni" },
  { src: "/images/sponsors/saily-logo-black_(3).png", alt: "Saily" },
  { src: "/images/sponsors/interviewbuddy.png", alt: "InterviewBuddy" },
  { src: "/images/sponsors/opennote.png", alt: "OpenNote" },
  { src: "/images/sponsors/images.png", alt: "Sponsor" },
  { src: "/images/sponsors/devIT.png", alt: "DevIT" },
  {
    src: "/images/sponsors/algoverse_logo_max_quality_-_compresed_(1).png",
    alt: "Algoverse",
  },
  { src: "/images/sponsors/aops_logo.png", alt: "AOPS" },
  { src: "/images/sponsors/axure_logo.png", alt: "Axure" },
  { src: "/images/sponsors/cake_logo_blue_gray.png", alt: "Cake" },
  { src: "/images/sponsors/CoCalc-Image.png", alt: "CoCalc" },
  { src: "/images/sponsors/codepath-1x1_icon-dark_1.jpg", alt: "CodePath" },
  { src: "/images/sponsors/desmossss_logo.png", alt: "Desmos" },
  { src: "/images/sponsors/devtranet_logo_with_text.png", alt: "Devtranet" },
  { src: "/images/sponsors/echo_3d.png", alt: "Echo3D" },
  { src: "/images/sponsors/FearedMediaLogo.png", alt: "Feared Media" },
  { src: "/images/sponsors/givemycertificate.png", alt: "GiveMyCertificate" },
  { src: "/images/sponsors/images_(2).png", alt: "Sponsor" },
  { src: "/images/sponsors/Logomark_(With_color).png", alt: "Sponsor" },
  { src: "/images/sponsors/NordVPN_horizontal.svg.png", alt: "NordVPN" },
  { src: "/images/sponsors/Postman.png", alt: "Postman" },
  { src: "/images/sponsors/StreamYardLogo.png", alt: "StreamYard" },
  { src: "/images/sponsors/SwishSwoosh_Logo_Light_BG.png", alt: "SwishSwoosh" },
  { src: "/images/sponsors/VerbwireLogoHackathonn.png", alt: "Verbwire" },
  { src: "/images/sponsors/Vue_School_logo.png", alt: "Vue School" },
  { src: "/images/sponsors/WoflramLogo.png", alt: "Wolfram" },
  { src: "/images/sponsors/1200px-.xyz_logo.svg.png", alt: ".xyz" },
  { src: "/images/sponsors/1_pass.jpg", alt: "1Pass" },
];

export default function DonatePage() {
  return (
    <main className="atelier">
      <section className="border-b border-[#232328] pb-16 pt-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="order-1">
                <h1 className="atelier-title mb-6">
                  <em>Donate</em>
                </h1>

                <p className="atelier-lead mb-6">
                  Donations are optional. They help cover servers, tooling, and prize pools for free student events.
                </p>

                <div className="atelier-frame">
                  <div className="atelier-frame-inner">
                    <p className="text-sm leading-relaxed text-[#a8a8b0]">
                      Hack Club Bank processes payments. Hack United is a 501(c)(3). EIN 81-2908499. Tax-deductible where applicable.
                    </p>
                  </div>
                </div>
              </div>

              <div className="order-2 flex justify-center">
                <div className="atelier-frame w-full max-w-md lg:max-w-none">
                  <div className="atelier-frame-inner">
                    <iframe
                      src="https://hcb.hackclub.com/donations/start/hackunited"
                      style={{ border: "none" }}
                      name="donateFrame"
                      scrolling="yes"
                      frameBorder={0}
                      marginHeight={0}
                      marginWidth={0}
                      height="600px"
                      width="100%"
                      className="mx-auto w-full min-w-0 max-w-[500px] rounded-lg sm:min-w-[350px] lg:min-w-[400px]"
                      title="Donation Form"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="atelier-sub mb-10">
            <em>Past</em> sponsors
          </h2>
          {/* Light tiles so dark and colored logos all stay legible on the dark page. */}
          <GlideHighlight>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {allSponsors.map((sponsor, i) => (
                <li
                  key={`${sponsor.src}-${i}`}
                  data-glide
                  className="flex h-24 items-center justify-center rounded-[14px] bg-[#e9e9ee] p-4 transition-transform duration-300 hover:-translate-y-0.5 sm:h-28"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sponsor.src}
                    alt={sponsor.alt}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain"
                  />
                </li>
              ))}
            </ul>
          </GlideHighlight>
        </div>
      </section>
    </main>
  );
}
