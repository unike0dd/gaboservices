# Copilot Instructions - Gabriel Professional Services Website

## Architecture Overview

This is a **single-page React application** (no Router library) built with TypeScript and React 19. The navigation model is simple, state-based page switching via `currentPage` in `App.tsx` - NOT URL routing.

**Build Pipeline:**
- Dev: `npm run dev` starts Python HTTP server on port 3000
- Build: `npm run build` → TypeScript compilation to ES2022 + custom HTML build script (`scripts/build-html.mjs`)
- Preview: `npm run preview` serves `dist/` on port 4173

## Project Structure

```
App.tsx                          # Main component + global state (page, theme, language)
components/
  Header.tsx                     # Navigation header with dropdowns & theme/language toggles
  Hero.tsx                       # Landing hero section
  Services.tsx                   # Services grid with IntersectionObserver animations
  [ServiceName]Page.tsx          # Service detail pages (Logistics, ITSupport, etc.)
  About.tsx, Pricing.tsx, etc.   # Reusable sections
scripts/
  build-html.mjs                 # Copies index.html to dist/, replaces .tsx import with .js
```

## Critical Patterns

### 1. Component Props Convention
**All page/section components receive `lang: Language` prop.** Service detail pages also get `setCurrentPage` for navigation.

```typescript
// Example pattern used everywhere
interface LogisticsPageProps {
  setCurrentPage: (page: string) => void;
  lang: Language;
}
export const LogisticsPage: React.FC<LogisticsPageProps> = ({ setCurrentPage, lang }) => {
  // ...
}
```

### 2. Bilingual Content (EN/ES)
**No i18n library** - translations are inline objects in each component. Structure:

```typescript
const content = {
  en: { 
    title: "English Title", 
    services: [{ title: "....", description: "..." }]
  },
  es: { 
    title: "Título Español", 
    services: [{ title: "....", description: "..." }]
  }
};
const t = content[lang];  // Use t.title, t.services, etc.
```

**When adding content:** Always provide EN and ES versions in the same object.

### 3. Tailwind CSS + Custom Classes
- **No CSS files** - all styling via Tailwind classes (dark mode uses `dark:` prefix)
- **Custom shine effects** - classes like `shine-purple`, `shine-blue`, `shine-gold`, `shine-white` applied to buttons (defined in global styles, referenced in HTML)
- **Dark mode:** Controlled by `isDark` state in App; saves to localStorage; toggled via Header button

### 4. Navigation & State Management
- **Page switching:** Call `setCurrentPage(pageId)` - no URL changes
- **Valid page IDs:** 'home', 'about', 'careers', 'contact', 'logistics', 'it-support', 'admin-support', 'customer-relations'
- **Current page tracking:** Check `currentPage === 'about'` in Header to highlight active nav item

### 5. Scroll Animations
Used in `Services.tsx` via **IntersectionObserver**:

```typescript
useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('active');  // Triggers CSS animation
    });
  }, { threshold: 0.1 });
  
  const items = containerRef.current?.querySelectorAll('.reveal');
  items?.forEach(item => observer.observe(item));
  // ... cleanup
}, []);
```

Apply `reveal` class to elements that should animate on scroll.

## Developer Workflow

**Adding a new service page:**
1. Create `components/NewServicePage.tsx` following the `LogisticsPageProps` pattern
2. Import in `App.tsx` with other service pages
3. Add case to `renderContent()` switch statement
4. Add navigation button in `Header.tsx` service dropdown
5. Add both EN + ES translations throughout

**Updating translations:**
- Edit `content.en` and `content.es` objects in the relevant component
- Pass `lang` prop through component tree - it flows from App → Header/Pages

**Styling new elements:**
- Use **Tailwind classes** exclusively - no custom CSS files
- Dark mode: prefix with `dark:` (e.g., `text-gray-900 dark:text-white`)
- Animations: Apply `animate-fade-in` or `animate-fade-in-down` classes (pre-defined)

## Key Implementation Details

- **React version:** 19.2.4 (latest with auto-JSX transform)
- **TypeScript target:** ES2022
- **No external state management** - all state in App.tsx
- **Theme persistence:** localStorage key `'theme'` stores 'dark' or 'light'
- **Mobile menu handling:** Header.tsx watches window resize to close menu on desktop (md breakpoint)
- **Build output:** dist/index.html + dist/metadata.json (metadata.json copied unchanged)

## Common Tasks

**Fix dark mode styling gaps:**
- Look for classes missing `dark:` prefix in components using `isDark` state
- Example: `text-gray-900` should be `text-gray-900 dark:text-white`

**Add new hero section or call-to-action:**
- Use gradient backgrounds: `bg-gradient-to-r from-purple-600 to-indigo-700`
- Match button styling: `bg-white text-purple-700 px-8 py-4 rounded-xl font-bold shine-button shine-purple`

**Mobile responsiveness:**
- Use Tailwind's `hidden md:flex` / `block md:hidden` for responsive layouts
- Header already handles mobile menu + resize listeners

## Files Not to Modify
- `package.json` (dependencies managed separately)
- `tsconfig.json` / `tsconfig.build.json` (compilation config locked)
- `scripts/build-html.mjs` (build orchestration)
