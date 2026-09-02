/** Special packages — semester purchases only (no full-year cart).
*
 * ECE Y3: Semester 1 = 300 ETB (live). Semester 2 = coming soon.
*/

export type SpecialCourse = {
  code: string;
  title: string;
  slug: string;
  image: string;
};

export type SpecialSemester = {
  id: string;
  label: string;
  shortLabel: string;
  image: string;
  packageId: string;
  priceEtb: number;
  /** false = not for sale yet */
  purchasable: boolean;
  courses: SpecialCourse[];
};

export type SpecialPackage = {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  image: string;
  yearLabel: string;
  semesterPriceEtb: number;
  semesters: SpecialSemester[];
};

export const SPECIAL_PACKAGES_HUB_IMAGE =
  "/images/special-packages/special-packages.jpg";

export const ECE_SEMESTER_PRICE_ETB = 300;

function slugify(code: string) {
  return code.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function course(code: string, title: string): SpecialCourse {
  const slug = slugify(code);
  return {
    code,
    title,
    slug,
    image: `/images/special-packages/courses/${slug}.jpg`,
  };
}

const eceY3Sem1: SpecialCourse[] = [
  course("MEng3052", "Engineering Thermodynamics"),
  course("ECEg3082", "Network Analysis and Synthesis"),
  course("ECEg3092", "Introduction to Electrical Machines"),
  course("ECEg3094", "Electrical Engineering Lab IV"),
  course("ECEg3102", "Digital Logic Design"),
  course("ECEg3052", "Electrical Materials and Technology"),
  course("ECEg3096", "Electrical Workshop Practice II"),
];

const eceY3Sem2: SpecialCourse[] = [
  course("ECEg3071", "Applied Electronics II"),
  course("Econ1011", "Economics"),
  course("ECEg3051", "Electromagnetic Fields"),
  course("ECEg3081", "Signals and Systems Analysis"),
  course("ECEg3073", "Electrical Engineering Laboratory III"),
  course("ECEg3101", "Object Oriented Programming"),
  course("ECEg3061", "Computational Methods"),
];

export const specialPackages: SpecialPackage[] = [
  {
    id: "ece-y3",
    slug: "electrical-computer-engineering",
    name: "Electrical & Computer Engineering",
    blurb:
      "Year 3 — semester-based access. Semester 1 is free for signed-in users; Semester 2 is coming soon.",
    image: "/images/special-packages/ece.jpg",
    yearLabel: "3rd Year",
    semesterPriceEtb: ECE_SEMESTER_PRICE_ETB,
    semesters: [
      {
        id: "sem-1",
        label: "First Semester",
        shortLabel: "Semester 1",
        image: "/images/special-packages/ece-sem-1.jpg",
        packageId: "ece-y3-sem-1",
        priceEtb: ECE_SEMESTER_PRICE_ETB,
        purchasable: true,
        courses: eceY3Sem1,
      },
      {
        id: "sem-2",
        label: "Second Semester",
        shortLabel: "Semester 2",
        image: "/images/special-packages/ece-sem-2.jpg",
        packageId: "ece-y3-sem-2",
        priceEtb: ECE_SEMESTER_PRICE_ETB,
        purchasable: false,
        courses: eceY3Sem2,
      },
    ],
  },
];

export function getSpecialPackage(slug: string) {
  return specialPackages.find((p) => p.slug === slug);
}

export function getSemester(pkgSlug: string, semId: string) {
  const pkg = getSpecialPackage(pkgSlug);
  if (!pkg) return null;
  const sem = pkg.semesters.find((s) => s.id === semId);
  if (!sem) return null;
  return { pkg, sem };
}

export function getCourse(pkgSlug: string, semId: string, courseSlug: string) {
  const found = getSemester(pkgSlug, semId);
  if (!found) return null;
  const courseItem = found.sem.courses.find((c) => c.slug === courseSlug);
  if (!courseItem) return null;
  return { ...found, course: courseItem };
}
