import React, { useEffect, useState, memo } from "react";
import jsPDF from "jspdf";
import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Briefcase,
  CircleHelp,
  CheckCircle2,
  ChevronDown,
  Download,
  ExternalLink,
  FileStack,
  Flame,
  Gauge,
  GraduationCap,
  GitBranch,
  Layers3,
  LineChart,
  Mail,
  MapPin,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  UserRoundSearch,
  XCircle,
} from "lucide-react";
import SkillChart from "./SkillChart";

const MetricCard = memo(function MetricCard({ label, value, subtext = "", tone = "default" }) {
  const toneClasses = {
    default: "border-white/8 bg-white/[0.03] text-white",
    good: "border-emerald-500/15 bg-emerald-500/8 text-emerald-50",
    warn: "border-amber-500/15 bg-amber-500/8 text-amber-50",
    danger: "border-rose-500/15 bg-rose-500/8 text-rose-50",
    accent: "border-cyan-500/15 bg-cyan-500/8 text-cyan-50",
  };

  return (
    <div className={`rounded-3xl border p-5 shadow-sm transition-all hover:shadow-md ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">{label}</p>
      <p className="mt-3 text-3xl font-black">{value}</p>
      {subtext ? <p className="mt-2 text-xs leading-5 text-stone-400">{subtext}</p> : null}
    </div>
  );
});

const SectionCard = memo(function SectionCard({ title, icon: Icon, children, aside = null }) {
  return (
    <section className="rounded-3xl border border-white/8 bg-[#120f0d] p-6 shadow-md">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
          {Icon ? <Icon size={15} /> : null}
          {title}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
});

const TagGrid = memo(function TagGrid({ items, emptyText, tone = "default" }) {
  const toneClasses = {
    default: "border-white/10 bg-white/[0.04] text-stone-200",
    success: "border-emerald-500/15 bg-emerald-500/8 text-emerald-100",
    warn: "border-amber-500/15 bg-amber-500/8 text-amber-50",
    danger: "border-rose-500/15 bg-rose-500/8 text-rose-100",
    info: "border-cyan-500/15 bg-cyan-500/8 text-cyan-100",
  };

  if (!items?.length) {
    return <p className="text-sm leading-6 text-stone-500">{emptyText}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={`rounded-full border px-3 py-2 text-xs font-bold transition hover:opacity-80 hover:-translate-y-0.5 ${toneClasses[tone]}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
});

const InsightList = memo(function InsightList({ items, emptyText, tone = "accent" }) {
  const tones = {
    accent: "border-cyan-500/15 bg-cyan-500/8 text-cyan-50",
    success: "border-emerald-500/15 bg-emerald-500/8 text-emerald-50",
    rose: "border-rose-500/15 bg-rose-500/8 text-rose-50",
    amber: "border-amber-500/15 bg-amber-500/8 text-amber-50",
  };

  if (!items?.length) {
    return <p className="text-sm leading-6 text-stone-500">{emptyText}</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className={`rounded-xl border p-4 text-sm leading-6 transition hover:shadow-sm ${tones[tone]}`}>
          {item}
        </div>
      ))}
    </div>
  );
});

const AnimatedScoreRing = memo(function AnimatedScoreRing({ score, label, breakdown = [], verdict }) {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;

  const displayScore = React.useMemo(() => isNaN(score) ? 0 : Math.round(Number(score)), [score]);
  const offset = circumference - (displayScore / 100) * circumference;

  const ringColor = displayScore >= 80 ? "#4cc890" : displayScore >= 60 ? "#f5bd4e" : "#f66f7b";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#141414] p-6 shadow-lg">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-300">
            <Gauge size={13} className="mr-2" />
            {verdict?.label || "Match"}
          </div>
          <p className="max-w-[210px] text-right text-xs leading-5 text-stone-400">Composite fit signal using skills, execution history, and relevance.</p>
        </div>

        <div className="grid place-items-center rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
          <div className="relative grid h-[210px] w-full max-w-[210px] place-items-center">
            <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
              <circle cx="80" cy="80" r={radius} fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={ringColor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Semantic Fit</p>
              <p className="mt-2 text-6xl font-black text-white">{displayScore}%</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-cyan-200">{label}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {breakdown.map((item, index) => (
            <div
              key={item.label}
              className="animate-fade-up rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">{item.label}</p>
                <p className="text-sm font-black text-white">{item.value}%</p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-all duration-700"
                  style={{ width: `${Math.max(8, item.value)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

function SkillConstellation({ groups }) {
  const direct = groups.find((group) => group.label === "Direct Matches")?.items || [];
  const inferred = groups.find((group) => group.label === "Inferred Matches")?.items || [];
  const weak = groups.find((group) => group.label === "Weak / Unproven")?.items || [];
  const columns = [
    { title: "Direct", tone: "border-emerald-500/20 bg-emerald-500/8 text-emerald-100", items: direct, glow: "shadow-[0_0_22px_rgba(76,200,144,0.18)]" },
    { title: "Inferred", tone: "border-cyan-500/20 bg-cyan-500/8 text-cyan-100", items: inferred, glow: "shadow-[0_0_26px_rgba(89,208,222,0.18)]" },
    { title: "Weak", tone: "border-amber-500/20 bg-amber-500/8 text-amber-100", items: weak, glow: "shadow-[0_0_18px_rgba(245,189,78,0.14)]" },
  ];

  return (
    <div className="relative overflow-hidden rounded-[1.8rem] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(89,208,222,0.1),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-5">
      <div className="pointer-events-none absolute left-1/2 top-10 hidden h-[calc(100%-5rem)] w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.12),transparent)] lg:block" />
      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((column, columnIndex) => (
          <div key={column.title} className="relative">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">
              <GitBranch size={13} />
              {column.title} Nodes
            </div>
            <div className="space-y-3">
              {column.items.length ? (
                column.items.map((item, itemIndex) => (
                  <div
                    key={`${column.title}-${item.skill}`}
                    className={`animate-fade-up rounded-[1.3rem] border px-4 py-3 ${column.tone} ${column.glow}`}
                    style={{ animationDelay: `${columnIndex * 120 + itemIndex * 90}ms` }}
                    title={item.reasoning}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black">{item.skill}</p>
                      {item.confidence ? (
                        <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/80">
                          {item.confidence}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-white/80">
                      {item.source_skill ? `Mapped from ${item.source_skill}. ` : ""}
                      {item.reasoning}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.3rem] border border-white/8 bg-white/[0.02] p-4 text-sm text-stone-500">No nodes in this band.</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FullStackSkillMap({ groups, edges }) {
  const toneFor = (label) => {
    if (label === "Core Nodes") return "border-cyan-500/20 bg-cyan-500/8 text-cyan-50";
    if (label === "Connected Nodes") return "border-emerald-500/18 bg-emerald-500/8 text-emerald-50";
    if (label === "Inferred Nodes") return "border-amber-500/18 bg-amber-500/8 text-amber-50";
    return "border-rose-500/18 bg-rose-500/8 text-rose-50";
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.9fr]">
        <div className="rounded-[1.8rem] border border-white/8 bg-[radial-gradient(circle_at_center,rgba(89,208,222,0.1),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-5">
          <div className="grid gap-4 md:grid-cols-2">
            {groups.map((group) => (
              <div key={group.label} className="rounded-[1.3rem] border border-white/8 bg-[#120f0d]/60 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">{group.label}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={`${group.label}-${item.skill}`}
                      title={item.evidence}
                      className={`rounded-full border px-3 py-2 text-xs font-bold ${toneFor(group.label)} ${item.intensity === "strong" ? "shadow-[0_0_18px_rgba(89,208,222,0.16)]" : ""
                        }`}
                    >
                      {item.skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">Connection Logic</p>
          <div className="mt-3 space-y-3">
            {(edges || []).map((edge, index) => (
              <div key={`${edge.from}-${edge.to}-${index}`} className="rounded-[1.3rem] border border-white/8 bg-[#120f0d]/65 p-4">
                <p className="text-sm font-black text-white">{edge.from} {" -> "} {edge.to}</p>
                <p className="mt-2 text-sm leading-6 text-stone-300">{edge.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GapHeatmap({ groups }) {
  const items = groups.flatMap((group) =>
    group.items.map((item) => ({
      ...item,
      band: group.label,
      tone:
        group.label === "Completely Missing"
          ? "bg-rose-500"
          : group.label === "Weak Evidence"
            ? "bg-amber-400"
            : "bg-emerald-400",
      value:
        group.label === "Completely Missing"
          ? 92
          : group.label === "Weak Evidence"
            ? 58
            : 76,
    }))
  );

  if (!items.length) {
    return <p className="text-sm leading-6 text-stone-500">Gap intelligence appears when the system detects missing or weak signals.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={`${item.band}-${item.skill}`}
          className="animate-fade-up rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4"
          style={{ animationDelay: `${index * 70}ms` }}
          title={item.reason}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-white">{item.skill}</p>
              <p className="mt-1 text-[11px] font-black uppercase tracking-[0.16em] text-stone-500">{item.band}</p>
            </div>
            <p className="text-xs leading-5 text-stone-400">{item.reason}</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className={`h-full rounded-full transition-all duration-700 ${item.tone}`}
              style={{ width: `${item.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ImprovementAccordion({ steps }) {
  const [openSkill, setOpenSkill] = useState(steps?.[0]?.skill || "");

  if (!steps?.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      {steps.map((item) => {
        const open = openSkill === item.skill;
        return (
          <div key={item.skill} className="overflow-hidden rounded-[1.6rem] border border-white/8 bg-white/[0.03]">
            <button
              type="button"
              onClick={() => setOpenSkill(open ? "" : item.skill)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <div>
                <p className="text-sm font-black text-white">{item.skill}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">Before to After Plan</p>
              </div>
              <ChevronDown size={18} className={`transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open ? (
              <div className="animate-fade-up border-t border-white/8 px-5 py-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[1.2rem] border border-white/8 bg-[#120f0d]/70 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">Project</p>
                    <p className="mt-2 text-sm leading-6 text-stone-300">{item.project_idea}</p>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/8 bg-[#120f0d]/70 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">Resume Bullet</p>
                    <p className="mt-2 text-sm leading-6 text-stone-300">{item.resume_bullet_example}</p>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/8 bg-[#120f0d]/70 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">Interview Story</p>
                    <p className="mt-2 text-sm leading-6 text-stone-300">{item.interview_story_angle}</p>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(245,189,78,0.12),rgba(245,189,78,0.04))] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-200">Pro Upgrade</p>
                    <p className="mt-2 text-sm leading-6 text-stone-200">{item.upgrade_tip}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function BlueprintTabs({ groups }) {
  const [active, setActive] = useState(groups?.[0]?.label || "");
  const current = groups.find((group) => group.label === active) || groups[0];

  if (!groups?.length) {
    return <p className="text-sm leading-6 text-stone-500">No required job skills were extracted yet.</p>;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {groups.map((group) => (
          <button
            key={group.label}
            type="button"
            onClick={() => setActive(group.label)}
            className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${current?.label === group.label
              ? "border-cyan-400/30 bg-cyan-500/12 text-cyan-100"
              : "border-white/8 bg-white/[0.03] text-stone-400 hover:text-white"
              }`}
          >
            {group.label}
          </button>
        ))}
      </div>
      <div className="animate-fade-up space-y-3">
        {(current?.items || []).map((item) => (
          <div key={`${current.label}-${item.skill}`} className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4">
            <p className="text-sm font-black text-white">{item.skill}</p>
            <p className="mt-2 text-sm leading-6 text-stone-300">{item.why_it_matters}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpgradeScore({ score, ideas }) {
  const potential = Math.min(99, score + Math.min(18, (ideas?.length || 0) * 4));
  const delta = Math.max(0, potential - score);
  return (
    <div className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(135deg,rgba(245,189,78,0.12),rgba(89,208,222,0.08))] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">Upgrade Score</p>
          <p className="mt-2 text-3xl font-black text-white">{potential}%</p>
        </div>
        <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-100">
          +{delta} potential
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,#f5bd4e,#59d0de)] transition-all duration-700" style={{ width: `${potential}%` }} />
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-300">
        This estimates how much stronger the profile could look after shipping the highest-value upgrades below.
      </p>
    </div>
  );
}

function PreparationResourceCards({ items }) {
  if (!items?.length) return null;
  const first = (arr) => arr?.[0];
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.skill} className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4">
          <p className="text-sm font-black text-white">{item.skill}</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {[
              ["Official Docs", first(item.official_docs)],
              ["Course", first(item.course)],
              ["Practice Platform", first(item.practice_platform)],
              ["Real-world Example", first(item.real_world_example)],
            ].map(([label, resource]) => (
              <div key={`${item.skill}-${label}`} className="rounded-[1.2rem] border border-white/8 bg-[#120f0d]/70 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">{label}</p>
                {resource ? (
                  <a href={resource.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm leading-6 text-cyan-100 hover:text-cyan-50">
                    {resource.title} <ExternalLink size={12} className="ml-1 inline" />
                  </a>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-stone-500">No targeted resource linked.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function InterviewQuestionCards({ groups }) {
  if (!groups?.length) return null;
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.label} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">{group.label}</p>
          <div className="mt-3 space-y-3">
            {group.items.map((item, index) => (
              <div key={`${group.label}-${index}`} className="rounded-[1.2rem] border border-white/8 bg-[#120f0d]/65 p-4">
                <p className="text-sm font-black text-white">{item.question}</p>
                <p className="mt-2 text-sm leading-6 text-stone-300">{item.expectation}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActionableRecommendation({ item }) {
  const [copied, setCopied] = useState(false);
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(variant || item);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRewrite = () => {
    setLoading(true);
    setTimeout(() => {
      setVariant(`[A/B Variant]: To excel in this target, proactively expand your scope on ${String(item).split(' ').slice(0, 4).join(' ')}... Ensure you track metrics like latency, engagement, or scale to prove impact.`);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="rounded-[1.3rem] border border-cyan-500/20 bg-cyan-500/10 p-4 transition-all">
      <p className="text-sm leading-6 text-cyan-50">{variant || item}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={handleRewrite} disabled={loading} className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider bg-white/5 border border-white/10 rounded-full text-stone-300 hover:bg-white/10 transition">
          {loading ? "Generating..." : "Generate Custom Bullet"}
        </button>
        <button type="button" onClick={handleCopy} className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border rounded-full transition ${copied ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-200 hover:bg-cyan-500/20'}`}>
          {copied ? "Copied!" : "Copy to Clipboard"}
        </button>
      </div>
    </div>
  );
}

function inferRoleTrack(displayJobRole = "", requiredSkills = []) {
  const combined = `${displayJobRole} ${(requiredSkills || []).join(" ")}`.toLowerCase();
  if (/full[\s-]?stack|frontend.*backend|backend.*frontend/.test(combined)) return "Full Stack";
  if (/front[\s-]?end|react|next|ui|ux|typescript|javascript/.test(combined)) return "Frontend";
  if (/back[\s-]?end|node|api|python|java|golang|microservice|database/.test(combined)) return "Backend";
  if (/ml|machine learning|ai|nlp|llm|data science|tensorflow|pytorch/.test(combined)) return "ML";
  return "Software";
}

function inferCandidateLevel(resume = {}, displayJobRole = "") {
  const experienceEntries = Array.isArray(resume?.experience) ? resume.experience.length : 0;
  const role = `${displayJobRole || ""}`.toLowerCase();
  if (/lead|principal|staff|architect|head/.test(role) || experienceEntries >= 5) return "Senior";
  if (/intern|junior|entry|associate/.test(role) || experienceEntries <= 1) return "Beginner";
  return "Mid";
}

function roleAwareImprovementText(roleTrack, skill, weakness = "") {
  const skillLabel = skill || "this capability";
  const reason = weakness || `Evidence for ${skillLabel} is currently thin`;
  if (roleTrack === "Frontend") {
    return `${reason}. Your ${skillLabel} examples should connect technical execution to measurable UI impact such as Core Web Vitals improvement, conversion lift, or reduced bounce.`;
  }
  if (roleTrack === "Backend") {
    return `${reason}. Show API reliability, latency reduction, throughput, or cost optimizations so hiring teams can map your backend work to production outcomes.`;
  }
  if (roleTrack === "Full Stack") {
    return `${reason}. Frame end-to-end ownership across frontend, backend, and deployment outcomes to prove full-cycle delivery at scale.`;
  }
  if (roleTrack === "ML") {
    return `${reason}. Add model quality, business impact, and deployment constraints to show that your ML work goes beyond experimentation.`;
  }
  return `${reason}. Add clear scope, ownership, and measurable outcomes to strengthen recruiter confidence.`;
}

function sanitizeImprovementItems(items = [], roleTrack, missingSkills = [], weaknesses = []) {
  const genericPattern = /no explicit metric provided|outcome should be quantified|not provided|not captured|insight unavailable/i;
  const normalized = (items || [])
    .map((item, index) => {
      if (!item) return null;
      const raw = typeof item === "string" ? item : item.upgrade_tip || item.project_idea || item.skill || "";
      if (!raw) return null;
      if (!genericPattern.test(raw)) return raw;
      const skill = missingSkills[index] || missingSkills[0] || "project impact";
      return roleAwareImprovementText(roleTrack, skill, weaknesses[index] || "");
    })
    .filter(Boolean);

  if (normalized.length) return normalized;
  return (missingSkills || []).slice(0, 4).map((skill, index) => roleAwareImprovementText(roleTrack, skill, weaknesses[index] || ""));
}

function normalizeUrl(url = "") {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function buildPreparationHubItems({ prepLinks = [], roleTrack, level, missingSkills = [], weaknesses = [] }) {
  const roleResources = {
    Frontend: {
      roadmap: "https://roadmap.sh/frontend",
      official: [{ title: "React Official Docs", url: "https://react.dev" }, { title: "MDN Web Performance", url: "https://developer.mozilla.org/en-US/docs/Web/Performance" }],
      practical: [{ title: "Frontend Mentor Challenges", url: "https://www.frontendmentor.io/challenges" }, { title: "Awesome React Projects", url: "https://github.com/enaqx/awesome-react" }],
      interview: [{ title: "Frontend Interview Handbook", url: "https://www.frontendinterviewhandbook.com" }, { title: "GreatFrontEnd Practice", url: "https://www.greatfrontend.com" }],
      portfolio: [{ title: "Frontend Portfolio Inspiration", url: "https://www.frontendmentor.io/showcase" }, { title: "Open Source Frontend Projects", url: "https://github.com/trending/javascript" }],
      market: [{ title: "Web Dev Hiring Trends (Stack Overflow)", url: "https://survey.stackoverflow.co" }, { title: "Levels.fyi Benchmarking", url: "https://www.levels.fyi" }],
    },
    Backend: {
      roadmap: "https://roadmap.sh/backend",
      official: [{ title: "REST API Design Guide", url: "https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design" }, { title: "PostgreSQL Docs", url: "https://www.postgresql.org/docs/" }],
      practical: [{ title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer" }, { title: "Backend Challenges", url: "https://github.com/florinpop17/app-ideas" }],
      interview: [{ title: "ByteByteGo", url: "https://bytebytego.com" }, { title: "Excalidraw System Design", url: "https://www.youtube.com/@SystemDesignInterview" }],
      portfolio: [{ title: "Real-world API Portfolio Examples", url: "https://github.com/public-apis/public-apis" }, { title: "Production Backend Repos", url: "https://github.com/trending/go" }],
      market: [{ title: "GitHub Octoverse", url: "https://octoverse.github.com" }, { title: "Tech Hiring Benchmarks", url: "https://www.levels.fyi" }],
    },
    "Full Stack": {
      roadmap: "https://roadmap.sh/full-stack",
      official: [{ title: "Next.js Docs", url: "https://nextjs.org/docs" }, { title: "Node.js Docs", url: "https://nodejs.org/en/docs" }],
      practical: [{ title: "The Odin Project", url: "https://www.theodinproject.com/paths/full-stack-javascript" }, { title: "App Ideas Collection", url: "https://github.com/florinpop17/app-ideas" }],
      interview: [{ title: "Tech Interview Handbook", url: "https://www.techinterviewhandbook.org" }, { title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer" }],
      portfolio: [{ title: "Full-stack Portfolio Examples", url: "https://www.theodinproject.com/success_stories" }, { title: "Production-grade Full-stack Repos", url: "https://github.com/trending/typescript" }],
      market: [{ title: "Stack Overflow Survey", url: "https://survey.stackoverflow.co" }, { title: "Hiring Market Benchmarks", url: "https://www.levels.fyi" }],
    },
    ML: {
      roadmap: "https://roadmap.sh/ai-data-scientist",
      official: [{ title: "PyTorch Docs", url: "https://pytorch.org/docs/stable/index.html" }, { title: "scikit-learn User Guide", url: "https://scikit-learn.org/stable/user_guide.html" }],
      practical: [{ title: "Papers with Code", url: "https://paperswithcode.com" }, { title: "Made With ML", url: "https://madewithml.com" }],
      interview: [{ title: "ML Interview Book", url: "https://huyenchip.com/ml-interviews-book/" }, { title: "Designing ML Systems", url: "https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/" }],
      portfolio: [{ title: "Kaggle Portfolio Showcase", url: "https://www.kaggle.com/code" }, { title: "ML Open Source Projects", url: "https://github.com/trending/jupyter-notebook" }],
      market: [{ title: "AI Index Report", url: "https://aiindex.stanford.edu/report/" }, { title: "Kaggle State of ML", url: "https://www.kaggle.com" }],
    },
    Software: {
      roadmap: "https://roadmap.sh/full-stack",
      official: [{ title: "Engineering Career Frameworks", url: "https://staffeng.com/guides" }],
      practical: [{ title: "Real World Engineering Challenges", url: "https://github.com/codecrafters-io/build-your-own-x" }],
      interview: [{ title: "Tech Interview Handbook", url: "https://www.techinterviewhandbook.org" }],
      portfolio: [{ title: "Engineering Portfolio Examples", url: "https://github.com/karan/Projects" }],
      market: [{ title: "Developer Trends", url: "https://survey.stackoverflow.co" }],
    },
  };

  const catalog = roleResources[roleTrack] || roleResources.Software;
  const targets = (missingSkills.length ? missingSkills : ["impact storytelling", "system depth", "interview narratives"]).slice(0, 4);

  return targets.map((skill, index) => {
    const prepForSkill = prepLinks.find((item) => item.skill === skill || item.label === skill);
    const prepResources = (prepForSkill?.resources || []).map((resource) => ({
      title: resource.title,
      url: normalizeUrl(resource.url),
      category: "Practical Learning",
    }));

    const weaknessHint = weaknesses[index] || "";
    const dedupeByUrl = (list) => {
      const seen = new Set();
      return list.filter((entry) => {
        const key = normalizeUrl(entry.url || "");
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    const official = dedupeByUrl([...catalog.official]).map((item) => ({ ...item, category: "Official Learning" }));
    const practical = dedupeByUrl([...catalog.practical, ...prepResources]).slice(0, 4).map((item) => ({ ...item, category: "Practical Learning" }));
    const interview = dedupeByUrl([...catalog.interview]).map((item) => ({ ...item, category: "Interview Preparation" }));
    const portfolio = dedupeByUrl([...(catalog.portfolio || [])]).map((item) => ({ ...item, category: "Portfolio Resources" }));
    const market = dedupeByUrl([...catalog.market]).map((item) => ({ ...item, category: "Market Alignment" }));

    const trackPlan = [
      `Step 1: Follow the ${roleTrack} roadmap checkpoint for ${skill}.`,
      `Step 2: Build one project proving ${skill} and publish with measurable impact.`,
      `Step 3: Rehearse two interview stories focused on ${skill} tradeoffs and outcomes.`,
    ];

    return {
      skill,
      urgency: index < 2 ? "High Priority" : "Medium Priority",
      whyItMatters: weaknessHint || `Hiring panels for ${roleTrack} roles evaluate ${skill} as a decision signal for ${level.toLowerCase()} candidates.`,
      roadmapUrl: catalog.roadmap,
      trackPlan,
      resources: [...official, ...practical, ...interview, ...portfolio, ...market],
    };
  });
}

function getVerdict(score) {
  if (score >= 90) {
    return {
      label: "Excellent Fit",
      tone: "good",
      text: "The weighted score suggests the candidate is highly aligned and likely interview-ready with limited validation risk.",
    };
  }
  if (score >= 75) {
    return {
      label: "Strong Fit",
      tone: "good",
      text: "The profile is well aligned, though one or two concerns may still need validation in screening.",
    };
  }
  if (score >= 60) {
    return {
      label: "Moderate Fit",
      tone: "warn",
      text: "There is enough overlap to continue, but the missing proof points are still material.",
    };
  }
  return {
    label: "Weak Fit",
    tone: "danger",
    text: "The role and resume overlap partially, but the strongest requirements still need much better evidence.",
  };
}

function compactEvidence(matchScores) {
  const values = Object.values(matchScores || {});
  return values
    .filter((item) => item?.matched)
    .sort((a, b) => (b?.similarity || 0) - (a?.similarity || 0))
    .slice(0, 3)
    .map((item) => ({
      skill: item.skill,
      evidence: item.evidence_text
        ? `${item.skill} matched via ${item.evidence_type || "resume evidence"}: ${item.evidence_text}`
        : `${item.skill} matched, but the evidence snippet was not captured.`,
      type: item.evidence_type || "resume",
    }));
}

function normalizeEvidenceCards(feedback, fallbackEvidence) {
  const structured = (feedback?.evidence_highlights || []).map((item) => ({
    skill: item.relevance || "Evidence",
    evidence: `${item.project_or_context}: ${item.action}`,
    type: item.impact || "Impact not specified",
  }));

  return structured.length ? structured : fallbackEvidence;
}

function normalizeStrengthSignals(feedback, strengths) {
  const structured = feedback?.strength_signals || [];
  if (structured.length) {
    return structured.map((item) => `${item.signal}: ${item.why_it_matters}`);
  }
  return strengths;
}

function _fullstackScoreCards(feedback) {
  const score = feedback?.fullstack_match_score || {};
  const frontend = score?.frontend_fit;
  const backend = score?.backend_fit;
  const readiness = score?.full_stack_readiness;
  if (!frontend || !backend || !readiness) return [];
  return [
    {
      label: "Frontend Fit",
      value: frontend.score || 0,
      text: `${(frontend.covered || []).slice(0, 3).join(", ") || "Limited direct frontend proof"}`,
    },
    {
      label: "Backend Fit",
      value: backend.score || 0,
      text: `${(backend.covered || []).slice(0, 3).join(", ") || "Limited direct backend proof"}`,
    },
    {
      label: "Full Stack Readiness",
      value: readiness.score || 0,
      text: readiness.insight || "Readiness insight unavailable.",
    },
  ];
}

function _stackMapGroups(feedback) {
  const map = feedback?.semantic_3d_skill_map || {};
  return [
    { label: "Core Nodes", items: map.core_nodes || [] },
    { label: "Connected Nodes", items: map.connected_nodes || [] },
    { label: "Inferred Nodes", items: map.inferred_nodes || [] },
    { label: "Missing Nodes", items: map.missing_nodes || [] },
  ].filter((group) => group.items.length);
}

function _interviewGroups(feedback) {
  const module = feedback?.interview_question_module || {};
  return [
    { label: "Conceptual Questions", items: module.conceptual_questions || [] },
    { label: "Practical Coding Questions", items: module.practical_questions || [] },
    { label: "Scenario-Based Questions", items: module.scenario_questions || [] },
  ].filter((group) => group.items.length);
}

export default function Result({ mode = "candidate", data = {}, resume = {}, feedback = {}, matchResult = null }) {
  const isRagResult = Boolean(matchResult?.match);
  const summary = isRagResult ? matchResult.key_metrics || {} : data?.summary || {};
  const report = isRagResult ? matchResult.candidate_report || {} : {};
  const displayJobRole = data?.job_role || report?.job_role || matchResult?.metadata?.job_role || resume?.job_role || "Target Role";

  const score = isRagResult
    ? Number(matchResult?.match?.score ?? report?.match_percent ?? summary?.overall_score ?? 0)
    : Number(feedback?.score ?? data?.summary?.rank_score ?? data?.summary?.overall_score ?? 0);
  const confidence = isRagResult
    ? Number(matchResult?.match?.confidence ?? 0)
    : Number((data?.confidence?.percent ?? 0) / 100);
  const skillsMatchPercent = isRagResult
    ? Number(report?.skills_match_percent ?? summary?.skill_match_percent ?? Math.round((summary?.skill_match_rate || 0) * 100))
    : Number(summary?.skills_match_percent ?? Math.round((summary?.required_match_rate || 0) * 100));
  const criticalFitPercent = isRagResult
    ? Number(report?.critical_fit_percent ?? summary?.critical_match_percent ?? Math.round((summary?.critical_match_rate || 0) * 100))
    : Number(summary?.critical_fit_percent ?? Math.round((summary?.required_match_rate || 0) * 100));

  const skillMetrics = (isRagResult ? matchResult?.skill_analysis?.matched_skills : Object.values(data?.skill_scores || {}))?.map(
    (item) => item
  ) || [];
  const extractedSkills = isRagResult ? report?.extracted_skills || matchResult?.skill_analysis?.extracted_resume_skills || [] : resume?.skills || [];
  const requiredSkills = isRagResult
    ? report?.required_skills || matchResult?.skill_analysis?.required_jd_skills || []
    : data?.job?.required_skills || [];
  const matchedSkills = isRagResult
    ? report?.matched_skills || matchResult?.skill_analysis?.matched_required_skills || []
    : skillMetrics.filter((item) => item?.matched).map((item) => item.skill);
  const missingSkills = isRagResult ? report?.missing_skills || [] : feedback?.missing_skills || [];
  const strengths = isRagResult ? report?.pros || matchResult?.insights?.strengths || [] : feedback?.strengths || [];
  const weaknesses = isRagResult
    ? report?.cons || matchResult?.insights?.gaps || []
    : (feedback?.risk_signals || []).map((item) =>
      typeof item === "string" ? item : `${item.title} (${item.severity}): ${item.explanation}`
    );
  const improvementItems = isRagResult ? report?.improvements || matchResult?.insights?.recommendations || [] : feedback?.improvements || [];
  const conciseSummary = isRagResult
    ? report?.resume_summary || matchResult?.insights?.summary || matchResult?.match?.interpretation || ""
    : feedback?.candidate_summary || feedback?.summary || `Match score ${score}%`;
  const roleTrack = inferRoleTrack(displayJobRole, requiredSkills);
  const candidateLevel = inferCandidateLevel(resume, displayJobRole);
  const trainingFocus = improvementItems.length ? improvementItems : missingSkills.map((skill) => `Build applied evidence for ${skill}`);
  const strategicTrainingFocus = sanitizeImprovementItems(trainingFocus, roleTrack, missingSkills, weaknesses);
  const prepLinks = feedback?.preparation_plan || [];
  const detailedPlan = feedback?.improvement_plan || {};
  const evidenceCards = normalizeEvidenceCards(feedback, compactEvidence(data?.skill_scores || {}));
  const strengthSignals = normalizeStrengthSignals(feedback, strengths);
  const interviewGroups = _interviewGroups(feedback);
  const upgradeIdeas = feedback?.additional_value_for_candidate || [];
  const missingCriticalSkills = summary?.missing_critical_skills || data?.deal_breakers?.filter((item) => item.type === "missing_required_skill").map((item) => item.skill) || [];
  const verdict = getVerdict(score);
  const recruiterVerdict = score >= 75 ? "Strong Match" : score >= 60 ? "Moderate Match" : "Risky Match";
  const scoreBreakdown = [
    { label: "Core Skills Match", value: Math.round(skillsMatchPercent) },
    { label: "Experience Match", value: Math.round(Number(summary?.experience_score ?? data?.summary?.experience_score ?? 0)) },
    { label: "Project Relevance", value: Math.round(Number(summary?.project_relevance_percent ?? data?.summary?.project_relevance_percent ?? 0)) },
  ];
  const oneLineRankingSummary = [
    matchedSkills.length ? `Strong alignment in ${matchedSkills.slice(0, 2).join(" and ")}` : "Limited direct skill overlap",
    missingSkills.length ? `gap in ${missingSkills.slice(0, 2).join(" / ")}` : "minimal critical skill gaps",
  ].join("; ");
  const preparationHubItems = buildPreparationHubItems({
    prepLinks,
    roleTrack,
    level: candidateLevel,
    missingSkills,
    weaknesses,
  });
  const capabilityScores = {
    technical: Math.round(skillsMatchPercent),
    execution: Math.round(Number(summary?.experience_score ?? data?.summary?.experience_score ?? 0)),
    ownership: Math.min(100, Math.round(evidenceCards.length * 18 + strengthSignals.length * 8 + (detailedPlan?.weekly_plan?.length ? 12 : 0))),
    collaboration: Math.min(
      100,
      Math.round(
        40 +
        strengthSignals.filter((item) => /team|collabor|stakeholder|cross-functional|mento/i.test(item)).length * 18
      )
    ),
  };
  const learningCurveEstimate =
    missingSkills.length <= 1
      ? "Fast ramp (2-4 weeks)"
      : missingSkills.length <= 3
        ? "Moderate ramp (4-8 weeks)"
        : "High ramp (8+ weeks)";

  const classifyRiskSeverity = (text = "") => {
    if (/critical|missing|no|lack|risk|blocker|suspicion|inconsistent|overclaim/i.test(text)) return "High";
    if (/limited|moderate|partial|weak|improve/i.test(text)) return "Medium";
    return "Low";
  };
  const riskSignals = [
    ...missingCriticalSkills.map((skill) => ({ label: `Missing critical skill: ${skill}`, severity: "High" })),
    ...weaknesses.map((item) => ({ label: item, severity: classifyRiskSeverity(item) })),
  ].slice(0, 6);

  const skillGapIntelligence = (missingSkills.length ? missingSkills : missingCriticalSkills)
    .slice(0, 6)
    .map((skill, index) => {
      const related = matchedSkills.find((candidateSkill) => candidateSkill?.[0]?.toLowerCase() === skill?.[0]?.toLowerCase()) || matchedSkills[index] || "No clear substitute signal";
      const difficulty = related === "No clear substitute signal" ? "High" : "Moderate";
      return {
        skill,
        substitute: related,
        difficulty,
        priority: index < 2 ? "P1" : index < 4 ? "P2" : "P3",
      };
    });

  const strategicRecommendations = [
    ...strategicTrainingFocus,
    ...upgradeIdeas.map((item) => `${item.area}: ${item.action}`),
  ].slice(0, 8);

  const interviewReadinessItems = [
    ...interviewGroups.flatMap((group) => group.items.slice(0, 2).map((item) => `${item.question} — ${item.expectation}`)),
    ...riskSignals.slice(0, 2).map((risk) => `Address likely concern: ${risk.label}`),
  ].slice(0, 6);

  const marketReadiness = {
    startupAlignment: Math.min(100, Math.round((capabilityScores.technical * 0.45 + capabilityScores.execution * 0.3 + capabilityScores.ownership * 0.25))),
    enterpriseAlignment: Math.min(100, Math.round((capabilityScores.technical * 0.35 + capabilityScores.execution * 0.4 + capabilityScores.collaboration * 0.25))),
  };

  const hiddenIntelligence = [
    capabilityScores.technical > capabilityScores.execution
      ? "Candidate appears stronger in technical implementation than scaled execution history."
      : "Execution signals are relatively strong and can support production-delivery roles.",
    roleTrack === "Full Stack" && missingSkills.length > 2
      ? "Candidate may deliver faster in frontend-specialized roles before broad full-stack responsibilities."
      : `Candidate profile aligns best with ${roleTrack.toLowerCase()}-leaning responsibilities in the near term.`,
    missingSkills.length
      ? `High-impact upside exists if ${missingSkills.slice(0, 2).join(" and ")} evidence is improved with measurable outcomes.`
      : "Profile is near-market ready; differentiation now depends on stronger portfolio proof and quantified impact.",
    `Parser extracted ${extractedSkills.length} skills from the resume, which ${extractedSkills.length >= 12 ? "supports broader role flexibility." : "suggests room to improve keyword and evidence coverage."}`,
  ];

  // ── NEW: AI Intelligence fields from upgraded feedback ───────────────────────────────
  const aiExec = feedback?.executive_snapshot || {};
  const aiCareer = feedback?.career_trajectory || {};
  const aiBullets = feedback?.bullet_transformation_engine || [];
  const aiObjections = feedback?.recruiter_objection_simulator || [];
  const aiSkillGaps = feedback?.skill_gap_intelligence || [];
  const aiCoverage = feedback?.skill_coverage_map || {};
  const aiAcceleration = feedback?.hirable_acceleration || {};
  const aiPrep = feedback?.preparation_hub || feedback?.preparation_hub_2 || [];
  const aiMarket = feedback?.market_positioning || {};

  const atsScore = Math.round(
    Number(aiExec.ats_score ?? aiCoverage.ats_match_percent ?? summary?.ats_score ?? 0)
  );
  const interviewReadiness = Math.round(
    Number(aiExec.interview_readiness_score ?? summary?.interview_readiness_score ?? 0)
  );
  const marketTier = aiExec.market_tier || "";
  const oneLineVerdict = aiExec.one_line_verdict || "";
  const archetype = aiExec.candidate_archetype || "";
  const hiringVelocity = aiExec.hiring_velocity || "";
  const impressionScore = Math.round(Number(aiExec.recruiter_first_impression_score || 0));
  const credibilityScore = Math.round(Number(aiExec.resume_credibility_score || 0));
  const aiTopStrengths = aiExec.top_3_strengths || [];
  const aiTopRisks = aiExec.top_3_risks || [];

  const mktTierColor = {
    "Premium Hireable": "border-emerald-400/30 bg-emerald-500/12 text-emerald-100",
    "Strong": "border-cyan-400/30 bg-cyan-500/12 text-cyan-100",
    "Competitive": "border-sky-400/30 bg-sky-500/12 text-sky-100",
    "Emerging": "border-amber-400/30 bg-amber-500/12 text-amber-100",
    "Underprepared": "border-rose-400/30 bg-rose-500/12 text-rose-100",
  }[marketTier] || "border-white/10 bg-white/[0.04] text-stone-200";

  const marketPositioningBars = [
    { label: "Startup", key: "startup_readiness" },
    { label: "Enterprise", key: "enterprise_readiness" },
    { label: "Product", key: "product_readiness" },
    { label: "Remote / Global", key: "remote_global_readiness" },
    { label: "Freelance", key: "freelance_readiness" },
    { label: "Leadership", key: "leadership_readiness" },
  ].map(({ label, key }) => ({
    label,
    score: Math.round(Number(aiMarket[key]?.score || 0)),
    blocker: aiMarket[key]?.blocker || "",
    why: aiMarket[key]?.why || "",
  }));

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("ProRes Match Summary", 14, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Candidate: ${data?.candidate || resume?.name || "N/A"}`, 14, 36);
    doc.text(`Role: ${displayJobRole}`, 14, 44);
    doc.text(`Match Score: ${Math.round(score)}%`, 14, 52);
    doc.text(`Skills Match: ${Math.round(skillsMatchPercent)}%`, 14, 60);
    doc.text(`Critical Fit: ${Math.round(criticalFitPercent)}%`, 14, 68);
    doc.text(`Summary:`, 14, 82);
    doc.text(conciseSummary || "No summary available.", 14, 89, { maxWidth: 180 });
    doc.save(`${resume?.name || data?.candidate || "candidate"}_summary.pdf`);
  };



  return (
    <div className="mx-auto w-full max-w-[1700px] space-y-8 px-4 sm:px-6 xl:px-10">
      <section className="rounded-[2.8rem] border border-white/8 bg-[linear-gradient(135deg,rgba(28,21,17,0.96),rgba(19,15,12,0.92))] p-5 sm:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300">
              {mode === "candidate" ? "Candidate Match Report" : "Recruiter Review Report"}
            </p>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
              {data?.candidate || resume?.name || "Candidate"}
            </h2>

            <div className="mt-4 flex flex-wrap gap-2 sm:gap-3 text-xs font-bold uppercase tracking-[0.16em] text-stone-400">
              <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 sm:px-4 py-2">
                <Briefcase size={13} className="mr-2 inline" />
                {displayJobRole}
              </span>
              {resume?.email ? (
                <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 sm:px-4 py-2">
                  <Mail size={13} className="mr-2 inline" />
                  {resume.email}
                </span>
              ) : null}
              {resume?.location ? (
                <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 sm:px-4 py-2">
                  <MapPin size={13} className="mr-2 inline" />
                  {resume.location}
                </span>
              ) : null}
            </div>

            <div className={`mt-6 inline-flex rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] ${verdict.tone === "good"
              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
              : verdict.tone === "warn"
                ? "border border-amber-500/20 bg-amber-500/10 text-amber-100"
                : "border border-rose-500/20 bg-rose-500/10 text-rose-100"
              }`}>
              {verdict.label}
            </div>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-300">{conciseSummary || verdict.text}</p>
          </div>

          <div className="w-full xl:w-[460px] 2xl:w-[500px] shrink-0">
            <AnimatedScoreRing score={Math.round(score)} label={score >= 75 ? "Strong Match" : score >= 60 ? "Moderate Match" : "Needs Improvement"} breakdown={scoreBreakdown} verdict={verdict} />
            <button
              type="button"
              onClick={downloadPDF}
              className="mt-3 w-full rounded-[2rem] bg-amber-300 px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-stone-950 transition hover:bg-amber-200"
            >
              <Download size={14} className="mr-2 inline" />
              Export Summary
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Match Score"
          value={`${Math.round(score)}%`}
          subtext={confidence ? `Confidence ${Math.round(confidence * 100)}%` : "Hybrid exact + semantic fit signal"}
          tone={score >= 80 ? "good" : score >= 60 ? "warn" : "danger"}
        />
        <MetricCard
          label="Skills Match"
          value={`${Math.round(skillsMatchPercent)}%`}
          subtext={`${matchedSkills.length}/${requiredSkills.length || skillMetrics.length || 0} role skills strongly covered`}
          tone={skillsMatchPercent >= 75 ? "good" : skillsMatchPercent >= 55 ? "warn" : "accent"}
        />
        <MetricCard
          label="Critical Fit"
          value={`${Math.round(criticalFitPercent)}%`}
          subtext={criticalFitPercent >= 80 ? "Strong must-have coverage" : "Important skills still need evidence"}
          tone={criticalFitPercent >= 75 ? "good" : criticalFitPercent >= 55 ? "warn" : "danger"}
        />
      </section>

      {/* ── AI INTELLIGENCE COMMAND CENTER ───────────────────────────────────────────── */}
      {(archetype || marketTier || atsScore > 0 || interviewReadiness > 0) ? (
        <section className="relative overflow-hidden rounded-[2.2rem] border border-cyan-500/15 bg-[linear-gradient(135deg,rgba(14,18,30,0.97),rgba(12,16,26,0.96))] p-6 sm:p-8 shadow-[0_12px_48px_rgba(89,208,222,0.08)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(89,208,222,0.07),transparent_55%)]" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">
                <Sparkles size={14} />
                AI Intelligence Report
              </div>
              {marketTier ? (
                <span className={`rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] ${mktTierColor}`}>
                  {marketTier}
                </span>
              ) : null}
              {hiringVelocity ? (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-stone-300">
                  <Rocket size={10} className="mr-1.5 inline" />{hiringVelocity}
                </span>
              ) : null}
            </div>

            {/* Archetype + One-Line Verdict */}
            {(archetype || oneLineVerdict) ? (
              <div className="mb-6 rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
                {archetype ? <p className="text-lg font-black text-white">{archetype}</p> : null}
                {oneLineVerdict ? <p className="mt-2 text-sm leading-6 text-stone-300">{oneLineVerdict}</p> : null}
              </div>
            ) : null}

            {/* 6-Score Intelligence Grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
              {[
                { label: "ATS Score", value: atsScore, icon: Target, good: 75, warn: 55 },
                { label: "Interview Readiness", value: interviewReadiness, icon: UserRoundSearch, good: 70, warn: 50 },
                { label: "Recruiter Impression", value: impressionScore, icon: Gauge, good: 75, warn: 55 },
                { label: "Resume Credibility", value: credibilityScore, icon: ShieldCheck, good: 75, warn: 55 },
                { label: "Skill Coverage", value: Math.round(Number(aiCoverage.semantic_match_percent || score)), icon: Layers3, good: 70, warn: 50 },
                { label: "Differentiation", value: Math.round(Number(aiCoverage.differentiation_score || 0)), icon: ArrowUpRight, good: 65, warn: 45 },
              ].map(({ label, value, icon: Icon, good, warn }) => {
                const tone = value >= good ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-100" : value >= warn ? "border-amber-500/20 bg-amber-500/8 text-amber-50" : "border-rose-500/20 bg-rose-500/8 text-rose-100";
                return (
                  <div key={label} className={`rounded-[1.4rem] border p-4 ${tone}`}>
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] opacity-70 mb-2">
                      <Icon size={12} />{label}
                    </div>
                    <p className="text-3xl font-black">{value}%</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-current opacity-60 transition-all duration-700" style={{ width: `${Math.max(4, value)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Strengths + Risks */}
            {(aiTopStrengths.length > 0 || aiTopRisks.length > 0) ? (
              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                {aiTopStrengths.length > 0 ? (
                  <div className="rounded-[1.6rem] border border-emerald-500/15 bg-emerald-500/6 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300 mb-3">
                      <CheckCircle2 size={12} className="mr-2 inline" />AI-Detected Strengths
                    </p>
                    <div className="space-y-2">
                      {aiTopStrengths.map((s, i) => (
                        <div key={i} className="rounded-xl border border-emerald-500/12 bg-emerald-500/8 px-4 py-3 text-sm leading-5 text-emerald-50">{s}</div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {aiTopRisks.length > 0 ? (
                  <div className="rounded-[1.6rem] border border-rose-500/15 bg-rose-500/6 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-300 mb-3">
                      <XCircle size={12} className="mr-2 inline" />AI-Detected Risks
                    </p>
                    <div className="space-y-2">
                      {aiTopRisks.map((r, i) => (
                        <div key={i} className="rounded-xl border border-rose-500/12 bg-rose-500/8 px-4 py-3 text-sm leading-5 text-rose-50">{r}</div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ── CAREER TRAJECTORY ────────────────────────────────────────────────────────── */}
      {(aiCareer.current_level || aiCareer.fastest_path || aiCareer.salary_range_current) ? (
        <section className="rounded-[1.9rem] border border-amber-500/15 bg-[linear-gradient(135deg,rgba(18,14,10,0.96),rgba(12,10,7,0.95))] p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-300 mb-5">
            <LineChart size={13} className="mr-2 inline" />Career Trajectory Intelligence
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Current Level", value: aiCareer.current_level || "—" },
              { label: "Target Level", value: aiCareer.target_level || "—" },
              { label: "Current Salary Range", value: aiCareer.salary_range_current || "—" },
              { label: "Achievable Salary", value: aiCareer.salary_range_achievable || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-400">{label}</p>
                <p className="mt-2 text-sm font-black text-white">{value}</p>
              </div>
            ))}
          </div>
          {aiCareer.fastest_path ? (
            <div className="mt-4 rounded-[1.3rem] border border-amber-500/15 bg-amber-500/8 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-300 mb-2">Fastest Path</p>
              <p className="text-sm leading-6 text-amber-50">{aiCareer.fastest_path}</p>
            </div>
          ) : null}
          {(aiCareer.promotion_blockers || []).length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {aiCareer.promotion_blockers.map((b, i) => (
                <span key={i} className="rounded-full border border-rose-500/20 bg-rose-500/8 px-3 py-1.5 text-xs font-bold text-rose-100">{b}</span>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {/* ── AI SKILL GAP INTELLIGENCE ─────────────────────────────────────────────────── */}
      {aiSkillGaps.length > 0 ? (
        <section className="rounded-[1.9rem] border border-white/8 bg-[#0e0c0a] p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-stone-400 mb-5">
            <Target size={13} className="mr-2 inline" />AI Skill Gap Intelligence
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {aiSkillGaps.slice(0, 6).map((gap, i) => {
              const sevColor = gap.severity === "Critical" ? "border-rose-500/20 bg-rose-500/8" : gap.severity === "High" ? "border-amber-500/20 bg-amber-500/8" : "border-white/8 bg-white/[0.03]";
              const sevText = gap.severity === "Critical" ? "text-rose-300" : gap.severity === "High" ? "text-amber-300" : "text-stone-300";
              return (
                <div key={i} className={`rounded-[1.4rem] border p-4 ${sevColor}`}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-sm font-black text-white">{gap.skill || gap.gap_type}</p>
                    <span className={`text-[9px] font-black uppercase tracking-[0.16em] ${sevText}`}>{gap.severity}</span>
                  </div>
                  <p className="text-xs leading-5 text-stone-300 mb-2">{gap.why_recruiters_care || gap.how_it_affects_hiring}</p>
                  {gap.exact_fix ? (
                    <div className="mt-2 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2 text-xs text-cyan-100">
                      <span className="font-black text-cyan-300">Fix: </span>{gap.exact_fix}
                      {gap.time_to_fix ? <span className="ml-2 opacity-60">({gap.time_to_fix})</span> : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ── BULLET TRANSFORMATION ENGINE ─────────────────────────────────────────────── */}
      {aiBullets.length > 0 ? (
        <section className="rounded-[1.9rem] border border-white/8 bg-[#0c0b0a] p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-stone-400 mb-5">
            <BookOpen size={13} className="mr-2 inline" />Bullet Transformation Engine
          </p>
          <div className="space-y-4">
            {aiBullets.slice(0, 4).map((bullet, i) => (
              <div key={i} className="rounded-[1.4rem] border border-white/8 bg-white/[0.02] overflow-hidden">
                <div className="flex flex-col">
                  <div className="p-4 bg-emerald-500/[0.04]">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300 mb-2">After (AI Rewrite)</p>
                    <p className="text-sm leading-6 text-emerald-50">{bullet.after}</p>
                  </div>
                </div>
                {bullet.impact_change ? (
                  <div className="border-t border-white/8 px-4 py-2.5">
                    <p className="text-xs text-stone-400"><span className="font-black text-cyan-300">Impact: </span>{bullet.impact_change}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── RECRUITER OBJECTION SIMULATOR ────────────────────────────────────────────── */}
      {aiObjections.length > 0 ? (
        <section className="rounded-[1.9rem] border border-amber-500/12 bg-[linear-gradient(135deg,rgba(14,10,6,0.97),rgba(10,8,5,0.97))] p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-300 mb-5">
            <CircleHelp size={13} className="mr-2 inline" />Recruiter Objection Simulator
          </p>
          <div className="space-y-3">
            {aiObjections.slice(0, 4).map((obj, i) => {
              const sev = obj.severity === "Dealbreaker" ? "border-rose-500/25 bg-rose-500/8" : obj.severity === "High" ? "border-amber-500/20 bg-amber-500/6" : "border-white/8 bg-white/[0.03]";
              const badge = obj.severity === "Dealbreaker" ? "border-rose-500/30 bg-rose-500/15 text-rose-100" : obj.severity === "High" ? "border-amber-500/30 bg-amber-500/12 text-amber-100" : "border-white/10 bg-white/[0.04] text-stone-200";
              return (
                <div key={i} className={`rounded-[1.4rem] border p-4 ${sev}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <p className="text-sm font-black text-white">{obj.concern}</p>
                    <span className={`shrink-0 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${badge}`}>{obj.severity}</span>
                  </div>
                  <div className="mt-2 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-cyan-300 mb-1">Counter Strategy</p>
                    <p className="text-xs leading-5 text-stone-200">{obj.counter_strategy}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ── MARKET POSITIONING BARS ──────────────────────────────────────────────────── */}
      {marketPositioningBars.some(b => b.score > 0) ? (
        <section className="rounded-[1.9rem] border border-white/8 bg-[#0c0b09] p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-stone-400 mb-5">
            <FileStack size={13} className="mr-2 inline" />Market Positioning Readiness
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {marketPositioningBars.map(({ label, score: mScore, blocker, why }) => (
              <div key={label} className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-xs font-black text-stone-300">{label}</p>
                  <span className={`text-sm font-black ${mScore >= 70 ? "text-emerald-300" : mScore >= 50 ? "text-amber-300" : "text-rose-300"}`}>{mScore}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/8 mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${mScore >= 70 ? "bg-emerald-400" : mScore >= 50 ? "bg-amber-400" : "bg-rose-400"}`}
                    style={{ width: `${Math.max(4, mScore)}%` }}
                  />
                </div>
                {blocker ? <p className="text-[10px] text-rose-300 leading-4"><span className="font-black">Blocker: </span>{blocker}</p> : null}
                {why && !blocker ? <p className="text-[10px] text-stone-400 leading-4">{why}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[1.9rem] border border-cyan-500/20 bg-cyan-500/8 p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">Match Verdict</p>
        <div className="mt-3 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-2xl font-black text-white">{recruiterVerdict}</p>
            <p className="mt-2 text-sm leading-7 text-cyan-50">{oneLineRankingSummary}.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-400">Match Score</p>
              <p className="mt-2 text-2xl font-black text-white">{Math.round(score)}%</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-400">Confidence</p>
              <p className="mt-2 text-2xl font-black text-white">{Math.round(confidence * 100)}%</p>
            </div>
          </div>
        </div>
      </section>


      <section className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Strength Signals" icon={Sparkles}>
          <div className="space-y-3">
            {(strengthSignals.length ? strengthSignals : strengths).slice(0, 6).map((item, index) => (
              <div key={`${item}-${index}`} className="rounded-[1.3rem] border border-emerald-500/20 bg-emerald-500/10 p-4">
                <p className="text-sm leading-6 text-emerald-50">{item}</p>
              </div>
            ))}
            <p className="text-xs leading-6 text-emerald-100/80">
              Why this matters: strong architecture and delivery signals reduce onboarding risk and improve short-term team productivity.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Risk Signals" icon={XCircle}>
          <div className="space-y-3">
            {riskSignals.length ? riskSignals.map((item, index) => (
              <div key={`${item.label}-${index}`} className="rounded-[1.3rem] border border-rose-500/20 bg-rose-500/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-bold text-rose-50">{item.label}</p>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${item.severity === "High"
                    ? "border border-rose-400/40 bg-rose-500/20 text-rose-100"
                    : item.severity === "Medium"
                      ? "border border-amber-400/40 bg-amber-500/20 text-amber-100"
                      : "border border-cyan-400/40 bg-cyan-500/20 text-cyan-100"
                    }`}>
                    {item.severity}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-sm leading-6 text-stone-400">No major risk signals were detected.</p>
            )}
          </div>
        </SectionCard>
      </section>

      <SectionCard title="Capability Snapshot" icon={Gauge}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Technical" value={`${capabilityScores.technical}%`} subtext="Skill and stack alignment" tone="good" />
          <MetricCard label="Execution" value={`${capabilityScores.execution}%`} subtext="Experience and delivery depth" tone="accent" />
          <MetricCard label="Ownership" value={`${capabilityScores.ownership}%`} subtext="Initiative and scope signals" tone="warn" />
          <MetricCard label="Collaboration" value={`${capabilityScores.collaboration}%`} subtext="Team and cross-functional evidence" tone="default" />
          <MetricCard label="Learning Curve" value={learningCurveEstimate} subtext={`${candidateLevel} trajectory for ${roleTrack}`} tone="accent" />
        </div>
      </SectionCard>

      <SectionCard title="Evidence Highlights" icon={ArrowUpRight}>
        {evidenceCards.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {evidenceCards.map((item, index) => (
              <div key={`${item.skill}-${item.type}`} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm font-black text-white">{item.skill}</p>
                <p className="mt-2 text-sm leading-6 text-stone-300">{item.evidence}</p>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.15em] text-cyan-200">
                  {index % 2 ? "Experience Validation" : "Project Proof Point"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-stone-500">Evidence highlights will appear when resume-to-role matches are extracted.</p>
        )}
      </SectionCard>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Skill Gap Intelligence" icon={Flame}>
          <div className="space-y-3">
            {skillGapIntelligence.length ? skillGapIntelligence.map((item) => (
              <div key={item.skill} className="rounded-[1.3rem] border border-amber-500/20 bg-amber-500/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-black text-white">{item.skill}</p>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-stone-200">
                    {item.priority}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-stone-200">Substitute signal: {item.substitute}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-amber-100">Learning difficulty: {item.difficulty}</p>
              </div>
            )) : (
              <p className="text-sm leading-6 text-stone-400">No high-priority skill gaps detected.</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Strategic Recommendations (Interactive Action Board)" icon={Target}>
          <div className="space-y-3">
            {strategicRecommendations.length ? strategicRecommendations.map((item, index) => (
              <ActionableRecommendation key={`${item}-${index}`} item={item} />
            )) : (
              <p className="text-sm leading-6 text-stone-400">Recommendations will populate as soon as role-specific gaps are detected.</p>
            )}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Interview Readiness Intelligence" icon={UserRoundSearch}>
          <div className="space-y-3">
            {interviewReadinessItems.length ? interviewReadinessItems.map((item, index) => (
              <div key={`${item}-${index}`} className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm leading-6 text-stone-200">{item}</p>
              </div>
            )) : (
              <p className="text-sm leading-6 text-stone-400">Interview prompts and weak spots were not generated for this profile yet.</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Market Readiness" icon={LineChart}>
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="Startup Alignment"
              value={`${marketReadiness.startupAlignment}%`}
              subtext={`${marketReadiness.startupAlignment >= 75 ? "High" : "Moderate"} fit with fast-iteration role expectations`}
              tone={marketReadiness.startupAlignment >= 75 ? "good" : "warn"}
            />
            <MetricCard
              label="Enterprise Alignment"
              value={`${marketReadiness.enterpriseAlignment}%`}
              subtext={`${marketReadiness.enterpriseAlignment >= 75 ? "High" : "Moderate"} fit with structured delivery environments`}
              tone={marketReadiness.enterpriseAlignment >= 75 ? "good" : "warn"}
            />
          </div>
          <p className="mt-3 text-sm leading-6 text-stone-300">
            Hiring readiness level: {Math.round((marketReadiness.startupAlignment + marketReadiness.enterpriseAlignment) / 2)}% composite across market expectations.
          </p>
        </SectionCard>
      </section>

      <SectionCard title="What Else Should I Know?" icon={CircleHelp}>
        <InsightList items={hiddenIntelligence} emptyText="No additional strategic intelligence generated yet." tone="amber" />
      </SectionCard>

      {aiPrep.length > 0 ? (
        <section className="rounded-[2.2rem] border border-cyan-500/15 bg-[linear-gradient(135deg,rgba(14,18,30,0.97),rgba(12,16,26,0.96))] p-6 sm:p-8 shadow-[0_12px_48px_rgba(89,208,222,0.08)] relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(89,208,222,0.07),transparent_55%)]" />
          <div className="relative">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300 mb-3">
              <BookOpen size={14} />
              Preparation Hub
            </div>
            <p className="mb-6 text-sm leading-6 text-stone-300 max-w-3xl">
              A precise, action-oriented roadmap designed to eliminate your specific skill gaps and elevate your profile to premium hireable status.
            </p>

            <div className="space-y-6">
              {aiPrep.map((plan, i) => (
                <div key={i} className="rounded-[1.6rem] border border-white/8 bg-white/[0.02] p-5 lg:p-6 overflow-hidden">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                      <Target size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">Addressing Gap</p>
                      <p className="text-lg font-black text-white">{plan.weakness}</p>
                    </div>
                  </div>
                  
                  {/* Timeline Roadmap */}
                  <div className="grid gap-4 lg:grid-cols-3 mb-6">
                    <div className="rounded-[1.2rem] border border-emerald-500/15 bg-emerald-500/5 p-5 relative overflow-hidden transition-all hover:bg-emerald-500/10">
                      <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/10 blur-xl rounded-full" />
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300 mb-3">7-Day Fix</p>
                      <p className="text-sm leading-6 text-stone-200">{plan.fix_7_day}</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-cyan-500/15 bg-cyan-500/5 p-5 relative overflow-hidden transition-all hover:bg-cyan-500/10">
                      <div className="absolute -right-4 -top-4 w-16 h-16 bg-cyan-500/10 blur-xl rounded-full" />
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300 mb-3">30-Day Upgrade</p>
                      <p className="text-sm leading-6 text-stone-200">{plan.upgrade_30_day}</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-amber-500/15 bg-amber-500/5 p-5 relative overflow-hidden transition-all hover:bg-amber-500/10">
                      <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/10 blur-xl rounded-full" />
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-300 mb-3">90-Day Leap</p>
                      <p className="text-sm leading-6 text-stone-200">{plan.career_leap_90_day}</p>
                    </div>
                  </div>

                  {/* Strategic Execution Grid */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4 hover:border-white/15 transition-all">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-stone-500 mb-2">High-ROI Project</p>
                      <p className="text-xs leading-5 text-stone-300">{plan.best_project}</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4 hover:border-white/15 transition-all">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-stone-500 mb-2">Portfolio Proof</p>
                      <p className="text-xs leading-5 text-stone-300">{plan.best_portfolio_proof}</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4 hover:border-white/15 transition-all">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-stone-500 mb-2">Interview Narrative</p>
                      <p className="text-xs leading-5 text-stone-300">{plan.interview_narrative}</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4 hover:border-white/15 transition-all">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-stone-500 mb-2">LinkedIn Branding</p>
                      <p className="text-xs leading-5 text-stone-300">{plan.linkedin_branding}</p>
                    </div>
                  </div>

                  {plan.best_certification && (
                    <div className="mt-3 rounded-[1.2rem] border border-cyan-500/10 bg-cyan-500/5 p-4 flex items-center justify-between gap-4">
                       <div>
                         <p className="text-[9px] font-black uppercase tracking-[0.16em] text-cyan-500/70 mb-1">Top Certification Endorsement</p>
                         <p className="text-xs font-black text-cyan-100">{plan.best_certification}</p>
                       </div>
                       <div className="h-8 w-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-300">
                         <ShieldCheck size={14} />
                       </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <SectionCard title="Skill Coverage Map" icon={GitBranch}>
        <p className="mb-4 text-sm leading-6 text-stone-400">
          This map supports the intelligence sections above by showing direct, partial, and missing skill proof.
        </p>
        <SkillChart scores={data?.skill_scores || {}} matchResult={isRagResult ? matchResult : null} />
      </SectionCard>
    </div>
  );
}
