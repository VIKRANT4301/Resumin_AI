import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { 
  BrainCircuit, 
  ChevronRight,
  Zap,
  LineChart,
  Network
} from "lucide-react";

export default function LandingPage({ onNavigate }) {
  const containerRef = useRef(null);
  
  // Smooth scroll configuration
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth out the scroll progress for parallax
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Parallax transforms
  const yHeroText = useTransform(smoothProgress, [0, 0.2], [0, -150]);
  const yHeroCards = useTransform(smoothProgress, [0, 0.2], [0, -300]);
  const opacityHero = useTransform(smoothProgress, [0, 0.15], [1, 0]);

  const yFeature1 = useTransform(smoothProgress, [0.1, 0.4], [100, -100]);
  const yFeature2 = useTransform(smoothProgress, [0.15, 0.45], [200, -50]);
  const yFeature3 = useTransform(smoothProgress, [0.2, 0.5], [300, -150]);

  const yDashboard = useTransform(smoothProgress, [0.3, 0.7], [200, -100]);
  const rotateXDashboard = useTransform(smoothProgress, [0.3, 0.6], [25, 5]);

  return (
    <div ref={containerRef} className="relative w-full bg-[#03060D] text-white font-sans selection:bg-[#8A2BE2]/30 overflow-x-hidden">
      
      {/* Global Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F1A] via-[#080B14] to-[#03060D]"></div>
        {/* Cinematic Glowing Orbs */}
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-[#5B8CFF]/10 to-transparent blur-[120px]"
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-tl from-[#8A2BE2]/10 to-transparent blur-[150px]"
        />
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-[#03060D]/40 backdrop-blur-xl border-b border-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="ResuMind AI Logo" className="w-10 h-10 object-contain rounded-xl" />
            <span className="font-black text-2xl tracking-tighter text-white">ResuMind<span className="text-[#5B8CFF]">AI</span></span>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => onNavigate("/signin")}
              className="text-sm font-bold text-stone-300 hover:text-white transition-colors"
            >
              Log In
            </button>
            <button 
              onClick={() => onNavigate("/signup")}
              className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
            >
              Start Free
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        
        {/* ==============================
            SECTION 1: HERO
            ============================== */}
        <section className="relative min-h-[120vh] flex flex-col items-center pt-[30vh] px-6">
          <motion.div style={{ y: yHeroText, opacity: opacityHero }} className="text-center z-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            >
              <span className="w-2 h-2 rounded-full bg-[#5B8CFF] animate-pulse"></span>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-stone-300">Next-Gen Hiring</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="text-7xl md:text-9xl font-black tracking-tighter text-white drop-shadow-2xl leading-[0.9]"
            >
              Hire the <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B8CFF] via-[#8A2BE2] to-[#FF5BEF]">Future</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="mt-8 text-xl text-stone-400 font-medium max-w-2xl mx-auto"
            >
              Smart AI-powered recruitment platform designed for modern teams.
            </motion.p>

            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              onClick={() => onNavigate("/signup")}
              className="mt-12 group relative px-10 py-5 rounded-full bg-white text-[#03060D] font-black text-lg overflow-hidden transition-all hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#5B8CFF] to-[#8A2BE2] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 group-hover:text-white transition-colors duration-500">Explore Platform</span>
            </motion.button>
          </motion.div>

          {/* Floating Candidate Cards (Absolute Layout) */}
          <motion.div style={{ y: yHeroCards, opacity: opacityHero }} className="absolute inset-0 pointer-events-none z-10">
            {/* Connecting SVG Lines */}
            <svg className="absolute inset-0 w-full h-full opacity-30">
              <path d="M 20% 60% Q 50% 40% 80% 50%" fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="10 10">
                <animate attributeName="stroke-dashoffset" values="20;0" dur="2s" repeatCount="indefinite" />
              </path>
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#5B8CFF" stopOpacity="0" />
                  <stop offset="50%" stopColor="#8A2BE2" stopOpacity="1" />
                  <stop offset="100%" stopColor="#FF5BEF" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            <motion.div 
              animate={{ y: [0, -20, 0], rotateZ: [0, 5, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[50%] left-[10%] w-64 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl p-4 shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
            >
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-[#5B8CFF]/20 border border-[#5B8CFF]/30"></div>
                <div>
                  <div className="h-3 w-20 bg-white/20 rounded-full mb-2"></div>
                  <div className="h-2 w-12 bg-white/10 rounded-full"></div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 30, 0], rotateZ: [0, -5, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-[40%] right-[12%] w-56 rounded-3xl border border-[#8A2BE2]/30 bg-[#8A2BE2]/10 backdrop-blur-2xl p-4 shadow-[0_0_50px_rgba(138,43,226,0.2)]"
            >
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-[#FF5BEF]/20 border border-[#FF5BEF]/30"></div>
                <div>
                  <div className="h-3 w-16 bg-white/30 rounded-full mb-2"></div>
                  <div className="h-2 w-24 bg-white/20 rounded-full"></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ==============================
            SECTION 2: AI FLOW VISUAL
            ============================== */}
        <section className="relative min-h-screen flex items-center justify-center px-6 py-32">
          <div className="max-w-6xl w-full">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-100px", once: true }}
              className="text-center mb-32"
            >
              <h2 className="text-4xl md:text-6xl font-black text-white">The Neural Hiring Pipeline</h2>
              <p className="mt-4 text-xl text-stone-400">Watch intelligence route talent directly to your desk.</p>
            </motion.div>

            {/* Glowing Pipeline Visualization */}
            <div className="relative w-full h-[400px] flex items-center justify-between">
              {/* Connecting Path */}
              <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-transparent via-[#5B8CFF] to-[#8A2BE2] w-1/2"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </div>

              {/* Nodes */}
              {[
                { title: "Resume Upload", icon: null, color: "border-white/20" },
                { title: "Semantic Parsing", icon: Network, color: "border-[#5B8CFF]/50 shadow-[0_0_30px_rgba(91,140,255,0.3)] bg-[#5B8CFF]/10 text-[#5B8CFF]" },
                { title: "AI Shortlist", icon: BrainCircuit, color: "border-[#8A2BE2]/50 shadow-[0_0_40px_rgba(138,43,226,0.4)] bg-[#8A2BE2]/10 text-[#8A2BE2]" },
                { title: "Hired", icon: null, color: "border-emerald-400/50 shadow-[0_0_30px_rgba(52,211,153,0.3)] bg-emerald-400/10 text-emerald-400" }
              ].map((node, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ type: "spring", delay: i * 0.2 }}
                    viewport={{ once: true }}
                    className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl border bg-[#03060D]/80 backdrop-blur-xl flex items-center justify-center ${node.color}`}
                  >
                    {node.icon ? <node.icon size={32} /> : <div className="w-4 h-4 rounded-full bg-white/50" />}
                  </motion.div>
                  <div className="absolute top-[120%] text-sm font-bold tracking-widest uppercase text-stone-300 text-center w-32">
                    {node.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==============================
            SECTION 3: SCATTERED FLOATING FEATURES
            ============================== */}
        <section className="relative min-h-[150vh] px-6 py-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center z-10 w-full">
            <h2 className="text-5xl md:text-7xl font-black text-white/5 uppercase tracking-[0.3em]">Features</h2>
          </div>

          <div className="relative max-w-6xl mx-auto h-full min-h-[800px]">
            {/* Feature 1 */}
            <motion.div style={{ y: yFeature1 }} className="absolute top-20 left-0 w-full max-w-[400px]">
              <div className="group rounded-[2.5rem] border border-white/10 bg-white/[0.01] backdrop-blur-3xl p-10 transition-all duration-500 hover:border-[#5B8CFF]/50 hover:bg-[#5B8CFF]/5 hover:shadow-[0_20px_80px_rgba(91,140,255,0.2)]">
                <div className="w-16 h-16 rounded-2xl bg-[#5B8CFF]/20 border border-[#5B8CFF]/30 flex items-center justify-center mb-8 text-[#5B8CFF] group-hover:scale-110 transition-transform">
                  <BrainCircuit size={28} />
                </div>
                <h3 className="text-3xl font-black text-white mb-4">Smart Matching</h3>
                <p className="text-stone-400 text-lg">AI evaluates semantic skills, not just keywords, delivering a pre-ranked list of top talent directly to you.</p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div style={{ y: yFeature2 }} className="absolute top-[400px] right-0 w-full max-w-[400px] z-20">
              <div className="group rounded-[2.5rem] border border-white/10 bg-white/[0.01] backdrop-blur-3xl p-10 transition-all duration-500 hover:border-[#8A2BE2]/50 hover:bg-[#8A2BE2]/5 hover:shadow-[0_20px_80px_rgba(138,43,226,0.2)]">
                <div className="w-16 h-16 rounded-2xl bg-[#8A2BE2]/20 border border-[#8A2BE2]/30 flex items-center justify-center mb-8 text-[#8A2BE2] group-hover:scale-110 transition-transform">
                  <Zap size={28} />
                </div>
                <h3 className="text-3xl font-black text-white mb-4">Fast Hiring</h3>
                <p className="text-stone-400 text-lg">Streamline your entire workflow. One click to parse, one click to shortlist. Weeks of work reduced to minutes.</p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div style={{ y: yFeature3 }} className="absolute top-[700px] left-[20%] w-full max-w-[450px]">
              <div className="group rounded-[2.5rem] border border-white/10 bg-white/[0.01] backdrop-blur-3xl p-10 transition-all duration-500 hover:border-emerald-400/50 hover:bg-emerald-400/5 hover:shadow-[0_20px_80px_rgba(52,211,153,0.15)]">
                <div className="w-16 h-16 rounded-2xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center mb-8 text-emerald-400 group-hover:scale-110 transition-transform">
                  <LineChart size={28} />
                </div>
                <h3 className="text-3xl font-black text-white mb-4">Real-time Analytics</h3>
                <p className="text-stone-400 text-lg">Deep insights into candidate gaps and reliability scores. Make offers with mathematical confidence.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ==============================
            SECTION 4: DASHBOARD PREVIEW
            ============================== */}
        <section className="relative min-h-[150vh] py-32 px-6 flex justify-center items-center overflow-visible">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#8A2BE2]/5 to-transparent pointer-events-none"></div>
          
          <motion.div 
            style={{ y: yDashboard, rotateX: rotateXDashboard }}
            className="w-full max-w-6xl rounded-[3rem] border border-white/10 bg-[#0A0D18]/80 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.8),0_0_100px_rgba(91,140,255,0.2)] p-4 md:p-8 perspective-[2000px] transform-style-3d"
          >
            {/* Inner Dashboard Mockup */}
            <div className="w-full h-full rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 overflow-hidden relative">
              <div className="flex gap-4 mb-12">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {[
                  { label: "Applicants", color: "from-white/10" },
                  { label: "Shortlisted", color: "from-[#5B8CFF]/20" },
                  { label: "Hired", color: "from-emerald-400/20" }
                ].map((c, i) => (
                  <div key={i} className={`h-32 rounded-3xl bg-gradient-to-br ${c.color} to-transparent border border-white/5 p-6`}>
                    <div className="h-4 w-24 bg-white/20 rounded-full mb-4"></div>
                    <div className="h-8 w-16 bg-white/40 rounded-full"></div>
                  </div>
                ))}
              </div>

              {/* Animated Graph Line */}
              <div className="h-64 rounded-3xl bg-white/[0.02] border border-white/5 p-6 relative overflow-hidden">
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    viewport={{ once: true }}
                    d="M 0 200 Q 200 150 400 180 T 800 50 T 1200 100" 
                    fill="none" 
                    stroke="url(#graphGrad)" 
                    strokeWidth="4" 
                  />
                  <defs>
                    <linearGradient id="graphGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#5B8CFF" />
                      <stop offset="100%" stopColor="#8A2BE2" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ==============================
            SECTION 5: INTERACTIVE JOURNEY & CTA
            ============================== */}
        <section className="relative min-h-screen py-32 px-6 flex flex-col justify-center items-center">
          
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
             {/* Constellation Dots */}
             <svg width="100%" height="100%" className="absolute inset-0">
               <motion.path 
                 initial={{ pathLength: 0 }}
                 whileInView={{ pathLength: 1 }}
                 transition={{ duration: 3 }}
                 viewport={{ once: true }}
                 d="M 10% 80% L 30% 20% L 50% 60% L 70% 30% L 90% 70%" 
                 fill="none" 
                 stroke="#fff" 
                 strokeWidth="1"
                 strokeDasharray="5 5"
               />
               <circle cx="10%" cy="80%" r="3" fill="#fff" />
               <circle cx="30%" cy="20%" r="3" fill="#fff" />
               <circle cx="50%" cy="60%" r="3" fill="#fff" />
               <circle cx="70%" cy="30%" r="3" fill="#fff" />
               <circle cx="90%" cy="70%" r="3" fill="#fff" />
             </svg>
          </div>

          <div className="text-center z-10 mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-stone-400 tracking-widest uppercase mb-4">
              Connecting Talent
            </h2>
            <h3 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#5B8CFF] to-[#8A2BE2]">
              To Opportunity
            </h3>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="z-10"
          >
            <button 
              onClick={() => onNavigate("/signup")}
              className="relative group p-[2px] rounded-full overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#5B8CFF] via-[#FF5BEF] to-[#8A2BE2] animate-pulse"></span>
              <div className="relative bg-[#03060D] rounded-full px-16 py-8 transition-all group-hover:bg-opacity-0">
                <span className="text-4xl font-black text-white group-hover:text-white transition-colors flex items-center gap-4">
                  Start Hiring Now <ChevronRight size={40} className="group-hover:translate-x-2 transition-transform" />
                </span>
              </div>
            </button>
          </motion.div>
        </section>

      </main>
    </div>
  );
}
