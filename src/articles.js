import { resources, getCategory, blockText, validResourceUrl } from './data.js';
import { icon } from './icons.js';

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function renderBlock(block, index, resource) {
  const text = escape(blockText(block));
  const source = `data-source-key="${escape(block.sourceKey)}"`;
  if (block.kind === 'link') {
    return `<div class="guide-link" ${source}>${validResourceUrl(block.url)
      ? `<a class="button button-primary" href="${escape(block.url)}" target="_blank" rel="noopener noreferrer">${escape(block.label)} ${icon('external')}<span class="sr-only"> (opens in a new tab)</span></a>`
      : `<div class="pending-link">${icon('clock')}<span><strong>${escape(block.label)}</strong><span>Link coming soon</span></span></div>`}</div>`;
  }
  if (block.kind === 'image') {
    return `<figure class="guide-figure" ${source}><a href="${escape(block.src)}" target="_blank" rel="noopener" aria-label="Open ${escape(block.alt)} in full size (new tab)"><img src="${escape(block.src)}" alt="${escape(block.alt)}" width="${block.width}" height="${block.height}" loading="lazy"></a><figcaption>Reference image <span>·</span> Select to view full size ${icon('external')}</figcaption></figure>`;
  }
  if (block.kind === 'heading') return `<h2 class="guide-heading" ${source}>${text}</h2>`;
  if (block.kind === 'note') return `<div class="guide-note" ${source}><p>${text}</p></div>`;
  if (block.kind === 'script') {
    return `<section class="script-section" aria-label="Message template" ${source}><div class="script-toolbar"><span>Message template</span><button class="button button-outline copy-script" data-copy-script="${resource.id}" data-copy-index="${index}">Copy message</button></div><div class="script-message" tabindex="0" aria-label="Message text">${text}</div></section>`;
  }
  return `<p class="guide-paragraph ${block.kind === 'step' ? 'guide-step' : ''}" ${source}>${text}</p>`;
}

export function articlePage(resource) {
  const category = getCategory(resource.category);
  const siblings = resources.filter(item => item.category === resource.category);
  return `<section class="article-header"><a class="back-link" href="#${resource.category}">${icon('arrow')} ${escape(category.title)}</a><h1>${escape(resource.title)}</h1></section>
    <div class="article-layout"><article class="guide-document" aria-label="${escape(resource.title)} content">${resource.blocks.map((block, index) => renderBlock(block, index, resource)).join('')}</article>
    <aside class="article-related"><nav class="related-nav" aria-label="More in ${escape(category.title)}"><h2>In this section</h2>${siblings.map(item => `<a href="#resource/${item.id}" ${item.id === resource.id ? 'aria-current="page"' : ''}>${escape(item.title)}</a>`).join('')}</nav></aside></div>`;
}
