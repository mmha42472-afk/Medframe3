import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

/* ------------------------------------------------------------------
   Hand-built graphic language for the doctor website.
   One idea runs through everything: a fine "frame" — hairline corners,
   arches and a single pulse line — drawn in the doctor's own accent.
   ------------------------------------------------------------------ */

const toArabicDigits = (s: string) => s.replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
// One digit style across the site (Western digits, standard in Egyptian clinics and marketing).
export const fmtIndex = (n: number, _isEn?: boolean) => String(n).padStart(2, '0');
export { toArabicDigits };

/** Fade-and-rise on first view. Respects reduced motion. */
export const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string; as?: 'div' | 'li' }> = ({ children, delay = 0, className = '', as = 'div' }) => {
  const reduce = useReducedMotion();
  const Comp = as === 'li' ? motion.li : motion.div;
  return (
    <Comp
      className={className}
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  );
};

/** Four hairline corner brackets around a block (the "frame"). */
export const CornerFrame: React.FC<{ inset?: number; size?: number; className?: string }> = ({ inset = -14, size = 26, className = '' }) => {
  const s = { width: size, height: size } as React.CSSProperties;
  const base = 'absolute border-[var(--accent)] pointer-events-none';
  return (
    <div aria-hidden="true" className={`absolute inset-0 ${className}`} style={{ inset }}>
      <span className={`${base} top-0 right-0 border-t-[1.5px] border-r-[1.5px]`} style={s} />
      <span className={`${base} top-0 left-0 border-t-[1.5px] border-l-[1.5px]`} style={s} />
      <span className={`${base} bottom-0 right-0 border-b-[1.5px] border-r-[1.5px]`} style={s} />
      <span className={`${base} bottom-0 left-0 border-b-[1.5px] border-l-[1.5px]`} style={s} />
    </div>
  );
};

/** A quiet field of plus marks that fades out toward the edges. */
export const PlusField: React.FC<{ className?: string; opacity?: number }> = ({ className = '', opacity = 0.5 }) => (
  <svg aria-hidden="true" className={`absolute pointer-events-none ${className}`} width="100%" height="100%" style={{ opacity }}>
    <defs>
      <pattern id="mf-plus" width="36" height="36" patternUnits="userSpaceOnUse">
        <path d="M18 14v8M14 18h8" stroke="var(--line)" strokeWidth="1" strokeLinecap="round" />
      </pattern>
      <radialGradient id="mf-plus-fade" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#fff" stopOpacity="1" />
        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
      <mask id="mf-plus-mask"><rect width="100%" height="100%" fill="url(#mf-plus-fade)" /></mask>
    </defs>
    <rect width="100%" height="100%" fill="url(#mf-plus)" mask="url(#mf-plus-mask)" />
  </svg>
);

/** A single heartbeat line that draws itself once when it scrolls into view. */
export const PulseLine: React.FC<{ className?: string; color?: string; strokeWidth?: number }> = ({ className = '', color = 'var(--accent)', strokeWidth = 1.5 }) => {
  const reduce = useReducedMotion();
  const d = 'M0 30 H300 L318 30 L330 8 L344 52 L356 18 L366 30 H520 L532 30 L540 22 L548 30 H1000';
  return (
    <svg aria-hidden="true" viewBox="0 0 1000 60" preserveAspectRatio="none" className={className}>
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, ease: [0.65, 0, 0.35, 1] }}
      />
    </svg>
  );
};

/** Numbered section heading: ٠١ —— kicker / big title / optional lead. */
export const SectionHead: React.FC<{
  index: number; isEn: boolean; kicker: string; title: string; lead?: string; dark?: boolean; align?: 'start' | 'center'; aside?: React.ReactNode;
}> = ({ index, isEn, kicker, title, lead, dark = false, align = 'start', aside }) => (
  <div className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${align === 'center' ? 'items-center text-center md:flex-col md:items-center' : ''}`}>
    <Reveal className={align === 'center' ? 'max-w-2xl' : 'max-w-3xl'}>
      <div className={`flex items-center gap-3 text-[13px] font-medium ${align === 'center' ? 'justify-center' : ''} ${dark ? 'text-white/60' : 'text-[var(--muted)]'}`}>
        <span className="font-display tabular-nums text-[var(--accent)]">{fmtIndex(index, isEn)}</span>
        <span className={`h-px w-10 ${dark ? 'bg-white/25' : 'bg-[var(--line-strong)]'}`} />
        <span>{kicker}</span>
      </div>
      <h2 className={`font-display mt-4 text-[32px] leading-[1.25] sm:text-[42px] font-semibold ${dark ? 'text-white' : 'text-[var(--ink)]'}`}>{title}</h2>
      {lead && <p className={`mt-4 text-[17px] leading-[1.9] ${dark ? 'text-white/70' : 'text-[var(--muted)]'}`}>{lead}</p>}
    </Reveal>
    {aside}
  </div>
);

/** Portrait in an arch, with an offset hairline arch and corner frame.
 *  Falls back to a drawn monogram when there is no photo. */
export const ArchPortrait: React.FC<{ name: string; avatarUrl?: string; onOpen?: () => void; isEn: boolean; heightClass?: string }> = ({ name, avatarUrl, onOpen, isEn, heightClass = 'h-[460px] sm:h-[560px]' }) => {
  const [failed, setFailed] = React.useState(false);
  const hasImg = Boolean(avatarUrl && avatarUrl.trim().length > 5 && !failed);
  const initials = (() => {
    const cleaned = name.replace(/^(د\.?|الدكتور|الدكتورة|Dr\.?)\s+/i, '').trim();
    const parts = cleaned.split(/\s+/).filter(w => !/^(بن|بنت|ابن|bin|bint)$/i.test(w));
    const first = (w: string) => (w.startsWith('ال') && w.length > 2 ? w[2] : w[0]);
    return parts.length >= 2 ? `${first(parts[0])}.${first(parts[parts.length - 1])}` : first(cleaned);
  })();
  return (
    <div className={`relative w-full ${heightClass}`}>
      {/* offset hairline arch */}
      <div aria-hidden="true" className="absolute inset-0 translate-x-[-18px] translate-y-[18px] rounded-t-[999px] rounded-b-[28px] border border-[var(--accent)] opacity-60" />
      <button
        type="button"
        onClick={onOpen}
        className="group relative block h-full w-full overflow-hidden rounded-t-[999px] rounded-b-[28px] bg-[var(--accent-soft)] cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
        aria-label={isEn ? `Enlarge photo of ${name}` : `تكبير صورة ${name}`}
      >
        {hasImg ? (
          <img
            src={avatarUrl}
            alt={name}
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center" style={{ background: 'linear-gradient(170deg, var(--accent-soft) 0%, color-mix(in srgb, var(--accent) 22%, white) 100%)' }}>
            <svg aria-hidden="true" viewBox="0 0 400 560" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
              {[0, 1, 2, 3, 4].map(i => (
                <path key={i} d={`M${60 + i * 28} 560 V${230 + i * 6} A${140 - i * 28} ${140 - i * 28} 0 0 1 ${340 - i * 28} ${230 + i * 6} V560`} fill="none" stroke="var(--accent)" strokeOpacity={0.18 + i * 0.06} strokeWidth="1" />
              ))}
              <path d="M140 560 V500 Q140 440 200 440 Q260 440 260 500 V560" fill="none" stroke="var(--accent)" strokeOpacity=".3" strokeWidth="1.5" />
              <circle cx="200" cy="398" r="30" fill="none" stroke="var(--accent)" strokeOpacity=".3" strokeWidth="1.5" />
            </svg>
            <span className="font-display absolute inset-x-0 top-[24%] text-center text-[88px] font-light leading-none text-[var(--accent-dark)]">{initials}</span>
          </div>
        )}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </button>
      <CornerFrame inset={-16} size={30} />
    </div>
  );
};

/** Big decorative quotation mark. */
export const QuoteMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg aria-hidden="true" viewBox="0 0 64 48" className={className}>
    <path d="M27 4C14 8 6 18 6 31c0 8 5 13 11 13 6 0 10-4 10-10 0-5-4-9-9-9-1 0-2 0-3 1 2-8 7-13 14-16l-2-6zm31 0C45 8 37 18 37 31c0 8 5 13 11 13 6 0 10-4 10-10 0-5-4-9-9-9-1 0-2 0-3 1 2-8 7-13 14-16l-2-6z" fill="currentColor" />
  </svg>
);

/** WhatsApp-style chat glyph (generic speech bubble + handset). */
export const ChatGlyph: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 19.5l1.2-3.6A8 8 0 1 1 8.6 19z" />
    <path d="M9.3 8.6c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.6 1.5c.1.2 0 .4-.1.6l-.5.6c.6 1.1 1.4 1.9 2.5 2.5l.6-.5c.2-.1.4-.2.6-.1l1.5.6c.3.1.4.3.4.5v.5c0 .3 0 .6-.5.8-.6.3-1.6.4-3.2-.5a8.6 8.6 0 0 1-3.3-3.3c-.9-1.6-.8-2.6-.4-3.1z" fill="currentColor" stroke="none" />
  </svg>
);
