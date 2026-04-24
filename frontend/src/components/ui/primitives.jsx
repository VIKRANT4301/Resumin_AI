import { LoaderCircle, X } from "lucide-react";
import { motion as Motion } from "framer-motion";

export const authCardClass =
  "relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(103,232,249,0.1),transparent_34%),linear-gradient(180deg,rgba(24,19,15,0.98),rgba(14,11,9,0.98))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-sm";

export function AuthInput({ label, ...props }) {
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

export function FieldArea({ label, children }) {
  return (
    <label className="block">
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">{label}</p>
      {children}
    </label>
  );
}

export function TabButton({ active, children, onClick }) {
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

export function LoadingPanel({ label = "Running analysis" }) {
  return (
    <div className={`${authCardClass} min-h-[320px]`}>
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

export function ScoreBand({ score, label, accent = "cyan" }) {
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

export function ToastBanner({ message, tone = "success", onClose }) {
  if (!message) return null;

  const toneClass =
    tone === "error"
      ? "border-rose-500/20 bg-rose-500/10 text-rose-50"
      : tone === "warn"
        ? "border-amber-500/20 bg-amber-500/10 text-amber-50"
        : "border-emerald-500/20 bg-emerald-500/10 text-emerald-50";

  return (
    <div className={`flex items-start justify-between gap-3 rounded-[1.4rem] border p-4 text-sm shadow-[0_12px_28px_rgba(0,0,0,0.14)] ${toneClass}`}>
      <p className="leading-6">{message}</p>
      <button type="button" onClick={onClose} className="rounded-full p-1 text-current/80 transition hover:bg-white/10 hover:text-white">
        <X size={14} />
      </button>
    </div>
  );
}

export function ActionModal({
  open,
  title,
  description,
  value,
  onChange,
  onCancel,
  onConfirm,
  confirmLabel = "Confirm",
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(24,19,15,0.98),rgba(14,11,9,0.98))] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rose-200">Recruiter Action</p>
        <h3 className="mt-2 text-2xl font-black text-white">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-stone-300">{description}</p>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Optional rejection reason for internal audit trail..."
          className="mt-5 h-32 w-full rounded-[1.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,16,14,0.96),rgba(14,11,9,0.96))] p-4 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-rose-300/40"
        />
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="rounded-[1rem] border border-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-stone-200">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="rounded-[1rem] bg-[linear-gradient(135deg,#fb7185,#f97316)] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-white">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
