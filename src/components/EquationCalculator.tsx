import { ArrowRight, Camera, Delete, Equal, RotateCcw, Sigma } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type Token = { type: "number" | "name" | "operator" | "paren"; value: string };

const keypad = [
  ["7", "8", "9", "÷", "√"],
  ["4", "5", "6", "×", "^"],
  ["1", "2", "3", "+", "−"],
  ["0", ".", "(", ")", "="],
] as const;

const scientificKeys = ["π", "x", "sin(", "cos(", "tan(", "log(", "ln(", "abs("];

function tokenize(source: string): Token[] {
  const normalized = source.replaceAll("×", "*").replaceAll("÷", "/").replaceAll("−", "-").replaceAll("π", "pi").replaceAll("√", "sqrt");
  const tokens: Token[] = [];
  let index = 0;
  while (index < normalized.length) {
    const char = normalized[index];
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }
    if (/[0-9.]/.test(char)) {
      let value = "";
      while (index < normalized.length && /[0-9.]/.test(normalized[index])) value += normalized[index++];
      if (!/^\d*\.?\d+$/.test(value)) throw new Error("Format angka tidak valid.");
      tokens.push({ type: "number", value });
      continue;
    }
    if (/[a-zA-Z]/.test(char)) {
      let value = "";
      while (index < normalized.length && /[a-zA-Z]/.test(normalized[index])) value += normalized[index++];
      tokens.push({ type: "name", value: value.toLowerCase() });
      continue;
    }
    if ("+-*/^=".includes(char)) {
      tokens.push({ type: "operator", value: char });
      index += 1;
      continue;
    }
    if ("()".includes(char)) {
      tokens.push({ type: "paren", value: char });
      index += 1;
      continue;
    }
    throw new Error(`Simbol “${char}” belum didukung.`);
  }
  return tokens;
}

function evaluateExpression(source: string, xValue?: number): number {
  const tokens = tokenize(source);
  let cursor = 0;

  const parseExpression = (): number => {
    let value = parseTerm();
    while (tokens[cursor]?.value === "+" || tokens[cursor]?.value === "-") {
      const operator = tokens[cursor++].value;
      const right = parseTerm();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  };

  const parseTerm = (): number => {
    let value = parsePower();
    while (tokens[cursor]?.value === "*" || tokens[cursor]?.value === "/") {
      const operator = tokens[cursor++].value;
      const right = parsePower();
      if (operator === "/" && right === 0) throw new Error("Tidak dapat membagi dengan nol.");
      value = operator === "*" ? value * right : value / right;
    }
    return value;
  };

  const parsePower = (): number => {
    let value = parseUnary();
    if (tokens[cursor]?.value === "^") {
      cursor += 1;
      value **= parsePower();
    }
    return value;
  };

  const parseUnary = (): number => {
    if (tokens[cursor]?.value === "+") {
      cursor += 1;
      return parseUnary();
    }
    if (tokens[cursor]?.value === "-") {
      cursor += 1;
      return -parseUnary();
    }
    return parsePrimary();
  };

  const parsePrimary = (): number => {
    const token = tokens[cursor++];
    if (!token) throw new Error("Persamaan belum lengkap.");
    if (token.type === "number") return Number(token.value);
    if (token.value === "(") {
      const value = parseExpression();
      if (tokens[cursor++]?.value !== ")") throw new Error("Tanda kurung belum ditutup.");
      return value;
    }
    if (token.type === "name") {
      if (token.value === "pi") return Math.PI;
      if (token.value === "e") return Math.E;
      if (token.value === "x") {
        if (xValue === undefined) throw new Error("Tambahkan tanda = untuk menyelesaikan nilai x.");
        return xValue;
      }
      const functions: Record<string, (value: number) => number> = {
        sqrt: Math.sqrt,
        sin: (value) => Math.sin((value * Math.PI) / 180),
        cos: (value) => Math.cos((value * Math.PI) / 180),
        tan: (value) => Math.tan((value * Math.PI) / 180),
        log: Math.log10,
        ln: Math.log,
        abs: Math.abs,
      };
      const operation = functions[token.value];
      if (!operation || tokens[cursor++]?.value !== "(") throw new Error(`Fungsi “${token.value}” tidak dikenali.`);
      const value = parseExpression();
      if (tokens[cursor++]?.value !== ")") throw new Error("Tanda kurung fungsi belum ditutup.");
      return operation(value);
    }
    throw new Error("Periksa kembali susunan persamaan.");
  };

  const result = parseExpression();
  if (cursor !== tokens.length) throw new Error("Ada bagian persamaan yang belum dapat dibaca.");
  if (!Number.isFinite(result)) throw new Error("Hasil berada di luar rentang perhitungan.");
  return result;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : Number(value.toFixed(8)).toString();
}

function solve(source: string) {
  const equalsIndex = source.indexOf("=");
  if (equalsIndex === -1) {
    const value = evaluateExpression(source);
    return { result: formatNumber(value), steps: ["Baca urutan operasi", "Hitung pangkat dan fungsi", "Selesaikan perkalian, pembagian, penjumlahan, lalu pengurangan"] };
  }
  if (source.indexOf("=", equalsIndex + 1) !== -1) throw new Error("Gunakan satu tanda sama dengan.");
  const left = source.slice(0, equalsIndex);
  const right = source.slice(equalsIndex + 1);
  if (!left.trim() || !right.trim()) throw new Error("Lengkapi kedua sisi persamaan.");
  if (!source.toLowerCase().includes("x")) {
    const leftValue = evaluateExpression(left);
    const rightValue = evaluateExpression(right);
    return {
      result: Math.abs(leftValue - rightValue) < 1e-9 ? "Benar" : "Tidak sama",
      steps: [`Sisi kiri = ${formatNumber(leftValue)}`, `Sisi kanan = ${formatNumber(rightValue)}`, "Bandingkan kedua hasil"],
    };
  }
  const difference = (x: number) => evaluateExpression(left, x) - evaluateExpression(right, x);
  const constant = difference(0);
  const coefficient = difference(1) - constant;
  const linearCheck = difference(2);
  if (Math.abs(linearCheck - (constant + coefficient * 2)) > 1e-7) throw new Error("Saat ini penyelesaian x mendukung persamaan linear.");
  if (Math.abs(coefficient) < 1e-12) throw new Error(Math.abs(constant) < 1e-12 ? "Semua nilai x memenuhi persamaan." : "Persamaan tidak memiliki solusi.");
  const x = -constant / coefficient;
  return {
    result: `x = ${formatNumber(x)}`,
    steps: [`Satukan semua suku ke satu sisi`, `Bentuk linear: ${formatNumber(coefficient)}x ${constant < 0 ? "−" : "+"} ${formatNumber(Math.abs(constant))} = 0`, `Bagi kedua sisi dengan ${formatNumber(coefficient)}`],
  };
}

export function EquationCalculator({ onUse }: { onUse: (expression: string) => void }) {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const append = (value: string) => setExpression((current) => `${current}${value}`);

  const calculate = () => {
    setError(null);
    setResult(null);
    setSteps([]);
    try {
      const solved = solve(expression.trim());
      setResult(solved.result);
      setSteps(solved.steps);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Persamaan belum dapat dihitung.");
    }
  };

  return (
    <section className="rise-in mt-5 overflow-hidden rounded-lg border border-border bg-card shadow-sm" aria-label="Kalkulator Equation">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-mint/60 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-teal-soft text-teal-ink"><Sigma className="size-4" /></span>
          <div><h3 className="text-sm font-semibold">Equation</h3><p className="text-[11px] text-muted-foreground">Kalkulator ilmiah dengan langkah penyelesaian</p></div>
        </div>
        <Button type="button" variant="outline" size="sm" className="rounded-full bg-card" title="Pindai persamaan dari foto"><Camera /> Pindai foto</Button>
      </div>
      <div className="grid gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.7fr)]">
        <div>
          <div className="rounded-lg border border-input bg-background p-3 focus-within:ring-2 focus-within:ring-ring">
            <input
              value={expression}
              onChange={(event) => setExpression(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && calculate()}
              placeholder="Contoh: 2*x + 3 = 11 atau √(144) + 5^2"
              className="h-11 w-full bg-transparent font-mono text-base outline-none placeholder:text-muted-foreground"
              aria-label="Masukkan persamaan"
            />
            <div className="flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground">
              <span className="truncate font-mono">{expression || "Pratinjau persamaan"}</span>
              <div className="flex shrink-0 gap-1">
                <Button type="button" variant="ghost" size="icon" className="size-8 rounded-full" onClick={() => setExpression((value) => value.slice(0, -1))} aria-label="Hapus karakter"><Delete /></Button>
                <Button type="button" variant="ghost" size="icon" className="size-8 rounded-full" onClick={() => { setExpression(""); setResult(null); setSteps([]); setError(null); }} aria-label="Bersihkan"><RotateCcw /></Button>
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {keypad.flat().map((key) => (
              <Button key={key} type="button" variant={key === "=" ? "default" : "outline"} className="h-11 rounded-md font-mono text-base" onClick={() => key === "=" ? calculate() : append(key)}>{key === "=" ? <Equal /> : key}</Button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {scientificKeys.map((key) => <Button key={key} type="button" variant="secondary" size="sm" className="rounded-full font-mono" onClick={() => append(key)}>{key}</Button>)}
          </div>
        </div>
        <div className="min-h-64 rounded-lg border border-border bg-background p-4">
          <p className="text-[11px] font-semibold uppercase text-muted-foreground">Hasil & langkah</p>
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          {!result && !error && <p className="mt-4 text-sm leading-6 text-muted-foreground">Masukkan perhitungan atau persamaan linear untuk melihat hasil dan urutan penyelesaiannya.</p>}
          {result && (
            <div className="mt-4">
              <p className="font-display text-3xl font-semibold text-teal-ink">{result}</p>
              <ol className="mt-5 space-y-3">
                {steps.map((step, index) => <li key={step} className="flex gap-3 text-xs leading-5"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-mint font-semibold text-teal-ink">{index + 1}</span><span>{step}</span></li>)}
              </ol>
              <Button type="button" variant="outline" className="mt-5 w-full rounded-full" onClick={() => onUse(expression)}><ArrowRight /> Gunakan di Ask Infinity</Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}