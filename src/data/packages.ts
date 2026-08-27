/**
 * Academy packages — 500 ETB each.
 * Grades 9–12 are separate packages. Other branches: one package each.
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
  /** group for UI */
  group: "grades" | "branch";
};

export const PACKAGE_PRICE_ETB = 500;

const img = {
  g9: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
  g10: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80",
  g11: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
  g12: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
  freshman: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
  uat: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
  gat: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
  coc: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
  exit: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&q=80",
};

export const academyPackages: AcademyPackage[] = [
  {
    id: "grade-9",
    name: "Grade 9 Package",
    shortName: "G9",
    description: "Foundation year — core subjects, resources, and practice for Grade 9.",
    priceEtb: PACKAGE_PRICE_ETB,
    href: "/academy/grades/9",
    image: img.g9,
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
    image: img.g10,
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
    image: img.g11,
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
    image: img.g12,
    includes: ["Grade 12 resource hubs", "Books · practice · exams path", "500 ETB one-time"],
    enrolledLabel: "560+ students",
    group: "grades",
  },
  {
    id: "freshman",
    name: "Freshman Package",
    shortName: "Freshman",
    description: "Nineteen first-year subjects — math, sciences, languages, civics, and more.",
    priceEtb: PACKAGE_PRICE_ETB,
    href: "/academy/freshman",
    image: img.freshman,
    includes: ["All freshman subjects", "Notes & practice", "500 ETB one-time"],
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
    image: img.uat,
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
    image: img.gat,
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
    image: img.coc,
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
    image: img.exit,
    includes: ["Exit exam track", "Structured review", "500 ETB one-time"],
    enrolledLabel: "510+ students",
    group: "branch",
  },
];

export function getPackage(id: string): AcademyPackage | undefined {
  return academyPackages.find((p) => p.id === id);
}

/** Map grade id "9" → package id "grade-9" */
export function packageIdForGrade(gradeId: string): string {
  return `grade-${gradeId}`;
}

export type PaymentMethodId = "telebirr" | "cbe" | "awash" | "dashen" | "other";

export type PaymentMethod = {
  id: PaymentMethodId;
  name: string;
  shortLabel: string;
  instructions: string[];
  accountLabel: string;
  accountValue: string;
  accountName: string;
};

export const paymentMethods: PaymentMethod[] = [
  {
    id: "telebirr",
    name: "Telebirr",
    shortLabel: "Telebirr",
    accountLabel: "Telebirr number",
    accountValue: "09XX XXX XXXX",
    accountName: "Wisdom Tower Digital",
    instructions: [
      "Open Telebirr and send the exact package amount.",
      "Use the order reference in the remark / reason field.",
      "Keep the SMS confirmation — enter the transaction ID below.",
    ],
  },
  {
    id: "cbe",
    name: "Commercial Bank of Ethiopia (CBE)",
    shortLabel: "CBE Birr",
    accountLabel: "Account number",
    accountValue: "1000XXXXXXXX",
    accountName: "Wisdom Tower Digital",
    instructions: [
      "Transfer via CBE Birr or branch using the account below.",
      "Put the order reference in the transfer narration.",
      "Save the receipt number / transaction ID.",
    ],
  },
  {
    id: "awash",
    name: "Awash Bank",
    shortLabel: "Awash",
    accountLabel: "Account number",
    accountValue: "0XXXXXXXXX",
    accountName: "Wisdom Tower Digital",
    instructions: [
      "Transfer the exact amount to the Awash account.",
      "Include the order reference in the remark.",
      "Submit the transaction reference on this page.",
    ],
  },
  {
    id: "dashen",
    name: "Dashen Bank",
    shortLabel: "Dashen",
    accountLabel: "Account number",
    accountValue: "5XXXXXXXXX",
    accountName: "Wisdom Tower Digital",
    instructions: [
      "Transfer via Dashen mobile or branch.",
      "Write the order reference on the transfer.",
      "Enter the transaction ID after you pay.",
    ],
  },
  {
    id: "other",
    name: "Other local bank",
    shortLabel: "Other bank",
    accountLabel: "Use CBE or Telebirr preferred",
    accountValue: "Contact us if needed",
    accountName: "Wisdom Tower Digital",
    instructions: [
      "Prefer Telebirr or CBE for faster manual verification.",
      "If you must use another bank, pay and note the full receipt details.",
      "Submit transaction reference + bank name below.",
    ],
  },
];

export function formatEtb(amount: number) {
  return `${amount.toLocaleString("en-ET")} ETB`;
}
