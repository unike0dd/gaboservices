import { EN_SITE_SEARCH_CONTENT } from './locales/en/site-search-content.js';

const SEARCH_INDEX = EN_SITE_SEARCH_CONTENT;

const normalize = (value) => value.toLowerCase().trim();

const scoreEntry = (entry, query) => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return 0;

  const searchFields = [
    entry.title,
    entry.pageTitle,
    entry.sectionTitle,
    entry.description,
    entry.content,
    ...(entry.keywords || [])
  ];

  const haystack = searchFields.join(' ').toLowerCase();

  if (entry.title.toLowerCase() === normalizedQuery) return 150;
  if (entry.sectionTitle?.toLowerCase() === normalizedQuery) return 130;
  if (entry.pageTitle?.toLowerCase() === normalizedQuery) return 120;
  if (entry.title.toLowerCase().includes(normalizedQuery)) return 100;
  if (entry.sectionTitle?.toLowerCase().includes(normalizedQuery)) return 95;
  if (entry.pageTitle?.toLowerCase().includes(normalizedQuery)) return 90;
  if (entry.keywords?.some((keyword) => keyword.toLowerCase() === normalizedQuery)) return 80;
  if (haystack.includes(normalizedQuery)) return 60;

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const tokenHits = tokens.filter((token) => haystack.includes(token)).length;
  return tokenHits ? tokenHits * 10 : 0;
};

const dedupeEntries = (entries) => {
  const seen = new Set();
  return entries.filter((entry) => {
    const key = `${entry.url}::${entry.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const searchEntries = (query) => dedupeEntries(
  SEARCH_INDEX
    .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 5)
    .map(({ entry }) => entry)
);

const buildSearchMarkup = () => `
  <div class="site-search-bar">
    <label class="site-search-label sr-only" for="siteSearchInput">Voice or text search</label>
    <div class="site-search-inline-controls">
      <input id="siteSearchInput" class="site-search-input" type="search" name="site-search" placeholder="Voice or text search" autocomplete="off" data-site-search-input />
      <button type="button" class="btn site-search-voice-btn" data-voice-search-trigger aria-pressed="false" aria-label="Start voice search">Voice</button>
      <button type="submit" class="btn primary site-search-submit">Search</button>
    </div>
  </div>
  <div class="site-search-panel site-search-panel--header" data-site-search-panel hidden>
    <div class="site-search-form">
      <p class="site-search-status" data-site-search-status aria-live="polite"></p>
      <ul class="site-search-results" data-site-search-results aria-label="Search results"></ul>
    </div>
  </div>
`;

const ensureSearchRoot = () => {
  const existing = document.querySelector('[data-site-search]');
  if (existing) return existing;

  const headerWrap = document.querySelector('.site-header .nav-wrap');
  if (!headerWrap) return null;

  const root = document.createElement('div');
  root.className = 'site-search-shell';
  root.dataset.siteSearch = '';
  root.dataset.voiceLang = document.documentElement.lang === 'en' ? 'en-US' : document.documentElement.lang;

  const form = document.createElement('form');
  form.className = 'site-search-inline-form';
  form.dataset.siteSearchForm = '';
  form.innerHTML = buildSearchMarkup();
  root.appendChild(form);

  const nav = headerWrap.querySelector('nav');
  if (nav) {
    nav.insertAdjacentElement('beforebegin', root);
  } else {
    headerWrap.appendChild(root);
  }
  return root;
};

const createResultItem = (entry) => {
  const item = document.createElement('li');
  item.className = 'site-search-result';

  const link = document.createElement('a');
  link.className = 'site-search-result__link';
  link.href = entry.url;

  const title = document.createElement('strong');
  title.textContent = entry.sectionTitle || entry.title;

  const summary = document.createElement('span');
  summary.className = 'site-search-result__summary';
  summary.textContent = entry.description;

  link.append(title, summary);

  if (entry.sectionTitle && entry.pageTitle && entry.pageTitle !== entry.sectionTitle) {
    const meta = document.createElement('span');
    meta.className = 'site-search-result__summary';
    meta.textContent = `Page: ${entry.pageTitle}`;
    link.appendChild(meta);
  }

  item.appendChild(link);
  return item;
};

const createHeaderSearch = () => {
  const navWrap = document.querySelector('.site-header .nav-wrap');
  if (!navWrap || navWrap.querySelector('[data-site-search]')) return;

  const shell = document.createElement('div');
  shell.className = 'site-search-shell';
  shell.dataset.siteSearch = '';
  shell.dataset.voiceLang = 'en-US';
  shell.innerHTML = `
    <form class="site-search-form site-search-form--header" data-site-search-form>
      <label class="site-search-label site-search-label--sr-only" for="siteSearchInputHeader">Voice or text search</label>
      <div class="site-search-controls site-search-controls--header">
        <input id="siteSearchInputHeader" class="site-search-input site-search-input--header" type="search" name="site-search" placeholder="Voice or text search" autocomplete="off" data-site-search-input />
        <button type="button" class="btn site-search-voice-btn site-search-voice-btn--header" data-voice-search-trigger aria-pressed="false">Voice</button>
      </div>
      <div class="site-search-panel site-search-panel--header" data-site-search-panel hidden>
        <p class="site-search-status site-search-status--header" data-site-search-status aria-live="polite"></p>
        <ul class="site-search-results site-search-results--header" data-site-search-results aria-label="Search results"></ul>
      </div>
    </form>
  `;

  navWrap.appendChild(shell);
};

const initSearchRoot = (root, index) => {
  const voiceConfig = window.SITE_METADATA?.voiceSearch || {};
  const form = root.querySelector('[data-site-search-form]');
  const input = root.querySelector('[data-site-search-input]');
  const voiceButton = root.querySelector('[data-voice-search-trigger]');
  const results = root.querySelector('[data-site-search-results]');
  const status = root.querySelector('[data-site-search-status]');
  const panel = root.querySelector('[data-site-search-panel]');
  if (!form || !input || !voiceButton || !results || !status || !panel) return;

  if (!input.id) input.id = `siteSearchInput${index}`;
  const label = form.querySelector('.site-search-label');
  if (label) label.setAttribute('for', input.id);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let isListening = false;
  let isOpen = false;

  const setPanelState = (open) => {
    isOpen = open;
    root.dataset.open = String(open);
    panel.hidden = !open;
  };

  const renderResults = (query) => {
    const matches = searchEntries(query);
    results.replaceChildren();
    root.classList.toggle('has-results', matches.length > 0 && Boolean(query.trim()));

    if (!query.trim()) {
      status.textContent = 'Use voice or text to search across all indexed website pages.';
      return matches;
    }

    if (!matches.length) {
      status.textContent = `No pages matched “${query}”. Try logistics, IT support, pricing, privacy, or contact.`;
      return matches;
    }

    matches.forEach((entry) => {
      results.appendChild(createResultItem(entry));
    });
    status.textContent = `${matches.length} result${matches.length === 1 ? '' : 's'} for “${query}”.`;
    return matches;
  };

  const setListeningState = (listening, message) => {
    isListening = listening;
    voiceButton.setAttribute('aria-pressed', String(listening));
    voiceButton.dataset.listening = String(listening);
    voiceButton.textContent = listening ? 'Listening…' : 'Voice';
    if (message) status.textContent = message;
  };

  if (!voiceConfig.enabled) {
    voiceButton.disabled = true;
    voiceButton.setAttribute('aria-disabled', 'true');
    status.textContent = 'Voice search is disabled. Type your search instead.';
  } else if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = voiceConfig.lang || root.dataset.voiceLang || 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.addEventListener('start', () => {
      setListeningState(true, 'Listening for your search…');
    });

    recognition.addEventListener('result', (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || '';
      input.value = transcript;
      renderResults(transcript);
      setListeningState(false, transcript ? `Voice search captured “${transcript}”.` : 'Voice search completed.');
    });

    recognition.addEventListener('error', (event) => {
      const message = event.error === 'not-allowed'
        ? 'Microphone access was denied. Allow microphone access to use voice search.'
        : 'Voice search was unavailable. You can still type your search.';
      setListeningState(false, message);
    });

    recognition.addEventListener('end', () => {
      if (isListening) setListeningState(false, 'Voice search stopped.');
    });
  } else {
    voiceButton.disabled = true;
    voiceButton.setAttribute('aria-disabled', 'true');
    status.textContent = 'Voice search is not supported in this browser. Type your search instead.';
  }

  input.addEventListener('focus', () => {
    const query = input.value.trim();
    setPanelState(Boolean(query));
    renderResults(input.value);
  });

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    if (!event.target.closest('[data-site-search]') && isOpen) setPanelState(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen) setPanelState(false);
  });

  input.addEventListener('input', () => {
    setPanelState(true);
    renderResults(input.value);
  });

  form.addEventListener('submit', (event) => {
    setPanelState(true);
    event.preventDefault();
    const matches = renderResults(input.value);
    if (matches[0]) window.location.href = matches[0].url;
  });

  voiceButton.addEventListener('click', () => {
    setPanelState(true);
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      setListeningState(false, 'Voice search stopped.');
      return;
    }
    recognition.start();
  });

  renderResults('');
};

export function initSiteSearch() {
  ensureSearchRoot();
  createHeaderSearch();
  const roots = [...document.querySelectorAll('[data-site-search]')];
  roots.forEach((root, index) => initSearchRoot(root, index));
}
