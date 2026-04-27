import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

export default function CentralSphere({ onClick, isActive }) {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Outer glow rings */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-72 h-72 rounded-full border-2 border-[#5B8CFF]/30 shadow-[0_0_60px_rgba(91,140,255,0.2)]"
      />

      <motion.div
        animate={{
          scale: [1.1, 1.2, 1.1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-96 h-96 rounded-full border-2 border-[#8A2BE2]/20 shadow-[0_0_80px_rgba(138,43,226,0.15)]"
      />

      <motion.div
        animate={{
          scale: [1.2, 1.35, 1.2],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[28rem] h-[28rem] rounded-full border border-[#FF5BEF]/10 shadow-[0_0_100px_rgba(255,91,239,0.1)]"
      />

      {/* Main sphere */}
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`relative w-64 h-64 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 group ${
          isActive
            ? 'bg-gradient-to-br from-[#5B8CFF] to-[#8A2BE2] shadow-[0_0_80px_rgba(91,140,255,0.6),0_0_120px_rgba(138,43,226,0.4)]'
            : 'bg-gradient-to-br from-[#5B8CFF]/80 to-[#8A2BE2]/80 shadow-[0_0_60px_rgba(91,140,255,0.4),0_0_100px_rgba(138,43,226,0.2)] hover:shadow-[0_0_80px_rgba(91,140,255,0.6),0_0_120px_rgba(138,43,226,0.4)]'
        }`}
      >
        {/* Inner glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tl from-white/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="text-white"
          >
            <BrainCircuit size={48} strokeWidth={1.5} />
          </motion.div>

          <div className="text-center">
            <p className="text-xs font-bold text-white/80 uppercase tracking-[0.2em]">AI Resume Engine</p>
            <h2 className="text-2xl font-black text-white mt-1 leading-none">Smart<br />Shortlist</h2>
          </div>
        </div>
      </motion.button>

      {/* Floating particles around sphere */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            x: Math.cos((i * Math.PI * 2) / 8) * 300,
            y: Math.sin((i * Math.PI * 2) / 8) * 300,
          }}
          transition={{
            duration: 15 + i,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute w-2 h-2 rounded-full bg-[#5B8CFF]/60 shadow-[0_0_10px_rgba(91,140,255,0.8)]"
        />
      ))}
    </div>
  );
}
