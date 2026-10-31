import React from 'react';
import type { Section, Site } from './types';
import { Icon, WhatsAppGlyph } from './icons';
import { isDark, isExternal, linkHref, mix, plain, rgba, rich, waHref } from './utils';

/* ==================================================================
   Renders a Site to plain markup (classes from site.css).
   Used live in the editor and with renderToStaticMarkup for export,
   so nothing here may depend on React state or effects.
   ================================================================== */

export type ViewMode = 'edit' | 'preview' | 'export';
interface Ctx { site: Site; nav: { label: string; href: string }[]; mode: ViewMode; v: number }

const radiusPx: Record<string, number> = { none: 0, s: 12, m: 22, l: 34, xl: 48 };

function pageColor(site: Site) {
  const t = site.theme;
  if (t.pageBgMode === 'gradient') return mix(t.pageBg, t.pageBg2, 0.5);
  if (t.pageBgMode === 'image') return '#111111';
  return t.pageBg;
}

/* ---------- small building blocks ---------- */
function anim(sec: Section, i = 0, extra: React.CSSProperties = {}) {
  const st = sec.style;
  if (st.anim === 'none') return Object.keys(extra).length ? { style: extra } : {};
  return { 'data-anim': st.anim, style: { ...extra, ['--d' as any]: st.stagger ? `${Math.min(i, 8) * 90}ms` : '0ms' } };
}

/* ---------- in-place editing ----------
   In the editor every text is tagged with data-edit="sectionId|key|index|subKey" and its raw value,
   so a click on the page turns it into an editable field (handled by the editor canvas). */
type EP = { ctx: Ctx; sec: Section; k: string; i?: number; sub?: string; as?: any; className?: string; style?: React.CSSProperties; r?: boolean; ml?: boolean; extra?: Record<string, any> };
function E({ ctx, sec, k, i, sub, as: Tag = 'span', className, style, r = false, ml = false, extra = {} }: EP) {
  const c = sec.content;
  const raw = i === undefined ? c[k] : sub === undefined ? c[k]?.[i] : c[k]?.[i]?.[sub];
  const text = raw == null ? '' : String(raw);
  if (!text) return null;
  const body = r ? rich(text) : text;
  if (ctx.mode !== 'edit') return <Tag className={className} style={style} {...extra}>{body}</Tag>;
  return (
    <React.Fragment key={ctx.v}>
      <Tag className={className} style={style} {...extra} data-edit={`${sec.id}|${k}|${i ?? ''}|${sub ?? ''}`} data-raw={text} data-ml={ml ? '1' : undefined}>{body}</Tag>
    </React.Fragment>
  );
}
/** data-img attribute so a click on an image (or its placeholder) in the editor replaces it */
const imgAttr = (ctx: Ctx, sec: Section, k: string, i?: number, sub?: string) =>
  ctx.mode === 'edit' ? { 'data-img': `${sec.id}|${k}|${i ?? ''}|${sub ?? ''}` } : {};

type Ed = { sec: Section; k: string; i?: number; sub?: string };
function Btn({ ctx, label, target, icon, variant = 'primary', block = false, sheen = false, ed }: { ctx: Ctx; label?: string; target?: string; icon?: string; variant?: 'primary' | 'accent' | 'ghost' | 'wa'; block?: boolean; sheen?: boolean; ed?: Ed }) {
  if (!label) return null;
  const href = linkHref(target, ctx.site.settings.whatsapp, ctx.site.settings.phone);
  const ext = isExternal(href);
  const isWa = (target || '').startsWith('wa');
  return (
    <a href={href} className={`st-btn is-${variant}${block ? ' is-block' : ''}${sheen ? ' st-sheen' : ''}`} {...(ext ? { target: '_blank', rel: 'noopener' } : {})}>
      {isWa && !icon ? <WhatsAppGlyph /> : icon ? <Icon name={icon} /> : null}
      {ed ? <E ctx={ctx} sec={ed.sec} k={ed.k} i={ed.i} sub={ed.sub} /> : label}
    </a>
  );
}

function Head({ sec, c, ctx }: { sec: Section; c: Record<string, any>; ctx: Ctx }) {
  if (!c.kicker && !c.title && !c.lead) return null;
  return (
    <div className="st-head" {...anim(sec, 0)}>
      <div>
        <E ctx={ctx} sec={sec} k="kicker" as="div" className="st-kicker" />
        <E ctx={ctx} sec={sec} k="title" as="h2" className="st-h2" r ml />
        <E ctx={ctx} sec={sec} k="lead" as="p" className="st-lead" ml />
      </div>
    </div>
  );
}
/** kicker + title + optional paragraph used inside bands, CTAs, text blocks */
function Copy({ sec, ctx, textKey, textClass = 'st-p' }: { sec: Section; ctx: Ctx; textKey?: string; textClass?: string }) {
  return (
    <>
      <E ctx={ctx} sec={sec} k="kicker" as="div" className="st-kicker" />
      <E ctx={ctx} sec={sec} k="title" as="h2" className="st-h2" r ml />
      {textKey && <E ctx={ctx} sec={sec} k={textKey} as="p" className={textClass} ml />}
    </>
  );
}

function ThreeLayer({ kind, site, still }: { kind: string; site: Site; still?: boolean }) {
  const t = site.theme;
  const [c1, c2] = kind === 'cells' ? [t.accent, t.primary] : [t.primary, t.accent];
  return <div className="st-3d" data-3d={kind} data-c1={c1} data-c2={c2} {...(still ? { 'data-still': '1' } : {})} />;
}

/* ---------- section shell: background, tone, spacing, decor, 3D ---------- */
function Shell({ sec, ctx, children, className = '', inner = true, as: Tag = 'section' as any }: { sec: Section; ctx: Ctx; children: React.ReactNode; className?: string; inner?: boolean; as?: any }) {
  const st = sec.style;
  const op = st.bgOpacity / 100;
  let bg: string | undefined;
  let toneColor = pageColor(ctx.site);
  let darkByImage = false;
  switch (st.bgMode) {
    case 'solid': bg = rgba(st.bgColor, op); if (op > 0.4) toneColor = st.bgColor; break;
    case 'gradient': bg = `linear-gradient(${st.bgAngle}deg, ${rgba(st.bgColor, op)}, ${rgba(st.bgColor2, op)})`; if (op > 0.4) toneColor = mix(st.bgColor, st.bgColor2, 0.5); break;
    case 'image': if (st.bgImage) { bg = `url("${st.bgImage}")`; darkByImage = st.bgOverlay >= 30; } break;
    case 'glass': bg = rgba(st.bgColor, Math.min(op, 0.75)); if (op > 0.5) toneColor = st.bgColor; break;
  }
  const dark = st.tone === 'light' ? true : st.tone === 'dark' ? false : (darkByImage || isDark(toneColor));
  const r = st.radius === 'theme' ? 0 : radiusPx[st.radius] ?? 0;
  const cls = [
    'st-sec', `st-s-${sec.type}`, `st-pad-${st.pad}`, `st-speed-${st.speed}`,
    st.align === 'center' ? 'st-center' : '', dark ? 'is-dark' : '', st.bgMode === 'glass' ? 'is-glass' : '',
    st.tilt ? 'st-tilt-on' : '', st.float ? 'st-floaty' : '', r ? 'st-boxed' : '',
    st.hideMobile ? 'st-hide-m' : '', st.hideDesktop ? 'st-hide-d' : '', className,
  ].filter(Boolean).join(' ');
  const style: Record<string, string | number> = {
    ['--ts']: st.titleScale, ['--xs']: st.textScale,
  };
  if (bg) style['--sec-bg'] = bg;
  if (st.bgMode === 'image' && st.bgImage) { style['--veil'] = st.bgOverlay / 100; if (st.bgFixed) style['--sec-attach'] = 'fixed'; }
  if (r) style['--sec-r'] = `${r}px`;
  if (st.bg3d !== 'none') style['--o3d'] = st.bg3dOpacity / 100;
  return (
    <Tag id={sec.anchor || undefined} className={cls} style={style as React.CSSProperties} data-sid={sec.id} data-bgmode={st.bgMode}>
      {st.bgMode === 'image' && st.bgImage && <div className="st-veil" aria-hidden="true" />}
      {st.decor !== 'none' && <div className={`st-decor st-decor-${st.decor}`} aria-hidden="true" />}
      {st.bg3d !== 'none' && <div className="st-3d-layer" aria-hidden="true"><ThreeLayer kind={st.bg3d} site={ctx.site} /></div>}
      {inner ? <div className={`st-in st-w-${st.width}`}>{children}</div> : children}
    </Tag>
  );
}

/* ================= sections ================= */

function Header({ sec, ctx }: { sec: Section; ctx: Ctx }) {
  const c = sec.content;
  return (
    <Shell sec={sec} ctx={ctx} as="header" className="st-header" inner={false}>
      <div className={`st-in st-w-${sec.style.width}`}>
        <div className="st-bar">
          <a href="#home" className="st-logo" aria-label={c.brand}>
            {c.logo ? <img className="st-logo-img" src={c.logo} alt={c.brand} {...imgAttr(ctx, sec, 'logo')} /> : <span className="st-logo-mark" {...imgAttr(ctx, sec, 'logo')}><Icon name={c.markIcon} /></span>}
            {(!c.logo || c.brand) && <span className="st-logo-name"><E ctx={ctx} sec={sec} k="brand" /><E ctx={ctx} sec={sec} k="tagline" as="small" /></span>}
          </a>
          {c.showNav && <nav className="st-nav" aria-label="أقسام الموقع">{ctx.nav.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}</nav>}
          <Btn ctx={ctx} label={c.ctaLabel} target={c.ctaTarget} variant="primary" ed={{ sec, k: 'ctaLabel' }} />
          {c.showNav && (
            <button type="button" className="st-burger" data-burger aria-label="القايمة" aria-expanded="false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>
          )}
        </div>
      </div>
      {c.showNav && (
        <nav className="st-drawer" aria-label="القايمة">
          {ctx.nav.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}
          <Btn ctx={ctx} label={c.ctaLabel} target={c.ctaTarget} variant="primary" block />
        </nav>
      )}
    </Shell>
  );
}

function Chips({ items, ctx, sec }: { items: any[]; ctx: Ctx; sec: Section }) {
  const list = (items || []).slice(0, 3);
  if (!list.length) return null;
  return (
    <div className="st-chips-layer">
      {list.map((ch, i) => (
        <div className="st-chip" key={i}>
          <span className="st-chip-ic"><Icon name={ch.icon} /></span>
          <div><E ctx={ctx} sec={sec} k="chips" i={i} sub="title" as="b" /><E ctx={ctx} sec={sec} k="chips" i={i} sub="text" /></div>
        </div>
      ))}
    </div>
  );
}

function Hero({ sec, ctx }: { sec: Section; ctx: Ctx }) {
  const c = sec.content;
  const visual = c.visual || 'none';
  const hasVisual = visual !== 'none' && !(visual === 'image' && !c.image && ctx.mode === 'export');
  return (
    <Shell sec={sec} ctx={ctx} className={`st-hero${hasVisual ? '' : ' is-noVisual'}${c.visualSide === 'start' ? ' is-visualStart' : ''}`}>
      <div className="st-grid">
        <div>
          {c.badge && (
            <span className="st-badge" {...anim(sec, 0)} {...(c.badgeHours ? { 'data-hours': c.badgeHours, 'data-open': c.badgeOpen, 'data-closed': c.badgeClosed } : {})}>
              <i aria-hidden="true" />
              {c.badgeHours ? <span><b data-open-label>{c.badgeOpen}</b> · <E ctx={ctx} sec={sec} k="badge" /></span> : <E ctx={ctx} sec={sec} k="badge" />}
            </span>
          )}
          <E ctx={ctx} sec={sec} k="title" as="h1" className="st-h1" r ml extra={anim(sec, 1)} />
          <E ctx={ctx} sec={sec} k="lead" as="p" className="st-lead" ml extra={anim(sec, 2)} />
          {(c.btn1Label || c.btn2Label) && (
            <div className="st-actions" {...anim(sec, 3)}>
              <Btn ctx={ctx} label={c.btn1Label} target={c.btn1Target} icon={c.btn1Icon} variant="primary" sheen ed={{ sec, k: 'btn1Label' }} />
              <Btn ctx={ctx} label={c.btn2Label} target={c.btn2Target} icon={c.btn2Icon} variant="ghost" ed={{ sec, k: 'btn2Label' }} />
            </div>
          )}
          {c.stats?.length > 0 && (
            <div className="st-stats-inline" {...anim(sec, 4)}>
              {c.stats.map((s: any, i: number) => <div key={i}><E ctx={ctx} sec={sec} k="stats" i={i} sub="value" as="b" extra={ctx.mode === 'edit' ? {} : { 'data-count': s.value }} /><E ctx={ctx} sec={sec} k="stats" i={i} sub="label" /></div>)}
            </div>
          )}
        </div>
        {hasVisual && (
          <div className="st-hero-visual" {...anim(sec, 2)}>
            {visual === 'art' && (
              <div className="st-art">
                <svg className="st-rings" viewBox="0 0 400 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                  <g fill="none" stroke="#fff">{[70, 110, 150, 190, 230].map((r, i) => <circle key={r} cx="200" cy="205" r={r} strokeOpacity={0.22 - i * 0.04} />)}</g>
                  <path className="st-pulse" d="M0 330 H130 L146 330 L158 300 L172 362 L186 312 L196 330 H400" fill="none" stroke={ctx.site.theme.accent} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="st-art-word"><E ctx={ctx} sec={sec} k="artWord" as="strong" /><E ctx={ctx} sec={sec} k="artSub" /></div>
              </div>
            )}
            {visual === 'image' && (
              <div className={`st-photo st-shape-${c.imageShape || 'arch'}`}>
                {c.image ? <img src={c.image} alt={plain(c.title)} {...imgAttr(ctx, sec, 'image')} /> : <div className="st-empty-media" style={{ height: '100%', border: 0 }} {...imgAttr(ctx, sec, 'image')}>اضغط هنا وارفع صورة</div>}
              </div>
            )}
            {visual === '3d' && (
              <div className="st-3d-hero">
                <ThreeLayer kind={c.threeKind || 'dna'} site={ctx.site} />
              </div>
            )}
            {visual === 'image' && c.imageShape !== 'circle' && c.imageShape !== 'blob' && <span className="st-photo-frame" aria-hidden="true" />}
            <Chips items={c.chips} ctx={ctx} sec={sec} />
          </div>
        )}
      </div>
      {c.quick?.length > 0 && (
        <div className="st-quick" style={{ ['--qcols' as any]: c.quick.length }} {...anim(sec, 5)}>
          {c.quick.map((q: any, i: number) => (
            <div className="st-quick-item" key={i}><Icon name={q.icon} /><div><E ctx={ctx} sec={sec} k="quick" i={i} sub="title" as="b" /><E ctx={ctx} sec={sec} k="quick" i={i} sub="text" /></div></div>
          ))}
          <Btn ctx={ctx} label={c.quickCta} target={c.btn1Target} variant="primary" ed={{ sec, k: 'quickCta' }} />
        </div>
      )}
    </Shell>
  );
}

function Marquee({ sec, ctx }: { sec: Section; ctx: Ctx }) {
  const c = sec.content;
  const items: string[] = (c.items || []).filter(Boolean);
  const row = [...items, ...items, ...items, ...items];
  return (
    <Shell sec={sec} ctx={ctx} inner={false}>
      <div className="st-marquee" aria-label={items.join('، ')}>
        <div className="st-marquee-track" style={{ ['--mq' as any]: `${c.speed || 30}s` }}>
          {row.map((t, i) => <span key={i} aria-hidden={i >= items.length || undefined} className={`st-mq-item ${c.variant === 'pills' ? 'st-mq-pill' : 'st-mq-big'}`}>{t}</span>)}
        </div>
      </div>
    </Shell>
  );
}

function Cards({ sec, ctx }: { sec: Section; ctx: Ctx }) {
  const c = sec.content;
  return (
    <Shell sec={sec} ctx={ctx}>
      <Head sec={sec} c={c} ctx={ctx} />
      <div className={`st-grid-cards st-cards-${c.variant}`} style={{ ['--cols' as any]: c.columns || 3 }}>
        {(c.items || []).map((it: any, i: number) => (
          <div key={i} {...anim(sec, i + 1)}>
            <article className="st-card" data-tilt>
              {it.image && <img className="st-card-img" src={it.image} alt={it.title} {...imgAttr(ctx, sec, 'items', i, 'image')} />}
              {c.showNumbers && c.variant !== 'numbered' && <span className="st-num">{String(i + 1).padStart(2, '0')}</span>}
              {c.variant === 'numbered'
                ? <span className="st-big-num">{String(i + 1).padStart(2, '0')}</span>
                : !it.image && <div className={`st-ic${c.solidIcons ? ' is-solid' : ''}`}><Icon name={it.icon} /></div>}
              <E ctx={ctx} sec={sec} k="items" i={i} sub="tag" className="st-tag" />
              <E ctx={ctx} sec={sec} k="items" i={i} sub="title" as="h3" className="st-h3" />
              <E ctx={ctx} sec={sec} k="items" i={i} sub="text" as="p" ml />
            </article>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function Highlight({ sec, ctx }: { sec: Section; ctx: Ctx }) {
  const c = sec.content;
  return (
    <Shell sec={sec} ctx={ctx}>
      <div className={`st-band${c.variant === 'flat' ? ' is-flat' : ''}`} {...anim(sec, 0)}>
        <div>
          <Copy sec={sec} ctx={ctx} textKey="text" />
          {c.btnLabel && <div className="st-actions"><Btn ctx={ctx} label={c.btnLabel} target={c.btnTarget} variant="accent" ed={{ sec, k: 'btnLabel' }} /></div>}
        </div>
        {c.image
          ? <img className="st-band-img" src={c.image} alt={plain(c.title)} {...imgAttr(ctx, sec, 'image')} />
          : <ul className="st-band-list">{(c.list || []).map((t: string, i: number) => t ? <li key={i} {...anim(sec, i + 1)}><Icon name={c.listIcon || 'check'} /><E ctx={ctx} sec={sec} k="list" i={i} /></li> : null)}</ul>}
      </div>
    </Shell>
  );
}

function TextImage({ sec, ctx }: { sec: Section; ctx: Ctx }) {
  const c = sec.content;
  return (
    <Shell sec={sec} ctx={ctx}>
      <div className={`st-ti${c.imageSide === 'start' ? ' is-imgStart' : ''}`}>
        <div {...anim(sec, 0)}>
          <Copy sec={sec} ctx={ctx} textKey="text" />
          {c.checks?.filter(Boolean).length > 0 && (
            <ul className="st-checks">{c.checks.map((t: string, i: number) => t ? <li key={i}><Icon name="check" /><E ctx={ctx} sec={sec} k="checks" i={i} /></li> : null)}</ul>
          )}
          {c.btnLabel && <div className="st-actions"><Btn ctx={ctx} label={c.btnLabel} target={c.btnTarget} variant="primary" ed={{ sec, k: 'btnLabel' }} /></div>}
        </div>
        <div className="st-ti-media" {...anim(sec, 1)}>
          {c.image
            ? <div className={`st-photo st-shape-${c.imageShape || 'rounded'}`} style={{ aspectRatio: c.imageShape === 'circle' ? '1' : '4 / 3.6' }}><img src={c.image} alt={plain(c.title)} {...imgAttr(ctx, sec, 'image')} /></div>
            : ctx.mode !== 'export' && <div className="st-empty-media" {...imgAttr(ctx, sec, 'image')}>اضغط هنا وارفع صورة</div>}
        </div>
      </div>
    </Shell>
  );
}

function Stats({ sec, ctx }: { sec: Section; ctx: Ctx }) {
  const c = sec.content;
  return (
    <Shell sec={sec} ctx={ctx}>
      <Head sec={sec} c={c} ctx={ctx} />
      <div className="st-stats" style={{ ['--cols' as any]: c.columns || 4 }}>
        {(c.items || []).map((s: any, i: number) => (
          <div key={i} className="st-stat" {...anim(sec, i + 1)}><E ctx={ctx} sec={sec} k="items" i={i} sub="value" as="b" extra={ctx.mode === 'edit' ? {} : { 'data-count': s.value }} /><E ctx={ctx} sec={sec} k="items" i={i} sub="label" /></div>
        ))}
      </div>
    </Shell>
  );
}

function Steps({ sec, ctx }: { sec: Section; ctx: Ctx }) {
  const c = sec.content;
  return (
    <Shell sec={sec} ctx={ctx}>
      <Head sec={sec} c={c} ctx={ctx} />
      <ol className={`st-steps${c.line ? ' is-line' : ''}`} style={{ ['--cols' as any]: c.columns || 4 }}>
        {(c.items || []).map((s: any, i: number) => (
          <li key={i} className="st-step" {...anim(sec, i + 1)}>
            <span className="st-step-n"><Icon name={s.icon} /><i>{i + 1}</i></span>
            <E ctx={ctx} sec={sec} k="items" i={i} sub="title" as="h3" className="st-h3" />
            <E ctx={ctx} sec={sec} k="items" i={i} sub="text" as="p" ml />
          </li>
        ))}
      </ol>
    </Shell>
  );
}

function initials(name: string) {
  const cleaned = String(name || '').replace(/^(د\.?|الدكتور|الدكتورة|Dr\.?)\s*/i, '').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const f = (w: string) => (w.startsWith('ال') && w.length > 2 ? w[2] : w[0]) || '';
  return parts.length >= 2 ? `${f(parts[0])}.${f(parts[parts.length - 1])}` : f(cleaned);
}

function Team({ sec, ctx }: { sec: Section; ctx: Ctx }) {
  const c = sec.content;
  return (
    <Shell sec={sec} ctx={ctx}>
      <Head sec={sec} c={c} ctx={ctx} />
      <div className="st-team" style={{ ['--cols' as any]: c.columns || 4 }}>
        {(c.items || []).map((m: any, i: number) => (
          <div key={i} {...anim(sec, i + 1)}>
            <article className="st-member" data-tilt>
              <div className="st-member-img" {...imgAttr(ctx, sec, 'items', i, 'photo')}>{m.photo ? <img src={m.photo} alt={m.name} /> : <span aria-hidden="true">{initials(m.name)}</span>}</div>
              <div className="st-member-body"><E ctx={ctx} sec={sec} k="items" i={i} sub="name" as="b" /><E ctx={ctx} sec={sec} k="items" i={i} sub="role" /><E ctx={ctx} sec={sec} k="items" i={i} sub="text" as="p" ml /></div>
            </article>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function Tests({ sec, ctx }: { sec: Section; ctx: Ctx }) {
  const c = sec.content;
  const cats: string[] = (c.categories || []).filter(Boolean);
  const wa = ctx.site.settings.whatsapp;
  return (
    <Shell sec={sec} ctx={ctx}>
      <div className="st-head" {...anim(sec, 0)}>
        <div>
          <Copy sec={sec} ctx={ctx} textKey="lead" textClass="st-lead" />
        </div>
        <div className="st-legend"><span><i />محتاج صيام</span><span><i className="is-no" />من غير صيام</span></div>
      </div>
      <div className="st-tests" data-tests {...anim(sec, 1)}>
        <div className="st-tests-bar">
          <label className="st-search">
            <span className="st-sr">ابحث عن تحليل</span>
            <Icon name="search" />
            <input type="search" data-tests-search placeholder={c.searchPlaceholder} />
          </label>
          {cats.length > 0 && (
            <div className="st-chips" role="group" aria-label="التصنيف">
              <button type="button" data-cat-btn="all" aria-pressed="true">الكل</button>
              {cats.map(cat => <button type="button" key={cat} data-cat-btn={cat} aria-pressed="false">{cat}</button>)}
            </div>
          )}
        </div>
        <ul aria-live="polite">
          {(c.items || []).map((t: any, i: number) => (
            <li key={i} className="st-test" data-cat={t.category} data-q={`${t.name} ${t.en} ${t.category}`}>
              <div><b>{t.name}</b>{t.en && <small className="ltr">{t.en}</small>}</div>
              <div><span className={`st-prep${t.fasting ? ' is-fast' : ''}`}><Icon name={t.fasting ? 'clock' : 'check'} />{t.prep}</span></div>
              <p>{t.note}</p>
            </li>
          ))}
        </ul>
        <div className="st-tests-empty">
          <p>{c.emptyText}</p>
          <a className="st-btn is-primary" data-ask data-base={`${waHref(wa)}?text=`} data-msg="عايز أسأل عن تحليل:" href={waHref(wa, 'عايز أسأل عن تحليل')} target="_blank" rel="noopener"><WhatsAppGlyph />{c.askLabel}</a>
        </div>
      </div>
    </Shell>
  );
}

function Packages({ sec, ctx }: { sec: Section; ctx: Ctx }) {
  const c = sec.content;
  return (
    <Shell sec={sec} ctx={ctx}>
      <Head sec={sec} c={c} ctx={ctx} />
      <div className="st-packs" style={{ ['--cols' as any]: c.columns || 3 }}>
        {(c.items || []).map((p: any, i: number) => (
          <div key={i} {...anim(sec, i + 1, { display: 'flex' })}>
            <article className={`st-pack${p.featured ? ' is-featured' : ''}`} data-tilt style={{ width: '100%' }}>
              {p.featured && p.flag && <span className="st-pack-flag">{p.flag}</span>}
              <div className="st-pack-head"><span className="st-ic"><Icon name={p.icon} /></span><E ctx={ctx} sec={sec} k="items" i={i} sub="name" as="h3" className="st-h3" /></div>
              <ul>{(p.items || []).filter(Boolean).map((x: string, k: number) => <li key={k}><Icon name="check" />{x}</li>)}</ul>
              {p.price && <div className="st-pack-price">{p.price} <small>{p.priceNote}</small></div>}
              {p.note && <p className="st-pack-note"><Icon name="clock" />{p.note}</p>}
              <Btn ctx={ctx} label={p.btnLabel} target={`wa:عايز أعرف تفاصيل ${p.name}`} variant={p.featured ? 'primary' : 'ghost'} block />
            </article>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function Gallery({ sec, ctx }: { sec: Section; ctx: Ctx }) {
  const c = sec.content;
  const items = (c.items || []).filter((g: any) => g.image || ctx.mode !== 'export');
  return (
    <Shell sec={sec} ctx={ctx}>
      <Head sec={sec} c={c} ctx={ctx} />
      <div className={`st-gallery${c.masonry ? ' is-masonry' : ''}`} style={{ ['--cols' as any]: c.columns || 3, ['--ratio' as any]: c.ratio || '4/3' }}>
        {items.map((g: any, i: number) => (
          <figure key={i} {...anim(sec, i + 1)}>
            {g.image ? <img src={g.image} alt={g.caption || ''} loading="lazy" {...imgAttr(ctx, sec, 'items', i, 'image')} /> : <div className="st-empty-media" style={{ height: '100%', border: 0 }} {...imgAttr(ctx, sec, 'items', i, 'image')}>اضغط وارفع صورة {i + 1}</div>}
            <E ctx={ctx} sec={sec} k="items" i={i} sub="caption" as="figcaption" />
          </figure>
        ))}
      </div>
    </Shell>
  );
}

function Cta({ sec, ctx }: { sec: Section; ctx: Ctx }) {
  const c = sec.content;
  return (
    <Shell sec={sec} ctx={ctx}>
      <div className={`st-cta${c.variant === 'outline' ? ' is-outline' : ''}`} {...anim(sec, 0)}>
        <div>
          <Copy sec={sec} ctx={ctx} textKey="text" />
        </div>
        <div className="st-actions">
          <Btn ctx={ctx} label={c.btnLabel} target={c.btnTarget} variant={c.variant === 'outline' ? 'primary' : 'accent'} sheen ed={{ sec, k: 'btnLabel' }} />
          <Btn ctx={ctx} label={c.btn2Label} target={c.btn2Target} variant="ghost" ed={{ sec, k: 'btn2Label' }} />
        </div>
      </div>
    </Shell>
  );
}

function Booking({ sec, ctx }: { sec: Section; ctx: Ctx }) {
  const c = sec.content;
  const steps = c.steps || [];
  const opts: string[] = (c.selectOptions || []).filter(Boolean);
  const times: string[] = (c.timeOptions || []).filter(Boolean);
  return (
    <Shell sec={sec} ctx={ctx}>
      <div className={`st-book${steps.length || c.title ? '' : ' is-solo'}`}>
        {(steps.length > 0 || c.title) && (
          <div {...anim(sec, 0)}>
            <Copy sec={sec} ctx={ctx} />
            <E ctx={ctx} sec={sec} k="lead" as="p" className="st-lead" style={{ marginTop: 10 }} ml />
            {steps.length > 0 && (
              <ol className="st-book-steps">
                {steps.map((s: any, i: number) => (
                  <li key={i} {...anim(sec, i + 1)}>
                    <span className="st-step-n"><Icon name={s.icon} /><i>{i + 1}</i></span>
                    <div><E ctx={ctx} sec={sec} k="steps" i={i} sub="title" as="h4" /><E ctx={ctx} sec={sec} k="steps" i={i} sub="text" as="p" /></div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
        <form className="st-form" data-book data-wa={ctx.site.settings.whatsapp} data-intro={c.intro} {...anim(sec, 1)}>
          <E ctx={ctx} sec={sec} k="formTitle" as="h3" />
          {c.modeToggle && (
            <>
              <input type="hidden" name="mode" data-label="النوع" defaultValue={c.modeA} />
              <div className="st-seg" data-seg="mode" role="group" aria-label="النوع">
                <button type="button" data-value={c.modeA} aria-pressed="true">{c.modeA}</button>
                <button type="button" data-value={c.modeB} aria-pressed="false">{c.modeB}</button>
              </div>
            </>
          )}
          <div className="st-row2">
            <label>الاسم<input name="name" data-label="الاسم" autoComplete="name" required placeholder="الاسم بالكامل" /></label>
            {c.modeToggle && c.areaField
              ? <label data-when={`mode=${c.modeA}`}>المنطقة<input name="area" data-label="المنطقة" placeholder="مثال: فيصل" /></label>
              : opts.length > 0 && <label>{c.selectLabel}<select name="choice" data-label={c.selectLabel}>{opts.map(o => <option key={o}>{o}</option>)}</select></label>}
          </div>
          {c.modeToggle && c.areaField && opts.length > 0 && (
            <label>{c.selectLabel}<select name="choice" data-label={c.selectLabel}>{opts.map(o => <option key={o}>{o}</option>)}</select></label>
          )}
          {c.notesLabel && <label>{c.notesLabel}<textarea name="notes" data-label={c.notesLabel} rows={3} /></label>}
          {times.length > 0 && <label>الميعاد المناسب<select name="time" data-label="الميعاد المناسب">{times.map(o => <option key={o}>{o}</option>)}</select></label>}
          <button type="submit" className="st-btn is-wa is-block"><WhatsAppGlyph />{c.submitLabel}</button>
          <p className="st-hint">هتتفتح محادثة واتساب والرسالة جاهزة، وانت اللي بتدوس إرسال.</p>
        </form>
      </div>
    </Shell>
  );
}

function Location({ sec, ctx }: { sec: Section; ctx: Ctx }) {
  const c = sec.content;
  const q = c.mapQuery || plain(c.address);
  const link = c.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  const phone = ctx.site.settings.phone;
  return (
    <Shell sec={sec} ctx={ctx}>
      <Head sec={sec} c={c} ctx={ctx} />
      <div className="st-loc">
        <dl className="st-loc-card" {...anim(sec, 1)}>
          <div className="st-loc-row"><Icon name="pin" /><div><dt>العنوان</dt><E ctx={ctx} sec={sec} k="address" as="dd" ml />{c.addressNote && <dd style={{ fontWeight: 400, fontSize: 14, color: 'var(--s-muted)' }}>{c.addressNote}</dd>}</div></div>
          {c.hours && <div className="st-loc-row"><Icon name="clock" /><div><dt>المواعيد</dt><E ctx={ctx} sec={sec} k="hours" as="dd" /></div></div>}
          {c.showPhone && phone && <div className="st-loc-row"><Icon name="phone" /><div><dt>الحجز والاستفسار</dt><dd><a className="st-phone" href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a></dd></div></div>}
        </dl>
        <div className="st-map" {...anim(sec, 2)}>
          {c.embed && q
            ? <iframe title="الخريطة" loading="lazy" src={`https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=16&output=embed`} />
            : (
              <svg className="st-map-art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <g stroke="var(--s-line)" strokeWidth="16" fill="none" strokeLinecap="round"><path d="M-10 80 L410 120" /><path d="M-10 220 L410 190" /><path d="M120 -10 L150 310" /><path d="M300 -10 L268 310" /></g>
                <circle cx="212" cy="140" r="34" fill="var(--a)" opacity=".18" />
                <path d="M212 104 C212 104 194 126 194 138 a18 18 0 0 0 36 0 C230 126 212 104 212 104Z" fill="var(--a)" />
              </svg>
            )}
          <a className="st-map-link" href={link} target="_blank" rel="noopener">افتح على خرائط جوجل <Icon name="nav" /></a>
        </div>
      </div>
    </Shell>
  );
}

function Faq({ sec, ctx }: { sec: Section; ctx: Ctx }) {
  const c = sec.content;
  return (
    <Shell sec={sec} ctx={ctx}>
      <div className={`st-faq${c.layout === 'stacked' ? ' is-stacked' : ''}`}>
        <div {...anim(sec, 0)}>
          <Copy sec={sec} ctx={ctx} />
          <E ctx={ctx} sec={sec} k="lead" as="p" className="st-lead" style={{ marginTop: 10 }} ml />
        </div>
        <div {...anim(sec, 1)}>
          {(c.items || []).map((f: any, i: number) => (
            <details key={i}>
              <summary><E ctx={ctx} sec={sec} k="items" i={i} sub="q" /><i aria-hidden="true">+</i></summary>
              <E ctx={ctx} sec={sec} k="items" i={i} sub="a" as="p" ml />
            </details>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function Footer({ sec, ctx }: { sec: Section; ctx: Ctx }) {
  const c = sec.content;
  return (
    <Shell sec={sec} ctx={ctx} as="footer" className="st-footer">
      <div className="st-foot">
        <div className="st-logo">
          <span className="st-logo-mark"><Icon name={ctx.site.sections.find(s => s.type === 'header')?.content.markIcon || 'stethoscope'} /></span>
          <span className="st-logo-name"><E ctx={ctx} sec={sec} k="brand" /><E ctx={ctx} sec={sec} k="text" as="small" /></span>
        </div>
        {c.showLinks && <nav className="st-foot-links">{ctx.nav.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}</nav>}
      </div>
      {(c.copyright || c.credit) && <div className="st-credit"><E ctx={ctx} sec={sec} k="copyright" /><E ctx={ctx} sec={sec} k="credit" /></div>}
    </Shell>
  );
}

const RENDER: Record<string, React.FC<{ sec: Section; ctx: Ctx }>> = {
  header: Header, hero: Hero, marquee: Marquee, cards: Cards, highlight: Highlight, textImage: TextImage, stats: Stats,
  steps: Steps, team: Team, tests: Tests, packages: Packages, gallery: Gallery, cta: Cta, booking: Booking,
  location: Location, faq: Faq, footer: Footer,
};

export function siteVars(site: Site): React.CSSProperties {
  const t = site.theme;
  const pageBg = t.pageBgMode === 'gradient'
    ? `linear-gradient(180deg, ${t.pageBg}, ${t.pageBg2})`
    : t.pageBgMode === 'image' && t.pageBgImage ? `url("${t.pageBgImage}") center / cover` : t.pageBg;
  return {
    ['--p' as any]: t.primary, ['--pd' as any]: t.primaryDark, ['--a' as any]: t.accent, ['--ink' as any]: t.ink,
    ['--muted' as any]: t.muted, ['--paper' as any]: t.paper, ['--card' as any]: t.card, ['--night' as any]: t.night,
    ['--r' as any]: `${t.radius}px`, ['--base' as any]: `${t.baseSize}px`,
    ['--fd' as any]: `'${t.fontDisplay}', 'IBM Plex Sans Arabic', system-ui, sans-serif`,
    ['--fb' as any]: `'${t.fontBody}', 'IBM Plex Sans Arabic', system-ui, sans-serif`,
    ['--page-bg' as any]: pageBg,
    ['--page-bg-attach' as any]: t.pageBgMode === 'image' ? 'fixed' : 'scroll',
  };
}

export function SiteView({ site, mode, animate, v = 0 }: { site: Site; mode: ViewMode; animate: boolean; v?: number }) {
  const visible = site.sections.filter(s => s.visible);
  const nav = visible.filter(s => s.inNav && s.anchor).map(s => ({ label: s.label, href: `#${s.anchor}` }));
  const ctx: Ctx = { site, nav, mode, v };
  const st = site.settings;
  const secondary = st.mobileBarSecondaryHref || '#location';
  return (
    <div className={`st-site${animate ? ' st-animate' : ''}`} dir={st.lang === 'en' ? 'ltr' : 'rtl'} lang={st.lang} data-hl={site.theme.hlStyle} style={siteVars(site)}>
      {st.demoRibbon && <div className="st-ribbon">{rich(st.demoRibbonText, '')}</div>}
      {visible.map(sec => {
        const R = RENDER[sec.type];
        return R ? <R key={sec.id} sec={sec} ctx={ctx} /> : null;
      })}
      {(st.mobileBar || st.floatingWhatsapp) && (
        <div className="st-floaters">
          {st.mobileBar && (
            <div className="st-mbar is-on">
              <a className="st-btn is-wa" href={waHref(st.whatsapp)} target="_blank" rel="noopener"><WhatsAppGlyph />واتساب</a>
              <a className="st-btn is-ghost" href={secondary} {...(isExternal(secondary) ? { target: '_blank', rel: 'noopener' } : {})}><Icon name="nav" />{st.mobileBarSecondaryLabel}</a>
            </div>
          )}
          {st.floatingWhatsapp && <a className="st-fab" href={waHref(st.whatsapp)} target="_blank" rel="noopener" aria-label="تواصل على واتساب"><WhatsAppGlyph /></a>}
        </div>
      )}
    </div>
  );
}
