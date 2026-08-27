/**
 * Demo library for My Learning / Cart.
 * Replace with Supabase enrollments + orders when payments go live.
 */

export type LearningKind = "course" | "service" | "bundle";

export type LearningItem = {
  id: string;
  kind: LearningKind;
  title: string;
  subtitle: string;
  /** academy | digital */
  space: "academy" | "digital";
  progress: number; // 0–100
  status: "in_progress" | "not_started" | "completed";
  href: string;
  image: string;
  lastAccess?: string;
  badge?: string;
};

export type CartItem = {
  id: string;
  title: string;
  subtitle: string;
  space: "academy" | "digital";
  priceLabel: string;
  image: string;
  href: string;
};

/** Demo enrollments — shows how a student’s library looks */
export const demoLearning: LearningItem[] = [
  {
    id: "l1",
    kind: "course",
    title: "Grade 12 · Mathematics",
    subtitle: "Question banks · solutions · practice path",
    space: "academy",
    progress: 62,
    status: "in_progress",
    href: "/academy/grades/12",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80",
    lastAccess: "Today",
    badge: "Continue",
  },
  {
    id: "l2",
    kind: "course",
    title: "UAT Quantitative Path",
    subtitle: "Mocks, strategies, timed drills",
    space: "academy",
    progress: 28,
    status: "in_progress",
    href: "/academy/uat",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80",
    lastAccess: "Yesterday",
  },
  {
    id: "l3",
    kind: "course",
    title: "Freshman · General Physics",
    subtitle: "Notes, examples, quiz practice",
    space: "academy",
    progress: 100,
    status: "completed",
    href: "/academy/freshman",
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbe4f9df?w=600&q=80",
    lastAccess: "Last week",
    badge: "Completed",
  },
  {
    id: "l4",
    kind: "service",
    title: "Logo & brand starter",
    subtitle: "Digital · Graphic design package",
    space: "digital",
    progress: 45,
    status: "in_progress",
    href: "/services/graphic-print-design",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
    lastAccess: "2 days ago",
    badge: "In delivery",
  },
  {
    id: "l5",
    kind: "service",
    title: "CV rewrite · professional",
    subtitle: "Digital · Writing & editorial",
    space: "digital",
    progress: 100,
    status: "completed",
    href: "/services/writing-editorial",
    image: "https://images.unsplash.com/photo-1455390580379-a91bf48e9372?w=600&q=80",
    lastAccess: "3 weeks ago",
  },
  {
    id: "l6",
    kind: "course",
    title: "Study techniques toolkit",
    subtitle: "Free resource · methods that stick",
    space: "academy",
    progress: 0,
    status: "not_started",
    href: "/academy/study-techniques",
    image: "https://images.unsplash.com/photo-1456513080890-44becc0c4d8b?w=600&q=80",
    badge: "Saved",
  },
];

export const demoCart: CartItem[] = [
  {
    id: "c1",
    title: "GAT Full Prep",
    subtitle: "Academy · entrance track",
    space: "academy",
    priceLabel: "Coming soon",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80",
    href: "/academy/gat",
  },
  {
    id: "c2",
    title: "Landing page design",
    subtitle: "Digital · web package",
    space: "digital",
    priceLabel: "Request quote",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80",
    href: "/services/web-digital-marketing",
  },
];
