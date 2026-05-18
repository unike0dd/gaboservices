const API_URL = '/api/ops-online-chat';
const STYLESHEET_HREF = '/chatbot/chatbot.css';
const OPEN_EVENT = 'gabo-io:open';
const CLOSE_EVENT = 'gabo-io:close';

function ensureStylesheet() {
  const hasStylesheet = [...document.querySelectorAll('link[rel="stylesheet"]')]
    .some((link) => {
      const href = link.getAttribute('href') || '';
      return href === STYLESHEET_HREF || href.endsWith(STYLESHEET_HREF);
    });

  if (hasStylesheet) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = STYLESHEET_HREF;
  document.head.appendChild(link);
}

function addMsg(log, text, type) {
  const div = document.createElement('div');
  div.className = `chat-msg ${type}`;
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
  return div;
}

function buildChatbotMarkup() {
  return `
    <button id="chatbot-toggle" type="button" aria-expanded="false" aria-controls="chatbot-container" aria-label="Open GABO IO Chatbot">
      <span aria-hidden="true">OPS AI</span>
    </button>

    <div id="chatbot-container" role="dialog" aria-modal="false" aria-label="GABO IO Chatbot" hidden>
      <div id="chatbot-header">
        <span>GABO IO Chatbot</span>
        <button id="chatbot-close" type="button" aria-label="Close GABO IO Chatbot">×</button>
      </div>

      <div id="chat-log" aria-live="polite"></div>

      <div id="chatbot-form-container">
        <form id="chatbot-input-row" autocomplete="off">
          <input
            id="chatbot-input"
            type="text"
            placeholder="Type your message..."
            required
            maxlength="256">

          <button id="chatbot-send" type="submit" aria-label="Send message">
            Send
          </button>
        </form>
      </div>
    </div>
  `;
}

export function initGaboIoChatbot() {
  if (document.getElementById('chatbot-container')) return;

  ensureStylesheet();

  const host = document.createElement('div');
  host.id = 'gabo-io-chatbot-root';
  host.innerHTML = buildChatbotMarkup();
  document.body.appendChild(host);

  const container = host.querySelector('#chatbot-container');
  const toggle = host.querySelector('#chatbot-toggle');
  const close = host.querySelector('#chatbot-close');
  const log = host.querySelector('#chat-log');
  const form = host.querySelector('#chatbot-input-row');
  const input = host.querySelector('#chatbot-input');
  const sendBtn = host.querySelector('#chatbot-send');

  if (!container || !toggle || !close || !log || !form || !input || !sendBtn) return;

  const setOpen = (open) => {
    container.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close GABO IO Chatbot' : 'Open GABO IO Chatbot');

    if (open) {
      input.focus({ preventScroll: true });
    }
  };

  async function sendMessage(message) {
    const trimmed = message.trim();

    if (!trimmed) return;

    addMsg(log, trimmed, 'user');
    input.value = '';

    const botDiv = addMsg(log, '…', 'bot');

    sendBtn.disabled = true;
    input.disabled = true;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: trimmed,
          lang: document.documentElement.lang || 'en'
        })
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();

      botDiv.textContent = data && data.reply
        ? data.reply
        : 'No reply.';
    } catch (error) {
      botDiv.textContent = 'Error: can’t reach GABO IO.';
    } finally {
      sendBtn.disabled = false;
      input.disabled = false;
      input.focus();
    }
  }

  toggle.addEventListener('click', () => {
    setOpen(container.hidden);
  });

  close.addEventListener('click', () => {
    setOpen(false);
    toggle.focus({ preventScroll: true });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await sendMessage(input.value);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !container.hidden) {
      setOpen(false);
      toggle.focus({ preventScroll: true });
    }
  });

  window.addEventListener(OPEN_EVENT, () => setOpen(true));
  window.addEventListener(CLOSE_EVENT, () => setOpen(false));
}
