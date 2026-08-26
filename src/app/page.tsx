import Link from "next/link";
import { ArrowRight, GraduationCap, Laptop, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-wisdom-cyan/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-wisdom-cyan/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-wisdom-cyan/10 border border-wisdom-cyan/20 text-wisdom-cyan text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            One Ecosystem. Two Powerful Pillars.
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-white">Wisdom</span>{" "}
            <span className="text-wisdom-cyan">Tower</span>
          </h1>

          <p className="text-lg md:text-xl text-wisdom-muted max-w-2xl mx-auto mb-4">
            Empowering minds through education and elevating ideas through digital excellence.
          </p>
          <p className="text-base text-wisdom-muted max-w-xl mx-auto mb-12">
            Choose your path below and start building your future.
          </p>
        </div>
      </section>

      {/* Two Main Cards */}
      <section className="pb-24 md:pb-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">

            {/* Wisdom Tower Academy */}
            <Link
              href="/academy"
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-wisdom-card hover:border-wisdom-cyan/40 transition-all duration-500 hover:shadow-2xl hover:shadow-wisdom-cyan/10 hover:-translate-y-1"
            >
              {/* Placeholder Image Area */}
              <div className="relative h-56 md:h-64 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-wisdom-card overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db26a?w=800&q=80')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-wisdom-card via-wisdom-card/60 to-transparent" />
                </div>
                <div className="absolute bottom-4 left-6 flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-wisdom-cyan transition-colors">
                  Wisdom Tower Academy
                </h2>
                <p className="text-wisdom-muted mb-6 leading-relaxed">
                  Structured learning pathways for Grade 9–12, Remedial, Freshman, UAT, GAT and more. Academic excellence starts here.
                </p>
                <div className="flex items-center gap-2 text-wisdom-cyan font-medium">
                  Explore Academy
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Wisdom Tower Digital */}
            <Link
              href="/digital"
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-wisdom-card hover:border-wisdom-cyan/40 transition-all duration-500 hover:shadow-2xl hover:shadow-wisdom-cyan/10 hover:-translate-y-1"
            >
              {/* Placeholder Image Area */}
              <div className="relative h-56 md:h-64 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-wisdom-card overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-wisdom-card via-wisdom-card/60 to-transparent" />
                </div>
                <div className="absolute bottom-4 left-6 flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-wisdom-cyan/20 border border-wisdom-cyan/30 text-wisdom-cyan">
                    <Laptop className="w-7 h-7" />
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-wisdom-cyan transition-colors">
                  Wisdom Tower Digital
                </h2>
                <p className="text-wisdom-muted mb-6 leading-relaxed">
                  70+ professional services across design, writing, academic support, data, marketing, business and multimedia.
                </p>
                <div className="flex items-center gap-2 text-wisdom-cyan font-medium">
                  Explore Digital Services
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Not sure where to start?</h2>
          <p className="text-wisdom-muted mb-8">
            Tell us your goal and we&apos;ll guide you to the right path.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-wisdom-cyan text-wisdom-dark font-semibold text-lg hover:bg-wisdom-cyan-dark transition-all hover:scale-105"
          >
            Let&apos;s Build Together
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
