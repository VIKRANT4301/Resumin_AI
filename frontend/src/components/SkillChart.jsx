import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

function normalizeMetric(item) {
  if (!item || typeof item !== "object") {
    return {
      skill: typeof item === "string" ? item : "Unknown Skill",
      similarity: 0,
      matched: false,
      tier: "bonus",
      evidence_text: "",
    };
  }

  return {
    skill: item.skill || item.name || "Unknown Skill",
    similarity: typeof item.similarity === "number" ? item.similarity : (item.actualValue || 0) / 100,
    matched: item.matched === true,
    tier: item.tier || "bonus",
    evidence_text: item.evidence_text || "",
  };
}

function getFill(score) {
  if (score >= 80) return "#34d399";
  if (score >= 50) return "#f5bd4e";
  return "#fb7185";
}

export default function SkillChart({ scores, matchResult = null }) {
  const rawMetrics = matchResult?.skill_analysis?.matched_skills || Object.values(scores || {});
  const metrics = rawMetrics.map(normalizeMetric);

  if (!metrics.length) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-[#140f0c] p-10 text-center text-stone-400">
        No job skill coverage is available yet. Upload a resume and target role to see semantic matching details.
      </div>
    );
  }

  const data = metrics.map((item) => {
    const score = Math.min(Math.max(item.similarity * 100, 0), 100);
    return {
      name: item.skill,
      actualValue: score,
      value: 1,
      fill: getFill(score),
      matched: item.matched,
      tier: item.tier,
      evidence_text: item.evidence_text,
    };
  });

  const matchedCount = data.filter((item) => item.actualValue >= 50).length;
  const missingCount = data.filter((item) => item.actualValue < 50).length;
  const averageScore = data.length
    ? Math.round(data.reduce((sum, item) => sum + item.actualValue, 0) / data.length)
    : 0;

  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 34;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#a8a29e"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-[10px] font-black uppercase tracking-[0.18em]"
      >
        {name}
      </text>
    );
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-emerald-500/15 bg-emerald-500/8 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Covered Skills</p>
          <p className="mt-2 text-3xl font-black text-white">{matchedCount}</p>
        </div>
        <div className="rounded-[1.5rem] border border-amber-500/15 bg-amber-500/8 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">Average Fit</p>
          <p className="mt-2 text-3xl font-black text-white">{averageScore}%</p>
        </div>
        <div className="rounded-[1.5rem] border border-rose-500/15 bg-rose-500/8 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-200">Weak Signals</p>
          <p className="mt-2 text-3xl font-black text-white">{missingCount}</p>
        </div>
      </div>

      <div className="relative flex h-[460px] items-center justify-center overflow-visible rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(18,15,12,0.88),rgba(14,11,9,0.8))] p-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={94}
              outerRadius={132}
              paddingAngle={data.length > 10 ? 3 : 5}
              dataKey="value"
              stroke="#120f0d"
              strokeWidth={4}
              label={renderCustomizedLabel}
              labelLine={{ stroke: "#44403c", strokeWidth: 1 }}
              animationDuration={1300}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  style={{ filter: `drop-shadow(0 0 12px ${entry.fill}44)` }}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div
                      className="rounded-2xl border border-white/10 bg-[#120f0d]/95 p-4 shadow-2xl backdrop-blur-xl"
                      style={{ borderLeft: `4px solid ${item.fill}` }}
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white">{item.name}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-stone-800">
                          <div className="h-full transition-all duration-700" style={{ width: `${item.actualValue}%`, backgroundColor: item.fill }} />
                        </div>
                        <span className="font-mono text-[10px] text-stone-300">{Math.round(item.actualValue)}%</span>
                      </div>
                      {item.evidence_text ? (
                        <p className="mt-3 max-w-[220px] text-xs leading-5 text-stone-400">{item.evidence_text}</p>
                      ) : null}
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full border border-white/10 bg-[#18120f]/90 shadow-inner backdrop-blur-xl">
            <span className="mb-1 text-[8px] font-black uppercase tracking-[0.4em] text-stone-500">Nodes</span>
            <span className="text-4xl font-black leading-none text-white">{data.length}</span>
            <span className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">{averageScore}% avg</span>
          </div>
          <div className="absolute h-44 w-44 animate-pulse rounded-full border border-cyan-400/5" />
        </div>
      </div>
    </div>
  );
}
