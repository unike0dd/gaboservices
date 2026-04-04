# GaboServices Codebase - Quick Reference Guide

## 🚀 Quick Start

### Where is the chatbot?
- **Main file:** [chatbot/embed.js](chatbot/embed.js)
- **Entry function:** `initGaboChatbotEmbed()`
- **Called from:** [main.js](main.js#L295) in DOMContextLoaded
- **Depends on:** [fab-controls.js](fab-controls.js) (FAB wrapper)
- **Worker URL:** `https://con-artist.rulathemtodos.workers.dev/api/chat`

### How does it initialize?
```
index.html
  ├─ <script src="site.config.js"></script>          [defines window.SITE_METADATA]
  └─ <script type="module" src="main.js"></script>   [orchestrates init]
       ├─ DOMContentLoaded
       └─ initGaboChatbotEmbed()
          ├─ Creates DOM: <section class="gabo-chatbot">
          ├─ Mounts to: #fabChatMount (or #fabWrapper, or body)
          └─ Wires listeners (click, submit, keyboard)
```

### Is the chatbot actually wired into the site?
✅ **YES** - The chatbot is fully integrated:
- ✅ Loaded in all HTML pages (via main.js)
- ✅ Mounted in FAB menu (#fabChatMount)
- ✅ Wired to #fabChatTrigger button
- ✅ Event listeners active
- ✅ State persisted to localStorage

---

## 📁 File Organization

### Entry Points
| File | Purpose | Status |
|------|---------|--------|
| **index.html** | Homepage (also main.js entry) | ✅ Working |
| **main.js** | Application orchestrator | ✅ Working |
| **site.config.js** | Configuration provider | ✅ Working |

### Core Modules (ES6 - Imported by main.js)
| File | Purpose | Dependencies | Status |
|------|---------|--------------|--------|
| **adaptive-layout.js** | Responsive viewport tokens | None | ✅ Good |
| **fab-controls.js** | FAB menu & button management | mobile-menu-state, messages | ✅ Good |
| **chatbot/embed.js** | Gabo io chatbot widget | fab-controls | ⚠️ Minor issue |
| **assets/mobile-nav.js** | Mobile navigation | None | ✅ Good |
| **analytics-consent-guard.js** | Block analytics without consent | None | ⚠️ Timing |
| **site-governance.js** | SEO/security validation | site-metadata | ✅ Good |
| **site-metadata.js** | Metadata utilities | site-metadata-defaults | ✅ Good |

### Configuration Files
| File | Purpose | Type | Status |
|------|---------|------|--------|
| **site-metadata-defaults.js** | Default metadata structure | ES6 Module | ✅ |
| **site.config.js** | Site configuration | Classic script | ✅ |

### Utility Modules
| File | Purpose | Dependencies | Status |
|------|---------|--------------|--------|
| **assets/mobile-menu-state.js** | Close menus/reset state | None | ✅ |
| **locales/en/messages.js** | English strings | None | ✅ |
| **locales/es/messages.js** | Spanish strings | None | ✅ (unused) |

### Form System (Classic Scripts - Not Modular)
| File | Purpose | Depends On | Status |
|------|---------|------------|--------|
| **form-workflow.js** | Generic form manager (IIFE) | None (creates global) | ⚠️ |
| **careers/careers-form.js** | Careers form init | form-workflow.js | ⚠️ |
| **contact/contact-hub.js** | Contact form init | form-workflow.js | ⚠️ |
| **assets/cookie-consent.js** | Cookie preference UI | messages | ✅ Isolated |

---

## 🔧 How to Add/Modify Features

### Add New Navigation Link
1. Open: [assets/mobile-nav.js](assets/mobile-nav.js#L3)
2. Update `ROUTES` object
3. Add icon to `ICONS` object (SVG)
4. Update [locales/en/messages.js](locales/en/messages.js) and [locales/es/messages.js](locales/es/messages.js)

### Add Settings to Site Config
1. Edit: [site.config.js](site.config.js)
2. Update: [site-metadata-defaults.js](site-metadata-defaults.js) (for structure)
3. Update: [site-metadata.js](site-metadata.js#L14) (merge logic if needed)
4. Use: `getSiteMetadata()` to consume

### Add Form to Page
⚠️ **Current System** (not ideal but functional):
1. Include: `<script src="../form-workflow.js"></script>` in HTML
2. Include: `<script src="../your-form.js"></script>` after form-workflow
3. Create: `your-form.js` with IIFE calling `window.GaboFormWorkflow.create()`

🚀 **Better Approach** (future):
- Convert form-workflow.js to ES6 module
- Import in your page's main.js-like script
- Call: `createFormWorkflow(root, config)`

### Customize Breakpoints
Files with hardcoded breakpoints:
1. [adaptive-layout.js](adaptive-layout.js#L1) - `BREAKPOINTS`
2. [assets/mobile-nav.js](assets/mobile-nav.js#L1) - `MOBILE_QUERY`

⚠️ **Not synced** - change both if modifying

### Add Animation
See examples in [main.js](main.js):
1. `initCenterServicesRotation()` - Service card scramble
2. `initHomeHeroFlipCard()` - 3D flip with carousel

Both include `prefers-reduced-motion` detection for accessibility.

---

## 🐛 Known Issues

### CRITICAL (Fix Now)
| Issue | File | Line | Fix |
|-------|------|------|-----|
| Undefined `overlay` variable | chatbot/embed.js | 201 | Define overlay or use panel |
| Analytics guard called before DOM | main.js | 5 | Move to DOMContextLoaded |
| No fetch timeout on chat | chatbot/embed.js | 135 | Add AbortController |

### HIGH PRIORITY
| Issue | File | Impact |
|-------|------|--------|
| Form-workflow is global (not modular) | form-workflow.js | Script order dependency |
| Can't switch locales dynamically | site-metadata.js | Spanish unused |
| No error handling in form init | careers-form.js | Silent fail |

### MEDIUM PRIORITY
| Issue | File | Impact |
|-------|------|--------|
| Mobile nav root created without dedup | mobile-nav.js | Multiple invocations = dups |
| Unused EN_MESSAGES import | main.js | Code cleanliness |
| Duplicate breakpoint constants | multiple | Consistency risk |

---

## 🔍 Where to Find Things

### "How does the chatbot initialize?"
→ Read: [chatbot/embed.js](chatbot/embed.js#L69) function `initGaboChatbotEmbed()`

### "How does the app start?"
→ Read: [main.js](main.js) DOMContextLoaded handler at bottom

### "Where is configuration?"
→ Check: [site.config.js](site.config.js) (what's set) and [site-metadata.js](site-metadata.js) (how it's used)

### "How does responsive design work?"
→ See: [adaptive-layout.js](adaptive-layout.js) (sets CSS tokens) and theme files

### "Where are translation strings?"
→ Look in: [locales/en/messages.js](locales/en/messages.js) and [locales/es/messages.js](locales/es/messages.js)

### "How do the menus work?"
→ Study: [fab-controls.js](fab-controls.js) (FAB), [assets/mobile-nav.js](assets/mobile-nav.js) (mobile nav)

### "How do forms validate?"
→ Check: [form-workflow.js](form-workflow.js#L100) `validateRequiredFields()`

---

## 📊 Dependency Summary

### What imports what?
```javascript
main.js imports:
├─ adaptive-layout.js    ← no dependencies (pure)
├─ fab-controls.js       ← imports mobile-menu-state, messages
├─ chatbot/embed.js      ← imports fab-controls
├─ mobile-nav.js         ← no dependencies (mostly pure)
├─ analytics-consent-guard.js ← no dependencies
├─ site-governance.js    ← imports site-metadata
├─ site-metadata.js      ← imports site-metadata-defaults
└─ locales/en/messages.js ← no dependencies
```

### Circular deps?
✅ **None!** - Dependency graph is acyclic.

### What uses globals?
- `window.SITE_METADATA` (set by site.config.js)
- `window.GaboFormWorkflow` (set by form-workflow.js)
- `window.__cfBeacon` (analytics)
- `window.__SITE_GOVERNANCE__` (debugging)

---

## 🎯 Module Purposes at a Glance

| Module | Does What | Key Export |
|--------|-----------|------------|
| **main.js** | Orchestrates everything | (none) |
| **adaptive-layout.js** | Sets responsive CSS tokens | `initAdaptiveLayout()` |
| **fab-controls.js** | Manages floating menu button | `initFabControls()`, `setDesktopFabOpenState()` |
| **chatbot/embed.js** | Creates & manages chatbot widget | `initGaboChatbotEmbed()` |
| **mobile-nav.js** | Builds mobile navigation | `initMobileNav()` |
| **analytics-consent-guard.js** | Blocks analytics without consent | `initAnalyticsConsentGuard()` |
| **site-governance.js** | Validates SEO/security config | `initSiteGovernance()` |
| **site-metadata.js** | Merges config, provides utilities | `getSiteMetadata()`, `getLocalizedValue()` |
| **mobile-menu-state.js** | Closes menus & resets focus | `closeMobileMenu()` |

---

## ⚡ Performance Notes

### Good Practices ✅
- Passive event listeners (resize, scroll)
- Efficient DOM queries (cached selectors)
- localStorage caching for chat history
- Motion preference API for animations

### Potential Bottlenecks ⚠️
- Chat messages fetched individually (no batching)
- Animation loops run continuously (though respects motion preferences)
- No service worker / offline support
- Form validation runs synchronously on submit

---

## 🚨 Critical Paths

### Chatbot Must Work
```
1. site.config.js loads ✅
2. main.js loads ✅
3. fab-controls.js loads ✅ (creates mount point)
4. chatbot/embed.js loads ✅
5. DOMContextLoaded fires ✅
6. initFabControls() ✅
7. initGaboChatbotEmbed() ✅
```
If any step fails → chatbot won't work

### Page Renders Without
```
- Chatbot down? → Chat button shows but doesn't work
- Forms fail? → Page still renders, form won't validate
- Mobile nav fails? → hamburger menu won't show
- Analytics guard fails? → Analytics might load anyway
```

---

## 📋 Testing Checklist

### Before Pushing Changes
- [ ] Run syntax check: `npm run check-syntax` (if available)
- [ ] Test chatbot: Open page, click menu, chat button works
- [ ] Test forms: Visit careers/contact, form submits
- [ ] Test responsiveness: Resize browser, nav changes
- [ ] Test on mobile: Test touch interactions
- [ ] Check console: No errors
- [ ] Check LocalStorage: Cookie/chat state saves

### Quick Manual Tests
```javascript
// Test metadata is available
window.__SITE_METADATA // should be defined

// Test chatbot state accessible
localStorage.getItem('gabo_io_chatbot_cache_v1') // JSON or null

// Test governance system
window.__SITE_GOVERNANCE__ // should be defined

// Test FAB system
document.getElementById('fabWrapper') // should exist after init

// Test mobile nav
document.getElementById('mobile-nav-root') // should exist after init
```

---

## 🔐 Security Notes

### CSP Considerations
- Site uses strict CSP for static assets
- Inline structured data requires CSP allowance
- Cloudflare Beacon blocked without consent
- Frame hosts allowlisted in config

### Origin Validation
- Chatbot checks origin against asset map
- Unknown origins → chat unavailable
- Origins supported:
  - `https://www.gabo.services`
  - `https://gabo.services`

### Data Handling
- Chat history stored in localStorage (client-only)
- No server-side session
- History not encrypted (security consideration)
- Max 40 messages kept

---

## 🔗 Quick Links

**Critical Files:**
- [main.js](main.js) - Application start
- [chatbot/embed.js](chatbot/embed.js) - Chatbot implementation
- [fab-controls.js](fab-controls.js) - FAB menu system
- [site.config.js](site.config.js) - Configuration

**References:**
- [Full Analysis](./CODEBASE_ANALYSIS.md)
- [Dependency Diagram](./DEPENDENCY_DIAGRAM.md)
- [SECURITY_REVIEW.md](./SECURITY_REVIEW.md) (security notes)

---

**Last Updated:** April 4, 2026  
**Next Review:** After critical fixes are implemented
