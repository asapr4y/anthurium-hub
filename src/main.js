import { articlePage } from './articles.js';
import { categories, resources, getCategory, searchResources, blockText } from './data.js';
import { icon } from './icons.js';
import { heroBotanicals } from './botanicals.js';

const $ = (selector, scope = document) => scope.querySelector(selector);
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
let currentView = 'overview';
let query = '';
let menuOpen = false;
let toastTimer;
let heroHasPlayed = false;
const mobileQuery = window.matchMedia('(max-width: 1000px)');
const chapters = ['guides', 'new-business', 'servicing', 'getting-started', 'learning', 'tools', 'scripts'].map(getCategory);
const chapterPresentation = {
  guides: { icon: 'book', summary: 'Product, payment, and underwriting references.' },
  'new-business': { icon: 'briefcase', summary: 'Applications, requirements, and settlement.' },
  servicing: { icon: 'shield', summary: 'Policy delivery and ongoing client support.' },
  learning: { icon: 'play', summary: 'Catch up on team meetings and training.' },
  tools: { icon: 'link', summary: 'Your everyday platforms and planning tools.' },
  scripts: { icon: 'message', summary: 'Find the words for your next conversation.' },
};
const navLink = (id, label) => `<a href="#${id}" data-nav="${id}">${label}</a>`;

$('#app').innerHTML = `
  <header class="site-header">
    <div class="masthead">
      <a class="brand" href="#overview" aria-label="Anthurium Unit hub home"><img src="/assets/apple-touch-icon.png" alt="Anthurium Unit logo" width="64" height="64"><span><strong>Anthurium Unit</strong><span>Jackfruit NBO · Resource hub</span></span></a>
      <form class="search" role="search" id="search-form"><label class="sr-only" for="global-search">Search all resources</label>${icon('search')}<input type="search" id="global-search" placeholder="Search guides and scripts" autocomplete="off" maxlength="120"><button type="button" class="search-clear" id="clear-search" aria-label="Clear search" hidden>${icon('close')}</button><kbd aria-hidden="true">/</kbd></form>
      <img class="branch-logo" src="/assets/jackfruit-nbo.jpeg" alt="Jackfruit NBO logo" width="58" height="58">
      <button class="menu-toggle" id="menu-toggle" aria-label="Open navigation" aria-controls="site-nav" aria-expanded="false">${icon('menu')}<span>Menu</span></button>
    </div>
    <nav class="site-nav" id="site-nav" aria-label="Main navigation">${navLink('overview', 'Home')}${chapters.map(category => navLink(category.id, category.title)).join('')}</nav>
  </header>
  <main id="main" tabindex="-1"><div id="page-content"></div></main>
  <footer class="footer"><img class="footer-branch" src="/assets/jackfruit-nbo.jpeg" alt="Jackfruit NBO logo" width="44" height="44"><div><strong>Anthurium Unit</strong><span>Jackfruit NBO</span></div><p>“Heart to Serve, Courage to Win!”</p></footer>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
  <div class="sr-only" id="search-status" role="status" aria-live="polite" aria-atomic="true"></div>
`;

function resourceRow(resource, showCategory = false) {
  const category = getCategory(resource.category);
  return `<article class="resource-row"><a class="resource-row-main" href="#resource/${resource.id}" aria-label="${escape(resource.title)}"><span class="resource-row-copy"><span class="resource-title">${escape(resource.title)}</span>${showCategory ? `<span class="resource-meta">${escape(category.title)}</span>` : ''}</span><span class="resource-read" aria-hidden="true">Read ${icon('arrow')}</span></a></article>`;
}

function categorySection(category) {
  const list = resources.filter(resource => resource.category === category.id);
  const presentation = chapterPresentation[category.id];
  return `<section class="directory-section" aria-labelledby="chapter-${category.id}"><a class="category-link" href="#${category.id}" aria-labelledby="chapter-${category.id}"><div class="category-symbol">${icon(presentation.icon)}<span class="category-arrow">${icon('arrow')}</span></div><h3 id="chapter-${category.id}">${escape(category.title)}</h3><p>${presentation.summary}</p><span class="category-count">${list.length} ${category.id === 'scripts' ? 'scripts' : 'resources'}</span></a></section>`;
}

function overview() {
  return `<section class="home-intro" aria-label="Welcome to Anthurium Unit">
    <div class="home-intro-copy">
      <p class="section-label">ANTHURIUM UNIT · JACKFRUIT NBO</p>
      <h1>Find your way.<br> <span>Grow with us.</span></h1>
      <p class="intro-copy">Your one-stop space for growth, learning, and success. This hub is built to equip you with the tools and knowledge you need to thrive.</p>
      <div class="hero-actions">
        <a class="button button-primary" href="#directory">Find a resource ${icon('arrow')}</a>
        <a class="text-link" href="#getting-started">New to the unit? ${icon('arrow')}</a>
      </div>
    </div>
    <figure class="hero-art">
      <div class="hero-logo-frame"><img src="/assets/anthurium-unit-transparent.png" alt="Anthurium Unit emblem — Jackfruit NBO, since 2018" width="1254" height="1254" fetchpriority="high"></div>
      ${heroBotanicals()}
      <figcaption>Heart to Serve,<br> <strong>Courage to Win!</strong></figcaption>
    </figure>
  </section>
    <section class="directory" aria-labelledby="directory-heading"><div class="section-heading"><div><p class="section-label">YOUR RESOURCES</p><h2 id="directory-heading" tabindex="-1">What do you need today?</h2></div></div><section class="directory-section rookie-feature" aria-labelledby="chapter-getting-started"><a href="#getting-started" aria-labelledby="chapter-getting-started"><span class="rookie-symbol">${icon('sprout')}</span><div><h3 id="chapter-getting-started">A good place to begin.</h3><p>New to Anthurium? Get set up with the rookies guide.</p></div><span class="rookie-action">Open the guide ${icon('arrow')}</span></a></section><div class="directory-grid">${chapters.filter(category => category.id !== 'getting-started').map(categorySection).join('')}</div></section><p class="link-note">${icon('info')}The guides and scripts are ready to read. External links marked “Link coming soon” will be added later.</p>`;
}

function resourcePage(id) {
  const category = getCategory(id);
  const isSearch = id === 'search';
  const allList = category ? resources.filter(resource => resource.category === id) : resources;
  const list = isSearch ? searchResources(query, allList) : allList;
  const title = isSearch ? 'Search results' : category.title;
  const description = isSearch ? query ? `Results for “${escape(query)}”` : 'Search by topic, task, or keyword using the search bar above.' : category.detail;
  return `<section class="page-intro"><a class="back-link" href="#directory">${icon('arrow')} Resource directory</a><p class="section-label">${category ? 'UNIT RESOURCES' : 'ANTHURIUM UNIT'}</p><h1>${title}</h1><p>${description}</p></section>
    <section class="library-section" aria-labelledby="resource-list-heading"><div class="list-toolbar"><h2 id="resource-list-heading">${list.length} ${list.length === 1 ? 'resource' : 'resources'}</h2></div>${list.length ? `<div class="resource-list">${list.map(resource => resourceRow(resource, isSearch)).join('')}</div>` : '<div class="empty-state"><h2>No resources found.</h2><p>Try a different keyword, such as “payment”, “application”, or “training”.</p><button class="button button-outline" data-reset-search>Browse categories</button></div>'}</section><p class="link-note">${icon('info')}The information is available to read. Only external resource links are pending.</p>`;
}

function showToast(message) {
  const toast = $('#toast');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3200);
}

function render({ focus = false } = {}) {
  const activeResource = currentView.startsWith('resource/') ? resources.find(resource => resource.id === currentView.slice(9)) : null;
  $('#page-content').innerHTML = activeResource ? articlePage(activeResource) : currentView === 'overview' ? overview() : resourcePage(currentView);
  const hero = $('.home-intro');
  if (hero && !heroHasPlayed) {
    heroHasPlayed = true;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) hero.classList.add('hero-enter');
  }
  const category = getCategory(activeResource?.category || currentView);
  const name = activeResource ? activeResource.title : currentView === 'overview' ? 'Home' : currentView === 'search' ? 'Search results' : category?.title || 'Home';
  document.title = `${name} · Anthurium Unit`;
  document.querySelectorAll('[data-nav]').forEach(link => {
    const active = link.dataset.nav === (activeResource?.category || currentView);
    active ? link.setAttribute('aria-current', 'page') : link.removeAttribute('aria-current');
  });
  if (currentView === 'search') {
    const count = searchResources(query).length;
    $('#search-status').textContent = `${count} ${count === 1 ? 'resource' : 'resources'} found${query ? ` for ${query}` : ''}.`;
  }
  if (focus) { $('#main').focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }
}

function readRoute(focus = true) {
  const [route, params] = location.hash.slice(1).split('?');
  const directoryRoute = route === 'directory' || route === 'library';
  const allowed = ['overview', 'search', ...categories.map(category => category.id)];
  const validArticle = route?.startsWith('resource/') && resources.some(resource => resource.id === route.slice(9));
  currentView = allowed.includes(route) || validArticle ? route : 'overview';
  if (route === 'library') history.replaceState(null, '', '#directory');
  query = currentView === 'search' ? (new URLSearchParams(params).get('q') || '').slice(0, 120) : '';
  $('#global-search').value = query;
  $('#clear-search').hidden = !query;
  closeMenu(false);
  render({ focus: focus && !directoryRoute });
  if (directoryRoute) {
    const heading = $('#directory-heading');
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
}

function openMenu() {
  if (!mobileQuery.matches) return;
  menuOpen = true;
  $('#site-nav').hidden = false;
  $('#menu-toggle').setAttribute('aria-expanded', 'true');
  $('#menu-toggle').setAttribute('aria-label', 'Close navigation');
}

function closeMenu(restoreFocus = true) {
  const wasOpen = menuOpen;
  menuOpen = false;
  $('#site-nav').hidden = mobileQuery.matches;
  $('#menu-toggle').setAttribute('aria-expanded', 'false');
  $('#menu-toggle').setAttribute('aria-label', 'Open navigation');
  if (wasOpen && restoreFocus) $('#menu-toggle').focus();
}

document.addEventListener('click', event => {
  if (event.target.closest('.skip-link')) { event.preventDefault(); $('#main').focus(); return; }
  const copy = event.target.closest('[data-copy-script]');
  if (copy) {
    const resource = resources.find(item => item.id === copy.dataset.copyScript);
    const block = resource?.blocks[Number(copy.dataset.copyIndex)];
    if (block?.kind === 'script') {
      if (!navigator.clipboard?.writeText) { showToast('Select the message text and copy it. Automatic copying is unavailable in this browser.'); return; }
      navigator.clipboard.writeText(blockText(block)).then(() => showToast('Message copied. Personalize it before sending.'), () => showToast('Could not copy automatically. Select the message text and copy it.'));
    }
    return;
  }
  if (event.target.closest('[data-reset-search]')) {
    query = ''; $('#global-search').value = ''; $('#clear-search').hidden = true;
    location.hash = 'directory';
  }
  if (event.target.closest('a[href^="#"]') && menuOpen) {
    closeMenu(false);
    $('#main').focus({ preventScroll: true });
  }
});

function updateSearch() {
  closeMenu(false);
  const wasSearch = currentView === 'search';
  query = $('#global-search').value.trim().slice(0, 120);
  currentView = 'search';
  $('#clear-search').hidden = !$('#global-search').value;
  history[wasSearch ? 'replaceState' : 'pushState'](null, '', `#search${query ? `?q=${encodeURIComponent(query)}` : ''}`);
  render();
}
$('#global-search').addEventListener('input', updateSearch);
$('#search-form').addEventListener('submit', event => { event.preventDefault(); updateSearch(); $('#main').focus({ preventScroll: true }); });
$('#clear-search').addEventListener('click', () => { $('#global-search').value = ''; updateSearch(); $('#global-search').focus(); });
$('#menu-toggle').addEventListener('click', () => menuOpen ? closeMenu() : openMenu());
mobileQuery.addEventListener('change', () => closeMenu(false));
document.addEventListener('keydown', event => {
  if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.closest('input, textarea, select, [contenteditable]')) { event.preventDefault(); $('#global-search').focus(); }
  if (menuOpen && event.key === 'Escape') { event.preventDefault(); closeMenu(); }
});
window.addEventListener('hashchange', () => readRoute());
readRoute(false);
