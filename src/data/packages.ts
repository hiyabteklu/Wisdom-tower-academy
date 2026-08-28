/**
 * Academy packages — 500 ETB each.
 * Images: public/images/packages/{id}.jpg  (16:9)
 * Bank logos: public/images/banks/{id}.png  (1:1)
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
  group: "grades" | "branch";
};

export const PACKAGE_PRICE_ETB = 500;

function pkgImg(id: string) {
  return `/images/packages/${id}.jpg`;
}

export const academyPackages: AcademyPackage[] = [
  {
    id: "grade-9",
    name: "Grade 9 Package",
    shortName: "G9",
    description: "Foundation year — core subjects, resources, and practice for Grade 9.",
    priceEtb: PACKAGE_PRICE_ETB,
    href: "/academy/grades/9",
    image: pkgImg("grade-9"),
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
    image: pkgImg("grade-10"),
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
    image: pkgImg("grade-11"),
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
    image: pkgImg("grade-12"),
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
    image: pkgImg("freshman"),
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
    image: pkgImg("uat"),
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
    image: pkgImg("gat"),
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
    image: pkgImg("coc"),
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
    image: pkgImg("exit-exam"),
    includes: ["Exit exam track", "Structured review", "500 ETB one-time"],
    enrolledLabel: "510+ students",
    group: "branch",
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
  /** public/images/banks/{id}.png */
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
      "Open Telebirr and send the exact package amount (500 ETB).",
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
