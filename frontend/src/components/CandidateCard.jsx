import React from "react";
import { CheckCircle, XCircle, ChevronRight, Mail, Star, AlertTriangle } from "lucide-react";

function ScoreRing({ score, size = 56 }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 85 ? "#4cc890" : score >= 70 ? "#f5bd4e" : score >= 50 ? "#5B8CFF" : "#f43f5e";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="5"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 1s ease-out", filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-black text-white">{Math.round(score)}%</span>
      </div>
    </div>
  );
}

const CandidateCard = React.memo(function CandidateCard({ 
  candidate, 
  onShortlist, 
  onReject, 
  decision, 
  onClick 
}) {
  const matchScore = candidate.match_score || candidate.summary?.overall_score || candidate.score || 0;
  const isShortlisted = decision === "shortlisted";
  const isRejected = decision === "rejected";
  const hasDealBreaker = candidate.dealBreakerFlag;

  const allSkills = candidate.skills || candidate.resume_data?.skills || [];
  const topSkills = allSkills.slice(0, 5);
  const highlights = candidate.why_fit || candidate.feedback?.why_candidate_fits || candidate.strengths || [];
  const topHighlight = highlights.length > 0 ? highlights[0] : null;

  const scoreColor = matchScore >= 85 ? "#4cc890" : matchScore >= 70 ? "#f5bd4e" : matchScore >= 50 ? "#5B8CFF" : "#f43f5e";
  const scoreLabel = matchScore >= 85 ? "Excellent" : matchScore >= 70 ? "Good" : matchScore >= 50 ? "Fair" : "Low";

  return (
    <div
      className={`relative overflow-hidden rounded-[1.8rem] border flex flex-col gap-4 p-6 transition-all duration-300 transform hover:-translate-y-1 ${
        isShortlisted
          ? "border-[#4cc890]/30 bg-[#4cc890]/5 shadow-[0_0_30px_rgba(76,200,144,0.1)]"
          : isRejected
          ? "border-rose-500/15 bg-rose-500/5 opacity-65 grayscale-[40%]"
          : "border-white/[0.07] bg-[#080B14]/60 hover:border-white/[0.12] hover:bg-[#0A0E1A]/80"
      }`}
    >
      {/* Deal breaker warning */}
      {hasDealBreaker && !isRejected && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1">
          <AlertTriangle size={10} className="text-rose-400" />
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-rose-400">Risk Flag</span>
        </div>
      )}

      {/* Shortlisted badge */}
      {isShortlisted && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full border border-[#4cc890]/40 bg-[#4cc890]/15 px-2.5 py-1">
          <Star size={10} className="text-[#4cc890]" fill="currentColor" />
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#4cc890]">Shortlisted</span>
        </div>
      )}

      {/* Header Row */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white"
          style={{ background: `linear-gradient(135deg, ${scoreColor}30, ${scoreColor}10)`, border: `1px solid ${scoreColor}30` }}
        >
          {(candidate.name || "?").charAt(0).toUpperCase()}
        </div>

        {/* Name + Email */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick} role="button">
          <h3 className="text-base font-black text-white truncate hover:text-[#5B8CFF] transition-colors">
            {candidate.name || "Unknown Candidate"}
          </h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-500 truncate">
            <Mail size={11} />
            {candidate.email || "No email provided"}
          </p>
        </div>

        {/* Score Ring */}
        <ScoreRing score={matchScore} />
      </div>

      {/* Score Label + Rank badge */}
      <div className="flex items-center gap-2">
        <div
          className="rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em]"
          style={{ backgroundColor: `${scoreColor}15`, border: `1px solid ${scoreColor}30`, color: scoreColor }}
        >
          {scoreLabel} Match
        </div>
        {candidate.rank && (
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-stone-500">
            Rank #{candidate.rank}
          </div>
        )}
      </div>

      {/* Skills */}
      {topSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topSkills.map((skill, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border border-[#5B8CFF]/20 bg-[#5B8CFF]/8 text-[#5B8CFF]/80"
            >
              {skill}
            </span>
          ))}
          {allSkills.length > 5 && (
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-white/[0.08] bg-white/[0.03] text-stone-500">
              +{allSkills.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* AI Highlight */}
      {topHighlight && (
        <div
          className="flex-1 rounded-xl p-3 border-l-2"
          style={{
            backgroundColor: `${scoreColor}08`,
            borderLeftColor: scoreColor,
          }}
        >
          <p className="text-xs leading-relaxed text-stone-400 line-clamp-2">{topHighlight}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 pt-1 mt-auto">
        <button
          onClick={(e) => { e.stopPropagation(); onShortlist(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all hover:scale-[1.02] active:scale-95 ${
            isShortlisted
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              : "bg-white/[0.03] text-stone-400 border-white/[0.08] hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/25"
          }`}
        >
          <CheckCircle size={13} />
          {isShortlisted ? "Shortlisted" : "Shortlist"}
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onReject(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all hover:scale-[1.02] active:scale-95 ${
            isRejected
              ? "bg-rose-500/15 text-rose-400 border-rose-500/25"
              : "bg-white/[0.03] text-stone-400 border-white/[0.08] hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20"
          }`}
        >
          <XCircle size={13} />
          {isRejected ? "Rejected" : "Reject"}
        </button>

        <button
          onClick={onClick}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:scale-[1.05] active:scale-95 transition-all"
          title="View Full Profile"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
});

export default CandidateCard;
