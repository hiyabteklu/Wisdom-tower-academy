export interface Service {
  id: string;
  name: string;
  description?: string;
  /** Path under /public — upload as public/images/services/{id}.jpg */
  image: string;
}

export interface Category {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  services: Service[];
}

function img(id: string) {
  return `/images/services/${id}.jpg`;
}

export const categories: Category[] = [
  {
    id: "graphic-print-design",
    name: "Graphic & Print Design",
    tagline: "Professional visual communication to elevate your brand identity.",
    icon: "palette",
    services: [
      { id: "presentation-slides", name: "Presentation slide design (PowerPoint, Google Slides, Canva)", image: img("presentation-slides") },
      { id: "resume-cv", name: "Resume/CV design", image: img("resume-cv") },
      { id: "book-covers", name: "Book covers & eBook design", image: img("book-covers") },
      { id: "letterheads", name: "Letterheads & company profiles", image: img("letterheads") },
      { id: "posters-flyers", name: "Posters and flyers", image: img("posters-flyers") },
      { id: "certificates", name: "Certificates & awards", image: img("certificates") },
      { id: "brochures", name: "Brochures & leaflets", image: img("brochures") },
      { id: "menu-design", name: "Menu design", image: img("menu-design") },
      { id: "business-cards", name: "Business cards", image: img("business-cards") },
      { id: "stickers", name: "Stickers & digital artwork", image: img("stickers") },
    ],
  },
  {
    id: "writing-editorial",
    name: "Writing & Editorial",
    tagline: "Compelling copy and structured writing tailored to your exact audience.",
    icon: "pen-tool",
    services: [
      { id: "article-blog", name: "Article and blog writing", image: img("article-blog") },
      { id: "story-fiction", name: "Story writing & creative fiction", image: img("story-fiction") },
      { id: "website-content", name: "Website content writing", image: img("website-content") },
      { id: "technical-writing", name: "Technical writing", image: img("technical-writing") },
      { id: "copywriting", name: "Copywriting (ads, product descriptions)", image: img("copywriting") },
      { id: "proposal-grant", name: "Proposal & Grant writing", image: img("proposal-grant") },
      { id: "scriptwriting", name: "Scriptwriting (YouTube, podcasts, short films)", image: img("scriptwriting") },
      { id: "editing-proofreading", name: "Editing & proofreading", image: img("editing-proofreading") },
      { id: "speech-writing", name: "Speech writing", image: img("speech-writing") },
      { id: "rewriting", name: "Rewriting & paraphrasing", image: img("rewriting") },
    ],
  },
  {
    id: "academic-research",
    name: "Academic & Research Support",
    tagline: "Rigorous, high-quality assistance for scholars, researchers, and institutions.",
    icon: "graduation-cap",
    services: [
      { id: "thesis-dissertation", name: "Thesis & dissertation writing (guided/ethical support)", image: img("thesis-dissertation") },
      { id: "research-summaries", name: "Research summaries & abstracts", image: img("research-summaries") },
      { id: "academic-editing", name: "Academic editing & formatting (APA, MLA, Chicago, Vancouver)", image: img("academic-editing") },
      { id: "referencing", name: "Referencing & citation management", image: img("referencing") },
      { id: "research-proposals", name: "Research proposals", image: img("research-proposals") },
      { id: "plagiarism", name: "Plagiarism checking & reduction", image: img("plagiarism") },
      { id: "publication-prep", name: "Research publication preparation", image: img("publication-prep") },
      { id: "defense-pptx", name: "PowerPoint presentations for research defense", image: img("defense-pptx") },
      { id: "systematic-reviews", name: "Systematic reviews & scoping reviews", image: img("systematic-reviews") },
      { id: "academic-poster", name: "Academic poster design", image: img("academic-poster") },
    ],
  },
  {
    id: "data-tech",
    name: "Data & Tech Solutions",
    tagline: "Streamlining your operations with robust data management and analysis.",
    icon: "database",
    services: [
      { id: "data-entry", name: "Data entry", image: img("data-entry") },
      { id: "automation-scripts", name: "Automation scripts", image: img("automation-scripts") },
      { id: "data-cleaning", name: "Data cleaning", image: img("data-cleaning") },
      { id: "data-collection", name: "Data collection & survey design", image: img("data-collection") },
      { id: "excel", name: "Excel spreadsheet creation", image: img("excel") },
      { id: "questionnaire", name: "Questionnaire development", image: img("questionnaire") },
      { id: "database-mgmt", name: "Database management", image: img("database-mgmt") },
      { id: "data-analysis", name: "Data analysis (SPSS, Stata, R, Excel)", image: img("data-analysis") },
      { id: "basic-programming", name: "Basic programming (Python, R, SQL)", image: img("basic-programming") },
      { id: "statistical-interpretation", name: "Statistical interpretation", image: img("statistical-interpretation") },
    ],
  },
  {
    id: "web-digital-marketing",
    name: "Web & Digital Marketing",
    tagline: "Building your digital footprint and engaging your audience at scale.",
    icon: "globe",
    services: [
      { id: "website-design", name: "Website design (WordPress, Wix, HTML/CSS)", image: img("website-design") },
      { id: "seo", name: "SEO optimization", image: img("seo") },
      { id: "ui-ux", name: "UI/UX design", image: img("ui-ux") },
      { id: "social-media", name: "Social media management", image: img("social-media") },
      { id: "landing-pages", name: "Landing page creation", image: img("landing-pages") },
      { id: "digital-ads", name: "Digital ad design (Facebook, Google Ads)", image: img("digital-ads") },
      { id: "domain-hosting", name: "Domain & hosting setup", image: img("domain-hosting") },
      { id: "email-marketing", name: "Email marketing campaigns", image: img("email-marketing") },
      { id: "website-testing", name: "Website testing & debugging", image: img("website-testing") },
      { id: "content-strategy", name: "Content strategy development", image: img("content-strategy") },
    ],
  },
  {
    id: "business-strategy",
    name: "Business Strategy & Admin",
    tagline: "Strategic insights and operational support to scale your business effortlessly.",
    icon: "briefcase",
    services: [
      { id: "business-plan", name: "Business plan writing", image: img("business-plan") },
      { id: "business-reports", name: "Business reports", image: img("business-reports") },
      { id: "pitch-deck", name: "Pitch deck creation", image: img("pitch-deck") },
      { id: "email-calendar", name: "Email & calendar management", image: img("email-calendar") },
      { id: "market-research", name: "Market research", image: img("market-research") },
      { id: "meeting-notes", name: "Meeting notes & minutes", image: img("meeting-notes") },
      { id: "competitor-swot", name: "Competitor & SWOT analysis", image: img("competitor-swot") },
      { id: "appointments", name: "Appointment booking & travel arrangements", image: img("appointments") },
      { id: "financial-analysis", name: "Financial analysis", image: img("financial-analysis") },
      { id: "customer-service", name: "Customer service support", image: img("customer-service") },
    ],
  },
  {
    id: "education-multimedia",
    name: "Education & Multimedia",
    tagline: "Comprehensive e-learning creation and dynamic multimedia formatting.",
    icon: "book-open",
    services: [
      { id: "online-tutoring", name: "Online tutoring", image: img("online-tutoring") },
      { id: "course-creation", name: "Course creation & eLearning content design", image: img("course-creation") },
      { id: "lesson-plans", name: "Lesson plan development", image: img("lesson-plans") },
      { id: "quiz-exam", name: "Quiz & exam creation", image: img("quiz-exam") },
      { id: "online-forms", name: "Online form creation", image: img("online-forms") },
      { id: "ebook-formatting", name: "eBook formatting", image: img("ebook-formatting") },
      { id: "pdf-editing", name: "PDF editing & document conversion", image: img("pdf-editing") },
      { id: "audio-transcription", name: "Audio transcription", image: img("audio-transcription") },
      { id: "video-editing", name: "Video editing & subtitles", image: img("video-editing") },
      { id: "voiceover", name: "Voiceover recording", image: img("voiceover") },
    ],
  },
];

export const totalServices = categories.reduce((acc, cat) => acc + cat.services.length, 0);
