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
      <body className="min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
