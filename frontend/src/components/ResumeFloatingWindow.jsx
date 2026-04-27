import { AnimatePresence, motion } from "framer-motion";
import { X, Download, Star, CheckCircle, XCircle, AlertTriangle, Briefcase, Mail, MapPin, Zap, BarChart3, Brain, TrendingUp, ChevronRight, Shield } from "lucide-react";

/* ── helpers ── */
function clamp(v) { return Math.max(0, Math.min(100, Number(v) || 0)); }

function ScoreRing({ score, size = 120 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const color = score >= 80 ? "#4cc890" : score >= 60 ? "#f5bd4e" : "#fb7185";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (score / 100) * circ }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${color}90)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white">{Math.round(score)}%</span>
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 mt-0.5">Match</span>
      </div>
    </div>
  );
}

function StatBar({ label, value, color = "#5B8CFF" }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{label}</span>
        <span className="text-xs font-black text-white">{Math.round(value)}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${clamp(value)}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          style={{ background: `linear-gradient(90deg, ${color}CC, ${color})`, boxShadow: `0 0 8px ${color}60` }}
        />
      </div>
    </div>
  );
}

function SkillTag({ skill, tone = "blue" }) {
  const colors = {
    blue: "border-[#5B8CFF]/25 bg-[#5B8CFF]/10 text-[#5B8CFF]",
    green: "border-[#4cc890]/25 bg-[#4cc890]/10 text-[#4cc890]",
    amber: "border-[#f5bd4e]/25 bg-[#f5bd4e]/10 text-[#f5bd4e]",
    rose: "border-rose-500/25   bg-rose-500/10   text-rose-300",
  };
  return (
    <span className={`px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase tracking-wider ${colors[tone]}`}>
      {skill}
    </span>
  );
}

function SectionCard({ icon: Icon, title, color = "#5B8CFF", children }) {
  return (
    <div className="rounded-[1.8rem] border border-white/[0.07] bg-white/[0.025] backdrop-blur-sm p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20`, border: `1px solid ${color}35` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <h3 className="text-[11px] font-black uppercase tracking-[0.22em] text-stone-400">{title}</h3>
      </div>
      {children}
    </div>
  );
}

/* ── Timeline item ── */
function TimelineEntry({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.08 }}
      className="relative pl-6 pb-6 last:pb-0 border-l border-white/[0.08]"
    >
      <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full border-2 border-[#5B8CFF] bg-[#03060D]" />
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-black text-white">{item.title}</p>
            <p className="text-xs text-stone-500 mt-0.5">{[item.company, item.period].filter(Boolean).join(" · ")}</p>
          </div>
          {item.is_recent && (
            <span className="px-2.5 py-1 rounded-full border border-[#5B8CFF]/30 bg-[#5B8CFF]/10 text-[9px] font-black uppercase tracking-[0.2em] text-[#5B8CFF]">Recent</span>
          )}
        </div>
        {(item.skills || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {item.skills.slice(0, 5).map(s => (
              <span key={s} className="px-2 py-1 rounded-lg border border-white/[0.08] bg-white/[0.03] text-[10px] font-bold text-stone-400 uppercase tracking-wider">{s}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Main floating window ── */
export default function ResumeFloatingWindow({ open, onClose, data = {}, resume = {}, feedback = {}, matchResult = null, mode = "candidate" }) {
  // Normalize data
  const isRag = Boolean(matchResult?.match);
  const report = isRag ? matchResult?.candidate_report || {} : {};
  const summary = isRag ? matchResult?.key_metrics || {} : data?.summary || {};

  const name = data?.candidate || resume?.name || report?.name || "Candidate";
  const role = data?.job_role || report?.job_role || resume?.job_role || "Target Role";
  const email = resume?.email || "";
  const location = resume?.location || "";

  const score = Number(isRag
    ? matchResult?.match?.score ?? report?.match_percent ?? summary?.overall_score ?? 0
    : feedback?.score ?? summary?.rank_score ?? summary?.overall_score ?? 0);

  const skillsMatch = Number(isRag
    ? report?.skills_match_percent ?? summary?.skill_match_percent ?? 0
    : summary?.skills_match_percent ?? 0);
  const critFit = Number(isRag
    ? report?.critical_fit_percent ?? summary?.critical_match_percent ?? 0
    : summary?.critical_fit_percent ?? 0);
  const expScore = Number(summary?.experience_score ?? summary?.experience_confidence_score ?? 0);

  const extractedSkills = (isRag ? (report?.extracted_skills || matchResult?.skill_analysis?.extracted_resume_skills || []) : (resume?.skills || []));
  const matchedSkills = (isRag ? (report?.matched_skills || matchResult?.skill_analysis?.matched_required_skills || []) : []);
  const missingSkills = (isRag ? (report?.missing_skills || []) : (feedback?.missing_skills || []));
  const strengths = (isRag ? (report?.pros || matchResult?.insights?.strengths || []) : (feedback?.strengths || []));
  const weaknesses = (isRag ? (report?.cons || matchResult?.insights?.gaps || []) : (feedback?.risk_signals || []));
  const improvements = (isRag ? (report?.improvements || matchResult?.insights?.recommendations || []) : (feedback?.improvements || []));
  const summary_text = isRag
    ? report?.resume_summary || matchResult?.insights?.summary || matchResult?.match?.interpretation || ""
    : feedback?.candidate_summary || feedback?.summary || "";
  const timeline = resume?.experience || [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] bg-[#03060D]/85 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-white/[0.08] bg-[#05080F]/90 backdrop-blur-2xl shadow-[0_40px_120px_rgba(0,0,0,0.8)]"
          >
            {/* ── Gradient top edge ── */}
            <div className="absolute inset-x-0 top-0 h-[1px] rounded-t-[2.5rem] bg-gradient-to-r from-transparent via-[#5B8CFF]/50 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#5B8CFF]/6 blur-3xl pointer-events-none rounded-full" />

            {/* ── HEADER ── */}
            <div className="sticky top-0 z-20 px-8 py-6 border-b border-white/[0.06] bg-[#05080F]/95 backdrop-blur-2xl rounded-t-[2.5rem] flex items-center justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shrink-0"
                  style={{ background: "linear-gradient(135deg, #5B8CFF, #8A2BE2)", boxShadow: "0 0 24px rgba(91,140,255,0.35)" }}>
                  {name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">{name}</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="flex items-center gap-1.5 text-xs text-stone-500">
                      <Briefcase size={11} />{role}
                    </span>
                    {email && <span className="flex items-center gap-1.5 text-xs text-stone-500"><Mail size={11} />{email}</span>}
                    {location && <span className="flex items-center gap-1.5 text-xs text-stone-500"><MapPin size={11} />{location}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#5B8CFF]/25 bg-[#5B8CFF]/10 text-xs font-black uppercase tracking-wider text-[#5B8CFF] hover:bg-[#5B8CFF]/20 transition">
                  <Download size={13} /> Export PDF
                </button>
                <button onClick={onClose} className="w-10 h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center text-stone-400 hover:text-white hover:border-white/20 transition">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ── BODY ── */}
            <div className="p-8 space-y-6">

              {/* Row 1 — Score + Stats */}
              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6">
                {/* Score ring card */}
                <div className="rounded-[2rem] border border-white/[0.07] bg-white/[0.02] p-6 flex flex-col items-center gap-4 min-w-[180px]">
                  <ScoreRing score={score} size={130} />
                  <div className="text-center">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">AI Match Score</p>
                    <p className="mt-1 text-sm font-black" style={{ color: score >= 80 ? "#4cc890" : score >= 60 ? "#f5bd4e" : "#fb7185" }}>
                      {score >= 80 ? "Excellent Fit" : score >= 60 ? "Moderate Fit" : "Weak Fit"}
                    </p>
                  </div>
                </div>

                {/* Metrics bars */}
                <div className="rounded-[2rem] border border-white/[0.07] bg-white/[0.02] p-6 space-y-5">
                  <StatBar label="Skills Match" value={skillsMatch} color="#5B8CFF" />
                  <StatBar label="Critical Fit" value={critFit} color="#8A2BE2" />
                  <StatBar label="Experience" value={expScore} color="#4cc890" />
                  {summary_text && (
                    <p className="text-sm leading-7 text-stone-400 pt-2 border-t border-white/[0.05]">
                      {summary_text}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2 — Skills three-col */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SectionCard icon={Zap} title="Matched Skills" color="#4cc890">
                  <div className="flex flex-wrap gap-2">
                    {(matchedSkills.length ? matchedSkills : extractedSkills).slice(0, 8).map(s => (
                      <SkillTag key={s} skill={s} tone="green" />
                    ))}
                    {!matchedSkills.length && !extractedSkills.length && <p className="text-xs text-stone-500">No skills extracted yet.</p>}
                  </div>
                </SectionCard>

                <SectionCard icon={AlertTriangle} title="Skill Gaps" color="#f5bd4e">
                  <div className="flex flex-wrap gap-2">
                    {missingSkills.slice(0, 6).map(s => (
                      <SkillTag key={s} skill={s} tone="amber" />
                    ))}
                    {!missingSkills.length && <p className="text-xs text-stone-500">No critical gaps detected.</p>}
                  </div>
                </SectionCard>

                <SectionCard icon={Brain} title="AI Feedback" color="#8A2BE2">
                  <div className="space-y-2">
                    {strengths.slice(0, 3).map((s, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle size={12} className="text-[#4cc890] mt-1 shrink-0" />
                        <p className="text-xs leading-5 text-stone-300">{typeof s === "string" ? s : s?.signal || ""}</p>
                      </div>
                    ))}
                    {weaknesses.slice(0, 2).map((w, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <XCircle size={12} className="text-rose-400 mt-1 shrink-0" />
                        <p className="text-xs leading-5 text-stone-400">{typeof w === "string" ? w : w?.signal || ""}</p>
                      </div>
                    ))}
                    {!strengths.length && !weaknesses.length && <p className="text-xs text-stone-500">Run analysis to see AI feedback.</p>}
                  </div>
                </SectionCard>
              </div>

              {/* Row 3 — Career Timeline */}
              {timeline.length > 0 && (
                <SectionCard icon={TrendingUp} title="Career Progression" color="#5B8CFF">
                  <div className="mt-2">
                    {timeline.slice(0, 5).map((exp, i) => (
                      <TimelineEntry key={i} item={exp} index={i} />
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Row 4 — Improvement Plan */}
              {improvements.length > 0 && (
                <SectionCard icon={BarChart3} title="AI Improvement Plan" color="#5B8CFF">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {improvements.slice(0, 4).map((item, i) => (
                      <div key={i} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-[#5B8CFF]/15 border border-[#5B8CFF]/25 flex items-center justify-center shrink-0 mt-0.5">
                          <ChevronRight size={11} className="text-[#5B8CFF]" />
                        </div>
                        <p className="text-xs leading-5 text-stone-300">{typeof item === "string" ? item : item?.action || item?.description || ""}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Row 5 — Risk signals (recruiter only) */}
              {mode === "recruiter" && weaknesses.length > 0 && (
                <SectionCard icon={Shield} title="Risk Signals" color="#fb7185">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {weaknesses.map((w, i) => (
                      <div key={i} className="rounded-2xl border border-rose-500/15 bg-rose-500/[0.04] p-4">
                        <p className="text-xs leading-5 text-rose-200">{typeof w === "string" ? w : `${w?.title || w?.signal}: ${w?.explanation || w?.why_it_matters || ""}`}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
