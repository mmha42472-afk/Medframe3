import { renderToStaticMarkup } from 'react-dom/server';
import type { Site } from './types';
import { SiteView } from './SiteView';
import { fontsHref } from './schema';
import { plain } from './utils';
import siteCss from './site.css?raw';
import runtimeJs from './runtime.js?raw';

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const esc = (s: string) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Build a single, self-contained HTML file for a site (ready for GitHub Pages or any host). */
export function exportSiteHtml(site: Site): string {
  const body = renderToStaticMarkup(<SiteView site={site} mode="export" animate />);
  const st = site.settings;
  const header = site.sections.find(s => s.type === 'header');
  const hero = site.sections.find(s => s.type === 'hero');
  const title = st.metaTitle || header?.content.brand || site.name;
  const desc = st.metaDescription || plain(hero?.content.lead) || '';
  const uses3d = /data-3d=/.test(body);
  return `<!doctype html>
<html lang="${st.lang}" dir="${st.lang === 'en' ? 'ltr' : 'rtl'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${st.noindex ? '<meta name="robots" content="noindex, nofollow">\n' : ''}<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta name="theme-color" content="${site.theme.primary}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fontsHref(site.theme)}" rel="stylesheet">
<style>
html { scroll-behavior: smooth; }
body { margin: 0; background: ${site.theme.pageBg}; }
${siteCss}
</style>
</head>
<body>
${body}
<script>${runtimeJs}</script>
<script>document.querySelectorAll('.st-site').forEach(function (r) { window.MFStudio.init(r); });</script>
${uses3d ? `<script type="module">import('${THREE_URL}').then(function (THREE) { window.__MF_THREE = THREE; window.dispatchEvent(new Event('mf-three')); }).catch(function () { document.documentElement.classList.add('no-3d'); });</script>\n` : ''}</body>
</html>
`;
}
