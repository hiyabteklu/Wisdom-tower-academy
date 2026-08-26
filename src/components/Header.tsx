"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-wisdom-dark/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-wisdom-cyan to-wisdom-cyan-dark flex items-center justify-center font-bold text-wisdom-dark text-sm">
              WT
            </div>
            <span className="font-semibold text-lg tracking-tight group-hover:text-wisdom-cyan transition-colors">
              Wisdom Tower
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-wisdom-muted hover:text-wisdom-cyan transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="px-4 py-2 rounded-lg bg-wisdom-cyan text-wisdom-dark text-sm font-medium hover:bg-wisdom-cyan-dark transition-colors"
            >
              Let&apos;s Build Together
            </Link>
          </nav>

          <button
            className="md:hidden p-2 text-wisdom-muted hover:text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-wisdom-navy border-t border-white/5">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-wisdom-muted hover:text-wisdom-cyan transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="block w-full text-center px-4 py-2 rounded-lg bg-wisdom-cyan text-wisdom-dark text-sm font-medium"
              onClick={() => setIsOpen(false)}
            >
              Let&apos;s Build Together
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
