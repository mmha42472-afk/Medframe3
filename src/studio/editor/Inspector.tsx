import React, { useState } from 'react';
import { Play } from 'lucide-react';
import type { AnimName, Bg3D, BgMode, DecorName, Section, SectionStyle, Site, SiteSettings, SiteTheme } from '../types';
import { FONTS, SECTION_DEFS } from '../schema';
import { ColorInput, Field, Group, ImageInput, Row, Segmented, Slider, Toggle, inputCls } from './controls';
import { mix } from '../utils';

/* ---------------- section inspector ---------------- */
export function SectionInspector({ section, onChange, onReplay }: { section: Section; onChange: (s: Section) => void; onReplay: () => void }) {
  const [tab, setTab] = useState<'content' | 'look' | 'motion'>('content');
  const def = SECTION_DEFS[section.type];
  const setC = (key: string, v: any) => onChange({ ...section, content: { ...section.content, [key]: v } });
  const setS = <K extends keyof SectionStyle>(key: K, v: SectionStyle[K]) => onChange({ ...section, style: { ...section.style, [key]: v } });
  const st = section.style;
  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-slate-100 px-4 pb-3 pt-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-sky-600">{def.label}</div>
        <input value={section.label} onChange={e => onChange({ ...section, label: e.target.value })} className={`${inputCls} text-[14px] font-bold`} aria-label="اسم القسم" />
        <Segmented value={tab} onChange={setTab} options={[{ value: 'content', label: 'المحتوى' }, { value: 'look', label: 'الشكل' }, { value: 'motion', label: 'الحركة و3D' }]} />
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === 'content' && (
          <div className="space-y-4 p-4">
            {def.fields.map(f => <Field key={f.key} def={f} value={section.content[f.key]} onChange={v => setC(f.key, v)} />)}
            <div className="space-y-3 rounded-xl bg-slate-50 p-3">
              <Row label="يظهر في قايمة الهيدر" inline><Toggle value={section.inNav} onChange={v => onChange({ ...section, inNav: v })} /></Row>
              <Row label="رابط القسم (#)" help="بيُستخدم في الأزرار: اكتب #هنا في أي زرار عشان يودّي للقسم ده.">
                <input dir="ltr" value={section.anchor} onChange={e => onChange({ ...section, anchor: e.target.value.replace(/[^\w-]/g, '') })} className={`${inputCls} font-mono`} />
              </Row>
            </div>
          </div>
        )}

        {tab === 'look' && (
          <>
            <Group title="الخلفية">
              <Segmented<BgMode> value={st.bgMode} onChange={v => setS('bgMode', v)} options={[
                { value: 'default', label: 'افتراضي' }, { value: 'solid', label: 'لون' }, { value: 'gradient', label: 'تدرّج' },
                { value: 'image', label: 'صورة' }, { value: 'glass', label: 'زجاج' }, { value: 'transparent', label: 'شفاف' },
              ]} />
              {(st.bgMode === 'solid' || st.bgMode === 'gradient' || st.bgMode === 'glass') && (
                <>
                  <Row label={st.bgMode === 'gradient' ? 'اللون الأول' : 'اللون'}><ColorInput value={st.bgColor} onChange={v => setS('bgColor', v)} /></Row>
                  {st.bgMode === 'gradient' && (
                    <>
                      <Row label="اللون التاني"><ColorInput value={st.bgColor2} onChange={v => setS('bgColor2', v)} /></Row>
                      <Row label="اتجاه التدرّج"><Slider value={st.bgAngle} min={0} max={360} step={5} unit="°" onChange={v => setS('bgAngle', v)} /></Row>
                    </>
                  )}
                  <Row label="الشفافية" help="100% لون كامل · كل ما تقلّل، خلفية الصفحة تبان أكتر."><Slider value={st.bgOpacity} min={0} max={100} unit="%" onChange={v => setS('bgOpacity', v)} /></Row>
                </>
              )}
              {st.bgMode === 'image' && (
                <>
                  <ImageInput value={st.bgImage} onChange={v => setS('bgImage', v)} />
                  <Row label="تغميق فوق الصورة"><Slider value={st.bgOverlay} min={0} max={90} unit="%" onChange={v => setS('bgOverlay', v)} /></Row>
                  <Row label="الصورة ثابتة والصفحة بتتحرك (بارالاكس)" inline><Toggle value={st.bgFixed} onChange={v => setS('bgFixed', v)} /></Row>
                </>
              )}
              <Row label="لون الكلام">
                <Segmented value={st.tone} onChange={v => setS('tone', v)} options={[{ value: 'auto', label: 'تلقائي' }, { value: 'light', label: 'فاتح' }, { value: 'dark', label: 'غامق' }]} />
              </Row>
              <QuickBgs onPick={(mode, c1, c2) => onChange({ ...section, style: { ...st, bgMode: mode, bgColor: c1, bgColor2: c2 || st.bgColor2, bgOpacity: 100 } })} />
            </Group>
            <Group title="حجم الكلام">
              <Row label="العناوين"><Slider value={Math.round(st.titleScale * 100)} min={60} max={180} step={5} unit="%" onChange={v => setS('titleScale', v / 100)} /></Row>
              <Row label="النصوص"><Slider value={Math.round(st.textScale * 100)} min={80} max={140} step={5} unit="%" onChange={v => setS('textScale', v / 100)} /></Row>
            </Group>
            <Group title="المسافات والترتيب">
              <Row label="المسافة فوق وتحت"><Segmented value={st.pad} onChange={v => setS('pad', v)} options={[{ value: 'none', label: '0' }, { value: 's', label: 'S' }, { value: 'm', label: 'M' }, { value: 'l', label: 'L' }, { value: 'xl', label: 'XL' }]} /></Row>
              <Row label="عرض المحتوى"><Segmented value={st.width} onChange={v => setS('width', v)} options={[{ value: 'narrow', label: 'ضيق' }, { value: 'normal', label: 'عادي' }, { value: 'wide', label: 'عريض' }, { value: 'full', label: 'كامل' }]} /></Row>
              <Row label="محاذاة الكلام"><Segmented value={st.align} onChange={v => setS('align', v)} options={[{ value: 'start', label: 'يمين' }, { value: 'center', label: 'وسط' }]} /></Row>
              <Row label="القسم كبلوك بحواف دائرية"><Segmented value={st.radius} onChange={v => setS('radius', v)} options={[{ value: 'theme', label: 'لأ' }, { value: 's', label: 'S' }, { value: 'm', label: 'M' }, { value: 'l', label: 'L' }, { value: 'xl', label: 'XL' }]} /></Row>
            </Group>
            <Group title="زخرفة الخلفية">
              <div className="grid grid-cols-4 gap-1.5">
                {([['none', 'بدون'], ['dots', 'نقط'], ['grid', 'شبكة'], ['glow', 'إضاءة'], ['aurora', 'أورورا'], ['rings', 'دواير'], ['grain', 'ملمس'], ['waves', 'موج']] as [DecorName, string][]).map(([v, l]) => (
                  <button key={v} type="button" onClick={() => setS('decor', v)} className={`cursor-pointer rounded-lg border px-1 py-2 text-[11.5px] font-medium transition ${st.decor === v ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>{l}</button>
                ))}
              </div>
            </Group>
            <Group title="الظهور" defaultOpen={false}>
              <Row label="اخفيه على الموبايل" inline><Toggle value={st.hideMobile} onChange={v => setS('hideMobile', v)} /></Row>
              <Row label="اخفيه على الكمبيوتر" inline><Toggle value={st.hideDesktop} onChange={v => setS('hideDesktop', v)} /></Row>
            </Group>
          </>
        )}

        {tab === 'motion' && (
          <>
            <Group title="حركة الظهور">
              <div className="grid grid-cols-2 gap-1.5">
                {([['none', 'بدون'], ['fade-up', 'تطلع لفوق'], ['fade', 'تظهر بهدوء'], ['zoom', 'تكبر'], ['slide', 'تيجي من الجنب'], ['blur', 'من ضباب'], ['flip', 'تقلب 3D']] as [AnimName, string][]).map(([v, l]) => (
                  <button key={v} type="button" onClick={() => setS('anim', v)} className={`cursor-pointer rounded-lg border px-2 py-2 text-[12px] font-medium transition ${st.anim === v ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>{l}</button>
                ))}
              </div>
              <Row label="العناصر تظهر واحدة ورا التانية" inline><Toggle value={st.stagger} onChange={v => setS('stagger', v)} /></Row>
              <Row label="السرعة"><Segmented value={st.speed} onChange={v => setS('speed', v)} options={[{ value: 'fast', label: 'سريعة' }, { value: 'normal', label: 'عادية' }, { value: 'slow', label: 'هادية' }]} /></Row>
              <button type="button" onClick={onReplay} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-[12.5px] font-bold text-white hover:bg-slate-800"><Play className="h-4 w-4" /> جرّب الحركة</button>
            </Group>
            <Group title="تأثيرات 3D">
              <Row label="الكروت بتميل مع الماوس (3D Tilt)" inline><Toggle value={st.tilt} onChange={v => setS('tilt', v)} /></Row>
              <Row label="العناصر العائمة بتطفو" inline><Toggle value={st.float} onChange={v => setS('float', v)} /></Row>
              <Row label="مجسم 3D متحرك ورا القسم">
                <select value={st.bg3d} onChange={e => setS('bg3d', e.target.value as Bg3D)} className={inputCls}>
                  <option value="none">بدون</option>
                  <option value="dna">شريط DNA</option>
                  <option value="orbs">كرات زجاجية وحلقات</option>
                  <option value="cells">نقطة دم وخلايا</option>
                  <option value="particles">سحابة نقاط</option>
                </select>
              </Row>
              {st.bg3d !== 'none' && <Row label="وضوح المجسم"><Slider value={st.bg3dOpacity} min={10} max={100} unit="%" onChange={v => setS('bg3dOpacity', v)} /></Row>}
              <p className="text-[11px] leading-5 text-slate-400">المجسمات بتاخد ألوان الهوية. على الموبايل بتبقى أخف تلقائيًا، وبتقف لو الزائر قافل الحركة من إعدادات جهازه.</p>
            </Group>
          </>
        )}
      </div>
    </div>
  );
}

function QuickBgs({ onPick }: { onPick: (mode: BgMode, c1: string, c2?: string) => void }) {
  const presets: [BgMode, string, string?][] = [
    ['solid', '#FFFFFF'], ['solid', '#F7F5F0'], ['solid', '#EEF6F4'], ['solid', '#F2F4FC'],
    ['gradient', '#06201E', '#0A3330'], ['gradient', '#141C57', '#1F2A7A'], ['gradient', '#0E1626', '#1E293B'], ['gradient', '#FFF7ED', '#FDE7C8'],
  ];
  return (
    <div className="space-y-1.5">
      <div className="text-[11px] font-semibold text-slate-400">خلفيات سريعة</div>
      <div className="grid grid-cols-8 gap-1.5">
        {presets.map(([m, a, b], i) => (
          <button key={i} type="button" onClick={() => onPick(m, a, b)} className="aspect-square cursor-pointer rounded-lg border border-slate-200 shadow-inner transition hover:scale-110"
            style={{ background: m === 'gradient' ? `linear-gradient(160deg, ${a}, ${b})` : a }} aria-label="خلفية سريعة" />
        ))}
      </div>
    </div>
  );
}

/* ---------------- site inspector (theme + settings) ---------------- */
const PALETTES: { name: string; t: Partial<SiteTheme> }[] = [
  { name: 'تركواز ودهبي', t: { primary: '#0F7B6C', primaryDark: '#0A5A4F', accent: '#E8A33D', ink: '#0E2B2A', muted: '#5E7472', paper: '#FBFAF7', night: '#06201E' } },
  { name: 'كحلي وأحمر', t: { primary: '#1F2A7A', primaryDark: '#141C57', accent: '#D7263D', ink: '#141B3D', muted: '#55607A', paper: '#FFFFFF', night: '#141C57' } },
  { name: 'MedFrame', t: { primary: '#1677D2', primaryDark: '#0B2D5C', accent: '#35BDF2', ink: '#172B45', muted: '#5A6B82', paper: '#F7FBFF', night: '#0B2D5C' } },
  { name: 'أزرق ملكي ودهبي', t: { primary: '#1E4E79', primaryDark: '#143657', accent: '#C9A227', ink: '#14202E', muted: '#5A6573', paper: '#F7F5F0', night: '#0E1626' } },
  { name: 'وردي هادي', t: { primary: '#B4386B', primaryDark: '#82244B', accent: '#F2A65A', ink: '#2A1520', muted: '#6E5A63', paper: '#FFF8F6', night: '#2A1520' } },
  { name: 'أخضر طبيعي', t: { primary: '#2F7D4F', primaryDark: '#1E5535', accent: '#D9A441', ink: '#16261C', muted: '#5B6B60', paper: '#F7F8F2', night: '#13261A' } },
  { name: 'بنفسجي فخم', t: { primary: '#5B3FA8', primaryDark: '#3F2A7A', accent: '#F0B429', ink: '#1C1533', muted: '#625C73', paper: '#FAF8FF', night: '#1C1533' } },
  { name: 'أسود ودهبي', t: { primary: '#1F2937', primaryDark: '#0B0F17', accent: '#D4A64A', ink: '#111827', muted: '#5F6672', paper: '#FAFAF7', night: '#0B0F17' } },
];

export function SiteInspector({ site, onChange }: { site: Site; onChange: (s: Site) => void }) {
  const [tab, setTab] = useState<'brand' | 'settings'>('brand');
  const t = site.theme, s = site.settings;
  const setT = <K extends keyof SiteTheme>(k: K, v: SiteTheme[K]) => onChange({ ...site, theme: { ...t, [k]: v } });
  const setSt = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => onChange({ ...site, settings: { ...s, [k]: v } });
  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-slate-100 px-4 pb-3 pt-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-sky-600">الموقع كله</div>
        <p className="text-[12px] leading-5 text-slate-500">دوس على أي كلام في الصفحة واكتب على طول، ودوس على أي صورة عشان تغيّرها. ولما تختار قسم بيظهرله شريط فيه الترتيب والحجم والخلفية. هنا الإعدادات اللي بتسري على الموقع كله.</p>
        <Segmented value={tab} onChange={setTab} options={[{ value: 'brand', label: 'الهوية والألوان' }, { value: 'settings', label: 'التواصل والإعدادات' }]} />
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === 'brand' ? (
          <>
            <Group title="باليتات جاهزة">
              <div className="grid grid-cols-2 gap-2">
                {PALETTES.map(p => (
                  <button key={p.name} type="button" onClick={() => onChange({ ...site, theme: { ...t, ...p.t, pageBg: p.t.paper || t.pageBg } })}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-2 text-right text-[11.5px] font-medium text-slate-600 hover:border-sky-300">
                    <span className="flex -space-x-1.5 space-x-reverse">{[p.t.night, p.t.primary, p.t.accent].map((c, i) => <i key={i} className="h-5 w-5 rounded-full border-2 border-white" style={{ background: c }} />)}</span>
                    {p.name}
                  </button>
                ))}
              </div>
            </Group>
            <Group title="الألوان">
              <Row label="اللون الأساسي"><ColorInput value={t.primary} onChange={v => onChange({ ...site, theme: { ...t, primary: v, primaryDark: mix(v, '#000000', 0.28) } })} /></Row>
              <Row label="لون مميز (Accent)"><ColorInput value={t.accent} onChange={v => setT('accent', v)} /></Row>
              <Row label="لون الكلام"><ColorInput value={t.ink} onChange={v => setT('ink', v)} /></Row>
              <Row label="لون الكلام الثانوي"><ColorInput value={t.muted} onChange={v => setT('muted', v)} /></Row>
              <Row label="اللون الغامق (للبلوكات الغامقة)"><ColorInput value={t.night} onChange={v => setT('night', v)} /></Row>
              <Row label="لون الكروت"><ColorInput value={t.card} onChange={v => setT('card', v)} /></Row>
            </Group>
            <Group title="خلفية الصفحة">
              <Segmented value={t.pageBgMode} onChange={v => setT('pageBgMode', v)} options={[{ value: 'solid', label: 'لون' }, { value: 'gradient', label: 'تدرّج' }, { value: 'image', label: 'صورة' }]} />
              {t.pageBgMode !== 'image' && <Row label="اللون"><ColorInput value={t.pageBg} onChange={v => onChange({ ...site, theme: { ...t, pageBg: v, paper: v } })} /></Row>}
              {t.pageBgMode === 'gradient' && <Row label="اللون التاني"><ColorInput value={t.pageBg2} onChange={v => setT('pageBg2', v)} /></Row>}
              {t.pageBgMode === 'image' && <ImageInput value={t.pageBgImage} onChange={v => setT('pageBgImage', v)} />}
              <p className="text-[11px] leading-5 text-slate-400">الأقسام اللي خلفيتها «شفاف» أو «زجاج» بتبيّن خلفية الصفحة دي من وراها.</p>
            </Group>
            <Group title="الخطوط">
              <Row label="خط العناوين"><select value={t.fontDisplay} onChange={e => setT('fontDisplay', e.target.value)} className={inputCls}>{FONTS.map(f => <option key={f.family} value={f.family}>{f.label}</option>)}</select></Row>
              <Row label="خط النصوص"><select value={t.fontBody} onChange={e => setT('fontBody', e.target.value)} className={inputCls}>{FONTS.map(f => <option key={f.family} value={f.family}>{f.label}</option>)}</select></Row>
              <Row label="حجم الكلام في الموقع كله"><Slider value={t.baseSize} min={14} max={19} step={0.5} unit="px" onChange={v => setT('baseSize', v)} /></Row>
              <Row label="شكل الكلمات المميزة *هكذا*"><Segmented value={t.hlStyle} onChange={v => setT('hlStyle', v)} options={[{ value: 'color', label: 'لون' }, { value: 'gradient', label: 'تدرّج' }, { value: 'marker', label: 'هايلايت' }]} /></Row>
            </Group>
            <Group title="الحواف">
              <Row label="استدارة الكروت والأزرار"><Slider value={t.radius} min={0} max={36} unit="px" onChange={v => setT('radius', v)} /></Row>
            </Group>
          </>
        ) : (
          <>
            <Group title="التواصل">
              <Row label="رقم الواتساب (بالكود الدولي)" help="مثال: 201127298983 — كل أزرار wa: والفورم بتبعت عليه."><input dir="ltr" value={s.whatsapp} onChange={e => setSt('whatsapp', e.target.value.replace(/[^\d]/g, ''))} className={`${inputCls} font-mono`} placeholder="20…" /></Row>
              <Row label="رقم التليفون اللي بيظهر"><input dir="ltr" value={s.phone} onChange={e => setSt('phone', e.target.value)} className={`${inputCls} font-mono`} /></Row>
            </Group>
            <Group title="أزرار ثابتة">
              <Row label="زرار واتساب عائم" inline><Toggle value={s.floatingWhatsapp} onChange={v => setSt('floatingWhatsapp', v)} /></Row>
              <Row label="شريط تحت على الموبايل" inline><Toggle value={s.mobileBar} onChange={v => setSt('mobileBar', v)} /></Row>
              {s.mobileBar && (
                <>
                  <Row label="الزرار التاني في الشريط"><input value={s.mobileBarSecondaryLabel} onChange={e => setSt('mobileBarSecondaryLabel', e.target.value)} className={inputCls} /></Row>
                  <Row label="بيودي على"><input dir="ltr" value={s.mobileBarSecondaryHref} onChange={e => setSt('mobileBarSecondaryHref', e.target.value)} className={`${inputCls} font-mono`} /></Row>
                </>
              )}
            </Group>
            <Group title="شريط «نموذج مبدئي»">
              <Row label="إظهار الشريط فوق الموقع" inline><Toggle value={s.demoRibbon} onChange={v => setSt('demoRibbon', v)} /></Row>
              {s.demoRibbon && <Row label="النص" help="حط كلمة بين *نجمتين* عشان تتلوّن."><input value={s.demoRibbonText} onChange={e => setSt('demoRibbonText', e.target.value)} className={inputCls} /></Row>}
            </Group>
            <Group title="جوجل والمشاركة (SEO)">
              <Row label="عنوان الصفحة"><input value={s.metaTitle} onChange={e => setSt('metaTitle', e.target.value)} className={inputCls} /></Row>
              <Row label="وصف الصفحة"><textarea rows={3} value={s.metaDescription} onChange={e => setSt('metaDescription', e.target.value)} className={inputCls} /></Row>
              <Row label="اخفي الموقع من جوجل (noindex)" inline><Toggle value={s.noindex} onChange={v => setSt('noindex', v)} /></Row>
              <Row label="لغة الموقع"><Segmented value={s.lang} onChange={v => setSt('lang', v)} options={[{ value: 'ar', label: 'عربي' }, { value: 'en', label: 'English' }]} /></Row>
            </Group>
          </>
        )}
      </div>
    </div>
  );
}
