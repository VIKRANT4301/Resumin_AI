import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// ── Data stream particle positions around the figure ─────────────
const DATA_PARTICLES = [
  { cx: 180, cy: 120, r: 3,   dur: "3.2s", del: "0s"   },
  { cx: 250, cy:  90, r: 2,   dur: "4.1s", del: "0.5s"  },
  { cx: 300, cy: 130, r: 2.5, dur: "3.5s", del: "1s"    },
  { cx: 320, cy: 200, r: 2,   dur: "4.8s", del: "0.3s"  },
  { cx: 290, cy: 270, r: 3,   dur: "3.9s", del: "0.8s"  },
  { cx: 160, cy: 250, r: 2,   dur: "4.3s", del: "1.2s"  },
  { cx: 120, cy: 180, r: 2.5, dur: "3.7s", del: "0.6s"  },
  { cx: 220, cy: 350, r: 2,   dur: "4.6s", del: "1.5s"  },
  { cx: 310, cy: 340, r: 3,   dur: "3.3s", del: "0.2s"  },
  { cx: 340, cy: 160, r: 1.5, dur: "5.0s", del: "1.8s"  },
  { cx: 140, cy: 310, r: 2,   dur: "4.0s", del: "0.9s"  },
  { cx: 370, cy: 240, r: 2.5, dur: "3.6s", del: "1.1s"  },
];

// ── Neural network node connections from the figure's hands ──────
const NEURAL_NODES = [
  // Right hand cluster
  { x: 360, y: 310, r: 6,  glow: "#5B8CFF", label: "Skills" },
  { x: 410, y: 280, r: 4,  glow: "#8A2BE2", label: "Exp." },
  { x: 420, y: 340, r: 5,  glow: "#00D4FF", label: "AI" },
  { x: 450, y: 310, r: 3,  glow: "#5B8CFF", label: "" },
  { x: 460, y: 260, r: 3.5,glow: "#8A2BE2", label: "" },
  // Left hand cluster
  { x:  90, y: 310, r: 6,  glow: "#4cc890", label: "Rank" },
  { x:  40, y: 280, r: 4,  glow: "#f5bd4e", label: "Score" },
  { x:  35, y: 340, r: 5,  glow: "#00D4FF", label: "Fit" },
  { x:  10, y: 310, r: 3,  glow: "#4cc890", label: "" },
  { x:  15, y: 260, r: 3.5,glow: "#f5bd4e", label: "" },
];

// Edges for the neural network
const NEURAL_EDGES = [
  [0,1],[0,2],[1,3],[2,3],[3,4], // Right
  [5,6],[5,7],[6,8],[7,8],[8,9], // Left
];

// ── Data text fragments flowing down the figure ──────────────────
const DATA_LINES = [
  "skill: React, Node.js",
  "exp: 4 yrs @Startup",
  "score: 87%",
  "gap: System Design",
  "rank: #2 / 45",
  "inferred: TypeScript",
];

export default function HolographicFigure() {
  const pathRef = useRef(null);

  // Stagger draw-on animation via CSS
  useEffect(() => {
    if (!pathRef.current) return;
    const paths = pathRef.current.querySelectorAll(".draw-on");
    paths.forEach((p, i) => {
      const len = p.getTotalLength?.() || 200;
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
      p.style.transition = `stroke-dashoffset 1.6s ease-out ${0.1 + i * 0.12}s`;
      requestAnimationFrame(() => { p.style.strokeDashoffset = 0; });
    });
  }, []);

  return (
    <motion.div
      animate={{ y: [0, -16, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="relative flex items-center justify-center w-full h-full"
    >
      {/* Outer glow aura */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(91,140,255,0.12) 0%, rgba(138,43,226,0.08) 40%, transparent 70%)",
          animation: "hologram-pulse 4s ease-in-out infinite",
        }}
      />

      <svg
        ref={pathRef}
        viewBox="0 0 480 520"
        width="100%"
        height="100%"
        className="max-w-[420px] max-h-[480px]"
        aria-hidden="true"
      >
        <defs>
          {/* Main figure gradient */}
          <linearGradient id="fig-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#5B8CFF" stopOpacity="0.9" />
            <stop offset="50%"  stopColor="#8A2BE2" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#5B8CFF" stopOpacity="0.4" />
          </linearGradient>

          {/* Grid pattern overlay */}
          <pattern id="fig-grid" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
            <path d="M 18 0 L 0 0 0 18" fill="none" stroke="rgba(91,140,255,0.15)" strokeWidth="0.5" />
          </pattern>

          {/* Neural node glow */}
          <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Data stream glow */}
          <filter id="stream-glow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Clip path for figure body */}
          <clipPath id="body-clip">
            <path d="
              M 220 20 C 248 20 268 38 268 62 C 268 86 248 106 220 106
              C 192 106 172 86 172 62 C 172 38 192 20 220 20 Z
              M 155 120 L 285 120 L 310 260 L 280 260 L 270 200 L 270 380 L 250 380 L 250 280 L 220 280 L 220 380 L 200 380 L 200 200 L 170 260 L 140 260 Z
              M 140 265 L 100 310 L 120 322 L 155 275 Z
              M 310 265 L 340 310 L 320 322 L 285 275 Z
            " />
          </clipPath>
        </defs>

        {/* ── Background circuit traces ── */}
        <g stroke="rgba(91,140,255,0.08)" strokeWidth="0.8" fill="none">
          <line x1="0" y1="100" x2="480" y2="100" />
          <line x1="0" y1="200" x2="480" y2="200" />
          <line x1="0" y1="300" x2="480" y2="300" />
          <line x1="0" y1="400" x2="480" y2="400" />
          <line x1="120" y1="0" x2="120" y2="520" />
          <line x1="240" y1="0" x2="240" y2="520" />
          <line x1="360" y1="0" x2="360" y2="520" />
        </g>

        {/* ── HEAD ── */}
        {/* Head circle outline */}
        <circle className="draw-on" cx="220" cy="62" r="46"
          fill="url(#fig-grid)" stroke="url(#fig-grad)" strokeWidth="1.8" />
        {/* Inner face grid */}
        <ellipse cx="220" cy="62" rx="32" ry="20"
          fill="none" stroke="rgba(91,140,255,0.3)" strokeWidth="0.8" />
        <ellipse cx="220" cy="62" rx="20" ry="32"
          fill="none" stroke="rgba(91,140,255,0.3)" strokeWidth="0.8" />
        {/* Eyes */}
        <circle cx="205" cy="56" r="4" fill="rgba(91,140,255,0.15)" stroke="#5B8CFF" strokeWidth="1.5">
          <animate attributeName="fill-opacity" values="0.15;0.6;0.15" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="235" cy="56" r="4" fill="rgba(91,140,255,0.15)" stroke="#5B8CFF" strokeWidth="1.5">
          <animate attributeName="fill-opacity" values="0.15;0.6;0.15" dur="3s" begin="0.5s" repeatCount="indefinite" />
        </circle>
        {/* Scanning line on face */}
        <line x1="174" y1="62" x2="266" y2="62"
          stroke="#5B8CFF" strokeWidth="1" strokeOpacity="0.5">
          <animate attributeName="y1" values="30;95;30" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="y2" values="30;95;30" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0;0.8;0" dur="2.5s" repeatCount="indefinite" />
        </line>

        {/* ── NECK ── */}
        <rect className="draw-on" x="208" y="108" width="24" height="14"
          fill="url(#fig-grid)" stroke="url(#fig-grad)" strokeWidth="1.5" />

        {/* ── TORSO ── */}
        <path className="draw-on"
          d="M 158 122 L 282 122 L 295 260 L 265 260 L 258 195 L 258 380 L 238 380 L 238 285 L 220 285 L 220 380 L 200 380 L 200 195 L 175 260 L 145 260 Z"
          fill="url(#fig-grid)" stroke="url(#fig-grad)" strokeWidth="1.8"
        />

        {/* Torso grid lines */}
        {[145, 165, 185, 205, 225, 245].map((y) => (
          <line key={y} x1="165" y1={y} x2="275" y2={y}
            stroke="rgba(91,140,255,0.12)" strokeWidth="0.6" />
        ))}
        {[175, 195, 215, 240, 258].map((x) => (
          <line key={x} x1={x} y1="122" x2={x} y2="260"
            stroke="rgba(91,140,255,0.12)" strokeWidth="0.6" />
        ))}

        {/* ── CHEST CORE (AI node) ── */}
        <circle cx="220" cy="185" r="22"
          fill="rgba(91,140,255,0.05)" stroke="rgba(91,140,255,0.6)" strokeWidth="1.5">
          <animate attributeName="r" values="22;26;22" dur="3s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="220" cy="185" r="12"
          fill="rgba(91,140,255,0.15)" stroke="#8A2BE2" strokeWidth="1">
          <animate attributeName="r" values="12;14;12" dur="3s" begin="0.3s" repeatCount="indefinite" />
        </circle>
        <circle cx="220" cy="185" r="4" fill="#5B8CFF">
          <animate attributeName="fill-opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
        </circle>

        {/* ── LEFT ARM ── */}
        <path className="draw-on"
          d="M 158 130 L 110 235 L 88 315 L 108 318 L 126 248 L 168 148 Z"
          fill="url(#fig-grid)" stroke="url(#fig-grad)" strokeWidth="1.5"
        />
        {/* LEFT HAND */}
        <ellipse className="draw-on" cx="95" cy="318" rx="14" ry="8"
          fill="rgba(91,140,255,0.08)" stroke="url(#fig-grad)" strokeWidth="1.4" />

        {/* ── RIGHT ARM ── */}
        <path className="draw-on"
          d="M 282 130 L 330 235 L 352 315 L 332 318 L 314 248 L 272 148 Z"
          fill="url(#fig-grid)" stroke="url(#fig-grad)" strokeWidth="1.5"
        />
        {/* RIGHT HAND */}
        <ellipse className="draw-on" cx="345" cy="318" rx="14" ry="8"
          fill="rgba(91,140,255,0.08)" stroke="url(#fig-grad)" strokeWidth="1.4" />

        {/* ── LEFT LEG ── */}
        <path className="draw-on"
          d="M 200 285 L 195 380 L 186 460 L 204 460 L 210 385 L 218 285 Z"
          fill="url(#fig-grid)" stroke="url(#fig-grad)" strokeWidth="1.5"
        />
        <rect className="draw-on" x="184" y="460" width="22" height="12" rx="4"
          fill="rgba(91,140,255,0.08)" stroke="url(#fig-grad)" strokeWidth="1.2" />

        {/* ── RIGHT LEG ── */}
        <path className="draw-on"
          d="M 240 285 L 245 380 L 254 460 L 236 460 L 230 385 L 222 285 Z"
          fill="url(#fig-grid)" stroke="url(#fig-grad)" strokeWidth="1.5"
        />
        <rect className="draw-on" x="234" y="460" width="22" height="12" rx="4"
          fill="rgba(91,140,255,0.08)" stroke="url(#fig-grad)" strokeWidth="1.2" />

        {/* ── NEURAL NETWORK NODES from hands ── */}
        <g filter="url(#node-glow)">
          {/* Edge connections */}
          {NEURAL_EDGES.map(([a, b], i) => (
            <line key={i}
              x1={NEURAL_NODES[a].x} y1={NEURAL_NODES[a].y}
              x2={NEURAL_NODES[b].x} y2={NEURAL_NODES[b].y}
              stroke={NEURAL_NODES[a].glow}
              strokeWidth="1" strokeOpacity="0.4"
              strokeDasharray="3 4"
            >
              <animate attributeName="stroke-opacity" values="0.2;0.7;0.2"
                dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
            </line>
          ))}
          {/* Nodes */}
          {NEURAL_NODES.map((node, i) => (
            <g key={i}>
              <circle cx={node.x} cy={node.y} r={node.r * 2.5}
                fill={node.glow} fillOpacity="0.06" />
              <circle cx={node.x} cy={node.y} r={node.r}
                fill={node.glow} fillOpacity="0.8">
                <animate attributeName="r" values={`${node.r};${node.r * 1.5};${node.r}`}
                  dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
              </circle>
              {node.label && (
                <text x={node.x} y={node.y - node.r - 5}
                  textAnchor="middle" fontSize="7" fill={node.glow} fillOpacity="0.9"
                  fontFamily="monospace" fontWeight="bold">
                  {node.label}
                </text>
              )}
            </g>
          ))}
        </g>

        {/* ── FLOATING DATA PARTICLES around figure ── */}
        <g filter="url(#stream-glow)">
          {DATA_PARTICLES.map((p, i) => (
            <circle key={i} cx={p.cx} cy={p.cy} r={p.r}
              fill="#5B8CFF" fillOpacity="0.7">
              <animate attributeName="fill-opacity"
                values="0.1;0.9;0.1" dur={p.dur} begin={p.del} repeatCount="indefinite" />
              <animate attributeName="cx"
                values={`${p.cx};${p.cx + 12};${p.cx - 8};${p.cx}`}
                dur={p.dur} begin={p.del} repeatCount="indefinite" />
              <animate attributeName="cy"
                values={`${p.cy};${p.cy - 18};${p.cy + 10};${p.cy}`}
                dur={p.dur} begin={p.del} repeatCount="indefinite" />
            </circle>
          ))}
        </g>

        {/* ── DATA STREAM TEXT flowing down ── */}
        {DATA_LINES.map((line, i) => (
          <text key={i}
            x="480" y={90 + i * 65}
            fontSize="8.5" fill="#5B8CFF" fillOpacity="0"
            fontFamily="monospace" fontWeight="600"
          >
            {line}
            <animate attributeName="x"
              values="480;-60" dur="8s"
              begin={`${i * 1.3}s`}
              repeatCount="indefinite" />
            <animate attributeName="fill-opacity"
              values="0;0.7;0.7;0"
              keyTimes="0;0.1;0.85;1"
              dur="8s"
              begin={`${i * 1.3}s`}
              repeatCount="indefinite" />
          </text>
        ))}
      </svg>
    </motion.div>
  );
}
