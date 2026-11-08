import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DICT, INDUSTRIES } from '../src/i18n.js';
import { CONTACT } from '../src/config.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('reference composition keeps the WebGL canvas inside the mockup landscape', () => {
  assert.equal([...html.matchAll(/id="webgl"/g)].length, 1);
  assert.match(html, /class="landscape"><canvas id="webgl"/);
  assert.match(html, /<h1[^>]*>Clarity is <em>the new luxury\.<\/em><\/h1>/);
  assert.doesNotMatch(html, /id="cursor"|class="grain"/);
});

test('Vietnamese and English expose the same non-empty translation keys', () => {
  assert.deepEqual(Object.keys(DICT.vi).sort(), Object.keys(DICT.en).sort());
  for (const dictionary of Object.values(DICT)) {
    for (const [key, value] of Object.entries(dictionary)) {
      assert.equal(typeof value, 'string', key);
      assert.ok(value.trim(), key);
    }
  }
});

test('every translation marker in the page resolves in both languages', () => {
  const keys = [...html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(keys.length > 60);
  for (const key of keys) {
    assert.ok(DICT.vi[key], `Missing VI: ${key}`);
    assert.ok(DICT.en[key], `Missing EN: ${key}`);
  }
});

test('fragment navigation targets exist and page IDs are unique', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size);
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(ids.includes(id), `Missing #${id}`);
  }
});

test('contact URLs are empty or explicitly use a safe protocol', () => {
  for (const key of ['facebook', 'instagram', 'messenger', 'zalo']) {
    if (CONTACT[key]) assert.equal(new URL(CONTACT[key]).protocol, 'https:', key);
  }
  if (CONTACT.email) assert.match(CONTACT.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  for (const lang of ['vi', 'en']) {
    assert.ok(CONTACT.hours[lang]);
    assert.ok(CONTACT.area[lang]);
  }
});

test('industry lists are non-empty, unique and consistent across languages', () => {
  assert.equal(INDUSTRIES.vi.length, INDUSTRIES.en.length);
  for (const industries of Object.values(INDUSTRIES)) {
    assert.ok(industries.length > 0);
    assert.equal(new Set(industries).size, industries.length);
    assert.ok(industries.every((item) => item.trim()));
  }
});

test('contact form and mobile navigation include accessibility hooks', () => {
  assert.match(html, /id="burger"[^>]*aria-expanded="false"[^>]*aria-controls="menu"/);
  assert.match(html, /id="menu"[^>]*inert[^>]*aria-hidden="true"/);
  assert.match(html, /id="formNote"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(html, /id="briefText"[^>]*readonly/);
});
