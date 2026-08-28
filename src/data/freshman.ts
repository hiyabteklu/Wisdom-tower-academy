export interface FreshmanSubject {
  id: string;
  name: string;
  description: string;
  /** 16:9 cover image */
  image: string;
}

/** Unsplash 16:9 crops (1280×720) — subject-themed placeholders */
function img16x9(photoId: string) {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1280&h=720&q=80`;
}

export const freshmanSubjects: FreshmanSubject[] = [
  {
    id: "mathematics",
    name: "Mathematics",
    description: "Core college mathematics foundations",
    image: img16x9("photo-1635070041078-e363dbe005cb"),
  },
  {
    id: "english-1",
    name: "English 1",
    description: "Academic writing and communication",
    image: img16x9("photo-14565130808-af32db2c6b2f"),
  },
  {
    id: "physics",
    name: "Physics",
    description: "Mechanics, energy, and physical principles",
    image: img16x9("photo-1636466497217-26a8cbe4f9df"),
  },
  {
    id: "psychology",
    name: "Psychology",
    description: "Introduction to mind and behavior",
    image: img16x9("photo-1507413245164-6160d8298b31"),
  },
  {
    id: "logic",
    name: "Logic",
    description: "Reasoning, arguments, and critical thinking",
    image: img16x9("photo-1454165804606-c3d57bc86b40"),
  },
  {
    id: "geography",
    name: "Geography",
    description: "Physical and human geography basics",
    image: img16x9("photo-1524661135-423995f22d0b"),
  },
  {
    id: "anthropology",
    name: "Anthropology",
    description: "Culture, society, and human diversity",
    image: img16x9("photo-1529156069898-49953e39b3ac"),
  },
  {
    id: "civics",
    name: "Civics",
    description: "Citizenship, governance, and civic life",
    image: img16x9("photo-1529107386315-e1a2ed48a620"),
  },
  {
    id: "economics",
    name: "Economics",
    description: "Markets, choice, and economic systems",
    image: img16x9("photo-1611974789855-9c2a0a7236a3"),
  },
  {
    id: "emerging-technology",
    name: "Emerging Technology",
    description: "New tech shaping the modern world",
    image: img16x9("photo-1518770660439-4636190af475"),
  },
  {
    id: "entrepreneurship",
    name: "Entrepreneurship",
    description: "Ideas, startups, and value creation",
    image: img16x9("photo-1556761175-b413da4baf72"),
  },
  {
    id: "global-trends",
    name: "Global Trends",
    description: "World issues and contemporary shifts",
    image: img16x9("photo-1451187580459-43490279c0fa"),
  },
  {
    id: "history",
    name: "History",
    description: "Key events and historical perspectives",
    image: img16x9("photo-1461360228754-6e81c08f2d47"),
  },
  {
    id: "inclusiveness",
    name: "Inclusiveness",
    description: "Equity, diversity, and belonging",
    image: img16x9("photo-1529156069898-49953e39b3ac"),
  },
  {
    id: "chemistry",
    name: "Chemistry",
    description: "Matter, reactions, and chemical foundations",
    image: img16x9("photo-1532094349884-543bc11b234d"),
  },
  {
    id: "biology",
    name: "Biology",
    description: "Life sciences and living systems",
    image: img16x9("photo-1530026405186-ed1f139313f8"),
  },
  {
    id: "cpp-programming",
    name: "C++ Programming",
    description: "Programming fundamentals with C++",
    image: img16x9("photo-1461749280684-dccba630e2f6"),
  },
  {
    id: "applied-math-1",
    name: "Applied Math 1",
    description: "Mathematics applied to real problems",
    image: img16x9("photo-1509228468518-180dd4864904"),
  },
  {
    id: "english-2",
    name: "English 2",
    description: "Advanced reading and academic English",
    image: img16x9("photo-1481627834876-b7833e8f5570"),
  },
];

export function getFreshmanSubject(id: string) {
  return freshmanSubjects.find((s) => s.id === id);
}
