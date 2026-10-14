import type React from "react";
import type { Metadata } from "next";
import "@/app/globals.css";
import { Inter, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import CommandPalette from "@/components/command-palette";
import HackTerminal from "@/components/hack-terminal";
import SmoothScroll from "@/components/smooth-scroll";
import RegisterDock from "@/components/home/register-dock";
import AnnouncementBanner from "@/components/announcement-banner";

// Inter is kept only for the (unchanged) home hero; everything else uses the display + mono pair.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["wdth", "opsz"],
  variable: "--font-display",
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://hackunited.org"),
  title: "Hack United",
  description:
    "Hack United is a 501(c)(3) non-profit organization with a passion for programming and technology. Join our community of developers, participate in hackathons, and make an impact through code.",
  keywords:
    "hackathon, teen developers, programming, technology, non-profit, coding competitions, United Hacks",
  authors: [{ name: "Hack United Team" }],
  openGraph: {
    title: "Hack United",
    description:
      "Join our community of young developers, participate in hackathons, and make an impact through code.",
    url: "https://hackunited.org",
    siteName: "Hack United",
    images: [
      {
        url: "/images/hackunitedsplash.png",
        width: 1200,
        height: 630,
        alt: "Hack United - Empowering Teen Developers",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: [
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: "/images/main-globe-icon.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      url: "/images/main-globe-icon.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      url: "/images/main-globe-icon.png",
    },
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/images/main-globe-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/images/main-globe-icon.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/images/main-globe-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${inter.variable} ${display.variable} ${mono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col bg-[#050505] text-white">
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
            >
              Skip to content
            </a>
            <AnnouncementBanner />
            <SmoothScroll />
            <SiteHeader />
            <CommandPalette />
            <HackTerminal />
            <RegisterDock />
            <div id="main" className="flex-1">{children}</div>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
