const WORKER_BASE = 'https://con-artist.rulathemtodos.workers.dev';

const WORKER_CHAT = `${WORKER_BASE}/api/chat`;
const WORKER_MODE = 'iframe_service_qa';

const DEFAULT_ORIGIN_ASSET_MAP = {
  'https://www.gabo.services':
    'b91f605b23748de5cf02db0de2dd59117b31c709986a3c72837d0af8756473cf2779c206fc6ef80a57fdeddefa4ea11b972572f3a8edd9ed77900f9385e94bd6',
  'https://gabo.services':
    '8cdeef86bd180277d5b080d571ad8e6dbad9595f408b58475faaa3161f07448fbf12799ee199e3ee257405b75de555055fd5f43e0ce75e0740c4dc11bf86d132'
};

const STORAGE_KEY = 'gabo_io_chatbot_cache_v1';
const MAX_HISTORY = 40;
const RATE_LIMIT_KEY = 'gabo_io_chatbot_rate_v1';
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

// Security sanitization rules based on behavior.yml
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';

  let sanitized = input;

  // Limit length
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }

  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Escape special characters
  sanitized = sanitized.replace(/&/g, '&amp;')
                       .replace(/</g, '&lt;')
                       .replace(/>/g, '&gt;')
                       .replace(/"/g, '&quot;')
                       .replace(/'/g, '&#x27;');

  // Filter malicious patterns (scripts, JS code)
  const maliciousPatterns = [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /eval\s*\(/gi,
    /document\./gi,
    /window\./gi,
    /alert\s*\(/gi,
    /prompt\s*\(/gi,
    /confirm\s*\(/gi
  ];

  maliciousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REMOVED]');
  });

  // Remove programming code patterns
  const codePatterns = [
    /import\s+.*$/gm,
    /from\s+.*import/gm,
    /def\s+.*:/gm,
    /class\s+.*:/gm,
    /function\s+.*\{/gm,
    /var\s+.*=/gm,
    /let\s+.*=/gm,
    /const\s+.*=/gm,
    /if\s*\(/gm,
    /for\s*\(/gm,
    /while\s*\(/gm
  ];

  codePatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[CODE REMOVED]');
  });

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

function getOriginAssetMap() {
  const configured = window.SITE_METADATA?.chatbot?.originAssetMap;
  if (!configured || typeof configured !== 'object') {
    return DEFAULT_ORIGIN_ASSET_MAP;
  }

  const cleanConfigured = Object.fromEntries(
    Object.entries(configured).filter(([origin, assetId]) => typeof origin === 'string' && typeof assetId === 'string' && assetId)
  );

  return {
    ...DEFAULT_ORIGIN_ASSET_MAP,
    ...cleanConfigured
  };
}

function safeStateLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { open: false, history: [] };
    const parsed = JSON.parse(raw);
    const open = !!parsed?.open;
    const history = Array.isArray(parsed?.history)
      ? parsed.history
          .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
          .slice(-MAX_HISTORY)
      : [];
    return { open, history };
  } catch {
    return { open: false, history: [] };
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ open: !!state.open, history: state.history.slice(-MAX_HISTORY) }));
  } catch {
    // Ignore cache quota/storage restrictions.
  }
}

function emitTelemetry(event, detail = {}) {
  window.dispatchEvent(
    new CustomEvent('gabo:chatbot-telemetry', {
      detail: {
        event,
        ts: new Date().toISOString(),
        ...detail
      }
    })
  );
}

function readRateState() {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const stamps = Array.isArray(parsed?.stamps)
      ? parsed.stamps.filter((v) => Number.isFinite(v))
      : [];
    return { stamps };
  } catch {
    return { stamps: [] };
  }
}

function writeRateState(rateState) {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(rateState));
  } catch {
    // Ignore storage restrictions.
  }
}

function consumeRateToken(now = Date.now()) {
  const rateState = readRateState();
  const stamps = rateState.stamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (stamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldest = Math.min(...stamps);
    const retryInMs = Math.max(RATE_LIMIT_WINDOW_MS - (now - oldest), 0);
    writeRateState({ stamps });
    return { allowed: false, retryInMs };
  }

  stamps.push(now);
  writeRateState({ stamps });
  return { allowed: true, retryInMs: 0 };
}

function sanitizeAssistantOutput(input) {
  const text = String(input || '');
  const sensitivePatterns = [
    /\bpassword\b/gi,
    /\bapi[_-]?key\b/gi,
    /\bsecret\b/gi,
    /\btoken\b/gi
  ];

  return sensitivePatterns.reduce((out, pattern) => out.replace(pattern, '[REDACTED]'), text);
}

function parseSSEBlock(block) {
  const lines = String(block || '').split('\n');
  let out = '';

  for (const line of lines) {
    if (!line.startsWith('data:')) continue;
    const delta = line.slice(5).trimStart();
    if (delta === '[DONE]') continue;
    out += delta + '\n';
  }

  return out;
}

function renderLog(log, history) {
  log.innerHTML = '';

  history.forEach((item) => {
    const bubble = document.createElement('div');
    bubble.className = `gabo-chatbot__msg ${item.role === 'user' ? 'user' : 'bot'}`;
    bubble.textContent = item.content;
    log.appendChild(bubble);
  });

  log.scrollTop = log.scrollHeight;
}

export function initGaboChatbotEmbed() {
  const currentOrigin = window.location.origin;
  const originAssetMap = getOriginAssetMap();
  const assetId = originAssetMap[currentOrigin] || '';

  const state = safeStateLoad();

  const root = document.createElement('section');
  root.className = 'gabo-chatbot';
  root.innerHTML = `
    <button class="gabo-chatbot__overlay" type="button" aria-label="Close chatbot" hidden></button>
    <div id="gaboChatbotPanel" class="gabo-chatbot__panel" hidden>
      <header class="gabo-chatbot__header">
        <strong>Gabo io</strong>
        <div class="gabo-chatbot__header-actions">
          <button class="gabo-chatbot__close-text" type="button">Close</button>
          <button class="gabo-chatbot__close" type="button" aria-label="Close chatbot">✕</button>
        </div>
      </header>
      <div class="gabo-chatbot__log" aria-live="polite"></div>
      <form class="gabo-chatbot__form" autocomplete="off">
        <input class="gabo-chatbot__input" type="text" maxlength="1000" placeholder="Type your message..." required />
        <button class="gabo-chatbot__send" type="submit">Send</button>
      </form>
    </div>
  `;

  const host = document.getElementById('fabChatMount') || document.getElementById('fabWrapper') || document.body;
  
  if (!host) {
    console.warn('[Gabo Chatbot] Host element not found, cannot initialize');
    return;
  }

  const existing = host.querySelector(':scope > .gabo-chatbot');
  if (existing) {
    existing.remove();
  }

  host.appendChild(root);

  const fabTrigger = document.getElementById('fabChatTrigger');
  const panel = root.querySelector('.gabo-chatbot__panel');
  const header = root.querySelector('.gabo-chatbot__header');
  const closeText = root.querySelector('.gabo-chatbot__close-text');
  const closeIcon = root.querySelector('.gabo-chatbot__close');
  const form = root.querySelector('.gabo-chatbot__form');
  const input = root.querySelector('.gabo-chatbot__input');
  const send = root.querySelector('.gabo-chatbot__send');
  const log = root.querySelector('.gabo-chatbot__log');
  const overlay = root.querySelector('.gabo-chatbot__overlay');
  const header = root.querySelector('.gabo-chatbot__header');

  if (!fabTrigger || !panel || !header || !overlay || !closeText || !closeIcon || !form || !input || !send || !log) {
    console.warn('[Gabo Chatbot] Required elements missing, cannot initialize');
    return;
  }

  const dragState = {
    active: false,
    pointerId: null,
    offsetX: 0,
    offsetY: 0
  };

  function setOpen(open) {
    if (overlay) overlay.hidden = !open;
    panel.hidden = !open;
    fabTrigger?.setAttribute('aria-expanded', String(open));
    state.open = open;
    saveState(state);
    document.body.classList.toggle('chat-open', open);
    window.dispatchEvent(new CustomEvent(open ? 'gabo:fab-open' : 'gabo:fab-close'));

    if (open) {
      renderLog(log, state.history);
      input.focus();
      emitTelemetry('chat_opened', { historyCount: state.history.length });
    } else {
      emitTelemetry('chat_closed', { historyCount: state.history.length });
    }
  }

  function pushMessage(role, content) {
    state.history.push({ role, content: String(content || '') });
    state.history = state.history.slice(-MAX_HISTORY);
    saveState(state);
    renderLog(log, state.history);
  }

  async function streamAssistantReply(userText) {
    if (!assetId) {
      emitTelemetry('host_not_allowlisted', { currentOrigin });
      throw new Error('Chat unavailable on this host. Add this origin to SITE_METADATA.chatbot.originAssetMap.');
    }

    const assistantIndex = state.history.push({ role: 'assistant', content: '...' }) - 1;
    state.history = state.history.slice(-MAX_HISTORY);
    renderLog(log, state.history);
    saveState(state);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const resp = await fetch(WORKER_CHAT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'x-gabo-parent-origin': currentOrigin,
        'x-ops-asset-id': assetId
      },
      body: JSON.stringify({
        mode: WORKER_MODE,
        messages: [{ role: 'user', content: userText }],
        meta: { surface: 'gabo_io_global_widget', communication: 'Cyber Security' }
      })
    }).finally(() => clearTimeout(timeoutId));

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`Worker ${resp.status}${text ? ` - ${text.slice(0, 120)}` : ''}`);
    }

    if (!resp.body) throw new Error('Empty response body');

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let hasData = false;

    state.history[assistantIndex].content = '';
    saveState(state);

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      if (!buffer.includes('\n\n')) continue;

      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        const delta = parseSSEBlock(part);
        if (!delta) continue;
        hasData = true;
        state.history[assistantIndex].content += sanitizeAssistantOutput(delta);
        renderLog(log, state.history);
      }

      saveState(state);
    }

    if (!hasData && !state.history[assistantIndex].content.trim()) {
      state.history[assistantIndex].content = 'No reply.';
      saveState(state);
      renderLog(log, state.history);
    }

    state.history[assistantIndex].content = sanitizeAssistantOutput(state.history[assistantIndex].content);
    saveState(state);
    renderLog(log, state.history);
  }

  function closeChat(trigger = 'unknown') {
    setOpen(false);
    window.dispatchEvent(new CustomEvent('gabo:chatbot-close', { detail: { trigger } }));
  }

  function isDesktopViewport() {
    return window.matchMedia('(min-width: 901px)').matches;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function beginDrag(event) {
    if (!state.open || !isDesktopViewport()) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('button, input, textarea, select, a')) return;

    const rect = panel.getBoundingClientRect();
    dragState.active = true;
    dragState.pointerId = event.pointerId;
    dragState.offsetX = event.clientX - rect.left;
    dragState.offsetY = event.clientY - rect.top;

    panel.style.left = `${rect.left}px`;
    panel.style.top = `${rect.top}px`;
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    header.style.cursor = 'grabbing';
    header.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function dragPanel(event) {
    if (!dragState.active || dragState.pointerId !== event.pointerId) return;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const panelWidth = panel.offsetWidth;
    const panelHeight = panel.offsetHeight;

    const nextLeft = clamp(event.clientX - dragState.offsetX, 0, Math.max(viewportWidth - panelWidth, 0));
    const nextTop = clamp(event.clientY - dragState.offsetY, 0, Math.max(viewportHeight - panelHeight, 0));

    panel.style.left = `${nextLeft}px`;
    panel.style.top = `${nextTop}px`;
  }

  function endDrag(event) {
    if (!dragState.active || dragState.pointerId !== event.pointerId) return;
    dragState.active = false;
    dragState.pointerId = null;
    header.style.cursor = 'grab';
    header.releasePointerCapture(event.pointerId);
  }

  fabTrigger?.setAttribute('aria-controls', 'gaboChatbotPanel');
  fabTrigger?.addEventListener('click', () => setOpen(!state.open));
  window.addEventListener('gabo:chatbot-open', () => setOpen(true));
  closeText?.addEventListener('click', () => closeChat('header-close-text'));
  closeIcon?.addEventListener('click', () => closeChat('header-close-icon'));
  overlay?.addEventListener('click', () => closeChat('overlay-click'));
  header.addEventListener('pointerdown', beginDrag);
  header.addEventListener('pointermove', dragPanel);
  header.addEventListener('pointerup', endDrag);
  header.addEventListener('pointercancel', endDrag);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.open) {
      closeChat('escape-key');
    }
  });

  document.addEventListener('click', (event) => {
    if (!state.open) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (panel.contains(target) || fabTrigger?.contains(target)) return;
    closeChat('outside-chat-panel');
  });

  window.addEventListener('resize', () => {
    if (isDesktopViewport()) return;
    panel.style.removeProperty('left');
    panel.style.removeProperty('top');
    panel.style.removeProperty('right');
    panel.style.removeProperty('bottom');
    header.style.cursor = '';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    let message = input.value.trim();
    message = sanitizeInput(message);
    if (!message) return;

    input.value = '';
    send.disabled = true;
    pushMessage('user', message);
    emitTelemetry('send_attempt', { userMessageLength: message.length });

    const rate = consumeRateToken();
    if (!rate.allowed) {
      const retrySeconds = Math.ceil(rate.retryInMs / 1000);
      pushMessage('assistant', `Rate limit reached. Please wait ${retrySeconds}s and try again.`);
      emitTelemetry('rate_limited', { retryInMs: rate.retryInMs });
      send.disabled = false;
      input.focus();
      return;
    }

    try {
      emitTelemetry('stream_started', {});
      await streamAssistantReply(message);
      emitTelemetry('stream_completed', {});
    } catch {
      pushMessage('assistant', 'Unable to complete request. Please try again.');
      emitTelemetry('stream_failed', {});
    } finally {
      send.disabled = false;
      input.focus();
    }
  });

  setOpen(state.open);
  renderLog(log, state.history);
  enableDraggablePanel();
}
