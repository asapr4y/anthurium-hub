# Anthurium Hub

A responsive resource hub for **Anthurium Unit · Jackfruit NBO**, with a red-and-white interface and the supplied unit and branch logos.

## Run locally

Requires Node.js 22 or later. The app has no runtime dependencies.

```sh
npm run dev
```

Open **http://localhost:5187**. On Windows PowerShell, use `npm.cmd` if the local script execution policy blocks `npm`.

## Build and preview

```sh
npm run build
npm start
```

Publish the contents of `dist/` on any static host. No backend, API keys, or environment variables are needed. The site uses hash-based navigation so routes work on basic static hosting. The bundled preview server binds to localhost.

## Deploy to Vercel

The repository includes `vercel.json` to build and publish this static site explicitly:

- Root Directory: repository root (the directory containing `package.json` and `vercel.json`).
- Framework Preset: Other.
- Build Command: `npm run build`.
- Output Directory: `dist`.

Commit and push the configuration, then deploy that commit. For an existing Vercel project, confirm its Root Directory points to this repository root. The build command and output directory are supplied by `vercel.json`; no environment variables or running Node server are required in production.

A successful build should publish `dist/index.html`, `dist/src/`, and `dist/assets/`. Publishing `public/` instead leaves the home page missing because that directory contains only assets. This can cause Vercel's `404 NOT_FOUND` even when a deployment appears successful. The site's `#` routes are handled in the browser and require no catch-all rewrite.

## Add approved resource links

Edit **`src/resource-links.js`**. Each key identifies one external destination, for example:

```js
"product-guides-1": "https://example.com/product-guides",
"amendments-1": "https://example.com/sample-aoa-form",
```

Leave a value as `null` to show **Link coming soon** for that specific destination. Setting an `https://` URL activates the link. Inline URLs in scripts resolve from the same configuration, so the displayed and copied message update together. A pending link does not block reading the guide.

## Copied information

The hub includes **43 source topics**, with the complete procedures, original notes, contact references, email subject formats, six prospecting scripts, and 12 instructional images from the reference site. This includes the original Sun Life, branch, and named-contact references within the instructions; these have not been replaced by generic summaries or invented Anthurium contact details. The site identity uses Anthurium Unit and Jackfruit NBO.

Full article content is in `src/reference-content.js`. `src/data.js` joins it to the future link configuration and defines navigation and search. Source text is preserved except that external URLs are represented by configurable link slots. Original paragraphs, including source spelling and wording, remain intact.

`tests/fixtures/reference-content.json` retains the extracted source entries for coverage and fidelity checks. `scripts/import-reference.py` can regenerate article content from the reviewed Canva bootstrap export. Original document images are stored locally under `public/assets/reference/`; the production build does not include the test fixture.

## Working interactions

- Global keyword search, including acronyms; `/` focuses search.
- Category navigation and shareable search routes. The hero links directly to the category directory; there is no separate all-resources view or format filter.
- Full readable article pages, including all original instructions, notes, and reference images.
- Complete prospecting scripts with a copy-message action.
- Clearly labeled pending external links; the information itself is available now.
- Mobile navigation with an accessible menu disclosure and Escape handling.
- Skip navigation, visible keyboard focus, reduced-motion support, and readable status text.

This is a static reference site. It has no hub accounts, database, bookmarks, progress tracking, or interactive checklists. It does not read or write browser storage. Account setup instructions within the copied guides refer to the insurer's external platforms, not to accounts on this hub.

## Validation

```sh
npm install
npm test
npm run test:e2e
```

End-to-end checks use the installed Chrome browser in isolated, headless sessions. They cover desktop and mobile layouts, full procedure and script rendering, source images, navigation, search, operation with browser storage disabled, pending links, and automated axe accessibility scans. Data tests compare every source body entry with the imported content to catch missing or summarized information. Automated scans do not replace testing with users and assistive technology.

## Design reference

The structure draws on the reviewed Royal Citrine resource hub. The UI applies hierarchy, consistent layout, descriptive actions, accessible interactions, and responsive design from the user-supplied [UX Pilot web design principles article](https://uxpilot.ai/blogs/web-design-principles). Original logo files are preserved under `public/assets/`.

The visual direction applies the user's [de-slopify article](https://uxdesign.cc/how-to-de-slopify-your-designs-4c40c57c1dc9): choose a deliberate aesthetic and keep interface elements useful. The welcome hero prominently displays the supplied Anthurium logo with red, white, and warm neutral surfaces. The homepage uses short task summaries and one link per category; full information stays inside the guides. Readable type, clear hover and focus states, and generous clickable areas support browsing without account or tracking features.

Headings use **Manrope** and reading text uses **Source Sans 3**. The variable WOFF2 fonts and their SIL Open Font Licenses are stored in `public/assets/fonts/`. Fonts are self-hosted, use `font-display: swap`, and require no external font requests at runtime. Source Sans 3's additional Latin subset includes the Philippine peso symbol used in the copied scripts. Hover motion respects reduced-motion preferences.

The hero includes original SVG anthurium illustrations: two red blooms and one ivory bloom, with stems, leaves, petal veins, and golden spadices. On the first homepage visit after each page load, the stems draw upward and the flowers unfold around the unit emblem in a finite sequence lasting approximately 2.4 seconds. The artwork then rests; it does not loop or replay during internal navigation. Text and links remain usable throughout. Reduced-motion settings show the complete, static composition immediately. This uses CSS and SVG with no animation library, video, persistent storage, or added external requests.

The hero combines a warm ivory surface, a curved crimson backdrop, larger botanical illustrations, and the gold emblem without its original black poster background. `public/assets/anthurium-unit-transparent.png` was extracted using the built-in image-generation tool; the source remains untouched. The exact edit prompt is recorded in `scripts/hero-logo-edit-prompt.txt`. The header uses the same crest-only red-circle artwork as the favicon, with the 180px export keeping it sharp on high-density screens. On mobile, the headline and resource actions precede the floral scene so users can navigate without waiting for the animation or scrolling past the artwork.

The favicon uses the gold crest without lettering on a red circle. Its built-in image edit is recorded in `scripts/favicon-edit-prompt.txt`; the master is `public/assets/anthurium-crest-red.png`. Browser exports are `favicon-32.png`, `favicon-64.png`, and `apple-touch-icon.png` under the same assets directory. To regenerate those sizes from the master, run `node scripts/export-favicon.mjs` (development only, requires Chrome). Old `#library` links lead to the homepage category directory. Search results identify the topic category; format classifications are not shown or used as filters.
