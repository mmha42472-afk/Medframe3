import React, { useState } from 'react';
import { CheckCircle2, Copy, ExternalLink, Globe, KeyRound, Loader2, Trash2, X } from 'lucide-react';
import type { Site } from '../types';
import { PublishConfig, SLUG_RE, checkAccess, loadPublishConfig, publishSite, savePublishConfig, siteUrl, suggestSlug, unpublishSite } from '../publish';
import { inputCls } from './controls';

export function PublishDialog({ site, onClose, onPublished }: { site: Site; onClose: () => void; onPublished: (p: Site['publish'] | undefined) => void }) {
  const [cfg, setCfg] = useState<PublishConfig>(loadPublishConfig);
  const [slug, setSlug] = useState(site.publish?.slug || suggestSlug(site));
  const [busy, setBusy] = useState<'' | 'publish' | 'unpublish'>('');
  const [error, setError] = useState('');
  const [done, setDone] = useState<string>(site.publish?.url || '');
  const [showSetup, setShowSetup] = useState(!cfg.token);
  const [copied, setCopied] = useState(false);
  const set = <K extends keyof PublishConfig>(k: K, v: PublishConfig[K]) => setCfg(c => ({ ...c, [k]: v }));

  const doPublish = async () => {
    setError(''); setBusy('publish');
    try {
      if (!cfg.token.trim()) throw new Error('حط توكن جيت هب الأول.');
      await checkAccess(cfg);
      savePublishConfig(cfg);
      const { exportSiteHtml } = await import('../exportHtml');
      const { url } = await publishSite(cfg, site, slug, exportSiteHtml(site));
      // a previous address that changed name is removed so it doesn't stay online
      if (site.publish?.slug && site.publish.slug !== slug) { try { await unpublishSite(cfg, site.publish.slug); } catch { /* */ } }
      setDone(url); setShowSetup(false);
      onPublished({ slug, url, at: new Date().toISOString() });
    } catch (e: any) { setError(e?.message || 'حصلت مشكلة في النشر.'); }
    finally { setBusy(''); }
  };
  const doUnpublish = async () => {
    if (!site.publish?.slug || !window.confirm('الموقع هيتشال من على النت واللينك هيبطل يفتح. متأكد؟')) return;
    setError(''); setBusy('unpublish');
    try { await unpublishSite(cfg, site.publish.slug); setDone(''); onPublished(undefined); }
    catch (e: any) { setError(e?.message || 'حصلت مشكلة.'); }
    finally { setBusy(''); }
  };
  const copy = async () => { try { await navigator.clipboard.writeText(done); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* */ } };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm" dir="rtl">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><Globe className="h-5 w-5 text-sky-600" /> نشر الموقع</h2>
          <button onClick={onClose} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="اقفل"><X className="h-5 w-5" /></button>
        </div>
        <p className="mb-5 text-[13px] leading-6 text-slate-500">الموقع هيتنشر على لينك خاص بيه جوه MedFrame. أي تعديل بعد كده، دوس «نشر» تاني والتعديل يوصل للينك في دقيقة أو اتنين.</p>

        {done && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-[13px] font-bold text-emerald-800"><CheckCircle2 className="h-4 w-4" /> الموقع منشور</div>
            <div className="flex items-center gap-2">
              <a href={done} target="_blank" rel="noopener" dir="ltr" className="min-w-0 flex-1 truncate rounded-lg bg-white px-3 py-2 font-mono text-[12.5px] text-emerald-900 ring-1 ring-emerald-200 hover:underline">{done}</a>
              <button onClick={copy} className="cursor-pointer rounded-lg bg-white p-2 text-emerald-700 ring-1 ring-emerald-200" title="انسخ"><Copy className="h-4 w-4" /></button>
              <a href={done} target="_blank" rel="noopener" className="rounded-lg bg-white p-2 text-emerald-700 ring-1 ring-emerald-200" title="افتح"><ExternalLink className="h-4 w-4" /></a>
            </div>
            <p className="mt-2 text-[11.5px] text-emerald-700">{copied ? 'اتنسخ ✓' : 'لو فتحته على طول ولقيته مش شغال، استنى دقيقة أو اتنين وجرّب تاني.'}</p>
          </div>
        )}

        <label className="mb-1.5 block text-[12px] font-semibold text-slate-600">اسم اللينك (إنجليزي)</label>
        <div className="flex items-stretch overflow-hidden rounded-xl border border-slate-200 focus-within:border-sky-400" dir="ltr">
          <span className="flex items-center bg-slate-50 px-3 font-mono text-[11.5px] text-slate-400">…/sites/</span>
          <input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className="min-w-0 flex-1 px-3 py-2.5 font-mono text-[13px] outline-none" placeholder="alamal-center" />
        </div>
        <p className="mt-1.5 text-[11.5px] text-slate-400" dir="ltr">{siteUrl(cfg, slug || '…')}</p>
        {slug && !SLUG_RE.test(slug) && <p className="mt-1 text-[11.5px] text-rose-600">حروف إنجليزي صغيرة وأرقام وشَرطة بس، ومينفعش يبدأ أو يخلص بشَرطة.</p>}

        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <button onClick={() => setShowSetup(s => !s)} className="flex w-full cursor-pointer items-center justify-between text-[12.5px] font-bold text-slate-700">
            <span className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-slate-500" /> ربط جيت هب {cfg.token ? <span className="font-normal text-emerald-600">(متربط ✓)</span> : <span className="font-normal text-amber-600">(مرة واحدة بس)</span>}</span>
            <span className="text-slate-400">{showSetup ? 'إخفاء' : 'تعديل'}</span>
          </button>
          {showSetup && (
            <div className="mt-3 space-y-3">
              <ol className="list-decimal space-y-1 pr-4 text-[11.5px] leading-5 text-slate-500">
                <li>افتح <a className="text-sky-600 underline" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">صفحة توكن جديد على جيت هب</a>.</li>
                <li>في Repository access اختار <b>Only select repositories</b> واختار ريبو Medframe3.</li>
                <li>في Permissions خلي <b>Contents</b> = Read and write، واعمل Generate وانسخ التوكن هنا.</li>
              </ol>
              <input type="password" dir="ltr" value={cfg.token} onChange={e => set('token', e.target.value)} placeholder="github_pat_…" className={`${inputCls} font-mono`} autoComplete="off" />
              <p className="text-[11px] leading-5 text-slate-400">التوكن بيتحفظ في المتصفح ده بس، ومحدش غيرك بيشوفه.</p>
              <div className="grid grid-cols-2 gap-2">
                <input dir="ltr" value={cfg.repo} onChange={e => set('repo', e.target.value)} className={`${inputCls} font-mono`} title="الريبو" />
                <input dir="ltr" value={cfg.branch} onChange={e => set('branch', e.target.value)} className={`${inputCls} font-mono`} title="الفرع" />
              </div>
              <input dir="ltr" value={cfg.baseUrl} onChange={e => set('baseUrl', e.target.value)} className={`${inputCls} font-mono`} title="رابط الموقع" />
            </div>
          )}
        </div>

        {error && <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2.5 text-[12.5px] text-rose-700">{error}</p>}

        <div className="mt-5 flex items-center gap-2">
          <button onClick={doPublish} disabled={!!busy || !SLUG_RE.test(slug)} className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0B2D5C] py-3 text-[14px] font-bold text-white hover:bg-[#0d3770] disabled:cursor-not-allowed disabled:opacity-50">
            {busy === 'publish' ? <><Loader2 className="h-4 w-4 animate-spin" /> بيتنشر…</> : <><Globe className="h-4 w-4" /> {site.publish ? 'انشر التعديلات' : 'انشر الموقع'}</>}
          </button>
          {site.publish && (
            <button onClick={doUnpublish} disabled={!!busy} className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-3 text-[12.5px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50" title="شيل الموقع من على النت">
              {busy === 'unpublish' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} إلغاء النشر
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
