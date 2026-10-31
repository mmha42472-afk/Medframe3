import React from 'react';

export const uid = (p = 's') => `${p}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;

export const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'site';

/* ---------- colour helpers ---------- */
export function hexToRgb(hex: string): [number, number, number] | null {
  const h = (hex || '').trim().replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}
export function rgba(hex: string, alpha: number) {
  const c = hexToRgb(hex);
  if (!c) return hex;
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${Math.max(0, Math.min(1, alpha))})`;
}
/** Relative luminance (WCAG) */
export function luminance(hex: string) {
  const c = hexToRgb(hex);
  if (!c) return 1;
  const [r, g, b] = c.map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export const isDark = (hex: string) => luminance(hex) < 0.32;
export function mix(a: string, b: string, t: number) {
  const x = hexToRgb(a), y = hexToRgb(b);
  if (!x || !y) return a;
  const m = x.map((v, i) => Math.round(v + (y[i] - v) * t));
  return `#${m.map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

/* ---------- text helpers ---------- */
/** `*word*` → highlighted span, new lines → <br/> */
export function rich(text: string | undefined, hlClass = 'st-hl'): React.ReactNode {
  if (!text) return null;
  const lines = String(text).split('\n');
  return lines.map((line, li) => (
    <React.Fragment key={li}>
      {line.split(/(\*[^*]+\*)/g).map((part, i) =>
        part.startsWith('*') && part.endsWith('*') && part.length > 2
          ? <em key={i} className={hlClass}>{part.slice(1, -1)}</em>
          : <React.Fragment key={i}>{part}</React.Fragment>
      )}
      {li < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}
export const plain = (text: string | undefined) => String(text || '').replace(/\*/g, '').replace(/\n/g, ' ');

export const digits = (s: string) => String(s || '').replace(/[^\d]/g, '');
export const waHref = (number: string, text = '') => {
  const n = digits(number);
  const q = text ? `?text=${encodeURIComponent(text)}` : '';
  return n ? `https://wa.me/${n}${q}` : `https://wa.me/${q}`;
};

/** Resolve a button target. `wa:<message>` → WhatsApp, `tel` → phone, else URL/anchor. */
export function linkHref(target: string | undefined, whatsapp: string, phone: string) {
  const t = (target || '').trim();
  if (!t) return '#';
  if (t.startsWith('wa:')) return waHref(whatsapp, t.slice(3).trim());
  if (t === 'wa') return waHref(whatsapp);
  if (t === 'tel') return `tel:${digits(phone)}`;
  return t;
}
export const isExternal = (href: string) => /^https?:|^tel:|^mailto:/.test(href);

/* ---------- images ---------- */
/** Read a picked file, downscale it and return a compact data URL (keeps saved sites small). */
export function fileToDataUrl(file: File, maxSide = 1600, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      if (!ctx) { reject(new Error('canvas')); return; }
      ctx.drawImage(img, 0, 0, w, h);
      const isPng = file.type === 'image/png';
      resolve(c.toDataURL(isPng ? 'image/png' : 'image/jpeg', quality));
      URL.revokeObjectURL(url);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image')); };
    img.src = url;
  });
}

export function downloadFile(name: string, content: string, type = 'text/html') {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

export const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
