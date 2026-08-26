export interface FreshmanSubject {
  id: string;
  name: string;
  description: string;
  /** public/images/freshman/{id}.jpg */
  image: string;
}

function img(id: string) {
  return `/images/freshman/${id}.jpg`;
}

export const freshmanSubjects: FreshmanSubject[] = [
  {
    id: "mathematics",
    name: "Mathematics",
    description: "Core college mathematics foundations",
    image: img("mathematics"),
  },
  {
    id: "english-1",
    name: "English 1",
    description: "Academic writing and communication",
    image: img("english-1"),
  },
  {
    id: "physics",
    name: "Physics",
    description: "Mechanics, energy, and physical principles",
    image: img("physics"),
  },
  {
    id: "psychology",
    name: "Psychology",
    description: "Introduction to mind and behavior",
    image: img("psychology"),
  },
  {
    id: "logic",
    name: "Logic",
    description: "Reasoning, arguments, and critical thinking",
    image: img("logic"),
  },
  {
    id: "geography",
    name: "Geography",
    description: "Physical and human geography basics",
    image: img("geography"),
  },
  {
    id: "anthropology",
    name: "Anthropology",
    description: "Culture, society, and human diversity",
    image: img("anthropology"),
  },
  {
    id: "civics",
    name: "Civics",
    description: "Citizenship, governance, and civic life",
    image: img("civics"),
  },
  {
    id: "economics",
    name: "Economics",
    description: "Markets, choice, and economic systems",
    image: img("economics"),
  },
  {
    id: "emerging-technology",
    name: "Emerging Technology",
    description: "New tech shaping the modern world",
    image: img("emerging-technology"),
  },
  {
    id: "entrepreneurship",
    name: "Entrepreneurship",
    description: "Ideas, startups, and value creation",
    image: img("entrepreneurship"),
  },
  {
    id: "global-trends",
    name: "Global Trends",
    description: "World issues and contemporary shifts",
    image: img("global-trends"),
  },
  {
    id: "history",
    name: "History",
    description: "Key events and historical perspectives",
    image: img("history"),
  },
  {
    id: "inclusiveness",
    name: "Inclusiveness",
    description: "Equity, diversity, and belonging",
    image: img("inclusiveness"),
  },
  {
    id: "chemistry",
    name: "Chemistry",
    description: "Matter, reactions, and chemical foundations",
    image: img("chemistry"),
  },
  {
    id: "biology",
    name: "Biology",
    description: "Life sciences and living systems",
    image: img("biology"),
  },
  {
    id: "cpp-programming",
    name: "C++ Programming",
    description: "Programming fundamentals with C++",
    image: img("cpp-programming"),
  },
  {
    id: "applied-math-1",
    name: "Applied Math 1",
    description: "Mathematics applied to real problems",
    image: img("applied-math-1"),
  },
  {
    id: "english-2",
    name: "English 2",
    description: "Advanced reading and academic English",
    image: img("english-2"),
  },
];

export function getFreshmanSubject(id: string) {
  return freshmanSubjects.find((s) => s.id === id);
}
