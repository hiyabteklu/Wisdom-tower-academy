/**
 * Academy packages — Freshman 300; ECE S1 300 only (no full-year).
 * Other tracks 500 (not for sale until ready).
 */

export type AcademyPackage = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  priceEtb: number;
  href: string;
  image: string;
  includes: string[];
  enrolledLabel: string;
  group: "grades" | "branch" | "special";
};

export const PACKAGE_PRICE_ETB = 500;
export const FRESHMAN_PRICE_ETB = 300;

export const packageImages = {
  "grade-9-12": "/images/packages/grade-9-12_9842aa.jpeg",
  "grade-9": "/images/packages/grade-9_67df27.jpeg",
  "grade-10": "/images/packages/grade-10_156767.jpeg",
  "grade-11": "/images/packages/grade-11_6309fc.jpeg",
  "grade-12": "/images/packages/grade-12_f1ddef.jpeg",
  freshman: "/images/packages/freshman_00241b.jpeg",
  uat: "/images/packages/uat_56b257.jpeg",
  gat: "/images/packages/gat_46ddb1.jpeg",
  coc: "/images/packages/coc_e44a09.jpeg",
  "exit-exam": "/images/packages/exit-exam_c32a43.jpeg",
} as const;

export const academyPackages: AcademyPackage[] = [
  {
    id: "grade-9",
    name: "Grade 9 Package",
    shortName: "G9",
    description: "Foundation year — core subjects, resources, and practice for Grade 9.",
    priceEtb: PACKAGE_PRICE_ETB,
    href: "/academy/grades/9",
    image: packageImages["grade-9"],
    includes: ["Grade 9 resource hubs", "Books · practice · exams path", "500 ETB one-time"],
    enrolledLabel: "320+ students",
    group: "grades",
  },
  {
    id: "grade-10",
    name: "Grade 10 Package",
    shortName: "G10",
    description: "Build depth — practice and concept mastery for Grade 10.",
    priceEtb: PACKAGE_PRICE_ETB,
    href: "/academy/grades/10",
    image: packageImages["grade-10"],
    includes: ["Grade 10 resource hubs", "Books · practice · exams path", "500 ETB one-time"],
    enrolledLabel: "410+ students",
    group: "grades",
  },
  {
    id: "grade-11",
    name: "Grade 11 Package",
    shortName: "G11",
    description: "Advance — exam readiness and application for Grade 11.",
    priceEtb: PACKAGE_PRICE_ETB,
    href: "/academy/grades/11",
    image: packageImages["grade-11"],
    includes: ["Grade 11 resource hubs", "Books · practice · exams path", "500 ETB one-time"],
    enrolledLabel: "480+ students",
    group: "grades",
  },
  {
    id: "grade-12",
    name: "Grade 12 Package",
    shortName: "G12",
    description: "Peak year — finals focus and polish for Grade 12.",
    priceEtb: PACKAGE_PRICE_ETB,
    href: "/academy/grades/12",
    image: packageImages["grade-12"],
    includes: ["Grade 12 resource hubs", "Books · practice · exams path", "500 ETB one-time"],
    enrolledLabel: "560+ students",
    group: "grades",
  },
  {
    id: "freshman",
    name: "Freshman Package",
    shortName: "Freshman",
    description:
      "All first-year subjects in one package — math, sciences, languages, civics, and more. One purchase unlocks every subject’s learning hubs.",
    priceEtb: FRESHMAN_PRICE_ETB,
    href: "/academy/freshman",
    image: packageImages.freshman,
    includes: [
      "All freshman subjects",
      "Books · notes · flashcards · exams",
      "300 ETB one-time",
    ],
    enrolledLabel: "890+ students",
    group: "branch",
  },
  {
    id: "uat",
    name: "UAT Package",
    shortName: "UAT",
    description: "University Admission Test preparation — practice, mocks, and strategies.",
    priceEtb: PACKAGE_PRICE_ETB,
    href: "/academy/uat",
    image: packageImages.uat,
    includes: ["UAT track", "Timed practice style", "500 ETB one-time"],
    enrolledLabel: "610+ students",
    group: "branch",
  },
  {
    id: "gat",
    name: "GAT Package",
    shortName: "GAT",
    description: "Graduate Admission Test coaching — quantitative, verbal, and analytical.",
    priceEtb: PACKAGE_PRICE_ETB,
    href: "/academy/gat",
    image: packageImages.gat,
    includes: ["GAT track", "Section drills", "500 ETB one-time"],
    enrolledLabel: "420+ students",
    group: "branch",
  },
  {
    id: "coc",
    name: "COC Package",
    shortName: "COC",
    description: "Certificate of Competency preparation — skills assessment and exam readiness.",
    priceEtb: PACKAGE_PRICE_ETB,
    href: "/academy/coc",
    image: packageImages.coc,
    includes: ["COC track", "Competency practice", "500 ETB one-time"],
    enrolledLabel: "380+ students",
    group: "branch",
  },
  {
    id: "exit-exam",
    name: "Exit Exam Package",
    shortName: "Exit Exam",
    description: "University exit exam preparation with structured review and practice tests.",
    priceEtb: PACKAGE_PRICE_ETB,
    href: "/academy/exit-exam",
    image: packageImages["exit-exam"],
    includes: ["Exit exam track", "Structured review", "500 ETB one-time"],
    enrolledLabel: "510+ students",
    group: "branch",
  },
  {
    id: "ece-y3-sem-1",
    name: "ECE Year 3 — Semester 1",
    shortName: "ECE S1",
    description:
      "First semester — Engineering Thermodynamics, Networks, Machines, Digital Logic, and more.",
    priceEtb: 300,
    href: "/academy/special-packages/electrical-computer-engineering/sem-1",
    image: "/images/special-packages/ece-sem-1.jpg",
    includes: ["7 courses · Semester 1", "Learning hubs per course", "300 ETB one-time"],
    enrolledLabel: "Special track",
    group: "special",
  },
  {
    id: "ece-y3-sem-2",
    name: "ECE Year 3 — Semester 2",
    shortName: "ECE S2",
    description:
      "Second semester — Applied Electronics, EM Fields, Signals, OOP, Computational Methods, and more.",
    priceEtb: 300,
    href: "/academy/special-packages/electrical-computer-engineering/sem-2",
    image: "/images/special-packages/ece-sem-2.jpg",
    includes: ["7 courses · Semester 2", "Learning hubs per course", "Coming soon"],
    enrolledLabel: "Special track",
    group: "special",
  },
];

export function getPackage(id: string): AcademyPackage | undefined {
  return academyPackages.find((p) => p.id === id);
}

export function packageIdForGrade(gradeId: string): string {
  return `grade-${gradeId}`;
}

export type PaymentMethodId = "telebirr" | "cbe" | "abyssinia" | "other";

export type PaymentMethod = {
  id: PaymentMethodId;
  name: string;
  shortLabel: string;
  logo: string;
  instructions: string[];
  accountLabel: string;
  accountValue: string;
  accountName: string;
};

const ACCOUNT_NAME = "Hiyab Teklu";

export const paymentMethods: PaymentMethod[] = [
  {
    id: "telebirr",
    name: "Telebirr",
    shortLabel: "Telebirr",
    logo: "/images/banks/telebirr.png",
    accountLabel: "Telebirr number",
    accountValue: "0900763030",
    accountName: ACCOUNT_NAME,
    instructions: [
      "Open Telebirr and send the exact package amount.",
      "Put the order reference in the remark / reason field.",
      "Keep the SMS confirmation — enter the transaction ID on the form below.",
    ],
  },
  {
    id: "cbe",
    name: "Commercial Bank of Ethiopia (CBE)",
    shortLabel: "CBE",
    logo: "/images/banks/cbe.png",
    accountLabel: "Account number",
    accountValue: "1000665070654",
    accountName: ACCOUNT_NAME,
    instructions: [
      "Transfer via CBE Birr, mobile, or branch to the account below.",
      "Put the order reference in the transfer narration.",
      "Save the receipt / transaction ID and submit it below.",
    ],
  },
  {
    id: "abyssinia",
    name: "Bank of Abyssinia",
    shortLabel: "Abyssinia",
    logo: "/images/banks/abyssinia.png",
    accountLabel: "Account number",
    accountValue: "211958545",
    accountName: ACCOUNT_NAME,
    instructions: [
      "Transfer via Abyssinia mobile or branch to the account below.",
      "Include the order reference in the remark.",
      "Submit the transaction reference on this page after paying.",
    ],
  },
  {
    id: "other",
    name: "Other local bank",
    shortLabel: "Other bank",
    logo: "/images/banks/other.png",
    accountLabel: "Prefer Telebirr, CBE, or Abyssinia",
    accountValue: "See Telebirr / CBE / Abyssinia",
    accountName: ACCOUNT_NAME,
    instructions: [
      "Prefer Telebirr, CBE, or Abyssinia for faster verification.",
      "If you use another bank, transfer to one of the accounts above when possible.",
      "Submit transaction reference + bank name in the note field.",
    ],
  },
];

export function formatEtb(amount: number) {
  return `${amount.toLocaleString("en-ET")} ETB`;
}
