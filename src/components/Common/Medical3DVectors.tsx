import React from 'react';
import { ThemeColor } from '../../types/doctor';
import { getTheme } from '../../utils/theme';

interface VectorProps {
  themeColor?: ThemeColor;
  className?: string;
}

/**
 * 3D Animated DNA Double Helix Vector with depth perspective
 */
export const Medical3DDNA: React.FC<VectorProps> = ({ themeColor = 'teal', className = '' }) => {
  const theme = getTheme(themeColor);

  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 200 320"
        className="w-full h-full drop-shadow-2xl animate-[float_6s_ease-in-out_infinite]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="dnaGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.primary} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="dnaGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor={theme.primaryDark} stopOpacity="0.9" />
          </linearGradient>
          <filter id="glow3d" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Glow */}
        <circle cx="100" cy="160" r="70" fill={theme.primary} opacity="0.12" filter="url(#glow3d)" />

        {/* DNA Strands & Rungs */}
        {[30, 65, 100, 135, 170, 205, 240, 275].map((y, idx) => {
          const phase = idx * 0.8;
          const x1 = 100 + Math.sin(phase) * 55;
          const x2 = 100 - Math.sin(phase) * 55;
          const depth = Math.cos(phase); // -1 (back) to 1 (front)
          const opacity = depth > 0 ? 0.95 : 0.45;
          const radius = depth > 0 ? 6.5 : 4.5;

          return (
            <g key={idx} opacity={opacity}>
              {/* Connector rung with 3D gradient */}
              <line
                x1={x1}
                y1={y}
                x2={x2}
                y2={y + 8}
                stroke={depth > 0 ? 'url(#dnaGrad1)' : '#94a3b8'}
                strokeWidth={depth > 0 ? '3.5' : '2'}
                strokeLinecap="round"
                strokeDasharray={depth < 0 ? '4 3' : undefined}
              />
              {/* Left Nucleotide Ball */}
              <circle
                cx={x1}
                cy={y}
                r={radius}
                fill="url(#dnaGrad1)"
                filter={depth > 0 ? 'url(#glow3d)' : undefined}
              />
              <circle cx={x1 - 1.5} cy={y - 1.5} r={radius * 0.35} fill="white" opacity="0.8" />

              {/* Right Nucleotide Ball */}
              <circle
                cx={x2}
                cy={y + 8}
                r={radius}
                fill="url(#dnaGrad2)"
                filter={depth > 0 ? 'url(#glow3d)' : undefined}
              />
              <circle cx={x2 - 1.5} cy={y + 6.5} r={radius * 0.35} fill="white" opacity="0.8" />
            </g>
          );
        })}

        {/* Floating Sparks */}
        <circle cx="160" cy="80" r="3" fill="#38bdf8" opacity="0.8" className="animate-ping" />
        <circle cx="45" cy="220" r="2.5" fill={theme.primary} opacity="0.7" className="animate-pulse" />
      </svg>
    </div>
  );
};

/**
 * 3D Holographic Heartbeat Pulse Monitor
 */
export const Medical3DHeartPulse: React.FC<VectorProps> = ({ themeColor = 'teal', className = '' }) => {
  const theme = getTheme(themeColor);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 280 140"
        className="w-full h-full drop-shadow-xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="pulseGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={theme.primary} stopOpacity="0.1" />
            <stop offset="40%" stopColor={theme.primary} stopOpacity="0.8" />
            <stop offset="70%" stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="100%" stopColor={theme.primary} stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Clinical Grid */}
        <path
          d="M10 30 H270 M10 70 H270 M10 110 H270 M50 10 V130 M110 10 V130 M170 10 V130 M230 10 V130"
          stroke={theme.primary}
          strokeWidth="0.7"
          strokeOpacity="0.15"
          strokeDasharray="2 3"
        />

        {/* 3D Heartbeat Line with glow */}
        <path
          d="M10 70 L60 70 L75 50 L85 95 L95 25 L108 115 L120 60 L130 80 L140 70 L270 70"
          stroke="url(#pulseGlow)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_12px_rgba(13,148,136,0.6)]"
        />

        {/* Blinking Pulse Pointer */}
        <circle cx="108" cy="115" r="5" fill="#38bdf8" className="animate-ping" opacity="0.75" />
        <circle cx="108" cy="115" r="3.5" fill="white" />
      </svg>
    </div>
  );
};

/**
 * 3D Verified Medical Shield Emblem
 */
export const Medical3DShield: React.FC<VectorProps> = ({ themeColor = 'teal', className = '' }) => {
  const theme = getTheme(themeColor);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 160 180"
        className="w-full h-full drop-shadow-xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="50%" stopColor={theme.primaryLight} stopOpacity="0.8" />
            <stop offset="100%" stopColor={theme.primary} stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="crossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.primary} />
            <stop offset="100%" stopColor={theme.primaryDark} />
          </linearGradient>
        </defs>

        {/* Shield Outer 3D Rim */}
        <path
          d="M80 15 L135 40 V95 C135 135 80 165 80 165 C80 165 25 135 25 95 V40 L80 15 Z"
          fill="url(#shieldGrad)"
          stroke={theme.primary}
          strokeWidth="3.5"
          className="drop-shadow-md"
        />

        {/* Inner Medical Cross */}
        <path
          d="M72 55 H88 V75 H108 V91 H88 V115 H72 V91 H52 V75 H72 Z"
          fill="url(#crossGrad)"
          className="drop-shadow-sm"
        />

        {/* Sheen Highlight */}
        <path
          d="M80 20 L125 43 V85 C125 105 105 135 80 152 V20 Z"
          fill="white"
          opacity="0.22"
        />
      </svg>
    </div>
  );
};

/**
 * Ambient Floating Medical Micro-Particles
 */
export const FloatingMedicalParticles: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      <div className="absolute top-12 left-10 w-2.5 h-2.5 rounded-full bg-teal-400/30 animate-pulse"></div>
      <div className="absolute top-1/3 right-16 w-3 h-3 rounded-full bg-blue-400/25 animate-ping duration-1000"></div>
      <div className="absolute bottom-20 left-1/4 w-2 h-2 rounded-full bg-emerald-400/30 animate-pulse"></div>
      <div className="absolute top-2/3 right-1/3 w-3.5 h-3.5 rounded-full bg-purple-400/20"></div>
      
      {/* Little floating medical cross */}
      <svg className="absolute top-24 right-20 w-5 h-5 text-teal-600/20 animate-[spin_20s_linear_infinite]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z" />
      </svg>
      <svg className="absolute bottom-32 left-12 w-6 h-6 text-blue-600/15 animate-[spin_25s_linear_infinite]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z" />
      </svg>
    </div>
  );
};
