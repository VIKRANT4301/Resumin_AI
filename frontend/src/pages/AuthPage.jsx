import { useState } from "react";
import { motion as Motion } from "framer-motion";
import axios from "axios";
import { Layers3, LoaderCircle, ShieldCheck, UserRound, Users } from "lucide-react";

import { API_BASE, SESSION_KEY } from "../services/api";
import { navigate } from "../utils/navigation";
import { AuthInput, authCardClass } from "../components/ui/primitives";

export default function AuthPage({ mode, onSuccess }) {
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
            AI Hiring Intelligence System
          </div>
          <div>
            <h1 className="font-display text-5xl font-black tracking-tight text-white md:text-6xl">
              Decision support for recruiters, not just resume matching
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300">
              ProRes helps recruiters and HR teams screen faster with semantic, exact, and inferred matching, recruiter trust signals,
              candidate comparison, and workflow automation built into one product.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
              <Users className="text-cyan-300" size={18} />
              <p className="mt-3 text-lg font-black text-white">70% Faster</p>
              <p className="mt-2 text-sm leading-6 text-stone-400">Reduce manual screening time with explainable ranking.</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
              <UserRound className="text-amber-300" size={18} />
              <p className="mt-3 text-lg font-black text-white">Trust Layer</p>
              <p className="mt-2 text-sm leading-6 text-stone-400">See why the score exists, what is missing, and how confident the system is.</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
              <Layers3 className="text-emerald-300" size={18} />
              <p className="mt-3 text-lg font-black text-white">Automation</p>
              <p className="mt-2 text-sm leading-6 text-stone-400">Shortlist decisions, feedback capture, and recruiter workflow support.</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
              <LoaderCircle className="text-rose-300" size={18} />
              <p className="mt-3 text-lg font-black text-white">SaaS Ready</p>
              <p className="mt-2 text-sm leading-6 text-stone-400">Built for startups, recruiters, and lean hiring teams that need speed and clarity.</p>
            </div>
          </div>
        </div>
      </section>

      <Motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className={authCardClass}>
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
