import Link from "next/link";

/** Official social destinations */
export const SOCIAL = {
  telegramGroup: "https://t.me/wisdom_tower1",
  telegramChannel: "https://t.me/wisdom_tower2",
  linkedin: "https://www.linkedin.com/company/wisdom-tower/",
} as const;

function IconTelegram({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function IconLinkedIn({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconInstagram({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function IconTikTok({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function IconFacebook({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function IconX({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.75l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

const linkBtn =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] text-wisdom-muted transition-all duration-200 hover:border-wisdom-cyan/40 hover:bg-wisdom-cyan/10 hover:text-wisdom-cyan";

const placeholderBtn =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.02] text-white/25 cursor-default";

/**
 * Full-bleed wave cut — smooth cubic-style S-curve
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
        <path
          d="M0 36
             C180 8, 360 8, 540 36
             S900 64, 1080 36
             S1260 8, 1440 36
             L1440 72 L0 72 Z"
          fill="url(#wtWaveFill)"
        />
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
                Education and digital services under one roof — Academy pathways for learners, and
                professional delivery for teams that want work done right.
              </p>

              {/* Social — live links first, placeholders after */}
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-wisdom-muted mb-3">
                  Connect
                </p>
                <div className="flex flex-wrap items-center gap-2.5">
                  <a
                    href={SOCIAL.telegramGroup}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkBtn}
                    title="Telegram group · @wisdom_tower1"
                    aria-label="Wisdom Tower Telegram group"
                  >
                    <IconTelegram />
                  </a>
                  <a
                    href={SOCIAL.telegramChannel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkBtn}
                    title="Telegram channel · @wisdom_tower2"
                    aria-label="Wisdom Tower Telegram channel"
                  >
                    <IconTelegram className="w-5 h-5 opacity-90" />
                  </a>
                  <a
                    href={SOCIAL.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkBtn}
                    title="LinkedIn · Wisdom Tower"
                    aria-label="Wisdom Tower on LinkedIn"
                  >
                    <IconLinkedIn />
                  </a>

                  {/* Placeholders — not linked until accounts exist */}
                  <span className={placeholderBtn} title="Instagram — coming soon" aria-hidden>
                    <IconInstagram />
                  </span>
                  <span className={placeholderBtn} title="TikTok — coming soon" aria-hidden>
                    <IconTikTok />
                  </span>
                  <span className={placeholderBtn} title="Facebook — coming soon" aria-hidden>
                    <IconFacebook />
                  </span>
                  <span className={placeholderBtn} title="X — coming soon" aria-hidden>
                    <IconX />
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-wisdom-muted">
                  <a
                    href={SOCIAL.telegramGroup}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-wisdom-cyan transition-colors"
                  >
                    Group · t.me/wisdom_tower1
                  </a>
                  <a
                    href={SOCIAL.telegramChannel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-wisdom-cyan transition-colors"
                  >
                    Channel · t.me/wisdom_tower2
                  </a>
                  <a
                    href={SOCIAL.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-wisdom-cyan transition-colors"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
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
                  <Link href="/packages" className="hover:text-wisdom-cyan transition-colors">
                    Packages
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
                Questions about Academy packages or a Digital project?
              </p>
              <Link
                href="/contact"
                className="inline-block mt-3 text-sm font-semibold text-wisdom-cyan hover:underline"
              >
                Start a conversation →
              </Link>
              <a
                href={SOCIAL.telegramGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-2 text-sm font-medium text-wisdom-muted hover:text-wisdom-cyan transition-colors"
              >
                <IconTelegram className="w-4 h-4" />
                Join the community
              </a>
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
              <a
                href={SOCIAL.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-wisdom-cyan transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
