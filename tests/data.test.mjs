import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { categories, resources, getCategory, searchResources, validResourceUrl, blockText } from '../src/data.js';
import { resourceLinks } from '../src/resource-links.js';

test('every resource belongs to a category and has a unique stable ID', () => {
  assert.equal(new Set(resources.map(resource => resource.id)).size, resources.length);
  assert.equal(new Set(categories.map(category => category.id)).size, categories.length);
  for (const resource of resources) {
    assert.ok(getCategory(resource.category), resource.id);
    assert.ok(resource.title && resource.description && resource.blocks.length, resource.id);
    assert.ok(resource.url === null || validResourceUrl(resource.url), resource.id);
  }
});

test('only external links stay pending and unsafe destinations cannot activate', () => {
  for (const resource of resources) {
    for (const block of resource.blocks.filter(block => block.kind === 'link')) {
      assert.ok(Object.hasOwn(resourceLinks, block.linkKey), block.linkKey);
      assert.ok(block.url === null || validResourceUrl(block.url), block.linkKey);
    }
  }
  for (const unsafe of ['javascript:alert(1)', 'data:text/html,hello', 'http://example.com', '/relative', 'not a URL', null, '']) assert.equal(validResourceUrl(unsafe), false);
  assert.equal(validResourceUrl('https://example.com/approved-guide'), true);
});

test('search finds advisor acronyms and multiple keywords without case sensitivity', () => {
  assert.ok(searchResources('  aOa  ').some(resource => resource.id === 'amendments'));
  assert.ok(searchResources('CLIENT PAYMENT').some(resource => resource.id === 'payment-guides'));
  assert.ok(searchResources('rookie').some(resource => resource.category === 'getting-started'));
  assert.equal(searchResources('not-a-real-resource-09218').length, 0);
  assert.equal(searchResources('').length, resources.length);
});

test('all reference body text and instructional images are included without summaries', () => {
  const fixture = JSON.parse(readFileSync(new URL('./fixtures/reference-content.json', import.meta.url), 'utf8'));
  const entries = fixture.pages.slice(1).flatMap(page => page.sections.slice(1).flatMap(section => section.entries));
  const blocks = resources.flatMap(resource => resource.blocks);
  assert.equal(resources.length, 43);
  assert.deepEqual(new Set(blocks.map(block => block.sourceKey)), new Set(entries.map(entry => entry.sourceKey)));
  for (const entry of entries) {
    const matches = blocks.filter(block => block.sourceKey === entry.sourceKey);
    if (entry.kind === 'image') {
      const image = matches.find(block => block.kind === 'image');
      assert.ok(image, entry.sourceKey);
      assert.ok(existsSync(new URL(`../public${image.src}`, import.meta.url)), image.src);
    } else if (!matches.some(block => block.text)) {
      assert.ok(matches.some(block => block.kind === 'link'), entry.sourceKey);
    } else {
      const expected = entry.text.replace(/https?:\/\/[^\s]+/g, '[Insert Link]');
      assert.equal(blockText(matches.find(block => block.text)), expected, `Source text changed: ${entry.sourceKey}`);
    }
  }
  assert.equal(blocks.filter(block => block.kind === 'image').length, 12);
  assert.equal(blocks.filter(block => block.kind === 'script').length, 6);
});

test('full instructions and scripts are searchable, including content absent from titles', () => {
  assert.ok(searchResources('14 DAYS').some(resource => resource.id === 'loa-request'));
  assert.ok(searchResources('ADOBE ACROBAT').some(resource => resource.id === 'amendments'));
  assert.ok(searchResources('PAR Submission').some(resource => resource.id === 'policy-delivery'));
  assert.ok(searchResources('SAD').some(resource => resource.id === 'warm-cold-prospects'));
});
