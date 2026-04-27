import { motion } from 'framer-motion';
import { Upload, Zap, CheckCircle } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: Upload,
    title: 'Upload Resumes',
    description:
      'Drag and drop or upload resumes in PDF or DOCX format. Our system automatically parses and extracts key information.',
    color: 'text-blue-400',
    bgColor: 'from-blue-500/20',
    iconBg: 'bg-blue-500/20 border-blue-400/30',
  },
  {
    number: '02',
    icon: Zap,
    title: 'AI Analysis',
    description:
      'Our neural network analyzes skills, experience, and fit against your job requirements in real-time.',
    color: 'text-purple-400',
    bgColor: 'from-purple-500/20',
    iconBg: 'bg-purple-500/20 border-purple-400/30',
  },
  {
    number: '03',
    icon: CheckCircle,
    title: 'Get Insights',
    description:
      'Receive ranked shortlists, candidate profiles, and detailed analytics to make confident hiring decisions.',
    color: 'text-emerald-400',
    bgColor: 'from-emerald-500/20',
    iconBg: 'bg-emerald-500/20 border-emerald-400/30',
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-transparent blur-[100px]"
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-24"
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">Works</span>
          </h2>
          <p className="text-lg text-stone-400 max-w-2xl mx-auto">
            Three simple steps to transform your hiring process
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-32 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent -z-10 hidden md:block" />

          <div className="grid md:grid-cols-3 gap-8 relative z-20">
            {STEPS.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                {/* Step card */}
                <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-3xl p-8 h-full group hover:border-white/30 hover:shadow-[0_20px_60px_rgba(255,255,255,0.08)] transition-all duration-500">
                  {/* Number badge */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`absolute -top-8 -left-8 w-20 h-20 rounded-full bg-gradient-to-br ${step.bgColor} to-transparent border border-white/20 flex items-center justify-center shadow-[0_10px_40px_rgba(255,255,255,0.1)]`}
                  >
                    <span className={`text-2xl font-black ${step.color}`}>
                      {step.number}
                    </span>
                  </motion.div>

                  {/* Icon */}
                  <div className="mb-8 mt-4">
                    <div className={`w-14 h-14 rounded-2xl ${step.iconBg} flex items-center justify-center ${step.color} group-hover:scale-110 transition-transform`}>
                      <step.icon size={24} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-stone-400 leading-relaxed">{step.description}</p>

                  {/* Arrow indicator */}
                  {index < STEPS.length - 1 && (
                    <motion.div
                      animate={{ x: [0, 8, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -right-10 top-1/2 -translate-y-1/2 text-blue-400/50 hidden md:block"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 rounded-full bg-gradient-to-r from-[#5B8CFF] to-[#8A2BE2] text-white font-bold text-lg shadow-[0_0_40px_rgba(91,140,255,0.5)] hover:shadow-[0_0_60px_rgba(91,140,255,0.7)] transition-all"
          >
            Try Now for Free
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
