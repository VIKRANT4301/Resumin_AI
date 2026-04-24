import { useMemo, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  ChevronDown,
  CircleHelp,
  Eye,
  GitCompareArrows,
  GitFork,
  GraduationCap,
  Info,
  Radar,
  Sparkles,
  Star,
  Target,
  ThumbsDown,
  ThumbsUp,
  TimerReset,
} from "lucide-react";

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Number(value || 0)));
}

function scoreTone(score) {
  if (score >= 80) return { ring: "#4cc890", text: "text-emerald-200", pill: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100" };
  if (score >= 60) return { ring: "#f5bd4e", text: "text-amber-200", pill: "border-amber-300/20 bg-amber-300/10 text-amber-100" };
  return { ring: "#fb7185", text: "text-rose-200", pill: "border-rose-300/20 bg-rose-300/10 text-rose-100" };
}

function severityClasses(level) {
  if (level === "green" || level === "strong") return "border-emerald-300/18 bg-emerald-300/10 text-emerald-100";
  if (level === "yellow" || level === "weak_evidence" || level === "missing") return "border-amber-300/18 bg-amber-300/10 text-amber-100";
  return "border-rose-300/18 bg-rose-300/10 text-rose-100";
}

function toPercent(value, fallback = 0) {
  if (typeof value === "number" && value <= 1) return Math.round(value * 100);
  return Math.round(Number.isFinite(Number(value)) ? Number(value) : fallback);
}

function ProgressOrb({ score, confidence, rank, flagged }) {
  const bounded = clamp(score);
  const tone = scoreTone(bounded);
  const ringStyle = {
    background: `conic-gradient(from 210deg, rgba(255,255,255,0.1) 0deg, rgba(255,255,255,0.1) ${360 - bounded * 3.6}deg, ${tone.ring} ${360 - bounded * 3.6}deg, rgba(255,255,255,0.88) 360deg)`,
  };

  return (
    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
      <div className="relative mx-auto h-[210px] w-[210px]">
        <Motion.div
          initial={{ scale: 0.92, opacity: 0.7, rotate: -12 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0 rounded-full p-3 shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
          style={ringStyle}
        >
          <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),rgba(14,12,10,0.96)_58%)] text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">Match Score</p>
            <p className={`mt-2 text-6xl font-black ${tone.text}`}>{bounded}</p>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-stone-400">
              {bounded >= 80 ? "Strong" : bounded >= 60 ? "Moderate" : "Weak"}
            </p>
          </div>
        </Motion.div>
      </div>

      <div className="grid gap-3 self-center sm:grid-cols-3">
        <HeroMetric label="Confidence" value={`${toPercent(confidence?.percent)}%`} hint={confidence?.label || "Moderate"} />
        <HeroMetric label="Rank Position" value={`#${rank || 0}`} hint="Live ranking" />
        <HeroMetric
          label="Deal Breaker"
          value={flagged ? "Flagged" : "Clear"}
          hint={flagged ? "Needs review" : "No blocker"}
          tone={flagged ? "danger" : "success"}
        />
      </div>
    </div>
  );
}

function HeroMetric({ label, value, hint, tone = "default" }) {
  const toneClass =
    tone === "danger"
      ? "border-rose-300/14 bg-rose-300/10"
      : tone === "success"
        ? "border-emerald-300/14 bg-emerald-300/10"
        : "border-white/8 bg-white/[0.03]";
  return (
    <div className={`rounded-[1.4rem] border p-4 ${toneClass}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-stone-400">{hint}</p>
    </div>
  );
}

function DashboardSummary({ candidate }) {
  const bullets = candidate?.rankingExplanation?.bullets || candidate?.fitBullets || [];

  return (
    <div className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(19,16,13,0.9),rgba(12,10,8,0.94))] p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">
          <CircleHelp size={14} />
          Why This Score?
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-stone-300">
          Decision Support
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-stone-300">
        {candidate?.rankingExplanation?.summary || "This ranking blends must-have skills, evidence depth, and recruiter-visible proof."}
      </p>
      <div className="mt-4 space-y-3">
        {bullets.slice(0, 4).map((bullet, index) => (
          <div key={`${candidate.id}-bullet-${index}`} className="rounded-[1.1rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-stone-200">
            {bullet}
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillGraphPanel({ graph }) {
  const required = graph?.groups?.required || [];
  const candidate = graph?.groups?.candidate || [];
  const inferred = graph?.groups?.inferred || [];
  const missing = graph?.groups?.missing || [];
  const edges = graph?.edges || [];
  const nodes = [
    ...required.map((node, index) => ({ ...node, x: 110, y: 70 + index * 64 })),
    ...candidate.map((node, index) => ({ ...node, x: 360, y: 50 + index * 58 })),
    ...inferred.map((node, index) => ({ ...node, x: 590, y: 80 + index * 68 })),
    ...missing.map((node, index) => ({ ...node, x: 360, y: 360 + index * 52 })),
  ];
  const lookup = Object.fromEntries(nodes.map((node) => [node.id, node]));

  const toneForNode = (type) => {
    if (type === "required") return "fill-[#16211d] stroke-[#6ee7b7]";
    if (type === "candidate") return "fill-[#11242a] stroke-[#67e8f9]";
    if (type === "inferred") return "fill-[#2b2112] stroke-[#f5bd4e]";
    return "fill-[#241315] stroke-[#fb7185]";
  };

  if (!nodes.length) {
    return <p className="text-sm leading-6 text-stone-500">Skill graph becomes visible when job skills and resume evidence are available.</p>;
  }

  return (
    <div className="rounded-[1.8rem] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.1),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-stone-400">
        <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1">Required</span>
        <span className="rounded-full border border-cyan-300/16 bg-cyan-300/10 px-3 py-1 text-cyan-100">Candidate</span>
        <span className="rounded-full border border-amber-300/16 bg-amber-300/10 px-3 py-1 text-amber-100">Inferred</span>
        <span className="rounded-full border border-rose-300/16 bg-rose-300/10 px-3 py-1 text-rose-100">Missing</span>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox="0 0 720 560" className="h-[420px] min-w-[720px] w-full">
          {edges.map((edge, index) => {
            const from = lookup[edge.from];
            const to = lookup[edge.to];
            if (!from || !to) return null;
            const dashArray = edge.type === "exact" ? "0" : edge.type === "semantic" ? "5 7" : "2 8";
            const strokeWidth = edge.type === "exact" ? 4 : 2;
            const stroke = edge.type === "exact" ? "#6ee7b7" : edge.type === "semantic" ? "#67e8f9" : "#f5bd4e";
            return (
              <path
                key={`${edge.from}-${edge.to}-${index}`}
                d={`M ${from.x + 58} ${from.y + 18} C ${from.x + 140} ${from.y + 18}, ${to.x - 90} ${to.y + 18}, ${to.x} ${to.y + 18}`}
                fill="none"
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray}
                strokeOpacity={0.85}
              >
                <title>{edge.explanation}</title>
              </path>
            );
          })}

          {nodes.map((node) => (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              <rect
                rx="18"
                ry="18"
                width="116"
                height="36"
                className={toneForNode(node.type)}
                strokeWidth="1.8"
                fillOpacity={node.type === "missing" ? 0.35 : 0.9}
                style={{ filter: `drop-shadow(0 0 ${Math.max(8, Number(node.confidence || 0) * 24)}px rgba(103,232,249,0.18))` }}
              />
              <text x="58" y="22" textAnchor="middle" className="fill-white text-[11px] font-black tracking-[0.12em]">
                {node.label}
              </text>
              <title>{`${node.label} • confidence ${toPercent(node.confidence)}%`}</title>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function SkillBreakdownPanel({ candidate }) {
  const groups = [
    { label: "Exact Matches", tone: "bg-emerald-400", items: candidate?.skillBreakdown?.exact_matches || [] },
    { label: "Semantic Matches", tone: "bg-cyan-400", items: candidate?.skillBreakdown?.semantic_matches || [] },
    { label: "Missing Skills", tone: "bg-rose-400", items: candidate?.skillBreakdown?.missing_skills || [] },
    { label: "Inferred Skills", tone: "bg-amber-300", items: candidate?.skillBreakdown?.inferred_skills || [] },
  ];
  const [open, setOpen] = useState(groups[0]?.label || "");
  const total = Math.max(1, groups.reduce((sum, group) => sum + group.items.length, 0));

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.label} className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
          <button type="button" onClick={() => setOpen(open === group.label ? "" : group.label)} className="w-full text-left">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">{group.label}</p>
                <p className="mt-2 text-2xl font-black text-white">{group.items.length}</p>
              </div>
              <div className="w-40">
                <div className="h-3 overflow-hidden rounded-full bg-white/8">
                  <div className={`h-full rounded-full ${group.tone}`} style={{ width: `${Math.max(8, (group.items.length / total) * 100)}%` }} />
                </div>
              </div>
            </div>
          </button>

          <AnimatePresence initial={false}>
            {open === group.label ? (
              <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-4 space-y-3 border-t border-white/8 pt-4">
                  {group.items.length ? group.items.map((item) => (
                    <div key={`${group.label}-${item.skill}`} className="rounded-[1.1rem] border border-white/8 bg-[#120f0d]/75 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-black text-white">{item.skill}</p>
                        <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-stone-300">
                          {toPercent(item.confidence)}% confidence
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-stone-300">{item.reasoning}</p>
                      {item.evidence_text ? <p className="mt-3 text-xs leading-5 text-stone-400">Evidence: {item.evidence_text}</p> : null}
                    </div>
                  )) : (
                    <p className="text-sm text-stone-500">No items in this group.</p>
                  )}
                </div>
              </Motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function GapHeatmapPanel({ items }) {
  if (!items?.length) {
    return <p className="text-sm leading-6 text-stone-500">Gap heatmap appears when the system sees weak or missing evidence.</p>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <div key={`${item.skill}-${item.status}`} className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black text-white">{item.skill}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">{item.tier}</p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${severityClasses(item.status)}`}>
              {item.status.replaceAll("_", " ")}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className={`h-full rounded-full ${item.severity === "green" ? "bg-emerald-400" : item.severity === "yellow" ? "bg-amber-300" : "bg-rose-400"}`}
              style={{ width: `${clamp(item.score)}%` }}
            />
          </div>
          <p className="mt-3 text-sm leading-6 text-stone-300">{item.explanation}</p>
          <p className="mt-2 text-xs leading-5 text-stone-500">{item.improvement_suggestion}</p>
        </div>
      ))}
    </div>
  );
}

function ImprovementEngine({ score, cards }) {
  const [simulatedSkill, setSimulatedSkill] = useState("");
  const selected = cards.find((item) => item.skill === simulatedSkill);
  const potentialScore = clamp(score + (selected?.impact || 0));

  if (!cards?.length) {
    return <p className="text-sm leading-6 text-stone-500">No focused improvement cards were generated yet.</p>;
  }

  return (
    <div className="space-y-3">
      {cards.map((card) => {
        const active = simulatedSkill === card.skill;
        return (
          <div key={card.skill} className="overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/[0.03]">
            <button type="button" onClick={() => setSimulatedSkill(active ? "" : card.skill)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
              <div>
                <p className="text-sm font-black text-white">{card.skill}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">Expected impact +{card.impact}</p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-stone-300">
                {card.difficulty}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {active ? (
                <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="border-t border-white/8 px-5 py-4">
                    <p className="text-sm leading-6 text-stone-300">{card.reasoning}</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px]">
                      <div className="rounded-[1.2rem] border border-white/8 bg-[#120f0d]/70 p-4 text-sm leading-6 text-stone-300">
                        {card.action}
                      </div>
                      <div className="rounded-[1.2rem] border border-emerald-300/16 bg-emerald-300/10 p-4 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-100">Simulated Score</p>
                        <p className="mt-3 text-4xl font-black text-white">{potentialScore}</p>
                      </div>
                    </div>
                  </div>
                </Motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function InterviewPrepPanel({ interviewPrep }) {
  const tabs = [
    { key: "conceptual_questions", label: "Conceptual" },
    { key: "practical_questions", label: "Coding" },
    { key: "scenario_questions", label: "Scenario" },
  ];
  const [active, setActive] = useState(tabs[0].key);
  const items = interviewPrep?.[active] || [];
  const [revealed, setRevealed] = useState({});

  if (!tabs.some((tab) => (interviewPrep?.[tab.key] || []).length)) {
    return <p className="text-sm leading-6 text-stone-500">Interview prep questions appear when the role focus has enough signal.</p>;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${active === tab.key ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-100" : "border-white/8 bg-white/[0.03] text-stone-300"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {items.map((item, index) => {
          const key = `${active}-${index}`;
          const difficulty = index === 0 ? "Easy" : index === 1 ? "Medium" : "Hard";
          return (
            <div key={key} className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black text-white">{item.question}</p>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-stone-300">
                  {difficulty}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRevealed((current) => ({ ...current, [key]: !current[key] }))}
                className="mt-3 rounded-full border border-amber-300/16 bg-amber-300/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-amber-100"
              >
                Reveal Answer Hint
              </button>
              {revealed[key] ? <p className="mt-3 text-sm leading-6 text-stone-300">{item.expectation}</p> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PreparationHub({ resources }) {
  if (!resources?.length) {
    return <p className="text-sm leading-6 text-stone-500">Resource cards appear for the most important missing skills.</p>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {resources.slice(0, 4).map((resource) => {
        const entries =
          resource.resources ||
          [
            ...(resource.official_docs || []),
            ...(resource.course || []),
            ...(resource.practice_platform || []),
            ...(resource.real_world_example || []),
          ];
        return (
          <div key={resource.skill || resource.label} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
            <p className="text-sm font-black text-white">{resource.skill || resource.label}</p>
            <div className="mt-4 grid gap-2">
              {entries.slice(0, 4).map((entry) => (
                <a
                  key={entry.url}
                  href={entry.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[1rem] border border-white/8 bg-[#120f0d]/70 px-4 py-3 text-sm text-stone-200 transition hover:border-cyan-300/20 hover:text-white"
                >
                  {entry.title}
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StrengthSignals({ signals }) {
  if (!signals?.length) {
    return <p className="text-sm leading-6 text-stone-500">Strength signals appear when the system sees repeatable, recruiter-visible proof.</p>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {signals.slice(0, 6).map((signal, index) => (
        <div
          key={`${signal.signal || signal}-${index}`}
          title={signal.why_it_matters || signal}
          className="rounded-full border border-emerald-300/18 bg-[linear-gradient(135deg,rgba(76,200,144,0.16),rgba(76,200,144,0.06))] px-4 py-3 text-sm font-bold text-emerald-50 shadow-[0_0_18px_rgba(76,200,144,0.12)]"
        >
          {signal.signal || signal}
        </div>
      ))}
    </div>
  );
}

function ExperienceTimeline({ items }) {
  if (!items?.length) {
    return <p className="text-sm leading-6 text-stone-500">Experience timeline appears when structured role history is available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-4">
        {items.map((item, index) => (
          <div key={`${item.title}-${item.company}-${index}`} className="w-[240px] rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black text-white">{item.title}</p>
              <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${item.is_recent ? "border-cyan-300/16 bg-cyan-300/10 text-cyan-100" : "border-white/10 bg-white/[0.04] text-stone-300"}`}>
                {item.is_recent ? "Recent" : `Weight ${toPercent(item.recency_weight)}%`}
              </span>
            </div>
            <p className="mt-2 text-sm text-stone-400">{[item.company, item.period].filter(Boolean).join(" • ")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(item.skills || []).length ? (item.skills || []).map((skill) => (
                <span key={`${item.title}-${skill}`} className="rounded-full border border-white/10 bg-[#120f0d]/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-stone-200">
                  {skill}
                </span>
              )) : <span className="text-xs text-stone-500">No direct role-skill proof detected.</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExplanationPanel({ candidate, topCandidate }) {
  const topScore = topCandidate?.score || 0;
  const delta = Math.round((candidate?.score || 0) - topScore);
  const compareBullets = [];

  if (candidate?.exactSkills?.length) compareBullets.push(`+ Strong exact match on ${candidate.exactSkills.slice(0, 2).join(", ")}`);
  if (candidate?.semanticSkills?.length) compareBullets.push(`+ Transferable evidence on ${candidate.semanticSkills.slice(0, 2).join(", ")}`);
  if (candidate?.dealBreakers?.length) compareBullets.push(`- Missing blocker: ${candidate.dealBreakers[0].skill}`);
  if (topCandidate && topCandidate.id !== candidate.id) {
    compareBullets.push(delta === 0 ? "On par with the top candidate by score." : delta < 0 ? `${Math.abs(delta)} points behind the top candidate.` : `${delta} points ahead of the previous top candidate.`);
  }

  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-[linear-gradient(180deg,rgba(18,15,13,0.94),rgba(12,10,8,0.94))] p-4">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">
        <Eye size={14} />
        Ranking Explanation
      </div>
      <div className="mt-4 space-y-3">
        {compareBullets.map((bullet, index) => (
          <div key={`${candidate.id}-compare-${index}`} className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-stone-200">
            {bullet}
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonWorkspace({ candidates, selectedIds, onToggle }) {
  const selected = candidates.filter((candidate) => selectedIds.includes(candidate.id)).slice(0, 3);

  return (
    <div className="space-y-4 rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(17,15,12,0.96),rgba(12,10,8,0.92))] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Comparison Mode</p>
          <p className="mt-2 text-sm text-stone-300">Select up to three candidates to see ranking deltas, must-have coverage, and risk differences side by side.</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-stone-300">
          {selected.length}/3 selected
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {candidates.slice(0, 6).map((candidate) => {
          const active = selectedIds.includes(candidate.id);
          const disabled = !active && selected.length >= 3;
          return (
            <button
              key={candidate.id}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(candidate.id)}
              className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${active ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-100" : "border-white/8 bg-white/[0.03] text-stone-300"} disabled:opacity-40`}
            >
              {candidate.candidate}
            </button>
          );
        })}
      </div>

      {selected.length >= 2 ? (
        <div className="grid gap-3 xl:grid-cols-3">
          {selected.map((candidate) => (
            <div key={candidate.id} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-white">{candidate.candidate}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">Rank #{candidate.rank}</p>
                </div>
                <p className={`text-3xl font-black ${scoreTone(candidate.score).text}`}>{Math.round(candidate.score)}%</p>
              </div>
              <div className="mt-4 space-y-3 text-sm text-stone-300">
                <div>Exact: {candidate.exactSkills.length}</div>
                <div>Semantic: {candidate.semanticSkills.length}</div>
                <div>Missing: {(candidate.skillBreakdown?.missing_skills || []).length}</div>
                <div>Confidence: {toPercent(candidate.confidence?.percent)}%</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-stone-500">
          Select at least two candidates to activate side-by-side comparison.
        </div>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, children, aside = null }) {
  return (
    <section className="rounded-[1.9rem] border border-white/8 bg-[linear-gradient(180deg,rgba(18,15,13,0.94),rgba(12,10,8,0.94))] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.16)]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
          {Icon ? <Icon size={14} /> : null}
          {title}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

function CandidateCard({ item, topCandidate, expanded, onToggleExpand, onShortlist, onReject, saved, onToggleSave }) {
  const tone = scoreTone(item.score);
  const breakdown = item.breakdown || {};

  return (
    <Motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`overflow-hidden rounded-[2rem] border p-6 shadow-[0_20px_56px_rgba(0,0,0,0.24)] ${item.rank === 1 ? "border-cyan-300/20 bg-[radial-gradient(circle_at_top_left,rgba(103,232,249,0.14),transparent_28%),linear-gradient(180deg,rgba(20,17,14,0.98),rgba(12,10,9,0.98))]" : "border-white/8 bg-[linear-gradient(180deg,rgba(20,17,14,0.98),rgba(12,10,9,0.98))]"}`}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_340px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-stone-300">Rank #{item.rank}</span>
            <span className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] ${tone.pill}`}>{item.scoreBand || item.score_band || "Review"}</span>
            {item.dealBreakerFlag ? (
              <span className="rounded-full border border-rose-300/18 bg-rose-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-rose-100">
                Deal Breaker
              </span>
            ) : null}
            {saved ? (
              <span className="rounded-full border border-amber-300/18 bg-amber-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-100">
                Saved
              </span>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="truncate text-3xl font-black text-white">{item.candidate}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-stone-400">
                <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5">
                  <BriefcaseBusiness size={13} className="mr-2 inline text-cyan-200" />
                  {item.role}
                </span>
                {item.email ? <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5">{item.email}</span> : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => onShortlist?.(item.id)} className={`rounded-[1rem] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] ${item.shortlisted ? "bg-[linear-gradient(135deg,#86efac,#6ee7b7)] text-stone-950" : "border border-emerald-300/18 bg-emerald-300/10 text-emerald-100"}`}>
                <ThumbsUp size={13} className="mr-2 inline" />
                {item.shortlisted ? "Shortlisted" : "Shortlist"}
              </button>
              <button type="button" onClick={() => onReject?.(item.id)} className={`rounded-[1rem] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] ${item.rejected ? "bg-[linear-gradient(135deg,#fb7185,#f97316)] text-white" : "border border-rose-300/18 bg-rose-300/10 text-rose-100"}`}>
                <ThumbsDown size={13} className="mr-2 inline" />
                {item.rejected ? "Rejected" : "Reject"}
              </button>
              <button type="button" onClick={() => onToggleSave(item.id)} className={`rounded-[1rem] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] ${saved ? "bg-amber-300 text-stone-950" : "border border-amber-300/18 bg-amber-300/10 text-amber-100"}`}>
                <Star size={13} className="mr-2 inline" />
                {saved ? "Saved" : "Save"}
              </button>
            </div>
          </div>

          {item.anomalyAlert ? (
            <div className="mt-5 rounded-[1.2rem] border border-rose-300/18 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
              <AlertTriangle size={14} className="mr-2 inline" />
              {item.anomalyAlert}
            </div>
          ) : null}

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <MiniPanel label="Confidence" value={`${toPercent(item.confidence?.percent)}%`} />
            <MiniPanel label="Exact Skills" value={item.exactSkills.length} />
            <MiniPanel label="Missing Critical" value={item.summary?.missing_critical_skills?.length || item.missing_required_skills?.length || 0} />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <MiniPanel label="Reliability" value={`${Math.round(item.reliability?.skill_match_accuracy || 0)}%`} />
            <MiniPanel label="Exp. Confidence" value={`${Math.round(item.experienceSnapshot?.experience_confidence_score || 0)}%`} />
          </div>

          <div className="mt-5 grid gap-3">
            {(item.keyHighlights || []).slice(0, 3).map((highlight, index) => (
              <div key={`${item.id}-highlight-${index}`} className="rounded-[1.1rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-stone-200">
                {highlight}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,13,11,0.94),rgba(10,9,8,0.98))] p-5">
          <ProgressOrb score={item.score} confidence={item.confidence} rank={item.rank} flagged={item.dealBreakerFlag} />

          <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-1">
            <MetricStrip label="Skills" value={breakdown.required_skill_match?.score || breakdown.skills_match?.score || 0} />
            <MetricStrip label="Experience" value={breakdown.experience_score?.score || breakdown.experience_match?.score || 0} />
            <MetricStrip label="Projects" value={breakdown.projects_relevance?.score || 0} />
          </div>

          <button
            type="button"
            onClick={() => onToggleExpand(item.id)}
            className="mt-5 w-full rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-stone-100 transition hover:border-cyan-300/18 hover:bg-cyan-300/8"
          >
            <ChevronDown size={13} className={`mr-2 inline transition ${expanded ? "rotate-180" : ""}`} />
            {expanded ? "Collapse Intelligence" : "Open Intelligence"}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-6 grid gap-5 border-t border-white/8 pt-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-5">
                <Section title="Ranking Explanation" icon={Info}>
                  <ExplanationPanel candidate={item} topCandidate={topCandidate} />
                </Section>
                <Section title="3D Skill Graph" icon={GitFork}>
                  <SkillGraphPanel graph={item.skillGraph} />
                </Section>
                <Section title="Skill Match Breakdown" icon={Target}>
                  <SkillBreakdownPanel candidate={item} />
                </Section>
                <Section title="Gap Heatmap" icon={Radar}>
                  <GapHeatmapPanel items={item.gapHeatmap} />
                </Section>
                <Section title="Improvement Engine" icon={ArrowUpRight}>
                  <ImprovementEngine score={item.score} cards={item.improvementCards} />
                </Section>
                <Section title="Interview Prep" icon={BrainCircuit}>
                  <InterviewPrepPanel interviewPrep={item.interviewPrep} />
                </Section>
              </div>

              <div className="space-y-5">
                <Section title="Preparation Hub" icon={BookOpen}>
                  <PreparationHub resources={item.preparationResources} />
                </Section>
                <Section title="Strength Signals" icon={Sparkles}>
                  <StrengthSignals signals={item.strengthSignals} />
                </Section>
                <Section title="Experience Timeline" icon={TimerReset}>
                  <ExperienceTimeline items={item.experienceTimeline} />
                </Section>
                <Section title="Recruiter Actions" icon={BadgeCheck}>
                  <div className="grid gap-3">
                    <ActionRow label="Shortlist" text="Strong candidate. Keep learning from this decision silently in the ranking loop." />
                    <ActionRow label="Reject" text="Store as a negative signal for this role profile without exposing the logic to the recruiter." />
                    <ActionRow label="Save" text="Bookmark for future roles or comparison sets even if timing is not right now." />
                  </div>
                </Section>
              </div>
            </div>
          </Motion.div>
        ) : null}
      </AnimatePresence>
    </Motion.article>
  );
}

function MetricStrip({ label, value }) {
  return (
    <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">{label}</p>
        <p className="text-xl font-black text-white">{Math.round(value || 0)}%</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,#67e8f9,#a7f3d0)]" style={{ width: `${clamp(value)}%` }} />
      </div>
    </div>
  );
}

function MiniPanel({ label, value }) {
  return (
    <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function ActionRow({ label, text }) {
  return (
    <div className="rounded-[1.1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-stone-300">{text}</p>
    </div>
  );
}

export default function Ranking({ data, onShortlist, onReject }) {
  const [expandedId, setExpandedId] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
  const [compareIds, setCompareIds] = useState([]);

  const candidates = useMemo(() => {
    return [...(Array.isArray(data) ? data : [])].sort((a, b) => (a.rank || 0) - (b.rank || 0));
  }, [data]);

  if (!candidates.length) {
    return <p className="text-sm leading-6 text-stone-500">No ranked candidates yet.</p>;
  }

  const topCandidate = candidates[0];

  const toggleCompare = (id) => {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  };

  return (
    <div className="space-y-6">
      <ComparisonWorkspace candidates={candidates} selectedIds={compareIds} onToggle={toggleCompare} />

      {candidates.map((item) => (
        <CandidateCard
          key={item.id}
          item={item}
          topCandidate={topCandidate}
          expanded={expandedId === item.id}
          onToggleExpand={(id) => setExpandedId((current) => (current === id ? null : id))}
          onShortlist={onShortlist}
          onReject={onReject}
          saved={savedIds.includes(item.id)}
          onToggleSave={(id) =>
            setSavedIds((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]))
          }
        />
      ))}
    </div>
  );
}
