"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Calculator as CalcIcon,
  X,
  Minimize2,
  Maximize2,
  Delete,
} from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

// Safe factorial for integers
function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

// Safe mathematical expression evaluator without eval / new Function
function evaluateMathExpression(raw: string): number {
  const sanitized = raw
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/\^/g, "**")
    .replace(/π/g, String(Math.PI))
    .replace(/\be\b/g, String(Math.E))
    .trim();

  if (!/^[0-9+\-*/().\s*]+$/.test(sanitized)) {
    return NaN;
  }

  // Tokenize
  const tokens: string[] = [];
  let i = 0;
  while (i < sanitized.length) {
    const ch = sanitized[i];
    if (ch === " ") {
      i++;
      continue;
    }
    if (ch === "*" && sanitized[i + 1] === "*") {
      tokens.push("**");
      i += 2;
      continue;
    }
    if ("+-*/()".includes(ch)) {
      tokens.push(ch);
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let num = "";
      while (i < sanitized.length && /[0-9.]/.test(sanitized[i])) {
        num += sanitized[i];
        i++;
      }
      tokens.push(num);
      continue;
    }
    i++;
  }

  // Shunting-yard algorithm to RPN
  const output: string[] = [];
  const ops: string[] = [];
  const precedence: Record<string, number> = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
    "**": 3,
  };

  for (let t = 0; t < tokens.length; t++) {
    const token = tokens[t];
    if (!Number.isNaN(Number(token))) {
      output.push(token);
    } else if (token in precedence) {
      if (token === "-" && (t === 0 || tokens[t - 1] === "(" || tokens[t - 1] in precedence)) {
        output.push("0");
      }
      while (
        ops.length &&
        ops[ops.length - 1] in precedence &&
        (token !== "**"
          ? precedence[ops[ops.length - 1]] >= precedence[token]
          : precedence[ops[ops.length - 1]] > precedence[token])
      ) {
        output.push(ops.pop()!);
      }
      ops.push(token);
    } else if (token === "(") {
      ops.push(token);
    } else if (token === ")") {
      while (ops.length && ops[ops.length - 1] !== "(") {
        output.push(ops.pop()!);
      }
      ops.pop();
    }
  }

  while (ops.length) {
    output.push(ops.pop()!);
  }

  // Evaluate RPN
  const stack: number[] = [];
  for (const token of output) {
    if (!Number.isNaN(Number(token))) {
      stack.push(Number(token));
    } else {
      const b = stack.pop();
      const a = stack.pop();
      if (a === undefined || b === undefined) return NaN;
      switch (token) {
        case "+":
          stack.push(a + b);
          break;
        case "-":
          stack.push(a - b);
          break;
        case "*":
          stack.push(a * b);
          break;
        case "/":
          if (b === 0) return NaN;
          stack.push(a / b);
          break;
        case "**":
          stack.push(Math.pow(a, b));
          break;
      }
    }
  }

  return stack.length === 1 ? stack[0] : NaN;
}

export default function ScientificCalculator({ isOpen, onClose }: Props) {
  const [expr, setExpr] = useState("");
  const [display, setDisplay] = useState("0");
  const [isRad, setIsRad] = useState(false); // false = DEG, true = RAD
  const [minimized, setMinimized] = useState(false);
  const [evaluated, setEvaluated] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const clearAll = useCallback(() => {
    setExpr("");
    setDisplay("0");
    setEvaluated(false);
  }, []);

  const backspace = useCallback(() => {
    if (evaluated) {
      clearAll();
      return;
    }
    if (display.length > 1) {
      setDisplay((d) => d.slice(0, -1));
    } else {
      setDisplay("0");
    }
  }, [evaluated, clearAll, display.length]);

  const appendDigit = useCallback(
    (d: string) => {
      if (evaluated) {
        setExpr("");
        setDisplay(d);
        setEvaluated(false);
        return;
      }
      setDisplay((prev) => (prev === "0" ? d : prev + d));
    },
    [evaluated]
  );

  const appendDot = useCallback(() => {
    if (evaluated) {
      setExpr("");
      setDisplay("0.");
      setEvaluated(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay((prev) => prev + ".");
    }
  }, [evaluated, display]);

  const appendOp = useCallback(
    (op: string) => {
      setEvaluated(false);
      const current = display;
      setExpr((prev) => `${prev} ${current} ${op}`.trim());
      setDisplay("0");
    },
    [display]
  );

  const appendToken = useCallback(
    (tok: string) => {
      setEvaluated(false);
      if (tok === "(" || tok === ")") {
        setExpr((prev) => `${prev} ${tok}`.trim());
      }
    },
    []
  );

  const toggleSign = useCallback(() => {
    if (display === "0") return;
    setDisplay((prev) => (prev.startsWith("-") ? prev.slice(1) : "-" + prev));
  }, [display]);

  // Compute full equation using safe evaluator
  const calculate = useCallback(() => {
    try {
      const full = `${expr} ${display}`.trim();
      const result = evaluateMathExpression(full);
      if (Number.isNaN(result) || !Number.isFinite(result)) {
        setDisplay("Error");
      } else {
        const rounded = Math.round(result * 1e10) / 1e10;
        const resultStr = String(rounded);
        setHistory((h) => [`${expr} ${display} = ${resultStr}`, ...h.slice(0, 4)]);
        setExpr(`${expr} ${display} =`);
        setDisplay(resultStr);
        setEvaluated(true);
      }
    } catch {
      setDisplay("Error");
    }
  }, [expr, display]);

  // Keep latest function references for event listener
  const handlersRef = useRef({
    appendDigit,
    appendDot,
    appendOp,
    appendToken,
    backspace,
    calculate,
    onClose,
  });

  useEffect(() => {
    handlersRef.current = {
      appendDigit,
      appendDot,
      appendOp,
      appendToken,
      backspace,
      calculate,
      onClose,
    };
  });

  // Keyboard navigation & inputs
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "Escape") {
        handlersRef.current.onClose();
        return;
      }
      if (/^[0-9]$/.test(e.key)) {
        handlersRef.current.appendDigit(e.key);
      } else if (e.key === ".") {
        handlersRef.current.appendDot();
      } else if (e.key === "+" || e.key === "-" || e.key === "*" || e.key === "/") {
        const op = e.key === "*" ? "×" : e.key === "/" ? "÷" : e.key === "-" ? "−" : "+";
        handlersRef.current.appendOp(op);
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        handlersRef.current.calculate();
      } else if (e.key === "Backspace") {
        handlersRef.current.backspace();
      } else if (e.key === "(" || e.key === ")") {
        handlersRef.current.appendToken(e.key);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Scientific special functions (instant on current display)
  const applyInstantFunc = useCallback(
    (fn: string) => {
      const val = parseFloat(display);
      if (Number.isNaN(val)) return;
      let res = val;

      switch (fn) {
        case "sqr":
          res = Math.pow(val, 2);
          setExpr(`${val}²`);
          break;
        case "cube":
          res = Math.pow(val, 3);
          setExpr(`${val}³`);
          break;
        case "sqrt":
          res = Math.sqrt(val);
          setExpr(`√(${val})`);
          break;
        case "cbrt":
          res = Math.cbrt(val);
          setExpr(`∛(${val})`);
          break;
        case "inv":
          res = val === 0 ? NaN : 1 / val;
          setExpr(`1/(${val})`);
          break;
        case "fact":
          res = factorial(val);
          setExpr(`${val}!`);
          break;
        case "sin": {
          const angle = isRad ? val : (val * Math.PI) / 180;
          res = Math.sin(angle);
          setExpr(`sin(${val}${isRad ? " rad" : "°"})`);
          break;
        }
        case "cos": {
          const angle = isRad ? val : (val * Math.PI) / 180;
          res = Math.cos(angle);
          setExpr(`cos(${val}${isRad ? " rad" : "°"})`);
          break;
        }
        case "tan": {
          const angle = isRad ? val : (val * Math.PI) / 180;
          res = Math.tan(angle);
          setExpr(`tan(${val}${isRad ? " rad" : "°"})`);
          break;
        }
        case "asin": {
          const rad = Math.asin(val);
          res = isRad ? rad : (rad * 180) / Math.PI;
          setExpr(`asin(${val})`);
          break;
        }
        case "acos": {
          const rad = Math.acos(val);
          res = isRad ? rad : (rad * 180) / Math.PI;
          setExpr(`acos(${val})`);
          break;
        }
        case "atan": {
          const rad = Math.atan(val);
          res = isRad ? rad : (rad * 180) / Math.PI;
          setExpr(`atan(${val})`);
          break;
        }
        case "ln":
          res = Math.log(val);
          setExpr(`ln(${val})`);
          break;
        case "log10":
          res = Math.log10(val);
          setExpr(`log(${val})`);
          break;
        case "exp":
          res = Math.exp(val);
          setExpr(`e^(${val})`);
          break;
        case "pow10":
          res = Math.pow(10, val);
          setExpr(`10^(${val})`);
          break;
        case "pi":
          res = Math.PI;
          setExpr("π");
          break;
        case "e":
          res = Math.E;
          setExpr("e");
          break;
        case "pct":
          res = val / 100;
          setExpr(`${val}%`);
          break;
      }

      if (Number.isNaN(res) || !Number.isFinite(res)) {
        setDisplay("Error");
      } else {
        const rounded = Math.round(res * 1e10) / 1e10;
        setDisplay(String(rounded));
      }
      setEvaluated(true);
    },
    [display, isRad]
  );

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-label="Scientific Calculator"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] w-[calc(100vw-2rem)] sm:w-[380px] max-w-[420px] rounded-3xl border border-cyan-400/30 bg-[#090f20]/95 backdrop-blur-2xl shadow-[0_12px_45px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95 text-white"
    >
      {/* Top Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-slate-950/80 border-b border-white/10 select-none">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
            <CalcIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="font-display text-xs font-bold text-white tracking-wide">
              Scientific Calculator
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsRad(!isRad)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
              isRad
                ? "bg-violet-500/20 text-violet-300 border-violet-400/40"
                : "bg-cyan-500/20 text-cyan-300 border-cyan-400/40"
            }`}
            title="Toggle Radian / Degree mode"
          >
            {isRad ? "RAD" : "DEG"}
          </button>

          <button
            type="button"
            onClick={() => setMinimized(!minimized)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title={minimized ? "Expand" : "Minimize"}
          >
            {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Close calculator"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calculator Body (collapsible if minimized) */}
      {!minimized && (
        <div className="p-3.5 sm:p-4 space-y-3">
          {/* LCD Screen Display */}
          <div className="rounded-2xl border border-white/10 bg-black/60 p-3 sm:p-3.5 text-right font-mono shadow-inner">
            <div className="min-h-[18px] text-[11px] sm:text-xs text-cyan-300/80 truncate mb-1">
              {expr || (history[0] ? `Last: ${history[0]}` : "Ready")}
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white overflow-x-auto whitespace-nowrap scrollbar-none">
              {display}
            </div>
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-5 gap-1.5 text-xs sm:text-sm font-semibold select-none">
            {/* Row 1: Sci Functions */}
            <SciBtn onClick={() => applyInstantFunc("sin")}>sin</SciBtn>
            <SciBtn onClick={() => applyInstantFunc("cos")}>cos</SciBtn>
            <SciBtn onClick={() => applyInstantFunc("tan")}>tan</SciBtn>
            <SciBtn onClick={() => applyInstantFunc("pi")}>π</SciBtn>
            <SciBtn onClick={() => applyInstantFunc("e")}>e</SciBtn>

            {/* Row 2: Powers & Roots */}
            <SciBtn onClick={() => applyInstantFunc("sqrt")}>√x</SciBtn>
            <SciBtn onClick={() => applyInstantFunc("cbrt")}>∛x</SciBtn>
            <SciBtn onClick={() => applyInstantFunc("sqr")}>x²</SciBtn>
            <SciBtn onClick={() => applyInstantFunc("cube")}>x³</SciBtn>
            <SciBtn onClick={() => appendOp("^")}>xʸ</SciBtn>

            {/* Row 3: Log & Reciprocal */}
            <SciBtn onClick={() => applyInstantFunc("ln")}>ln</SciBtn>
            <SciBtn onClick={() => applyInstantFunc("log10")}>log</SciBtn>
            <SciBtn onClick={() => applyInstantFunc("inv")}>1/x</SciBtn>
            <SciBtn onClick={() => applyInstantFunc("fact")}>n!</SciBtn>
            <SciBtn onClick={() => applyInstantFunc("pct")}>%</SciBtn>

            {/* Row 4: Parentheses & Clear */}
            <SciBtn onClick={() => appendToken("(")}>(</SciBtn>
            <SciBtn onClick={() => appendToken(")")}>)</SciBtn>
            <ActionBtn onClick={clearAll} tone="danger">
              AC
            </ActionBtn>
            <ActionBtn onClick={backspace} tone="warning">
              <Delete className="w-3.5 h-3.5 mx-auto" />
            </ActionBtn>
            <OpBtn onClick={() => appendOp("÷")}>÷</OpBtn>

            {/* Row 5: 7 8 9 & Mult */}
            <NumBtn onClick={() => appendDigit("7")}>7</NumBtn>
            <NumBtn onClick={() => appendDigit("8")}>8</NumBtn>
            <NumBtn onClick={() => appendDigit("9")}>9</NumBtn>
            <ActionBtn onClick={toggleSign} tone="muted">
              ±
            </ActionBtn>
            <OpBtn onClick={() => appendOp("×")}>×</OpBtn>

            {/* Row 6: 4 5 6 & Minus */}
            <NumBtn onClick={() => appendDigit("4")}>4</NumBtn>
            <NumBtn onClick={() => appendDigit("5")}>5</NumBtn>
            <NumBtn onClick={() => appendDigit("6")}>6</NumBtn>
            <SciBtn onClick={() => applyInstantFunc("asin")}>sin⁻¹</SciBtn>
            <OpBtn onClick={() => appendOp("−")}>−</OpBtn>

            {/* Row 7: 1 2 3 & Plus */}
            <NumBtn onClick={() => appendDigit("1")}>1</NumBtn>
            <NumBtn onClick={() => appendDigit("2")}>2</NumBtn>
            <NumBtn onClick={() => appendDigit("3")}>3</NumBtn>
            <SciBtn onClick={() => applyInstantFunc("acos")}>cos⁻¹</SciBtn>
            <OpBtn onClick={() => appendOp("+")}>+</OpBtn>

            {/* Row 8: 0 . Equals */}
            <NumBtn onClick={() => appendDigit("0")} className="col-span-2">
              0
            </NumBtn>
            <NumBtn onClick={appendDot}>.</NumBtn>
            <SciBtn onClick={() => applyInstantFunc("atan")}>tan⁻¹</SciBtn>
            <button
              type="button"
              onClick={calculate}
              className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-base shadow-[0_0_15px_rgba(16,185,129,0.35)] hover:from-emerald-400 hover:to-cyan-400 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              =
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NumBtn({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-2 rounded-xl border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.12] active:scale-95 transition-all font-mono font-bold text-sm ${className}`}
    >
      {children}
    </button>
  );
}

function OpBtn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="py-2 rounded-xl border border-amber-400/30 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25 active:scale-95 transition-all font-mono font-bold text-base"
    >
      {children}
    </button>
  );
}

function SciBtn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="py-1.5 rounded-xl border border-cyan-400/20 bg-cyan-950/30 text-cyan-200 hover:bg-cyan-500/20 active:scale-95 transition-all font-mono text-xs font-semibold"
    >
      {children}
    </button>
  );
}

function ActionBtn({
  children,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone: "danger" | "warning" | "muted";
}) {
  const map = {
    danger: "border-rose-400/40 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25",
    warning: "border-amber-400/40 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25",
    muted: "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-2 rounded-xl border active:scale-95 transition-all font-mono font-bold text-xs ${map[tone]}`}
    >
      {children}
    </button>
  );
}
