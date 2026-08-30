import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service · Wisdom Tower Academy",
  description: "Terms governing use of Wisdom Tower Academy websites and packages.",
};

const UPDATED = "31 August 2026";

export default function TermsPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400/90 mb-2">
          Legal
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-wisdom-muted mb-10">Last updated: {UPDATED}</p>

        <div className="space-y-8 text-wisdom-muted text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Agreement</h2>
            <p>
              By accessing Wisdom Tower Academy websites or purchasing a package, you agree to these
              Terms and our{" "}
              <Link href="/privacy" className="text-amber-300 hover:underline">
                Privacy Policy
              </Link>
              . If you do not agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. The service</h2>
            <p>
              We offer educational materials and pathways (including Grades 9–12, Freshman, exam
              tracks, and special packages). Content, pricing, and availability may change. Features
              may be updated as we improve the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. Accounts</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You must provide accurate registration information.</li>
              <li>You are responsible for keeping your login credentials confidential.</li>
              <li>You must not share, sell, or transfer your account or unlocked access.</li>
              <li>We may suspend accounts involved in abuse, fraud, or these Terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Packages and payments</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Prices are shown in Ethiopian Birr (ETB) unless stated otherwise and may change for
                new purchases.
              </li>
              <li>
                Payment is completed through third-party channels you choose (e.g. Telebirr, bank
                transfer). You submit a transaction reference and optional receipt for{" "}
                <span className="text-white/90">manual verification</span>.
              </li>
              <li>
                Access is unlocked after we verify payment. Verification is not instant and depends
                on correct payment details and our review.
              </li>
              <li>
                Providing false transaction information may result in rejection and account review.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. Refunds</h2>
            <p>
              Because digital access is granted after verification, refunds are considered case by
              case (e.g. duplicate payment or verified technical failure preventing access). Contact
              us promptly with your order reference. Chargebacks or payment disputes may lead to
              suspension of access until resolved.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">6. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Copy, redistribute, or resell our materials without written permission</li>
              <li>Attempt to bypass paywalls, security, or other users’ accounts</li>
              <li>Upload malware or abuse forms, storage, or APIs</li>
              <li>Use the service for illegal activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">7. Intellectual property</h2>
            <p>
              Site design, branding, and learning materials are owned by Wisdom Tower Academy or its
              licensors. Your purchase grants a personal, non-transferable license to use unlocked
              content for your own study, not ownership of the underlying IP.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">8. Educational disclaimer</h2>
            <p>
              Materials support learning and exam preparation. We do not guarantee specific exam
              scores, admission, or employment outcomes. Always follow official exam and school rules.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">9. Third-party services</h2>
            <p>
              Sign-in (e.g. Google), hosting, and payment apps are operated by third parties under
              their own terms. We are not responsible for outages or policies of those services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">10. Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, Wisdom Tower Academy is not liable for indirect,
              incidental, or consequential damages arising from use of the service. Our total liability
              related to a purchase is limited to the amount you paid for that package.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">11. Changes</h2>
            <p>
              We may update these Terms. Continued use after changes constitutes acceptance. Material
              changes may be highlighted on the site when practical.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">12. Contact</h2>
            <p>
              Questions about these Terms:{" "}
              <a href="mailto:hiyabteklu720@gmail.com" className="text-amber-300 hover:underline">
                hiyabteklu720@gmail.com
              </a>{" "}
              or the{" "}
              <Link href="/contact" className="text-amber-300 hover:underline">
                Contact
              </Link>{" "}
              page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
