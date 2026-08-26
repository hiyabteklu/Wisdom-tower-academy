import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Users, Award, Target } from "lucide-react";

const programs = [
  {
    id: "grade-9-12",
    name: "Grade 9–12",
    description: "Complete secondary school support with structured lessons, practice exams, and personalized guidance.",
    icon: <BookOpen className="w-7 h-7" />,
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80",
    gradient: "from-blue-500/30 to-cyan-500/10",
  },
  {
    id: "remedial",
    name: "Remedial Programs",
    description: "Targeted catch-up courses designed to strengthen foundational knowledge and close learning gaps.",
    icon: <Target className="w-7 h-7" />,
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80",
    gradient: "from-amber-500/30 to-orange-500/10",
  },
  {
    id: "freshman",
    name: "Freshman",
    description: "University entrance preparation and first-year success programs for incoming college students.",
    icon: <GraduationCap className="w-7 h-7" />,
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80",
    gradient: "from-purple-500/30 to-pink-500/10",
  },
  {
    id: "uat",
    name: "UAT",
    description: "University Admission Test preparation with focused practice, mock exams, and expert strategies.",
    icon: <Award className="w-7 h-7" />,
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80",
    gradient: "from-emerald-500/30 to-teal-500/10",
  },
  {
    id: "gat",
    name: "GAT",
    description: "Graduate Admission Test coaching covering quantitative, verbal, and analytical sections.",
    icon: <Users className="w-7 h-7" />,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80",
    gradient: "from-rose-500/30 to-red-500/10",
  },
];

export default function AcademyPage() {
  return (
    <div className="relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Academic Excellence Pathways
            </h1>
            <p className="text-wisdom-muted max-w-2xl mx-auto text-lg">
              From secondary school to university admission — structured programs designed for real results.
            </p>
          </div>

          {/* Programs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div
                key={program.id}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-wisdom-card hover:border-amber-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:scale-110 transition-transform duration-700"
                    style={{ backgroundImage: `url(${program.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-wisdom-card via-wisdom-card/70 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${program.gradient} border border-white/10 text-amber-400`}>
                      {program.icon}
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-amber-400 transition-colors">
                    {program.name}
                  </h3>
                  <p className="text-sm text-wisdom-muted leading-relaxed mb-4">
                    {program.description}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-amber-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 relative overflow-hidden rounded-3xl border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-wisdom-card to-orange-500/5" />
            <div className="relative px-8 py-14 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Ready to start learning?
              </h2>
              <p className="text-wisdom-muted mb-8 max-w-lg mx-auto">
                Contact us to enroll or get a personalized study plan.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-500 text-wisdom-dark font-semibold hover:bg-amber-400 transition-all hover:scale-105"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
