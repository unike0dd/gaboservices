# Chatbot Stream Bridge

Centralized stream communication is handled by:

- `chatbot/chatbot-worker-stream.js`

This module owns:

- Worker base URL normalization (`https://con-artist.rulathemtodos.workers.dev/`)
- Chat stream endpoint resolution (`/api/chat`)
- Embed URL construction (`/embed` + `gateway` + `parent` params)
- Direct stream request helper (`openDirectWorkerStream`) for SSE-compatible worker communication

`chatbot/chatbot-controls.js` consumes this bridge so chat UI and worker connectivity are maintained from one place.
