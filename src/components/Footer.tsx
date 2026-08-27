import Link from "next/link";

/** Stylized geometric “cube graph” divider — not a flat rule */
function GraphDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-full h-8 flex items-center ${className}`} aria-hidden>
      <svg
        className="w-full h-8 text-wisdom-cyan/40"
        viewBox="0 0 1200 32"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Base faint line */}
        <path
          d="M0 16 H1200"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.25"
        />
        {/* Zig / isometric cube-edge path */}
        <path
          d="M0 16 H80 L110 6 H170 L200 16 H320 L350 26 H430 L460 16 H580 L620 4 H700 L740 16 H860 L900 28 H980 L1020 16 H1200"
          stroke="url(#footerGraphGrad)"
          strokeWidth="1.5"
          strokeLinejoin="miter"
          vectorEffect="non-scaling-stroke"
        />
        {/* Node dots at peaks */}
        <circle cx="110" cy="6" r="2.2" fill="#00d4ff" fillOpacity="0.9" />
        <circle cx="350" cy="26" r="2.2" fill="#00d4ff" fillOpacity="0.7" />
        <circle cx="620" cy="4" r="2.5" fill="#00d4ff" />
        <circle cx="900" cy="28" r="2.2" fill="#00d4ff" fillOpacity="0.75" />
        <defs>
          <linearGradient id="footerGraphGrad" x1="0" y1="0" x2="1200" y2="0">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.15" />
            <stop offset="35%" stopColor="#00d4ff" stopOpacity="0.85" />
            <stop offset="65%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.15" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative z-10 bg-wisdom-navy/95 backdrop-blur-md">
      {/* Top edge: geometric graph cut */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
          <GraphDivider />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-14 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-wisdom-cyan to-wisdom-cyan-dark flex items-center justify-center font-bold text-wisdom-dark text-sm">
                WT
              </div>
              <span className="font-semibold text-lg text-white">Wisdom Tower</span>
            </div>
            <p className="text-wisdom-muted text-sm max-w-md leading-relaxed">
              70+ Services. 1 Integrated Partner. From the first draft of your pitch deck to the final
              line of code on your website — we provide the architectural framework for your success.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
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
            <h4 className="font-semibold mb-4 text-white">Get in Touch</h4>
            <p className="text-sm text-wisdom-muted leading-relaxed">Ready to build something great?</p>
            <Link
              href="/contact"
              className="inline-block mt-3 text-sm font-semibold text-wisdom-cyan hover:underline"
            >
              Start a conversation →
            </Link>
            <p className="mt-6 text-xs text-wisdom-muted">Education · Digital · Excellence</p>
          </div>
        </div>

        {/* Bottom: same graph motif, thinner */}
        <div className="mt-12">
          <GraphDivider className="opacity-70 scale-y-75 origin-center" />
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-wisdom-muted">
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
      </div>
    </footer>
  );
}
