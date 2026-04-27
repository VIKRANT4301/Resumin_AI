import { motion } from 'framer-motion';

const colorStyles = {
  '91, 140, 255': 'bg-blue-500/10 border-blue-400/30 hover:border-blue-400/60 hover:shadow-[0_0_30px_rgba(91,140,255,0.4)] text-blue-400',
  '138, 43, 226': 'bg-purple-500/10 border-purple-400/30 hover:border-purple-400/60 hover:shadow-[0_0_30px_rgba(138,43,226,0.4)] text-purple-400',
  '255, 91, 239': 'bg-pink-500/10 border-pink-400/30 hover:border-pink-400/60 hover:shadow-[0_0_30px_rgba(255,91,239,0.4)] text-pink-400',
  '0, 217, 255': 'bg-cyan-500/10 border-cyan-400/30 hover:border-cyan-400/60 hover:shadow-[0_0_30px_rgba(0,217,255,0.4)] text-cyan-400',
  '0, 255, 136': 'bg-emerald-500/10 border-emerald-400/30 hover:border-emerald-400/60 hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] text-emerald-400',
};

const hoverStyles = {
  '91, 140, 255': 'bg-blue-500/30 border-blue-400/80 shadow-[0_0_40px_rgba(91,140,255,0.6)]',
  '138, 43, 226': 'bg-purple-500/30 border-purple-400/80 shadow-[0_0_40px_rgba(138,43,226,0.6)]',
  '255, 91, 239': 'bg-pink-500/30 border-pink-400/80 shadow-[0_0_40px_rgba(255,91,239,0.6)]',
  '0, 217, 255': 'bg-cyan-500/30 border-cyan-400/80 shadow-[0_0_40px_rgba(0,217,255,0.6)]',
  '0, 255, 136': 'bg-emerald-500/30 border-emerald-400/80 shadow-[0_0_40px_rgba(0,255,136,0.6)]',
};

export default function OrbitingNode({ 
  icon: Icon, 
  label, 
  description, 
  color, 
  colorGlow,
  angle,
  radius,
  delay,
  onHover,
  isHovered
}) {
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  const baseStyle = colorStyles[colorGlow] || colorStyles['91, 140, 255'];
  const hoveredStyle = hoverStyles[colorGlow] || hoverStyles['91, 140, 255'];

  return (
    <motion.div
      animate={{
        x,
        y,
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'linear',
      }}
      className="absolute w-24 h-24 flex items-center justify-center"
    >
      <motion.button
        onHoverStart={() => onHover(label)}
        onHoverEnd={() => onHover(null)}
        whileHover={{
          scale: 1.2,
        }}
        whileTap={{
          scale: 0.95,
        }}
        className={`relative w-full h-full rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group backdrop-blur-xl border  ${
          isHovered ? hoveredStyle : baseStyle
        }`}
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg -z-10"
          style={{
            background: `radial-gradient(circle, rgba(${colorGlow}, 0.4) 0%, transparent 70%)`,
          }}
        />

        {/* Icon */}
        <div className="mb-1 group-hover:scale-110 transition-transform">
          <Icon size={20} strokeWidth={1.5} />
        </div>

        {/* Label */}
        <p className="text-xs font-bold text-white/70 text-center leading-tight px-1 group-hover:text-white transition-colors">
          {label.split(' ').slice(0, 1).join(' ')}
        </p>
      </motion.button>

      {/* Connection line to center */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          filter: 'drop-shadow(0 0 10px rgba(91, 140, 255, 0.5))',
        }}
      >
        <line
          x1="50%"
          y1="50%"
          x2="50%"
          y2="0"
          stroke={`rgba(${colorGlow}, 1)`}
          strokeWidth="1"
          strokeDasharray="5,5"
          className="animate-pulse"
        />
      </svg>
    </motion.div>
  );
}
