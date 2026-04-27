import { useEffect, useRef, useState, memo } from "react";

// ── Types of shapes ──────────────────────────────────────────────
const SPHERE_DEFS = [
  { cx: "20%", cy: "25%",  r: 140, speed: 0.4,  opacity: 0.55 },
  { cx: "78%", cy: "65%",  r: 100, speed: 0.6,  opacity: 0.45 },
  { cx: "55%", cy: "88%",  r:  72, speed: 0.8,  opacity: 0.35 },
];

const WAVE_DEFS = [
  { amp: 28, freq: 0.012, phase: 0,    y: 0.30, color: "#5B8CFF", opacity: 0.12 },
  { amp: 20, freq: 0.016, phase: 1.2,  y: 0.55, color: "#8A2BE2", opacity: 0.10 },
  { amp: 14, freq: 0.022, phase: 2.5,  y: 0.78, color: "#00D4FF", opacity: 0.08 },
];

// ── Wireframe Sphere SVG (static, animated via CSS) ──────────────
function WireSphere({ cx, cy, r, opacity }) {
  const rings = 5;
  const meridians = 7;
  const lines = [];

  // Latitude rings
  for (let i = 1; i < rings; i++) {
    const lat = (i / rings) * Math.PI;
    const ry = r * Math.sin(lat);
    const yOff = -r * Math.cos(lat);
    lines.push(
      <ellipse key={`lat-${i}`} cx="0" cy={yOff} rx={ry} ry={ry * 0.28}
        fill="none" stroke="currentColor" strokeWidth="0.7" />
    );
  }

  // Meridian arcs
  for (let j = 0; j < meridians; j++) {
    const angle = (j / meridians) * Math.PI;
    const x0 = r * Math.sin(angle);
    lines.push(
      <ellipse key={`mer-${j}`} cx="0" cy="0" rx={x0} ry={r}
        fill="none" stroke="currentColor" strokeWidth="0.7"
        style={{ transform: `rotateY(${(j / meridians) * 180}deg)` }} />
    );
  }

  // Outer circle
  lines.push(
    <circle key="outer" cx="0" cy="0" r={r} fill="none" stroke="currentColor" strokeWidth="1.2" />
  );

  return (
    <g
      transform={`translate(${cx}, ${cy})`}
      color={`rgba(91,140,255,${opacity})`}
      style={{ animation: `sphere-spin ${12 + r * 0.05}s linear infinite` }}
    >
      {lines}
    </g>
  );
}

// ── Animated Wave path ───────────────────────────────────────────
function WavePath({ amp, freq, phase, y, color, opacity, tick, width, height }) {
  const pts = [];
  for (let x = 0; x <= width; x += 6) {
    const yVal = height * y + Math.sin(x * freq + phase + tick * 0.015) * amp;
    pts.push(`${x},${yVal}`);
  }
  return (
    <polyline
      points={pts.join(" ")}
      fill="none"
      stroke={color}
      strokeWidth="1.2"
      strokeOpacity={opacity}
    />
  );
}

// ── Particle dots (static positions, only rendered once) ─────────
const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  r: 0.8 + Math.random() * 1.4,
  dur: 6 + Math.random() * 10,
  del: Math.random() * 8,
}));

// ── Main Component ───────────────────────────────────────────────
const GeometricBackground = memo(function GeometricBackground({ children }) {
  const svgRef = useRef(null);
  const mouseRef = useRef({ x: 50, y: 50 });
  const [aura, setAura] = useState({ x: 50, y: 50 });
  const [tick, setTick] = useState(0);
  const rafRef = useRef(null);
  const lastTickRef = useRef(0);
  const [dims, setDims] = useState({ w: 1440, h: 900 });

  // Responsive size
  useEffect(() => {
    const update = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Mouse tracking — throttled
  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // RAF loop for waves + aura (60fps, wave at ~15fps)
  useEffect(() => {
    let frame = 0;
    const loop = (ts) => {
      rafRef.current = requestAnimationFrame(loop);
      frame++;
      if (frame % 2 === 0) {
        setAura({ x: mouseRef.current.x, y: mouseRef.current.y });
      }
      if (ts - lastTickRef.current > 60) {
        lastTickRef.current = ts;
        setTick((t) => t + 1);
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const { w, h } = dims;

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden">
      {/* ── SVG Background Layer ── */}
      <svg
        ref={svgRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      >
        <defs>
          {/* Mouse-reactive aura */}
          <radialGradient id="geo-aura" cx={`${aura.x}%`} cy={`${aura.y}%`} r="40%" gradientUnits="userSpaceOnUse"
            gradientTransform={`scale(${w / 100} ${h / 100})`}>
            <stop offset="0%"   stopColor="#5B8CFF" stopOpacity="0.08" />
            <stop offset="50%"  stopColor="#8A2BE2" stopOpacity="0.04" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Static deep background */}
          <linearGradient id="geo-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#03060D" />
            <stop offset="50%"  stopColor="#060B18" />
            <stop offset="100%" stopColor="#03060D" />
          </linearGradient>

          {/* Sphere glow filter */}
          <filter id="sphere-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Base fill */}
        <rect width={w} height={h} fill="url(#geo-bg)" />

        {/* Aura overlay */}
        <rect width={w} height={h} fill="url(#geo-aura)" />

        {/* Subtle grid */}
        <g stroke="rgba(91,140,255,0.04)" strokeWidth="0.5">
          {Array.from({ length: Math.ceil(w / 80) }, (_, i) => (
            <line key={`vg-${i}`} x1={i * 80} y1="0" x2={i * 80} y2={h} />
          ))}
          {Array.from({ length: Math.ceil(h / 80) }, (_, i) => (
            <line key={`hg-${i}`} x1="0" y1={i * 80} x2={w} y2={i * 80} />
          ))}
        </g>

        {/* Wave lines */}
        {WAVE_DEFS.map((wd, i) => (
          <WavePath key={i} {...wd} tick={tick} width={w} height={h} />
        ))}

        {/* Wireframe Spheres */}
        <g filter="url(#sphere-glow)">
          {SPHERE_DEFS.map((sd, i) => {
            const pxCx = (parseFloat(sd.cx) / 100) * w;
            const pxCy = (parseFloat(sd.cy) / 100) * h;
            return <WireSphere key={i} cx={pxCx} cy={pxCy} r={sd.r} opacity={sd.opacity} />;
          })}
        </g>

        {/* Particle field */}
        {PARTICLES.map((p) => (
          <circle
            key={p.id}
            cx={(p.x / 100) * w}
            cy={(p.y / 100) * h}
            r={p.r}
            fill="#5B8CFF"
            fillOpacity="0.4"
          >
            <animate
              attributeName="fill-opacity"
              values="0.1;0.5;0.1"
              dur={`${p.dur}s`}
              begin={`${p.del}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values={`${(p.y / 100) * h};${(p.y / 100) * h - 15};${(p.y / 100) * h}`}
              dur={`${p.dur * 1.3}s`}
              begin={`${p.del}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>

      {/* ── Content Layer ── */}
      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
});

export default GeometricBackground;
