export interface RemedialSubject {
  id: string;
  name: string;
  description: string;
  /** 16:9 cover — public/images/remedial/{id}.jpg */
  image: string;
}

function img(id: string) {
  return `/images/remedial/${id}.jpg`;
}

export const remedialSubjects: RemedialSubject[] = [
  {
    id: "english",
    name: "English",
    description: "Core language skills, reading, writing and communication",
    image: img("english"),
  },
  {
    id: "maths",
    name: "Maths",
    description: "Foundational mathematics and problem-solving",
    image: img("maths"),
  },
  {
    id: "physics",
    name: "Physics",
    description: "Mechanics, energy and physical principles",
    image: img("physics"),
  },
  {
    id: "chemistry",
    name: "Chemistry",
    description: "Matter, reactions and chemical foundations",
    image: img("chemistry"),
  },
  {
    id: "biology",
    name: "Biology",
    description: "Life sciences and living systems",
    image: img("biology"),
  },
  {
    id: "history",
    name: "History",
    description: "Key events and historical perspectives",
    image: img("history"),
  },
  {
    id: "geography",
    name: "Geography",
    description: "Physical and human geography basics",
    image: img("geography"),
  },
];

export function getRemedialSubject(id: string) {
  return remedialSubjects.find((s) => s.id === id);
}
