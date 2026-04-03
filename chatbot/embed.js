const WORKER_ORIGIN = 'https://con-artist.rulathemtodos.workers.dev';
const ALLOWED_PARENTS = new Set(['https://www.gabo.services', 'https://gabo.services']);

export function initGaboChatbotEmbed() {
  const frame = document.getElementById('gaboChatbotEmbed');
  const status = document.getElementById('gaboChatbotEmbedStatus');

  if (!frame || !status) return;

  const parentOrigin = window.location.origin;
  const allowed = ALLOWED_PARENTS.has(parentOrigin);

  if (!allowed) {
    status.textContent = 'Chat unavailable on this origin.';
    frame.hidden = true;
    return;
  }

  const src = `${WORKER_ORIGIN}/embed?parent=${encodeURIComponent(parentOrigin)}`;
  frame.src = src;
  frame.hidden = false;
  status.textContent = 'Connected';

  frame.addEventListener('load', () => {
    status.textContent = 'Ready';
  });
}
