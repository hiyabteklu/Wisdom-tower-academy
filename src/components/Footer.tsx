import Link from "next/link";

/**
 * Full-bleed wave cut — smooth cubic-style S-curve (like x³ / sine graph),
 * not a flat rule or thin polyline.
 */
function WaveCut({ flip = false }: { flip?: boolean }) {
  return (
    <div
      className={`relative w-full leading-none ${flip ? "rotate-180" : ""}`}
      aria-hidden
    >
      <svg
        className="block w-full h-[48px] sm:h-[64px] md:h-[72px]"
        viewBox="0 0 1440 72"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="wtWaveFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="1" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="wtWaveStroke" x1="0" y1="0" x2="1440" y2="0">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.15" />
            <stop offset="25%" stopColor="#00d4ff" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.75" />
            <stop offset="75%" stopColor="#00d4ff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        {/* Soft glow under the crest */}
        <path
          d="M0 36
             C180 8, 360 8, 540 36
             S900 64, 1080 36
             S1260 8, 1440 36
             L1440 72 L0 72 Z"
          fill="url(#wtWaveFill)"
        />
        {/* Graph line — cubic segments */}
        <path
          d="M0 36
             C180 8, 360 8, 540 36
             S900 64, 1080 36
             S1260 8, 1440 36"
          fill="none"
          stroke="url(#wtWaveStroke)"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Accent nodes at extrema (graph peaks) */}
        <circle cx="270" cy="12" r="3" fill="#00d4ff" fillOpacity="0.85" />
        <circle cx="810" cy="60" r="2.5" fill="#38bdf8" fillOpacity="0.7" />
        <circle cx="1170" cy="16" r="3" fill="#00d4ff" fillOpacity="0.8" />
      </svg>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative z-10 mt-auto">
      {/* Wave sits on top of the navy block — creates the stylized cut */}
      <div className="relative -mb-px text-wisdom-navy">
        <WaveCut />
      </div>

      <div className="bg-wisdom-navy/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-14 pt-2 md:pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-wisdom-cyan to-wisdom-cyan-dark flex items-center justify-center font-bold text-wisdom-dark text-sm">
                  WT
                </div>
                <span className="font-semibold text-lg text-white">Wisdom Tower</span>
              </div>
              <p className="text-wisdom-muted text-sm max-w-md leading-relaxed">
                70+ Services. 1 Integrated Partner. From the first draft of your pitch deck to the
                final line of code on your website — we provide the architectural framework for your
                success.
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
              <p className="text-sm text-wisdom-muted leading-relaxed">
                Ready to build something great?
              </p>
              <Link
                href="/contact"
                className="inline-block mt-3 text-sm font-semibold text-wisdom-cyan hover:underline"
              >
                Start a conversation →
              </Link>
              <p className="mt-6 text-xs text-wisdom-muted">Education · Digital · Excellence</p>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-wisdom-muted">
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
