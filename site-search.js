const SEARCH_INDEX = [
  {
    title: 'About Gabriel Services',
    url: '/about/',
    description: 'Learn about the company, operating model, and delivery philosophy.',
    keywords: ['about', 'company', 'overview', 'who we are', 'gabriel services']
  },
  {
    title: 'Services Overview',
    url: '/services/',
    description: 'Explore logistics, IT, administrative, and customer operations services.',
    keywords: ['services', 'solutions', 'support', 'operations', 'business services']
  },
  {
    title: 'Logistics Operations',
    url: '/services/logistics-operations/',
    description: 'Dispatch coordination, movement tracking, and execution support.',
    keywords: ['logistics', 'dispatch', 'tracking', 'fleet', 'movement']
  },
  {
    title: 'Administrative Back Office',
    url: '/services/administrative-backoffice/',
    description: 'Documentation, scheduling, process administration, and data upkeep.',
    keywords: ['administrative', 'back office', 'documentation', 'scheduling', 'operations support']
  },
  {
    title: 'Customer Relations',
    url: '/services/customer-relations/',
    description: 'Customer communication, follow-up handling, and service continuity.',
    keywords: ['customer', 'relations', 'support desk', 'communications', 'follow-up']
  },
  {
    title: 'IT Support',
    url: '/services/it-support/',
    description: 'Ticket coordination, issue triage, and business system support.',
    keywords: ['it', 'technical support', 'help desk', 'ticketing', 'triage']
  },
  {
    title: 'Pricing',
    url: '/services/#pricing',
    description: 'Review engagement options and commercial structure.',
    keywords: ['pricing', 'plans', 'cost', 'engagement options', 'quote']
  },
  {
    title: 'Careers',
    url: '/careers/',
    description: 'Review open opportunities and application guidance.',
    keywords: ['careers', 'jobs', 'apply', 'employment']
  },
  {
    title: 'Contact',
    url: '/contact/',
    description: 'Reach the team for consultations and support requests.',
    keywords: ['contact', 'consultation', 'reach us', 'support request']
  },
  {
    title: 'Learning',
    url: '/learning/',
    description: 'Browse learning resources and operational guidance.',
    keywords: ['learning', 'resources', 'guides', 'knowledge base']
  }
];

const normalize = (value) => value.toLowerCase().trim();

const scoreEntry = (entry, query) => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return 0;

  const haystack = [entry.title, entry.description, ...(entry.keywords || [])]
    .join(' ')
    .toLowerCase();

  if (entry.title.toLowerCase() === normalizedQuery) return 120;
  if (entry.title.toLowerCase().includes(normalizedQuery)) return 90;
  if (entry.keywords?.some((keyword) => keyword.toLowerCase() === normalizedQuery)) return 80;
  if (haystack.includes(normalizedQuery)) return 60;

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const tokenHits = tokens.filter((token) => haystack.includes(token)).length;
  return tokenHits ? tokenHits * 10 : 0;
};

const searchEntries = (query) => SEARCH_INDEX
  .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
  .filter(({ score }) => score > 0)
  .sort((left, right) => right.score - left.score)
  .slice(0, 5)
  .map(({ entry }) => entry);

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
  title.textContent = entry.title;

  const summary = document.createElement('span');
  summary.className = 'site-search-result__summary';
  summary.textContent = entry.description;

  link.append(title, summary);
  item.appendChild(link);
  return item;
};

export function initSiteSearch() {
  const root = ensureSearchRoot();
  const voiceConfig = window.SITE_METADATA?.voiceSearch || {};
  if (!root) return;

  const form = root.querySelector('[data-site-search-form]');
  const input = root.querySelector('[data-site-search-input]');
  const voiceButton = root.querySelector('[data-voice-search-trigger]');
  const results = root.querySelector('[data-site-search-results]');
  const status = root.querySelector('[data-site-search-status]');
  const panel = root.querySelector('[data-site-search-panel]');
  if (!form || !input || !voiceButton || !results || !status || !panel) return;

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

    if (!query.trim()) {
      status.textContent = 'Use voice or text search to jump to the right page.';
      return matches;
    }

    if (!matches.length) {
      status.textContent = `No pages matched “${query}”. Try service names like logistics, IT support, pricing, or contact.`;
      return matches;
    }

    matches.forEach((entry) => {
      results.appendChild(createResultItem(entry));
    });
    status.textContent = `${matches.length} result${matches.length === 1 ? '' : 's'} found for “${query}”.`;
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
    status.textContent = 'Voice search is currently disabled in site configuration. Type your search instead.';
  } else if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = voiceConfig.lang || root.dataset.voiceLang || 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.addEventListener('start', () => {
      setListeningState(true, 'Listening for a search phrase…');
    });

    recognition.addEventListener('result', (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || '';
      input.value = transcript;
      renderResults(transcript);
      setListeningState(false, transcript ? `Voice search captured: “${transcript}”.` : 'Voice search completed.');
    });

    recognition.addEventListener('error', (event) => {
      const message = event.error === 'not-allowed'
        ? 'Microphone access was denied. Allow microphone access in the browser to use voice search.'
        : 'Voice search was unavailable. You can still search by typing.';
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
    setPanelState(true);
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
  setPanelState(false);
}
