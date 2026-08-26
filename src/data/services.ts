export interface Service {
  id: string;
  name: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  services: Service[];
}

export const categories: Category[] = [
  {
    id: "graphic-print-design",
    name: "Graphic & Print Design",
    tagline: "Professional visual communication to elevate your brand identity.",
    icon: "palette",
    services: [
      { id: "presentation-slides", name: "Presentation slide design (PowerPoint, Google Slides, Canva)" },
      { id: "resume-cv", name: "Resume/CV design" },
      { id: "book-covers", name: "Book covers & eBook design" },
      { id: "letterheads", name: "Letterheads & company profiles" },
      { id: "posters-flyers", name: "Posters and flyers" },
      { id: "certificates", name: "Certificates & awards" },
      { id: "brochures", name: "Brochures & leaflets" },
      { id: "menu-design", name: "Menu design" },
      { id: "business-cards", name: "Business cards" },
      { id: "stickers", name: "Stickers & digital artwork" },
    ],
  },
  {
    id: "writing-editorial",
    name: "Writing & Editorial",
    tagline: "Compelling copy and structured writing tailored to your exact audience.",
    icon: "pen-tool",
    services: [
      { id: "article-blog", name: "Article and blog writing" },
      { id: "story-fiction", name: "Story writing & creative fiction" },
      { id: "website-content", name: "Website content writing" },
      { id: "technical-writing", name: "Technical writing" },
      { id: "copywriting", name: "Copywriting (ads, product descriptions)" },
      { id: "proposal-grant", name: "Proposal & Grant writing" },
      { id: "scriptwriting", name: "Scriptwriting (YouTube, podcasts, short films)" },
      { id: "editing-proofreading", name: "Editing & proofreading" },
      { id: "speech-writing", name: "Speech writing" },
      { id: "rewriting", name: "Rewriting & paraphrasing" },
    ],
  },
  {
    id: "academic-research",
    name: "Academic & Research Support",
    tagline: "Rigorous, high-quality assistance for scholars, researchers, and institutions.",
    icon: "graduation-cap",
    services: [
      { id: "thesis-dissertation", name: "Thesis & dissertation writing (guided/ethical support)" },
      { id: "research-summaries", name: "Research summaries & abstracts" },
      { id: "academic-editing", name: "Academic editing & formatting (APA, MLA, Chicago, Vancouver)" },
      { id: "referencing", name: "Referencing & citation management" },
      { id: "research-proposals", name: "Research proposals" },
      { id: "plagiarism", name: "Plagiarism checking & reduction" },
      { id: "publication-prep", name: "Research publication preparation" },
      { id: "defense-pptx", name: "PowerPoint presentations for research defense" },
      { id: "systematic-reviews", name: "Systematic reviews & scoping reviews" },
      { id: "academic-poster", name: "Academic poster design" },
    ],
  },
  {
    id: "data-tech",
    name: "Data & Tech Solutions",
    tagline: "Streamlining your operations with robust data management and analysis.",
    icon: "database",
    services: [
      { id: "data-entry", name: "Data entry" },
      { id: "automation-scripts", name: "Automation scripts" },
      { id: "data-cleaning", name: "Data cleaning" },
      { id: "data-collection", name: "Data collection & survey design" },
      { id: "excel", name: "Excel spreadsheet creation" },
      { id: "questionnaire", name: "Questionnaire development" },
      { id: "database-mgmt", name: "Database management" },
      { id: "data-analysis", name: "Data analysis (SPSS, Stata, R, Excel)" },
      { id: "basic-programming", name: "Basic programming (Python, R, SQL)" },
      { id: "statistical-interpretation", name: "Statistical interpretation" },
    ],
  },
  {
    id: "web-digital-marketing",
    name: "Web & Digital Marketing",
    tagline: "Building your digital footprint and engaging your audience at scale.",
    icon: "globe",
    services: [
      { id: "website-design", name: "Website design (WordPress, Wix, HTML/CSS)" },
      { id: "seo", name: "SEO optimization" },
      { id: "ui-ux", name: "UI/UX design" },
      { id: "social-media", name: "Social media management" },
      { id: "landing-pages", name: "Landing page creation" },
      { id: "digital-ads", name: "Digital ad design (Facebook, Google Ads)" },
      { id: "domain-hosting", name: "Domain & hosting setup" },
      { id: "email-marketing", name: "Email marketing campaigns" },
      { id: "website-testing", name: "Website testing & debugging" },
      { id: "content-strategy", name: "Content strategy development" },
    ],
  },
  {
    id: "business-strategy",
    name: "Business Strategy & Admin",
    tagline: "Strategic insights and operational support to scale your business effortlessly.",
    icon: "briefcase",
    services: [
      { id: "business-plan", name: "Business plan writing" },
      { id: "business-reports", name: "Business reports" },
      { id: "pitch-deck", name: "Pitch deck creation" },
      { id: "email-calendar", name: "Email & calendar management" },
      { id: "market-research", name: "Market research" },
      { id: "meeting-notes", name: "Meeting notes & minutes" },
      { id: "competitor-swot", name: "Competitor & SWOT analysis" },
      { id: "appointments", name: "Appointment booking & travel arrangements" },
      { id: "financial-analysis", name: "Financial analysis" },
      { id: "customer-service", name: "Customer service support" },
    ],
  },
  {
    id: "education-multimedia",
    name: "Education & Multimedia",
    tagline: "Comprehensive e-learning creation and dynamic multimedia formatting.",
    icon: "book-open",
    services: [
      { id: "online-tutoring", name: "Online tutoring" },
      { id: "course-creation", name: "Course creation & eLearning content design" },
      { id: "lesson-plans", name: "Lesson plan development" },
      { id: "quiz-exam", name: "Quiz & exam creation" },
      { id: "online-forms", name: "Online form creation" },
      { id: "ebook-formatting", name: "eBook formatting" },
      { id: "pdf-editing", name: "PDF editing & document conversion" },
      { id: "audio-transcription", name: "Audio transcription" },
      { id: "video-editing", name: "Video editing & subtitles" },
      { id: "voiceover", name: "Voiceover recording" },
    ],
  },
];

export const totalServices = categories.reduce((acc, cat) => acc + cat.services.length, 0);
