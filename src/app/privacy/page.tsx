import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy · Wisdom Tower Academy",
  description:
    "How Wisdom Tower Academy collects, uses, and protects your personal information.",
};

const UPDATED = "31 August 2026";

export default function PrivacyPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400/90 mb-2">
          Legal
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-wisdom-muted mb-10">Last updated: {UPDATED}</p>

        <div className="space-y-8 text-wisdom-muted text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Who we are</h2>
            <p>
              Wisdom Tower Academy (“we”, “us”) provides online learning pathways for Grades 9–12,
              Freshman, UAT, GAT, COC, Exit Exam, and related special packages. This policy explains
              how we handle personal data when you use our website and services.
            </p>
            <p className="mt-2">
              Contact:{" "}
              <a href="mailto:hiyabteklu720@gmail.com" className="text-amber-300 hover:underline">
                hiyabteklu720@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. Information we collect</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <span className="text-white/90">Account data:</span> name, email address, and
                authentication details (including when you sign in with Google).
              </li>
              <li>
                <span className="text-white/90">Order and payment verification data:</span> package
                selected, amount, phone number you provide, transaction reference, optional receipt
                upload, and notes you submit for manual verification.
              </li>
              <li>
                <span className="text-white/90">Learning activity:</span> enrollments, progress or
                results you choose to save, and contact form messages.
              </li>
              <li>
                <span className="text-white/90">Technical data:</span> basic device/browser information
                and logs needed to run and secure the site (e.g. via our hosting and database
                providers).
              </li>
            </ul>
            <p className="mt-2">
              We do not ask for full bank passwords. Payments are completed through your own banking
              or mobile money apps; we only receive the details you submit for verification.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. How we use information</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Create and manage your account and sign-in sessions</li>
              <li>Process orders, verify payments, and unlock purchased packages</li>
              <li>Provide learning access and respond to support requests</li>
              <li>Send important notices about orders or account security (email/SMS when configured)</li>
              <li>Improve the service, prevent fraud, and meet legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Legal bases (where applicable)</h2>
            <p>
              We process data to perform our contract with you (account and purchased access), with
              your consent (e.g. optional marketing if you opt in later), and for legitimate interests
              such as security, abuse prevention, and service improvement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. Sharing</h2>
            <p>We do not sell your personal information. We share data only with:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <span className="text-white/90">Infrastructure providers</span> that host the site and
                database (e.g. Vercel, Supabase) under their security practices
              </li>
              <li>
                <span className="text-white/90">Authentication providers</span> (e.g. Google) when you
                choose Google sign-in
              </li>
              <li>
                <span className="text-white/90">Notification providers</span> (email/SMS) only when we
                send transactional messages about your orders
              </li>
              <li>Authorities when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">6. Security</h2>
            <p>
              We use industry-standard measures appropriate to our size: encrypted transport (HTTPS),
              access controls for admin tools, and secured database policies. No method of
              transmission or storage is 100% secure; please use a strong password and do not share
              account access.
            </p>
            <p className="mt-2">
              Receipt files you upload are stored to verify payment. Keep personal documents limited
              to what is needed for verification.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">7. Retention</h2>
            <p>
              We keep account, order, and enrollment records as long as needed to provide the service,
              resolve disputes, and meet legal or accounting needs. You may request deletion of your
              account data subject to orders we must retain for legitimate business or legal reasons.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">8. Your choices</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Update profile details in your account settings where available</li>
              <li>Request access, correction, or deletion by emailing us</li>
              <li>Stop using Google sign-in by using email/password or disconnecting in Google settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">9. Children</h2>
            <p>
              Our content supports school and exam preparation. If you are under the age where you
              can consent to online services in your country, a parent or guardian should supervise
              account creation and payments.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">10. Changes</h2>
            <p>
              We may update this policy. The “Last updated” date will change when we do. Continued use
              of the service after updates means you accept the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">11. Related documents</h2>
            <p>
              <Link href="/terms" className="text-amber-300 hover:underline">
                Terms of Service
              </Link>
              {" · "}
              <Link href="/contact" className="text-amber-300 hover:underline">
                Contact
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
