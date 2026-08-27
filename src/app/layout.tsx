import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Wisdom Tower | Comprehensive Digital & Professional Services",
  description:
    "70+ Services. 1 Integrated Partner. Empowering your ideas with end-to-end digital, creative, and professional solutions.",
  keywords: [
    "graphic design",
    "academic support",
    "web development",
    "digital marketing",
    "business strategy",
    "Wisdom Tower",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="theme-dark dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('wt-theme');var r=t==='light'?'light':t==='system'?(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):'dark';var d=document.documentElement;d.classList.remove('theme-dark','theme-light','dark','light');d.classList.add(r==='light'?'theme-light':'theme-dark',r);d.style.colorScheme=r;d.setAttribute('data-theme',r);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased font-sans site-bg text-foreground">
        <ThemeProvider>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
