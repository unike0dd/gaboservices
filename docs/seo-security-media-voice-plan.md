# SEO, Security, Media, and Voice Search Implementation Plan

## Short answer

Yes — the site can support all of the following with a clean separation-of-concerns approach:

1. a **dedicated SEO / metatag / CSP / CISA / NIST / OWASP / PCI DSS governance script**,
2. **MP3 / MP4 uploads or hosted links**, plus **HTML5 video** and **YouTube embeds**,
3. an optional **voice search experience** for users, and
4. protection controls that keep the implementation aligned with a static-site + Cloudflare-style deployment.

## Recommended architecture

### 1. Dedicated governance layer

Use a separate client-side module for:
- SEO metadata synchronization,
- structured data injection,
- self-auditing for missing canonical / OG / Twitter tags,
- configuration review for CSP/media/voice-search readiness.

That module should **not** be the only security control. It is best used as:
- a configuration and consistency layer,
- a browser-side audit helper,
- and a guardrail for future content changes.

The server/edge layer must still enforce the real protections through `_headers`, Cloudflare config, upload validation, and access rules.

### 2. Media support model

For media, use two tracks:

- **Hosted file path** for trusted `.mp3` and `.mp4` assets.
- **Embed path** for YouTube using the privacy-enhanced `youtube-nocookie.com` domain.

Recommended controls:
- allow only specific MIME types,
- store uploads outside editable content workflows,
- review file size limits,
- sanitize file names,
- use signed upload flows if user uploads are added later,
- keep `media-src 'self'` unless a trusted CDN is introduced.

### 3. Voice search model

Voice search can be added with the browser Web Speech API as a **progressive enhancement**:
- only enable it after explicit user interaction,
- show a consent / status indicator,
- convert speech to text into the existing site search input,
- provide a keyboard fallback for accessibility,
- avoid recording or transmitting audio unless the user opts in.

## Protection strategy

### CSP / security headers

If YouTube embeds are added, update CSP carefully:
- `frame-src https://www.youtube-nocookie.com`
- `img-src` should still allow YouTube thumbnails only if needed,
- `connect-src` should remain minimal,
- keep `object-src 'none'`, `base-uri 'self'`, and `frame-ancestors 'self'`.

### Compliance mapping

This approach supports:
- **CISA Cyber Essentials** through secure configuration and attack-surface reduction,
- **NIST CSF** through Protect / Detect documentation and control visibility,
- **OWASP** through XSS reduction, allowlisting, and controlled embedding,
- **PCI DSS 4.0** through change tracking, hardening evidence, and least-function design.

## Suggested rollout phases

### Phase 1 — Governance foundation
- Keep SEO and security configuration in `site.config.js`.
- Run `site-governance.js` on every page.
- Keep `_headers` as the enforcement point.

### Phase 2 — Media launch
- Add a reusable media component that accepts:
  - direct MP3 URL,
  - direct MP4 URL,
  - poster image,
  - YouTube URL.
- Validate file type and origin before rendering.
- Prefer approved content only.

### Phase 3 — Voice search
- Add a search field and microphone button.
- Enable speech recognition only in supporting browsers.
- Gate microphone use behind explicit click + privacy notice.
- Write recognized text into search and submit normally.

## Example implementation notes

### HTML5 audio

```html
<audio controls preload="none">
  <source src="/media/example.mp3" type="audio/mpeg" />
</audio>
```

### HTML5 video

```html
<video controls preload="metadata" playsinline>
  <source src="/media/example.mp4" type="video/mp4" />
</video>
```

### Privacy-enhanced YouTube embed

```html
<iframe
  src="https://www.youtube-nocookie.com/embed/VIDEO_ID"
  title="Video"
  loading="lazy"
  referrerpolicy="strict-origin-when-cross-origin"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowfullscreen>
</iframe>
```

### Voice search sketch

```js
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    searchInput.value = transcript;
  };
}
```

## Important caveats

- A client-side script can help **organize and audit**, but it does not replace edge/server enforcement.
- User uploads require stronger controls than static linked media.
- Voice search depends on browser support and user consent.
- YouTube support requires matching CSP/header updates before deployment.
