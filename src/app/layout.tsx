import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased font-sans site-bg">
        {/* Fixed atmospheric depth layers — sit behind all content */}
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
      </body>
    </html>
  );
}
