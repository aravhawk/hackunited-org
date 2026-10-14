
# Hack United

The official website for **Hack United**, a student-led organization dedicated to making technology, innovation, and hackathons accessible to students around the world.

🌐 **Website:** [hackunited.org](https://hackunited.org)

## About

Hack United empowers students to explore computer science, develop technical skills, and build meaningful projects through collaborative hackathons and educational opportunities.

Our flagship event, **United Hacks**, brings together students from around the world to innovate, collaborate, and turn their ideas into reality.

This repository contains the source code for the official Hack United website.

## Design notes (redesign)

Everything below the hero was redesigned; the hero is untouched.

- **Shared particle field** (`components/home/particle-field.tsx`): one fixed three.js point cloud behind About, Impact and Goals. Sections steer it through `lib/field-store.ts`, so it morphs between a globe, a double helix, a torus knot, an octahedron and a galaxy as you scroll, and reacts to the cursor.
- **Previous hackathons** (`components/home/archive-flythrough.tsx`): a GSAP-pinned three.js flight through the real winner screenshots, V1 to V6, with a clickable edition rail. Edition data lives in `lib/home-data.ts`.
- **Small details**: decoding headlines, scroll-scrubbed About copy, count-up stats, pointer-lit panels, a sliding nav pill with a scroll-progress line, and a footer wordmark whose letters swell near the cursor.
- **Easter eggs and tools**: a Ctrl/Cmd+K command palette, an in-page terminal (backtick key; try `stats`, `deploy`, `gravity`, or the Konami code), a throwable press-logo marquee, halftone team portraits that develop into the photo under the cursor, and a drawable LED-dot 404 board. Components adapted from React Bits are noted in their file headers.
- **System**: Bricolage Grotesque + JetBrains Mono, one lavender accent (`#d4c4ff`, taken from the hero), 14px panels and pill buttons. Dark mode only. `prefers-reduced-motion` is respected throughout.

## Tech Stack

- **Framework:** Next.js 16
- **Frontend:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **3D / motion:** three.js, GSAP ScrollTrigger, Motion

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/tcytseven/hackunited-org.git
```

2. Navigate to the project directory:

```bash
cd hackunited-org
```

3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

## Contributing

We welcome contributions from developers interested in improving the Hack United website.

1. Fork this repository.
2. Create a new branch for your changes.
3. Make your changes and test them locally.
4. Commit and push your changes.
5. Open a pull request describing your updates.

## Community

Get involved with Hack United and stay updated on upcoming events, opportunities, and announcements.

- **Website:** https://hackunited.org

## License

All rights reserved unless otherwise specified.

---

Built by the **Hack United Team**.
