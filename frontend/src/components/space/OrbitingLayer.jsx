import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Brain,
  Users,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';
import CentralSphere from './CentralSphere';
import OrbitingNode from './OrbitingNode';

const NODES = [
  {
    id: 'resume',
    icon: FileText,
    label: 'Resume Upload',
    description: 'Upload and parse resumes',
    color: '[#5B8CFF]',
    colorGlow: '91, 140, 255',
  },
  {
    id: 'analyzer',
    icon: Brain,
    label: 'Job Description',
    description: 'Analyze job requirements',
    color: '[#8A2BE2]',
    colorGlow: '138, 43, 226',
  },
  {
    id: 'pool',
    icon: Users,
    label: 'Candidate Pool',
    description: 'Browse all candidates',
    color: '[#FF5BEF]',
    colorGlow: '255, 91, 239',
  },
  {
    id: 'shortlist',
    icon: CheckCircle2,
    label: 'Shortlisted',
    description: 'View AI recommendations',
    color: '[#00D9FF]',
    colorGlow: '0, 217, 255',
  },
  {
    id: 'analytics',
    icon: BarChart3,
    label: 'Analytics',
    description: 'View insights and metrics',
    color: '[#00FF88]',
    colorGlow: '0, 255, 136',
  },
];

export default function OrbitingLayer({ onNodeClick, onNavigate }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const handleNodeClick = (nodeId) => {
    setSelectedNode(nodeId);
    const node = NODES.find((n) => n.id === nodeId);
    if (nodeId === 'resume') {
      onNavigate?.('/upload');
    } else if (nodeId === 'analyzer') {
      onNavigate?.('/job-description');
    } else if (nodeId === 'pool') {
      onNavigate?.('/candidates');
    } else if (nodeId === 'shortlist') {
      onNavigate?.('/results');
    } else if (nodeId === 'analytics') {
      onNavigate?.('/analytics');
    }
  };

  const radius = 280;

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern
              id="grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="#5B8CFF"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Orbital paths */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[560px] h-[560px] border border-[#5B8CFF]/10 rounded-full"
        />

        <motion.div
          animate={{ rotate: -180 }}
          transition={{ duration: 150, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[700px] h-[700px] border border-[#8A2BE2]/5 rounded-full"
        />

        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{ duration: 180, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[900px] h-[900px] border border-[#FF5BEF]/5 rounded-full"
        />
      </div>

      {/* Central Sphere */}
      <div className="relative z-20">
        <CentralSphere onClick={() => onNavigate?.('/')} isActive={!selectedNode} />
      </div>

      {/* Orbiting Nodes */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-full h-full flex items-center justify-center pointer-events-auto">
          {NODES.map((node, index) => {
            const angle = (index * 2 * Math.PI) / NODES.length;
            return (
              <OrbitingNode
                key={node.id}
                icon={node.icon}
                label={node.label}
                description={node.description}
                color={node.color}
                colorGlow={node.colorGlow}
                angle={angle}
                radius={radius}
                delay={index * 0.2}
                onHover={setHoveredNode}
                isHovered={hoveredNode === node.label}
                onClick={() => handleNodeClick(node.id)}
              />
            );
          })}
        </div>
      </div>

      {/* Info Panel */}
      {hoveredNode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30"
        >
          <div className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <p className="text-sm font-bold text-white/80 uppercase tracking-[0.1em]">
              {hoveredNode}
            </p>
            <p className="text-xs text-white/60 mt-1">
              Click to explore this feature
            </p>
          </div>
        </motion.div>
      )}

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 text-center"
      >
        <p className="text-sm text-white/60 mb-4">
          Explore the orbital interface or
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate?.('/signup')}
          className="px-8 py-3 rounded-full bg-gradient-to-r from-[#5B8CFF] to-[#8A2BE2] text-white font-bold text-sm shadow-[0_0_30px_rgba(91,140,255,0.4)] hover:shadow-[0_0_50px_rgba(91,140,255,0.6)] transition-all"
        >
          Start Free Trial
        </motion.button>
      </motion.div>
    </div>
  );
}
