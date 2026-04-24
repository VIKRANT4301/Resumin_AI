import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion as Motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Eye,
  Filter,
  Layers3,
  Link2,
  LoaderCircle,
  LogOut,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import Result from "./components/Result";
import Ranking from "./components/Ranking";

const API_BASE = "http://127.0.0.1:8000/api/matcher";
const SESSION_KEY = "prores_session";

const authCard =
  "relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(103,232,249,0.1),transparent_34%),linear-gradient(180deg,rgba(24,19,15,0.98),rgba(14,11,9,0.98))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-sm";

function readRoute() {
  return window.location.hash.replace(/^#/, "") || "/signin";
}

function navigate(nextRoute) {
  if (window.location.hash !== `#${nextRoute}`) {
    window.location.hash = nextRoute;
  }
}

function normalizeListInput(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function AuthInput({ label, ...props }) {
  return (
    <label className="block">
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">{label}</p>
      <input
        {...props}
        className="w-full rounded-[1.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(21,18,15,0.96),rgba(14,11,9,0.96))] px-4 py-3.5 text-sm text-white outline-none transition duration-200 placeholder:text-stone-500 focus:border-cyan-300/40 focus:bg-[#15110e]"
      />
    </label>
  );
}

function FieldArea({ label, children }) {
  return (
    <label className="block">
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">{label}</p>
      {children}
    </label>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <Motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      className={`rounded-[1rem] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] transition ${
        active
          ? "bg-[linear-gradient(135deg,#67e8f9,#a7f3d0)] text-stone-950 shadow-[0_12px_30px_rgba(103,232,249,0.22)]"
          : "border border-white/10 bg-[linear-gradient(180deg,rgba(20,16,14,0.96),rgba(14,11,9,0.96))] text-stone-300 hover:border-white/16 hover:text-white"
      }`}
    >
      {children}
    </Motion.button>
  );
}

function LoadingPanel({ label = "Running analysis" }) {
  return (
    <div className={`${authCard} min-h-[320px]`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.08),transparent_30%)]" />
      <div className="relative space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="h-4 w-36 animate-pulse rounded-full bg-white/10" />
          <div className="h-10 w-28 animate-pulse rounded-full bg-cyan-300/10" />
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.8rem] border border-white/6 bg-white/[0.03] p-5">
            <div className="h-5 w-2/5 animate-pulse rounded-full bg-white/10" />
            <div className="mt-4 h-12 animate-pulse rounded-[1.2rem] bg-white/6" />
            <div className="mt-5 space-y-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-4 animate-pulse rounded-full bg-white/6" />
              ))}
            </div>
          </div>
          <div className="rounded-[1.8rem] border border-white/6 bg-white/[0.03] p-5">
            <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
            <div className="mt-5 h-32 animate-pulse rounded-[1.4rem] bg-white/6" />
            <div className="mt-4 h-11 animate-pulse rounded-[1rem] bg-white/8" />
            <div className="mt-3 h-11 animate-pulse rounded-[1rem] bg-white/8" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-[1.4rem] border border-white/6 bg-white/[0.03]" />
          ))}
        </div>
      </div>
      <div className="relative mt-8 flex items-center gap-3 text-sm text-stone-400">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/10">
          <LoaderCircle className="animate-spin text-amber-300" size={18} />
        </span>
        <div>
          <p className="font-semibold text-stone-200">{label}</p>
          <p className="text-xs text-stone-500">Building recruiter-ready ranking cards and evidence panels.</p>
        </div>
      </div>
    </div>
  );
}

function ScoreBand({ score, label, accent = "cyan" }) {
  const tone =
    accent === "amber"
      ? score >= 90
        ? "bg-emerald-400"
        : score >= 75
          ? "bg-amber-300"
          : score >= 60
            ? "bg-orange-300"
            : "bg-rose-400"
      : score >= 90
        ? "bg-emerald-400"
        : score >= 75
          ? "bg-cyan-400"
          : score >= 60
            ? "bg-amber-300"
            : "bg-rose-400";

  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,16,14,0.96),rgba(14,11,9,0.96))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <div className="mt-4">
        <div className="h-3 overflow-hidden rounded-full bg-white/6">
          <Motion.div
            className={`h-full rounded-full ${tone}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(4, Math.min(100, score || 0))}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="text-3xl font-black text-white">{Math.round(score || 0)}%</p>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">
            {score >= 90 ? "Exceptional" : score >= 75 ? "Strong" : score >= 60 ? "Moderate" : "Needs review"}
          </p>
        </div>
      </div>
    </div>
  );
}

function getRiskLevel(feedback) {
  const severities = (feedback?.risk_signals || []).map((item) => String(item?.severity || "").toLowerCase());
  if (severities.includes("high")) return { label: "High Risk", value: "high" };
  if (severities.includes("medium")) return { label: "Medium Risk", value: "medium" };
  return { label: "Low Risk", value: "low" };
}

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

      <section className={authCard}>
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

      <section className={authCard}>
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

function CandidateDashboard({ session, setSession, api, onAuthError }) {
  const [activeTab, setActiveTab] = useState("analysis");
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

  const formattedUpdatedAt = lastUpdated
    ? new Date(lastUpdated).toLocaleString()
    : "Not available";

  return (
    <div className="space-y-6">
      <section className={`${authCard} overflow-hidden`}>
        <div className="flex flex-wrap items-center gap-3">
          <TabButton active={activeTab === "analysis"} onClick={() => setActiveTab("analysis")}>Analysis</TabButton>
          <TabButton active={activeTab === "jobs"} onClick={() => setActiveTab("jobs")}>Jobs</TabButton>
        </div>

        {activeTab === "analysis" ? (
          <div className="mt-6 grid gap-8 xl:grid-cols-[1.35fr_0.9fr]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-amber-300">Candidate Workspace</p>
              <h1 className="mt-3 font-display text-4xl font-black tracking-tight text-white md:text-5xl">Own your fit story before a recruiter sees it</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-300">
                The analysis prioritizes exact skill gaps, weekly upskilling moves, and recruiter-style risk signals. Your saved titles stay attached to the session so the platform can position you consistently.
              </p>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <ScoreBand score={matchResult?.summary?.overall_score || 0} label="Current Fit" accent="amber" />
                <div className="rounded-[1.6rem] border border-white/10 bg-[#120f0d]/80 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">Current Title</p>
                  <p className="mt-4 text-2xl font-black text-white">{profile.current_title || "Not set"}</p>
                </div>
                <div className="rounded-[1.6rem] border border-white/10 bg-[#120f0d]/80 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">Target Title</p>
                  <p className="mt-4 text-2xl font-black text-white">{profile.target_title || "Not set"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">Resume Status</p>
                    <p className="mt-2 text-xl font-black text-white">{hasResume ? "Resume already uploaded" : "Resume not uploaded"}</p>
                    <p className="mt-2 text-sm text-stone-400">
                      {hasResume ? `Last updated: ${formattedUpdatedAt}` : "Upload your latest resume to power analysis and recruiter ranking."}
                    </p>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${hasResume ? "border border-emerald-300/20 bg-emerald-300/10 text-emerald-100" : "border border-amber-300/20 bg-amber-300/10 text-amber-100"}`}>
                    {hasResume ? "Uploaded" : "Not Uploaded"}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <label className="cursor-pointer rounded-[1rem] border border-dashed border-white/12 bg-[#120f0d] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-stone-200 transition hover:border-amber-300/30">
                    {hasResume ? "Update Resume" : "Upload Resume"}
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(event) => {
                      setResumeFile(event.target.files?.[0] || null);
                      setConfirmReplace(false);
                      setResumeMessage("");
                    }} />
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowResumeDetails((current) => !current)}
                    disabled={!hasResume}
                    className="rounded-[1rem] border border-white/10 bg-[#120f0d] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-stone-200 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    View Resume
                  </button>
                </div>

                {resumeFile ? (
                  <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-[#120f0d] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">Selected File</p>
                    <p className="mt-2 text-sm text-white">{resumeFile.name}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Motion.button
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        type="button"
                        onClick={() => updateResume({ confirmed: !hasResume })}
                        disabled={resumeLoading}
                        className="rounded-[1rem] bg-amber-300 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-stone-950 disabled:opacity-70"
                      >
                        {resumeLoading ? "Uploading..." : hasResume ? "Continue Update" : "Upload Resume"}
                      </Motion.button>
                      <button
                        type="button"
                        onClick={() => {
                          setResumeFile(null);
                          setConfirmReplace(false);
                        }}
                        className="rounded-[1rem] border border-white/10 bg-transparent px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-stone-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}

                {confirmReplace ? (
                  <div className="mt-4 rounded-[1.2rem] border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-50">
                    <p className="font-black">Uploading a new resume will replace your existing data.</p>
                    <p className="mt-2 leading-6 text-amber-100">We'll re-parse your latest resume and replace the active skills, experience, projects, and profile-linked resume data without creating duplicates.</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Motion.button
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        type="button"
                        onClick={() => updateResume({ confirmed: true })}
                        disabled={resumeLoading}
                        className="rounded-[1rem] bg-amber-300 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-stone-950 disabled:opacity-70"
                      >
                        {resumeLoading ? "Replacing..." : "Confirm Replace"}
                      </Motion.button>
                      <button
                        type="button"
                        onClick={() => setConfirmReplace(false)}
                        className="rounded-[1rem] border border-amber-300/20 bg-transparent px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-amber-100"
                      >
                        Keep Current Resume
                      </button>
                    </div>
                  </div>
                ) : null}

                {resumeMessage ? <div className="mt-4 rounded-[1.2rem] border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">{resumeMessage}</div> : null}

                {showResumeDetails && hasResume ? (
                  <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-[#120f0d] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">Active Resume Snapshot</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">Skills</p>
                        <p className="mt-2 text-2xl font-black text-white">{(resumeRecord.skills || []).length}</p>
                      </div>
                      <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">Experience</p>
                        <p className="mt-2 text-2xl font-black text-white">{(resumeRecord.experience || []).length}</p>
                      </div>
                      <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">Projects</p>
                        <p className="mt-2 text-2xl font-black text-white">{(resumeRecord.projects || []).length}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(resumeRecord.skills || []).slice(0, 12).map((skill) => (
                        <span key={skill} className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-amber-100">
                          {skill}
                        </span>
                      ))}
                      {!(resumeRecord.skills || []).length ? <p className="text-sm text-stone-500">No parsed skills available yet.</p> : null}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setInputMode("text")}
                    className={`rounded-[1.2rem] px-4 py-4 text-left transition ${inputMode === "text" ? "bg-amber-300 text-stone-950" : "bg-[#120f0d] text-stone-400 hover:text-white"}`}
                  >
                    <p className="text-xs font-black uppercase tracking-[0.16em]">Paste JD</p>
                    <p className="mt-2 text-xs leading-5">Use recruiter-written role text.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode("url")}
                    className={`rounded-[1.2rem] px-4 py-4 text-left transition ${inputMode === "url" ? "bg-amber-300 text-stone-950" : "bg-[#120f0d] text-stone-400 hover:text-white"}`}
                  >
                    <div className="flex items-center gap-2">
                      <Link2 size={14} />
                      <p className="text-xs font-black uppercase tracking-[0.16em]">Job URL</p>
                    </div>
                    <p className="mt-2 text-xs leading-5">Extract a live listing.</p>
                  </button>
                </div>
              </div>

              {inputMode === "text" ? (
                <FieldArea label="Target Job Description">
                  <textarea
                    value={jobText}
                    onChange={(event) => setJobText(event.target.value)}
                    placeholder="Paste the role you want to target..."
                    className="h-44 w-full rounded-[1.2rem] border border-white/10 bg-[#120f0d] p-4 text-sm text-white outline-none placeholder:text-stone-500"
                  />
                </FieldArea>
              ) : (
                <AuthInput label="Job URL" value={jobUrl} onChange={(event) => setJobUrl(event.target.value)} placeholder="https://company.com/jobs/role" />
              )}

              <Motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={runMatch}
                className="w-full rounded-[1.4rem] bg-amber-300 py-4 text-xs font-black uppercase tracking-[0.22em] text-stone-950"
              >
                Analyze My Fit
              </Motion.button>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <CandidateJobsPanel api={api} onAuthError={onAuthError} />
          </div>
        )}
      </section>

      {activeTab === "analysis" ? (
        <>
          {error ? <div className="rounded-[1.4rem] border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div> : null}
          {loading ? <LoadingPanel label="Building a recruiter-style candidate analysis" /> : null}
          {!loading && matchResult ? <Result mode="candidate" data={matchResult} resume={resume || profile.resume || {}} feedback={feedback || {}} /> : null}
        </>
      ) : null}
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
      <section className={authCard}>
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

      <section className={authCard}>
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

function RecruiterDashboard({ api, onAuthError }) {
  const [activeTab, setActiveTab] = useState("rank");
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
  const [actionMessage, setActionMessage] = useState("");

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
      setRanking(results);
      setMeta({
        role: selectedJobPost?.title || "Target Role",
        total: response.data.summary?.total_candidates || results.length,
        shortlisted: response.data.summary?.shortlisted_count || 0,
        rejected: response.data.summary?.rejected_count || 0,
        reliability: response.data.summary?.reliability || null,
      });
      setActiveTab("rank");
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

  const filteredCards = useMemo(() => {
    return rankingCards.filter((item) => {
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
  }, [rankingCards, filters]);

  const handleShortlist = async (candidateId) => {
    const target = rankingCards.find((item) => item.id === candidateId);
    const wasShortlisted = Boolean(target?.shortlisted);
    setDecisions((current) => ({
      ...current,
      [candidateId]: current[candidateId] === "shortlisted" ? "" : "shortlisted",
    }));
    setMeta((current) => current ? ({ ...current, shortlisted: Math.max(0, (current.shortlisted || 0) + (wasShortlisted ? -1 : 1)) }) : current);
    if (!target || wasShortlisted) {
      setActionMessage("Shortlist removed.");
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
      setActionMessage(response.data?.message ? `✅ ${response.data.message}` : "✅ Candidate shortlisted");
    } catch (err) {
      setActionMessage(err.response?.data?.message || "Unable to record shortlist action.");
    }
  };

  const handleReject = async (candidateId) => {
    const target = rankingCards.find((item) => item.id === candidateId);
    const wasRejected = Boolean(target?.rejected);
    setDecisions((current) => ({
      ...current,
      [candidateId]: current[candidateId] === "rejected" ? "" : "rejected",
    }));
    setMeta((current) => current ? ({ ...current, rejected: Math.max(0, (current.rejected || 0) + (wasRejected ? -1 : 1)) }) : current);
    if (!target || wasRejected) {
      setActionMessage("Rejection removed.");
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
        reason: target.dealBreakers?.[0]?.reason || target.criticalGaps?.[0] || "Recruiter rejected from ranking workspace",
      });
      setActionMessage(response.data?.message ? `👍 ${response.data.message}` : "👍 Recruiter feedback captured");
    } catch (err) {
      setActionMessage(err.response?.data?.message || "Unable to record reject action.");
    }
  };

  return (
    <div className="space-y-6">
      <section className={`${authCard} overflow-hidden`}>
        <div className="flex flex-wrap items-center gap-3">
          <TabButton active={activeTab === "rank"} onClick={() => setActiveTab("rank")}>Rank Candidates</TabButton>
          <TabButton active={activeTab === "jobs"} onClick={() => setActiveTab("jobs")}>Job Posts</TabButton>
        </div>

        {activeTab === "jobs" ? (
          <div className="mt-6">
            <RecruiterJobManager
              api={api}
              onAuthError={onAuthError}
              onUseJobForRanking={(job) => {
                setSelectedJobPost(job);
                setJobText(job.description || "");
                setInputMode("text");
                setActiveTab("rank");
              }}
            />
          </div>
        ) : (
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
        )}
      </section>

      {activeTab === "rank" ? (
        <>
          {error ? <div className="rounded-[1.4rem] border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div> : null}
          {actionMessage ? <div className="rounded-[1.4rem] border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-50">{actionMessage}</div> : null}
          {loading ? <LoadingPanel label="Ranking candidates with weighted recruiter scoring" /> : null}

          {!loading && ranking.length > 0 ? (
            <section className={authCard}>
              <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">Candidate Ranking</p>
                  <p className="mt-2 text-sm text-stone-300">
                    {meta ? `Top matches for ${meta.role}. ${meta.shortlisted || 0} shortlisted, ${meta.rejected || 0} rejected.` : "Candidate ranking results."}
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-[1rem] border border-white/8 bg-[linear-gradient(180deg,rgba(20,16,14,0.96),rgba(14,11,9,0.96))] p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">Min Score</p>
                    <input type="number" min="0" max="100" value={filters.scoreMin} onChange={(event) => setFilters((current) => ({ ...current, scoreMin: Number(event.target.value) || 0 }))} className="mt-2 w-full bg-transparent text-sm text-white outline-none" />
                  </div>
                  <div className="rounded-[1rem] border border-white/8 bg-[linear-gradient(180deg,rgba(20,16,14,0.96),rgba(14,11,9,0.96))] p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">Skill Filter</p>
                    <input value={filters.skill} onChange={(event) => setFilters((current) => ({ ...current, skill: event.target.value }))} className="mt-2 w-full bg-transparent text-sm text-white outline-none" placeholder="React, Node.js..." />
                  </div>
                  <div className="rounded-[1rem] border border-white/8 bg-[linear-gradient(180deg,rgba(20,16,14,0.96),rgba(14,11,9,0.96))] p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">Risk Filter</p>
                    <select value={filters.risk} onChange={(event) => setFilters((current) => ({ ...current, risk: event.target.value }))} className="mt-2 w-full bg-transparent text-sm text-white outline-none">
                      <option value="all">All</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
                <Filter size={14} />
                {filteredCards.length} visible after smart filtering
              </div>

              <Ranking
                data={filteredCards}
                onShortlist={handleShortlist}
                onReject={handleReject}
              />
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function AuthPage({ mode, onSuccess }) {
  const isSignUp = mode === "signup";
  const [role, setRole] = useState("candidate");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    current_title: "",
    target_title: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      let response;

      if (isSignUp) {
        if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
          throw new Error("Name, email, and password are required.");
        }
        if (role === "candidate" && !resumeFile) {
          throw new Error("Candidate signup requires a resume.");
        }

        const payload = new FormData();
        Object.entries({ ...form, role }).forEach(([key, value]) => payload.append(key, value));
        if (resumeFile) payload.append("file", resumeFile);
        response = await axios.post(`${API_BASE}/auth/register`, payload);
      } else {
        if (!form.email.trim() || !form.password.trim()) {
          throw new Error("Email and password are required.");
        }
        response = await axios.post(`${API_BASE}/auth/login`, {
          email: form.email,
          password: form.password,
        });
      }

      if (response.data.status !== "success" || !response.data.auth) {
        throw new Error(response.data.message || "Authentication failed");
      }

      window.localStorage.setItem(SESSION_KEY, JSON.stringify(response.data.auth));
      onSuccess(response.data.auth);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.08fr_0.92fr]">
      <section className="flex items-center">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-amber-300">
            <ShieldCheck size={14} />
            AI Recruitment Platform
          </div>
          <div>
            <h1 className="font-display text-5xl font-black tracking-tight text-white md:text-6xl">Daily hiring workflow, not demo-grade ranking screens</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300">
              Recruiters can create private job posts, rank candidates with evidence-based explanations, shortlist or reject with clear actions, and compare top candidates side-by-side. Candidates get a separate application experience and never see recruiter controls.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
              <UserRound className="text-amber-300" size={18} />
              <p className="mt-3 text-lg font-black text-white">Candidate</p>
              <p className="mt-2 text-sm leading-6 text-stone-400">View analysis, browse jobs, and apply without seeing recruiter-only tools.</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
              <Users className="text-cyan-300" size={18} />
              <p className="mt-3 text-lg font-black text-white">Recruiter</p>
              <p className="mt-2 text-sm leading-6 text-stone-400">Post jobs, rank candidates, filter, shortlist, reject, and compare.</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
              <Layers3 className="text-emerald-300" size={18} />
              <p className="mt-3 text-lg font-black text-white">RBAC</p>
              <p className="mt-2 text-sm leading-6 text-stone-400">Role separation is enforced in both UI flow and API access control.</p>
            </div>
          </div>
        </div>
      </section>

      <Motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className={authCard}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-stone-500">{isSignUp ? "Create Account" : "Welcome Back"}</p>
            <h2 className="mt-2 text-3xl font-black text-white">{isSignUp ? "Sign Up" : "Sign In"}</h2>
          </div>
          <button
            type="button"
            onClick={() => navigate(isSignUp ? "/signin" : "/signup")}
            className="rounded-full border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-stone-300 transition hover:text-white"
          >
            {isSignUp ? "Go To Sign In" : "Go To Sign Up"}
          </button>
        </div>

        {isSignUp ? (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { value: "candidate", label: "Candidate", desc: "Analysis, job browsing, and applications." },
              { value: "recruiter", label: "Recruiter", desc: "Job posting, ranking, and shortlisting." },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRole(option.value)}
                className={`rounded-[1.2rem] px-4 py-4 text-left transition ${role === option.value ? "bg-amber-300 text-stone-950" : "bg-[#120f0d] text-stone-400 hover:text-white"}`}
              >
                <p className="text-xs font-black uppercase tracking-[0.16em]">{option.label}</p>
                <p className="mt-2 text-xs leading-5">{option.desc}</p>
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          {isSignUp ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <AuthInput label="Full Name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Full name" />
                <AuthInput label="Email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com" />
                <AuthInput label="Password" type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="Minimum 6 characters" />
                <AuthInput label="Phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Optional" />
                <AuthInput label="Location" value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder="Optional" />
                <AuthInput label="Current Title" value={form.current_title} onChange={(event) => setForm((current) => ({ ...current, current_title: event.target.value }))} placeholder="Current role title" />
              </div>
              {role === "candidate" ? (
                <>
                  <AuthInput label="Target Title" value={form.target_title} onChange={(event) => setForm((current) => ({ ...current, target_title: event.target.value }))} placeholder="Target role title" />
                  <label className="block cursor-pointer rounded-[1.2rem] border border-dashed border-white/12 bg-[#120f0d] px-4 py-4 transition hover:border-amber-300/30">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">Resume Upload</p>
                    <p className="mt-2 text-sm text-stone-300">{resumeFile ? resumeFile.name : "Upload the resume attached to this candidate profile"}</p>
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(event) => setResumeFile(event.target.files?.[0] || null)} />
                  </label>
                </>
              ) : null}
            </>
          ) : (
            <>
              <AuthInput label="Email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com" />
              <AuthInput label="Password" type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="Password" />
            </>
          )}

          {error ? <div className="rounded-[1.2rem] border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div> : null}

          <Motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            type="button"
            onClick={submit}
            disabled={loading}
            className="w-full rounded-[1.4rem] bg-amber-300 py-4 text-xs font-black uppercase tracking-[0.22em] text-stone-950 disabled:opacity-70"
          >
            {loading ? "Please Wait" : isSignUp ? "Create Account" : "Sign In"}
          </Motion.button>
        </div>
      </Motion.section>
    </div>
  );
}

function DashboardShell({ session, setSession }) {
  const [route, setRoute] = useState(readRoute());

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const api = useMemo(() => {
    const token = session?.token || "";
    return axios.create({
      baseURL: API_BASE,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }, [session?.token]);

  const logout = async () => {
    try {
      if (session?.token) {
        await api.post("/auth/logout");
      }
    } catch {
      // Ignore logout failures and clear local session anyway.
    }
    window.localStorage.removeItem(SESSION_KEY);
    setSession(null);
    navigate("/signin");
  };

  const handleAuthError = () => {
    window.localStorage.removeItem(SESSION_KEY);
    setSession(null);
    navigate("/signin");
  };

  const role = session?.user?.role || "candidate";
  const dashboardRoute = role === "recruiter" ? "/recruiter" : "/candidate";

  useEffect(() => {
    if (route !== dashboardRoute) {
      navigate(dashboardRoute);
    }
  }, [dashboardRoute, route]);

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(31,23,18,0.95),rgba(18,14,11,0.92))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-stone-500">ProRes Platform</p>
            <h2 className="mt-2 text-2xl font-black text-white">{session?.user?.name || session?.user?.email}</h2>
            <p className="mt-1 text-sm text-stone-400">{role === "recruiter" ? "Recruiter access: job posting, ranking, filtering, shortlisting" : "Candidate access: analysis, jobs, and applications"}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-stone-300">
              {role}
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-stone-300 transition hover:text-white"
            >
              <LogOut size={13} className="mr-2 inline" />
              Sign Out
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <Motion.div key={role} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {role === "recruiter" ? (
              <RecruiterDashboard api={api} onAuthError={handleAuthError} />
            ) : (
              <CandidateDashboard session={session} setSession={setSession} api={api} onAuthError={handleAuthError} />
            )}
          </Motion.div>
        </AnimatePresence>
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
      const stored = window.localStorage.getItem(SESSION_KEY);
      if (!stored) {
        setBooting(false);
        if (!["/signin", "/signup"].includes(readRoute())) navigate("/signin");
        return;
      }

      try {
        const parsed = JSON.parse(stored);
        const response = await axios.get(`${API_BASE}/auth/session`, {
          headers: { Authorization: `Bearer ${parsed.token}` },
        });
        const auth = response.data.auth;
        setSession(auth);
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(auth));
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
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className={`${authCard} w-full max-w-xl text-center`}>
          <LoaderCircle className="mx-auto animate-spin text-amber-300" size={28} />
          <p className="mt-4 text-sm text-stone-300">Restoring your secure session and role-aware workspace...</p>
        </div>
      </div>
    );
  }

  if (session) {
    return <DashboardShell session={session} setSession={setSession} />;
  }

  const safeRoute = route === "/signup" ? "/signup" : "/signin";
  if (route !== safeRoute) navigate(safeRoute);

  return <AuthPage mode={safeRoute === "/signup" ? "signup" : "signin"} onSuccess={handleAuthSuccess} />;
}
