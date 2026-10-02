"use client";

import { useState, useMemo } from "react";
import {
  X,
  Search,
  Sigma,
  Atom,
  Binary,
  Layers,
  Sparkles,
  BookOpen,
} from "lucide-react";

type FormulaCategory = "math" | "physics" | "constants";

type FormulaItem = {
  id: string;
  category: FormulaCategory;
  title: string;
  formula: string;
  note?: string;
};

const FORMULA_DATABASE: FormulaItem[] = [
  // --- Mathematics: Algebra & Calculus ---
  {
    id: "quad-formula",
    category: "math",
    title: "Quadratic Formula",
    formula: "x = (-b ± √(b² - 4ac)) / (2a)",
    note: "Discriminant Δ = b² - 4ac; Real roots when Δ ≥ 0",
  },
  {
    id: "pythagoras",
    category: "math",
    title: "Pythagorean Theorem",
    formula: "a² + b² = c²",
    note: "For any right-angled triangle where c is the hypotenuse",
  },
  {
    id: "deriv-power",
    category: "math",
    title: "Power Rule (Derivative)",
    formula: "d/dx [xⁿ] = n · xⁿ⁻¹",
  },
  {
    id: "deriv-product",
    category: "math",
    title: "Product Rule (Derivative)",
    formula: "d/dx [u · v] = u'v + uv'",
  },
  {
    id: "deriv-quotient",
    category: "math",
    title: "Quotient Rule (Derivative)",
    formula: "d/dx [u / v] = (u'v - uv') / v²",
  },
  {
    id: "deriv-chain",
    category: "math",
    title: "Chain Rule",
    formula: "d/dx [f(g(x))] = f'(g(x)) · g'(x)",
  },
  {
    id: "integ-power",
    category: "math",
    title: "Power Rule (Integration)",
    formula: "∫ xⁿ dx = (xⁿ⁺¹) / (n + 1) + C,  (n ≠ -1)",
  },
  {
    id: "integ-inv",
    category: "math",
    title: "Reciprocal Integral",
    formula: "∫ (1/x) dx = ln|x| + C",
  },
  {
    id: "trig-pythag",
    category: "math",
    title: "Fundamental Trig Identity",
    formula: "sin²(θ) + cos²(θ) = 1",
    note: "1 + tan²(θ) = sec²(θ); 1 + cot²(θ) = csc²(θ)",
  },
  {
    id: "trig-double-sin",
    category: "math",
    title: "Double Angle (Sine)",
    formula: "sin(2θ) = 2 · sin(θ) · cos(θ)",
  },
  {
    id: "trig-double-cos",
    category: "math",
    title: "Double Angle (Cosine)",
    formula: "cos(2θ) = cos²(θ) - sin²(θ) = 2cos²(θ) - 1",
  },
  {
    id: "log-properties",
    category: "math",
    title: "Logarithm Rules",
    formula: "log(ab) = log(a) + log(b),  log(a/b) = log(a) - log(b)",
    note: "log(aⁿ) = n · log(a); Change of base: log_b(a) = ln(a) / ln(b)",
  },

  // --- Physics: Mechanics & Electromagnetism ---
  {
    id: "kin-1",
    category: "physics",
    title: "Kinematics: Velocity",
    formula: "v = v₀ + a · t",
  },
  {
    id: "kin-2",
    category: "physics",
    title: "Kinematics: Displacement",
    formula: "Δx = v₀ · t + ½ · a · t²",
  },
  {
    id: "kin-3",
    category: "physics",
    title: "Kinematics: Time-Independent",
    formula: "v² = v₀² + 2 · a · Δx",
  },
  {
    id: "newton-2",
    category: "physics",
    title: "Newton's Second Law",
    formula: "F_net = m · a",
  },
  {
    id: "work-energy",
    category: "physics",
    title: "Work-Kinetic Energy Theorem",
    formula: "W_net = ΔK = ½ · m · v_f² - ½ · m · v_i²",
  },
  {
    id: "grav-force",
    category: "physics",
    title: "Universal Gravitation",
    formula: "F_g = G · (m₁ · m₂) / r²",
  },
  {
    id: "coulomb-law",
    category: "physics",
    title: "Coulomb's Law",
    formula: "F_e = k · (|q₁ · q₂|) / r²",
  },
  {
    id: "ohm-law",
    category: "physics",
    title: "Ohm's Law",
    formula: "V = I · R,   P = I · V = I² · R = V² / R",
  },
  {
    id: "wave-speed",
    category: "physics",
    title: "Wave Equation",
    formula: "v = f · λ",
    note: "f = frequency, λ = wavelength, v = wave speed",
  },

  // --- Scientific Constants ---
  {
    id: "const-c",
    category: "constants",
    title: "Speed of Light in Vacuum (c)",
    formula: "c ≈ 2.998 × 10⁸ m/s",
  },
  {
    id: "const-g",
    category: "constants",
    title: "Standard Gravity (g)",
    formula: "g ≈ 9.807 m/s² ≈ 9.8 m/s²",
  },
  {
    id: "const-G",
    category: "constants",
    title: "Universal Gravitational Constant (G)",
    formula: "G ≈ 6.674 × 10⁻¹¹ N·m²/kg²",
  },
  {
    id: "const-e",
    category: "constants",
    title: "Elementary Charge (e)",
    formula: "e ≈ 1.602 × 10⁻¹⁹ C",
  },
  {
    id: "const-h",
    category: "constants",
    title: "Planck's Constant (h)",
    formula: "h ≈ 6.626 × 10⁻³⁴ J·s",
  },
  {
    id: "const-k-coulomb",
    category: "constants",
    title: "Coulomb Constant (k_e)",
    formula: "k_e ≈ 8.988 × 10⁹ N·m²/C²",
  },
  {
    id: "const-avogadro",
    category: "constants",
    title: "Avogadro's Number (N_A)",
    formula: "N_A ≈ 6.022 × 10²³ mol⁻¹",
  },
  {
    id: "const-pi",
    category: "constants",
    title: "Pi (π)",
    formula: "π ≈ 3.1415926535",
  },
  {
    id: "const-euler",
    category: "constants",
    title: "Euler's Number (e)",
    formula: "e ≈ 2.7182818284",
  },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function FormulasDrawer({ isOpen, onClose }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<"all" | FormulaCategory>("all");

  const filtered = useMemo(() => {
    return FORMULA_DATABASE.filter((item) => {
      const matchCat = selectedCat === "all" || item.category === selectedCat;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.formula.toLowerCase().includes(q) ||
        (item.note && item.note.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [search, selectedCat]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Formulas and Constants Reference"
      className="fixed inset-0 z-[100] flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md h-full bg-[#080e1e] border-l border-white/15 p-4 sm:p-5 flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200 text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-400/30">
              <Sigma className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-sm sm:text-base font-bold text-white">
                Formulas & Constants
              </h3>
              <p className="text-[11px] text-wisdom-muted">
                Exam & Practice Quick Reference
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close formulas sheet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mt-3.5 mb-2.5">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search formula, theorem, or constant..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/60 transition-colors"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 pb-3 border-b border-white/10 overflow-x-auto scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setSelectedCat("all")}
            className={`px-3 py-1 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
              selectedCat === "all"
                ? "bg-cyan-400 text-slate-950 shadow-sm"
                : "bg-white/5 text-slate-300 hover:text-white"
            }`}
          >
            All ({FORMULA_DATABASE.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCat("math")}
            className={`px-3 py-1 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
              selectedCat === "math"
                ? "bg-violet-400 text-slate-950 shadow-sm"
                : "bg-white/5 text-slate-300 hover:text-white"
            }`}
          >
            Math
          </button>
          <button
            type="button"
            onClick={() => setSelectedCat("physics")}
            className={`px-3 py-1 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
              selectedCat === "physics"
                ? "bg-emerald-400 text-slate-950 shadow-sm"
                : "bg-white/5 text-slate-300 hover:text-white"
            }`}
          >
            Physics
          </button>
          <button
            type="button"
            onClick={() => setSelectedCat("constants")}
            className={`px-3 py-1 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
              selectedCat === "constants"
                ? "bg-amber-400 text-slate-950 shadow-sm"
                : "bg-white/5 text-slate-300 hover:text-white"
            }`}
          >
            Constants
          </button>
        </div>

        {/* Formula Cards Scroll List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 py-3 pr-1">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-wisdom-muted py-10">
              No matching formula found for &ldquo;{search}&rdquo;
            </p>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h4 className="font-display text-xs sm:text-sm font-bold text-white">
                    {item.title}
                  </h4>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      item.category === "math"
                        ? "border-violet-400/30 text-violet-300 bg-violet-500/10"
                        : item.category === "physics"
                        ? "border-emerald-400/30 text-emerald-300 bg-emerald-500/10"
                        : "border-amber-400/30 text-amber-300 bg-amber-500/10"
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 font-mono text-xs sm:text-sm text-cyan-200 font-bold overflow-x-auto whitespace-nowrap">
                  {item.formula}
                </div>
                {item.note && (
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed italic">
                    {item.note}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
