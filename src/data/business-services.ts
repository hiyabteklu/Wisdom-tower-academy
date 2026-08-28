/** Ongoing subscription-style services for registered businesses */

export type BillingCycle = "monthly" | "quarterly" | "project";

export interface BusinessService {
  id: string;
  name: string;
  category: string;
  description: string;
  billing: BillingCycle;
  /** Display price in ETB (0 = custom quote) */
  priceFromEtb: number;
  features: string[];
  icon: "megaphone" | "share" | "palette" | "globe" | "search" | "pen" | "camera" | "headset" | "chart";
}

export const businessServices: BusinessService[] = [
  {
    id: "social-media-management",
    name: "Social media management",
    category: "Marketing",
    description:
      "Planning, posting, community replies, and monthly reporting across your channels.",
    billing: "monthly",
    priceFromEtb: 8500,
    features: ["Content calendar", "3–5 posts/week", "Engagement monitoring", "Monthly report"],
    icon: "share",
  },
  {
    id: "digital-marketing",
    name: "Digital marketing",
    category: "Marketing",
    description: "Campaign strategy, ads setup support, and conversion-focused funnels.",
    billing: "monthly",
    priceFromEtb: 12000,
    features: ["Channel strategy", "Ad creative briefs", "Performance review", "A/B test notes"],
    icon: "megaphone",
  },
  {
    id: "seo",
    name: "SEO & visibility",
    category: "Marketing",
    description: "On-page SEO, technical checks, and content recommendations that compound.",
    billing: "monthly",
    priceFromEtb: 9000,
    features: ["Keyword map", "On-page fixes", "Monthly rankings snapshot", "Content briefs"],
    icon: "search",
  },
  {
    id: "graphic-design-retainer",
    name: "Graphic design retainer",
    category: "Creative",
    description: "Ongoing brand assets — posts, stories, ads, and light print support.",
    billing: "monthly",
    priceFromEtb: 7000,
    features: ["Fixed monthly credits", "Brand-consistent templates", "Revision rounds", "Source files"],
    icon: "palette",
  },
  {
    id: "website-build",
    name: "Website development",
    category: "Web",
    description: "New site or redesign — structure, design, and launch with your team.",
    billing: "project",
    priceFromEtb: 45000,
    features: ["Scope workshop", "Responsive build", "CMS handoff", "Launch support"],
    icon: "globe",
  },
  {
    id: "website-maintenance",
    name: "Website maintenance",
    category: "Web",
    description: "Updates, security, backups, and small content changes so the site stays healthy.",
    billing: "monthly",
    priceFromEtb: 4500,
    features: ["Updates & backups", "Uptime checks", "Content edits", "Priority support"],
    icon: "globe",
  },
  {
    id: "content-writing",
    name: "Content & copywriting",
    category: "Creative",
    description: "Blogs, product pages, email sequences, and campaign copy in your voice.",
    billing: "monthly",
    priceFromEtb: 6000,
    features: ["Editorial calendar", "SEO-aware drafts", "Edits included", "Brand tone guide"],
    icon: "pen",
  },
  {
    id: "video-photo",
    name: "Photo & short video",
    category: "Creative",
    description: "Shoot days or edit packages for social, ads, and product launches.",
    billing: "project",
    priceFromEtb: 15000,
    features: ["Shot list", "Edit package", "Captions/subtitles", "Platform crops"],
    icon: "camera",
  },
  {
    id: "virtual-ops",
    name: "Ops & admin support",
    category: "Operations",
    description: "Inbox triage, calendar, light CRM hygiene — coordinated with your marketing stack.",
    billing: "monthly",
    priceFromEtb: 5500,
    features: ["Shared inbox rules", "Weekly status", "Handoff notes", "Escalation path"],
    icon: "headset",
  },
  {
    id: "analytics-reporting",
    name: "Analytics & reporting",
    category: "Insights",
    description: "One dashboard narrative: traffic, posts, leads, and what to do next.",
    billing: "monthly",
    priceFromEtb: 5000,
    features: ["KPI board", "Weekly digest", "Goal tracking", "Team insights"],
    icon: "chart",
  },
];

export function formatBizPrice(etb: number, billing: BillingCycle) {
  if (!etb) return "Custom quote";
  const n = new Intl.NumberFormat("en-ET", { maximumFractionDigits: 0 }).format(etb);
  if (billing === "monthly") return `From ${n} ETB/mo`;
  if (billing === "quarterly") return `From ${n} ETB/qtr`;
  return `From ${n} ETB`;
}

export function getBusinessService(id: string) {
  return businessServices.find((s) => s.id === id);
}
