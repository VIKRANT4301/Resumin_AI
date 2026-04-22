import { FileText, FileUp, Link2, Sparkles, WandSparkles } from "lucide-react";
import { useState } from "react";

function QuickBenefit({ title, text }) {
  return (
    <div className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">{title}</p>
      <p className="mt-2 text-xs leading-5 text-stone-400">{text}</p>
    </div>
  );
}

export default function Upload({ onAnalyze }) {
  const [file, setFile] = useState(null);
  const [inputMode, setInputMode] = useState("text");
  const [jobText, setJobText] = useState("");
  const [jobUrl, setJobUrl] = useState("");

  const handleSubmit = () => {
    const jobInput = inputMode === "url" ? jobUrl.trim() : jobText.trim();

    if (!file) {
      alert("Please upload a resume.");
      return;
    }

    if (!jobInput) {
      alert(inputMode === "url" ? "Please paste the job URL." : "Please paste the job description.");
      return;
    }

    onAnalyze(file, jobInput);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[2rem] border border-amber-300/15 bg-[linear-gradient(135deg,rgba(245,158,11,0.14),rgba(24,20,16,0.88))] p-5 shadow-[0_12px_34px_rgba(0,0,0,0.18)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300 text-stone-950">
            <WandSparkles size={18} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">Candidate Flow</p>
            <h3 className="mt-1 text-2xl font-black text-white">Automated resume intelligence</h3>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-stone-300">
          Upload a resume, paste the target role or a job link, and get structured extraction, semantic scoring, and direct coaching in one guided result.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <QuickBenefit title="Parsed Profile" text="See what the model extracted before trusting the score." />
        <QuickBenefit title="Semantic Fit" text="Match meaning and evidence, not just exact keyword overlap." />
        <QuickBenefit title="Actionable Advice" text="Get the clearest next improvements for this role." />
      </div>

      <label className="block cursor-pointer rounded-[1.8rem] border border-dashed border-white/12 bg-[#120f0d] p-6 transition hover:border-amber-300/35 hover:bg-[#15110d]">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-300">
            <FileUp size={22} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-white">Resume Upload</p>
            <p className="mt-2 text-sm text-stone-400">
              {file ? file.name : "PDF, DOC, DOCX, and image resumes are supported. Click here to choose a file."}
            </p>
            <div className="mt-4 inline-flex rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
              {file ? "Ready for parsing" : "Awaiting file"}
            </div>
          </div>
        </div>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="hidden"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setInputMode("text")}
          className={`rounded-[1.4rem] px-4 py-4 text-left transition ${
            inputMode === "text"
              ? "bg-amber-300 text-stone-950"
              : "border border-white/8 bg-[#120f0d] text-stone-400"
          }`}
        >
          <FileText size={16} />
          <p className="mt-3 text-xs font-black uppercase tracking-[0.16em]">Paste JD</p>
          <p className={`mt-2 text-xs leading-5 ${inputMode === "text" ? "text-stone-800" : "text-stone-500"}`}>
            Use the full role description directly.
          </p>
        </button>
        <button
          type="button"
          onClick={() => setInputMode("url")}
          className={`rounded-[1.4rem] px-4 py-4 text-left transition ${
            inputMode === "url"
              ? "bg-amber-300 text-stone-950"
              : "border border-white/8 bg-[#120f0d] text-stone-400"
          }`}
        >
          <Link2 size={16} />
          <p className="mt-3 text-xs font-black uppercase tracking-[0.16em]">Use URL</p>
          <p className={`mt-2 text-xs leading-5 ${inputMode === "url" ? "text-stone-800" : "text-stone-500"}`}>
            Extract the job description from a live link.
          </p>
        </button>
      </div>

      {inputMode === "text" ? (
        <div className="rounded-[1.8rem] border border-white/8 bg-[#120f0d] p-4">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
            <FileText size={14} />
            Target Job Description
          </div>
          <textarea
            placeholder="Paste the target role here..."
            value={jobText}
            onChange={(event) => setJobText(event.target.value)}
            className="h-44 w-full rounded-2xl border border-white/8 bg-[#1a1511] p-4 text-sm text-stone-100 outline-none placeholder:text-stone-500"
          />
        </div>
      ) : (
        <div className="rounded-[1.8rem] border border-white/8 bg-[#120f0d] p-4">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
            <Link2 size={14} />
            Job URL
          </div>
          <input
            type="text"
            placeholder="https://company.com/jobs/role"
            value={jobUrl}
            onChange={(event) => setJobUrl(event.target.value)}
            className="w-full rounded-2xl border border-white/8 bg-[#1a1511] p-4 text-sm text-stone-100 outline-none placeholder:text-stone-500"
          />
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full rounded-[1.6rem] bg-amber-300 px-5 py-4 text-xs font-black uppercase tracking-[0.22em] text-stone-950 transition hover:bg-amber-200"
      >
        <Sparkles size={14} className="mr-2 inline" />
        Analyze Resume Match
      </button>
    </div>
  );
}
