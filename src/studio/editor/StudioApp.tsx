import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, Copy, Download, Eye, EyeOff, FileJson, GripVertical, LayoutTemplate, Monitor, MousePointerClick,
  Play, Plus, Redo2, Settings2, Smartphone, Tablet, Trash2, Undo2, Upload, ChevronUp, ChevronDown, X, Check, Pencil,
} from 'lucide-react';
import type { Section, SectionType, Site } from '../types';
import { SiteView } from '../SiteView';
import { SECTION_DEFS, SECTION_ORDER, defaultSettings, defaultTheme, fontsHref, makeSection, normalizeSection } from '../schema';
import { TEMPLATES } from '../templates';
import { deleteSite, listSites, saveSite } from '../storage';
import { clone, downloadFile, slugify, uid } from '../utils';
import { SectionInspector, SiteInspector } from './Inspector';
import siteCss from '../site.css?raw';
import runtimeJs from '../runtime.js?raw';

/* load the shared runtime once (defines window.MFStudio) */
function ensureRuntime() {
  if (!(window as any).MFStudio) new Function(runtimeJs)();
}
let threeLoading: Promise<void> | null = null;
function ensureThree() {
  if ((window as any).__MF_THREE) return Promise.resolve();
  threeLoading ||= import('three').then(T => { (window as any).__MF_THREE = T; window.dispatchEvent(new Event('mf-three')); });
  return threeLoading;
}

type Device = 'desktop' | 'tablet' | 'mobile';
const DEVICE_W: Record<Device, number> = { desktop: 1280, tablet: 820, mobile: 390 };

export default function StudioApp({ onExit }: { onExit: () => void }) {
  const [sites, setSites] = useState<Site[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [site, setSite] = useState<Site | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [device, setDevice] = useState<Device>('desktop');
  const [interact, setInteract] = useState(false);
  const [playKey, setPlayKey] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [saved, setSaved] = useState<'saved' | 'saving'>('saved');
  const [addOpen, setAddOpen] = useState(false);
  const [gallery, setGallery] = useState(false);
  const [toast, setToast] = useState('');
  const past = useRef<Site[]>([]);
  const future = useRef<Site[]>([]);
  const lastPush = useRef(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const dragId = useRef<string | null>(null);
  const [canvasW, setCanvasW] = useState(1200);

  const flash = (m: string) => { setToast(m); window.setTimeout(() => setToast(''), 2600); };

  /* ---------- load ---------- */
  useEffect(() => {
    ensureRuntime();
    listSites().then(list => {
      setSites(list);
      setLoaded(true);
      const lastId = localStorage.getItem('mf-studio-last');
      const last = list.find(s => s.id === lastId) || list[0];
      if (last) openSite(last); else setGallery(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openSite = (s: Site) => {
    const norm = { ...s, theme: { ...defaultTheme(), ...s.theme }, settings: { ...defaultSettings(), ...s.settings }, sections: s.sections.map(normalizeSection) };
    setSite(norm); setSelectedId(null); past.current = []; future.current = [];
    try { localStorage.setItem('mf-studio-last', s.id); } catch { /* */ }
  };

  /* ---------- history + autosave ---------- */
  const update = useCallback((next: Site, coalesce = true) => {
    setSite(prev => {
      if (prev) {
        const t = Date.now();
        if (!coalesce || t - lastPush.current > 700) past.current = [...past.current.slice(-60), prev];
        lastPush.current = t;
        future.current = [];
      }
      return { ...next, updatedAt: new Date().toISOString() };
    });
  }, []);
  const undo = () => { if (!site || !past.current.length) return; future.current = [site, ...future.current]; const p = past.current[past.current.length - 1]; past.current = past.current.slice(0, -1); setSite(p); };
  const redo = () => { if (!site || !future.current.length) return; past.current = [...past.current, site]; const n = future.current[0]; future.current = future.current.slice(1); setSite(n); };

  useEffect(() => {
    if (!site) return;
    setSaved('saving');
    const t = window.setTimeout(() => {
      saveSite(site).then(() => {
        setSaved('saved');
        setSites(list => [site, ...list.filter(x => x.id !== site.id)]);
      });
    }, 600);
    return () => window.clearTimeout(t);
  }, [site]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
      if (e.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    const el = canvasRef.current; if (!el) return;
    const ro = new ResizeObserver(() => setCanvasW(el.clientWidth));
    ro.observe(el); setCanvasW(el.clientWidth);
    return () => ro.disconnect();
  }, [site?.id]);
  const frameW = device === 'desktop' ? Math.max(DEVICE_W.desktop, Math.min(1440, canvasW)) : DEVICE_W[device];
  const zoom = Math.min(1, (canvasW - (device === 'desktop' ? 0 : 48)) / (frameW + (device === 'desktop' ? 0 : 20)));

  /* ---------- runtime in the canvas (re-wired after edits settle) ---------- */
  const uses3d = !!site && site.sections.some(s => s.visible && (s.style.bg3d !== 'none' || (s.type === 'hero' && s.content.visual === '3d')));
  useEffect(() => { if (uses3d) ensureThree(); }, [uses3d]);
  useEffect(() => {
    if (!site) return;
    let cleanup: (() => void) | undefined;
    const t = window.setTimeout(() => {
      const root = canvasRef.current?.querySelector('.st-site') as HTMLElement | null;
      if (root && (window as any).MFStudio) cleanup = (window as any).MFStudio.init(root);
    }, 350);
    return () => { window.clearTimeout(t); cleanup?.(); };
  }, [site, playKey, device]);

  const replay = () => {
    setPlaying(true); setPlayKey(k => k + 1);
    canvasRef.current?.scrollTo({ top: 0 });
    window.setTimeout(() => setPlaying(false), 6000);
  };

  /* ---------- section ops ---------- */
  const sections = site?.sections || [];
  const selected = sections.find(s => s.id === selectedId) || null;
  const setSections = (next: Section[], coalesce = false) => site && update({ ...site, sections: next }, coalesce);
  const patchSection = (s: Section) => site && update({ ...site, sections: sections.map(x => (x.id === s.id ? s : x)) });
  const move = (id: string, d: number) => {
    const i = sections.findIndex(s => s.id === id), j = i + d;
    if (i < 0 || j < 0 || j >= sections.length) return;
    const n = [...sections]; [n[i], n[j]] = [n[j], n[i]]; setSections(n);
  };
  const duplicate = (id: string) => {
    const i = sections.findIndex(s => s.id === id); if (i < 0) return;
    const copy = { ...clone(sections[i]), id: uid('sec'), anchor: `${sections[i].anchor}-2`, label: `${sections[i].label} (نسخة)` };
    const n = [...sections]; n.splice(i + 1, 0, copy); setSections(n); setSelectedId(copy.id);
  };
  const remove = (id: string) => { setSections(sections.filter(s => s.id !== id)); if (selectedId === id) setSelectedId(null); };
  const addSection = (type: SectionType) => {
    const s = makeSection(type);
    const used = new Set(sections.map(x => x.anchor));
    let a = s.anchor, k = 2; while (used.has(a)) a = `${s.anchor}-${k++}`;
    s.anchor = a;
    const idx = selected ? sections.findIndex(x => x.id === selected.id) + 1 : Math.max(0, sections.findIndex(x => x.type === 'footer'));
    const n = [...sections]; n.splice(idx < 0 ? n.length : idx, 0, s); setSections(n);
    setSelectedId(s.id); setAddOpen(false);
    window.setTimeout(() => canvasRef.current?.querySelector(`[data-sid="${s.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  };
  const onDrop = (targetId: string) => {
    const from = dragId.current; dragId.current = null;
    if (!from || from === targetId) return;
    const n = [...sections]; const i = n.findIndex(s => s.id === from); const [item] = n.splice(i, 1);
    n.splice(n.findIndex(s => s.id === targetId), 0, item); setSections(n);
  };

  /* ---------- canvas clicks: select sections, keep links inside the preview ---------- */
  const onCanvasClick = (e: React.MouseEvent) => {
    const el = e.target as HTMLElement;
    const a = el.closest('a') as HTMLAnchorElement | null;
    const href = a?.getAttribute('href') || '';
    if (a && href.startsWith('#')) {
      e.preventDefault();
      if (interact) canvasRef.current?.querySelector(`[id="${CSS.escape(href.slice(1))}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (interact) return;
    if (a || el.closest('button, summary, input, select, textarea, label')) e.preventDefault();
    const sec = el.closest('[data-sid]') as HTMLElement | null;
    if (sec) setSelectedId(sec.dataset.sid || null);
  };
  const onCanvasSubmit = (e: React.FormEvent) => { if (!interact) e.preventDefault(); };

  /* ---------- sites ---------- */
  const createFrom = (tplId: string, name: string) => {
    const tpl = TEMPLATES.find(t => t.id === tplId)!;
    const s = tpl.build(name || undefined);
    saveSite(s); setSites(l => [s, ...l]); openSite(s); setGallery(false);
  };
  const duplicateSite = () => {
    if (!site) return;
    const s: Site = { ...clone(site), id: uid('site'), name: `${site.name} (نسخة)`, slug: `${site.slug}-copy`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    saveSite(s); setSites(l => [s, ...l]); openSite(s); flash('اتعملت نسخة من الموقع');
  };
  const removeSite = async (id: string) => {
    if (!window.confirm('متأكد إنك عايز تمسح الموقع ده؟ مش هينفع ترجّعه.')) return;
    await deleteSite(id);
    const rest = sites.filter(s => s.id !== id); setSites(rest);
    if (site?.id === id) { if (rest[0]) openSite(rest[0]); else { setSite(null); setGallery(true); } }
  };
  const exportHtml = async () => {
    if (!site) return;
    const { exportSiteHtml } = await import('../exportHtml');
    downloadFile(`${site.slug || 'site'}.html`, exportSiteHtml(site));
    flash('نزل الملف — ارفعه باسم index.html على جيت هب أو أي استضافة');
  };
  const exportJson = () => site && downloadFile(`${site.slug || 'site'}.medframe.json`, JSON.stringify(site, null, 2), 'application/json');
  const importJson = async (f?: File | null) => {
    if (!f) return;
    try {
      const data = JSON.parse(await f.text()) as Site;
      if (!data.sections || !data.theme) throw new Error('bad');
      const s = { ...data, id: uid('site'), updatedAt: new Date().toISOString() };
      await saveSite(s); setSites(l => [s, ...l]); openSite(s); flash('اتفتح الموقع من الملف');
    } catch { flash('الملف ده مش موقع من الاستوديو'); }
  };

  const fontLink = useMemo(() => (site ? fontsHref(site.theme) : ''), [site?.theme.fontDisplay, site?.theme.fontBody]);
  const outline = selectedId ? `.mf-canvas [data-sid="${selectedId}"]{outline:2px solid #35BDF2;outline-offset:-2px;}` : '';

  /* ================= render ================= */
  if (!loaded) return <div className="grid h-screen place-items-center bg-slate-950 text-sm text-slate-400" dir="rtl">جاري التحميل…</div>;

  return (
    <div className="flex h-screen flex-col bg-slate-100 text-slate-800" dir="rtl">
      <style>{siteCss}{`.mf-canvas [data-sid]{cursor:${interact ? 'auto' : 'pointer'};} .mf-canvas [data-sid]:hover{outline:${interact ? 'none' : '1.5px dashed rgba(53,189,242,.7)'};outline-offset:-2px;} ${outline}`}</style>
      {fontLink && <link rel="stylesheet" href={fontLink} />}

      {/* ---------- top bar ---------- */}
      <header className="z-30 flex h-14 shrink-0 items-center gap-2 border-b border-slate-800 bg-[#0B2D5C] px-3 text-white">
        <button onClick={onExit} className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] text-sky-100 hover:bg-white/10"><ArrowRight className="h-4 w-4" /> لوحة التحكم</button>
        <div className="mx-1 h-6 w-px bg-white/15" />
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#35BDF2] font-bold text-[#0B2D5C]">MF</span>
          <div className="leading-tight">
            <div className="text-[13px] font-bold">استوديو المواقع</div>
            <div className="text-[10.5px] text-sky-200/70">MedFrame Site Studio</div>
          </div>
        </div>
        {site && <SiteSwitcher site={site} sites={sites} onOpen={openSite} onNew={() => setGallery(true)} onRename={n => update({ ...site, name: n, slug: slugify(n) }, false)} onDuplicate={duplicateSite} onDelete={removeSite} />}
        <div className="flex-1" />
        {site && (
          <>
            <div className="flex items-center rounded-lg bg-white/10 p-0.5">
              {([['desktop', Monitor, 'كمبيوتر'], ['tablet', Tablet, 'تابلت'], ['mobile', Smartphone, 'موبايل']] as const).map(([d, I, l]) => (
                <button key={d} title={l} onClick={() => setDevice(d)} className={`cursor-pointer rounded-md p-1.5 ${device === d ? 'bg-white text-[#0B2D5C]' : 'text-sky-100 hover:bg-white/10'}`}><I className="h-4 w-4" /></button>
              ))}
            </div>
            <button title="رجوع (Ctrl+Z)" onClick={undo} disabled={!past.current.length} className="cursor-pointer rounded-lg p-2 text-sky-100 hover:bg-white/10 disabled:opacity-30"><Undo2 className="h-4 w-4" /></button>
            <button title="إعادة (Ctrl+Y)" onClick={redo} disabled={!future.current.length} className="cursor-pointer rounded-lg p-2 text-sky-100 hover:bg-white/10 disabled:opacity-30"><Redo2 className="h-4 w-4" /></button>
            <button onClick={() => setInteract(v => !v)} className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold ${interact ? 'bg-amber-400 text-slate-900' : 'text-sky-100 hover:bg-white/10'}`} title="جرّب الموقع كزائر: الأزرار والفورم والبحث بيشتغلوا">
              <MousePointerClick className="h-4 w-4" />{interact ? 'وضع الزائر' : 'جرّب كزائر'}
            </button>
            <button onClick={replay} className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-sky-100 hover:bg-white/10"><Play className="h-4 w-4" /> شغّل الحركة</button>
            <span className="hidden w-16 text-center text-[11px] text-sky-200/70 xl:block">{saved === 'saving' ? 'بيتحفظ…' : 'اتحفظ ✓'}</span>
            <ExportMenu onHtml={exportHtml} onJson={exportJson} onImport={() => importRef.current?.click()} />
            <input ref={importRef} type="file" accept="application/json,.json" hidden onChange={e => { importJson(e.target.files?.[0]); e.target.value = ''; }} />
          </>
        )}
      </header>

      {site ? (
        <div className="flex min-h-0 flex-1">
          {/* ---------- sections list ---------- */}
          <aside className="flex w-64 shrink-0 flex-col border-l border-slate-200 bg-white">
            <button onClick={() => setSelectedId(null)} className={`m-3 mb-2 flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-right text-[12.5px] font-semibold transition ${!selectedId ? 'border-sky-400 bg-sky-50 text-sky-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              <Settings2 className="h-4 w-4" /> الهوية وإعدادات الموقع
            </button>
            <div className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">الأقسام ({sections.length})</div>
            <ol className="flex-1 space-y-1 overflow-y-auto px-2 pb-3">
              {sections.map((s, i) => (
                <li key={s.id} draggable onDragStart={() => { dragId.current = s.id; }} onDragOver={e => e.preventDefault()} onDrop={() => onDrop(s.id)}
                  className={`group flex items-center gap-1 rounded-lg border px-1.5 py-1.5 transition ${selectedId === s.id ? 'border-sky-400 bg-sky-50' : 'border-transparent hover:bg-slate-50'}`}>
                  <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-slate-300" />
                  <button onClick={() => { setSelectedId(s.id); canvasRef.current?.querySelector(`[data-sid="${s.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className={`min-w-0 flex-1 cursor-pointer truncate text-right text-[12.5px] ${s.visible ? 'text-slate-700' : 'text-slate-400 line-through'}`}>{s.label}</button>
                  <div className="flex items-center opacity-0 transition group-hover:opacity-100">
                    <button title="لفوق" onClick={() => move(s.id, -1)} disabled={i === 0} className="cursor-pointer rounded p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
                    <button title="لتحت" onClick={() => move(s.id, 1)} disabled={i === sections.length - 1} className="cursor-pointer rounded p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
                    <button title="تكرار" onClick={() => duplicate(s.id)} className="cursor-pointer rounded p-0.5 text-slate-400 hover:text-slate-700"><Copy className="h-3.5 w-3.5" /></button>
                    <button title="حذف" onClick={() => remove(s.id)} className="cursor-pointer rounded p-0.5 text-slate-400 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <button title={s.visible ? 'اخفي' : 'اظهر'} onClick={() => patchSection({ ...s, visible: !s.visible })} className="cursor-pointer rounded p-0.5 text-slate-400 hover:text-slate-700">{s.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}</button>
                </li>
              ))}
            </ol>
            <div className="relative border-t border-slate-100 p-3">
              <button onClick={() => setAddOpen(o => !o)} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0B2D5C] py-2.5 text-[13px] font-bold text-white hover:bg-[#0d3770]"><Plus className="h-4 w-4" /> إضافة قسم</button>
              {addOpen && (
                <div className="absolute bottom-full right-3 z-40 mb-2 max-h-[70vh] w-[420px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
                  <div className="mb-2 flex items-center justify-between"><b className="text-[13px]">اختار نوع القسم</b><button onClick={() => setAddOpen(false)} className="cursor-pointer text-slate-400"><X className="h-4 w-4" /></button></div>
                  <p className="mb-3 text-[11.5px] text-slate-400">{selected ? `هيتضاف بعد «${selected.label}»` : 'هيتضاف قبل الفوتر'}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {SECTION_ORDER.map(t => (
                      <button key={t} onClick={() => addSection(t)} className="cursor-pointer rounded-xl border border-slate-200 p-3 text-right transition hover:border-sky-400 hover:bg-sky-50">
                        <div className="text-[12.5px] font-bold text-slate-800">{SECTION_DEFS[t].label}</div>
                        <div className="mt-0.5 text-[11px] leading-4 text-slate-400">{SECTION_DEFS[t].hint}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* ---------- canvas ---------- */}
          <main ref={canvasRef} className="mf-canvas relative isolate min-w-0 flex-1 overflow-y-auto bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px]" onClickCapture={onCanvasClick} onSubmitCapture={onCanvasSubmit}>
            <div className={`mx-auto ${device === 'desktop' ? '' : 'my-6 overflow-clip rounded-[28px] border-[10px] border-slate-900 shadow-2xl'}`} style={{ width: frameW, zoom }}>
              <SiteView key={playKey} site={site} mode="edit" animate={playing} />
            </div>
          </main>

          {/* ---------- inspector ---------- */}
          <aside className="w-[360px] shrink-0 border-r border-slate-200 bg-white">
            {selected
              ? <SectionInspector key={selected.id} section={selected} onChange={patchSection} onReplay={replay} />
              : <SiteInspector site={site} onChange={s => update(s)} />}
          </aside>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {gallery && <TemplateGallery canClose={!!site} onClose={() => setGallery(false)} onCreate={createFrom} />}
      {toast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2.5 text-[13px] font-medium text-white shadow-xl">{toast}</div>}
    </div>
  );
}

/* ---------------- top-bar pieces ---------------- */
function SiteSwitcher({ site, sites, onOpen, onNew, onRename, onDuplicate, onDelete }: { site: Site; sites: Site[]; onOpen: (s: Site) => void; onNew: () => void; onRename: (n: string) => void; onDuplicate: () => void; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(site.name);
  useEffect(() => setName(site.name), [site.name]);
  return (
    <div className="relative mr-3">
      {editing ? (
        <form onSubmit={e => { e.preventDefault(); onRename(name.trim() || site.name); setEditing(false); }} className="flex items-center gap-1">
          <input autoFocus value={name} onChange={e => setName(e.target.value)} className="w-56 rounded-lg bg-white/15 px-2.5 py-1.5 text-[13px] text-white outline-none ring-1 ring-white/30" />
          <button className="cursor-pointer rounded-lg p-1.5 hover:bg-white/10"><Check className="h-4 w-4" /></button>
        </form>
      ) : (
        <div className="flex items-center gap-1">
          <button onClick={() => setOpen(o => !o)} className="flex max-w-64 cursor-pointer items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[13px] font-semibold hover:bg-white/15">
            <span className="truncate">{site.name}</span><ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
          </button>
          <button title="غيّر الاسم" onClick={() => setEditing(true)} className="cursor-pointer rounded-lg p-1.5 text-sky-100 hover:bg-white/10"><Pencil className="h-3.5 w-3.5" /></button>
        </div>
      )}
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2 text-slate-800 shadow-2xl" onMouseLeave={() => setOpen(false)}>
          <button onClick={() => { setOpen(false); onNew(); }} className="mb-1 flex w-full cursor-pointer items-center gap-2 rounded-xl bg-sky-50 px-3 py-2.5 text-[12.5px] font-bold text-sky-800 hover:bg-sky-100"><LayoutTemplate className="h-4 w-4" /> موقع جديد من قالب</button>
          <div className="max-h-72 overflow-y-auto">
            {sites.map(s => (
              <div key={s.id} className={`group flex items-center gap-2 rounded-xl px-3 py-2 ${s.id === site.id ? 'bg-slate-100' : 'hover:bg-slate-50'}`}>
                <button onClick={() => { onOpen(s); setOpen(false); }} className="min-w-0 flex-1 cursor-pointer text-right">
                  <div className="truncate text-[12.5px] font-semibold">{s.name}</div>
                  <div className="text-[10.5px] text-slate-400">{TEMPLATES.find(t => t.kind === s.kind)?.name} · {new Date(s.updatedAt).toLocaleDateString('ar-EG')}</div>
                </button>
                <button title="حذف" onClick={() => onDelete(s.id)} className="cursor-pointer rounded p-1 text-slate-300 opacity-0 hover:text-rose-600 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
          <button onClick={() => { setOpen(false); onDuplicate(); }} className="mt-1 flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-[12.5px] text-slate-600 hover:bg-slate-50"><Copy className="h-4 w-4" /> اعمل نسخة من الموقع الحالي</button>
        </div>
      )}
    </div>
  );
}

function ExportMenu({ onHtml, onJson, onImport }: { onHtml: () => void; onJson: () => void; onImport: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#35BDF2] px-3.5 py-1.5 text-[12.5px] font-bold text-[#0B2D5C] hover:brightness-105"><Download className="h-4 w-4" /> تصدير</button>
      {open && (
        <div className="absolute left-0 top-full z-40 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 text-slate-800 shadow-2xl" onMouseLeave={() => setOpen(false)}>
          <MenuItem icon={Download} title="تنزيل الموقع (HTML)" text="ملف واحد جاهز للرفع على جيت هب أو أي استضافة" onClick={() => { setOpen(false); onHtml(); }} />
          <MenuItem icon={FileJson} title="حفظ نسخة للتعديل (JSON)" text="تفتحها تاني في الاستوديو على أي جهاز" onClick={() => { setOpen(false); onJson(); }} />
          <MenuItem icon={Upload} title="فتح نسخة محفوظة" text="ارفع ملف JSON من الاستوديو" onClick={() => { setOpen(false); onImport(); }} />
        </div>
      )}
    </div>
  );
}
function MenuItem({ icon: I, title, text, onClick }: { icon: React.ComponentType<any>; title: string; text: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 text-right hover:bg-slate-50">
      <I className="mt-0.5 h-4 w-4 text-sky-600" />
      <div><div className="text-[12.5px] font-bold">{title}</div><div className="text-[11px] text-slate-400">{text}</div></div>
    </button>
  );
}

function TemplateGallery({ onCreate, onClose, canClose }: { onCreate: (tpl: string, name: string) => void; onClose: () => void; canClose: boolean }) {
  const [tpl, setTpl] = useState(TEMPLATES[0].id);
  const [name, setName] = useState('');
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm" dir="rtl">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">موقع جديد</h2>
          {canClose && <button onClick={onClose} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>}
        </div>
        <p className="mb-5 text-[13px] text-slate-500">اختار قالب تبدأ منه. كل قسم بعد كده تقدر تغيّر كلامه وصوره وألوانه وحركته براحتك.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setTpl(t.id)} className={`cursor-pointer overflow-hidden rounded-2xl border-2 text-right transition ${tpl === t.id ? 'border-sky-500 shadow-lg shadow-sky-500/10' : 'border-slate-200 hover:border-slate-300'}`}>
              <div className="relative h-24" style={{ background: `linear-gradient(135deg, ${t.swatch[0]}, ${t.swatch[1]})` }}>
                <span className="absolute bottom-3 left-3 h-9 w-9 rounded-full border-4 border-white/80" style={{ background: t.swatch[2] }} />
                <div className="absolute right-4 top-4 h-2 w-24 rounded-full bg-white/50" /><div className="absolute right-4 top-8 h-2 w-16 rounded-full bg-white/30" />
              </div>
              <div className="p-4"><div className="text-[14px] font-bold text-slate-900">{t.name}</div><div className="mt-1 text-[12px] leading-5 text-slate-500">{t.description}</div></div>
            </button>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="اسم المكان (مثال: مركز الأمل الطبي)" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-[14px] outline-none focus:border-sky-400" />
          <button onClick={() => onCreate(tpl, name.trim())} className="cursor-pointer rounded-xl bg-[#0B2D5C] px-6 py-3 text-[14px] font-bold text-white hover:bg-[#0d3770]">ابدأ التصميم</button>
        </div>
      </div>
    </div>
  );
}
