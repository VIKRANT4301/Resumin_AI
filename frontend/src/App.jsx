import { Suspense, lazy, startTransition, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import {
  BarChart3,
  Briefcase,
  Filter,
  Link2,
  LoaderCircle,
  Pencil,
  Plus,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import AuthPage from "./pages/AuthPage";
import DashboardShell from "./pages/DashboardShell";
import RecruiterLayout from "./components/RecruiterLayout";
import { SESSION_KEY, restoreStoredSession, createAuthorizedApi } from "./services/api";
import { normalizeListInput, getRiskLevel } from "./utils/formatters";
import { navigate, readRoute } from "./utils/navigation";
import { ActionModal, AuthInput, authCardClass, FieldArea, LoadingPanel, ScoreBand, TabButton, ToastBanner } from "./components/ui/primitives";

const Result = lazy(() => import("./components/Result"));
const Ranking = lazy(() => import("./components/Ranking"));
const SpaceThemeLandingPage = lazy(() => import("./pages/SpaceThemeLandingPage"));

function CandidateJobsPanel({ api, onAuthError }) {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [jobsResponse, applicationsResponse] = await Promise.all([
        api.get("/jobs/public"),
        api.get("/applications/mine"),
      ]);
      setJobs(jobsResponse.data.results || []);
      setApplications(applicationsResponse.data.results || []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        onAuthError();
        return;
      }
      setError(err.response?.data?.detail || err.response?.data?.message || err.message || "Unable to load jobs.");
    } finally {
      setLoading(false);
    }
  }, [api, onAuthError]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const applicationLookup = useMemo(
    () => new Map(applications.map((item) => [item.job_key, item])),
    [applications]
  );

  const applyToJob = async (jobKey) => {
    try {
      await api.post(`/jobs/${jobKey}/apply`);
      await loadJobs();
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        onAuthError();
        return;
      }
      setError(err.response?.data?.detail || err.response?.data?.message || err.message || "Unable to apply to this job.");
    }
  };

  if (loading) {
    return <LoadingPanel label="Loading candidate-visible job postings" />;
  }

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-[1.4rem] border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div> : null}

      <section className={authCardClass}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">Open Jobs</p>
            <h3 className="mt-2 text-3xl font-black text-white">Roles visible only to candidate accounts</h3>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-stone-300">
            {jobs.length} job posts
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {jobs.map((job) => {
            const application = applicationLookup.get(job.job_key);
            return (
              <div key={job.job_key} className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-black text-white">{job.title}</p>
                    <p className="mt-2 text-sm text-stone-400">
                      {job.experience_level || "Experience level flexible"}
                      {job.salary_range ? ` | ${job.salary_range}` : ""}
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-[#120f0d] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-stone-300">
                    {application ? application.status : "New"}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-stone-300">{job.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(job.required_skills || []).map((skill) => (
                    <span key={skill} className="rounded-full border border-cyan-300/20 bg-cyan-300/8 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-cyan-100">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => applyToJob(job.job_key)}
                    disabled={Boolean(application)}
                    className="rounded-[1rem] bg-amber-300 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-stone-950 disabled:opacity-60"
                  >
                    {application ? "Applied" : "Apply to Job"}
                  </button>
                  <div className="rounded-[1rem] border border-white/10 bg-[#120f0d] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-stone-300">
                    Candidate only visibility
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className={authCardClass}>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">My Applications</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {applications.map((item) => (
            <div key={`${item.job_key}-${item.title}`} className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-lg font-black text-white">{item.title}</p>
              <p className="mt-2 text-sm text-stone-400">{item.status}</p>
              <p className="mt-3 text-sm leading-6 text-stone-300">{item.description}</p>
            </div>
          ))}
          {!applications.length ? <p className="text-sm text-stone-500">No applications yet.</p> : null}
        </div>
      </section>
    </div>
  );
}

function ProfileSection({ profile, resumeRecord, onSectionChange, onUpdateProfile }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ current_title: profile?.current_title || "", target_title: profile?.target_title || "" });
  const skills = resumeRecord?.skills || [];
  const experience = resumeRecord?.experience || [];
  const projects = resumeRecord?.projects || [];
  const save = () => { onUpdateProfile?.(form); setEditing(false); };

  return (
    <div className="space-y-6 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0 rounded-[2rem]">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-500/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-10 w-60 h-60 bg-purple-500/6 rounded-full blur-3xl" />
      </div>

      {/* Profile Card */}
      <Motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 glass-card rounded-[2rem] p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #f5bd4e, #e07b39)", boxShadow: "0 0 30px rgba(245,189,78,0.2)" }}>
            {(profile?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">Candidate Profile</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white truncate">{profile?.name || "Unnamed"}</h2>
            <p className="mt-1 text-sm text-stone-400">{profile?.email}</p>
          </div>
          <button type="button" onClick={() => setEditing(!editing)}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-stone-300 hover:text-white hover:border-white/20 transition shrink-0">
            {editing ? "Cancel" : "Edit Titles"}
          </button>
        </div>
        {!editing ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Current Title</p>
              <p className="mt-2 text-lg font-black text-white">{profile?.current_title || "Not set"}</p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.08] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Target Title</p>
              <p className="mt-2 text-lg font-black text-white">{profile?.target_title || "Not set"}</p>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <AuthInput label="Current Title" value={form.current_title}
              onChange={e => setForm(f => ({ ...f, current_title: e.target.value }))} placeholder="e.g. Senior Frontend Engineer" />
            <AuthInput label="Target Title" value={form.target_title}
              onChange={e => setForm(f => ({ ...f, target_title: e.target.value }))} placeholder="e.g. Staff Engineer" />
            <button type="button" onClick={save}
              className="rounded-xl bg-amber-400 px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-900 transition hover:-translate-y-0.5 hover:shadow-lg">
              Save Changes
            </button>
          </div>
        )}
      </Motion.div>

      {/* Stats */}
      <Motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="relative z-10 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Skills", value: skills.length, color: "border-cyan-500/20 bg-cyan-500/[0.07]" },
          { label: "Experience", value: experience.length, color: "border-purple-500/20 bg-purple-500/[0.07]" },
          { label: "Projects", value: projects.length, color: "border-emerald-500/20 bg-emerald-500/[0.07]" },
        ].map(stat => (
          <div key={stat.label} className={`glass-card rounded-[1.6rem] p-6 border ${stat.color}`}>
            <p className="text-4xl font-black text-white">{stat.value}</p>
            <p className="mt-2 text-xs font-black uppercase tracking-wider text-stone-400">{stat.label} detected</p>
          </div>
        ))}
      </Motion.div>

      {/* Skills cloud */}
      {skills.length > 0 ? (
        <Motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          className="relative z-10 glass-card rounded-[2rem] p-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-stone-400 mb-4">Resume Skills · {skills.length} detected</p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <span key={idx} className="rounded-full border border-amber-500/20 bg-amber-500/[0.08] px-3 py-1.5 text-xs font-bold text-amber-200">
                {typeof skill === "string" ? skill : skill?.name || skill}
              </span>
            ))}
          </div>
        </Motion.div>
      ) : (
        <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="relative z-10 glass-card rounded-[2rem] p-8 text-center border border-dashed border-white/10">
          <p className="text-stone-400 text-sm">No resume data yet.</p>
          <button type="button" onClick={() => onSectionChange?.("Analysis")}
            className="mt-4 rounded-xl bg-amber-400/10 border border-amber-400/20 px-4 py-2 text-xs font-black uppercase tracking-wider text-amber-400 hover:bg-amber-400/20 transition">
            Upload Resume in Analysis →
          </button>
        </Motion.div>
      )}
    </div>
  );
}

function InsightsSection({ matchResult, feedback, onSectionChange }) {
  if (!matchResult && !feedback) {
    return (
      <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-[2rem] p-10 sm:p-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-800 border border-white/5 flex items-center justify-center mx-auto mb-6">
          <Sparkles size={28} className="text-stone-500" />
        </div>
        <p className="text-xl font-black text-stone-300">No insights yet</p>
        <p className="mt-3 text-sm text-stone-500 max-w-xs mx-auto">
          Run a job match analysis in the Analysis section to generate AI-powered career insights.
        </p>
        <button type="button" onClick={() => onSectionChange?.("Analysis")}
          className="mt-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:-translate-y-0.5 hover:shadow-lg">
          Go to Analysis →
        </button>
      </Motion.div>
    );
  }

  const score = Number(matchResult?.match?.score ?? matchResult?.summary?.overall_score ?? 0);
  const verdictColor = score >= 80 ? "#4cc890" : score >= 60 ? "#f5bd4e" : "#fb7185";
  const verdictLabel = score >= 80 ? "Strong Match" : score >= 60 ? "Moderate Match" : "Needs Improvement";
  const jobRole = matchResult?.metadata?.job_role || matchResult?.candidate_report?.job_role || "Target Role";
  const strengths = matchResult?.candidate_report?.pros || matchResult?.insights?.strengths || feedback?.strengths || [];
  const missingSkills = matchResult?.candidate_report?.missing_skills || feedback?.missing_skills || [];
  const recommendations = (matchResult?.candidate_report?.improvements || matchResult?.insights?.recommendations || feedback?.improvements || []).slice(0, 5);

  return (
    <div className="space-y-6 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0 rounded-[2rem]">
        <div className="absolute -top-20 right-0 w-64 h-64 bg-purple-500/6 rounded-full blur-3xl" />
      </div>

      {/* Score Overview */}
      <Motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 glass-card rounded-[2rem] p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-purple-300">Last Analysis</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black text-white">{jobRole}</h2>
            <div className="mt-3 inline-flex rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em]"
              style={{ borderColor: `${verdictColor}40`, backgroundColor: `${verdictColor}18`, color: verdictColor }}>
              {verdictLabel}
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-center gap-2">
            <div className="w-24 h-24 rounded-full border-[3px] flex items-center justify-center"
              style={{ borderColor: verdictColor, boxShadow: `0 0 24px ${verdictColor}30` }}>
              <div className="text-center">
                <p className="text-3xl font-black" style={{ color: verdictColor }}>{Math.round(score)}</p>
                <p className="text-[9px] text-stone-500 uppercase tracking-wider">/ 100</p>
              </div>
            </div>
            <p className="text-xs text-stone-500">Match Score</p>
          </div>
        </div>
      </Motion.div>

      {/* Strengths + Gaps */}
      <div className="relative z-10 grid gap-4 md:grid-cols-2">
        <Motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="glass-card rounded-[1.8rem] p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300 mb-3">💪 Strengths</p>
          <div className="space-y-2">
            {strengths.length ? strengths.slice(0, 5).map((s, i) => (
              <div key={i} className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.07] p-3 text-sm text-emerald-50">{s}</div>
            )) : <p className="text-sm text-stone-500">No strength signals detected.</p>}
          </div>
        </Motion.div>
        <Motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="glass-card rounded-[1.8rem] p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300 mb-3">⚡ Skill Gaps</p>
          <div className="space-y-2">
            {missingSkills.length ? missingSkills.slice(0, 6).map((s, i) => (
              <div key={i} className="rounded-xl border border-amber-500/15 bg-amber-500/[0.07] p-3 text-sm text-amber-50">
                {typeof s === "string" ? s : s?.skill || s}
              </div>
            )) : <p className="text-sm text-stone-500">No critical gaps detected.</p>}
          </div>
        </Motion.div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
          className="relative z-10 glass-card rounded-[2rem] p-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300 mb-4">🎯 Strategic Recommendations</p>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="rounded-xl border border-cyan-500/15 bg-cyan-500/[0.07] p-4 text-sm leading-6 text-cyan-50">
                {typeof rec === "string" ? rec : rec?.action || rec?.tip || JSON.stringify(rec)}
              </div>
            ))}
          </div>
        </Motion.div>
      )}

      {/* CTA */}
      <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="relative z-10 glass-panel rounded-[1.5rem] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/8">
        <div>
          <p className="text-sm font-black text-white">Ready for a new analysis?</p>
          <p className="mt-1 text-xs text-stone-400">Compare against a different job description to see updated insights.</p>
        </div>
        <button type="button" onClick={() => onSectionChange?.("Analysis")}
          className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:-translate-y-0.5 hover:shadow-lg shrink-0">
          Run New Analysis →
        </button>
      </Motion.div>
    </div>
  );
}

function CandidateDashboard({ session, setSession, api, onAuthError, activeSection = "Analysis", onSectionChange }) {
  const [inputMode, setInputMode] = useState("text");
  const [jobText, setJobText] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [error, setError] = useState("");
  const [resumeMessage, setResumeMessage] = useState("");
  const [matchResult, setMatchResult] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [resume, setResume] = useState(session?.user?.resume || null);
  const [resumeFile, setResumeFile] = useState(null);
  const [showResumeDetails, setShowResumeDetails] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);

  const profile = session?.user || {};
  const hasResume = Boolean(resume || profile.resume);
  const resumeRecord = resume || profile.resume || {};
  const lastUpdated = resumeRecord?._updated_at || profile.updated_at || "";
  const activeJobInput = inputMode === "url" ? jobUrl.trim() : jobText.trim();

  const syncSessionProfile = (nextProfile, nextResume) => {
    const nextAuth = {
      ...session,
      user: {
        ...session.user,
        ...nextProfile,
        resume: nextResume,
      },
    };
    setSession(nextAuth);
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextAuth));
  };

  const runMatch = async () => {
    const jobInput = activeJobInput;
    if (!jobInput) {
      setError(inputMode === "url" ? "Paste a job URL before running the candidate analysis." : "Paste a job description before running the candidate analysis.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("email", profile.email);
      formData.append("job_input", jobInput);

      const response = await api.post("/profile/match", formData);
      if (response.data.status !== "success") {
        throw new Error(response.data.message || "Candidate analysis failed");
      }

      syncSessionProfile(response.data.profile, response.data.resume);

      setMatchResult(response.data.match);
      setFeedback(response.data.feedback);
      setResume(response.data.resume);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        onAuthError();
        return;
      }
      setError(err.response?.data?.detail || err.response?.data?.message || err.message || "Candidate analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const updateResume = async ({ confirmed = false } = {}) => {
    if (!resumeFile) {
      setError("Choose a resume file before uploading.");
      return;
    }

    if (hasResume && !confirmed) {
      setConfirmReplace(true);
      return;
    }

    setResumeLoading(true);
    setError("");
    setResumeMessage("");
    try {
      const formData = new FormData();
      formData.append("email", profile.email);
      formData.append("confirm_replace", confirmed ? "true" : "false");
      formData.append("file", resumeFile);

      const response = await api.post("/profile/resume", formData);
      if (response.data.status !== "success") {
        throw new Error(response.data.message || "Resume update failed");
      }

      syncSessionProfile(response.data.profile, response.data.resume);
      setResume(response.data.resume);
      setResumeMessage(response.data.message || "Resume updated successfully.");
      setResumeFile(null);
      setConfirmReplace(false);

      if (activeJobInput) {
        await runMatch();
      } else {
        setMatchResult(null);
        setFeedback(null);
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        onAuthError();
        return;
      }
      setError(err.response?.data?.detail || err.response?.data?.message || err.message || "Resume update failed.");
    } finally {
      setResumeLoading(false);
    }
  };

  const formattedUpdatedAt = lastUpdated ? new Date(lastUpdated).toLocaleString() : "Not available";

  const updateProfileTitles = (updates) => {
    syncSessionProfile({ ...session.user, ...updates }, resume || profile.resume);
  };

  if (activeSection === "Profile") {
    return (
      <div className="space-y-8 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2rem] z-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl opacity-50" />
        </div>
        <ProfileSection
          profile={profile}
          resumeRecord={resumeRecord}
          onSectionChange={onSectionChange}
          onUpdateProfile={updateProfileTitles}
        />
      </div>
    );
  }

  if (activeSection === "Insights") {
    return (
      <div className="space-y-8 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2rem] z-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl opacity-50" />
        </div>
        <InsightsSection
          matchResult={matchResult}
          feedback={feedback}
          onSectionChange={onSectionChange}
        />
      </div>
    );
  }

  if (activeSection === "Jobs") {
    return (
      <div className="space-y-8 relative">
        <div className="relative z-10 glass-card p-6 rounded-[2rem]">
          <CandidateJobsPanel api={api} onAuthError={onAuthError} />
        </div>
      </div>
    );
  }

  // Default: Analysis
  return (
    <div className="space-y-8 relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2rem] z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 grid gap-8 grid-cols-1 lg:grid-cols-2">
        <div className="space-y-8">
          <Motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 md:p-8 rounded-[2rem]"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-gradient-multi">Candidate Workspace</p>
            <h1 className="mt-4 font-display text-5xl font-black tracking-tight text-[var(--text-main)] md:text-6xl text-gradient-blue-purple leading-[1.1]">Own your fit story before a recruiter sees it</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-muted)]">
              The analysis prioritizes exact skill gaps, weekly upskilling moves, and recruiter-style risk signals. Your saved titles stay attached to the session so the platform can position you consistently.
            </p>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-4 md:grid-cols-3 perspective-[2000px]"
          >
            <div className="glass-card p-6 rounded-[1.6rem] flex flex-col items-center justify-center transition-transform hover:-translate-y-1">
              <ScoreBand score={matchResult?.summary?.overall_score || 0} label="Current Fit" accent="amber" />
            </div>
            <div className="glass-card p-6 rounded-[1.6rem] hover:-translate-y-1 transition-all group">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] group-hover:text-blue-400 transition-colors">Current Title</p>
              <p className="mt-4 text-2xl font-bold text-[var(--text-main)]">{profile.current_title || "Not set"}</p>
            </div>
            <div className="glass-card p-6 rounded-[1.6rem] hover:-translate-y-1 transition-all group">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] group-hover:text-purple-400 transition-colors">Target Title</p>
              <p className="mt-4 text-2xl font-black text-[var(--text-main)]">{profile.target_title || "Not set"}</p>
            </div>
          </Motion.div>
        </div>

        <div className="space-y-6">
          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 rounded-[1.6rem] relative overflow-hidden"
          >
            {hasResume && <div className="absolute top-6 right-6 w-16 h-16 bg-emerald-500/20 blur-xl rounded-full" />}
            <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Resume Status</p>
                <p className="mt-2 text-xl font-bold text-[var(--text-main)]">{hasResume ? "Resume Active" : "Resume Required"}</p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  {hasResume ? `Last updated: ${formattedUpdatedAt}` : "Upload your latest resume to power analysis and recruiter ranking."}
                </p>
              </div>
              <div className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider shadow-sm ${hasResume ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border border-amber-500/30 bg-amber-500/10 text-amber-400"}`}>
                {hasResume ? "Uploaded" : "Not Uploaded"}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 relative z-10">
              <label className="cursor-pointer rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-main)] transition hover:border-[#f5bd4e]/50 hover:bg-[#f5bd4e]/10">
                {hasResume ? "Update Resume" : "Upload Resume"}
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(event) => {
                  setResumeFile(event.target.files?.[0] || null);
                  setConfirmReplace(false);
                  setResumeMessage("");
                }} />
              </label>
              <button
                type="button"
                onClick={() => setShowResumeDetails(c => !c)}
                disabled={!hasResume}
                className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-3.5 text-xs font-black uppercase tracking-[0.18em] text-[var(--text-muted)] transition hover:text-[var(--text-main)] hover:border-[var(--glass-border-hover)] disabled:cursor-not-allowed disabled:opacity-30"
              >
                View Resume
              </button>
            </div>

            {resumeFile ? (
              <div className="mt-4 glass-panel p-5 rounded-xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Selected File</p>
                <p className="mt-2 text-sm font-semibold text-[var(--text-main)]">{resumeFile.name}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={() => updateResume({ confirmed: !hasResume })} disabled={resumeLoading}
                    className="rounded-xl bg-amber-400 px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-900 transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70">
                    {resumeLoading ? "Uploading..." : hasResume ? "Continue Update" : "Upload Resume"}
                  </button>
                  <button type="button" onClick={() => { setResumeFile(null); setConfirmReplace(false); }}
                    className="rounded-[1rem] border border-[var(--glass-border)] bg-transparent px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            {confirmReplace ? (
              <div className="mt-4 rounded-[1.2rem] border border-amber-300/30 bg-amber-300/10 p-5 text-sm text-amber-500">
                <p className="font-black">Uploading a new resume will replace your existing data.</p>
                <p className="mt-2 leading-6 opacity-90">We'll re-parse your latest resume and replace the active skills, experience, and profile data.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={() => updateResume({ confirmed: true })} disabled={resumeLoading}
                    className="rounded-xl bg-amber-400 px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-900 transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70">
                    {resumeLoading ? "Replacing..." : "Confirm Replace"}
                  </button>
                  <button type="button" onClick={() => setConfirmReplace(false)}
                    className="rounded-[1rem] border border-amber-300/30 bg-transparent px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-amber-500 hover:bg-amber-300/10 transition-colors">
                    Keep Current Resume
                  </button>
                </div>
              </div>
            ) : null}

            {resumeMessage ? <div className="mt-4 rounded-[1.2rem] border border-[#4cc890]/30 bg-[#4cc890]/10 p-4 text-sm text-[#4cc890]">{resumeMessage}</div> : null}

            {showResumeDetails && hasResume ? (
              <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-5 glass-panel p-5 rounded-[1.2rem]">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Active Resume Snapshot</p>
                <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-3">
                  {[["Skills", resumeRecord.skills], ["Experience", resumeRecord.experience], ["Projects", resumeRecord.projects]].map(([label, arr]) => (
                    <div key={label} className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
                      <p className="mt-2 text-2xl font-bold text-[var(--text-main)]">{(arr || []).length}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(resumeRecord.skills || []).slice(0, 12).map((skill) => (
                    <span key={skill} className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-500">{skill}</span>
                  ))}
                  {!(resumeRecord.skills || []).length ? <p className="text-sm text-[var(--text-muted)]">No parsed skills available yet.</p> : null}
                </div>
              </Motion.div>
            ) : null}
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 rounded-[1.6rem]"
          >
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button type="button" onClick={() => setInputMode("text")}
                className={`rounded-xl px-4 py-4 text-left transition-all ${inputMode === "text" ? "bg-gradient-to-r from-[#5B8CFF]/20 to-[#8A2BE2]/20 border border-[#5B8CFF]/30 shadow-[0_0_20px_rgba(91,140,255,0.15)] text-[var(--text-main)]" : "bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]"}` }>
                <p className="text-xs font-black uppercase tracking-[0.16em]">Paste JD</p>
                <p className="mt-2 text-xs leading-5 opacity-80">Use recruiter-written role text.</p>
              </button>
              <button type="button" onClick={() => setInputMode("url")}
                className={`rounded-xl px-4 py-4 text-left transition-all ${inputMode === "url" ? "bg-gradient-to-r from-[#5B8CFF]/20 to-[#8A2BE2]/20 border border-[#8A2BE2]/30 shadow-[0_0_20px_rgba(138,43,226,0.15)] text-[var(--text-main)]" : "bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]"}` }>
                <div className="flex items-center gap-2"><Link2 size={14} /><p className="text-xs font-black uppercase tracking-[0.16em]">Job URL</p></div>
                <p className="mt-2 text-xs leading-5 opacity-80">Extract a live listing.</p>
              </button>
            </div>

            {inputMode === "text" ? (
              <div className="mb-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)] mb-3">Target Job Description</p>
                <textarea value={jobText} onChange={(e) => setJobText(e.target.value)}
                  placeholder="Paste the role you want to target..."
                  className="h-40 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 text-sm text-[var(--text-main)] outline-none placeholder:text-[var(--text-muted)] focus:border-[#5B8CFF]/50 transition-all resize-none" />
              </div>
            ) : (
              <div className="mb-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)] mb-3">Job URL</p>
                <input type="text" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://company.com/jobs/role"
                  className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 text-sm text-[var(--text-main)] outline-none placeholder:text-[var(--text-muted)] focus:border-[#8A2BE2]/50 transition-all" />
              </div>
            )}

            <button type="button" onClick={runMatch}
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
              Analyze My Fit
            </button>
          </Motion.div>
        </div>
      </div>

      {/* Results */}
      <div className="relative z-10">
        {error ? <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-500">{error}</div> : null}
        {loading ? <LoadingPanel label="Building a recruiter-style candidate analysis" /> : null}
        {!loading && matchResult ? (
          <Suspense fallback={<LoadingPanel label="Preparing candidate insight report" />}>
            <div className="mt-8 animate-fade-up">
              <Result mode="candidate" data={matchResult} resume={resume || profile.resume || {}} feedback={feedback || {}} />
            </div>
          </Suspense>
        ) : null}
      </div>
    </div>
  );
}

function RecruiterAnalyticsSection({ meta, rankingCards, onSectionChange }) {
  if (!meta && !rankingCards.length) {
    return (
      <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-[2rem] p-10 sm:p-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#0B1020] border border-white/5 flex items-center justify-center mx-auto mb-6">
          <BarChart3 size={28} className="text-stone-500" />
        </div>
        <p className="text-xl font-black text-stone-300">No analytics yet</p>
        <p className="mt-3 text-sm text-stone-500 max-w-xs mx-auto">Run a candidate ranking from the Dashboard to generate analytics data.</p>
        <button type="button" onClick={() => onSectionChange?.("Dashboard")}
          className="mt-6 rounded-full bg-gradient-to-r from-[#5B8CFF] to-[#8A2BE2] px-6 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:-translate-y-0.5 hover:shadow-lg">
          Go to Dashboard →
        </button>
      </Motion.div>
    );
  }
  const total = meta?.total || rankingCards.length;
  const shortlisted = meta?.shortlisted || 0;
  const rejected = meta?.rejected || 0;
  const topScore = rankingCards[0]?.score || 0;
  const avgScore = rankingCards.length ? Math.round(rankingCards.reduce((a, c) => a + (c.score || 0), 0) / rankingCards.length) : 0;
  const riskCounts = rankingCards.reduce((acc, c) => { const r = c.riskLevel || "medium"; acc[r] = (acc[r] || 0) + 1; return acc; }, { low: 0, medium: 0, high: 0 });
  const reliability = meta?.reliability || {};
  return (
    <div className="space-y-6">
      <Motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-[2rem] p-6 md:p-8">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#5B8CFF]">Analytics Overview</p>
        <h2 className="mt-2 text-2xl sm:text-3xl font-black text-white">{meta?.role || "Last Ranking Session"}</h2>
        <p className="mt-1 text-sm text-stone-400">{total} candidates evaluated</p>
      </Motion.div>
      <Motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Ranked", value: total, color: "border-[#5B8CFF]/20 bg-[#5B8CFF]/[0.07]", tv: "#5B8CFF" },
          { label: "Shortlisted", value: shortlisted, color: "border-[#4cc890]/20 bg-[#4cc890]/[0.07]", tv: "#4cc890" },
          { label: "Rejected", value: rejected, color: "border-rose-500/20 bg-rose-500/[0.07]", tv: "#fb7185" },
          { label: "Top Score", value: `${Math.round(topScore)}%`, color: "border-amber-500/20 bg-amber-500/[0.07]", tv: "#f5bd4e" },
        ].map(s => (
          <div key={s.label} className={`glass-card rounded-[1.6rem] p-6 border ${s.color}`}>
            <p className="text-xs font-black uppercase tracking-wider text-stone-500">{s.label}</p>
            <p className="mt-4 text-4xl font-black" style={{ color: s.tv }}>{s.value}</p>
          </div>
        ))}
      </Motion.div>
      <div className="grid gap-4 md:grid-cols-2">
        <Motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-[1.8rem] p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#5B8CFF] mb-4">📊 Ranking Quality</p>
          <div className="space-y-4">
            {[
              { label: "Overall Reliability", value: Math.round(reliability.overall_reliability || 0) },
              { label: "Precision @ K", value: Math.round(reliability.precision_at_k || 0) },
              { label: "NDCG Score", value: Math.round(reliability.ndcg || 0) },
              { label: "Avg Match Score", value: avgScore },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-stone-400 font-semibold">{item.label}</span>
                  <span className="text-white font-black">{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <Motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, item.value)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-[#5B8CFF] to-[#8A2BE2]" />
                </div>
              </div>
            ))}
          </div>
        </Motion.div>
        <Motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}
          className="glass-card rounded-[1.8rem] p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300 mb-4">⚡ Risk Distribution</p>
          <div className="space-y-4">
            {[
              { label: "Low Risk", count: riskCounts.low, color: "#4cc890", bg: "bg-[#4cc890]" },
              { label: "Medium Risk", count: riskCounts.medium, color: "#f5bd4e", bg: "bg-amber-400" },
              { label: "High Risk", count: riskCounts.high, color: "#fb7185", bg: "bg-rose-400" },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-stone-400 font-semibold">{item.label}</span>
                  <span className="font-black" style={{ color: item.color }}>{item.count} candidates</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <Motion.div initial={{ width: 0 }}
                    animate={{ width: total ? `${(item.count / total) * 100}%` : "0%" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${item.bg}`} />
                </div>
              </div>
            ))}
          </div>
        </Motion.div>
      </div>
      <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="glass-panel rounded-[1.5rem] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/8">
        <div>
          <p className="text-sm font-black text-white">Ready to rank again?</p>
          <p className="mt-1 text-xs text-stone-400">Run a fresh ranking to update these analytics.</p>
        </div>
        <button type="button" onClick={() => onSectionChange?.("Dashboard")}
          className="rounded-xl bg-gradient-to-r from-[#5B8CFF] to-[#8A2BE2] px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:-translate-y-0.5 hover:shadow-lg shrink-0">
          Go to Dashboard →
        </button>
      </Motion.div>
    </div>
  );
}

function RecruiterCandidatesSection({ rankingCards, onSectionChange }) {
  const [filter, setFilter] = useState("all");
  if (!rankingCards.length) {
    return (
      <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-[2rem] p-10 sm:p-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#0B1020] border border-white/5 flex items-center justify-center mx-auto mb-6">
          <Users size={28} className="text-stone-500" />
        </div>
        <p className="text-xl font-black text-stone-300">No candidates yet</p>
        <p className="mt-3 text-sm text-stone-500 max-w-xs mx-auto">Rank candidates from the Dashboard to build your candidate pool here.</p>
        <button type="button" onClick={() => onSectionChange?.("Dashboard")}
          className="mt-6 rounded-full bg-gradient-to-r from-[#5B8CFF] to-[#8A2BE2] px-6 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:-translate-y-0.5 hover:shadow-lg">
          Rank Candidates →
        </button>
      </Motion.div>
    );
  }
  const shortlistedCount = rankingCards.filter(c => c.shortlisted).length;
  const rejectedCount = rankingCards.filter(c => c.rejected).length;
  const filtered = filter === "shortlisted" ? rankingCards.filter(c => c.shortlisted)
    : filter === "rejected" ? rankingCards.filter(c => c.rejected)
    : rankingCards;
  return (
    <div className="space-y-6">
      <Motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-[2rem] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#5B8CFF]">Candidate Pool</p>
          <h2 className="mt-1 text-xl sm:text-2xl font-black text-white">{rankingCards.length} Candidates Ranked</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[{ label: "All", value: "all", count: rankingCards.length },
            { label: "Shortlisted", value: "shortlisted", count: shortlistedCount },
            { label: "Rejected", value: "rejected", count: rejectedCount },
          ].map(tab => (
            <button key={tab.value} type="button" onClick={() => setFilter(tab.value)}
              className={`rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wider transition ${filter === tab.value ? "bg-[#5B8CFF]/20 border border-[#5B8CFF]/30 text-[#5B8CFF]" : "border border-white/10 bg-white/[0.02] text-stone-400 hover:text-white"}`}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </Motion.div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c, idx) => {
          const sc = c.score >= 80 ? "#4cc890" : c.score >= 60 ? "#f5bd4e" : "#fb7185";
          return (
            <Motion.div key={c.id || idx} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
              className="glass-card rounded-[1.8rem] p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-black text-sm text-white"
                    style={{ background: "linear-gradient(135deg, #5B8CFF, #8A2BE2)" }}>
                    {(c.candidate || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-white text-sm truncate">{c.candidate}</p>
                    <p className="text-xs text-stone-500 truncate">{c.email || c.role}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xl font-black" style={{ color: sc }}>{Math.round(c.score)}%</p>
                  <p className="text-[9px] text-stone-600 uppercase tracking-wider">Rank #{c.rank || idx + 1}</p>
                </div>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${c.score}%`, backgroundColor: sc }} />
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {c.shortlisted && <span className="rounded-full border border-[#4cc890]/30 bg-[#4cc890]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#4cc890]">Shortlisted</span>}
                {c.rejected && <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-rose-400">Rejected</span>}
                {!c.shortlisted && !c.rejected && <span className="rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-stone-500">Pending</span>}
                <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${c.riskLevel === "low" ? "border-[#4cc890]/20 text-[#4cc890]" : c.riskLevel === "high" ? "border-rose-500/20 text-rose-400" : "border-amber-500/20 text-amber-400"}`}>
                  {c.riskLevel || "medium"} risk
                </span>
              </div>
            </Motion.div>
          );
        })}
      </div>
      {!filtered.length && <p className="text-center text-stone-500 py-8">No candidates match this filter.</p>}
    </div>
  );
}

function RecruiterSettingsSection({ session, onLogout }) {
  const profile = session?.user || {};
  const userName = profile.name || profile.email || "Recruiter";
  const userInitial = userName.charAt(0).toUpperCase();
  return (
    <div className="space-y-6">
      <Motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-[2rem] p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #5B8CFF, #8A2BE2)", boxShadow: "0 0 30px rgba(91,140,255,0.2)" }}>
            {userInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#5B8CFF]">Recruiter Account</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white truncate">{profile.name || "Recruiter"}</h2>
            <p className="mt-1 text-sm text-stone-400">{profile.email}</p>
          </div>
          <div className="inline-flex rounded-full border border-[#5B8CFF]/30 bg-[#5B8CFF]/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#5B8CFF] shrink-0">Recruiter Pro</div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Role</p>
            <p className="mt-2 text-lg font-black text-white capitalize">{profile.role || "Recruiter"}</p>
          </div>
          <div className="rounded-xl border border-[#5B8CFF]/20 bg-[#5B8CFF]/[0.06] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5B8CFF]">Access Level</p>
            <p className="mt-2 text-lg font-black text-white">Pro Workspace</p>
          </div>
        </div>
      </Motion.div>
      <Motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="glass-card rounded-[2rem] p-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-stone-400 mb-4">Workspace Preferences</p>
        <div className="space-y-3">
          {[
            { label: "Smart Candidate Filtering", desc: "AI-powered risk and score filters", on: true },
            { label: "Recruiter Analytics", desc: "Precision and ranking quality metrics", on: true },
            { label: "Bulk Resume Mode", desc: "Upload and rank batch resumes", on: true },
            { label: "Candidate Notifications", desc: "Get notified on shortlist actions", on: false },
          ].map(pref => (
            <div key={pref.label} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div>
                <p className="text-sm font-bold text-white">{pref.label}</p>
                <p className="text-xs text-stone-500 mt-0.5">{pref.desc}</p>
              </div>
              <div className={`w-10 h-6 rounded-full transition ${pref.on ? "bg-[#5B8CFF]" : "bg-white/10"}`} />
            </div>
          ))}
        </div>
      </Motion.div>
      <Motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
        className="glass-card rounded-[2rem] p-6 border border-rose-500/15">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-400 mb-4">Account Actions</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-white">Sign Out</p>
            <p className="text-xs text-stone-500 mt-0.5">End your current recruiter session securely.</p>
          </div>
          <button type="button" onClick={onLogout}
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-xs font-black uppercase tracking-wider text-rose-300 transition hover:bg-rose-500/20 hover:border-rose-500/50 shrink-0">
            Sign Out
          </button>
        </div>
      </Motion.div>
    </div>
  );
}

function RecruiterJobManager({ api, onAuthError, onUseJobForRanking }) {
  const emptyForm = { title: "", requiredSkills: "", experienceLevel: "", salaryRange: "", description: "" };
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingJobKey, setEditingJobKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/jobs/mine");
      setJobs(response.data.results || []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        onAuthError();
        return;
      }
      setError(err.response?.data?.detail || err.response?.data?.message || err.message || "Unable to load recruiter job posts.");
    } finally {
      setLoading(false);
    }
  }, [api, onAuthError]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const submit = async () => {
    try {
      const payload = {
        title: form.title,
        required_skills: normalizeListInput(form.requiredSkills),
        experience_level: form.experienceLevel,
        salary_range: form.salaryRange,
        description: form.description,
      };
      if (editingJobKey) {
        await api.put(`/jobs/${editingJobKey}`, payload);
      } else {
        await api.post("/jobs", payload);
      }
      setForm(emptyForm);
      setEditingJobKey("");
      await loadJobs();
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        onAuthError();
        return;
      }
      setError(err.response?.data?.detail || err.response?.data?.message || err.message || "Unable to save recruiter job post.");
    }
  };

  const removeJob = async (jobKey) => {
    try {
      await api.delete(`/jobs/${jobKey}`);
      await loadJobs();
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        onAuthError();
        return;
      }
      setError(err.response?.data?.detail || err.response?.data?.message || err.message || "Unable to delete recruiter job post.");
    }
  };

  const startEdit = (job) => {
    setEditingJobKey(job.job_key);
    setForm({
      title: job.title || "",
      requiredSkills: (job.required_skills || []).join(", "),
      experienceLevel: job.experience_level || "",
      salaryRange: job.salary_range || "",
      description: job.description || "",
    });
  };

  return (
    <div className="space-y-6">
      <section className={authCardClass}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Recruiter Control</p>
            <h3 className="mt-2 text-3xl font-black text-white">{editingJobKey ? "Edit Job Post" : "Create Job Post"}</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingJobKey("");
              setForm(emptyForm);
            }}
            className="rounded-full border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-stone-300"
          >
            Reset Form
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <AuthInput label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Senior Backend Engineer" />
          <AuthInput label="Experience Level" value={form.experienceLevel} onChange={(event) => setForm((current) => ({ ...current, experienceLevel: event.target.value }))} placeholder="3-5 years" />
          <AuthInput label="Required Skills" value={form.requiredSkills} onChange={(event) => setForm((current) => ({ ...current, requiredSkills: event.target.value }))} placeholder="Node.js, MongoDB, System Design" />
          <AuthInput label="Salary Range" value={form.salaryRange} onChange={(event) => setForm((current) => ({ ...current, salaryRange: event.target.value }))} placeholder="Optional" />
        </div>
        <div className="mt-4">
          <FieldArea label="Description">
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Write the job description..."
              className="h-40 w-full rounded-[1.2rem] border border-white/10 bg-[#120f0d] p-4 text-sm text-white outline-none placeholder:text-stone-500"
            />
          </FieldArea>
        </div>
        {error ? <div className="mt-4 rounded-[1.2rem] border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div> : null}
        <div className="mt-4 flex gap-3">
          <button type="button" onClick={submit} className="rounded-[1rem] bg-cyan-300 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-stone-950">
            <Plus size={13} className="mr-2 inline" />
            {editingJobKey ? "Update Job Post" : "Create Job Post"}
          </button>
          <div className="rounded-[1rem] border border-white/10 bg-[#120f0d] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-stone-300">
            Candidate-visible, recruiter-private ownership
          </div>
        </div>
      </section>

      <section className={authCardClass}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">My Job Posts</p>
            <p className="mt-2 text-sm text-stone-300">Only you can manage these posts. Candidates can see them, other recruiters cannot.</p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-stone-300">
            {jobs.length} posts
          </div>
        </div>

        {loading ? <div className="mt-6 text-sm text-stone-500">Loading job posts...</div> : null}
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {jobs.map((job) => (
            <div key={job.job_key} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xl font-black text-white">{job.title}</p>
              <p className="mt-2 text-sm text-stone-400">
                {job.experience_level || "Experience level flexible"}
                {job.salary_range ? ` | ${job.salary_range}` : ""}
              </p>
              <p className="mt-4 text-sm leading-6 text-stone-300">{job.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(job.required_skills || []).map((skill) => (
                  <span key={skill} className="rounded-full border border-cyan-300/20 bg-cyan-300/8 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-cyan-100">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" onClick={() => onUseJobForRanking(job)} className="rounded-[1rem] bg-cyan-300 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-stone-950">
                  <Target size={13} className="mr-2 inline" />
                  Use for Ranking
                </button>
                <button type="button" onClick={() => startEdit(job)} className="rounded-[1rem] border border-white/10 bg-[#120f0d] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-stone-100">
                  <Pencil size={13} className="mr-2 inline" />
                  Edit
                </button>
                <button type="button" onClick={() => removeJob(job.job_key)} className="rounded-[1rem] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-rose-100">
                  <Trash2 size={13} className="mr-2 inline" />
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!loading && !jobs.length ? <p className="text-sm text-stone-500">No recruiter job posts yet.</p> : null}
        </div>
      </section>
    </div>
  );
}

function RecruiterDashboard({ api, onAuthError, session, onLogout, activeSection = "Dashboard", onSectionChange }) {
  const [source, setSource] = useState("vault");
  const [inputMode, setInputMode] = useState("text");
  const [jobText, setJobText] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [selectedJobPost, setSelectedJobPost] = useState(null);
  const [topK, setTopK] = useState(10);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ranking, setRanking] = useState([]);
  const [decisions, setDecisions] = useState({});
  const [meta, setMeta] = useState(null);
  const [filters, setFilters] = useState({ scoreMin: 0, skill: "", risk: "all" });
  const [toast, setToast] = useState({ message: "", tone: "success" });
  const [rejectDialog, setRejectDialog] = useState({ open: false, candidateId: "", reason: "" });

  const candidateKey = (item) => item.email || item.name || String(item.rank || "");
  const buildActionStatePayload = () =>
    Object.entries(decisions).reduce((acc, [key, value]) => {
      if (value === "shortlisted" || value === "rejected") {
        acc[key] = {
          shortlisted: value === "shortlisted",
          rejected: value === "rejected",
        };
      }
      return acc;
    }, {});

  const runSearch = async () => {
    const jobInput = selectedJobPost?.description || (inputMode === "url" ? jobUrl.trim() : jobText.trim());
    if (!jobInput) {
      setError("Add a job description, use a saved job post, or provide a job URL before ranking candidates.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      let response;
      if (source === "bulk") {
        if (!files.length) {
          throw new Error("Upload resumes before using recruiter bulk mode.");
        }
        const formData = new FormData();
        formData.append("job_input", jobInput);
        formData.append("top_k", String(topK));
        formData.append("action_state", JSON.stringify(buildActionStatePayload()));
        files.forEach((file) => formData.append("files", file));
        response = await api.post("/recruiter-bulk", formData);
      } else {
        response = await api.post("/recruiter-find", {
          job_input: jobInput,
          top_k: topK,
          action_state: buildActionStatePayload(),
        });
      }

      if (!response.data || !Array.isArray(response.data.candidates)) {
        throw new Error(response.data.message || "Ranking failed");
      }

      const results = response.data.candidates || [];
      startTransition(() => {
        setRanking(results);
        setMeta({
          role: selectedJobPost?.title || "Target Role",
          total: response.data.summary?.total_candidates || results.length,
          shortlisted: response.data.summary?.shortlisted_count || 0,
          rejected: response.data.summary?.rejected_count || 0,
          reliability: response.data.summary?.reliability || null,
        });
      });
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        onAuthError();
        return;
      }
      setError(err.response?.data?.detail || err.response?.data?.message || err.message || "Ranking failed.");
    } finally {
      setLoading(false);
    }
  };

  const rankingCards = useMemo(() => {
    return ranking.map((item) => {
      const risk = getRiskLevel(item.feedback);
      const rankedMissing = item.feedback?.improvement_plan?.ranked_missing_skills || [];
      const whyFits = item.why_fit || item.feedback?.why_candidate_fits || item.strengths || [];
      const critical = rankedMissing
        .filter((gap) => (gap.importance_score || 0) >= 95)
        .map((gap) => `${gap.skill}: ${gap.why_it_matters || gap.reason || "Needs direct proof."}`);
      const secondary = rankedMissing
        .filter((gap) => (gap.importance_score || 0) < 95)
        .map((gap) => `${gap.skill}: add one project or quantified bullet to reduce the gap.`);
      const keyHighlights = [
        ...whyFits.slice(0, 2),
        ...(critical.length ? [critical[0]] : []),
      ].slice(0, 3);
      const trainingModule = rankedMissing.slice(0, 4).map((gap) => {
        const prep = (item.feedback?.preparation_plan || []).find((entry) => entry.skill === gap.skill);
        const roadmap = (item.feedback?.improvement_plan?.roadmap || []).filter((entry) => entry.skill === gap.skill);
        const weeklyPlan = (item.feedback?.improvement_plan?.weekly_plan || []).filter((entry) =>
          String(entry.goal || "").toLowerCase().includes(String(gap.skill || "").toLowerCase())
        );

        return {
          skill: gap.skill,
          estimatedTime: weeklyPlan.length ? `${weeklyPlan.length} week plan` : "2-4 focused weeks",
          learningPath: roadmap.length
            ? roadmap.map((entry) => `${entry.level}: ${entry.focus}`).slice(0, 3)
            : [`Build fundamentals in ${gap.skill}`, `Practice ${gap.skill} in a role-relevant feature`, `Ship one proof-of-work project using ${gap.skill}`],
          platforms: (prep?.resources || []).slice(0, 4).map((resource) => resource.title),
        };
      });
      const skillBreakdown = item.skill_breakdown || {};
      const confidence = item.confidence || { percent: 0, label: "Low", drivers: [] };
      const gapHeatmap = item.gap_heatmap || [];
      const reliability = item.summary?.reliability_metrics || {};
      const improvementCards = rankedMissing.slice(0, 4).map((gap, index) => ({
        skill: gap.skill,
        action: gap.action || `Build one role-relevant proof point for ${gap.skill}.`,
        impact: Math.max(4, 14 - (index * 2)),
        difficulty: index === 0 ? "Medium" : index >= 2 ? "Low" : "Medium",
        reasoning: gap.why_it_matters || gap.reason || `Closing ${gap.skill} improves recruiter confidence.`,
      }));
      const prepResources = item.feedback?.preparation_resources || item.feedback?.preparation_plan || [];
      const interviewPrep = item.feedback?.interview_question_module || {};
      const exactSkills = (skillBreakdown.exact_matches || []).map((entry) => entry.skill);
      const semanticSkills = (skillBreakdown.semantic_matches || []).map((entry) => entry.skill);
      const inferredSkills = (skillBreakdown.inferred_skills || []).map((entry) => entry.skill);

      return {
        ...item,
        id: candidateKey(item),
        candidate: item.name || item.candidate || "Unknown Candidate",
        score: item.match_score || item.score || 0,
        role: meta?.role || item.job_role || "Target Role",
        confidence,
        dealBreakerFlag: Boolean(item.deal_breaker_flag),
        dealBreakers: item.deal_breakers || [],
        anomalyAlert: item.anomaly_alert || "",
        keyHighlights,
        fitBullets: whyFits.slice(0, 5),
        criticalGaps: critical.length ? critical.slice(0, 4) : (item.gaps || []).slice(0, 4),
        secondaryGaps: secondary.slice(0, 4),
        riskSignals: item.feedback?.risk_signals || [],
        trainingModule,
        riskLevel: risk.value,
        breakdown: item.scoring_breakdown || {},
        skillBreakdown,
        exactSkills,
        semanticSkills,
        inferredSkills,
        gapHeatmap,
        skillGraph: item.skill_graph || {},
        experienceTimeline: item.experience_timeline || [],
        rankingExplanation: item.ranking_explanation || {},
        strengthSignals: item.feedback?.strength_signals || [],
        preparationResources: prepResources,
        interviewPrep,
        improvementCards,
        experienceSnapshot: item.experience_snapshot || {},
        reliability,
        shortlisted: (decisions[candidateKey(item)] || item.status) === "shortlisted",
        rejected: (decisions[candidateKey(item)] || item.status) === "rejected",
      };
    });
  }, [ranking, meta?.role, decisions]);

  const deferredRankingCards = useDeferredValue(rankingCards);

  const filteredCards = useMemo(() => {
    return deferredRankingCards.filter((item) => {
      if ((item.score || 0) < filters.scoreMin) return false;
      if (filters.skill.trim()) {
        const haystack = JSON.stringify([
          item.fitBullets,
          item.top_matches,
          item.resume?.skills,
          item.feedback?.missing_skills,
        ]).toLowerCase();
        if (!haystack.includes(filters.skill.trim().toLowerCase())) return false;
      }
      if (filters.risk !== "all" && item.riskLevel !== filters.risk) return false;
      return true;
    });
  }, [deferredRankingCards, filters]);

  useEffect(() => {
    if (!toast.message) return undefined;
    const timer = window.setTimeout(() => setToast({ message: "", tone: "success" }), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleShortlist = async (candidateId) => {
    const target = rankingCards.find((item) => item.id === candidateId);
    const wasShortlisted = Boolean(target?.shortlisted);
    setDecisions((current) => ({
      ...current,
      [candidateId]: current[candidateId] === "shortlisted" ? "" : "shortlisted",
    }));
    setMeta((current) => current ? ({ ...current, shortlisted: Math.max(0, (current.shortlisted || 0) + (wasShortlisted ? -1 : 1)) }) : current);
    if (!target || wasShortlisted) {
      setToast({ message: "Shortlist removed.", tone: "warn" });
      return;
    }
    try {
      const response = await api.post("/recruiter/actions", {
        action: "shortlisted",
        candidate_key: target.resume?._candidate_key || "",
        candidate_email: target.email || "",
        candidate_name: target.candidate,
        role_name: target.role,
        strengths: target.fitBullets || [],
        next_step: target.next_step || "We will contact you with interview details.",
        reason: "Recruiter shortlisted from ranking workspace",
      });
      setToast({
        message: response.data?.message || "Candidate shortlisted and recruiter workflow updated.",
        tone: "success",
      });
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Unable to record shortlist action.", tone: "error" });
    }
  };

  const openRejectDialog = (candidateId) => {
    setRejectDialog({ open: true, candidateId, reason: "" });
  };

  const handleReject = async () => {
    const candidateId = rejectDialog.candidateId;
    const target = rankingCards.find((item) => item.id === candidateId);
    const wasRejected = Boolean(target?.rejected);
    const rejectReason = rejectDialog.reason.trim();
    setRejectDialog({ open: false, candidateId: "", reason: "" });
    setDecisions((current) => ({
      ...current,
      [candidateId]: current[candidateId] === "rejected" ? "" : "rejected",
    }));
    setMeta((current) => current ? ({ ...current, rejected: Math.max(0, (current.rejected || 0) + (wasRejected ? -1 : 1)) }) : current);
    if (!target || wasRejected) {
      setToast({ message: "Rejection removed.", tone: "warn" });
      return;
    }
    try {
      const response = await api.post("/recruiter/actions", {
        action: "rejected",
        candidate_key: target.resume?._candidate_key || "",
        candidate_email: target.email || "",
        candidate_name: target.candidate,
        role_name: target.role,
        strengths: target.fitBullets || [],
        reason: rejectReason || target.dealBreakers?.[0]?.reason || target.criticalGaps?.[0] || "Recruiter rejected from ranking workspace",
      });
      setToast({
        message: response.data?.message || "Rejection recorded for recruiter analytics.",
        tone: "warn",
      });
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Unable to record reject action.", tone: "error" });
    }
  };

  // Early returns for non-dashboard sections
  if (activeSection === "Candidates") {
    return <RecruiterCandidatesSection rankingCards={rankingCards} onSectionChange={onSectionChange} />;
  }
  if (activeSection === "Analytics") {
    return <RecruiterAnalyticsSection meta={meta} rankingCards={rankingCards} onSectionChange={onSectionChange} />;
  }
  if (activeSection === "Settings") {
    return <RecruiterSettingsSection session={session} onLogout={onLogout} />;
  }
  if (activeSection === "Job Posts") {
    return (
      <RecruiterJobManager
        api={api}
        onAuthError={onAuthError}
        onUseJobForRanking={(job) => {
          setSelectedJobPost(job);
          setJobText(job.description || "");
          setInputMode("text");
          onSectionChange?.("Dashboard");
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className={`${authCardClass} overflow-hidden`}>
        <div className="mt-6 grid gap-8 xl:grid-cols-[1.3fr_0.95fr]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-cyan-300">Recruiter Workspace</p>
              <h1 className="mt-3 font-display text-4xl font-black tracking-tight text-white md:text-5xl">Review candidates fast, open details only when needed</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-300">
                The ranking view now shows only decision-critical data up front: rank, match score, candidate identity, and a few sharp highlights. Every deep insight stays tucked behind one expandable details panel.
              </p>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <ScoreBand score={rankingCards[0]?.match_score || rankingCards[0]?.score || 0} label="Top Match" />
                <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,16,14,0.96),rgba(14,11,9,0.96))] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">Visible Candidates</p>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <p className="text-3xl font-black text-white">{filteredCards.length}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">After filters</p>
                  </div>
                </div>
                <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,16,14,0.96),rgba(14,11,9,0.96))] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">Target Role</p>
                  <p className="mt-4 text-xl font-black text-white">{meta?.role || selectedJobPost?.title || "Waiting"}</p>
                </div>
              </div>
              {meta?.reliability ? (
                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <div className="rounded-[1.4rem] border border-cyan-300/16 bg-[linear-gradient(135deg,rgba(103,232,249,0.12),rgba(255,255,255,0.03))] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">Reliability</p>
                    <p className="mt-2 text-3xl font-black text-white">{Math.round(meta.reliability.overall_reliability || 0)}%</p>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">Precision@K</p>
                    <p className="mt-2 text-2xl font-black text-white">{Math.round(meta.reliability.precision_at_k || 0)}%</p>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">NDCG</p>
                    <p className="mt-2 text-2xl font-black text-white">{Math.round(meta.reliability.ndcg || 0)}%</p>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">Exp. Confidence</p>
                    <p className="mt-2 text-2xl font-black text-white">{Math.round(meta.reliability.experience_confidence || 0)}%</p>
                  </div>
                </div>
              ) : null}
              {selectedJobPost ? (
                <div className="mt-5 rounded-[1.5rem] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(103,232,249,0.12),rgba(255,255,255,0.03))] p-4 text-sm leading-6 text-cyan-50">
                  Using saved job post: <span className="font-black">{selectedJobPost.title}</span>
                </div>
              ) : null}
            </div>

            <div className="space-y-4 rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(17,14,12,0.88),rgba(11,10,8,0.82))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedJobPost(null);
                    setInputMode("text");
                  }}
                  className={`rounded-[1.2rem] border px-4 py-4 text-left transition ${
                    inputMode === "text" && !selectedJobPost
                      ? "border-cyan-300/30 bg-[linear-gradient(135deg,#67e8f9,#a7f3d0)] text-stone-950 shadow-[0_14px_30px_rgba(103,232,249,0.18)]"
                      : "border-white/8 bg-[linear-gradient(180deg,rgba(20,16,14,0.96),rgba(14,11,9,0.96))] text-stone-400 hover:border-white/14 hover:text-white"
                  }`}
                >
                  <p className="text-xs font-black uppercase tracking-[0.16em]">Paste JD</p>
                  <p className="mt-2 text-xs leading-5">Role text straight from intake.</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedJobPost(null);
                    setInputMode("url");
                  }}
                  className={`rounded-[1.2rem] border px-4 py-4 text-left transition ${
                    inputMode === "url" && !selectedJobPost
                      ? "border-cyan-300/30 bg-[linear-gradient(135deg,#67e8f9,#a7f3d0)] text-stone-950 shadow-[0_14px_30px_rgba(103,232,249,0.18)]"
                      : "border-white/8 bg-[linear-gradient(180deg,rgba(20,16,14,0.96),rgba(14,11,9,0.96))] text-stone-400 hover:border-white/14 hover:text-white"
                  }`}
                >
                  <p className="text-xs font-black uppercase tracking-[0.16em]">Job URL</p>
                  <p className="mt-2 text-xs leading-5">Pull a live listing.</p>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSource("vault")}
                  className={`rounded-[1.2rem] border px-4 py-4 text-left transition ${
                    source === "vault"
                      ? "border-cyan-300/30 bg-[linear-gradient(135deg,#67e8f9,#a7f3d0)] text-stone-950 shadow-[0_14px_30px_rgba(103,232,249,0.18)]"
                      : "border-white/8 bg-[linear-gradient(180deg,rgba(20,16,14,0.96),rgba(14,11,9,0.96))] text-stone-400 hover:border-white/14 hover:text-white"
                  }`}
                >
                  <p className="text-xs font-black uppercase tracking-[0.16em]">Saved Candidates</p>
                  <p className="mt-2 text-xs leading-5">Search the existing candidate pool.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSource("bulk")}
                  className={`rounded-[1.2rem] border px-4 py-4 text-left transition ${
                    source === "bulk"
                      ? "border-cyan-300/30 bg-[linear-gradient(135deg,#67e8f9,#a7f3d0)] text-stone-950 shadow-[0_14px_30px_rgba(103,232,249,0.18)]"
                      : "border-white/8 bg-[linear-gradient(180deg,rgba(20,16,14,0.96),rgba(14,11,9,0.96))] text-stone-400 hover:border-white/14 hover:text-white"
                  }`}
                >
                  <p className="text-xs font-black uppercase tracking-[0.16em]">Bulk Upload</p>
                  <p className="mt-2 text-xs leading-5">Rank a fresh resume batch.</p>
                </button>
              </div>

              {selectedJobPost ? (
                <div className="rounded-[1.2rem] border border-cyan-300/18 bg-[linear-gradient(135deg,rgba(103,232,249,0.12),rgba(255,255,255,0.03))] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">Selected Job Post</p>
                  <p className="mt-2 text-lg font-black text-white">{selectedJobPost.title}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-300">{selectedJobPost.description}</p>
                </div>
              ) : inputMode === "text" ? (
                <FieldArea label="Job Description">
                  <textarea
                    value={jobText}
                    onChange={(event) => setJobText(event.target.value)}
                    placeholder="Paste the target job description..."
                    className="h-40 w-full rounded-[1.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,16,14,0.96),rgba(14,11,9,0.96))] p-4 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-cyan-300/40"
                  />
                </FieldArea>
              ) : (
                <AuthInput label="Job URL" value={jobUrl} onChange={(event) => setJobUrl(event.target.value)} placeholder="https://company.com/jobs/role" />
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <AuthInput label="Top Candidates" type="number" min="1" max="100" value={topK} onChange={(event) => setTopK(Number(event.target.value) || 1)} />
                {source === "bulk" ? (
                  <label className="block cursor-pointer rounded-[1.2rem] border border-dashed border-white/12 bg-[linear-gradient(180deg,rgba(20,16,14,0.96),rgba(14,11,9,0.96))] px-4 py-3 transition hover:border-cyan-300/30">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">Resume Batch</p>
                    <p className="mt-2 text-sm text-stone-300">{files.length ? `${files.length} file(s) selected` : "Upload multiple resumes"}</p>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple className="hidden" onChange={(event) => setFiles(Array.from(event.target.files || []))} />
                  </label>
                ) : (
                  <div className="rounded-[1.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,16,14,0.96),rgba(14,11,9,0.96))] px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">Smart Filters</p>
                    <p className="mt-2 text-sm text-stone-300">Tune the result set after ranking with score, skills, and risk filters.</p>
                  </div>
                )}
              </div>

              <Motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={runSearch}
                className="w-full rounded-[1.4rem] bg-[linear-gradient(135deg,#67e8f9,#a7f3d0)] py-4 text-xs font-black uppercase tracking-[0.22em] text-stone-950 shadow-[0_18px_34px_rgba(103,232,249,0.22)]"
              >
                Rank Candidates
              </Motion.button>
            </div>
          </div>
      </section>

      {error ? <div className="rounded-[1.4rem] border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div> : null}
      <ToastBanner message={toast.message} tone={toast.tone} onClose={() => setToast({ message: "", tone: "success" })} />
      {loading ? <LoadingPanel label="Ranking candidates with weighted recruiter scoring" /> : null}

      {!loading && ranking.length > 0 ? (
        <div className="mt-8">
              <div className="mb-6 flex flex-col gap-4 p-4 sm:p-6 glass-panel rounded-[2rem] xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Candidate Ranking</p>
                  <p className="mt-2 text-sm text-stone-300">
                    {meta ? `Top matches for ${meta.role}. ${meta.shortlisted || 0} shortlisted, ${meta.rejected || 0} rejected.` : "Candidate ranking results."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 glass-pill px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-stone-500 whitespace-nowrap">Min Score</span>
                    <input type="number" min="0" max="100" value={filters.scoreMin} onChange={(event) => setFilters((current) => ({ ...current, scoreMin: Number(event.target.value) || 0 }))} className="w-12 sm:w-16 bg-transparent text-sm font-bold text-white outline-none border-b border-white/5 focus:border-cyan-400 transition-colors" />
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 glass-pill px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-stone-500">Skill</span>
                    <input value={filters.skill} onChange={(event) => setFilters((current) => ({ ...current, skill: event.target.value }))} className="w-20 sm:w-32 bg-transparent text-sm font-bold text-white outline-none border-b border-white/5 focus:border-cyan-400 transition-colors" placeholder="React..." />
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 glass-pill px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-stone-500">Risk</span>
                    <select value={filters.risk} onChange={(event) => setFilters((current) => ({ ...current, risk: event.target.value }))} className="bg-transparent text-sm font-bold text-white outline-none border-b border-white/5 focus:border-cyan-400 appearance-none cursor-pointer">
                      <option value="all" className="bg-[#120e0b]">All</option>
                      <option value="low" className="bg-[#120e0b]">Low</option>
                      <option value="medium" className="bg-[#120e0b]">Medium</option>
                      <option value="high" className="bg-[#120e0b]">High</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 px-2">
                <Filter size={14} className="text-cyan-400" />
                {filteredCards.length} visible candidates after smart filtering
              </div>

              <Suspense fallback={<LoadingPanel label="Loading recruiter intelligence panels" />}>
                <Ranking
                  data={filteredCards}
                  onShortlist={handleShortlist}
                  onReject={openRejectDialog}
                />
              </Suspense>
          </div>
      ) : null}
      <ActionModal
        open={rejectDialog.open}
        title="Reject Candidate"
        description="Add an optional rejection reason to improve recruiter traceability and future ranking quality."
        value={rejectDialog.reason}
        onChange={(value) => setRejectDialog((current) => ({ ...current, reason: value }))}
        onCancel={() => setRejectDialog({ open: false, candidateId: "", reason: "" })}
        onConfirm={handleReject}
        confirmLabel="Reject Candidate"
      />
    </div>
  );
}


export default function App() {
  const [route, setRoute] = useState(readRoute());
  const [session, setSession] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const restore = async () => {
      if (!window.localStorage.getItem(SESSION_KEY)) {
        setBooting(false);
        const currentRoute = readRoute();
        if (!["/", "/signin", "/signup"].includes(currentRoute)) navigate("/");
        return;
      }

      try {
        const auth = await restoreStoredSession();
        setSession(auth);
        navigate(auth.user.role === "recruiter" ? "/recruiter" : "/candidate");
      } catch {
        window.localStorage.removeItem(SESSION_KEY);
        navigate("/signin");
      } finally {
        setBooting(false);
      }
    };

    restore();
  }, []);

  const handleAuthSuccess = (auth) => {
    setSession(auth);
    navigate(auth.user.role === "recruiter" ? "/recruiter" : "/candidate");
  };

  if (booting) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#03060D]">
        {/* Background orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-[#5B8CFF]/6 to-transparent blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-[#8A2BE2]/6 to-transparent blur-[140px] pointer-events-none" />
        
        {/* Logo + Spinner */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Animated ring */}
          <div className="absolute w-24 h-24 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "#5B8CFF", borderRightColor: "rgba(91,140,255,0.2)" }} />
          <div className="absolute w-20 h-20 rounded-full border-2 border-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s", borderTopColor: "#8A2BE2", borderRightColor: "rgba(138,43,226,0.2)" }} />
          {/* Logo Icon */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5B8CFF] to-[#8A2BE2] flex items-center justify-center shadow-[0_0_40px_rgba(138,43,226,0.5)]">
            <LoaderCircle className="text-white animate-spin" size={26} />
          </div>
        </div>
        
        <p className="font-black text-2xl tracking-tighter text-white">ResuMind<span className="text-[#5B8CFF]">AI</span></p>
        <p className="mt-3 text-sm text-stone-500 animate-pulse">Restoring your secure workspace...</p>
      </div>
    );
  }

  if (session) {
    if (session.user.role === "recruiter") {
      const api = createAuthorizedApi(session.token);
      const handleAuthError = () => {
        window.localStorage.removeItem(SESSION_KEY);
        setSession(null);
        navigate("/signin");
      };
      const handleLogout = async () => {
         try {
           if (session?.token) {
             await api.post("/auth/logout");
           }
         } catch {}
         handleAuthError();
      };
      
      return (
        <RecruiterLayout session={session} onLogout={handleLogout}>
          {({ activeSection, onSectionChange }) => (
            <RecruiterDashboard api={api} onAuthError={handleAuthError} session={session} onLogout={handleLogout} activeSection={activeSection} onSectionChange={onSectionChange} />
          )}
        </RecruiterLayout>
      );
    }

    return (
      <DashboardShell
        session={session}
        setSession={setSession}
        candidateView={({ api, onAuthError, activeSection, onSectionChange }) => (
          <CandidateDashboard session={session} setSession={setSession} api={api} onAuthError={onAuthError} activeSection={activeSection} onSectionChange={onSectionChange} />
        )}
        recruiterView={() => null}
      />
    );
  }

  if (route === "/") {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#0B0F1A]" />}>
        <SpaceThemeLandingPage onNavigate={navigate} />
      </Suspense>
    );
  }

  const safeRoute = route === "/signup" ? "/signup" : route === "/" ? "/" : "/signin";
  if (route !== safeRoute) navigate(safeRoute);

  return <AuthPage mode={safeRoute === "/signup" ? "signup" : "signin"} onSuccess={handleAuthSuccess} />;
}
