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

- Rebuild the generated English search corpus with `node locales/en/build-site-search-content.mjs` after updating page copy.
- The generator scans all major site HTML pages, extracts page-level and section-level content, and writes aligned URL entries to `locales/en/site-search-content.js`.
- If a global site search page is added later, this component can send the recognized query there instead of navigating straight to the best local result.
- If analytics are desired, track search phrases only after reviewing privacy requirements and retention rules.

## Important caveat

This feature makes the website **searchable by voice for end users inside the site UI**. It does **not** by itself make the site discoverable in external voice assistants like Siri, Alexa, or Google Assistant. For that broader discoverability, you would also improve structured data, SEO content, FAQs, business profile data, and answer-oriented copy.

## External voice discovery: what is and is not under our control

### Mostly under our control

We can strongly improve the odds that voice assistants and spoken Google queries choose the site by improving:
- page quality and crawlability,
- structured data / schema coverage,
- FAQ-style question-and-answer content,
- local/business profile completeness,
- fast mobile performance,
- clear headings and concise answer blocks.

### Not fully under our control

We cannot force Google, Siri, Alexa, Bing, or other assistants to speak or rank the site for a given query. External voice results are chosen by each platform's ranking, relevance, location, device, language, personalization, and answer-extraction systems.

### Practical takeaway

So the answer is: **partly under our control, but not fully**. We control the site's readiness and quality signals; the external platform controls final voice-result selection.
