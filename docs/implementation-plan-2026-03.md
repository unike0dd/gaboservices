# Gabriel Services implementation plan — phase 1

## Objective

Turn the March 2026 audit into shippable work that improves three high-impact areas first:

1. homepage positioning,
2. proof architecture above the fold,
3. contact-funnel conversion friction.

## Success criteria

### Homepage
- The hero clearly states the ideal customer, the core pain removed, and the expected operational outcome.
- A proof strip appears above the fold with concise trust signals.
- Primary and secondary CTAs use a consistent action hierarchy.

### Contact funnel
- A visitor can submit a valid inquiry with only essential information.
- Extended intake stays available, but becomes optional.
- The page explains the intake flow in a simple 3-step model.

### UX / delivery
- Visual updates stay consistent with the current static-site architecture.
- Changes remain lightweight and do not require a framework migration.
- Existing dynamic skill/experience/language helpers continue to work in the optional extended intake.

## Scope for this phase

### In scope
- Rewrite homepage hero copy.
- Add a homepage proof strip.
- Add a more intentional hero proof card.
- Simplify the contact form into a quick inquiry + optional extended intake pattern.
- Update validation so only the quick inquiry path is required.
- Add styling support for the new homepage and contact layout.

### Out of scope
- Full sitewide design-system refactor.
- Services page rewrite.
- Analytics instrumentation.
- CI quality-gate implementation.
- Templating/build-system migration.

## Work breakdown

### 1. Homepage message hierarchy
- Replace generic service-category headline with an outcome-led headline.
- Add a short kicker that identifies the target customer.
- Replace generic hero support text with process-aligned language.
- Standardize CTA labels to:
  - Book a consultation
  - See service coverage

### 2. Homepage proof architecture
- Add a compact proof-chip row inside the hero.
- Add a proof card in the media column that explains why teams switch.
- Add a three-column proof strip immediately after the hero.

### 3. Contact-funnel simplification
- Reduce required fields to:
  - full name
  - work email
  - company / team
  - contact number
  - primary workflow pressure
  - service interest
  - message
- Move location, scheduling, and staffing/talent details into an optional accordion.
- Change submit copy from a summary-first framing to a quick-inquiry framing.

### 4. Validation changes
- Validate only the essential quick-inquiry fields by default.
- Keep extended-intake widgets available without blocking submission.
- Preserve clear inline status messaging for blocked vs ready states.

## Recommended next phases

### Phase 2
- Rebuild the homepage “Why us” section into stronger proof modules.
- Add “Who this is for / not for.”
- Add onboarding timeline and workflow map.

### Phase 3
- Refactor shared nav/footer/meta into reusable templates or generated partials.
- Convert service pages into structured content.

### Phase 4
- Add Lighthouse, accessibility, and broken-link checks to CI.
- Add lightweight analytics for CTA and form conversion tracking.

## Delivery notes
- Keep code static-first and edge-friendly.
- Favor semantic HTML and progressive disclosure over heavier JS interactions.
- Avoid introducing decorative complexity that weakens clarity or maintainability.
