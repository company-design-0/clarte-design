import { DICT, INDUSTRIES } from './i18n.js';
import { CONTACT } from './config.js';
import { initComparison } from './comparison.js';
import { completeIntro } from './loader.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------------- i18n ---------------- */
function readLanguage() {
  try { return localStorage.getItem('clarte-lang'); } catch { return null; }
}
let lang = readLanguage() === 'en' ? 'en' : 'vi';

function splitWords(el) {
  const text = el.textContent.trim();
  el.innerHTML = text
    .split(/\s+/)
    .map((w, i) => `<span class="w"><span style="--i:${i}">${w}</span></span>`)
    .join(' ');
}

function applyLang(next) {
  lang = next === 'en' ? 'en' : 'vi';
  const d = DICT[lang];
  document.documentElement.lang = lang;
  $$('[data-i18n]').forEach((el) => {
    const v = d[el.dataset.i18n];
    if (v != null) el.textContent = v;
  });
  $$('[data-i18n-html]').forEach((el) => {
    const v = d[el.dataset.i18nHtml];
    if (v != null) el.innerHTML = v;
  });
  $$('.split').forEach(splitWords);
  $$('.lang button').forEach((b) => b.classList.toggle('is-active', b.dataset.lang === lang));

  // marquee (duplicated for a seamless loop)
  const items = INDUSTRIES[lang].map((t) => `<span>${t}</span>`).join('');
  $('#marquee').innerHTML = items + items;

  // contact info
  $('#cHours').textContent = CONTACT.hours[lang];
  $('#cArea').textContent = CONTACT.area[lang];
  try { localStorage.setItem('clarte-lang', lang); } catch { /* Storage may be disabled. */ }
  $$('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  document.title = lang === 'vi' ? 'Clarté Design | Thiết kế web & app tinh gọn, sang trọng' : 'Clarté Design | Refined web & app design';
  $('#cEmail').textContent = CONTACT.email || d['contact.pending'];
  $('#cPhone').textContent = CONTACT.phone || d['contact.pending'];
  if (!CONTACT.email) {
    $('#formNote').textContent = d['form.demo'];
    $('#form button[type=submit] [data-i18n]').textContent = d['form.prepare'];
  }
  window.dispatchEvent(new Event('clarte:languagechange'));
}

$$('.lang button').forEach((b) => b.addEventListener('click', () => applyLang(b.dataset.lang)));

// static contact links
const email = $('#cEmail');
email.textContent = CONTACT.email;
if (CONTACT.email) email.href = `mailto:${CONTACT.email}`;
else email.removeAttribute('href');
const phone = $('#cPhone');
phone.textContent = CONTACT.phone;
if (CONTACT.zalo || CONTACT.phone) phone.href = CONTACT.zalo || `tel:${CONTACT.phone.replace(/\s/g, '')}`;
else phone.removeAttribute('href');
phone.target = '_blank';
phone.rel = 'noopener noreferrer';
[['#sFb', 'facebook'], ['#sIg', 'instagram'], ['#sMsg', 'messenger']].forEach(([selector, key]) => {
  const link = $(selector);
  if (CONTACT[key]) link.href = CONTACT[key];
  else link.hidden = true;
});
$('#year').textContent = new Date().getFullYear();

applyLang(lang);

/* ---------------- WebGL hero ---------------- */
let scene = null;
const canvas = $('#webgl');

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

async function bootScene() {
  if (!supportsWebGL()) {
    canvas.remove();
    return;
  }
  const { createScene } = await import('./scene.js');
  scene = createScene(canvas, { reducedMotion });
  onScroll();
}

/* ---------------- Loader ---------------- */
const loader = $('#loader');
const pageRegions = [$('#nav'), $('main'), $('.footer')];
const previousInert = pageRegions.map(region => region.inert);
pageRegions.forEach(region => { region.inert = true; });
document.body.classList.add('is-loading');
document.body.setAttribute('aria-busy', 'true');

function loaderAnimationsFinished() {
  // Flush style changes so newly started CSS transitions are included.
  getComputedStyle(loader).clipPath;
  return Promise.allSettled(loader.getAnimations({ subtree: true }).map(animation => animation.finished));
}

const assetsReady = Promise.allSettled([
  bootScene().catch(error => { canvas.hidden = true; console.warn('WebGL disabled:', error); }),
  Promise.race([document.fonts?.ready, new Promise(resolve => setTimeout(resolve, 2500))]),
]);
const holdMs = reducedMotion ? 0 : Number.parseFloat(getComputedStyle(loader).getPropertyValue('--loader-hold-ms')) || 0;

completeIntro({
  assetsReady,
  logoReady: loaderAnimationsFinished(),
  hold: () => new Promise(resolve => setTimeout(resolve, holdMs)),
  exit: async () => {
    loader.classList.add('is-done');
    await loaderAnimationsFinished();
    loader.hidden = true;
  },
  enter: () => {
    pageRegions.forEach((region, index) => { region.inert = previousInert[index]; });
    document.body.classList.remove('is-loading');
    document.body.setAttribute('aria-busy', 'false');
    document.body.classList.add('is-ready');
    initComparison($('#showcase'));
  },
});

/* ---------------- Scroll ---------------- */
const nav = $('#nav');
const stepsEl = $('#steps');
const stepsProgress = $('#stepsProgress');
let lastY = window.scrollY;
let ticking = false;

function onScroll() {
  const y = window.scrollY;
  const vh = window.innerHeight;
  const max = document.documentElement.scrollHeight - vh;

  nav.classList.toggle('is-scrolled', y > 40);
  const menuOpen = document.body.classList.contains('menu-open');
  nav.classList.toggle('is-hidden', !menuOpen && y > vh && y > lastY);
  lastY = y;

  if (scene) {
    scene.setScroll(max > 0 ? y / max : 0);
    const bounds = canvas.getBoundingClientRect();
    scene.setRunning(bounds.bottom > 0 && bounds.top < vh && !document.hidden);
  }

  // process line progress
  const r = stepsEl.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (vh * 0.5)));
  stepsProgress.style.setProperty('--p', p.toFixed(3));

  ticking = false;
}
window.addEventListener(
  'scroll',
  () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  },
  { passive: true }
);
document.addEventListener('visibilitychange', () => scene && onScroll());
onScroll();

/* ---------------- Reveal on scroll ---------------- */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
);
$$('.reveal, .split').forEach((el) => io.observe(el));

// active nav link
const sections = $$('main section[id]');
const navIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        $$('.nav__links a').forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${e.target.id}`));
      }
    });
  },
  { rootMargin: '-45% 0px -50% 0px' }
);
sections.forEach((s) => navIO.observe(s));

/* ---------------- Mobile menu ---------------- */
const burger = $('#burger');
const menu = $('#menu');
function setMenu(open, restoreFocus = false) {
  document.body.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', String(open));
  menu.inert = !open;
  menu.setAttribute('aria-hidden', String(!open));
  if (open) { nav.classList.remove('is-hidden'); $('#menu a').focus(); }
  else if (restoreFocus) burger.focus();
}
burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open'), true));
$$('#menu a').forEach((a) => a.addEventListener('click', () => setMenu(false, true)));
document.addEventListener('keydown', (event) => {
  if (!document.body.classList.contains('menu-open')) return;
  if (event.key === 'Escape') setMenu(false, true);
  if (event.key === 'Tab') {
    const controls = [burger, ...$$('#menu a')];
    const i = controls.indexOf(document.activeElement);
    event.preventDefault();
    controls[(i + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
  }
});
window.addEventListener('resize', () => {
  if (innerWidth > 1080) setMenu(false);
  onScroll();
});

/* ---------------- Principles legend <-> spots ---------------- */
function hot(n, on) {
  $$(`[data-spot="${n}"]`).forEach((el) => el.classList.toggle('is-hot', on));
}
$$('.legend li').forEach((li) => {
  li.addEventListener('mouseenter', () => hot(li.dataset.spot, true));
  li.addEventListener('mouseleave', () => hot(li.dataset.spot, false));
});

/* ---------------- Contact form -> mailto ---------------- */
$('#form').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.currentTarget;
  const note = $('#formNote');
  const nameField = f.elements.namedItem('name');
  const contactField = f.elements.namedItem('contact');
  const name = nameField.value.trim();
  const contact = contactField.value.trim();
  nameField.closest('.field').classList.toggle('is-error', !name);
  contactField.closest('.field').classList.toggle('is-error', !contact);
  nameField.setAttribute('aria-invalid', String(!name));
  contactField.setAttribute('aria-invalid', String(!contact));
  if (!name || !contact) {
    note.textContent = DICT[lang]['form.err'];
    note.classList.add('is-error');
    (!name ? nameField : contactField).focus();
    return;
  }
  const types = $$('input[name="type"]:checked', f).map((i) => i.value).join(', ');
  const body = `${DICT[lang]['form.name']}: ${name}\n${DICT[lang]['form.contact']}: ${contact}\n${DICT[lang]['form.type']}: ${types || '-'}\n\n${f.elements.namedItem('message').value.trim()}`;
  note.classList.remove('is-error');
  if (!CONTACT.email) {
    $('#briefText').value = body;
    $('#briefResult').hidden = false;
    note.textContent = DICT[lang]['form.demo'];
    return;
  }
  note.textContent = DICT[lang]['form.ok'];
  window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(`[Clarté Design] ${name}`)}&body=${encodeURIComponent(body)}`;
});

$('#copyBrief').addEventListener('click', async () => {
  const brief = $('#briefText');
  try {
    await navigator.clipboard.writeText(brief.value);
    $('#formNote').textContent = DICT[lang]['form.copied'];
  } catch {
    brief.focus();
    brief.select();
    $('#formNote').textContent = DICT[lang]['form.copyFallback'];
  }
});
