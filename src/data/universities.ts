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
  strengths: string[];
  whatToExpect: string[];
  tips?: string[];
  featured?: boolean;
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

export const universities: University[] = [
  {
    id: "aau",
    name: "Addis Ababa University",
    abbr: "AAU",
    region: "Addis Ababa",
    location: "Addis Ababa",
    website: "https://www.aau.edu.et",
    founded: "1950",
    campuses: "14+ (6 Kilo, 5 Kilo, 4 Kilo, Mexico, Lideta, Tikur Anbessa, Commerce, Sefereselam, Bishoftu, and more)",
    climate: "Mild at first of the year, warmer later — typical highland capital weather.",
    strengths: [
      "Oldest & flagship research university in Ethiopia",
      "Strong medicine, engineering, social sciences & law",
      "Tikur Anbessa Specialized Hospital for clinical training",
      "66+ undergraduate and 350+ graduate programs",
    ],
    whatToExpect: [
      "Multiple specialized campuses — your program determines where you live and study",
      "6 Kilo: social sciences · 5 Kilo: engineering · 4 Kilo: computer science & engineering",
      "Tikur Anbessa: medicine · Commerce campus: business & management",
      "Campus food is generally better than many regional universities; facilities vary by campus",
      "Water interruptions happen (city-wide issue); bathrooms are usually acceptable, especially at 4 Kilo",
      "Theft is relatively rare if you stay careful; lockers can be unreliable",
      "Mosques and churches are nearby on most campuses",
    ],
    tips: [
      "Engineering students: bring drawing tools and good Math/Mechanics guides",
      "Expect a large, competitive academic environment with many research opportunities",
    ],
    featured: true,
  },
  {
    id: "aastu",
    name: "Addis Ababa Science and Technology University",
    abbr: "AASTU",
    region: "Addis Ababa",
    location: "Addis Ababa (Kilinto / related sites)",
    website: "https://www.aastu.edu.et",
    founded: "2011",
    strengths: [
      "Focused science & technology university",
      "Applied engineering and technology programs",
    ],
    whatToExpect: [
      "Strong emphasis on applied sciences and engineering",
      "Modern technology-oriented campus culture",
      "Good option if you want a pure STEM environment in the capital",
    ],
    featured: true,
  },
  {
    id: "ju",
    name: "Jimma University",
    abbr: "JU",
    region: "Oromia",
    location: "Jimma (~390 km SW of Addis Ababa)",
    website: "https://ju.edu.et",
    campuses: "Main campus, Business & Economics (connected by bridge), Technology campus, and more",
    climate: "Warm. Students from hotter areas may find it mild; those from cold highlands will feel the heat — pack light clothes.",
    strengths: [
      "Community-based education model (“We are in the Community!”)",
      "Strong health sciences, agriculture, and community engagement",
      "Historic city with Aba Jifar palace nearby",
      "Rapidly growing infrastructure and beautiful campus buildings",
    ],
    whatToExpect: [
      "Main campus hosts Health, Law & Governance, Natural Sciences, Social Sciences, and Behavioral Sciences",
      "Business & Economics college is a short walk across a bridge from main campus",
      "Technology campus for engineering and computing",
      "Known as one of the more student-friendly environments for both living and learning",
      "City has historical attractions worth visiting on free days",
    ],
    tips: [
      "Bring lighter clothing and good sun protection",
      "Community-based education means you will engage with real community projects",
    ],
    featured: true,
  },
  {
    id: "mu",
    name: "Mekelle University",
    abbr: "MU",
    region: "Tigray",
    location: "Mekelle (~780 km north of Addis)",
    website: "https://www.mu.edu.et",
    campuses: "Multiple campuses across Mekelle",
    strengths: [
      "One of the largest public universities in Ethiopia",
      "Research-intensive classification",
      "Broad range of undergraduate and postgraduate programs",
    ],
    whatToExpect: [
      "Large student body and diverse colleges/institutes",
      "Northern highland climate — cooler than the lowlands",
      "Strong regional role in Tigray and national research networks",
    ],
    featured: true,
  },
  {
    id: "hru",
    name: "Haramaya University",
    abbr: "HRU",
    region: "Oromia",
    location: "Haramaya (near Harar)",
    website: "https://www.haramaya.edu.et",
    strengths: [
      "Historic strength in agriculture and related sciences",
      "Growing research output and international partnerships",
      "30k+ enrolled learners",
    ],
    whatToExpect: [
      "Eastern Ethiopia setting with distinct climate and culture",
      "Strong agricultural and natural-resource focus alongside other faculties",
      "Active in regional and continental academic networks",
    ],
    featured: true,
  },
  {
    id: "bdu",
    name: "Bahir Dar University",
    abbr: "BDU",
    region: "Amhara",
    location: "Bahir Dar (Lake Tana)",
    website: "https://www.bdu.edu.et",
    founded: "2000 (roots older)",
    strengths: [
      "Large comprehensive university by Lake Tana",
      "Strong education, technology, and health programs",
      "Beautiful lakeside setting",
    ],
    whatToExpect: [
      "Multiple campuses in and around Bahir Dar",
      "Cooler highland climate near the lake",
      "Good student life environment with natural attractions nearby",
    ],
    featured: true,
  },
  {
    id: "uog",
    name: "University of Gondar",
    abbr: "UoG",
    region: "Amhara",
    location: "Gondar",
    website: "https://www.uog.edu.et",
    strengths: [
      "Pioneer in public health and medicine in Ethiopia",
      "Historic city setting",
      "Strong health sciences tradition",
    ],
    whatToExpect: [
      "Northern highland climate",
      "Rich historical surroundings (castles, churches)",
      "Excellent reputation in health-related fields",
    ],
    featured: true,
  },
  {
    id: "hwu",
    name: "Hawassa University",
    abbr: "HWU",
    region: "SNNPR",
    location: "Hawassa",
    website: "https://www.hu.edu.et",
    strengths: [
      "Comprehensive university in southern Ethiopia",
      "Agriculture, forestry (Wondo Genet), and health strengths",
      "Lakeside city environment",
    ],
    whatToExpect: [
      "Multiple campuses including agriculture and forestry sites",
      "Moderate climate near Lake Hawassa",
      "Growing range of programs across sciences and social sciences",
    ],
    featured: true,
  },
  {
    id: "amu",
    name: "Arba Minch University",
    abbr: "AMU",
    region: "SNNPR",
    location: "Arba Minch",
    website: "https://www.amu.edu.et",
    strengths: [
      "Known for water technology, agriculture, and natural sciences",
      "Scenic location near lakes and parks",
    ],
    whatToExpect: [
      "Southern Ethiopia climate — warmer",
      "Strong applied and environmental programs",
      "Beautiful natural surroundings",
    ],
  },
  {
    id: "axu",
    name: "Aksum University",
    abbr: "AXU",
    region: "Tigray",
    location: "Aksum",
    website: "https://www.aku.edu.et",
    strengths: ["Northern Tigray university", "Growing academic offerings"],
    whatToExpect: [
      "Historic city of Aksum",
      "Highland climate",
      "Developing facilities and programs",
    ],
  },
  {
    id: "au",
    name: "Ambo University",
    abbr: "AU",
    region: "Oromia",
    location: "Ambo",
    website: "https://www.ambou.edu.et",
    strengths: ["Agriculture and applied sciences heritage", "Central Oromia location"],
    whatToExpect: [
      "Moderate highland climate",
      "Accessible from Addis Ababa",
      "Mix of agriculture, science, and social programs",
    ],
  },
  {
    id: "dbu",
    name: "Debre Berhan University",
    abbr: "DBU",
    region: "Amhara",
    location: "Debre Berhan",
    website: "https://www.dbu.edu.et",
    strengths: ["Growing comprehensive university", "Cool highland climate"],
    whatToExpect: [
      "Cooler weather — pack warm clothes",
      "Expanding health and other programs",
      "Relatively close to Addis Ababa",
    ],
  },
  {
    id: "dmu",
    name: "Debre Markos University",
    abbr: "DMU",
    region: "Amhara",
    location: "Debre Markos",
    website: "https://www.dmu.edu.et",
    strengths: ["Comprehensive programs in Amhara region"],
    whatToExpect: [
      "Highland climate",
      "Developing campus facilities",
      "Regional focus with national program standards",
    ],
  },
  {
    id: "du",
    name: "Dilla University",
    abbr: "DU",
    region: "SNNPR",
    location: "Dilla",
    website: "https://www.du.edu.et",
    strengths: ["Southern Ethiopia comprehensive university"],
    whatToExpect: [
      "Warmer southern climate",
      "Growing range of faculties",
    ],
  },
  {
    id: "ddu",
    name: "Dire Dawa University",
    abbr: "DDU",
    region: "Dire Dawa",
    location: "Dire Dawa",
    website: "https://www.ddu.edu.et",
    strengths: ["Eastern Ethiopia hub", "Diverse student body"],
    whatToExpect: [
      "Hotter lowland climate",
      "Urban campus in a major commercial city",
    ],
  },
  {
    id: "wou",
    name: "Wollo University",
    abbr: "WOU",
    region: "Amhara",
    location: "Dessie / Kombolcha",
    website: "https://www.wu.edu.et",
    strengths: ["Multi-campus in Wollo area"],
    whatToExpect: [
      "Campuses in Dessie and surrounding areas",
      "Mix of highland and mid-altitude climates",
    ],
  },
  {
    id: "wsu",
    name: "Wolaita Sodo University",
    abbr: "WSU",
    region: "SNNPR",
    location: "Sodo",
    website: "https://www.wsu.edu.et",
    strengths: ["Southern region comprehensive university"],
    whatToExpect: [
      "Warmer climate",
      "Expanding academic offerings",
    ],
  },
  {
    id: "wu",
    name: "Wollega University",
    abbr: "WU",
    region: "Oromia",
    location: "Nekemte",
    website: "https://www.wollegauniversity.edu.et",
    strengths: ["Western Oromia university"],
    whatToExpect: [
      "Western highland / mid-altitude setting",
      "Growing programs across faculties",
    ],
  },
  {
    id: "jgu",
    name: "Jigjiga University",
    abbr: "JGU",
    region: "Somali",
    location: "Jigjiga",
    website: "https://www.jju.edu.et",
    strengths: ["Somali region flagship public university"],
    whatToExpect: [
      "Eastern lowland climate — hot and dry",
      "Important regional higher-education hub",
    ],
  },
  {
    id: "mwu",
    name: "Madda Walabu University",
    abbr: "MWU",
    region: "Oromia",
    location: "Bale Robe",
    website: "https://www.mwu.edu.et",
    strengths: ["Southeastern Oromia university"],
    whatToExpect: [
      "Bale highlands climate",
      "Developing facilities",
    ],
  },
  {
    id: "mtu",
    name: "Mizan-Tepi University",
    abbr: "MTU",
    region: "SNNPR",
    location: "Mizan Teferi / Tepi",
    website: "https://www.mtu.edu.et",
    strengths: ["Southwestern Ethiopia university"],
    whatToExpect: [
      "Warmer, more humid climate",
      "Multi-campus arrangement",
    ],
  },
  {
    id: "su",
    name: "Samara University",
    abbr: "SU",
    region: "Afar",
    location: "Semera",
    website: "https://www.su.edu.et",
    strengths: ["Afar region university"],
    whatToExpect: [
      "Hot desert climate — prepare for heat",
      "Important access point for higher education in Afar",
    ],
  },
  {
    id: "kmu",
    name: "Kotebe University of Education",
    abbr: "KUE",
    region: "Addis Ababa",
    location: "Addis Ababa",
    website: "https://www.kue.edu.et",
    strengths: ["Specialized in education and teacher training"],
    whatToExpect: [
      "Strong focus on education programs",
      "Urban Addis Ababa setting",
    ],
  },
  {
    id: "agu",
    name: "Adigrat University",
    abbr: "AGU",
    region: "Tigray",
    location: "Adigrat",
    website: "https://www.adu.edu.et",
    strengths: ["Northern Tigray university"],
    whatToExpect: [
      "Highland climate",
      "Developing academic portfolio",
    ],
  },
  {
    id: "asu",
    name: "Assosa University",
    abbr: "ASU",
    region: "Benishangul Gumuz",
    location: "Assosa",
    website: "https://www.asu.edu.et",
    strengths: ["Benishangul-Gumuz regional university"],
    whatToExpect: [
      "Western lowland / mid-altitude climate",
      "Regional higher-education hub",
    ],
  },
  {
    id: "bhu",
    name: "Bule Hora University",
    abbr: "BHU",
    region: "Oromia",
    location: "Bule Hora",
    website: "https://www.bhu.edu.et",
    strengths: ["Southern Oromia university"],
    whatToExpect: [
      "Developing campus and programs",
      "Regional focus",
    ],
  },
  {
    id: "dbtu",
    name: "Debre Tabor University",
    abbr: "DBTU",
    region: "Amhara",
    location: "Debre Tabor",
    website: "https://www.dtu.edu.et",
    strengths: ["Amhara region comprehensive university"],
    whatToExpect: [
      "Cool highland climate",
      "Growing faculties",
    ],
  },
  {
    id: "meu",
    name: "Mattu University",
    abbr: "MEU",
    region: "Oromia",
    location: "Mattu (with Bedele campus)",
    website: "https://meu.edu.et",
    strengths: ["Western Oromia university", "Community-oriented"],
    whatToExpect: [
      "Multiple campuses (Mattu & Bedele)",
      "Warm to moderate climate",
    ],
  },
  {
    id: "wcu",
    name: "Wachemo University",
    abbr: "WCU",
    region: "SNNPR",
    location: "Hosaena",
    website: "https://www.wcu.edu.et",
    strengths: ["Southern Ethiopia university"],
    whatToExpect: [
      "Warmer climate",
      "Expanding program list",
    ],
  },
  {
    id: "wku",
    name: "Wolkite University",
    abbr: "WKU",
    region: "SNNPR",
    location: "Wolkite",
    website: "https://www.wku.edu.et",
    strengths: ["Southern/central Ethiopia university"],
    whatToExpect: [
      "Accessible location",
      "Developing facilities",
    ],
  },
  {
    id: "wdu",
    name: "Woldia University",
    abbr: "WDU",
    region: "Amhara",
    location: "Woldia",
    website: "https://www.wldu.edu.et",
    strengths: ["Northern Amhara university"],
    whatToExpect: [
      "Highland climate",
      "Regional academic hub",
    ],
  },
  {
    id: "aru",
    name: "Arsi University",
    abbr: "ARU",
    region: "Oromia",
    location: "Asella",
    website: "https://www.arsiun.edu.et",
    strengths: ["Central Oromia university", "Health and other programs"],
    whatToExpect: [
      "Highland climate near Asella",
      "Growing health sciences presence",
    ],
  },
  {
    id: "gmu",
    name: "Gambella University",
    abbr: "GMU",
    region: "Gambela",
    location: "Gambela",
    website: "https://www.gmu.edu.et",
    strengths: ["Gambela region university"],
    whatToExpect: [
      "Hot, humid lowland climate",
      "Important access to higher education in the region",
    ],
  },
  {
    id: "obu",
    name: "Oda Bultum University",
    abbr: "OBU",
    region: "Oromia",
    location: "Chiro",
    website: "https://www.obu.edu.et",
    strengths: ["Eastern Oromia university"],
    whatToExpect: [
      "Developing campus",
      "Regional focus",
    ],
  },
  {
    id: "slu",
    name: "Salale University",
    abbr: "SLU",
    region: "Oromia",
    location: "Fiche",
    website: "https://www.slu.edu.et",
    strengths: ["Central Oromia university"],
    whatToExpect: [
      "Highland climate",
      "Growing academic offerings",
    ],
  },
  {
    id: "dedu",
    name: "Dembi Dolo University",
    abbr: "DeDU",
    region: "Oromia",
    location: "Dembi Dolo",
    website: "https://dadu.edu.et",
    strengths: ["Western Oromia university"],
    whatToExpect: [
      "Western Ethiopia setting",
      "Developing programs and partnerships",
    ],
  },
  {
    id: "dku",
    name: "Debark University",
    abbr: "DKU",
    region: "Amhara",
    location: "Debark",
    website: "https://www.dku.edu.et",
    strengths: ["Northern Amhara (near Simien)"],
    whatToExpect: [
      "Cool highland climate near the Simien Mountains",
      "Newer university with expanding capacity",
    ],
  },
  {
    id: "bu",
    name: "Bonga University",
    abbr: "BU",
    region: "SNNPR",
    location: "Bonga",
    website: "https://www.bongau.edu.et",
    strengths: ["Southwestern Ethiopia university"],
    whatToExpect: [
      "Warmer, more humid climate",
      "Regional higher-education access",
    ],
  },
  {
    id: "wru",
    name: "Werabe University",
    abbr: "WRU",
    region: "SNNPR",
    location: "Werabe",
    website: "https://www.wru.edu.et",
    strengths: ["Southern Ethiopia university"],
    whatToExpect: [
      "Warmer climate",
      "Developing campus life",
    ],
  },
  {
    id: "jnu",
    name: "Jinka University",
    abbr: "JNU",
    region: "SNNPR",
    location: "Jinka",
    website: "https://www.jku.edu.et",
    strengths: ["Southernmost regional university"],
    whatToExpect: [
      "Hot climate",
      "Important for access in southern pastoral and agricultural areas",
    ],
  },
  {
    id: "kdu",
    name: "Kebri Dehar University",
    abbr: "KDU",
    region: "Somali",
    location: "Kebri Dehar",
    website: "https://www.uok.edu.et",
    strengths: ["Somali region university"],
    whatToExpect: [
      "Hot, arid climate",
      "Regional access to higher education",
    ],
  },
  {
    id: "iu",
    name: "Injibara University",
    abbr: "IU",
    region: "Amhara",
    location: "Injibara",
    website: "https://www.inu.edu.et",
    strengths: ["Amhara region university"],
    whatToExpect: [
      "Highland climate",
      "Newer institution with growing capacity",
    ],
  },
  {
    id: "ru",
    name: "Raya University",
    abbr: "RU",
    region: "Tigray",
    location: "Maichew",
    website: "https://www.rayu.edu.et",
    strengths: ["Southern Tigray university"],
    whatToExpect: [
      "Highland / mid-altitude climate",
      "Developing academic portfolio",
    ],
  },
  {
    id: "mkau",
    name: "Mekdela Amba University",
    abbr: "MkAU",
    region: "Amhara",
    location: "Tulu Awlia area",
    website: "https://www.mkau.edu.et",
    strengths: ["Amhara region university"],
    whatToExpect: [
      "Highland climate",
      "Newer public university",
    ],
  },
];

export function getUniversity(id: string) {
  return universities.find((u) => u.id === id);
}

export function getFeaturedUniversities() {
  return universities.filter((u) => u.featured);
}
