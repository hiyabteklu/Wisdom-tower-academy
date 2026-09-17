import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./ui-polish.css";
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

export const metadata: Metadata = {
  title: "Wisdom Tower Academy | Grades 9–12, Freshman, UAT, GAT, COC & Exit Exam",
  description:
    "Wisdom Tower Academy — pathways for Grades 9–12, Freshman, UAT, GAT, COC and Exit Exam. Learn, practice, and unlock packages.",
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
            __html: `(function(){try{localStorage.setItem('wt-theme','dark');var d=document.documentElement;d.classList.remove('theme-light','light');d.classList.add('theme-dark','dark');d.style.colorScheme='dark';d.setAttribute('data-theme','dark');}catch(e){}})();`,
          }}
        />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="min-h-screen flex flex-col antialiased font-sans site-bg text-foreground">
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
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
