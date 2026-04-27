import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { motion } from 'framer-motion';

export function SkillDistributionChart({ candidate }) {
  const breakdown = candidate?.skillBreakdown || {};
  
  // Transform existing backend data into chart format
  const chartData = [
    { subject: 'Exact', A: (breakdown.exact_matches || []).length, fullMark: 10 },
    { subject: 'Semantic', A: (breakdown.semantic_matches || []).length, fullMark: 10 },
    { subject: 'Inferred', A: (breakdown.inferred_skills || []).length, fullMark: 10 },
    { subject: 'Missing', A: (breakdown.missing_skills || []).length, fullMark: 10 },
    { subject: 'Extra', A: Math.max(0, candidate?.resume?.skills?.length - 10) || 0, fullMark: 10 },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#a8a29e', fontSize: 10, fontWeight: 700 }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
          <Radar 
            name="Skills" 
            dataKey="A" 
            stroke="#67e8f9" 
            fill="#67e8f9" 
            fillOpacity={0.3} 
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MatchTrendChart({ score }) {
  // Mocking trend data based on the final score to simulate trend progress
  const mockData = [
    { name: 'Initial', score: Math.max(0, score - 30) },
    { name: 'Parsed', score: Math.max(0, score - 15) },
    { name: 'Semantic', score: score - 5 },
    { name: 'Final', score: score },
  ];

  return (
    <div className="h-24 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={mockData}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f5bd4e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f5bd4e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#f5bd4e" 
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorScore)"
            dot={{ r: 4, fill: '#f5bd4e', strokeWidth: 0 }} 
            activeDot={{ r: 6, strokeWidth: 0 }} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(18, 14, 11, 0.9)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#fff'
            }} 
            itemStyle={{ color: '#f5bd4e' }}
            cursor={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
