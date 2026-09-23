import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart2,
  Bot,
  BookMarked,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleUserRound,
  Cloud,
  FolderKanban,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  Library,
  Menu,
  Moon,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  PenTool,
  Plus,
  Search,
  Sparkles,
  Sun,
  Terminal,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { InfinityResearchBoard } from "@/components/InfinityResearchBoard";
import { Button } from "@/components/ui/button";
import { streamAssist } from "@/lib/assist-client";
import { DEFAULT_ACCENT, accentForeground, accentPresets, isHex } from "@/lib/theme";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Infinity — AI Academic Research Workspace" },
      {
        name: "description",
        content: "Explore literature, synthesize papers, and organize academic research in Infinity.",
      },
      { property: "og:title", content: "Infinity — AI Academic Research Workspace" },
      {
        property: "og:description",
        content: "A focused AI workspace for literature discovery, synthesis, and citations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResearchWorkspace,
});

type Theme = "light" | "dark";
type EngineMode = "flash" | "pro" | "expert" | "deep" | "journal";
type AskMode = "general" | "academic";

const ASK_MODE_KEY = "orbis-ask-mode";

const defaultEngine = {
  id: "flash",
  label: "Gemini Flash",
  shortLabel: "Flash",
  description: "Fast response mode",
  icon: Gauge,
  tone: "bg-engine-flash",
} as const;

const engineModes = [
  defaultEngine,
  {
    id: "pro",
    label: "Gemini Pro",
    shortLabel: "Pro",
    description: "Standard analytical mode",
    icon: BrainCircuit,
    tone: "bg-engine-pro",
  },
  {
    id: "expert",
    label: "Gemini Expert",
    shortLabel: "Expert",
    description: "Deep synthesis mode",
    icon: Sparkles,
    tone: "bg-engine-expert",
  },
  {
    id: "deep",
    label: "Deep Research",
    shortLabel: "Deep",
    description: "Multi-agent web & paper search",
    icon: Bot,
    tone: "bg-engine-deep",
  },
  {
    id: "journal",
    label: "Journal Focus",
    shortLabel: "Journals",
    description: "Indexed academic papers only",
    icon: GraduationCap,
    tone: "bg-engine-journal",
  },
] satisfies Array<{
  id: EngineMode;
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof Gauge;
  tone: string;
}>;

const recentSessions = [
  { title: "Neural plasticity after stroke", time: "12 min" },
  { title: "Climate adaptation policy", time: "Yesterday" },
  { title: "Quantum sensing review", time: "Mon" },
];

function ResearchWorkspace() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [engineOpen, setEngineOpen] = useState(false);
  const [engineMode, setEngineMode] = useState<EngineMode>("flash");
  const [theme, setTheme] = useState<Theme>("light");
  const [accent, setAccent] = useState(DEFAULT_ACCENT);
  const [draftAccent, setDraftAccent] = useState(DEFAULT_ACCENT);
  const [statusIndex, setStatusIndex] = useState(0);
  const [askMode, setAskMode] = useState<AskMode>("general");
  const [answer, setAnswer] = useState("");
  const [answering, setAnswering] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("orbis-theme");
    const savedAccent = window.localStorage.getItem("orbis-accent");
    const savedMode = window.localStorage.getItem(ASK_MODE_KEY);
    const nextTheme: Theme = savedTheme === "dark" ? "dark" : "light";
    const nextAccent = savedAccent && isHex(savedAccent) ? savedAccent : DEFAULT_ACCENT;
    setTheme(nextTheme);
    setAccent(nextAccent);
    setDraftAccent(nextAccent);
    if (savedMode === "general" || savedMode === "academic") setAskMode(savedMode);
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  const chooseAskMode = (next: AskMode) => {
    setAskMode(next);
    window.localStorage.setItem(ASK_MODE_KEY, next);
  };

  const runGeneralAsk = async (prompt: string, steering?: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setAnswering(true);
    setAnswer("");
    setAnswerError(null);
    try {
      await streamAssist(
        {
          mode: engineMode === "journal" || engineMode === "deep" ? "pro" : engineMode,
          instruction: steering
            ? `Answer the user's question as a helpful general-purpose academic assistant. Revise or extend the response using this live instruction: ${steering}`
            : "Answer the user's question as a helpful general-purpose assistant. When a bracketed workflow context is present, follow it closely. Do not invent academic citations.",
          question: prompt,
        },
        (delta) => setAnswer((value) => value + delta),
        controller.signal,
      );
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") {
        setAnswerError(error instanceof Error ? error.message : "The assistant could not answer right now.");
      }
    } finally {
      setAnswering(false);
    }
  };


  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.setProperty("--user-accent", accent);
    document.documentElement.style.setProperty("--accent-on", accentForeground(accent));
    window.localStorage.setItem("orbis-theme", theme);
    window.localStorage.setItem("orbis-accent", accent);
  }, [theme, accent]);

  useEffect(() => {
    const timer = window.setInterval(() => setStatusIndex((value) => (value + 1) % 3), 3800);
    return () => window.clearInterval(timer);
  }, []);

  const statuses = ["Scraping papers…", "Generating citations…", "Synthesizing PDF…"];
  const validAccent = /^#[0-9A-Fa-f]{6}$/.test(draftAccent);
  const activeEngine = engineModes.find((mode) => mode.id === engineMode) ?? defaultEngine;
  const ActiveEngineIcon = activeEngine.icon;

  const applyAccent = () => {
    if (validAccent) setAccent(draftAccent.toUpperCase());
  };

  return (
    <div className="app-shell min-h-screen bg-background text-foreground">
      {mobileOpen && (
        <button
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px] lg:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "sidebar fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-sidebar transition-[width,transform] duration-300",
          sidebarOpen ? "w-72" : "w-[76px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="grid h-20 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="brand-mark grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="font-display truncate text-lg font-semibold">Infinity</p>
                <p className="truncate text-xs text-muted-foreground">Research intelligence</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hidden rounded-full lg:inline-flex"
            onClick={() => setSidebarOpen((value) => !value)}
            aria-label={sidebarOpen ? "Collapse navigation" : "Expand navigation"}
            title={sidebarOpen ? "Collapse navigation" : "Expand navigation"}
          >
            {sidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          <Button asChild className={cn("h-11 rounded-full shadow-none", sidebarOpen ? "w-full justify-start px-4" : "w-11 px-0")}>
            <Link to="/search" search={{ q: undefined }} title="New research">
              <Plus />
              {sidebarOpen && <span>New research</span>}
            </Link>
          </Button>

          <nav aria-label="Research navigation" className="mt-7 space-y-7">
            <NavGroup title="Workspace" open={sidebarOpen}>
              <NavItem icon={LayoutDashboard} label="Home / Infinity Canvas" open={sidebarOpen} active to="/" />
              <NavItem icon={BookMarked} label="Saved papers" open={sidebarOpen} />
              <NavItem icon={FolderKanban} label="Projects" open={sidebarOpen} />
              <NavItem icon={Search} label="Search & discovery" open={sidebarOpen} to="/search" />
              <NavItem icon={PenTool} label="Writing workspace" open={sidebarOpen} to="/write" />
              <NavItem icon={Library} label="Source library" open={sidebarOpen} to="/write" />
              <NavItem icon={BarChart2} label="Data analysis" open={sidebarOpen} to="/analyze" />
              <NavItem icon={Terminal} label="Data & Coding" open={sidebarOpen} to="/analysis" />
              <NavItem icon={Cloud} label="Export & Cloud Sync" open={sidebarOpen} to="/converter" />
            </NavGroup>

            {sidebarOpen && (
              <NavGroup title="Recent sessions" open>
                {recentSessions.map((session, index) => (
                  <button
                    key={session.title}
                    className="group w-full rounded-md px-3 py-2.5 text-left transition-colors hover:bg-sidebar-accent"
                  >
                    <span className="flex items-start gap-3">
                      <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", index === 0 ? "bg-primary" : "bg-signal")} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{session.title}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{session.time}</span>
                      </span>
                    </span>
                  </button>
                ))}
              </NavGroup>
            )}
          </nav>
        </div>

        <div className="border-t border-border p-3">
          <button className={cn("flex w-full items-center rounded-full py-2 transition-colors hover:bg-sidebar-accent", sidebarOpen ? "gap-3 px-2" : "justify-center")}>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
              <CircleUserRound className="size-5" />
            </span>
            {sidebarOpen && (
              <span className="min-w-0 text-left">
                <span className="block truncate text-sm font-medium">Sign in with Google</span>
                <span className="block truncate text-xs text-muted-foreground">Sync your workspace</span>
              </span>
            )}
          </button>
        </div>
      </aside>

      <div className={cn("min-w-0 transition-[padding] duration-300", sidebarOpen ? "lg:pl-72" : "lg:pl-[76px]")}>
        <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-xl">
          <div className="grid h-20 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Button variant="ghost" size="icon" className="rounded-full lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <Menu />
            </Button>
            <div className="flex min-w-0 items-center gap-6">
              <div className="min-w-0">
                <h1 className="font-display truncate text-base font-semibold sm:text-lg">Research canvas</h1>
                <p className="hidden truncate text-xs text-muted-foreground sm:block">Turn questions into evidence</p>
              </div>
              <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
                <Link to="/search" search={{ q: undefined }} className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" activeProps={{ className: "bg-accent text-accent-foreground" }}>
                  Search
                </Link>
                <Link to="/write" className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" activeProps={{ className: "bg-accent text-accent-foreground" }}>
                  Writing workspace
                </Link>
              </nav>
            </div>

            <div className="relative ml-auto flex shrink-0 items-center justify-end gap-2">

              <div className="relative">
                <Button
                  variant="outline"
                  className="h-10 rounded-full bg-background px-2.5 shadow-none sm:px-3"
                  onClick={() => {
                    setEngineOpen((value) => !value);
                    setAppearanceOpen(false);
                  }}
                  aria-label={`AI engine: ${activeEngine.label}`}
                  aria-expanded={engineOpen}
                >
                  <span className={cn("grid size-6 place-items-center rounded-full text-primary-foreground", activeEngine.tone)}>
                    <ActiveEngineIcon className="size-3.5" />
                  </span>
                  <span className="hidden max-w-32 truncate text-xs sm:inline">{activeEngine.label}</span>
                  <span className="text-xs sm:hidden">{activeEngine.shortLabel}</span>
                  <ChevronRight className={cn("size-3.5 transition-transform", engineOpen && "rotate-90")} />
                </Button>

                {engineOpen && (
                  <div className="engine-panel absolute right-0 top-12 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-xl">
                    <div className="px-3 pb-2 pt-1">
                      <p className="font-display text-sm font-semibold">AI engine control</p>
                      <p className="text-[11px] text-muted-foreground">Choose how Infinity approaches this session</p>
                    </div>
                    <div className="space-y-1" role="listbox" aria-label="AI engine mode">
                      {engineModes.map((mode) => {
                        const ModeIcon = mode.icon;
                        const selected = mode.id === engineMode;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            onClick={() => {
                              setEngineMode(mode.id);
                              setEngineOpen(false);
                            }}
                            className={cn(
                              "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
                              selected ? "bg-accent text-accent-foreground" : "hover:bg-muted",
                            )}
                          >
                            <span className={cn("grid size-9 shrink-0 place-items-center rounded-full text-primary-foreground", mode.tone)}>
                              <ModeIcon className="size-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold">{mode.label}</span>
                              <span className="block truncate text-[11px] text-muted-foreground">{mode.description}</span>
                            </span>
                            <span className={cn("grid size-5 place-items-center rounded-full", selected ? "bg-primary text-primary-foreground" : "text-transparent")}>
                              <Check className="size-3" />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-background shadow-none"
                onClick={() => {
                  setAppearanceOpen((value) => !value);
                  setEngineOpen(false);
                }}
                aria-label="Appearance settings"
                aria-expanded={appearanceOpen}
              >
                <Palette />
              </Button>
              <button className="grid size-9 place-items-center rounded-full bg-foreground text-background" aria-label="Account menu" title="Account menu">
                <span className="text-xs font-semibold">RP</span>
              </button>

              {appearanceOpen && (
                <div className="appearance-panel absolute right-0 top-12 w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display font-semibold">Appearance</p>
                      <p className="text-xs text-muted-foreground">Saved on this device</p>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setAppearanceOpen(false)} aria-label="Close appearance settings"><X /></Button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button variant={theme === "light" ? "default" : "outline"} className="rounded-full" onClick={() => setTheme("light")}><Sun /> Light</Button>
                    <Button variant={theme === "dark" ? "default" : "outline"} className="rounded-full" onClick={() => setTheme("dark")}><Moon /> Dark</Button>
                  </div>
                  <p className="mt-5 text-xs font-medium">Preset accents</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {accentPresets.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => {
                          setAccent(preset.value);
                          setDraftAccent(preset.value);
                        }}
                        aria-pressed={accent.toUpperCase() === preset.value.toUpperCase()}
                        className={cn(
                          "flex items-center gap-2 rounded-full border px-3 py-2 text-left text-[11px] font-semibold transition-colors",
                          accent.toUpperCase() === preset.value.toUpperCase()
                            ? "border-primary bg-accent text-accent-foreground"
                            : "border-border hover:bg-muted",
                        )}
                      >
                        <span className="size-4 shrink-0 rounded-full border border-border" style={{ backgroundColor: preset.value }} />
                        <span className="truncate">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                  <label className="mt-5 block text-xs font-medium" htmlFor="accent">Custom accent</label>

                  <div className="mt-2 grid grid-cols-[auto_minmax(0,1fr)_auto] gap-2">
                    <input
                      aria-label="Accent color picker"
                      type="color"
                      value={validAccent ? draftAccent : accent}
                      onChange={(event) => setDraftAccent(event.target.value.toUpperCase())}
                      className="size-10 cursor-pointer rounded-full border-0 bg-transparent p-0"
                    />
                    <input
                      id="accent"
                      value={draftAccent}
                      onChange={(event) => setDraftAccent(event.target.value)}
                      onKeyDown={(event) => event.key === "Enter" && applyAccent()}
                      className="min-w-0 rounded-full border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      aria-invalid={!validAccent}
                    />
                    <Button size="sm" className="h-10 rounded-full" disabled={!validAccent} onClick={applyAccent}>Apply</Button>
                  </div>
                  {!validAccent && <p className="mt-2 text-xs text-destructive">Enter a six-digit hex color.</p>}
                </div>
              )}
            </div>
          </div>

          <div className="activity-bar flex min-h-10 items-center justify-between gap-4 border-t border-border/60 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="relative flex size-2.5 shrink-0">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-signal opacity-50" />
                <span className="relative inline-flex size-2.5 rounded-full bg-signal" />
              </span>
              <span className="shrink-0 text-[11px] font-semibold uppercase text-muted-foreground">Live activity</span>
              <span className="truncate text-xs font-medium" aria-live="polite">{statuses[statusIndex]}</span>
            </div>
            <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
              <span>3 tasks</span><ChevronRight className="size-3.5" />
            </div>
          </div>
        </header>

        <main className="workspace-grid min-h-[calc(100vh-7.5rem)] overflow-hidden px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
          <InfinityResearchBoard
            answer={answer}
            answering={answering}
            error={answerError}
            mode={askMode}
            onModeChange={chooseAskMode}
            onAsk={(prompt, steering) => void runGeneralAsk(prompt, steering)}
            onStop={() => abortRef.current?.abort()}
          />
        </main>
      </div>
    </div>
  );
}

function NavGroup({ title, open, children }: { title: string; open: boolean; children: React.ReactNode }) {
  return <div>{open && <p className="mb-2 px-3 text-[10px] font-semibold uppercase text-muted-foreground">{title}</p>}<div className="space-y-1">{children}</div></div>;
}

function NavItem({ icon: Icon, label, open, active = false, to }: { icon: typeof Search; label: string; open: boolean; active?: boolean; to?: "/" | "/search" | "/write" | "/analyze" | "/analysis" | "/converter" }) {
  const className = cn("flex h-10 w-full items-center rounded-full text-sm transition-colors", open ? "gap-3 px-2" : "justify-center", active ? "bg-mint/70 font-medium text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground");
  const inner = (
    <>
      <span className={cn("grid size-8 shrink-0 place-items-center rounded-full bg-mint text-teal-ink", active && "bg-teal-deep text-teal-deep-foreground")}>
        <Icon className="size-4" />
      </span>
      {open && <span className="truncate">{label}</span>}
    </>
  );
  if (to) {
    return (
      <Link to={to} title={!open ? label : undefined} className={className} activeProps={{ className: "bg-mint/70 font-medium text-sidebar-accent-foreground" }}>
        {inner}
      </Link>
    );
  }
  return <button title={!open ? label : undefined} className={className}>{inner}</button>;
}
