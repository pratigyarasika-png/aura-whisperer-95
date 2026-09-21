import { Camera, Check, Copy, FileImage, Loader2, PenTool, ScanLine, Sigma, X } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

type Props = { onClose: () => void };

const SCAN_PROMPT =
  "Read the mathematical equation in this image. Return: 1) the equation in LaTeX between $$ delimiters, 2) a concise step-by-step solution, and 3) the final answer. Preserve symbols exactly. If the image has no readable equation, say so clearly.";

export function EquationScanner({ onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scan = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Pilih gambar persamaan berformat PNG, JPG, atau WEBP.");
      return;
    }
    setPreview(URL.createObjectURL(file));
    setBusy(true);
    setResult("");
    setError(null);
    const body = new FormData();
    body.append("file", file);
    body.append("question", SCAN_PROMPT);
    try {
      const response = await fetch("/api/analyze", { method: "POST", body });
      if (!response.ok) throw new Error((await response.text().catch(() => "")) || "Persamaan tidak dapat dibaca.");
      const data = (await response.json()) as { analysis?: string };
      const text = data.analysis?.trim() ?? "";
      if (!text) throw new Error("Persamaan tidak dapat dibaca dari gambar ini.");
      setResult(text);
      window.localStorage.setItem("infinity-equation-scan", text);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Pemindaian persamaan gagal.");
    } finally {
      setBusy(false);
    }
  };

  const choose = (file?: File) => {
    if (file) void scan(file);
  };

  const copyResult = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="rise-in mt-6 w-full max-w-4xl rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6" aria-label="Equation scanner">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-teal-soft text-teal-ink">
          <Sigma className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-semibold">Equation Scanner</h3>
          <p className="text-xs text-muted-foreground">Foto atau unggah persamaan untuk mendapatkan LaTeX dan langkah penyelesaian.</p>
        </div>
        <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={onClose} aria-label="Tutup pemindai persamaan">
          <X className="size-4" />
        </Button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="overflow-hidden rounded-lg border border-dashed border-border bg-mint/40 p-3">
          {preview ? (
            <img src={preview} alt="Pratinjau persamaan" className="aspect-[4/3] w-full rounded-md object-contain" />
          ) : (
            <div className="grid aspect-[4/3] place-items-center text-center">
              <div>
                <ScanLine className="mx-auto size-8 text-teal-ink" />
                <p className="mt-2 text-xs font-semibold">Arahkan kamera ke satu persamaan</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Pastikan gambar terang, lurus, dan tidak buram.</p>
              </div>
            </div>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="outline" className="rounded-full text-xs" onClick={() => cameraRef.current?.click()} disabled={busy}>
              <Camera /> Kamera
            </Button>
            <Button variant="outline" className="rounded-full text-xs" onClick={() => inputRef.current?.click()} disabled={busy}>
              <FileImage /> Unggah
            </Button>
          </div>
          <input ref={cameraRef} className="hidden" type="file" accept="image/*" capture="environment" onChange={(event) => choose(event.target.files?.[0])} />
          <input ref={inputRef} className="hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => choose(event.target.files?.[0])} />
        </div>

        <div className="min-h-52 rounded-lg border border-border bg-background p-4">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase text-muted-foreground">
            <Sigma className="size-3.5" /> Hasil dan penyelesaian
          </p>
          {busy && <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Membaca simbol dan menyusun langkah…</p>}
          {error && <p className="mt-5 text-xs text-destructive">{error}</p>}
          {!busy && !error && !result && <p className="mt-5 text-xs leading-6 text-muted-foreground">Hasil LaTeX dan penjelasan langkah demi langkah akan tampil di sini.</p>}
          {result && <div className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-sm leading-6">{result}</div>}
          {result && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => void copyResult()}>
                {copied ? <Check /> : <Copy />} {copied ? "Tersalin" : "Salin hasil"}
              </Button>
              <Button asChild size="sm" className="rounded-full bg-teal-deep text-teal-deep-foreground hover:bg-teal-deep/90">
                <Link to="/write"><PenTool /> Buka ruang penulisan</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}