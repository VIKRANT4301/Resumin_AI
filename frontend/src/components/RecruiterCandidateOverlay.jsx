import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, XCircle, AlertTriangle, Brain, Target, Zap, BarChart3, BookOpen, ChevronDown, Star, Shield, Download, Briefcase, Mail } from "lucide-react";
import { useState } from "react";

/* ── helpers ── */
function clamp(v) { return Math.max(0, Math.min(100, Number(v) || 0)); }
function toP(v) {
  if (typeof v === "number" && v <= 1) return Math.round(v * 100);
  return Math.round(Number.isFinite(Number(v)) ? Number(v) : 0);
}
function scoreColor(s) { return s >= 80 ? "#4cc890" : s >= 60 ? "#f5bd4e" : "#fb7185"; }
function scoreLabel(s) { return s >= 80 ? "Strong Fit" : s >= 60 ? "Moderate Fit" : "Weak Fit"; }

/* ── Score Orb ── */
function ScoreOrb({ score }) {
  const col = scoreColor(score);
  const r = 54, circ = 2 * Math.PI * r;
  return (
    <div className="relative flex flex-col items-center gap-3">
      <div className="relative w-[130px] h-[130px]">
        <svg width="130" height="130" className="-rotate-90">
          <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          <motion.circle cx="65" cy="65" r={r} fill="none" stroke={col} strokeWidth="10"
            strokeLinecap="round" strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (clamp(score) / 100) * circ }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 10px ${col}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-white">{Math.round(score)}</span>
          <span className="text-[9px] font-black uppercase tracking-[0.22em] text-stone-500">/ 100</span>
        </div>
      </div>
      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.18em]"
        style={{ color: col, border: `1px solid ${col}40`, backgroundColor: `${col}12` }}>
        {scoreLabel(score)}
      </span>
    </div>
  );
}

/* ── Stat bar ── */
function StatBar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-stone-500">{label}</span>
        <span className="text-[10px] font-black text-white">{Math.round(clamp(value))}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${clamp(value)}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
        />
      </div>
    </div>
  );
}

/* ── Skill tag ── */
function Chip({ text, tone = "blue" }) {
  const t = {
    blue:  "border-[#5B8CFF]/25 bg-[#5B8CFF]/10 text-[#5B8CFF]",
    green: "border-[#4cc890]/25 bg-[#4cc890]/10 text-[#4cc890]",
    amber: "border-[#f5bd4e]/25 bg-[#f5bd4e]/10 text-[#f5bd4e]",
    rose:  "border-rose-400/25  bg-rose-400/10   text-rose-300",
  };
  return <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider ${t[tone]}`}>{text}</span>;
}

/* ── Panel section ── */
function Panel({ icon: Icon, title, color, children }) {
  return (
    <div className="rounded-[1.8rem] border border-white/[0.07] bg-white/[0.02] p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
          <Icon size={14} style={{ color }} />
        </div>
        <h4 className="text-[10px] font-black uppercase tracking-[0.24em] text-stone-400">{title}</h4>
      </div>
      {children}
    </div>
  );
}

/* ── Accordion row ── */
function Accordion({ title, subtitle, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
        <div>
          <p className="text-sm font-black text-white">{title}</p>
          {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
        </div>
        <ChevronDown size={16} className={`text-stone-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-white/[0.06]">
            <div className="p-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Overlay ── */
export default function RecruiterCandidateOverlay({ open, onClose, item, topCandidate, onShortlist, onReject }) {
  if (!item) return null;

  const score   = clamp(item.score ?? item.summary?.overall_score ?? 0);
  const rank    = item.rank ?? "—";
  const name    = item.candidate || item.name || "Candidate";
  const email   = item.email || "";
  const role    = item.job_role || "";

  const exactSkills    = item.exactSkills    || item.skillBreakdown?.exact_matches?.map(s => s.skill) || [];
  const semanticSkills = item.semanticSkills || item.skillBreakdown?.semantic_matches?.map(s => s.skill) || [];
  const missingSkills  = item.skillBreakdown?.missing_skills?.map(s => s.skill) || item.missingSkills || [];
  const strengths      = item.rankingExplanation?.bullets || item.fitBullets || [];
  const gapItems       = item.gapHeatmap || [];
  const timeline       = item.experienceTimeline || [];
  const improvements   = item.improvementCards || [];
  const interview      = item.interviewPrep || {};
  const dealBreakers   = item.dealBreakers || [];

  const skillMatch = clamp(item.summary?.skill_match_percent ?? item.skillsMatchPercent ?? (exactSkills.length / Math.max(1, exactSkills.length + missingSkills.length) * 100));
  const confidence = clamp(toP(item.confidence?.percent ?? 0));
  const projRel    = clamp(item.summary?.project_relevance_percent ?? 0);

  const isShortlisted = item.shortlisted;
  const isRejected    = item.rejected;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-[#020509]/90 backdrop-blur-xl p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{ opacity: 0, scale: 0.96,    y: 16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-[2.5rem] border border-white/[0.08] bg-[#050810]/95 backdrop-blur-3xl shadow-[0_50px_150px_rgba(0,0,0,0.85)]"
          >
            {/* top glow line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5B8CFF]/60 to-transparent rounded-t-[2.5rem]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full bg-[#5B8CFF]/5 blur-3xl pointer-events-none" />

            {/* ── HEADER ── */}
            <div className="sticky top-0 z-30 flex flex-col gap-3 px-4 sm:px-8 py-4 sm:py-5 border-b border-white/[0.06] bg-[#050810]/98 backdrop-blur-2xl rounded-t-[2.5rem] sm:flex-row sm:items-center sm:justify-between">
              {/* Identity */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl text-white shrink-0"
                    style={{ background: "linear-gradient(135deg, #5B8CFF, #8A2BE2)", boxShadow: "0 0 20px rgba(91,140,255,0.35)" }}>
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#050810] border border-white/10 flex items-center justify-center">
                    <span className="text-[8px] sm:text-[9px] font-black text-stone-300">#{rank}</span>
                  </div>
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">{name}</h2>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                    {email && <span className="flex items-center gap-1.5 text-xs text-stone-500 truncate max-w-[180px]"><Mail size={10} />{email}</span>}
                    {role  && <span className="flex items-center gap-1.5 text-xs text-stone-500"><Briefcase size={10} />{role}</span>}
                    {dealBreakers.length > 0 && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-[9px] font-black uppercase tracking-[0.18em] text-rose-300">
                        <AlertTriangle size={9} /> Risk Flag
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button onClick={onShortlist}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all ${
                    isShortlisted
                      ? "border-[#4cc890]/40 bg-[#4cc890]/15 text-[#4cc890]"
                      : "border-white/10 bg-white/[0.03] text-stone-400 hover:border-[#4cc890]/30 hover:text-[#4cc890] hover:bg-[#4cc890]/10"
                  }`}>
                  <CheckCircle size={13} /> <span className="hidden sm:inline">{isShortlisted ? "Shortlisted" : "Shortlist"}</span><span className="sm:hidden">{isShortlisted ? "✓" : "Shortlist"}</span>
                </button>
                <button onClick={onReject}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all ${
                    isRejected
                      ? "border-rose-500/40 bg-rose-500/15 text-rose-300"
                      : "border-white/10 bg-white/[0.03] text-stone-400 hover:border-rose-500/30 hover:text-rose-300 hover:bg-rose-500/10"
                  }`}>
                  <XCircle size={13} /> <span className="hidden sm:inline">{isRejected ? "Rejected" : "Reject"}</span><span className="sm:hidden">{isRejected ? "✗" : "Reject"}</span>
                </button>
                <button onClick={onClose} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-stone-400 hover:text-white transition shrink-0">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ── BODY ── */}
            <div className="p-4 sm:p-8 space-y-6">

              {/* Row 1 — Score + 3 metric bars */}
              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6">
                {/* Orb */}
                <div className="rounded-[2rem] border border-white/[0.07] bg-white/[0.02] p-6 flex flex-col items-center justify-center">
                  <ScoreOrb score={score} />
                  <div className="mt-4 grid grid-cols-2 gap-2 w-full">
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3 text-center">
                      <p className="text-[9px] font-black uppercase tracking-wider text-stone-500">Rank</p>
                      <p className="text-xl font-black text-white mt-1">#{rank}</p>
                    </div>
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3 text-center">
                      <p className="text-[9px] font-black uppercase tracking-wider text-stone-500">Confidence</p>
                      <p className="text-xl font-black text-white mt-1">{confidence}%</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="rounded-[2rem] border border-white/[0.07] bg-white/[0.02] p-6 space-y-5">
                  {/* AI Intelligence badges */}
                  {(item.aiArchetype || item.marketTier) && (
                    <div className="flex flex-wrap gap-2 pb-3 border-b border-white/[0.05]">
                      {item.aiArchetype && <span className="px-3 py-1.5 rounded-xl border border-[#5B8CFF]/25 bg-[#5B8CFF]/8 text-[10px] font-black text-[#5B8CFF] uppercase tracking-wider">{item.aiArchetype}</span>}
                      {item.marketTier && <span className="px-3 py-1.5 rounded-xl border border-[#4cc890]/25 bg-[#4cc890]/8 text-[10px] font-black text-[#4cc890] uppercase tracking-wider">{item.marketTier}</span>}
                      {item.hiringVelocity && <span className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] text-[10px] font-black text-stone-400 uppercase tracking-wider">{item.hiringVelocity}</span>}
                    </div>
                  )}
                  <StatBar label="Skills Match"        value={skillMatch} color="linear-gradient(90deg,#5B8CFF,#8A2BE2)" />
                  <StatBar label="Project Relevance"   value={projRel}    color="linear-gradient(90deg,#4cc890,#59d0de)" />
                  <StatBar label="Confidence"          value={confidence} color="linear-gradient(90deg,#f5bd4e,#fb923c)" />
                  <StatBar label="ATS Score"           value={clamp(item.summary?.ats_score ?? 0)} color="linear-gradient(90deg,#34d399,#10b981)" />
                  <StatBar label="Interview Readiness" value={clamp(item.summary?.interview_readiness_score ?? 0)} color="linear-gradient(90deg,#a78bfa,#7c3aed)" />

                  {/* Why bullets */}
                  {strengths.length > 0 && (
                    <div className="pt-3 border-t border-white/[0.05] space-y-2">
                      {strengths.slice(0, 3).map((b, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Star size={11} className="text-[#5B8CFF] mt-0.5 shrink-0" />
                          <p className="text-xs leading-5 text-stone-300">{b}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>


              {/* Row 2 — 3 skill columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Panel icon={Zap} title="Exact Matches" color="#4cc890">
                  <div className="flex flex-wrap gap-2">
                    {exactSkills.slice(0, 8).map(s => <Chip key={s} text={s} tone="green" />)}
                    {!exactSkills.length && <p className="text-xs text-stone-500">No exact matches found.</p>}
                  </div>
                </Panel>
                <Panel icon={Brain} title="Semantic Matches" color="#5B8CFF">
                  <div className="flex flex-wrap gap-2">
                    {semanticSkills.slice(0, 8).map(s => <Chip key={s} text={s} tone="blue" />)}
                    {!semanticSkills.length && <p className="text-xs text-stone-500">No semantic matches found.</p>}
                  </div>
                </Panel>
                <Panel icon={AlertTriangle} title="Missing Skills" color="#f5bd4e">
                  <div className="flex flex-wrap gap-2">
                    {missingSkills.slice(0, 6).map(s => <Chip key={s} text={s} tone="amber" />)}
                    {!missingSkills.length && <p className="text-xs text-stone-500">No critical gaps detected.</p>}
                  </div>
                </Panel>
              </div>

              {/* Row 3 — Gap heatmap + Deal breakers */}
              {(gapItems.length > 0 || dealBreakers.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gapItems.length > 0 && (
                    <Panel icon={Target} title="Gap Intelligence" color="#fb7185">
                      <div className="space-y-3">
                        {gapItems.slice(0, 4).map((item, i) => (
                          <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-sm font-black text-white">{item.skill}</p>
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                item.severity === "green" ? "bg-[#4cc890]/15 text-[#4cc890] border border-[#4cc890]/25" :
                                item.severity === "yellow" ? "bg-[#f5bd4e]/15 text-[#f5bd4e] border border-[#f5bd4e]/25" :
                                "bg-rose-400/15 text-rose-300 border border-rose-400/25"
                              }`}>{item.status?.replace(/_/g, " ")}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${clamp(item.score)}%`, background: item.severity === "green" ? "#4cc890" : item.severity === "yellow" ? "#f5bd4e" : "#fb7185" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Panel>
                  )}

                  {dealBreakers.length > 0 && (
                    <Panel icon={Shield} title="Deal Breakers" color="#fb7185">
                      <div className="space-y-3">
                        {dealBreakers.map((db, i) => (
                          <div key={i} className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.05] p-4">
                            <p className="text-sm font-black text-rose-200">{db.skill || db.title}</p>
                            <p className="text-xs leading-5 text-stone-400 mt-1">{db.explanation || db.reason}</p>
                          </div>
                        ))}
                      </div>
                    </Panel>
                  )}
                </div>
              )}

              {/* Row 4 — Accordion: Experience, Improvement, Interview */}
              <div className="space-y-3">
                {timeline.length > 0 && (
                  <Accordion title="Experience Timeline" subtitle={`${timeline.length} role${timeline.length !== 1 ? "s" : ""} found`}>
                    <div className="space-y-3">
                      {timeline.slice(0, 5).map((exp, i) => (
                        <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                          <div className="flex justify-between gap-3 flex-wrap">
                            <div>
                              <p className="text-sm font-black text-white">{exp.title}</p>
                              <p className="text-xs text-stone-500 mt-0.5">{[exp.company, exp.period].filter(Boolean).join(" · ")}</p>
                            </div>
                            {exp.is_recent && <span className="px-2.5 py-1 rounded-full border border-[#5B8CFF]/30 bg-[#5B8CFF]/10 text-[9px] font-black text-[#5B8CFF] uppercase tracking-wider">Recent</span>}
                          </div>
                          {(exp.skills || []).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {exp.skills.slice(0, 6).map(s => (
                                <span key={s} className="px-2 py-1 rounded-lg border border-white/[0.08] bg-white/[0.02] text-[10px] font-bold text-stone-400 uppercase tracking-wider">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Accordion>
                )}

                {improvements.length > 0 && (
                  <Accordion title="Improvement Simulator" subtitle="Click a skill to see score impact">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {improvements.slice(0, 4).map((card, i) => (
                        <div key={i} className="rounded-2xl border border-[#5B8CFF]/15 bg-[#5B8CFF]/[0.04] p-4">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-black text-white">{card.skill}</p>
                            <span className="px-2.5 py-1 rounded-full border border-[#4cc890]/25 bg-[#4cc890]/10 text-[9px] font-black text-[#4cc890] uppercase tracking-wider">+{card.impact} pts</span>
                          </div>
                          <p className="text-xs leading-5 text-stone-400 mt-2">{card.action || card.reasoning}</p>
                          <p className="text-[10px] text-stone-600 mt-1 uppercase tracking-wider">{card.difficulty}</p>
                        </div>
                      ))}
                    </div>
                  </Accordion>
                )}

                {/* ── AI Skill Gap Intelligence ── */}
                {(item.aiSkillGaps || []).length > 0 && (
                  <Accordion title="AI Skill Gap Intelligence" subtitle={`${item.aiSkillGaps.length} gaps analyzed`}>
                    <div className="space-y-3">
                      {item.aiSkillGaps.slice(0, 4).map((gap, i) => (
                        <div key={i} className={`rounded-2xl border p-4 ${gap.severity === "Critical" ? "border-rose-500/20 bg-rose-500/[0.06]" : gap.severity === "High" ? "border-amber-500/20 bg-amber-500/[0.06]" : "border-white/[0.06] bg-white/[0.02]"}`}>
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-black text-white">{gap.skill || gap.gap_type}</p>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${gap.severity === "Critical" ? "bg-rose-500/15 text-rose-300 border border-rose-500/25" : gap.severity === "High" ? "bg-amber-500/15 text-amber-300 border border-amber-500/25" : "bg-white/[0.04] text-stone-400 border border-white/10"}`}>{gap.severity}</span>
                          </div>
                          <p className="text-xs leading-5 text-stone-400">{gap.why_recruiters_care || gap.how_it_affects_hiring}</p>
                          {gap.exact_fix && <p className="text-xs text-cyan-300 mt-2"><span className="font-black">Fix: </span>{gap.exact_fix} {gap.time_to_fix ? `(${gap.time_to_fix})` : ""}</p>}
                        </div>
                      ))}
                    </div>
                  </Accordion>
                )}

                {/* ── Bullet Transformation Engine ── */}
                {(item.aiBullets || []).length > 0 && (
                  <Accordion title="Bullet Transformation Engine" subtitle="AI resume rewrites">
                    <div className="space-y-3">
                      {item.aiBullets.slice(0, 3).map((b, i) => (
                        <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                          <div className="flex flex-col">
                            <div className="p-4 bg-emerald-500/[0.03]">
                              <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400 mb-1">AI Rewrite</p>
                              <p className="text-xs leading-5 text-emerald-100">{b.after}</p>
                            </div>
                          </div>
                          {b.impact_change && <div className="px-4 py-2.5 border-t border-white/[0.05]"><p className="text-[10px] text-stone-400"><span className="text-cyan-400 font-black">Impact: </span>{b.impact_change}</p></div>}
                        </div>
                      ))}
                    </div>
                  </Accordion>
                )}

                {(interview.conceptual_questions?.length || interview.practical_questions?.length || interview.scenario_questions?.length) ? (
                  <Accordion title="Interview Prep Questions">
                    <div className="space-y-3">
                      {[...(interview.conceptual_questions || []), ...(interview.practical_questions || [])].slice(0, 5).map((q, i) => (
                        <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                          <p className="text-sm text-white">{q.question}</p>
                          <p className="text-xs leading-5 text-stone-400 mt-2">{q.expectation}</p>
                        </div>
                      ))}
                    </div>
                  </Accordion>
                ) : null}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

