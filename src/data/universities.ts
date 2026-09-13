import data1 from "./universities-data-1.json";
import data2 from "./universities-data-2.json";

export type Region =
  | "Addis Ababa"
  | "Amhara"
  | "Oromia"
  | "Tigray"
  | "SNNPR"
  | "Somali"
  | "Afar"
  | "Benishangul Gumuz"
  | "Gambela"
  | "Dire Dawa";

export interface University {
  id: string;
  name: string;
  abbr: string;
  region: Region;
  location: string;
  website: string;
  founded?: string;
  campuses?: string;
  climate?: string;
  distanceFromAddisKm?: number;
  distanceNote?: string;
  elevationM?: number;
  knownFor?: string[];
  strengths: string[];
  whatToExpect: string[];
  tips?: string[];
  studentFit?: string;
  featured?: boolean;
  detailed?: boolean;
}

export const regions: Region[] = [
  "Addis Ababa",
  "Amhara",
  "Oromia",
  "Tigray",
  "SNNPR",
  "Somali",
  "Afar",
  "Benishangul Gumuz",
  "Gambela",
  "Dire Dawa",
];

export const universitiesIntro = {
  title: "Ethiopian Universities",
  subtitle: "What it actually feels like to study at each one",
  paragraphs: [
    "Most people pick a university the way they pick a lottery ticket. They hear a name, feel a flicker of pride or fear, and let that flicker decide four years of their life.",
    "That is backwards. A university is not a prize you win. It is a place you will wake up in, eat in, get sick in, fall behind in, and rebuild yourself in, semester after semester. The name on the certificate matters far less than whether the place fits the person who has to actually live inside it.",
    "Rankings and Wikipedia facts will not tell you what you actually need to know. They will not tell you how strict the department is about attendance, whether the cafeteria food is something you can survive on for four years, how quickly the registrar fixes a mistake on your transcript, or how many of your classmates disappear after first semester because the GPA cutoff caught them. Those are the things that decide whether you finish strong or limp through.",
    "So this is not a comparison of prestige. It is written the way someone who has actually been there, or who has listened closely to people who have, would tell a younger sibling before they leave home. Some of it is uncomfortable. All of it is honest.",
  ],
  closing:
    "Read the one for your university, or the one you are hoping to be placed at. Then read it again in your first month there and see how much of it turns out to be true.",
};

export const universities: University[] = [
  ...(data1 as University[]),
  ...(data2 as University[]),
];

export function getUniversity(id: string) {
  return universities.find((u) => u.id === id);
}

export function getFeaturedUniversities() {
  return universities.filter((u) => u.featured);
}

export function getDetailedUniversities() {
  return universities.filter((u) => u.detailed);
}
