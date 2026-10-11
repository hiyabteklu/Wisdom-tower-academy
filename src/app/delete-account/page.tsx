import type { Metadata } from "next";
import Link from "next/link";
import DeleteAccountPanel from "@/components/account/DeleteAccountPanel";

export const metadata: Metadata = {
  title: "Delete your account · Wisdom Tower Academy",
  description:
    "How to permanently delete your Wisdom Tower Academy account and what happens to your data.",
};

const SUPPORT_EMAIL = "support@wisdomtower.tech";

export default function DeleteAccountPage() {
  return (
    <div className="relative min-h-[85vh] py-14 md:py-20">
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <header className="border-b border-white/10 pb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Delete your account
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            You can permanently delete your Wisdom Tower Academy account at any time, from this page or from
            the mobile app. This page applies to the website and to the Android app.
          </p>
        </header>

        <section className="space-y-3 text-sm sm:text-[15px] text-slate-300 leading-relaxed">
          <h2 className="text-xl font-display font-bold text-white">What is deleted</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Your sign-in account (e-mail or phone number and password).</li>
            <li>
              Your profile: name, phone number, academic level, school, region, bio, avatar choice and student ID.
            </li>
            <li>Your study progress, results and exam attempts.</li>
            <li>Your course enrollments and access grants.</li>
            <li>Your push-notification device tokens.</li>
            <li>Contact-form messages and talent applications sent with your e-mail address.</li>
            <li>Payment orders that were rejected or never completed.</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm sm:text-[15px] text-slate-300 leading-relaxed">
          <h2 className="text-xl font-display font-bold text-white">What is kept</h2>
          <p>
            Verified payment records, if you ever paid for a package, are kept for five years because Ethiopian tax
            and bookkeeping rules require it (see section 09 of our{" "}
            <Link href="/privacy" className="text-cyan-300 hover:underline">
              Privacy Policy
            </Link>
            ). After deletion they are no longer linked to any account. Nothing else is kept.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-white">Delete now</h2>
          <DeleteAccountPanel />
        </section>

        <section className="space-y-2 text-sm sm:text-[15px] text-slate-300 leading-relaxed">
          <h2 className="text-xl font-display font-bold text-white">Cannot sign in?</h2>
          <p>
            Write to{" "}
            <a href={`mailto:${SUPPORT_EMAIL}?subject=Delete%20my%20account`} className="text-cyan-300 hover:underline">
              {SUPPORT_EMAIL}
            </a>{" "}
            from the e-mail address of the account (or give the phone number you registered with) and ask for the
            account to be deleted. We will confirm by reply after we have checked that the account is yours.
          </p>
        </section>
      </div>
    </div>
  );
}
