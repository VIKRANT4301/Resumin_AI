import jsPDF from "jspdf";
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Download,
  ExternalLink,
  FileStack,
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
      evidence: item.evidence_text || "Evidence snippet unavailable.",
      type: item.evidence_type || "resume",
    }));
}

export default function Result({ mode = "candidate", data = {}, resume = {}, feedback = {}, matchResult = null }) {
  const isRagResult = Boolean(matchResult?.match);
  const summary = isRagResult ? matchResult.key_metrics || {} : data?.summary || {};
  const report = isRagResult ? matchResult.candidate_report || {} : {};
  const displayJobRole = data?.job_role || report?.job_role || matchResult?.metadata?.job_role || resume?.job_role || "Target Role";

  const score = isRagResult
    ? Number(matchResult?.match?.score ?? report?.match_percent ?? summary?.overall_score ?? 0)
    : Number(feedback?.score ?? data?.summary?.rank_score ?? data?.summary?.overall_score ?? 0);
  const confidence = isRagResult ? Number(matchResult?.match?.confidence ?? 0) : 0;
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
    : feedback?.summary || `Match score ${score}%`;
  const whySuitable = isRagResult ? strengths.slice(0, 3) : feedback?.why_candidate_fits || data?.summary?.shortlist_reasons || strengths.slice(0, 3);
  const trainingFocus = improvementItems.length ? improvementItems : missingSkills.map((skill) => `Build applied evidence for ${skill}`);
  const prepLinks = feedback?.preparation_plan || [];
  const detailedPlan = feedback?.improvement_plan || {};
  const evidenceCards = compactEvidence(data?.skill_scores || {});
  const verdict = getVerdict(score);

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

          <div className="grid gap-3 md:grid-cols-2 xl:w-[340px] xl:grid-cols-1">
            <div className="rounded-[2rem] border border-white/8 bg-[#120f0d]/85 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">Decision Signal</p>
              <p className="mt-3 text-5xl font-black text-white">{Math.round(score)}%</p>
              <p className="mt-2 text-sm leading-6 text-stone-400">
                {mode === "candidate" ? "Current fit against the selected role." : "Overall recruiter-ready semantic fit."}
              </p>
            </div>
            <button
              type="button"
              onClick={downloadPDF}
              className="rounded-[2rem] bg-amber-300 px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-stone-950 transition hover:bg-amber-200"
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
          subtext={confidence ? `Confidence ${Math.round(confidence * 100)}%` : "Primary semantic fit signal"}
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
              <div className="space-y-3">
                {evidenceCards.map((item) => (
                  <div key={`${item.skill}-${item.type}`} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex flex-wrap items-center gap-2">
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
            <TagGrid items={requiredSkills} emptyText="No required job skills were extracted yet." tone="info" />
          </SectionCard>

          <SectionCard title="Matched Skills" icon={CheckCircle2}>
            <TagGrid items={matchedSkills} emptyText="No strong matching skills were found yet." tone="success" />
          </SectionCard>

          <SectionCard title="Missing Skills" icon={XCircle}>
            <TagGrid items={missingSkills} emptyText="No major missing skills identified." tone="warn" />
          </SectionCard>

          <SectionCard title="Extracted Resume Skills" icon={UserRoundSearch}>
            <TagGrid items={extractedSkills} emptyText="No resume skills were extracted." tone="default" />
          </SectionCard>

          <SectionCard title="Strength Signals" icon={Sparkles}>
            <InsightList items={strengths} emptyText="No major strengths were generated yet." tone="success" />
          </SectionCard>

          <SectionCard title="Risk Signals" icon={XCircle}>
            <InsightList items={weaknesses} emptyText="No major risk areas highlighted." tone="rose" />
          </SectionCard>

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
