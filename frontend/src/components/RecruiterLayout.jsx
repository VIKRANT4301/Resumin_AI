import { useState, useEffect } from "react";
import GeometricBackground from "./GeometricBackground";
import { motion as Motion, AnimatePresence } from "framer-motion";
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
  ChevronRight,
  Sparkles
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
      <div className="flex h-24 items-center justify-between px-6 border-b border-white/[0.04] shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-emerald-400/5 pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-[1.2rem] bg-[linear-gradient(135deg,#67e8f9,#a7f3d0)] flex items-center justify-center shadow-[0_0_20px_rgba(103,232,249,0.3)] border border-white/10">
             <Sparkles size={20} className="text-stone-950" />
          </div>
          <div>
            <span className="font-display font-black text-xl tracking-tighter text-white drop-shadow-md">ResuMind<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">AI</span></span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">Pro Recruiter</span>
            </div>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-10 h-10 rounded-[1rem] border border-white/10 flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/5 transition-all">
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-5 space-y-2 relative z-10">
        <p className="px-3 mb-5 text-[10px] font-black uppercase tracking-[0.25em] text-stone-500">Workspace</p>
        {navItems.map((item) => {
          const isActive = activeSection === item.name;
          return (
            <Motion.button
              key={item.name}
              type="button"
              onClick={() => { setActiveSection(item.name); setSidebarOpen(false); }}
              onHoverStart={() => setActiveHover(item.name)}
              onHoverEnd={() => setActiveHover(null)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`relative flex w-full items-center gap-4 rounded-[1.2rem] px-5 py-4 text-sm font-bold transition-all group overflow-hidden ${
                isActive ? "text-stone-950 shadow-lg" : "text-stone-400 hover:text-white"
              }`}
            >
              {isActive && (
                <Motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-[1.2rem] border border-white/10"
                  style={{
                    background: "linear-gradient(135deg, #67e8f9, #a7f3d0)",
                    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1), 0 4px 20px rgba(103,232,249,0.3)"
                  }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              {!isActive && activeHover === item.name && (
                <div className="absolute inset-0 rounded-[1.2rem] bg-white/[0.03] border border-white/[0.05]" />
              )}
              <item.icon size={20}
                className={`relative z-10 transition-colors ${isActive ? "text-stone-950" : "text-stone-500 group-hover:text-stone-300"}`}
              />
              <span className="relative z-10 tracking-wide">{item.name}</span>
              {isActive && <ChevronRight size={16} className="relative z-10 ml-auto text-stone-950" />}
            </Motion.button>
          );
        })}

        <div className="my-6 border-t border-white/[0.04]" />
        
        {/* Quick Stats Widget */}
        <div className="rounded-[1.5rem] border border-cyan-400/10 bg-[linear-gradient(180deg,rgba(34,211,238,0.03),transparent)] p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/10 rounded-full blur-[20px] group-hover:bg-cyan-400/20 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400 mb-4 relative z-10">Today's Activity</p>
          <div className="space-y-4 relative z-10">
            {[
              { label: "Candidates Reviewed", value: "—", color: "#67e8f9" },
              { label: "Shortlisted", value: "—", color: "#4cc890" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-400">{stat.label}</span>
                <span className="text-sm font-black" style={{ color: stat.color, textShadow: `0 0 10px ${stat.color}40` }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* User Profile + Logout */}
      <div className="shrink-0 border-t border-white/[0.04] p-5 relative z-10 bg-[#0A0A0A]/50 backdrop-blur-md">
        <div className="flex items-center gap-3 rounded-[1.2rem] border border-white/[0.05] bg-white/[0.02] p-3 mb-3 hover:bg-white/[0.04] transition-colors cursor-pointer group">
          <div className="h-10 w-10 shrink-0 rounded-[0.8rem] flex items-center justify-center font-black text-sm text-stone-950 shadow-[0_0_15px_rgba(103,232,249,0.2)] group-hover:scale-105 transition-transform"
            style={{ background: "linear-gradient(135deg, #67e8f9, #a7f3d0)" }}>
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-white">{userName}</p>
            <p className="truncate text-[10px] font-bold uppercase tracking-widest text-cyan-400">Pro Access</p>
          </div>
        </div>
        <button onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-[1.2rem] border border-rose-500/20 py-3.5 text-xs font-black uppercase tracking-[0.2em] text-rose-400 transition-all hover:bg-rose-500 hover:text-white hover:border-rose-500 hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]">
          <LogOut size={16} /> Sign Out
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
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <aside className="relative z-10 hidden lg:flex w-[320px] flex-col border-r border-white/[0.04] bg-[#03060D]/90 backdrop-blur-3xl shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar Drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <Motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[320px] flex-col border-r border-white/[0.04] bg-[#03060D]/95 backdrop-blur-3xl shadow-2xl lg:hidden"
            >
              <SidebarContent />
            </Motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="relative z-10 flex flex-1 flex-col min-w-0 bg-[#0A0A0A]/40">
          
          {/* Top Navbar */}
          <header className="sticky top-0 z-30 flex h-24 items-center justify-between border-b border-white/[0.04] bg-[#03060D]/70 backdrop-blur-2xl px-8 shadow-sm">
            <div className="flex items-center gap-5">
              <button onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-12 h-12 rounded-[1.2rem] border border-white/10 flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/5 transition-all bg-[#121212]">
                <Menu size={20} />
              </button>
              <div>
                <Motion.h1 
                  key={activeSection}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-black text-white hidden sm:block tracking-tight drop-shadow-sm"
                >
                  {activeSection}
                </Motion.h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden lg:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={16} />
                <input type="text" placeholder="Search across pool..."
                  className="w-80 rounded-[1.2rem] border border-white/10 bg-[#121212] py-3 pl-11 pr-4 text-sm text-white font-medium placeholder:text-stone-600 focus:border-cyan-400/50 focus:bg-cyan-400/[0.02] focus:outline-none transition-all shadow-inner"
                />
              </div>

              <button className="relative w-12 h-12 rounded-[1.2rem] border border-white/10 bg-[#121212] flex items-center justify-center text-stone-400 hover:text-white hover:border-white/20 transition-all hover:bg-white/5 group">
                <Bell size={20} className="group-hover:scale-110 transition-transform" />
                <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]" />
              </button>

              <div className="w-12 h-12 rounded-[1.2rem] flex items-center justify-center font-black text-sm text-stone-950 shadow-[0_0_15px_rgba(103,232,249,0.2)] border border-white/10 hover:scale-105 transition-transform cursor-pointer"
                style={{ background: "linear-gradient(135deg, #67e8f9, #a7f3d0)" }} title={userName}>
                {userInitial}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-10 lg:py-12">
            <AnimatePresence mode="wait">
              <Motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 15, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mx-auto max-w-[1400px]"
              >
                {typeof children === "function" ? children({ activeSection, onSectionChange: setActiveSection }) : children}
              </Motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </GeometricBackground>
  );
}
