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
import RecruiterDashboard from "./components/recruiter/RecruiterDashboard";
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
                className={`rounded-xl px-4 py-4 text-left transition-all ${inputMode === "text" ? "bg-gradient-to-r from-[#5B8CFF]/20 to-[#8A2BE2]/20 border border-[#5B8CFF]/30 shadow-[0_0_20px_rgba(91,140,255,0.15)] text-[var(--text-main)]" : "bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]"}`}>
                <p className="text-xs font-black uppercase tracking-[0.16em]">Paste JD</p>
                <p className="mt-2 text-xs leading-5 opacity-80">Use recruiter-written role text.</p>
              </button>
              <button type="button" onClick={() => setInputMode("url")}
                className={`rounded-xl px-4 py-4 text-left transition-all ${inputMode === "url" ? "bg-gradient-to-r from-[#5B8CFF]/20 to-[#8A2BE2]/20 border border-[#8A2BE2]/30 shadow-[0_0_20px_rgba(138,43,226,0.15)] text-[var(--text-main)]" : "bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]"}`}>
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
        } catch { }
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
