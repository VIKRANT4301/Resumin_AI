import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  BadgeCheck,
  BriefcaseBusiness,
  ChevronDown,
  CircleAlert,
  Info,
  Medal,
  Radar,
  Sparkles,
  Target,
} from "lucide-react";

function scoreTone(score) {
  if (score >= 90) return "from-emerald-300 via-teal-300 to-cyan-300";
  if (score >= 75) return "from-cyan-300 via-sky-300 to-blue-300";
  if (score >= 60) return "from-amber-200 via-orange-200 to-yellow-200";
  return "from-rose-300 via-rose-300 to-orange-200";
}

function scoreTextTone(score) {
  if (score >= 90) return "text-emerald-200";
  if (score >= 75) return "text-cyan-200";
  if (score >= 60) return "text-amber-200";
  return "text-rose-200";
}

function severityTone(level) {
  if (level === "high") return "text-rose-200 border-rose-300/15 bg-rose-300/8";
  if (level === "medium") return "text-amber-200 border-amber-300/15 bg-amber-300/8";
  return "text-emerald-200 border-emerald-300/15 bg-emerald-300/8";
}

function breakdownValue(item, primaryKey, secondaryKey) {
  return (
    item?.breakdown?.[primaryKey]?.score ||
    item?.breakdown?.[secondaryKey]?.score ||
    0
  );
}

function DetailBlock({ icon: Icon, title, tone = "default", children }) {
  const toneClass =
    tone === "success"
      ? "border-emerald-300/12 bg-[linear-gradient(180deg,rgba(16,31,27,0.7),rgba(12,18,17,0.55))]"
      : tone === "danger"
        ? "border-rose-300/12 bg-[linear-gradient(180deg,rgba(38,18,20,0.66),rgba(18,10,10,0.55))]"
        : tone === "warning"
          ? "border-amber-300/12 bg-[linear-gradient(180deg,rgba(39,28,16,0.66),rgba(18,13,8,0.55))]"
          : "border-white/8 bg-[linear-gradient(180deg,rgba(22,18,15,0.75),rgba(15,12,10,0.62))]";

  return (
    <div className={`rounded-[1.5rem] border p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] ${toneClass}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-[1rem] border border-white/10 bg-white/[0.04] text-stone-100">
          <Icon size={17} />
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">{title}</p>
        </div>
      </div>
      <div className="mt-4 border-t border-white/6 pt-4">{children}</div>
    </div>
  );
}

function HighlightItem({ children }) {
  return (
    <div className="flex items-start gap-3 rounded-[1.1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.45)]" />
      <p className="text-sm leading-6 text-stone-200">{children}</p>
    </div>
  );
}

function MiniMetric({ label, value, accent }) {
  return (
    <div className="rounded-[1.1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">{label}</p>
      <p className={`mt-2 text-2xl font-black ${accent}`}>{Math.round(value || 0)}%</p>
    </div>
  );
}

function ScoreOrb({ score }) {
  const bounded = Math.max(0, Math.min(100, Number(score || 0)));
  const ringStyle = {
    background: `conic-gradient(from 210deg, rgba(255,255,255,0.14) 0deg, rgba(255,255,255,0.14) ${Math.max(
      10,
      360 - bounded * 3.6
    )}deg, rgba(103,232,249,0.92) ${Math.max(10, 360 - bounded * 3.6)}deg, rgba(167,243,208,0.92) 360deg)`,
  };

  return (
    <div className="relative mx-auto h-36 w-36">
      <Motion.div
        initial={{ rotate: -18, opacity: 0.7, scale: 0.92 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.75, ease: "easeOut" }}
        className="absolute inset-0 rounded-full p-[10px] shadow-[0_20px_50px_rgba(0,0,0,0.28)]"
        style={ringStyle}
      >
        <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),rgba(18,14,12,0.94)_55%)] text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">Match</p>
          <p className={`mt-2 text-4xl font-black ${scoreTextTone(bounded)}`}>{Math.round(bounded)}%</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
            {bounded >= 90 ? "Top tier" : bounded >= 75 ? "High fit" : bounded >= 60 ? "Promising" : "Review"}
          </p>
        </div>
      </Motion.div>
    </div>
  );
}

export default function Ranking({ data, onShortlist, onReject }) {
  const [expanded, setExpanded] = useState({});

  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-sm leading-6 text-stone-500">No ranked candidates yet.</p>;
  }

  const sorted = [...data].sort((a, b) => {
    if ((a.rank || 0) !== (b.rank || 0)) return (a.rank || 0) - (b.rank || 0);
    return (b.match_score || b.score || 0) - (a.match_score || a.score || 0);
  });

  return (
    <div className="space-y-6">
      {sorted.map((item, index) => {
        const itemKey = item.id || item.email || item.candidate;
        const isExpanded = Boolean(expanded[itemKey]);
        const score = item.match_score || item.score || 0;
        const highlights = (item.keyHighlights || []).slice(0, 3);
        const fitBullets = item.fitBullets || [];
        const topCandidate = index === 0;

        return (
          <Motion.article
            key={itemKey || `${item.candidate}-${index}`}
            layout
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: "easeOut", delay: index * 0.03 }}
            whileHover={{ y: -6 }}
            className={`group relative overflow-hidden rounded-[2rem] border p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition ${
              topCandidate
                ? "border-cyan-300/24 bg-[radial-gradient(circle_at_top_left,rgba(103,232,249,0.14),transparent_28%),linear-gradient(180deg,rgba(21,18,15,0.98),rgba(12,11,9,0.98))] hover:shadow-[0_28px_80px_rgba(34,211,238,0.12)]"
                : "border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.04),transparent_28%),linear-gradient(180deg,rgba(21,18,15,0.98),rgba(12,11,9,0.98))] hover:border-white/12 hover:shadow-[0_28px_78px_rgba(0,0,0,0.28)]"
            }`}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/16 to-transparent" />
            {topCandidate ? (
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-300/10 blur-3xl" />
            ) : null}

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_280px]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-stone-300">
                    Rank #{item.rank || index + 1}
                  </span>
                  {topCandidate ? (
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/12 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
                      <Medal size={11} className="mr-1.5 inline" />
                      Top Ranked
                    </span>
                  ) : null}
                  {item.shortlisted ? (
                    <span className="rounded-full border border-emerald-300/18 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100">
                      <BadgeCheck size={11} className="mr-1.5 inline" />
                      Shortlisted
                    </span>
                  ) : null}
                  {item.rejected ? (
                    <span className="rounded-full border border-rose-300/18 bg-rose-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-rose-100">
                      <CircleAlert size={11} className="mr-1.5 inline" />
                      Rejected
                    </span>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-wrap items-start justify-between gap-5">
                  <div className="min-w-0">
                    <p className="truncate text-3xl font-black tracking-tight text-white">{item.candidate}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-stone-400">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5">
                        <BriefcaseBusiness size={14} className="text-cyan-200" />
                        {item.role || "Target Role"}
                      </span>
                      {item.email ? (
                        <span className="truncate rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-stone-300">
                          {item.email}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Motion.button
                      type="button"
                      whileHover={{ y: -1, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onShortlist?.(item.id)}
                      className={`rounded-[1rem] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] transition ${
                        item.shortlisted
                          ? "bg-[linear-gradient(135deg,#86efac,#6ee7b7)] text-stone-950 shadow-[0_12px_28px_rgba(110,231,183,0.18)]"
                          : "border border-emerald-300/18 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/16"
                      }`}
                    >
                      {item.shortlisted ? "Shortlisted" : "Shortlist"}
                    </Motion.button>
                    <Motion.button
                      type="button"
                      whileHover={{ y: -1, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onReject?.(item.id)}
                      className={`rounded-[1rem] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] transition ${
                        item.rejected
                          ? "bg-[linear-gradient(135deg,#fb7185,#f97316)] text-white shadow-[0_12px_28px_rgba(251,113,133,0.18)]"
                          : "border border-rose-300/18 bg-rose-300/10 text-rose-100 hover:bg-rose-300/16"
                      }`}
                    >
                      {item.rejected ? "Rejected" : "Reject"}
                    </Motion.button>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  {highlights.length ? (
                    highlights.map((highlight, highlightIndex) => (
                      <HighlightItem key={`${itemKey}-highlight-${highlightIndex}`}>{highlight}</HighlightItem>
                    ))
                  ) : (
                    <HighlightItem>No recruiter-facing highlights surfaced in the current pass.</HighlightItem>
                  )}
                </div>
              </div>

              <div className="flex h-full flex-col justify-between rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(17,15,12,0.9),rgba(11,10,9,0.95))] p-5">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">Match Score</p>
                    <div className="group/tooltip relative">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-stone-300 transition hover:text-white">
                        <Info size={14} />
                      </span>
                      <div className="pointer-events-none absolute right-0 top-10 z-10 w-56 rounded-[1rem] border border-white/10 bg-[#120f0d]/96 p-3 text-xs leading-5 text-stone-300 opacity-0 shadow-[0_18px_44px_rgba(0,0,0,0.28)] transition duration-200 group-hover/tooltip:translate-y-1 group-hover/tooltip:opacity-100">
                        Weighted fit indicator based on matched skills, visible experience, and supporting project evidence.
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <ScoreOrb score={score} />
                  </div>

                  <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/6">
                    <Motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(4, Math.min(100, score))}%` }}
                      transition={{ duration: 0.95, ease: "easeOut" }}
                      className={`h-full rounded-full bg-gradient-to-r ${scoreTone(score)}`}
                    />
                  </div>
                </div>

                <Motion.button
                  type="button"
                  whileHover={{ y: -1, scale: 1.01 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => setExpanded((current) => ({ ...current, [itemKey]: !current[itemKey] }))}
                  className="mt-6 w-full rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-stone-100 transition hover:border-cyan-300/20 hover:bg-cyan-300/8"
                >
                  <ChevronDown size={13} className={`mr-2 inline transition ${isExpanded ? "rotate-180" : ""}`} />
                  {isExpanded ? "Collapse Details" : "Expand Details"}
                </Motion.button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {isExpanded ? (
                <Motion.div
                  initial={{ opacity: 0, height: 0, y: -6 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-6 border-t border-white/8 pt-6">
                    <div className="grid gap-4 xl:grid-cols-2">
                      <DetailBlock icon={Sparkles} title="Why This Candidate Fits" tone="success">
                        <div className="space-y-3">
                          {(fitBullets.length ? fitBullets : ["No fit explanation was generated in the current pass."]).map((bullet, bulletIndex) => (
                            <div key={`${itemKey}-fit-${bulletIndex}`} className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-stone-200">
                              {bullet}
                            </div>
                          ))}
                        </div>
                      </DetailBlock>

                      <DetailBlock icon={Target} title="Skill Gaps & Required Training" tone="danger">
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-200">Critical Gaps</p>
                            <div className="mt-3 space-y-2">
                              {(item.criticalGaps?.length ? item.criticalGaps : ["No critical blocker identified in the current pass."]).map((gap, gapIndex) => (
                                <div key={`${itemKey}-critical-${gapIndex}`} className="rounded-[1rem] border border-rose-300/10 bg-rose-300/6 px-4 py-3 text-sm leading-6 text-stone-200">
                                  {gap}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="border-t border-white/6 pt-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">Secondary Gaps</p>
                            <div className="mt-3 space-y-2">
                              {(item.secondaryGaps?.length ? item.secondaryGaps : ["No secondary gap highlighted."]).map((gap, gapIndex) => (
                                <div key={`${itemKey}-secondary-${gapIndex}`} className="rounded-[1rem] border border-amber-300/10 bg-amber-300/6 px-4 py-3 text-sm leading-6 text-stone-200">
                                  {gap}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DetailBlock>

                      <DetailBlock icon={Radar} title="Training Module" tone="warning">
                        <div className="space-y-4">
                          {(item.trainingModule?.length
                            ? item.trainingModule
                            : [{ skill: "No urgent training path", estimatedTime: "N/A", learningPath: ["No major missing skill surfaced in the current pass."], platforms: [] }]
                          ).map((module, moduleIndex) => (
                            <div key={`${itemKey}-training-${module.skill}-${moduleIndex}`} className="rounded-[1.1rem] border border-white/8 bg-white/[0.03] p-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="text-sm font-black text-white">{module.skill}</p>
                                <span className="rounded-full border border-cyan-300/14 bg-cyan-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100">
                                  {module.estimatedTime}
                                </span>
                              </div>
                              <div className="mt-3 space-y-2">
                                {(module.learningPath || []).map((step, stepIndex) => (
                                  <div key={`${module.skill}-path-${stepIndex}`} className="text-sm leading-6 text-stone-200">
                                    {step}
                                  </div>
                                ))}
                              </div>
                              {(module.platforms || []).length ? (
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {module.platforms.map((platform) => (
                                    <span key={`${module.skill}-${platform}`} className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-stone-200">
                                      {platform}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </DetailBlock>

                      <DetailBlock icon={AlertTriangle} title="Risk Signals" tone="default">
                        <div className="space-y-3">
                          {(item.riskSignals?.length
                            ? item.riskSignals
                            : [{ title: "No major hiring concern surfaced", severity: "Low", explanation: "The current pass did not identify a dominant risk pattern." }]
                          ).map((risk, riskIndex) => (
                            <div key={`${itemKey}-risk-${riskIndex}`} className="rounded-[1rem] border border-white/8 bg-white/[0.03] p-4">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${severityTone(
                                  String(risk.severity || "").toLowerCase()
                                )}`}
                              >
                                {risk.severity || "Low"} Severity
                              </span>
                              <p className="mt-3 text-sm font-black text-white">{risk.title}</p>
                              <p className="mt-2 text-sm leading-6 text-stone-300">{risk.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </DetailBlock>
                    </div>

                    <div className="mt-4">
                      <DetailBlock icon={BadgeCheck} title="Match Breakdown">
                        <div className="grid gap-3 md:grid-cols-3">
                          <MiniMetric
                            label="Skills Match"
                            value={breakdownValue(item, "skills_match", "required_skill_match")}
                            accent="text-cyan-200"
                          />
                          <MiniMetric
                            label="Experience Match"
                            value={breakdownValue(item, "experience_match", "experience_score")}
                            accent="text-emerald-200"
                          />
                          <MiniMetric
                            label="Project Relevance"
                            value={breakdownValue(item, "projects_relevance", "projects_relevance")}
                            accent="text-amber-200"
                          />
                        </div>
                      </DetailBlock>
                    </div>
                  </div>
                </Motion.div>
              ) : null}
            </AnimatePresence>
          </Motion.article>
        );
      })}
    </div>
  );
}
