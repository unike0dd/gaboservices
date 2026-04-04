import { setDesktopFabOpenState } from '../fab-controls.js';
const WORKER_BASE = 'https://con-artist.rulathemtodos.workers.dev';

const WORKER_CHAT = `${WORKER_BASE}/api/chat`;
const WORKER_MODE = 'iframe_service_qa';

const ORIGIN_ASSET_MAP = {
  'https://www.gabo.services':
    'b91f605b23748de5cf02db0de2dd59117b31c709986a3c72837d0af8756473cf2779c206fc6ef80a57fdeddefa4ea11b972572f3a8edd9ed77900f9385e94bd6',
  'https://gabo.services':
    '8cdeef86bd180277d5b080d571ad8e6dbad9595f408b58475faaa3161f07448fbf12799ee199e3ee257405b75de555055fd5f43e0ce75e0740c4dc11bf86d132'
};

const STORAGE_KEY = 'gabo_io_chatbot_cache_v1';
const MAX_HISTORY = 40;

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
  const assetId = ORIGIN_ASSET_MAP[currentOrigin] || '';

  const state = safeStateLoad();
  state.open = false;

  const root = document.createElement('section');
  root.className = 'gabo-chatbot';
  root.innerHTML = `
    <div id="gaboChatbotPanel" class="gabo-chatbot__panel" hidden>
      <header class="gabo-chatbot__header">
        <strong>Gabo io</strong>
      </header>
      <div class="gabo-chatbot__log" aria-live="polite"></div>
      <form class="gabo-chatbot__form" autocomplete="off">
        <input class="gabo-chatbot__input" type="text" maxlength="1000" placeholder="Type your message..." required />
        <button class="gabo-chatbot__send" type="submit">Send</button>
      </form>
    </div>
  `;

  const host = document.getElementById('fabChatMount') || document.getElementById('fabWrapper') || document.body;
  host.appendChild(root);

  const fabTrigger = document.getElementById('fabChatTrigger');
  const panel = root.querySelector('.gabo-chatbot__panel');
  const form = root.querySelector('.gabo-chatbot__form');
  const input = root.querySelector('.gabo-chatbot__input');
  const send = root.querySelector('.gabo-chatbot__send');
  const log = root.querySelector('.gabo-chatbot__log');

  function setOpen(open) {
    setDesktopFabOpenState(false);
    panel.hidden = !open;
    fabTrigger?.setAttribute('aria-expanded', String(open));
    state.open = open;
    saveState(state);
    document.body.classList.toggle('chat-open', open);

    if (open) {
      window.dispatchEvent(new CustomEvent('gabo:fabs-close'));
      renderLog(log, state.history);
      input.focus();
    } else {
      setDesktopFabOpenState(false);
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
      throw new Error('Chat unavailable on this host.');
    }

    const assistantIndex = state.history.push({ role: 'assistant', content: '...' }) - 1;
    state.history = state.history.slice(-MAX_HISTORY);
    renderLog(log, state.history);
    saveState(state);

    const resp = await fetch(WORKER_CHAT, {
      method: 'POST',
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
    });

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
        state.history[assistantIndex].content += delta;
        renderLog(log, state.history);
      }

      saveState(state);
    }

    if (!hasData && !state.history[assistantIndex].content.trim()) {
      state.history[assistantIndex].content = 'No reply.';
      saveState(state);
      renderLog(log, state.history);
    }
  }

  function closeChat() {
    setOpen(false);
    window.dispatchEvent(new CustomEvent('gabo:chatbot-close'));
  }

  fabTrigger?.setAttribute('aria-controls', 'gaboChatbotPanel');
  fabTrigger?.addEventListener('click', () => setOpen(!state.open));
  window.addEventListener('gabo:chatbot-open', () => setOpen(true));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.open) {
      closeChat();
    }
  });

  document.addEventListener('click', (event) => {
    if (!state.open) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (panel.contains(target) || fabTrigger?.contains(target)) return;
    closeChat();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    send.disabled = true;
    pushMessage('user', message);

    try {
      await streamAssistantReply(message);
    } catch {
      pushMessage('assistant', 'Unable to complete request. Please try again.');
    } finally {
      send.disabled = false;
      input.focus();
    }
  });

  setOpen(state.open);
  renderLog(log, state.history);
}
