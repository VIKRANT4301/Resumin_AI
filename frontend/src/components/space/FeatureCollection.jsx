import { motion } from 'framer-motion';
import {
  Zap,
  Brain,
  Shield,
  LineChart,
  Users,
  Lock,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered Matching',
    description:
      'Our neural network understands semantic skills, not just keywords. Get truly relevant matches.',
    color: 'from-blue-500/20 to-transparent',
    gradient: 'text-blue-400',
    accentLine: 'bg-gradient-to-r from-blue-400 to-transparent',
  },
  {
    icon: Zap,
    title: 'Lightning Speed',
    description:
      'Process hundreds of resumes in seconds. What takes recruiters weeks, our AI does in minutes.',
    color: 'from-pink-500/20 to-transparent',
    gradient: 'text-pink-400',
    accentLine: 'bg-gradient-to-r from-pink-400 to-transparent',
  },
  {
    icon: LineChart,
    title: 'Deep Analytics',
    description:
      'Understand candidate distributions, skill clusters, and hiring trends with interactive dashboards.',
    color: 'from-emerald-500/20 to-transparent',
    gradient: 'text-emerald-400',
    accentLine: 'bg-gradient-to-r from-emerald-400 to-transparent',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'Bank-grade encryption, GDPR compliant, and fully audit-logged for complete peace of mind.',
    color: 'from-purple-500/20 to-transparent',
    gradient: 'text-purple-400',
    accentLine: 'bg-gradient-to-r from-purple-400 to-transparent',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Share results, leave notes, and coordinate with your team in real-time from one dashboard.',
    color: 'from-cyan-500/20 to-transparent',
    gradient: 'text-cyan-400',
    accentLine: 'bg-gradient-to-r from-cyan-400 to-transparent',
  },
  {
    icon: Lock,
    title: 'Fair & Unbiased',
    description:
      'Our algorithm removes demographic data to ensure fair evaluation based purely on qualifications.',
    color: 'from-yellow-500/20 to-transparent',
    gradient: 'text-yellow-400',
    accentLine: 'bg-gradient-to-r from-yellow-400 to-transparent',
  },
];

export default function FeatureCollection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 10 },
    },
  };

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-[-20%] w-96 h-96 rounded-full bg-purple-500/5 blur-[120px]" />
        <div className="absolute -bottom-20 left-[-10%] w-96 h-96 rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6">
            Superpowers for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Talent Teams</span>
          </h2>
          <p className="text-xl text-stone-400 max-w-2xl mx-auto">
            Everything you need to revolutionize your hiring process with AI-driven shortcuts
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-3xl p-8 transition-all duration-500 hover:border-white/30 hover:shadow-[0_20px_60px_rgba(255,255,255,0.1)]"
            >
              {/* Card gradient background */}
              <div
                className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10`}
              />

              {/* Icon */}
              <div className="mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:border-white/40 transition-all duration-500 ${feature.gradient}`}>
                  <feature.icon size={28} />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-stone-400 leading-relaxed">{feature.description}</p>

              {/* Accent line */}
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: 40 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`mt-6 h-1 ${feature.accentLine} rounded-full`}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
