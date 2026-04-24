import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Download,
  ExternalLink,
  FileStack,
  Flame,
  Gauge,
  GitBranch,
  Layers3,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRoundSearch,
  XCircle,
} from "lucide-react";
import SkillChart from "./SkillChart";

function MetricCard({ label, value, subtext = "", tone = "default" }) {
  const toneClasses = {
    default: "border-white/8 bg-white/[0.03] text-white",
    good: "border-emerald-500/15 bg-emerald-500/8 text-emerald-50",
    warn: "border-amber-500/15 bg-amber-500/8 text-amber-50",
    danger: "border-rose-500/15 bg-rose-500/8 text-rose-50",
    accent: "border-cyan-500/15 bg-cyan-500/8 text-cyan-50",
  };

  return (
    <div className={`rounded-[1.8rem] border p-5 shadow-[0_10px_34px_rgba(0,0,0,0.14)] ${toneClasses[tone]}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">{label}</p>
      <p className="mt-3 text-3xl font-black">{value}</p>
      {subtext ? <p className="mt-2 text-xs leading-5 text-stone-400">{subtext}</p> : null}
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, aside = null }) {
  return (
    <section className="rounded-[2.2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(25,19,15,0.95),rgba(20,15,12,0.9))] p-6 shadow-[0_16px_44px_rgba(0,0,0,0.2)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-stone-400">
          {Icon ? <Icon size={15} /> : null}
          {title}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

function TagGrid({ items, emptyText, tone = "default" }) {
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
          className={`rounded-full border px-3 py-2 text-xs font-bold ${toneClasses[tone]}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function InsightList({ items, emptyText, tone = "accent" }) {
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
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className={`rounded-[1.5rem] border p-4 text-sm leading-6 ${tones[tone]}`}>
          {item}
        </div>
      ))}
    </div>
  );
}

function AnimatedScoreRing({ score, label, breakdown = [], verdict }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const duration = 900;
    const start = performance.now();
    let raf = 0;

    const tick = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(score * eased));
      if (progress < 1) {
        raf = window.requestAnimationFrame(tick);
      }
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [score]);

  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(89,208,222,0.14),transparent_35%),linear-gradient(180deg,rgba(18,15,13,0.96),rgba(11,10,9,0.92))] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)]" />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative mx-auto grid h-[180px] w-[180px] place-items-center lg:mx-0">
          <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
            <circle cx="80" cy="80" r={radius} fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke={score >= 80 ? "#4cc890" : score >= 60 ? "#f5bd4e" : "#f66f7b"}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 160ms linear" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-stone-500">Semantic Fit</p>
              <p className="mt-2 text-5xl font-black text-white">{displayScore}%</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">{label}</p>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">
            <Gauge size={13} className="mr-2" />
            {verdict?.label || "Match"}
          </div>
          <p className="mt-4 max-w-xl text-sm leading-7 text-stone-300">
            This score blends semantic skill alignment, visible execution history, and project relevance rather than raw keyword overlap.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {breakdown.map((item, index) => (
              <div
                key={item.label}
                className="animate-fade-up rounded-[1.4rem] border border-white/8 bg-white/[0.04] p-4"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">{item.label}</p>
                <p className="mt-2 text-2xl font-black text-white">{item.value}%</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#59d0de,#f5bd4e)] transition-all duration-700"
                    style={{ width: `${Math.max(8, item.value)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
                      className={`rounded-full border px-3 py-2 text-xs font-bold ${toneFor(group.label)} ${
                        item.intensity === "strong" ? "shadow-[0_0_18px_rgba(89,208,222,0.16)]" : ""
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
            className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${
              current?.label === group.label
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

function normalizeBlueprint(feedback, requiredSkills) {
  const blueprint = feedback?.role_skill_blueprint || {};
  if (
    blueprint?.core_skills?.length ||
    blueprint?.supporting_skills?.length ||
    blueprint?.advanced_optional_skills?.length ||
    blueprint?.adjacent_skills?.length ||
    blueprint?.irrelevant_or_low_relevance_skills?.length ||
    blueprint?.integration_skills?.length ||
    blueprint?.supporting_tools?.length
  ) {
    return [
      { label: "Core Skills", items: blueprint.core_skills || [] },
      { label: "Integration Skills", items: blueprint.integration_skills || [] },
      { label: "Supporting Tools", items: blueprint.supporting_tools || [] },
      { label: "Adjacent Skills", items: blueprint.adjacent_skills || blueprint.supporting_skills || [] },
      { label: "Advanced Skills", items: blueprint.advanced_optional_skills || [] },
      { label: "Low-Relevance Skills", items: blueprint.irrelevant_or_low_relevance_skills || [] },
    ].filter((group) => group.items.length);
  }

  return requiredSkills?.length
    ? [{ label: "Core Skills", items: requiredSkills.map((skill) => ({ skill, why_it_matters: "Direct requirement from the job description." })) }]
    : [];
}

function normalizeStrengthSignals(feedback, strengths) {
  const structured = feedback?.strength_signals || [];
  if (structured.length) {
    return structured.map((item) => `${item.signal}: ${item.why_it_matters}`);
  }
  return strengths;
}

function semanticSections(feedback) {
  const semantic = feedback?.semantic_skill_matching || {};
  return [
    { label: "Direct Matches", items: semantic.direct_matches || [] },
    { label: "Inferred Matches", items: semantic.inferred_matches || [] },
    { label: "Weak / Unproven", items: semantic.weak_unproven_matches || [] },
  ].filter((group) => group.items.length);
}

function gapSections(feedback) {
  const smart = feedback?.skill_gap_intelligence || {};
  return [
    { label: "Completely Missing", items: smart.completely_missing || [] },
    { label: "Weak Evidence", items: smart.weak_evidence || [] },
    { label: "Likely Known", items: smart.likely_known || [] },
  ].filter((group) => group.items.length);
}

function toolSections(feedback) {
  const filter = feedback?.tool_relevance_filter || {};
  return [
    { label: "Highly Relevant", items: filter.highly_relevant || [] },
    { label: "Indirectly Relevant", items: filter.indirectly_relevant || [] },
    { label: "Not Relevant", items: filter.not_relevant || [] },
  ].filter((group) => group.items.length);
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
  const whySuitable = isRagResult ? strengths.slice(0, 3) : feedback?.why_candidate_fits || data?.summary?.shortlist_reasons || strengths.slice(0, 3);
  const trainingFocus = improvementItems.length ? improvementItems : missingSkills.map((skill) => `Build applied evidence for ${skill}`);
  const prepLinks = feedback?.preparation_plan || [];
  const detailedPlan = feedback?.improvement_plan || {};
  const evidenceCards = normalizeEvidenceCards(feedback, compactEvidence(data?.skill_scores || {}));
  const skillBlueprint = normalizeBlueprint(feedback, requiredSkills);
  const strengthSignals = normalizeStrengthSignals(feedback, strengths);
  const semanticMatchGroups = semanticSections(feedback);
  const smartGapGroups = gapSections(feedback);
  const toolGroups = toolSections(feedback);
  const upgradeIdeas = feedback?.additional_value_for_candidate || [];
  const missingCriticalSkills = summary?.missing_critical_skills || data?.deal_breakers?.filter((item) => item.type === "missing_required_skill").map((item) => item.skill) || [];
  const whyScoreItems = [
    `${summary?.exact_match_count ?? 0} exact matches strengthen score confidence.`,
    missingCriticalSkills.length
      ? `${missingCriticalSkills.length} critical skills are still missing: ${missingCriticalSkills.slice(0, 3).join(", ")}.`
      : "No critical skill blockers were detected.",
    `Experience confidence is ${Math.round(Number(summary?.experience_confidence_score ?? 0))}% with recency score ${Math.round(Number(summary?.recency_score ?? 0))}%.`,
  ];
  const reliability = summary?.reliability_metrics || {};
  const verdict = getVerdict(score);
  const scoreBreakdown = [
    { label: "Core Skills Match", value: Math.round(skillsMatchPercent) },
    { label: "Experience Match", value: Math.round(Number(summary?.experience_score ?? data?.summary?.experience_score ?? 0)) },
    { label: "Project Relevance", value: Math.round(Number(summary?.project_relevance_percent ?? data?.summary?.project_relevance_percent ?? 0)) },
  ];

  const documentStats = resume?._document_stats || {
    skills: extractedSkills.length,
    experience_entries: Array.isArray(resume?.experience) ? resume.experience.length : 0,
    education_entries: Array.isArray(resume?.education) ? resume.education.length : 0,
    project_entries: Array.isArray(resume?.projects) ? resume.projects.length : 0,
    certifications: Array.isArray(resume?.certifications) ? resume.certifications.length : 0,
  };

  const parsedProfileRows = [
    { label: "Skills", value: documentStats.skills || extractedSkills.length || 0 },
    { label: "Experience", value: documentStats.experience_entries || 0 },
    { label: "Projects", value: documentStats.project_entries || 0 },
    { label: "Education", value: documentStats.education_entries || 0 },
    { label: "Certifications", value: documentStats.certifications || 0 },
  ];

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
    <div className="space-y-6">
      <section className="rounded-[2.8rem] border border-white/8 bg-[linear-gradient(135deg,rgba(28,21,17,0.96),rgba(19,15,12,0.92))] p-8 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300">
              {mode === "candidate" ? "Candidate Match Report" : "Recruiter Review Report"}
            </p>
            <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-white md:text-5xl">
              {data?.candidate || resume?.name || "Candidate"}
            </h2>

            <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.16em] text-stone-400">
              <span className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2">
                <Briefcase size={13} className="mr-2 inline" />
                {displayJobRole}
              </span>
              {resume?.email ? (
                <span className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2">
                  <Mail size={13} className="mr-2 inline" />
                  {resume.email}
                </span>
              ) : null}
              {resume?.location ? (
                <span className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2">
                  <MapPin size={13} className="mr-2 inline" />
                  {resume.location}
                </span>
              ) : null}
            </div>

            <div className={`mt-6 inline-flex rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] ${
              verdict.tone === "good"
                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
                : verdict.tone === "warn"
                  ? "border border-amber-500/20 bg-amber-500/10 text-amber-100"
                  : "border border-rose-500/20 bg-rose-500/10 text-rose-100"
            }`}>
              {verdict.label}
            </div>

            <p className="mt-4 text-sm leading-7 text-stone-300">{conciseSummary || verdict.text}</p>
            <p className="mt-3 text-sm leading-7 text-stone-400">{verdict.text}</p>
          </div>

          <div className="xl:w-[420px]">
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

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Why This Score" icon={Gauge}>
          <div className="space-y-3">
            {whyScoreItems.map((item, index) => (
              <div key={`${item}-${index}`} className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-stone-200">
                {item}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Reliability Snapshot" icon={ShieldCheck}>
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard label="Precision@K" value={`${Math.round(Number(reliability.precision_at_1 ?? 0))}%`} subtext="Top-rank quality proxy" tone="accent" />
            <MetricCard label="NDCG" value={`${Math.round(Number(reliability.ndcg ?? 0))}%`} subtext="Ranking consistency proxy" tone="accent" />
            <MetricCard label="Skill Accuracy" value={`${Math.round(Number(reliability.skill_match_accuracy ?? 0))}%`} subtext="Role-skill alignment quality" tone="good" />
            <MetricCard label="Exp. Confidence" value={`${Math.round(Number(reliability.experience_confidence ?? summary?.experience_confidence_score ?? 0))}%`} subtext="Date parsing confidence" tone="warn" />
          </div>
        </SectionCard>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <SectionCard
            title="Parsed Resume Snapshot"
            icon={FileStack}
            aside={
              <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-stone-400">
                Structured Extraction
              </span>
            }
          >
            <p className="mb-4 text-sm leading-6 text-stone-400">
              The parser standardizes the resume before scoring, so recruiters and candidates can inspect what the system actually understood.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {parsedProfileRows.map((item) => (
                <div key={item.label} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Why This Candidate Fits" icon={ShieldCheck}>
            <InsightList
              items={whySuitable}
              emptyText={mode === "candidate" ? "Fit rationale will appear after analysis." : "No recruiter-facing rationale was generated yet."}
              tone="success"
            />
          </SectionCard>

          <SectionCard title="Evidence Highlights" icon={ArrowUpRight}>
            {evidenceCards.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {evidenceCards.map((item, index) => (
                  <div
                    key={`${item.skill}-${item.type}`}
                    className="animate-fade-up rounded-[1.5rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/8 bg-[#120f0d] px-3 py-1 text-sm">
                        {index % 3 === 0 ? "🚀" : index % 3 === 1 ? "📊" : "💡"}
                      </span>
                      <span className="rounded-full border border-emerald-500/18 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-100">
                        {item.skill}
                      </span>
                      <span className="rounded-full border border-white/8 bg-[#120f0d] px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-stone-400">
                        {item.type}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-stone-300">{item.evidence}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-stone-500">Evidence snippets will appear when strong semantic matches are found.</p>
            )}
          </SectionCard>

          {semanticMatchGroups.length ? (
            <SectionCard title="Semantic Skill Matching" icon={GitBranch}>
              <SkillConstellation groups={semanticMatchGroups} />
            </SectionCard>
          ) : null}

          <SectionCard title="Skill Coverage Map" icon={Target}>
            <p className="mb-4 text-sm leading-6 text-stone-400">
              Each job skill is matched against resume evidence. Strong fits, partial fits, and gaps are separated visually for faster review.
            </p>
            <SkillChart scores={data?.skill_scores || {}} matchResult={isRagResult ? matchResult : null} />
          </SectionCard>

          <SectionCard title="Improvement Plan" icon={TrendingUp}>
            <div className="space-y-4">
              <InsightList items={trainingFocus} emptyText="No improvement recommendations yet." tone="accent" />
              {detailedPlan?.ranked_missing_skills?.length ? (
                <div className="space-y-3">
                  {detailedPlan.ranked_missing_skills.map((item) => (
                    <div key={item.skill} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-black text-white">{item.skill}</p>
                        <span className="rounded-full border border-amber-500/20 bg-amber-500/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-100">
                          Rank {item.importance_rank}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-stone-300">{item.why_it_matters}</p>
                    </div>
                  ))}
                </div>
              ) : null}
              <ImprovementAccordion steps={detailedPlan?.actionable_steps || []} />
            </div>
          </SectionCard>

          <SectionCard title="Preparation Links" icon={BookOpen}>
            <div className="space-y-3">
              {prepLinks.map((item) => (
                <div key={item.skill || item.label} className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-sm font-black text-white">{item.skill || item.label}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {(item.resources || []).map((resource) => (
                      <a
                        key={resource.url}
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-cyan-500/20 bg-cyan-500/8 px-3 py-2 text-xs font-bold text-cyan-100 transition hover:bg-cyan-500/14"
                      >
                        {resource.title} <ExternalLink size={12} className="ml-2 inline" />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Role Skill Blueprint" icon={Briefcase}>
            <BlueprintTabs groups={skillBlueprint} />
          </SectionCard>

          <SectionCard title="Matched Skills" icon={CheckCircle2}>
            <TagGrid items={matchedSkills} emptyText="No strong matching skills were found yet." tone="success" />
          </SectionCard>

          <SectionCard title="Missing Skills" icon={XCircle}>
            <TagGrid items={missingSkills} emptyText="No major missing skills identified." tone="warn" />
          </SectionCard>

          {smartGapGroups.length ? (
            <SectionCard title="Skill Gap Heatmap" icon={Flame}>
              <GapHeatmap groups={smartGapGroups} />
            </SectionCard>
          ) : null}

          <SectionCard title="Extracted Resume Skills" icon={UserRoundSearch}>
            <TagGrid items={extractedSkills} emptyText="No resume skills were extracted." tone="default" />
          </SectionCard>

          {toolGroups.length ? (
            <SectionCard title="Tool Relevance Filter" icon={Layers3}>
              <div className="space-y-4">
                {toolGroups.map((group) => (
                  <div key={group.label}>
                    <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">{group.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={`${group.label}-${item.skill}`}
                          title={item.reason}
                          className={`rounded-full border px-3 py-2 text-xs font-bold ${
                            group.label === "Highly Relevant"
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
                              : group.label === "Indirectly Relevant"
                                ? "border-amber-500/20 bg-amber-500/10 text-amber-100"
                                : "border-rose-500/20 bg-rose-500/10 text-rose-100"
                          }`}
                        >
                          {item.skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          <SectionCard title="Strength Signals" icon={Sparkles}>
            <div className="space-y-3">
              {strengthSignals.length ? strengthSignals.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="animate-fade-up rounded-[1.4rem] border border-emerald-500/14 bg-[linear-gradient(180deg,rgba(76,200,144,0.1),rgba(76,200,144,0.05))] p-4 shadow-[0_0_22px_rgba(76,200,144,0.08)]"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <p className="text-sm leading-6 text-emerald-50">{item}</p>
                </div>
              )) : (
                <p className="text-sm leading-6 text-stone-500">No major strengths were generated yet.</p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Risk Signals" icon={XCircle}>
            <InsightList items={weaknesses} emptyText="No major risk areas highlighted." tone="rose" />
          </SectionCard>

          {upgradeIdeas.length ? (
            <SectionCard title="Candidate Upgrades" icon={ArrowUpRight}>
              <UpgradeScore score={Math.round(score)} ideas={upgradeIdeas} />
              <div className="space-y-3">
                {upgradeIdeas.map((item, index) => (
                  <div
                    key={item.area}
                    className="animate-fade-up rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <p className="text-sm font-black text-white">{item.area}</p>
                    <p className="mt-2 text-sm leading-6 text-stone-300">{item.action}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          {detailedPlan?.weekly_plan?.length ? (
            <SectionCard title="Weekly Roadmap" icon={Target}>
              <div className="space-y-3">
                {detailedPlan.weekly_plan.map((item) => (
                  <div key={`${item.week}-${item.goal}`} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">Week {item.week}</p>
                    <p className="mt-2 text-sm font-black text-white">{item.goal}</p>
                    <p className="mt-2 text-sm leading-6 text-stone-300">{item.deliverable}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}
        </div>
      </div>
    </div>
  );
}
