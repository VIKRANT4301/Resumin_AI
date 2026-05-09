import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import GeometricBackground from "../components/GeometricBackground";
import {
  BrainCircuit,
  LogOut,
  BarChart3,
  Briefcase,
  User,
  Zap,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  Sun,
  Moon
} from "lucide-react";

import { SESSION_KEY, createAuthorizedApi } from "../services/api";
import { navigate, readRoute } from "../utils/navigation";

const candidateNavItems = [
  { name: "Analysis", icon: Zap, desc: "Match yourself to any job" },
  { name: "Jobs", icon: Briefcase, desc: "Browse open opportunities" },
  { name: "Profile", icon: User, desc: "Your resume & career data" },
  { name: "Insights", icon: BarChart3, desc: "Skill gaps & improvement" },
];

export default function DashboardShell({ session, setSession, candidateView, recruiterView }) {
  const [route, setRoute] = useState(readRoute());
  const [activeSection, setActiveSection] = useState("Analysis");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved !== "light" : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.remove("light-theme");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.add("light-theme");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const api = useMemo(() => createAuthorizedApi(session?.token || ""), [session?.token]);

  const logout = async () => {
    try {
      if (session?.token) {
        await api.post("/auth/logout");
      }
    } catch {
      // Ignore logout failures.
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

  const userName = session?.user?.name || session?.user?.email || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-20 items-center justify-between px-6 border-b border-[var(--glass-border)] shrink-0">
        <div className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="ResuMind AI Logo" className="w-10 h-10 object-contain rounded-xl" />
          <div>
            <span className="font-black text-lg tracking-tighter text-[var(--text-main)]">ResuMind<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B8CFF] to-[#8A2BE2]">AI</span></span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f5bd4e] animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">Candidate Portal</span>
            </div>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-8 h-8 rounded-xl border border-white/10 flex items-center justify-center text-stone-400 hover:text-white transition">
          <X size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <p className="px-3 mb-4 text-[9px] font-black uppercase tracking-[0.25em] text-stone-600">Candidate Workspace</p>
        {candidateNavItems.map((item) => {
          const isActive = activeSection === item.name;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => { setActiveSection(item.name); setSidebarOpen(false); }}
              className={`relative flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all group ${isActive ? "text-[var(--text-main)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
            >
              {isActive && (
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(245,189,78,0.15), rgba(255,255,255,0.03))",
                    border: "1px solid rgba(245,189,78,0.25)",
                    boxShadow: "0 2px 16px rgba(245,189,78,0.08)"
                  }}
                />
              )}
              <item.icon
                size={18}
                className={`relative z-10 transition-colors ${isActive ? "text-[#f5bd4e]" : "text-[var(--text-muted)] group-hover:text-[var(--text-main)]"}`}
              />
              <div className="relative z-10 text-left">
                <p className={isActive ? "text-[var(--text-main)]" : ""}>{item.name}</p>
                <p className="text-[10px] font-medium text-[var(--text-muted)] leading-3 mt-0.5 opacity-80">{item.desc}</p>
              </div>
              {isActive && <ChevronRight size={14} className="relative z-10 ml-auto text-[#f5bd4e] opacity-60" />}
            </button>
          );
        })}

        {/* Divider */}
        <div className="my-4 border-t border-[var(--glass-border)]" />

        {/* Profile Quick Card */}
        <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 space-y-3">
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-stone-600">Your Profile</p>
          <div className="flex items-center gap-2">
            <div
              className="h-9 w-9 shrink-0 rounded-xl flex items-center justify-center font-black text-sm text-white"
              style={{ background: "linear-gradient(135deg, #f5bd4e, #e07b39)" }}
            >
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-[var(--text-main)] truncate">{session?.user?.name || "Candidate"}</p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">{session?.user?.current_title || "No title set"}</p>
            </div>
          </div>
          {session?.user?.target_title && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#f5bd4e]/10 border border-[#f5bd4e]/20">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Target:</span>
              <span className="text-xs font-black text-[#f5bd4e] truncate">{session.user.target_title}</span>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom: logout */}
      <div className="shrink-0 border-t border-[var(--glass-border)] p-4">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--glass-border)] py-3 text-xs font-black uppercase tracking-[0.18em] text-[var(--text-muted)] transition-all hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <GeometricBackground>
      <div className="flex h-screen overflow-hidden bg-transparent">

        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <aside className="relative z-10 hidden lg:flex w-72 flex-col border-r border-[var(--glass-border)] bg-[var(--surface-0)] backdrop-blur-2xl bg-opacity-80">
          <SidebarContent />
        </aside>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <Motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[var(--glass-border)] bg-[var(--surface-0)] backdrop-blur-3xl lg:hidden"
            >
              <SidebarContent />
            </Motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="relative z-10 flex flex-1 flex-col min-w-0">

          {/* Top Navbar */}
          <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[var(--glass-border)] bg-[var(--surface-0)]/80 backdrop-blur-2xl px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-10 h-10 rounded-xl border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition"
              >
                <Menu size={18} />
              </button>
              <div>
                <h1 className="text-lg font-black text-[var(--text-main)] tracking-tight hidden sm:block">Candidate Workspace</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                <input
                  type="text"
                  placeholder="Search jobs, skills..."
                  className="w-64 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-[#f5bd4e]/30 focus:bg-[#f5bd4e]/5 focus:outline-none transition-all"
                />
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="relative w-10 h-10 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--glass-border-hover)] transition"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <button className="relative w-10 h-10 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--glass-border-hover)] transition">
                <Bell size={16} />
              </button>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white cursor-pointer"
                style={{ background: "linear-gradient(135deg, #f5bd4e, #e07b39)" }}
              >
                {userInitial}
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8">
            <AnimatePresence mode="wait">
              <Motion.div
                key={role}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="mx-auto max-w-7xl"
              >
                {role === "recruiter"
                  ? recruiterView({ api, onAuthError: handleAuthError })
                  : candidateView({ api, onAuthError: handleAuthError, activeSection, onSectionChange: setActiveSection })}
              </Motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </GeometricBackground>
  );
}
