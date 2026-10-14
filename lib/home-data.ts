export const pressLogos = [
  {
    src: "/images/companies logo/TechBullionLogo.webp",
    alt: "TechBullion",
    href: "https://techbullion.com/teenage-founder-creates-hackathon-program-to-help-peers/",
  },
  {
    src: "/images/companies logo/asocciatePress_00000.png",
    alt: "Associated Press",
    href: "https://apnews.com/press-release/ein-presswire-newsmatics/hack-united-unveils-united-hacks-v5-a-global-hackathon-equipping-youth-innovation-with-essential-soft-skills-d95d1a2b7f2b0367502ec18bd0148d08",
  },
  {
    src: "/images/companies logo/digitalJournal_00000.png",
    alt: "Digital Journal",
    href: "https://www.digitaljournal.com/pr/news/vehement-media/teen-led-hack-united-launches-united-1122733292.html",
  },
  {
    src: "/images/companies logo/fox40_00000.png",
    alt: "Fox 40",
    href: "https://fox40.com/business/press-releases/ein-presswire/825280862/hack-united-unveils-united-hacks-v5-a-global-hackathon-equipping-youth-innovation-with-essential-soft-skills/",
  },
  {
    src: "/images/companies logo/news 10_00000.png",
    alt: "News 10",
    href: "https://www.news10.com/business/press-releases/ein-presswire/825280862/hack-united-unveils-united-hacks-v5-a-global-hackathon-equipping-youth-innovation-with-essential-soft-skills/",
  },
  {
    src: "/images/companies logo/theGlobe_00000.png",
    alt: "The Globe and Mail",
    href: "https://www.barchart.com/story/news/33037092/hack-united-empowers-youth-with-soft-skills-at-united-hacks-v5",
  },
];

export const judges = [
  { src: "/judgesfrom/Amazon-Logo.png", alt: "Amazon" },
  { src: "/judgesfrom/Google-Logo.png", alt: "Google" },
  { src: "/judgesfrom/Microsoft-Logo.png", alt: "Microsoft" },
  { src: "/judgesfrom/Stanford-Logo.png", alt: "Stanford" },
  { src: "/judgesfrom/Visa-Logo.png", alt: "Visa" },
  { src: "/judgesfrom/YC-Logo.png", alt: "Y Combinator" },
];

export const impactHighlights = [
  {
    value: 25000,
    suffix: "+",
    label: "Engineers impacted",
    detail: "Hackathons, workshops, and Discord programming.",
  },
  {
    value: 3000,
    suffix: "+",
    label: "Community members",
    detail: "Students building together year-round.",
  },
  {
    value: 50,
    suffix: "+",
    label: "Countries reached",
    detail: "Participants from every major region.",
  },
];

export const goalPillars = [
  {
    title: "Soft skills",
    description:
      "Communication, teamwork, and presenting work matter as much as the code. Our events are built around that.",
  },
  {
    title: "Real projects",
    description:
      "Each hackathon theme ties to problems people actually face. You ship something, not just a tutorial clone.",
  },
  {
    title: "Community",
    description:
      "Discord, mentors, and repeat participants. Most people stay after their first event.",
  },
];

export type Edition = {
  id: string;
  name: string;
  date: string;
  theme: string;
  image: string;
  /** right-sized copy used as the WebGL texture */
  texture: string;
  imageAlt: string;
  blurb: string;
  caption: string;
  stats: { value: string; label: string }[];
  note?: { title: string; detail: string };
  recap?: string;
  devpost: string;
};

export const editions: Edition[] = [
  {
    id: "v1",
    name: "United Hacks V1",
    date: "August 2023",
    theme: "Mental Health",
    image: "/images/v1.png",
    texture: "/images/winners/v1.webp",
    imageAlt: "United Hacks V1 winning projects",
    blurb:
      "Our inaugural hackathon focused on mental health solutions, bringing together 400+ participants to create impactful projects with industry professional judges.",
    caption: "Inaugural hackathon showcasing mental health innovations",
    stats: [
      { value: "400+", label: "Participants" },
      { value: "50+", label: "Projects" },
      { value: "$5,000+", label: "Prize Pool" },
      { value: "10+", label: "Sponsors" },
      { value: "100+", label: "Workshop Attendees" },
      { value: "10", label: "Workshops" },
    ],
    recap:
      "https://blog.hackunited.org/united-hacks-recap-tackling-mental-health-challenges-through-technology",
    devpost: "https://unitedhacks23.devpost.com/",
  },
  {
    id: "v2",
    name: "United Hacks V2",
    date: "January 2024",
    theme: "Resolutions",
    image: "/images/v2.png",
    texture: "/images/winners/v2.webp",
    imageAlt: "United Hacks V2 winning projects",
    blurb:
      "Our second hackathon focused on New Year resolutions and positive change, featuring 400+ participants and the largest prize pool to date with industry professional & student judges.",
    caption: "Outstanding winning projects from our largest prize pool",
    stats: [
      { value: "400+", label: "Participants" },
      { value: "75+", label: "Projects" },
      { value: "$15,000+", label: "Prize Pool" },
      { value: "15+", label: "Sponsors" },
      { value: "100+", label: "Workshop Attendees" },
      { value: "10", label: "Workshops" },
    ],
    recap: "https://blog.hackunited.org/united-hacks-v2-hackathon-recap",
    devpost: "https://unitedhacksv2.devpost.com/",
  },
  {
    id: "v3",
    name: "United Hacks V3",
    date: "September 2024",
    theme: "Communication",
    image: "/images/v3.png",
    texture: "/images/winners/v3.webp",
    imageAlt: "United Hacks V3 winning projects",
    blurb:
      'Our third hackathon introduced "Mini-Hacks" with a focus on communication solutions, featuring 150+ participants and industry professional judges in a more intimate setting.',
    caption: "Mini-Hacks showcasing innovative winning projects",
    stats: [
      { value: "150+", label: "Participants" },
      { value: "$2,000+", label: "Prize Pool" },
      { value: "75+", label: "Workshop Attendees" },
      { value: "10", label: "Workshops" },
    ],
    note: {
      title: "Mini-Hacks Format",
      detail: "Smaller, focused hackathon experience",
    },
    recap: "https://blog.hackunited.org/united-hacks-v3-recap",
    devpost: "https://unitedhacksv3.devpost.com/",
  },
  {
    id: "v4",
    name: "United Hacks V4",
    date: "January 2025",
    theme: "Social Impact",
    image: "/images/v4.png",
    texture: "/images/winners/v4.webp",
    imageAlt: "United Hacks V4 winning projects",
    blurb:
      "Our most recent hackathon focused on social impact solutions, bringing together 400+ participants to tackle real-world challenges with industry professional judges.",
    caption: "Featuring winning projects from our latest hackathon",
    stats: [
      { value: "400+", label: "Participants" },
      { value: "80+", label: "Projects" },
      { value: "$10,000+", label: "Prize Pool" },
      { value: "10+", label: "Sponsors" },
      { value: "100+", label: "Workshop Attendees" },
      { value: "10", label: "Workshops" },
    ],
    recap:
      "https://blog.hackunited.org/united-hacks-v4-celebrating-innovation-creativity-and-impact",
    devpost: "https://unitedhacksv4.devpost.com/",
  },
  {
    id: "v5",
    name: "United Hacks V5",
    date: "July 2025",
    theme: "Entertainment",
    image: "/images/imagecoo.png",
    texture: "/images/winners/v5.webp",
    imageAlt: "United Hacks V5 winning projects",
    blurb:
      "Our fifth hackathon focused on entertainment solutions, bringing together 1250+ participants to tackle real-world challenges with industry professional judges.",
    caption: "Featuring winning projects from our entertainment themed hackathon.",
    stats: [
      { value: "1250+", label: "Participants" },
      { value: "200+", label: "Projects" },
      { value: "$50,000+", label: "Prize Pool" },
      { value: "10+", label: "Sponsors" },
      { value: "250+", label: "Workshop Attendees" },
      { value: "8", label: "Workshops" },
    ],
    recap: "https://blog.hackunited.org/united-hacks-v5-recap",
    devpost: "https://unitedhacksv5.devpost.com/",
  },
  {
    id: "v6",
    name: "United Hacks V6",
    date: "January 2026",
    theme: "Human Interaction",
    image: "/images/v6.webp",
    texture: "/images/winners/v6.webp",
    imageAlt: "United Hacks V6 winning projects",
    blurb:
      "Our sixth hackathon focused on solutions embracing human interaction, bringing together 1200+ participants to tackle real-world challenges, while connecting in our Discord community of 3000+ programmers.",
    caption: "Featuring winning projects from our human interaction themed hackathon.",
    stats: [
      { value: "1200+", label: "Participants" },
      { value: "160+", label: "Projects" },
      { value: "$20,000+", label: "Prize Pool" },
      { value: "11+", label: "Sponsors" },
      { value: "200+", label: "Workshop Attendees" },
      { value: "6", label: "Workshops" },
    ],
    recap: "https://blog.hackunited.org/united-hacks-v6-hackathon-recap",
    devpost: "https://unitedhacksv6.devpost.com/",
  },
  {
    id: "v7",
    name: "United Hacks V7",
    date: "July 2026",
    theme: "Sports",
    image: "/images/v7.webp",
    texture: "/images/winners/v7.webp",
    imageAlt: "United Hacks V7 winning projects: DevForge, Simon, Apex, Pitchside, ClearCall and Panacea",
    blurb:
      "Our seventh hackathon focused on sports-inspired solutions, bringing together 1100+ participants for a 48-hour online build with industry professional judges.",
    caption: "Featuring winning projects from our sports themed hackathon.",
    stats: [
      { value: "1100+", label: "Participants" },
      { value: "100+", label: "Projects" },
    ],
    devpost: "https://unitedhacksv7.devpost.com/",
  },
];
