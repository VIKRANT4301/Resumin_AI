import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { LogOut } from "lucide-react";

import { SESSION_KEY, createAuthorizedApi } from "../services/api";
import { navigate, readRoute } from "../utils/navigation";

export default function DashboardShell({ session, setSession, candidateView, recruiterView }) {
  const [route, setRoute] = useState(readRoute());

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
    <div className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(31,23,18,0.95),rgba(18,14,11,0.92))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)] md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-stone-500">ProRes Platform</p>
            <h2 className="mt-2 truncate text-2xl font-black text-white">{session?.user?.name || session?.user?.email}</h2>
            <p className="mt-1 text-sm text-stone-400">
              {role === "recruiter"
                ? "Recruiter access: job posting, ranking, filtering, shortlisting"
                : "Candidate access: analysis, jobs, and applications"}
            </p>
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
            {role === "recruiter"
              ? recruiterView({ api, onAuthError: handleAuthError })
              : candidateView({ api, onAuthError: handleAuthError })}
          </Motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
