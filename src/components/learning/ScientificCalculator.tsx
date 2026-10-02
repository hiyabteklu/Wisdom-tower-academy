"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Calculator as CalcIcon,
  X,
  Minimize2,
  Maximize2,
  Delete,
  GripHorizontal,
  Eye,
  EyeOff,
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
      ops.pop(); // pop "("
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
        default:
          return NaN;
      }
    }
  }

  return stack.length === 1 ? stack[0] : NaN;
}

export default function ScientificCalculator({ isOpen, onClose }: Props) {
  const [expr, setExpr] = useState("");
  const [display, setDisplay] = useState("0");
  const [isRad, setIsRad] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [isGhost, setIsGhost] = useState(false); // Semi-transparent mode to see content behind
  const [evaluated, setEvaluated] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Sizing mode: mini (230px), normal (275px), sci (350px) or custom user dragged width
  const [width, setWidth] = useState(265);
  const [sizePreset, setSizePreset] = useState<"mini" | "normal" | "sci">("normal");

  // Draggable position state
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    dragging: boolean;
  }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    dragging: false,
  });

  const resizeRef = useRef<{
    startX: number;
    startY: number;
    initialW: number;
    resizing: boolean;
  }>({
    startX: 0,
    startY: 0,
    initialW: 265,
    resizing: false,
  });

  const cardRef = useRef<HTMLDivElement>(null);

  // Position defaults on mount/open
  useEffect(() => {
    if (isOpen && pos === null && typeof window !== "undefined") {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const targetW = Math.min(width, w - 24);
      // Place at bottom right with breathing room
      setPos({
        x: Math.max(12, w - targetW - 14),
        y: Math.max(60, h - 360),
      });
    }
  }, [isOpen, pos, width]);

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

  const appendToken = useCallback((tok: string) => {
    setEvaluated(false);
    if (tok === "(" || tok === ")") {
      setExpr((prev) => `${prev} ${tok}`.trim());
    }
  }, []);

  const toggleSign = useCallback(() => {
    if (display === "0") return;
    setDisplay((prev) => (prev.startsWith("-") ? prev.slice(1) : "-" + prev));
  }, [display]);

  // Compute full equation
  const calculate = useCallback(() => {
    try {
      const full = `${expr} ${display}`.trim();
      const result = evaluateMathExpression(full);
      if (Number.isNaN(result) || !Number.isFinite(result)) {
        setDisplay("Error");
      } else {
        const rounded = Math.round(result * 1e10) / 1e10;
        const resultStr = String(rounded);
        setHistory((h) => [`${expr} ${display} = ${resultStr}`, ...h.slice(0, 3)]);
        setExpr(`${expr} ${display} =`);
        setDisplay(resultStr);
        setEvaluated(true);
      }
    } catch {
      setDisplay("Error");
    }
  }, [expr, display]);

  // Instant one-operand functions
  const applyInstantFunc = useCallback(
    (func: string) => {
      const val = Number(display);
      if (Number.isNaN(val)) return;
      let res = val;

      switch (func) {
        case "sqrt":
          res = Math.sqrt(val);
          break;
        case "sqr":
          res = val * val;
          break;
        case "cube":
          res = val * val * val;
          break;
        case "inv":
          res = val !== 0 ? 1 / val : NaN;
          break;
        case "sin": {
          const angle = isRad ? val : (val * Math.PI) / 180;
          res = Math.sin(angle);
          break;
        }
        case "cos": {
          const angle = isRad ? val : (val * Math.PI) / 180;
          res = Math.cos(angle);
          break;
        }
        case "tan": {
          const angle = isRad ? val : (val * Math.PI) / 180;
          res = Math.tan(angle);
          break;
        }
        case "ln":
          res = Math.log(val);
          break;
        case "log10":
          res = Math.log10(val);
          break;
        case "fact":
          res = factorial(val);
          break;
        case "pct":
          res = val / 100;
          break;
        case "pi":
          res = Math.PI;
          break;
        case "e":
          res = Math.E;
          break;
      }

      if (Number.isNaN(res) || !Number.isFinite(res)) {
        setDisplay("Error");
      } else {
        const rounded = Math.round(res * 1e10) / 1e10;
        setDisplay(String(rounded));
        setEvaluated(true);
      }
    },
    [display, isRad]
  );

  // Preset size change
  function applyPreset(preset: "mini" | "normal" | "sci") {
    setSizePreset(preset);
    if (preset === "mini") setWidth(225);
    else if (preset === "normal") setWidth(265);
    else if (preset === "sci") setWidth(345);

    // Keep within bounds
    if (pos && typeof window !== "undefined") {
      const targetW = preset === "mini" ? 225 : preset === "normal" ? 265 : 345;
      const maxX = Math.max(8, window.innerWidth - targetW - 8);
      if (pos.x > maxX) {
        setPos((p) => (p ? { ...p, x: maxX } : null));
      }
    }
  }

  // --- DRAG HANDLING (HEADER) ---
  const startDrag = (clientX: number, clientY: number) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: rect.left,
      initialY: rect.top,
      dragging: true,
    };
  };

  const onTouchStartDrag = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onMouseDownDrag = (e: React.MouseEvent) => {
    if (e.button === 0) {
      startDrag(e.clientX, e.clientY);
    }
  };

  // --- RESIZE HANDLING (BOTTOM-RIGHT CORNER) ---
  const startResize = (clientX: number, clientY: number) => {
    resizeRef.current = {
      startX: clientX,
      startY: clientY,
      initialW: width,
      resizing: true,
    };
  };

  const onTouchStartResize = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length === 1) {
      startResize(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onMouseDownResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.button === 0) {
      startResize(e.clientX, e.clientY);
    }
  };

  // Combined Move & End Listeners
  useEffect(() => {
    function handleMove(clientX: number, clientY: number, e?: Event) {
      // Handle Dragging
      if (dragRef.current.dragging && cardRef.current) {
        if (e && e.cancelable) e.preventDefault();
        const dx = clientX - dragRef.current.startX;
        const dy = clientY - dragRef.current.startY;
        const cardW = cardRef.current.offsetWidth || 265;
        const cardH = cardRef.current.offsetHeight || 300;
        const maxX = Math.max(8, window.innerWidth - cardW - 8);
        const maxY = Math.max(8, window.innerHeight - cardH - 8);

        const nextX = Math.min(maxX, Math.max(8, dragRef.current.initialX + dx));
        const nextY = Math.min(maxY, Math.max(8, dragRef.current.initialY + dy));
        setPos({ x: nextX, y: nextY });
      }

      // Handle Resizing
      if (resizeRef.current.resizing) {
        if (e && e.cancelable) e.preventDefault();
        const dx = clientX - resizeRef.current.startX;
        const maxW = Math.max(215, window.innerWidth - (pos?.x || 12) - 12);
        const nextW = Math.min(maxW, Math.max(215, resizeRef.current.initialW + dx));
        setWidth(nextW);
        if (nextW < 245) setSizePreset("mini");
        else if (nextW > 310) setSizePreset("sci");
        else setSizePreset("normal");
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (dragRef.current.dragging || resizeRef.current.resizing) {
        if (e.touches.length === 1) {
          handleMove(e.touches[0].clientX, e.touches[0].clientY, e);
        }
      }
    }

    function onMouseMove(e: MouseEvent) {
      if (dragRef.current.dragging || resizeRef.current.resizing) {
        handleMove(e.clientX, e.clientY, e);
      }
    }

    function onEnd() {
      dragRef.current.dragging = false;
      resizeRef.current.resizing = false;
    }

    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onEnd);

    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
    };
  }, [pos]);

  if (!isOpen) return null;

  // Minimized Floating Pill Mode (Ultra compact, never blocks the screen)
  if (minimized) {
    return (
      <div
        ref={cardRef}
        role="dialog"
        aria-label="Minimized Calculator"
        style={
          pos
            ? { left: `${pos.x}px`, top: `${pos.y}px`, position: "fixed" }
            : { bottom: "1rem", right: "1rem", position: "fixed" }
        }
        className="z-[100] flex items-center gap-1.5 rounded-full border border-cyan-400/50 bg-[#090f20]/95 backdrop-blur-xl px-2.5 py-1 text-white shadow-2xl select-none"
      >
        <div
          onTouchStart={onTouchStartDrag}
          onMouseDown={onMouseDownDrag}
          className="flex items-center gap-1 cursor-move"
          title="Drag to reposition"
        >
          <GripHorizontal className="w-3 h-3 text-cyan-400" />
          <CalcIcon className="w-3.5 h-3.5 text-cyan-300" />
          <span className="font-mono text-xs font-bold text-amber-300 max-w-[90px] truncate">
            {display}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10"
          title="Expand Calculator"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
          title="Close"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  const isMini = sizePreset === "mini" || width < 245;
  const isSci = sizePreset === "sci" || width > 310;

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-label="Floating Movable Resizable Calculator"
      style={{
        width: `${width}px`,
        left: pos ? `${pos.x}px` : undefined,
        top: pos ? `${pos.y}px` : undefined,
        bottom: !pos ? "1rem" : undefined,
        right: !pos ? "1rem" : undefined,
        position: "fixed",
      }}
      className={`z-[100] rounded-2xl border border-cyan-400/35 ${
        isGhost ? "bg-[#090f20]/75" : "bg-[#090f20]/95"
      } backdrop-blur-xl shadow-[0_12px_45px_rgba(0,0,0,0.7)] overflow-hidden transition-opacity select-none text-white`}
    >
      {/* Draggable Title Header Handle */}
      <div
        onTouchStart={onTouchStartDrag}
        onMouseDown={onMouseDownDrag}
        className="flex items-center justify-between px-2.5 py-1.5 bg-gradient-to-r from-cyan-950/60 via-slate-900/80 to-slate-950/95 border-b border-white/10 cursor-move active:cursor-grabbing"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <GripHorizontal className="w-3.5 h-3.5 text-cyan-400/80 shrink-0" />
          <span className="font-display text-[11px] font-bold text-white tracking-wide truncate">
            Calc
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Preset size buttons: Mini / Norm / Sci */}
          <div className="inline-flex rounded-md bg-black/50 p-0.5 border border-white/10 text-[9px] font-bold">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                applyPreset("mini");
              }}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${
                isMini ? "bg-cyan-400 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
              title="Mini compact mode (fits tight spaces)"
            >
              Mini
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                applyPreset("normal");
              }}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${
                !isMini && !isSci ? "bg-cyan-400 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
              title="Standard mode"
            >
              Std
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                applyPreset("sci");
              }}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${
                isSci ? "bg-cyan-400 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
              title="Scientific mode with all advanced functions"
            >
              Sci
            </button>
          </div>

          {/* Ghost / Translucency toggle (see questions behind calculator) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsGhost(!isGhost);
            }}
            className={`p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ${
              isGhost ? "text-cyan-300 bg-cyan-500/20" : ""
            }`}
            title={isGhost ? "Solid mode" : "Translucent ghost mode (see text behind)"}
          >
            {isGhost ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>

          {/* Minimize into floating pill */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMinimized(true);
            }}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Minimize to floating pill"
          >
            <Minimize2 className="w-3 h-3" />
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Close calculator"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Screen Display */}
      <div className="px-2.5 pt-2 pb-1.5">
        <div className="rounded-xl border border-white/10 bg-black/80 px-2.5 py-1.5 text-right font-mono shadow-inner">
          <div className="min-h-[12px] text-[10px] text-cyan-300/80 truncate">
            {expr || (history[0] ? `Ans: ${history[0]}` : "Ready")}
          </div>
          <div className="text-lg sm:text-xl font-black tracking-tight text-white overflow-x-auto whitespace-nowrap scrollbar-none">
            {display}
          </div>
        </div>
      </div>

      {/* Keypad */}
      <div className="px-2.5 pb-2">
        {/* If Sci mode, show advanced top functions & DEG/RAD */}
        {isSci && (
          <div className="mb-1.5 flex items-center justify-between gap-1 text-[10px] font-bold border-b border-white/10 pb-1.5">
            <button
              type="button"
              onClick={() => setIsRad(!isRad)}
              className={`px-1.5 py-0.5 rounded text-[9px] border transition-colors ${
                isRad
                  ? "bg-violet-500/20 text-violet-300 border-violet-400/40"
                  : "bg-cyan-500/20 text-cyan-300 border-cyan-400/40"
              }`}
            >
              {isRad ? "RAD" : "DEG"}
            </button>

            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
              <MiniSciBtn onClick={() => applyInstantFunc("sin")}>sin</MiniSciBtn>
              <MiniSciBtn onClick={() => applyInstantFunc("cos")}>cos</MiniSciBtn>
              <MiniSciBtn onClick={() => applyInstantFunc("tan")}>tan</MiniSciBtn>
              <MiniSciBtn onClick={() => applyInstantFunc("ln")}>ln</MiniSciBtn>
              <MiniSciBtn onClick={() => applyInstantFunc("log10")}>log</MiniSciBtn>
              <MiniSciBtn onClick={() => applyInstantFunc("pi")}>π</MiniSciBtn>
              <MiniSciBtn onClick={() => applyInstantFunc("e")}>e</MiniSciBtn>
            </div>
          </div>
        )}

        {/* Main Grid: 4 columns for compact/mini, 5 columns for sci */}
        {isSci ? (
          <div className="grid grid-cols-5 gap-1 text-xs font-semibold select-none">
            <SciBtn onClick={() => applyInstantFunc("sqrt")}>√x</SciBtn>
            <ActionBtn onClick={clearAll} tone="danger">AC</ActionBtn>
            <ActionBtn onClick={backspace} tone="warning"><Delete className="w-3 h-3 mx-auto" /></ActionBtn>
            <SciBtn onClick={() => appendToken("(")}>(</SciBtn>
            <SciBtn onClick={() => appendToken(")")}>)</SciBtn>

            <SciBtn onClick={() => applyInstantFunc("sqr")}>x²</SciBtn>
            <NumBtn onClick={() => appendDigit("7")}>7</NumBtn>
            <NumBtn onClick={() => appendDigit("8")}>8</NumBtn>
            <NumBtn onClick={() => appendDigit("9")}>9</NumBtn>
            <OpBtn onClick={() => appendOp("÷")}>÷</OpBtn>

            <SciBtn onClick={() => appendOp("^")}>xʸ</SciBtn>
            <NumBtn onClick={() => appendDigit("4")}>4</NumBtn>
            <NumBtn onClick={() => appendDigit("5")}>5</NumBtn>
            <NumBtn onClick={() => appendDigit("6")}>6</NumBtn>
            <OpBtn onClick={() => appendOp("×")}>×</OpBtn>

            <SciBtn onClick={() => applyInstantFunc("inv")}>1/x</SciBtn>
            <NumBtn onClick={() => appendDigit("1")}>1</NumBtn>
            <NumBtn onClick={() => appendDigit("2")}>2</NumBtn>
            <NumBtn onClick={() => appendDigit("3")}>3</NumBtn>
            <OpBtn onClick={() => appendOp("−")}>−</OpBtn>

            <SciBtn onClick={() => applyInstantFunc("fact")}>n!</SciBtn>
            <NumBtn onClick={toggleSign}>±</NumBtn>
            <NumBtn onClick={() => appendDigit("0")}>0</NumBtn>
            <NumBtn onClick={appendDot}>.</NumBtn>
            <OpBtn onClick={() => appendOp("+")}>+</OpBtn>

            <div className="col-span-5 pt-0.5">
              <EqualBtn onClick={calculate}>=</EqualBtn>
            </div>
          </div>
        ) : isMini ? (
          /* Mini 4-column layout */
          <div className="grid grid-cols-4 gap-1 text-[11px] font-semibold select-none">
            <ActionBtn onClick={clearAll} tone="danger" compact>AC</ActionBtn>
            <ActionBtn onClick={backspace} tone="warning" compact><Delete className="w-2.5 h-2.5 mx-auto" /></ActionBtn>
            <SciBtn onClick={() => applyInstantFunc("sqrt")} compact>√x</SciBtn>
            <OpBtn onClick={() => appendOp("÷")} compact>÷</OpBtn>

            <NumBtn onClick={() => appendDigit("7")} compact>7</NumBtn>
            <NumBtn onClick={() => appendDigit("8")} compact>8</NumBtn>
            <NumBtn onClick={() => appendDigit("9")} compact>9</NumBtn>
            <OpBtn onClick={() => appendOp("×")} compact>×</OpBtn>

            <NumBtn onClick={() => appendDigit("4")} compact>4</NumBtn>
            <NumBtn onClick={() => appendDigit("5")} compact>5</NumBtn>
            <NumBtn onClick={() => appendDigit("6")} compact>6</NumBtn>
            <OpBtn onClick={() => appendOp("−")} compact>−</OpBtn>

            <NumBtn onClick={() => appendDigit("1")} compact>1</NumBtn>
            <NumBtn onClick={() => appendDigit("2")} compact>2</NumBtn>
            <NumBtn onClick={() => appendDigit("3")} compact>3</NumBtn>
            <OpBtn onClick={() => appendOp("+")} compact>+</OpBtn>

            <NumBtn onClick={toggleSign} compact>±</NumBtn>
            <NumBtn onClick={() => appendDigit("0")} compact>0</NumBtn>
            <NumBtn onClick={appendDot} compact>.</NumBtn>
            <EqualBtn onClick={calculate} compact>=</EqualBtn>
          </div>
        ) : (
          /* Standard 4-column layout */
          <div className="grid grid-cols-4 gap-1.5 text-xs font-semibold select-none">
            <ActionBtn onClick={clearAll} tone="danger">AC</ActionBtn>
            <ActionBtn onClick={backspace} tone="warning"><Delete className="w-3 h-3 mx-auto" /></ActionBtn>
            <SciBtn onClick={() => applyInstantFunc("sqrt")}>√x</SciBtn>
            <OpBtn onClick={() => appendOp("÷")}>÷</OpBtn>

            <NumBtn onClick={() => appendDigit("7")}>7</NumBtn>
            <NumBtn onClick={() => appendDigit("8")}>8</NumBtn>
            <NumBtn onClick={() => appendDigit("9")}>9</NumBtn>
            <OpBtn onClick={() => appendOp("×")}>×</OpBtn>

            <NumBtn onClick={() => appendDigit("4")}>4</NumBtn>
            <NumBtn onClick={() => appendDigit("5")}>5</NumBtn>
            <NumBtn onClick={() => appendDigit("6")}>6</NumBtn>
            <OpBtn onClick={() => appendOp("−")}>−</OpBtn>

            <NumBtn onClick={() => appendDigit("1")}>1</NumBtn>
            <NumBtn onClick={() => appendDigit("2")}>2</NumBtn>
            <NumBtn onClick={() => appendDigit("3")}>3</NumBtn>
            <OpBtn onClick={() => appendOp("+")}>+</OpBtn>

            <NumBtn onClick={toggleSign}>±</NumBtn>
            <NumBtn onClick={() => appendDigit("0")}>0</NumBtn>
            <NumBtn onClick={appendDot}>.</NumBtn>
            <EqualBtn onClick={calculate}>=</EqualBtn>
          </div>
        )}
      </div>

      {/* Interactive Drag-to-Resize Handle at Bottom Right */}
      <div
        onTouchStart={onTouchStartResize}
        onMouseDown={onMouseDownResize}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 opacity-60 hover:opacity-100 transition-opacity"
        title="Drag corner to freely resize width"
      >
        <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 fill-cyan-400/80">
          <circle cx="8" cy="8" r="1.2" />
          <circle cx="4" cy="8" r="1.2" />
          <circle cx="8" cy="4" r="1.2" />
        </svg>
      </div>
    </div>
  );
}

function NumBtn({
  children,
  onClick,
  compact = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border border-white/10 bg-white/[0.05] hover:bg-white/[0.12] active:bg-white/[0.18] text-white font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center ${
        compact ? "py-1.5 text-[11px]" : "py-2 text-xs"
      }`}
    >
      {children}
    </button>
  );
}

function OpBtn({
  children,
  onClick,
  compact = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border border-amber-400/35 bg-amber-500/15 hover:bg-amber-500/25 active:bg-amber-500/35 text-amber-200 font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center ${
        compact ? "py-1.5 text-[11px]" : "py-2 text-xs"
      }`}
    >
      {children}
    </button>
  );
}

function SciBtn({
  children,
  onClick,
  compact = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/20 active:bg-cyan-500/30 text-cyan-200 font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center ${
        compact ? "py-1.5 text-[10px]" : "py-2 text-[11px]"
      }`}
    >
      {children}
    </button>
  );
}

function MiniSciBtn({
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
      className="px-2 py-0.5 rounded border border-cyan-400/25 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 text-[9px] font-bold transition-colors cursor-pointer shrink-0"
    >
      {children}
    </button>
  );
}

function ActionBtn({
  children,
  onClick,
  tone,
  compact = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone: "danger" | "warning";
  compact?: boolean;
}) {
  const cls =
    tone === "danger"
      ? "border-rose-400/40 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25 active:bg-rose-500/35"
      : "border-orange-400/40 bg-orange-500/15 text-orange-200 hover:bg-orange-500/25 active:bg-orange-500/35";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center ${cls} ${
        compact ? "py-1.5 text-[10px]" : "py-2 text-xs"
      }`}
    >
      {children}
    </button>
  );
}

function EqualBtn({
  children,
  onClick,
  compact = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black shadow-md shadow-cyan-900/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
        compact ? "py-1.5 text-xs" : "py-2 text-sm"
      }`}
    >
      {children}
    </button>
  );
}
