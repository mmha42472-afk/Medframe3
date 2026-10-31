# MedFrame Site Studio

Full-screen builder at `#/studio` (admin only) for polyclinic, lab and doctor websites.

- **Templates** (`templates.ts`): مجمع عيادات · معمل تحاليل · عيادة دكتور · صفحة فاضية.
- **Sections** (`schema.ts`): 17 block types. Each has `content` (the fields shown in the inspector) and `style`
  (background colour / gradient / image / glass / transparent, text tone, title and text size, spacing, width,
  alignment, rounded block, decor, scroll animation, 3D tilt, floating, WebGL 3D layer, hide on mobile or desktop).
- **Rendering** (`SiteView.tsx` + `site.css`): one renderer for the live preview and the export. It is responsive
  through container queries, so the device switcher shows the real mobile and tablet layouts.
- **Runtime** (`runtime.js`): scroll reveal, count-up numbers, tilt, mobile menu, tests search, WhatsApp booking
  form, open-now badge and the three.js scenes (DNA, glass orbs, blood cells, particles).
- **Storage** (`storage.ts`): sites are saved in the browser (IndexedDB). «تصدير → JSON» moves a site to another
  device; «تصدير → HTML» downloads a single file ready for GitHub Pages or any host.

Text tricks: wrap a word in `*stars*` to highlight it. Button targets accept `wa:message`, `tel`, `#anchor` or a URL.
