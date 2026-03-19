# End-user website voice search

## What the feature does

This implementation adds an on-site search experience that lets visitors:
- type a search phrase,
- use a microphone button when the browser supports speech recognition,
- see matching pages immediately,
- and open the top result directly.

## How it works

1. `index.html` renders a search panel on the homepage.
2. `site-search.js` contains a curated index of site destinations.
3. As the visitor types or speaks, the script scores likely matches.
4. The user can click any result, or submit the form to open the top result.

## Browser/security requirements

- The site must be served over **HTTPS** for microphone access in production.
- `Permissions-Policy` must allow `microphone=(self)`.
- Voice search uses `SpeechRecognition` / `webkitSpeechRecognition`, so support varies by browser.
- When speech recognition is not available, the text search still works.

## How to expand it

- Add more destinations to the `SEARCH_INDEX` array in `site-search.js`.
- If a global site search page is added later, this component can send the recognized query there instead of navigating straight to the best local result.
- If analytics are desired, track search phrases only after reviewing privacy requirements and retention rules.

## Important caveat

This feature makes the website **searchable by voice for end users inside the site UI**. It does **not** by itself make the site discoverable in external voice assistants like Siri, Alexa, or Google Assistant. For that broader discoverability, you would also improve structured data, SEO content, FAQs, business profile data, and answer-oriented copy.
