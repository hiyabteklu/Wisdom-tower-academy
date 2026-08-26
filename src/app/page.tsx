import Link from "next/link";
import { ArrowRight, GraduationCap, Laptop } from "lucide-react";

const stats = [
  { value: "30K+", label: "Users" },
  { value: "10+", label: "Partners" },
  { value: "70+", label: "Services" },
  { value: "∞", label: "Possibilities" },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-wisdom-cyan/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-wisdom-cyan/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center relative animate-fade-up">
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6">
            <span className="text-white">Wisdom</span>{" "}
            <span className="text-wisdom-cyan">Tower</span>
          </h1>

          <p className="text-lg md:text-xl text-wisdom-muted max-w-2xl mx-auto mb-3 leading-relaxed">
            Empowering minds through education and elevating ideas through digital excellence.
          </p>
          <p className="text-base text-wisdom-muted/80 max-w-xl mx-auto mb-4">
            Choose your path below and start building your future.
          </p>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 perspective-scene">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
            <Link
              href="/academy"
              className="card-3d group relative overflow-hidden rounded-3xl border border-white/12 bg-wisdom-card"
            >
              <div className="relative h-56 md:h-64 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1523240795612-9a054b0db26a?w=800&q=80')",
                  }}
                />
                {/* Bottom fade only — keeps photo vivid */}
                <div className="absolute inset-0 bg-gradient-to-t from-wisdom-card via-wisdom-card/40 to-transparent" />
                <div className="absolute bottom-5 left-6">
                  <div className="p-3.5 rounded-2xl bg-amber-500/25 border border-amber-500/40 text-amber-300 shadow-lg backdrop-blur-sm">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                </div>
              </div>

              <div className="p-7 md:p-9">
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-3 group-hover:text-wisdom-cyan transition-colors">
                  Wisdom Tower Academy
                </h2>
                <p className="text-wisdom-muted mb-7 leading-relaxed">
                  Structured learning pathways for Grade 9–12, Remedial, Freshman, UAT, GAT and more.
                  Academic excellence starts here.
                </p>
                <div className="flex items-center gap-2 text-wisdom-cyan font-semibold">
                  Explore Academy
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </div>
              </div>
            </Link>

            <Link
              href="/digital"
              className="card-3d group relative overflow-hidden rounded-3xl border border-white/12 bg-wisdom-card"
            >
              <div className="relative h-56 md:h-64 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-wisdom-card via-wisdom-card/40 to-transparent" />
                <div className="absolute bottom-5 left-6">
                  <div className="p-3.5 rounded-2xl bg-wisdom-cyan/25 border border-wisdom-cyan/40 text-wisdom-cyan shadow-lg backdrop-blur-sm">
                    <Laptop className="w-7 h-7" />
                  </div>
                </div>
              </div>

              <div className="p-7 md:p-9">
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-3 group-hover:text-wisdom-cyan transition-colors">
                  Wisdom Tower Digital
                </h2>
                <p className="text-wisdom-muted mb-7 leading-relaxed">
                  Professional services across design, writing, academic support, data, marketing,
                  business and multimedia.
                </p>
                <div className="flex items-center gap-2 text-wisdom-cyan font-semibold">
                  Explore Digital Services
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="stat-card card-3d group relative overflow-hidden rounded-2xl border border-white/12 bg-wisdom-card p-6 md:p-8 text-center"
              >
                <div className="relative">
                  <div className="stat-value font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2 group-hover:text-wisdom-cyan transition-colors duration-300">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-wisdom-muted font-semibold uppercase tracking-[0.15em]">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-28">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-2xl md:text-4xl font-bold mb-4">Not sure where to start?</h2>
          <p className="text-wisdom-muted mb-9 text-lg">
            Tell us your goal and we'll guide you to the right path.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl bg-wisdom-cyan text-wisdom-dark font-semibold text-lg
              hover:bg-wisdom-cyan-dark hover:shadow-glow hover:scale-105 active:scale-100 transition-all duration-300"
          >
            Let's Build Together
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
