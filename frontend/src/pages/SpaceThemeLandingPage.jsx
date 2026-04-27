import { Suspense, lazy, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';
import ParticleBackground from '../components/space/ParticleBackground';
import OrbitingLayer from '../components/space/OrbitingLayer';
import FeatureCollection from '../components/space/FeatureCollection';
import HowItWorks from '../components/space/HowItWorks';
import DashboardPreview from '../components/space/DashboardPreview';
import NeonFooter from '../components/space/NeonFooter';

const LazySection = lazy(() => Promise.resolve({ default: () => null }));

export default function SpaceThemeLandingPage({ onNavigate }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 1, 0]);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#03060D] text-white font-sans selection:bg-purple-500/30 overflow-x-hidden"
    >
      {/* Animated particle background */}
      <ParticleBackground />

      {/* Global Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F1A] via-[#080B14] to-[#03060D]" />
        
        {/* Large atmospheric orbs (static for performance) */}
        <div
          className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-blue-500/10 to-transparent blur-[120px]"
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-tl from-purple-500/10 to-transparent blur-[150px]"
        />
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-[#03060D]/40 backdrop-blur-xl border-b border-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => onNavigate?.('/')}
          >
            <img src="/logo.jpeg" alt="ResuMind AI Logo" className="w-10 h-10 object-contain rounded-xl" />
            <span className="font-black text-2xl tracking-tighter text-white">
              ResuMind<span className="text-blue-400">AI</span>
            </span>
          </motion.div>

          <div className="flex items-center gap-6">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              onClick={() => onNavigate?.('/signin')}
              className="text-sm font-bold text-stone-300 hover:text-blue-400 transition-colors"
            >
              Log In
            </motion.button>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => onNavigate?.('/signup')}
              className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 hover:shadow-[0_0_20px_rgba(91,140,255,0.3)] hover:border-blue-400/50 transition-all"
            >
              Start Free
            </motion.button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* ========================================
            SECTION 1: HERO - ORBITING INTERFACE
            ======================================== */}
        <motion.section style={{ opacity }} className="relative min-h-screen flex flex-col items-center justify-center pt-24">
          <OrbitingLayer onNodeClick={() => {}} onNavigate={onNavigate} />
        </motion.section>

        {/* ========================================
            SECTION 2: FEATURES
            ======================================== */}
        <Suspense fallback={<div className="h-96" />}>
          <FeatureCollection />
        </Suspense>

        {/* ========================================
            SECTION 3: HOW IT WORKS
            ======================================== */}
        <Suspense fallback={<div className="h-96" />}>
          <HowItWorks />
        </Suspense>

        {/* ========================================
            SECTION 4: DASHBOARD PREVIEW
            ======================================== */}
        <Suspense fallback={<div className="h-96" />}>
          <DashboardPreview />
        </Suspense>

        {/* ========================================
            SECTION 5: CTA BANNER
            ======================================== */}
        <section className="relative py-24 px-6 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-[100px]" />
          </div>

          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="space-y-8"
            >
              <h2 className="text-5xl md:text-6xl font-black text-white leading-tight">
                Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">Transform</span> Your Hiring?
              </h2>

              <p className="text-xl text-stone-400 max-w-2xl mx-auto">
                Join hundreds of companies using AI-powered resume shortlisting to hire 10x faster and smarter.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate?.('/signup')}
                  className="px-10 py-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold text-lg shadow-[0_0_40px_rgba(91,140,255,0.5)] hover:shadow-[0_0_60px_rgba(91,140,255,0.7)] transition-all"
                >
                  Get Started Free
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 rounded-full border-2 border-white/20 text-white font-bold text-lg hover:border-[#5B8CFF]/50 hover:bg-white/5 transition-all"
                >
                  Watch Demo
                </motion.button>
              </div>

              <p className="text-sm text-stone-500 pt-4">
                No credit card required. 14-day free trial. Cancel anytime.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ========================================
            FOOTER
            ======================================== */}
        <NeonFooter />
      </main>
    </div>
  );
}
