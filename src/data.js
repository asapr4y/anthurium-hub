import { referenceResources } from './reference-content.js';
import { resourceLinks } from './resource-links.js';

export const categories = [
  { id: 'guides', title: 'Guides & documents', short: 'Guides & documents', description: 'Access product and payment guides, as well as other important documents.', detail: 'Access product and payment guides, as well as other important documents.' },
  { id: 'new-business', title: 'New business', short: 'New business', description: 'Access New Business related guides and documents.', detail: 'Access New Business related guides and documents.' },
  { id: 'servicing', title: 'Policy servicing', short: 'Policy servicing', description: 'Access guide for policy servicing (requests, claims, etc.).', detail: 'Access guide for policy servicing (requests, claims, etc.).' },
  { id: 'learning', title: 'Recordings', short: 'Recordings', description: 'Access meeting and training recordings.', detail: 'Access meeting and training recordings.' },
  { id: 'tools', title: 'Important links', short: 'Important links', description: 'Access compilation of important links for our Sun Life business.', detail: 'Access compilation of important links for our Sun Life business.' },
  { id: 'scripts', title: 'Spiels', short: 'Spiels', description: 'Access sample spiels you can send to prospects.', detail: 'Access sample spiels you can send to prospects.' },
  { id: 'getting-started', title: 'Rookies guide', short: 'Rookies guide', description: 'Access important files and guides for rookies.', detail: 'Access important files and guides for rookies.' },
];

// Full source guides are available now; only outward link destinations are pending.
export const resources = referenceResources.map(resource => ({
  ...resource,
  blocks: resource.blocks.map(block => block.kind === 'link'
    ? { ...block, url: resourceLinks[block.linkKey] ?? null }
    : block),
}));

export function blockText(block) {
  return (block.text || '').replace(/\{\{link:([^}]+)\}\}/g, (_, key) =>
    validResourceUrl(resourceLinks[key]) ? resourceLinks[key] : '[Insert Link]');
}

export function getCategory(id) { return categories.find(category => category.id === id); }
export function searchResources(query, list = resources) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return list.filter(resource => {
    const text = `${resource.title} ${resource.description} ${getCategory(resource.category)?.title} ${resource.keywords.join(' ')} ${resource.blocks.map(block => blockText(block) || block.label || '').join(' ')}`.toLowerCase();
    return terms.every(term => text.includes(term));
  });
}
export function validResourceUrl(url) {
  if (!url) return false;
  try { return new URL(url).protocol === 'https:'; } catch { return false; }
}
