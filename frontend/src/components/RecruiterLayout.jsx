import { useState, useEffect } from "react";
import GeometricBackground from "./GeometricBackground";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  Briefcase, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  Search, 
  Settings, 
  Users, 
  X,
  Bell,
  ChevronRight
} from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Job Posts", icon: Briefcase },
  { name: "Candidates", icon: Users },
  { name: "Analytics", icon: BarChart3 },
  { name: "Settings", icon: Settings },
];

export default function RecruiterLayout({ children, session, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeHover, setActiveHover] = useState(null);
  const [activeSection, setActiveSection] = useState("Dashboard");

  useEffect(() => {
    setSidebarOpen(false);
  }, [activeSection]);

  const userName = session?.user?.name || session?.user?.email || "Recruiter";
  const userInitial = userName.charAt(0).toUpperCase();

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-20 items-center justify-between px-6 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="ResuMind AI Logo" className="w-10 h-10 object-contain rounded-xl" />
          <div>
            <span className="font-black text-lg tracking-tighter text-white">ResuMind<span className="text-[#5B8CFF]">AI</span></span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4cc890] animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">Recruiter Pro</span>
            </div>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-8 h-8 rounded-xl border border-white/10 flex items-center justify-center text-stone-400 hover:text-white transition">
          <X size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <p className="px-3 mb-4 text-[9px] font-black uppercase tracking-[0.25em] text-stone-600">Workspace</p>
        {navItems.map((item) => {
          const isActive = activeSection === item.name;
          return (
            <motion.button
              key={item.name}
              type="button"
              onClick={() => { setActiveSection(item.name); setSidebarOpen(false); }}
              onHoverStart={() => setActiveHover(item.name)}
              onHoverEnd={() => setActiveHover(null)}
              className={`relative flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all group ${
                isActive ? "text-white" : "text-stone-500 hover:text-stone-200"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(91,140,255,0.15), rgba(138,43,226,0.08))",
                    border: "1px solid rgba(91,140,255,0.25)",
                    boxShadow: "0 2px 16px rgba(91,140,255,0.1)"
                  }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              {!isActive && activeHover === item.name && (
                <div className="absolute inset-0 rounded-2xl bg-white/[0.03] border border-white/[0.05]" />
              )}
              <item.icon size={18}
                className={`relative z-10 transition-colors ${isActive ? "text-[#5B8CFF]" : "text-stone-600 group-hover:text-stone-400"}`}
              />
              <span className="relative z-10">{item.name}</span>
              {isActive && <ChevronRight size={14} className="relative z-10 ml-auto text-[#5B8CFF] opacity-60" />}
            </motion.button>
          );
        })}

        {/* Divider */}
        <div className="my-4 border-t border-white/[0.05]" />
        
        {/* Quick Stats Widget */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-stone-600">Today's Activity</p>
          {[
            { label: "Candidates Ranked", value: "—", color: "#5B8CFF" },
            { label: "Shortlisted", value: "—", color: "#4cc890" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center justify-between">
              <span className="text-xs text-stone-500">{stat.label}</span>
              <span className="text-sm font-black" style={{ color: stat.color }}>{stat.value}</span>
            </div>
          ))}
        </div>
      </nav>

      {/* User Profile + Logout */}
      <div className="shrink-0 border-t border-white/[0.06] p-4 space-y-3">
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
          <div
            className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-black text-sm text-white"
            style={{ background: "linear-gradient(135deg, #5B8CFF, #8A2BE2)" }}
          >
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-white">{userName}</p>
            <p className="truncate text-[10px] font-medium text-stone-500">{session?.user?.email || "Pro Access"}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] py-3 text-xs font-black uppercase tracking-[0.18em] text-stone-500 transition-all hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/20"
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

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="relative z-10 hidden lg:flex w-72 flex-col border-r border-white/[0.06] bg-[#05080F]/80 backdrop-blur-2xl">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/[0.06] bg-[#05080F]/95 backdrop-blur-3xl lg:hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 flex flex-1 flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/[0.06] bg-[#03060D]/80 backdrop-blur-2xl px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-stone-400 hover:text-white transition"
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-lg font-black text-white hidden sm:block tracking-tight">{activeSection}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-600" size={14} />
              <input
                type="text"
                placeholder="Search candidates, skills..."
                className="w-72 rounded-full border border-white/[0.06] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-stone-600 focus:border-[#5B8CFF]/40 focus:bg-[#5B8CFF]/5 focus:outline-none transition-all"
              />
            </div>

            <button className="relative w-10 h-10 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-stone-400 hover:text-white hover:border-white/10 transition">
              <Bell size={16} />
              <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-[#5B8CFF] shadow-[0_0_6px_rgba(91,140,255,0.8)]" />
            </button>

            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white cursor-pointer"
              style={{ background: "linear-gradient(135deg, #5B8CFF, #8A2BE2)" }}
              title={userName}
            >
              {userInitial}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-7xl"
          >
            {typeof children === "function"
              ? children({ activeSection, onSectionChange: setActiveSection })
              : children}
          </motion.div>
        </main>
      </div>
    </div>
    </GeometricBackground>
  );
}
