import { motion } from 'framer-motion';
import { BarChart3, Users, FileText, TrendingUp } from 'lucide-react';

export default function DashboardPreview() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 right-[-10%] w-96 h-96 rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 left-[-5%] w-96 h-96 rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            Powerful <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Dashboard</span>
          </h2>
          <p className="text-lg text-stone-400 max-w-2xl mx-auto">
            Visualize candidate data, track metrics, and make data-driven decisions at a glance
          </p>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, rotateX: 10 }}
          whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className="rounded-[3rem] border border-white/10 bg-gradient-to-br from-white/[0.02] to-transparent backdrop-blur-3xl p-8 shadow-[0_40px_120px_rgba(91,140,255,0.15)]"
        >
          {/* Browser chrome */}
          <div className="mb-6 flex gap-3 items-center">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <div className="flex-1" />
          </div>

          {/* Dashboard grid */}
          <div className="space-y-6">
            {/* Top metrics row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Resumes', value: '2,847', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-400/30' },
                { label: 'Shortlisted', value: '342', icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-400/30' },
                { label: 'Avg. Match Score', value: '78.5%', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-400/30' },
                { label: 'Processing Time', value: '0.8s', icon: BarChart3, color: 'text-pink-400', bg: 'bg-pink-500/20', border: 'border-pink-400/30' },
              ].map((metric, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4"
                >
                  <div className={`w-10 h-10 rounded-lg ${metric.bg} border ${metric.border} flex items-center justify-center mb-3 ${metric.color}`}>
                    <metric.icon size={20} />
                  </div>
                  <p className="text-xs text-stone-400 uppercase tracking-[0.1em] mb-2">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold text-white">{metric.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Chart area */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4">Candidate Distribution</h3>

              {/* Fake bar chart */}
              <div className="space-y-4">
                {[
                  { skill: 'Python', percent: 85, color: 'bg-gradient-to-r from-blue-400' },
                  { skill: 'JavaScript', percent: 72, color: 'bg-gradient-to-r from-purple-400' },
                  { skill: 'React', percent: 68, color: 'bg-gradient-to-r from-pink-400' },
                  { skill: 'AWS', percent: 54, color: 'bg-gradient-to-r from-cyan-400' },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-300">{item.skill}</span>
                      <span className="font-bold text-white">{item.percent}%</span>
                    </div>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.8 }}
                      className="origin-left h-2 rounded-full bg-gradient-to-r from-white/10 to-transparent overflow-hidden"
                    >
                      <div
                        className={`h-full ${item.color} to-transparent`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </motion.div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Candidates list */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 space-y-4"
            >
              <h3 className="text-lg font-bold text-white mb-4">Top Shortlisted Candidates</h3>

              {[
                { name: 'Sarah Chen', score: 96, skills: ['React', 'Node.js', 'ML'] },
                { name: 'Alex Kumar', score: 92, skills: ['Python', 'AWS', 'SQL'] },
                { name: 'Maria García', score: 88, skills: ['Full-stack', 'DevOps'] },
              ].map((candidate, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/3 hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400" />
                    <div>
                      <p className="font-bold text-white text-sm">{candidate.name}</p>
                      <p className="text-xs text-stone-400">
                        {candidate.skills.join(', ')}
                      </p>
                    </div>
                  </div>
                  <motion.div className="text-right">
                    <div className="text-xl font-bold text-blue-400">{candidate.score}%</div>
                    <div className="text-xs text-stone-400">Match Score</div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
