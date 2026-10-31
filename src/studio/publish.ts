import type { Site } from './types';

/* ------------------------------------------------------------------
   Publish a Studio site straight from MedFrame to GitHub Pages.
   One commit writes the exported page to both public/sites/<slug>/
   (picked up by the Actions build) and docs/sites/<slug>/ (served by
   the branch build), so it goes live at <baseUrl>sites/<slug>/.
   ------------------------------------------------------------------ */

export interface PublishConfig { token: string; repo: string; branch: string; baseUrl: string }
const KEY = 'mf-studio-publish';

export const defaultPublishConfig = (): PublishConfig => ({
  token: '', repo: 'mmha42472-afk/Medframe3', branch: 'main', baseUrl: 'https://mmha42472-afk.github.io/Medframe3/',
});
export function loadPublishConfig(): PublishConfig {
  try { return { ...defaultPublishConfig(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return defaultPublishConfig(); }
}
export function savePublishConfig(c: PublishConfig) {
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* */ }
}

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/;
export function suggestSlug(site: Site) {
  const latin = (site.slug || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  return latin.length >= 3 ? latin.slice(0, 50) : `site-${site.id.slice(-6).toLowerCase().replace(/[^a-z0-9]/g, '')}`;
}
export const siteUrl = (c: PublishConfig, slug: string) => `${c.baseUrl.replace(/\/?$/, '/')}sites/${slug}/`;

function b64(str: string) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

const ERRORS: Record<number, string> = {
  401: 'التوكن غلط أو انتهت صلاحيته.',
  403: 'التوكن مالوش صلاحية كتابة على الريبو ده (محتاج Contents: Read and write).',
  404: 'الريبو أو الفرع مش موجود، أو التوكن مش شايفه.',
  409: 'حصل تعارض مع تعديل تاني على الريبو. جرّب تاني.',
  422: 'جيت هب رفض التعديل. جرّب تاني بعد دقيقة.',
};

async function gh(c: PublishConfig, path: string, init: RequestInit = {}) {
  const res = await fetch(`https://api.github.com/repos/${c.repo}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${c.token.trim()}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
  });
  if (!res.ok) {
    let msg = '';
    try { msg = (await res.json()).message || ''; } catch { /* */ }
    throw new Error(ERRORS[res.status] || `خطأ من جيت هب (${res.status}) ${msg}`);
  }
  return res.status === 204 ? null : res.json();
}

/** Write (or delete, when content is null) several files in a single commit. */
async function commitFiles(c: PublishConfig, files: { path: string; content: string | null }[], message: string) {
  const ref = await gh(c, `/git/ref/heads/${c.branch}`);
  const parent = ref.object.sha as string;
  const base = await gh(c, `/git/commits/${parent}`);
  const tree = [];
  for (const f of files) {
    if (f.content === null) { tree.push({ path: f.path, mode: '100644', type: 'blob', sha: null }); continue; }
    const blob = await gh(c, '/git/blobs', { method: 'POST', body: JSON.stringify({ content: b64(f.content), encoding: 'base64' }) });
    tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
  }
  const newTree = await gh(c, '/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: base.tree.sha, tree }) });
  const commit = await gh(c, '/git/commits', { method: 'POST', body: JSON.stringify({ message, tree: newTree.sha, parents: [parent] }) });
  await gh(c, `/git/refs/heads/${c.branch}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha }) });
  return commit.sha as string;
}

export async function checkAccess(c: PublishConfig) {
  const repo = await gh(c, '');
  if (!repo.permissions?.push) throw new Error(ERRORS[403]);
  return true;
}

export async function publishSite(c: PublishConfig, site: Site, slug: string, html: string) {
  if (!SLUG_RE.test(slug)) throw new Error('اسم اللينك لازم يكون حروف إنجليزي صغيرة وأرقام وشَرطة (-) بس.');
  const json = JSON.stringify(site);
  const files = ['public', 'docs'].flatMap(root => [
    { path: `${root}/sites/${slug}/index.html`, content: html },
    { path: `${root}/sites/${slug}/site.json`, content: json },
  ]);
  const sha = await commitFiles(c, files, `Publish studio site: ${slug}`);
  return { url: siteUrl(c, slug), sha };
}

export async function unpublishSite(c: PublishConfig, slug: string) {
  const files = ['public', 'docs'].flatMap(root => [
    { path: `${root}/sites/${slug}/index.html`, content: null },
    { path: `${root}/sites/${slug}/site.json`, content: null },
  ]);
  await commitFiles(c, files, `Unpublish studio site: ${slug}`);
}
