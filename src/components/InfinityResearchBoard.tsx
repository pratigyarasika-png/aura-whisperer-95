import {
  Activity,
  BookOpen,
  Calculator,
  Check,
  ChevronDown,
  CircleStop,
  Cloud,
  FileCheck,
  FileImage,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Image,
  MessageSquare,
  Mic,
  Network,
  PenTool,
  Plus,
  Presentation,
  RefreshCw,
  ScanText,
  Search,
  Send,
  Sparkles,
  Table,
  Terminal,
  Video,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { VoiceInput } from "@/components/VoiceInput";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  answer: string;
  answering: boolean;
  error: string | null;
  onAsk: (prompt: string, steering?: string) => void;
  onStop: () => void;
};

type Module = {
  label: string;
  chip: string;
  description: string;
  icon: typeof Search;
};

const moduleGroups: Array<{ category: string; modules: Module[] }> = [
  {
    category: "Riset & Analisis Literatur",
    modules: [
      { label: "Ulas Literatur", chip: "Ulas Literatur", description: "Analisis dan sintesis otomatis antar-makalah.", icon: BookOpen },
      { label: "Cari Makalah Akademis", chip: "Cari Makalah", description: "Pencarian jurnal ilmiah dan naskah riset.", icon: Search },
      { label: "Tinjauan Sistematis", chip: "Tinjauan Sistematis", description: "Ekstraksi tabel pembanding matriks riset.", icon: FileCheck },
      { label: "Peta Konsep", chip: "Peta Konsep", description: "Grafik keterkaitan antar-studi dan sitasi.", icon: Network },
    ],
  },
  {
    category: "Pembaca & Pemroses Dokumen",
    modules: [
      { label: "Ringkasan PDF", chip: "Ringkasan PDF", description: "Rangkuman poin penting dokumen panjang.", icon: FileText },
      { label: "Chat PDF", chip: "Chat PDF", description: "Tanya-jawab berdasarkan isi berkas.", icon: MessageSquare },
      { label: "Ekstrak Tabel", chip: "Ekstrak Tabel", description: "Tarik data numerik ke CSV atau Excel.", icon: Table },
      { label: "OCR Gambar", chip: "OCR Gambar", description: "Ekstrak teks dari foto atau cetakan.", icon: ScanText },
    ],
  },
  {
    category: "Penulisan, Matematika & Data",
    modules: [
      { label: "Tulis Draf Riset", chip: "Tulis Draf", description: "Buat bab, abstrak, dan esai akademik.", icon: PenTool },
      { label: "Parafrase", chip: "Parafrase", description: "Selaraskan gaya bahasa akademis.", icon: RefreshCw },
      { label: "Equation", chip: "Equation", description: "Solver matematika dan keypad virtual.", icon: Calculator },
      { label: "Olah Data & Koding", chip: "Olah Data", description: "Analisis Python dan statistik di browser.", icon: Terminal },
    ],
  },
];

const progressSteps = [
  "Memahami tujuan dan konteks pertanyaan…",
  "Mencari 20+ jurnal terindeks…",
  "Mengekstrak data dan argumen utama…",
  "Menyusun sintesis riset…",
];

const mathKeys = [
  { label: "x²", value: "^{2}" },
  { label: "xⁿ", value: "^{}" },
  { label: "√", value: "\\sqrt{}" },
  { label: "a⁄b", value: "\\frac{}{}" },
  { label: "∑", value: "\\sum_{}^{}" },
  { label: "∫", value: "\\int_{}^{}" },
  { label: "π", value: "\\pi" },
  { label: "θ", value: "\\theta" },
  { label: "∞", value: "\\infty" },
  { label: "≤", value: "\\leq" },
  { label: "≥", value: "\\geq" },
  { label: "≠", value: "\\neq" },
  { label: "( )", value: "()" },
  { label: "[ ]", value: "[]" },
  { label: "|x|", value: "\\lvert x \\rvert" },
  { label: "Matrix", value: "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}" },
];

export function InfinityResearchBoard({ answer, answering, error, onAsk, onStop }: Props) {
  const [query, setQuery] = useState("");
  const [context, setContext] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [attachment, setAttachment] = useState<string | null>(null);
  const [activityOpen, setActivityOpen] = useState(false);
  const [steering, setSteering] = useState("");
  const [step, setStep] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const documentRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("infinity-canvas-draft");
    if (saved) setQuery(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("infinity-canvas-draft", query);
  }, [query]);

  useEffect(() => {
    if (!answering) return;
    setActivityOpen(true);
    setStep(0);
    const timer = window.setInterval(() => setStep((value) => Math.min(value + 1, progressSteps.length - 1)), 1400);
    return () => window.clearInterval(timer);
  }, [answering]);

  const focusInput = () => {
    setExpanded(true);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const activateModule = (module: Module) => {
    setContext(module.chip);
    setExpanded(true);
    setAttachmentOpen(false);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const attach = (file?: File) => {
    if (!file) return;
    setAttachment(file.name);
    setAttachmentOpen(false);
    setExpanded(true);
  };

  const submit = () => {
    const prompt = query.trim();
    if (!prompt && !attachment) return;
    const composed = `${context ? `[${context}] ` : ""}${prompt}${attachment ? `\nLampiran: ${attachment}` : ""}`.trim();
    onAsk(composed);
  };

  const applySteering = () => {
    if (!steering.trim()) return;
    const prompt = `${context ? `[${context}] ` : ""}${query.trim()}`.trim();
    onAsk(prompt, steering.trim());
    setSteering("");
  };

  const addMath = (value: string) => {
    setQuery((current) => `${current}${current && !current.endsWith(" ") ? " " : ""}${value}`);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <section className="mx-auto w-full max-w-6xl pb-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase text-primary-ink">Infinity Canvas</p>
        <h2 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">Riset lebih dalam. Berpikir lebih jernih.</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Satu ruang kerja untuk menelusuri literatur, memahami dokumen, menulis, dan menganalisis data.</p>
      </div>

      <div className="mx-auto mt-8 max-w-4xl">
        <form
          className={cn(
            "research-pill relative rounded-[2rem] border bg-card shadow-lg transition-all duration-300",
            expanded ? "border-primary/50 shadow-xl" : "border-border",
          )}
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="flex items-end gap-2 p-2.5 sm:p-3">
            <div className="relative">
              <Button type="button" variant="ghost" size="icon" className="size-10 rounded-full" onClick={() => setAttachmentOpen((value) => !value)} aria-label="Tambahkan lampiran" aria-expanded={attachmentOpen}>
                <Plus />
              </Button>
              {attachmentOpen && (
                <div className="absolute left-0 top-12 z-30 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-border bg-popover p-2 shadow-xl">
                  <p className="px-3 py-2 text-[11px] font-semibold uppercase text-muted-foreground">Impor berkas</p>
                  <AttachmentAction icon={Image} label="Foto / Gambar" detail="OCR dan analisis visual" onClick={() => imageRef.current?.click()} />
                  <AttachmentAction icon={FileText} label="Dokumen" detail="PDF, DOCX, CSV, PPTX" onClick={() => documentRef.current?.click()} />
                  <AttachmentAction icon={Video} label="Video" detail="Ekstraksi audio dan subteks" onClick={() => videoRef.current?.click()} />
                  <div className="my-2 border-t border-border" />
                  <p className="px-3 py-2 text-[11px] font-semibold uppercase text-muted-foreground">Google Workspace</p>
                  <WorkspaceLink icon={FileText} label="Google Docs" href="https://docs.google.com/document/" />
                  <WorkspaceLink icon={FileSpreadsheet} label="Google Sheets" href="https://docs.google.com/spreadsheets/" />
                  <WorkspaceLink icon={Presentation} label="Google Slides" href="https://docs.google.com/presentation/" />
                  <WorkspaceLink icon={Cloud} label="Google Drive" href="https://drive.google.com/" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1" onClick={focusInput}>
              {(context || attachment) && (
                <div className="mb-2 flex flex-wrap gap-1.5 px-1">
                  {context && <ActiveChip label={context} onRemove={() => setContext(null)} />}
                  {attachment && <ActiveChip label={attachment} onRemove={() => setAttachment(null)} icon={FolderOpen} />}
                </div>
              )}
              <textarea
                ref={inputRef}
                value={query}
                onFocus={() => setExpanded(true)}
                onChange={(event) => setQuery(event.target.value)}
                rows={expanded ? 3 : 1}
                placeholder="Tanyakan apa saja pada Infinity, analisis dokumen ilmiah, atau ketik perintah..."
                className="block max-h-40 min-h-10 w-full resize-none bg-transparent px-1 py-2 text-sm leading-6 outline-none placeholder:text-muted-foreground sm:text-base"
                aria-label="Tanyakan pada Infinity"
              />
            </div>

            <VoiceInput label="Pencarian suara" onText={(text) => setQuery((value) => (value ? `${value} ${text}` : text))} />
            <Button type="button" variant="ghost" size="icon" className="size-10 rounded-full" onClick={focusInput} aria-label="Fokuskan pencarian"><Search /></Button>
            {answering ? (
              <Button type="button" size="icon" className="size-10 rounded-full bg-teal-deep text-teal-deep-foreground hover:bg-teal-deep/90" onClick={onStop} aria-label="Hentikan"><CircleStop /></Button>
            ) : (
              <Button type="submit" size="icon" className="size-10 rounded-full bg-teal-deep text-teal-deep-foreground hover:bg-teal-deep/90" disabled={!query.trim() && !attachment} aria-label="Kirim ke Infinity"><Send /></Button>
            )}
          </div>

          {expanded && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-ink"><Sparkles className="size-3.5" /> AI Umum aktif</span>
              <Button type="button" variant="ghost" size="sm" className="h-8 rounded-full text-xs" onClick={() => setActivityOpen((value) => !value)}><Activity /> Aktivitas Langsung <ChevronDown className={cn("transition-transform", activityOpen && "rotate-180")} /></Button>
            </div>
          )}
        </form>

        <input ref={imageRef} className="hidden" type="file" accept="image/*" onChange={(event) => attach(event.target.files?.[0])} />
        <input ref={documentRef} className="hidden" type="file" accept=".pdf,.doc,.docx,.csv,.xls,.xlsx,.ppt,.pptx" onChange={(event) => attach(event.target.files?.[0])} />
        <input ref={videoRef} className="hidden" type="file" accept="video/*,audio/*" onChange={(event) => attach(event.target.files?.[0])} />

        {context === "Equation" && (
          <div className="rise-in mt-3 rounded-lg border border-border bg-card p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><Calculator className="size-4 text-teal-ink" /><span className="text-sm font-semibold">Virtual Math Keypad</span></div>
              <span className="text-[11px] text-muted-foreground">Masukkan simbol langsung ke prompt</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
              {mathKeys.map((key) => <Button key={key.label} type="button" variant="outline" className="h-10 rounded-md font-mono text-xs" onClick={() => addMath(key.value)}>{key.label}</Button>)}
            </div>
          </div>
        )}

        {(activityOpen || answering || answer || error) && (
          <div className="rise-in mt-4 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-full bg-mint text-teal-ink"><Zap className="size-4" /></span><div><p className="text-sm font-semibold">Aktivitas Langsung</p><p className="text-[11px] text-muted-foreground">Lihat proses dan arahkan hasil kapan saja</p></div></div>
              <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={() => setActivityOpen(false)} aria-label="Tutup aktivitas"><X /></Button>
            </div>
            <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div className="space-y-2">
                {progressSteps.map((label, index) => {
                  const complete = !answering && Boolean(answer) ? true : index < step;
                  const active = answering && index === step;
                  return <div key={label} className={cn("flex items-start gap-2.5 rounded-md px-2 py-2 text-xs", active && "bg-mint/70 text-teal-ink")}><span className={cn("mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border", complete && "border-teal-deep bg-teal-deep text-teal-deep-foreground", active && "border-primary animate-pulse")}>{complete && <Check className="size-2.5" />}</span><span>{label}</span></div>;
                })}
              </div>
              <div>
                <div className="min-h-32 rounded-md border border-border bg-background p-3">
                  {error ? <p className="text-sm text-destructive">{error}</p> : answer ? <p className="whitespace-pre-wrap text-sm leading-6">{answer}{answering && <span className="animate-pulse"> ▍</span>}</p> : <p className="text-sm leading-6 text-muted-foreground">Hasil Infinity akan tampil di sini setelah Anda mengirim pertanyaan.</p>}
                </div>
                <div className="mt-3 flex gap-2">
                  <input value={steering} onChange={(event) => setSteering(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") applySteering(); }} placeholder="Fokuskan pada metodologi…" className="min-w-0 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring" aria-label="Instruksi revisi langsung" />
                  <Button type="button" className="rounded-full bg-teal-deep text-teal-deep-foreground hover:bg-teal-deep/90" disabled={!steering.trim() || (!query.trim() && !answer)} onClick={applySteering}><Zap /> Terapkan</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-12">
        <div className="mb-6 text-center"><p className="text-xs font-semibold uppercase text-primary-ink">12 modul utama</p><h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Mulai dari alur kerja yang Anda butuhkan</h3></div>
        <div className="space-y-7">
          {moduleGroups.map((group) => (
            <div key={group.category}>
              <div className="mb-3 flex items-center gap-3"><h4 className="text-sm font-semibold">{group.category}</h4><span className="h-px flex-1 bg-border" /></div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {group.modules.map((module) => {
                  const Icon = module.icon;
                  const selected = context === module.chip;
                  return <Button key={module.label} type="button" variant="outline" className={cn("h-auto min-h-28 items-start justify-start whitespace-normal rounded-lg bg-card p-4 text-left shadow-none transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-card", selected && "border-primary ring-2 ring-primary/15")} onClick={() => activateModule(module)}><span className="grid size-9 shrink-0 place-items-center rounded-full bg-mint text-teal-ink"><Icon className="size-4" /></span><span className="min-w-0"><span className="block text-sm font-semibold">{module.label}</span><span className="mt-1 block text-xs font-normal leading-5 text-muted-foreground">{module.description}</span></span></Button>;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AttachmentAction({ icon: Icon, label, detail, onClick }: { icon: typeof Image; label: string; detail: string; onClick: () => void }) {
  return <Button type="button" variant="ghost" className="h-auto w-full justify-start gap-3 rounded-md px-3 py-2 text-left" onClick={onClick}><Icon className="size-4 text-teal-ink" /><span><span className="block text-xs font-semibold">{label}</span><span className="block text-[10px] font-normal text-muted-foreground">{detail}</span></span></Button>;
}

function WorkspaceLink({ icon: Icon, label, href }: { icon: typeof FileText; label: string; href: string }) {
  return <Button asChild variant="ghost" className="h-9 w-full justify-start gap-3 rounded-md px-3 text-xs"><a href={href} target="_blank" rel="noreferrer"><Icon className="size-4 text-teal-ink" />{label}</a></Button>;
}

function ActiveChip({ label, onRemove, icon: Icon = Sparkles }: { label: string; onRemove: () => void; icon?: typeof Sparkles }) {
  return <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-teal-ink"><Icon className="size-3" /><span className="truncate">{label}</span><button type="button" onClick={(event) => { event.stopPropagation(); onRemove(); }} className="rounded-full" aria-label={`Hapus ${label}`}><X className="size-3" /></button></span>;
}