import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./ui-polish.css";
import "./scroll-zoom.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollZoom from "@/components/ScrollZoom";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
import AuthHashHandler from "@/components/AuthHashHandler";
import GlobalFocusBar from "@/components/GlobalFocusBar";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import OfflineSync from "@/components/OfflineSync";
import LiveRefresh from "@/components/LiveRefresh";
import StructuralBackBridge from "@/components/StructuralBackBridge";
import GlobalToolOverlay from "@/components/learning/GlobalToolOverlay";

export const metadata: Metadata = {
  title: "Wisdom Tower Academy | Grades 9–12, Freshman, UAT, GAT, COC & Exit Exam",
  description:
    "Wisdom Tower Academy: pathways for Grades 9-12, Freshman, UAT, GAT, COC and Exit Exam. Learn, practice, and unlock packages.",
  keywords: [
    "Wisdom Tower Academy",
    "Ethiopia education",
    "GAT",
    "UAT",
    "Exit Exam",
    "Freshman",
    "COC",
    "online learning",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Wisdom Tower Academy",
  },
  openGraph: {
    title: "Wisdom Tower Academy",
    description:
      "Structured learning platform for Ethiopian students preparing for high-stakes exams (GAT, UAT, COC, Exit Exam, Grades 9–12, and freshman year).",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="theme-dark dark"
      data-theme="dark"
      style={{ colorScheme: "dark" }}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{localStorage.setItem('wt-theme','dark');var d=document.documentElement;d.classList.remove('theme-light','light');d.classList.add('theme-dark','dark');d.style.colorScheme='dark';d.setAttribute('data-theme','dark');var p=localStorage.getItem('wt-preferences');if(p){var parsed=JSON.parse(p);if(parsed.amoledMode)d.classList.add('amoled-mode');if(parsed.reducedMotion)d.classList.add('force-reduced-motion');if(parsed.fontSize)d.classList.add('font-scale-'+parsed.fontSize);if(parsed.readingFont)d.classList.add('reading-font-'+parsed.readingFont);}var ua=navigator.userAgent||'';var isApp=(/Android/i.test(ua)&&(/\\bwv\\b/i.test(ua)||/Version\\/4\\.0/i.test(ua)))||/WisdomTowerApp|WisdomTower|wta-native/i.test(ua)||Boolean(window.Android||window.AndroidBridge||window.WisdomTower||window.wtaNative||window.__wtaNativeApp)||/(?:[?&])(?:app|native|wta|platform)=(?:1|true|android|wta)/i.test(window.location.search||'')||/(?:[#&])(?:app|native|wta)=(?:1|true|android|wta)/i.test(window.location.hash||'')||(typeof sessionStorage!=='undefined'&&sessionStorage.getItem('wta-native-app')==='1')||(typeof localStorage!=='undefined'&&localStorage.getItem('wta-native-app')==='1');if(isApp){d.classList.add('wta-native-app');try{sessionStorage.setItem('wta-native-app','1');}catch(e){}try{localStorage.setItem('wta-native-app','1');}catch(e){}}var isOverlay=/(?:[?&])(?:overlay|standalone|embed)=(?:1|true)/i.test(window.location.search||'')||(window.self!==window.top);if(isOverlay){d.classList.add('wta-tool-overlay');}var isTutor=/(?:[?&])(?:tool|tab)=(?:tutor|ai-tutor)/i.test(window.location.search||'');if(isTutor&&window.innerWidth<640){d.classList.add('wta-tutor-active');}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col antialiased font-sans site-bg text-foreground"
      >
        <ThemeProvider>
          <AuthProvider>
            <div className="site-atmosphere" aria-hidden>
              <div className="atm-base" />
              <div className="atm-vignette" />
              <div className="atm-glow atm-glow-1" />
              <div className="atm-glow atm-glow-2" />
              <div className="atm-glow atm-glow-3" />
              <div className="atm-noise" />
            </div>
            <Header />
            <main className="flex-1 pt-16 relative z-10">{children}</main>
            <Footer />
            <AuthHashHandler />
            <ScrollZoom />
            <GlobalFocusBar />
            <ServiceWorkerRegister />
            <OfflineSync />
            <LiveRefresh />
            <StructuralBackBridge />
            <GlobalToolOverlay />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
