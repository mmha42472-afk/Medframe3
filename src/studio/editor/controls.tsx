import React, { useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Copy, ImagePlus, Link2, Plus, Trash2, X } from 'lucide-react';
import type { FieldDef } from '../types';
import { ICONS, Icon } from '../icons';
import { fileToDataUrl } from '../utils';

export const inputCls = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100';

export function Row({ label, help, children, inline = false }: { label: string; help?: string; children: React.ReactNode; inline?: boolean }) {
  return (
    <div className={inline ? 'flex items-center justify-between gap-3' : 'space-y-1.5'}>
      <div className="text-[12px] font-semibold text-slate-600">{label}</div>
      {children}
      {help && !inline && <p className="text-[11px] leading-5 text-slate-400">{help}</p>}
    </div>
  );
}

export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)}
      className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition ${value ? 'bg-sky-500' : 'bg-slate-300'}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${value ? 'right-0.5' : 'right-[22px]'}`} />
    </button>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: React.ReactNode; title?: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
      {options.map(o => (
        <button key={o.value} type="button" title={o.title} onClick={() => onChange(o.value)}
          className={`min-h-8 flex-1 cursor-pointer rounded-lg px-2 text-[12px] font-medium transition ${value === o.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Slider({ value, min, max, step = 1, onChange, unit = '', format }: { value: number; min: number; max: number; step?: number; onChange: (v: number) => void; unit?: string; format?: (v: number) => string }) {
  return (
    <div className="flex items-center gap-3">
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="h-1.5 flex-1 cursor-pointer accent-sky-500" />
      <span className="w-14 text-left font-mono text-[12px] tabular-nums text-slate-500">{format ? format(value) : `${value}${unit}`}</span>
    </div>
  );
}

export function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label className="relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-slate-200 shadow-inner" style={{ background: value }}>
        <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'} onChange={e => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label="اختار لون" />
      </label>
      <input dir="ltr" value={value} onChange={e => onChange(e.target.value)} className={`${inputCls} font-mono`} />
    </div>
  );
}

export function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const pick = async (f?: File | null) => {
    if (!f) return;
    setBusy(true);
    try { onChange(await fileToDataUrl(f)); } finally { setBusy(false); }
  };
  return (
    <div className="space-y-2">
      {value ? (
        <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-[repeating-conic-gradient(#f1f5f9_0_25%,#fff_0_50%)] bg-[length:16px_16px]">
          <img src={value} alt="" className="h-28 w-full object-contain" />
          <button type="button" onClick={() => onChange('')} className="absolute left-2 top-2 grid h-7 w-7 cursor-pointer place-items-center rounded-full bg-white/90 text-rose-600 shadow" aria-label="شيل الصورة"><X className="h-4 w-4" /></button>
        </div>
      ) : null}
      <div className="flex gap-2">
        <button type="button" onClick={() => ref.current?.click()} className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-[12px] font-semibold text-slate-600 hover:border-sky-400 hover:text-sky-600">
          <ImagePlus className="h-4 w-4" />{busy ? 'جاري التجهيز…' : value ? 'غيّر الصورة' : 'ارفع صورة'}
        </button>
        <button type="button" onClick={() => setShowUrl(v => !v)} className="cursor-pointer rounded-lg border border-slate-200 px-2.5 text-slate-500 hover:text-sky-600" title="لينك صورة"><Link2 className="h-4 w-4" /></button>
      </div>
      {showUrl && <input dir="ltr" placeholder="https://…" value={value.startsWith('data:') ? '' : value} onChange={e => onChange(e.target.value)} className={inputCls} />}
      <input ref={ref} type="file" accept="image/*" hidden onChange={e => { pick(e.target.files?.[0]); e.target.value = ''; }} />
    </div>
  );
}

export function IconInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(o => !o)} className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] hover:border-sky-300">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-sky-50 text-sky-700"><Icon name={value} className="h-4 w-4" /></span>
        <span className="flex-1 text-right text-slate-700">{ICONS[value]?.label || 'اختار أيقونة'}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mt-2 grid max-h-52 grid-cols-6 gap-1 overflow-auto rounded-xl border border-slate-200 bg-white p-2">
          {Object.entries(ICONS).map(([k, v]) => (
            <button key={k} type="button" title={v.label} onClick={() => { onChange(k); setOpen(false); }}
              className={`grid aspect-square cursor-pointer place-items-center rounded-lg transition ${value === k ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              <v.c className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- schema-driven field ---------- */
export function Field({ def, value, onChange }: { def: FieldDef; value: any; onChange: (v: any) => void }) {
  switch (def.type) {
    case 'text': case 'url':
      return <Row label={def.label} help={def.help}><input dir={def.type === 'url' ? 'ltr' : undefined} value={value ?? ''} placeholder={def.placeholder} onChange={e => onChange(e.target.value)} className={inputCls} /></Row>;
    case 'textarea':
      return <Row label={def.label} help={def.help}><textarea rows={def.rows || 3} value={value ?? ''} placeholder={def.placeholder} onChange={e => onChange(e.target.value)} className={`${inputCls} resize-y leading-6`} /></Row>;
    case 'color':
      return <Row label={def.label}><ColorInput value={value || '#000000'} onChange={onChange} /></Row>;
    case 'toggle':
      return <div className="space-y-1"><Row label={def.label} inline><Toggle value={!!value} onChange={onChange} label={def.label} /></Row>{def.help && <p className="text-[11px] leading-5 text-slate-400">{def.help}</p>}</div>;
    case 'number':
      return <Row label={def.label}><Slider value={Number(value) || 0} min={def.min ?? 0} max={def.max ?? 100} step={def.step ?? 1} onChange={onChange} /></Row>;
    case 'select':
      return (
        <Row label={def.label} help={def.help}>
          {def.options.length <= 4
            ? <Segmented value={String(value)} options={def.options} onChange={onChange} />
            : <select value={value} onChange={e => onChange(e.target.value)} className={inputCls}>{def.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>}
        </Row>
      );
    case 'icon':
      return <Row label={def.label}><IconInput value={value} onChange={onChange} /></Row>;
    case 'image':
      return <Row label={def.label} help={def.help}><ImageInput value={value || ''} onChange={onChange} /></Row>;
    case 'images':
      return <Row label={def.label}><div className="space-y-2">{(value || []).map((v: string, i: number) => <ImageInput key={i} value={v} onChange={nv => onChange((value || []).map((x: string, k: number) => (k === i ? nv : x)).filter(Boolean))} />)}<ImageInput value="" onChange={nv => nv && onChange([...(value || []), nv])} /></div></Row>;
    case 'lines':
      return (
        <Row label={def.label} help={def.help}>
          <textarea rows={Math.min(10, Math.max(3, (value || []).length + 1))} value={(value || []).join('\n')} placeholder={def.placeholder}
            onChange={e => onChange(e.target.value.split('\n'))} className={`${inputCls} resize-y leading-6`} />
        </Row>
      );
    case 'list':
      return <ListField def={def} value={value || []} onChange={onChange} />;
  }
}

function ListField({ def, value, onChange }: { def: Extract<FieldDef, { type: 'list' }>; value: any[]; onChange: (v: any[]) => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const move = (i: number, d: number) => {
    const j = i + d; if (j < 0 || j >= value.length) return;
    const next = [...value]; [next[i], next[j]] = [next[j], next[i]]; onChange(next); setOpen(j);
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-[12px] font-semibold text-slate-600">{def.label} <span className="font-normal text-slate-400">({value.length})</span></div>
      </div>
      <div className="space-y-1.5">
        {value.map((item, i) => (
          <div key={i} className={`overflow-hidden rounded-xl border transition ${open === i ? 'border-sky-300 bg-sky-50/40' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-center gap-1 px-2 py-1.5">
              <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-right">
                {item.icon && <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600"><Icon name={item.icon} className="h-3.5 w-3.5" /></span>}
                {(item.image || item.photo) && <img src={item.image || item.photo} alt="" className="h-6 w-6 shrink-0 rounded-md object-cover" />}
                <span className="truncate text-[12.5px] font-medium text-slate-700">{String(item[def.titleKey] || `${def.itemLabel} ${i + 1}`)}</span>
              </button>
              <button type="button" onClick={() => move(i, -1)} className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="لفوق"><ChevronUp className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => move(i, 1)} className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="لتحت"><ChevronDown className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => { const n = [...value]; n.splice(i + 1, 0, JSON.parse(JSON.stringify(item))); onChange(n); }} className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="تكرار"><Copy className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => { onChange(value.filter((_, k) => k !== i)); setOpen(null); }} className="cursor-pointer rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="حذف"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
            {open === i && (
              <div className="space-y-3 border-t border-slate-200/70 p-3">
                {def.fields.map(f => <Field key={f.key} def={f} value={item[f.key]} onChange={v => onChange(value.map((x, k) => (k === i ? { ...x, [f.key]: v } : x)))} />)}
              </div>
            )}
          </div>
        ))}
      </div>
      <button type="button" onClick={() => { onChange([...value, def.newItem()]); setOpen(value.length); }}
        className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-2 text-[12px] font-semibold text-slate-500 hover:border-sky-400 hover:text-sky-600">
        <Plus className="h-4 w-4" /> إضافة {def.itemLabel}
      </button>
    </div>
  );
}

export function Group({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-slate-100 last:border-0">
      <button type="button" onClick={() => setOpen(o => !o)} className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-[12.5px] font-bold text-slate-800">
        {title}<ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="space-y-4 px-4 pb-5">{children}</div>}
    </section>
  );
}
