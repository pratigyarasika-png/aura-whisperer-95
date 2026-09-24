import {
  Activity,
  BarChart3,
  BookOpen,
  Calculator,
  Camera,
  Check,
  ChevronDown,
  CircleStop,
  CloudUpload,
  Code2,
  Database,
  FileCheck,
  FileImage,
  FileText,
  Image as ImageIcon,
  LayoutTemplate,
  LineChart,
  MessageSquare,
  Network,
  PenTool,
  Plus,
  Quote,
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
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { EquationCalculator } from "@/components/EquationCalculator";
import { VoiceInput } from "@/components/VoiceInput";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  answer: string;
  answering: boolean;
  error: string | null;
  mode: "general" | "academic";
  onModeChange: (mode: "general" | "academic") => void;
  onAsk: (prompt: string, steering?: string) => void;
  onStop: () => void;
};

type Feature = { label: string; description: string; icon: LucideIcon };

const featureGroups: Array<{ category: string; description: string; features: Feature[] }> = [
  {
    category: "RISET",
    description: "Temukan dan hubungkan bukti ilmiah",
    features: [
      { label: "Ulas Literatur", description: "Sintesis studi terpilih", icon: BookOpen },
      { label: "Cari Makalah", description: "Jurnal dan naskah riset", icon: Search },
      { label: "Tinjauan Sistematis", description: "Matriks bukti terstruktur", icon: FileCheck },
      { label: "Peta Konsep", description: "Relasi ide dan sitasi", icon: Network },
    ],
  },
  {
    category: "MENULIS",
    description: "Susun karya akademik lebih cepat",
    features: [
      { label: "Tulis Draf", description: "Editor naskah terpandu", icon: PenTool },
      { label: "Tulis Laporan", description: "Laporan riset terstruktur", icon: FileText },
      { label: "Manuskrip & LaTeX", description: "Format publikasi ilmiah", icon: Code2 },
      { label: "Poster Builder", description: "Poster presentasi riset", icon: LayoutTemplate },
    ],
  },
  {
    category: "DATA",
    description: "Ubah data menjadi temuan bermakna",
    features: [
      { label: "Statistik & Analisis", description: "Uji dan ringkasan statistik", icon: BarChart3 },
      { label: "Rangkaian Statistik", description: "Tren dan perbandingan data", icon: LineChart },
      { label: "Kumpulan Data Online", description: "Temukan dataset publik", icon: Database },
      { label: "Olah Data & Koding", description: "Python dan analisis data", icon: Terminal },
    ],
  },
  {
    category: "ALAT AI",
    description: "Alat cerdas untuk pekerjaan khusus",
    features: [
      { label: "Equation", description: "Kalkulator dan langkah solusi", icon: Calculator },
      { label: "Pembuat Sitasi", description: "Format referensi otomatis", icon: Quote },
      { label: "Image Generator", description: "Visual untuk publikasi", icon: ImageIcon },
      { label: "Ekspor & Sinkronisasi", description: "Arsip dan sinkronisasi aman", icon: CloudUpload },
    ],
  },
];

const quickActions: Feature[] = [
  { label: "Analisis PDF", description: "Baca bukti penting", icon: FileText },
  { label: "Temukan Makalah", description: "Cari riset tepercaya", icon: Search },
  { label: "Petakan Konsep", description: "Hubungkan ide", icon: Network },
  { label: "Kutip Sumber", description: "Buat referensi", icon: Quote },
];

const progressSteps = ["Memahami tujuan pertanyaan…", "Mencari sumber terindeks…", "Mengekstrak data dan argumen…", "Menyusun sintesis riset…"];

export function InfinityResearchBoard({ answer, answering, error, mode, onModeChange, onAsk, onStop }: Props) {
  const [query, setQuery] = useState("");
  const [context, setContext] = useState<string | null>(null);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [attachment, setAttachment] = useState<string | null>(null);
  const [activityOpen, setActivityOpen] = useState(false);
  const [steering, setSteering] = useState("");
  const [step, setStep] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const documentRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("infinity-canvas-draft");
    if (saved) setQuery(saved);
  }, []);
  useEffect(() => window.localStorage.setItem("infinity-canvas-draft", query), [query]);
  useEffect(() => {
    if (!answering) return;
    setActivityOpen(true);
    setStep(0);
    const timer = window.setInterval(() => setStep((value) => Math.min(value + 1, progressSteps.length - 1)), 1400);
    return () => window.clearInterval(timer);
  }, [answering]);

  const activate = (label: string) => {
    setContext(label);
    setAttachmentOpen(false);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };
  const attach = (file?: File) => {
    if (!file) return;
    setAttachment(file.name);
    setAttachmentOpen(false);
  };
  const submit = () => {
    const prompt = query.trim();
    if (!prompt && !attachment) return;
    onAsk(`${context ? `[${context}] ` : ""}${prompt}${attachment ? `\nLampiran: ${attachment}` : ""}`.trim());
  };
  const applySteering = () => {
    if (!steering.trim()) return;
    onAsk(`${context ? `[${context}] ` : ""}${query.trim()}`.trim(), steering.trim());
    setSteering("");
  };

  return (
    <section className="mx-auto w-full max-w-6xl pb-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] font-semibold uppercase text-primary-ink">Infinity Canvas</p>
        <h2 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">Apa yang ingin Anda teliti?</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Mulai dengan pertanyaan, makalah, atau konsep. Infinity membantu menelusuri bukti dan menyusun jawabannya.</p>
      </div>

      <div className="mx-auto mt-7 grid max-w-5xl gap-3 md:grid-cols-[11rem_minmax(0,1fr)_11rem] md:items-center">
        <QuickAction feature={quickActions[0]} onClick={() => activate(quickActions[0].label)} className="hidden md:flex" />
        <QuickAction feature={quickActions[1]} onClick={() => activate(quickActions[1].label)} className="mx-auto" />
        <QuickAction feature={quickActions[2]} onClick={() => activate(quickActions[2].label)} className="hidden md:flex" />
      </div>

      <div className="mx-auto mt-3 max-w-3xl rounded-[2rem] border border-border bg-card p-3 shadow-xl sm:p-5">
        <div className="mb-4 flex items-center justify-center gap-2">
          <span className="grid size-9 place-items-center rounded-full bg-teal-deep text-teal-deep-foreground"><Sparkles className="size-4" /></span>
          <h3 className="font-display text-xl font-semibold">Ask Infinity</h3>
        </div>

        <form className="rounded-2xl border border-input bg-background p-2 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15" onSubmit={(event) => { event.preventDefault(); submit(); }}>
          {(context || attachment) && (
            <div className="mb-1 flex flex-wrap gap-1.5 px-2 pt-1">
              {context && <ActiveChip label={context} onRemove={() => setContext(null)} />}
              {attachment && <ActiveChip label={attachment} onRemove={() => setAttachment(null)} icon={FileCheck} />}
            </div>
          )}
          <textarea ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} rows={2} placeholder="Tanyakan apa saja pada Infinity, analisis dokumen ilmiah, atau ketik perintah..." className="block min-h-16 w-full resize-none bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-muted-foreground sm:text-base" aria-label="Tanyakan pada Infinity" />
          <div className="flex items-center gap-1 border-t border-border pt-2">
            <div className="relative">
              <Button type="button" variant="ghost" size="icon" className="size-9 rounded-full" onClick={() => setAttachmentOpen((value) => !value)} aria-label="Tambahkan lampiran" aria-expanded={attachmentOpen}><Plus /></Button>
              {attachmentOpen && (
                <div className="absolute left-0 top-11 z-30 w-64 rounded-lg border border-border bg-popover p-2 shadow-xl">
                  <p className="px-3 py-2 text-[11px] font-semibold uppercase text-muted-foreground">Tambahkan lampiran</p>
                  <AttachmentAction icon={FileImage} label="Foto / Gambar" detail="OCR dan analisis visual" onClick={() => imageRef.current?.click()} />
                  <AttachmentAction icon={FileText} label="Dokumen" detail="PDF, DOCX, CSV, PPTX" onClick={() => documentRef.current?.click()} />
                  <AttachmentAction icon={Video} label="Video" detail="Ekstraksi audio dan subteks" onClick={() => videoRef.current?.click()} />
                </div>
              )}
            </div>
            <Button type="button" variant="ghost" size="icon" className="size-9 rounded-full" onClick={() => cameraRef.current?.click()} aria-label="Ambil foto"><Camera /></Button>
            <VoiceInput label="Pencarian suara" className="[&_button]:border-0 [&_button]:bg-transparent" onText={(text) => setQuery((value) => value ? `${value} ${text}` : text)} />
            <Button type="button" variant="ghost" size="icon" className="ml-auto size-9 rounded-full" onClick={() => inputRef.current?.focus()} aria-label="Fokuskan pencarian"><Search /></Button>
            {answering ? <Button type="button" size="icon" className="size-9 rounded-full bg-teal-deep text-teal-deep-foreground hover:bg-teal-deep/90" onClick={onStop} aria-label="Hentikan"><CircleStop /></Button> : <Button type="submit" size="icon" className="size-9 rounded-full bg-teal-deep text-teal-deep-foreground hover:bg-teal-deep/90" disabled={!query.trim() && !attachment} aria-label="Kirim ke Infinity"><Send /></Button>}
          </div>
        </form>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex rounded-full border border-border bg-background p-1" aria-label="Mode Infinity">
            <Button type="button" variant={mode === "general" ? "default" : "ghost"} size="sm" className="rounded-full" onClick={() => onModeChange("general")}><Sparkles /> General AI</Button>
            <Button type="button" variant={mode === "academic" ? "default" : "ghost"} size="sm" className="rounded-full" onClick={() => onModeChange("academic")}><BookOpen /> Academic Research</Button>
          </div>
          <Button type="button" variant="ghost" size="sm" className="rounded-full text-xs" onClick={() => setActivityOpen((value) => !value)}><Activity /> Aktivitas Langsung <ChevronDown className={cn("transition-transform", activityOpen && "rotate-180")} /></Button>
        </div>
      </div>

      <div className="mx-auto mt-3 max-w-xs"><QuickAction feature={quickActions[3]} onClick={() => activate(quickActions[3].label)} /></div>

      <input ref={imageRef} className="hidden" type="file" accept="image/*" onChange={(event) => attach(event.target.files?.[0])} />
      <input ref={cameraRef} className="hidden" type="file" accept="image/*" capture="environment" onChange={(event) => attach(event.target.files?.[0])} />
      <input ref={documentRef} className="hidden" type="file" accept=".pdf,.doc,.docx,.csv,.xls,.xlsx,.ppt,.pptx" onChange={(event) => attach(event.target.files?.[0])} />
      <input ref={videoRef} className="hidden" type="file" accept="video/*,audio/*" onChange={(event) => attach(event.target.files?.[0])} />

      {context === "Equation" && <EquationCalculator onUse={(expression) => { setQuery(expression); inputRef.current?.focus(); }} />}

      {(activityOpen || answering || answer || error) && (
        <div className="rise-in mx-auto mt-5 max-w-4xl overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-full bg-mint text-teal-ink"><Zap /></span><div><p className="text-sm font-semibold">Aktivitas Langsung</p><p className="text-[11px] text-muted-foreground">Arahkan hasil kapan saja</p></div></div><Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={() => setActivityOpen(false)} aria-label="Tutup aktivitas"><X /></Button></div>
          <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="space-y-2">{progressSteps.map((label, index) => { const complete = !answering && Boolean(answer) ? true : index < step; const active = answering && index === step; return <div key={label} className={cn("flex items-start gap-2.5 rounded-md px-2 py-2 text-xs", active && "bg-mint text-teal-ink")}><span className={cn("mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border", complete && "border-teal-deep bg-teal-deep text-teal-deep-foreground", active && "border-primary animate-pulse")}>{complete && <Check />}</span><span>{label}</span></div>; })}</div>
            <div><div className="min-h-32 rounded-md border border-border bg-background p-3">{error ? <p className="text-sm text-destructive">{error}</p> : answer ? <p className="whitespace-pre-wrap text-sm leading-6">{answer}{answering && <span className="animate-pulse"> ▍</span>}</p> : <p className="text-sm leading-6 text-muted-foreground">Hasil Infinity akan tampil di sini.</p>}</div><div className="mt-3 flex gap-2"><input value={steering} onChange={(event) => setSteering(event.target.value)} onKeyDown={(event) => event.key === "Enter" && applySteering()} placeholder="Fokuskan pada metodologi…" className="min-w-0 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring" aria-label="Instruksi revisi langsung" /><Button type="button" className="rounded-full bg-teal-deep text-teal-deep-foreground hover:bg-teal-deep/90" disabled={!steering.trim()} onClick={applySteering}><Zap /> Terapkan</Button></div></div>
          </div>
        </div>
      )}

      <div className="mt-12 text-center"><p className="text-[11px] font-semibold uppercase text-primary-ink">Semua alat, satu ruang kerja</p><h3 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Bangun alur riset Anda</h3><p className="mt-2 text-sm text-muted-foreground">Pilih alat untuk menjadikannya konteks aktif di Ask Infinity.</p></div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {featureGroups.map((group) => (
          <section key={group.category} className="rounded-lg border border-border bg-card p-3 shadow-sm">
            <div className="px-2 pb-3"><p className="text-[11px] font-semibold text-primary-ink">{group.category}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{group.description}</p></div>
            <div className="space-y-1">{group.features.map((feature) => <FeatureItem key={feature.label} feature={feature} selected={context === feature.label} onClick={() => activate(feature.label)} />)}</div>
          </section>
        ))}
      </div>
    </section>
  );
}

function QuickAction({ feature, onClick, className }: { feature: Feature; onClick: () => void; className?: string }) {
  const Icon = feature.icon;
  return <Button type="button" variant="outline" className={cn("h-auto min-h-14 w-full justify-start rounded-full bg-card px-3 py-2 shadow-sm", className)} onClick={onClick}><span className="grid size-9 shrink-0 place-items-center rounded-full bg-teal-soft text-teal-ink"><Icon /></span><span className="min-w-0 text-left"><span className="block truncate text-xs font-semibold">{feature.label}</span><span className="block truncate text-[10px] font-normal text-muted-foreground">{feature.description}</span></span></Button>;
}

function FeatureItem({ feature, selected, onClick }: { feature: Feature; selected: boolean; onClick: () => void }) {
  const Icon = feature.icon;
  return <Button type="button" variant="ghost" className={cn("h-auto min-h-14 w-full justify-start gap-2.5 whitespace-normal rounded-lg p-2 text-left transition-all hover:bg-mint/60", selected && "bg-mint text-teal-ink ring-1 ring-primary/20")} onClick={onClick}><span className="grid size-9 shrink-0 place-items-center rounded-full bg-teal-soft text-teal-ink"><Icon /></span><span className="min-w-0"><span className="block text-xs font-semibold">{feature.label}</span><span className="mt-0.5 block text-[10px] font-normal leading-4 text-muted-foreground">{feature.description}</span></span></Button>;
}

function AttachmentAction({ icon: Icon, label, detail, onClick }: { icon: LucideIcon; label: string; detail: string; onClick: () => void }) {
  return <Button type="button" variant="ghost" className="h-auto w-full justify-start gap-3 rounded-md px-3 py-2 text-left" onClick={onClick}><span className="grid size-9 shrink-0 place-items-center rounded-full bg-teal-soft text-teal-ink"><Icon /></span><span><span className="block text-xs font-semibold">{label}</span><span className="block text-[10px] font-normal text-muted-foreground">{detail}</span></span></Button>;
}

function ActiveChip({ label, onRemove, icon: Icon = Sparkles }: { label: string; onRemove: () => void; icon?: LucideIcon }) {
  return <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-mint py-0.5 pl-2.5 pr-0.5 text-xs font-semibold text-teal-ink"><Icon className="size-3" /><span className="truncate">{label}</span><Button type="button" variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); onRemove(); }} className="size-6 rounded-full" aria-label={`Hapus ${label}`}><X /></Button></span>;
}