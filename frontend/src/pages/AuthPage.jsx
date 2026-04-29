import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  BrainCircuit, LoaderCircle, ShieldCheck, UserRound, Users, Layers3,
  ArrowRight, Upload, Eye, EyeOff, Check
} from "lucide-react";

import { API_BASE, SESSION_KEY } from "../services/api";
import { navigate } from "../utils/navigation";
import HolographicFigure from "../components/HolographicFigure";

const features = [
  { icon: Users,       color: "#5B8CFF", label: "Smart Ranking",   desc: "AI ranks by semantic fit, not just keywords." },
  { icon: BrainCircuit,color: "#8A2BE2", label: "Deep Intelligence",desc: "Inferred skills, trust signals, gap analysis." },
  { icon: Layers3,     color: "#4cc890", label: "Full Workflow",    desc: "Job post to shortlist — one cohesive platform." },
  { icon: ShieldCheck, color: "#f5bd4e", label: "Enterprise Ready", desc: "Secure auth, role-based access, audit trails." },
];

function PremiumInput({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">{label}</label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-stone-600 outline-none focus:border-[#5B8CFF]/50 focus:bg-[#5B8CFF]/5 transition-all"
      />
    </div>
  );
}

export default function AuthPage({ mode, onSuccess }) {
  const isSignUp = mode === "signup";
  const [role, setRole]           = useState("candidate");
  const [form, setForm]           = useState({ name: "", email: "", password: "", phone: "", location: "", current_title: "", target_title: "" });
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const update = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const submit = async () => {
    setLoading(true); setError("");
    try {
      let response;
      if (isSignUp) {
        if (!form.name.trim() || !form.email.trim() || !form.password.trim()) throw new Error("Name, email, and password are required.");
        if (role === "candidate" && !resumeFile) throw new Error("Candidate signup requires a resume.");
        const payload = new FormData();
        Object.entries({ ...form, role }).forEach(([k, v]) => payload.append(k, v));
        if (resumeFile) payload.append("file", resumeFile);
        response = await axios.post(`${API_BASE}/auth/register`, payload);
      } else {
        if (!form.email.trim() || !form.password.trim()) throw new Error("Email and password are required.");
        response = await axios.post(`${API_BASE}/auth/login`, { email: form.email, password: form.password });
      }
      if (response.data.status !== "success" || !response.data.auth) throw new Error(response.data.message || "Authentication failed");
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(response.data.auth));
      onSuccess(response.data.auth);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || err.message || "Authentication failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#03060D] overflow-hidden flex">
      
      {/* ── Cinematic Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F1A] via-[#080B14] to-[#03060D]" />
        {/* Static orbs (Optimized) */}
        <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-[#5B8CFF]/8 to-transparent blur-[130px]" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[65vw] h-[65vw] rounded-full bg-gradient-to-tl from-[#8A2BE2]/8 to-transparent blur-[160px]" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: "linear-gradient(rgba(91,140,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(91,140,255,0.5) 1px,transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
      </div>

      {/* ── LEFT PANEL — Holographic Figure ── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] p-12 relative z-10">
        
        {/* Logo */}
        <Motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="ResuMind AI Logo" className="w-11 h-11 object-contain rounded-xl" />
          <span className="font-black text-2xl tracking-tighter text-white">ResuMind<span className="text-[#5B8CFF]">AI</span></span>
        </Motion.div>

        {/* Holographic figure — takes center stage */}
        <Motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.3 }}
          className="flex-1 flex flex-col items-center justify-center py-8"
        >
          {/* Tagline above figure */}
          <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}
            className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4">
              <span className="w-2 h-2 rounded-full bg-[#4cc890] animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-stone-300">Next-Gen AI Hiring</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black tracking-tighter text-white leading-[1.1]">
              The intelligence layer{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg,#5B8CFF,#8A2BE2,#FF5BEF)" }}>
                your hiring
              </span>{" "}needs
            </h1>
          </Motion.div>

          {/* THE HOLOGRAPHIC FIGURE */}
          <div className="w-full max-w-sm h-[380px] relative">
            <HolographicFigure />
          </div>
        </Motion.div>

        {/* Feature cards — compact 2x2 at bottom */}
        <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-2 gap-3">
          {features.map((feat, i) => (
            <Motion.div key={feat.label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] hover:border-white/10 transition-all"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5"
                style={{ backgroundColor: `${feat.color}20`, border: `1px solid ${feat.color}35` }}>
                <feat.icon size={14} style={{ color: feat.color }} />
              </div>
              <p className="text-xs font-black text-white">{feat.label}</p>
              <p className="mt-1 text-[10px] text-stone-500 leading-4">{feat.desc}</p>
            </Motion.div>
          ))}
        </Motion.div>
      </div>

      {/* ── RIGHT PANEL — Auth Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <Motion.div
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img src="/logo.jpeg" alt="ResuMind AI Logo" className="w-10 h-10 object-contain rounded-xl" />
            <span className="font-black text-xl tracking-tighter text-white">ResuMind<span className="text-[#5B8CFF]">AI</span></span>
          </div>

          {/* Card */}
          <div className="rounded-[2rem] border border-white/[0.08] bg-[#080B14]/85 backdrop-blur-2xl p-8 shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
            <div className="absolute inset-x-0 top-0 h-px mx-8 bg-gradient-to-r from-transparent via-[#5B8CFF]/40 to-transparent rounded-t-[2rem]" />

            {/* Header */}
            <div className="flex items-start justify-between mb-7">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-stone-500">
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </p>
                <h2 className="mt-2 text-3xl font-black text-white tracking-tight">
                  {isSignUp ? "Join ResuMind" : "Sign In"}
                </h2>
              </div>
              <button type="button" onClick={() => navigate(isSignUp ? "/signin" : "/signup")}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-stone-300 hover:text-white hover:border-white/20 transition-all">
                {isSignUp ? "Sign In" : "Sign Up"}<ArrowRight size={11} />
              </button>
            </div>

            {/* Role Selector (Sign Up only) */}
            <AnimatePresence>
              {isSignUp && (
                <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="mb-5 grid grid-cols-2 gap-3">
                  {[
                    { value: "candidate", label: "Candidate", desc: "Analyze your fit", color: "#f5bd4e" },
                    { value: "recruiter", label: "Recruiter",  desc: "Rank candidates", color: "#5B8CFF" },
                  ].map(opt => (
                    <button key={opt.value} type="button" onClick={() => setRole(opt.value)}
                      className={`relative rounded-2xl p-4 text-left transition-all border overflow-hidden ${
                        role === opt.value ? "border-white/20 bg-white/5 text-white" : "border-white/5 bg-white/[0.02] text-stone-500 hover:text-stone-300 hover:border-white/10"
                      }`}>
                      {role === opt.value && (
                        <span className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: opt.color }}>
                          <Check size={10} className="text-white" strokeWidth={3} />
                        </span>
                      )}
                      <p className="text-xs font-black uppercase tracking-[0.16em]">{opt.label}</p>
                      <p className="mt-1 text-[11px] opacity-70">{opt.desc}</p>
                    </button>
                  ))}
                </Motion.div>
              )}
            </AnimatePresence>

            {/* Form Fields */}
            <div className="space-y-4">
              {isSignUp ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <PremiumInput label="Full Name" value={form.name} onChange={update("name")} placeholder="Your name" />
                    <PremiumInput label="Email" type="email" value={form.email} onChange={update("email")} placeholder="you@work.com" />
                  </div>
                  <div className="relative">
                    <PremiumInput label="Password" type={showPassword ? "text" : "password"} value={form.password} onChange={update("password")} placeholder="Min 6 characters" />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-[34px] text-stone-500 hover:text-stone-300 transition">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <PremiumInput label="Phone" value={form.phone} onChange={update("phone")} placeholder="Optional" />
                    <PremiumInput label="Location" value={form.location} onChange={update("location")} placeholder="Optional" />
                  </div>
                  <PremiumInput label="Current Title" value={form.current_title} onChange={update("current_title")} placeholder="Your current role" />
                  {role === "candidate" && (
                    <>
                      <PremiumInput label="Target Title" value={form.target_title} onChange={update("target_title")} placeholder="Role you want" />
                      <label className="block cursor-pointer rounded-2xl border border-dashed bg-white/[0.02] p-4 transition-all hover:border-[#5B8CFF]/40 hover:bg-[#5B8CFF]/5"
                        style={{ borderColor: resumeFile ? "rgba(91,140,255,0.5)" : "rgba(255,255,255,0.08)" }}>
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${resumeFile ? "bg-[#5B8CFF]/20" : "bg-white/5"}`}>
                            {resumeFile ? <Check size={16} className="text-[#5B8CFF]" /> : <Upload size={16} className="text-stone-500" />}
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">Resume Upload</p>
                            <p className="mt-0.5 text-xs text-stone-500">{resumeFile ? resumeFile.name : "PDF, DOC, or DOCX"}</p>
                          </div>
                        </div>
                        <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setResumeFile(e.target.files?.[0] || null)} />
                      </label>
                    </>
                  )}
                </>
              ) : (
                <>
                  <PremiumInput label="Email" type="email" value={form.email} onChange={update("email")} placeholder="you@work.com" />
                  <div className="relative">
                    <PremiumInput label="Password" type={showPassword ? "text" : "password"} value={form.password} onChange={update("password")} placeholder="Your password" />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-[34px] text-stone-500 hover:text-stone-300 transition">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </>
              )}

              <AnimatePresence>
                {error && (
                  <Motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                    {error}
                  </Motion.div>
                )}
              </AnimatePresence>

              <Motion.button
                whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}
                type="button" onClick={submit} disabled={loading}
                className="relative w-full rounded-2xl overflow-hidden py-4 font-black text-sm uppercase tracking-[0.2em] text-white disabled:opacity-60 transition-all"
                style={{ background: "linear-gradient(135deg,#5B8CFF,#8A2BE2)", boxShadow: "0 0 30px rgba(91,140,255,0.3)" }}
              >
                <span className="relative flex items-center justify-center gap-2">
                  {loading
                    ? <><LoaderCircle size={16} className="animate-spin" /> Please Wait</>
                    : <>{isSignUp ? "Create Account" : "Sign In"} <ArrowRight size={16} /></>}
                </span>
              </Motion.button>
            </div>

            <p className="mt-6 text-center text-xs text-stone-600">
              By continuing, you agree to ResuMind&apos;s{" "}
              <span className="text-stone-400 cursor-pointer hover:text-white transition">Terms</span> and{" "}
              <span className="text-stone-400 cursor-pointer hover:text-white transition">Privacy Policy</span>
            </p>
          </div>
        </Motion.div>
      </div>
    </div>
  );
}
