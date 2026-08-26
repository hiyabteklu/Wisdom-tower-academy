import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-wisdom-navy border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-wisdom-cyan to-wisdom-cyan-dark flex items-center justify-center font-bold text-wisdom-dark text-sm">
                WT
              </div>
              <span className="font-semibold text-lg">Wisdom Tower</span>
            </div>
            <p className="text-wisdom-muted text-sm max-w-md">
              70+ Services. 1 Integrated Partner. From the first draft of your pitch deck to the final line of code on your website — we provide the architectural framework for your success.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-wisdom-muted">
              <li><Link href="/services" className="hover:text-wisdom-cyan transition-colors">Services</Link></li>
              <li><Link href="/about" className="hover:text-wisdom-cyan transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-wisdom-cyan transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Get in Touch</h4>
            <p className="text-sm text-wisdom-muted">
              Ready to build something great?
            </p>
            <Link
              href="/contact"
              className="inline-block mt-3 text-sm text-wisdom-cyan hover:underline"
            >
              Start a conversation →
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center text-sm text-wisdom-muted">
          © {new Date().getFullYear()} Wisdom Tower. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
