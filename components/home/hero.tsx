"use client";

import HeroButton from "../ui/HeroButton/HeroButton";
import "./hero.css";

// The hero is intentionally unchanged from the original site.
export default function Hero() {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="hero-root bg-[url('/images/gradient.png')] bg-cover bg-center bg-no-repeat w-full pt-[30px] md:min-h-screen relative">
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-black to-transparent" />
      <div className="headContainer max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[48%_52%] mt-16 sm:mt-24 md:mt-[140px] pb-12 sm:pb-16 md:pb-[160px] px-6 sm:px-8 md:px-8 relative">
        <div className="right text-center md:text-left">
          <h1 className="hero-heading heroTitle mb-4 sm:mb-6 text-center md:text-left">
            <span className="heroAccent">Empowering</span>
            <br />
            the Next Generation
            <br />
            of Tech Innovators
          </h1>
          <div className="hero-subheading subHeading mt-4 sm:mt-6 text-center md:text-left">
            <p className="hidden md:block">
              A non-profit hosting free hackathons and workshops
              <br />
              focused on building essential soft skills through hands-on
              <br />
              tech projects and real-world application.
            </p>
            <p className="md:hidden text-sm sm:text-base">
              A non-profit hosting free hackathons and workshops focused on
              building essential soft skills through hands-on tech projects
              and real-world application.
            </p>
          </div>
          <div className="hero-buttons flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto sm:max-w-[288px] justify-center items-center md:justify-between mt-6 sm:mt-8">
            <HeroButton onClick={() => scrollTo("who-are-we")}>
              Learn More
            </HeroButton>
            <HeroButton
              link="https://unitedhacks.hackunited.org"
              filled={false}
            >
              Hackathons
            </HeroButton>
          </div>
        </div>
        <div className="left flex items-center justify-center md:justify-end mt-8 sm:mt-12 md:mt-0">
          <img
            className="hero-logo h-[200px] sm:h-[240px] md:h-[350px] md:mr-[48px]"
            src="./images/Logo.png"
            alt=""
          />
          <div className="glassCard glassCard1 hidden md:flex">
            <h3 className="heroAccent">25,000+</h3>
            <p>Engineers Impacted</p>
          </div>
          <div className="glassCard glassCard2 hidden md:flex">
            <h3 className="heroAccent">3,000+</h3>
            <p>Community Members</p>
          </div>
          <div className="glassCard glassCard3 hidden md:flex">
            <h3 className="heroAccent">50+</h3>
            <p>Countries Reached</p>
          </div>
        </div>
      </div>
    </div>
  );
}
