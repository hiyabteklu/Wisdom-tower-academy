import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-wisdom-navy/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-wisdom-cyan to-wisdom-cyan-dark flex items-center justify-center font-bold text-wisdom-dark text-sm">
                WT
              </div>
              <span className="font-semibold text-lg text-foreground">Wisdom Tower</span>
            </div>
            <p className="text-wisdom-muted text-sm max-w-md leading-relaxed">
              70+ Services. 1 Integrated Partner. From the first draft of your pitch deck to the final
              line of code on your website — we provide the architectural framework for your success.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-wisdom-muted">
              <li>
                <Link href="/" className="hover:text-wisdom-cyan transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/academy" className="hover:text-wisdom-cyan transition-colors">
                  Academy
                </Link>
              </li>
              <li>
                <Link href="/digital" className="hover:text-wisdom-cyan transition-colors">
                  Digital
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-wisdom-cyan transition-colors">
                  All Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-wisdom-cyan transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-wisdom-cyan transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Get in Touch</h4>
            <p className="text-sm text-wisdom-muted leading-relaxed">Ready to build something great?</p>
            <Link
              href="/contact"
              className="inline-block mt-3 text-sm font-semibold text-wisdom-cyan hover:underline"
            >
              Start a conversation →
            </Link>
            <p className="mt-6 text-xs text-wisdom-muted">
              Education · Digital · Excellence
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-wisdom-muted">
          <p>© {new Date().getFullYear()} Wisdom Tower. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/about" className="hover:text-wisdom-cyan transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-wisdom-cyan transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
