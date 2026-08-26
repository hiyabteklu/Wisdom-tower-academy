import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">About Wisdom Tower</h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-wisdom-muted">
          <p className="text-lg">
            Wisdom Tower is your integrated partner for end-to-end digital, creative, and professional solutions. 
            We bring together 70+ specialized services under one roof so you never have to juggle multiple freelancers or agencies again.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-10">Our Philosophy</h2>
          <p>
            From the first draft of your pitch deck to the final line of code on your website, 
            we provide the architectural framework for your success. One partner. Complete coverage.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-10">What We Offer</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Graphic & Print Design</li>
            <li>Writing & Editorial</li>
            <li>Academic & Research Support</li>
            <li>Data & Tech Solutions</li>
            <li>Web & Digital Marketing</li>
            <li>Business Strategy & Admin</li>
            <li>Education & Multimedia</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-10">Why Choose Us</h2>
          <p>
            We combine creative excellence with technical precision and academic rigor. 
            Whether you need a stunning brand identity, a polished research paper, 
            a high-converting website, or strategic business support — we deliver with quality and care.
          </p>
        </div>

        <div className="mt-12">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-wisdom-cyan text-wisdom-dark font-medium hover:bg-wisdom-cyan-dark transition-colors"
          >
            Start a Project
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
