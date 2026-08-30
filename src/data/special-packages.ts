/** Special packages — department / year tracks beyond the six main branches */

export type SpecialCourse = {
  code: string;
  title: string;
  slug: string;
};

export type SpecialSemester = {
  id: string;
  label: string;
  shortLabel: string;
  /** 16:9 cover (CSS gradient id or image path) */
  image: string;
  courses: SpecialCourse[];
};

export type SpecialPackage = {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  image: string;
  yearLabel: string;
  semesters: SpecialSemester[];
};

function slugify(code: string) {
  return code.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

const eceY3Sem1: SpecialCourse[] = [
  { code: "MEng3052", title: "Engineering Thermodynamics", slug: slugify("MEng3052") },
  { code: "ECEg3082", title: "Network Analysis and Synthesis", slug: slugify("ECEg3082") },
  { code: "ECEg3092", title: "Introduction to Electrical Machines", slug: slugify("ECEg3092") },
  { code: "ECEg3094", title: "Electrical Engineering Lab IV", slug: slugify("ECEg3094") },
  { code: "ECEg3102", title: "Digital Logic Design", slug: slugify("ECEg3102") },
  { code: "ECEg3052", title: "Electrical Materials and Technology", slug: slugify("ECEg3052") },
  { code: "ECEg3096", title: "Electrical Workshop Practice II", slug: slugify("ECEg3096") },
];

const eceY3Sem2: SpecialCourse[] = [
  { code: "ECEg3071", title: "Applied Electronics II", slug: slugify("ECEg3071") },
  { code: "Econ1011", title: "Economics", slug: slugify("Econ1011") },
  { code: "ECEg3051", title: "Electromagnetic Fields", slug: slugify("ECEg3051") },
  { code: "ECEg3081", title: "Signals and Systems Analysis", slug: slugify("ECEg3081") },
  { code: "ECEg3073", title: "Electrical Engineering Laboratory III", slug: slugify("ECEg3073") },
  { code: "ECEg3101", title: "Object Oriented Programming", slug: slugify("ECEg3101") },
  { code: "ECEg3061", title: "Computational Methods", slug: slugify("ECEg3061") },
];

export const specialPackages: SpecialPackage[] = [
  {
    id: "ece-y3",
    slug: "electrical-computer-engineering",
    name: "Electrical & Computer Engineering",
    blurb: "Year 3 course packs — semester by semester, then each course.",
    image: "/images/home/academy.jpg",
    yearLabel: "3rd Year",
    semesters: [
      {
        id: "sem-1",
        label: "First Semester",
        shortLabel: "Semester 1",
        image: "/images/home/stat-services.jpg",
        courses: eceY3Sem1,
      },
      {
        id: "sem-2",
        label: "Second Semester",
        shortLabel: "Semester 2",
        image: "/images/home/stat-partners.jpg",
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
  const course = found.sem.courses.find((c) => c.slug === courseSlug);
  if (!course) return null;
  return { ...found, course };
}
