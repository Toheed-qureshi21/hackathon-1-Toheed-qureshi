---
name: redeemtrip-design
description: Use when creating, implementing, reviewing, or refining RedeemTrip frontend UI. Inspect the nested Stitch brand design system, screenshots, guidelines, and supplied assets; maintain visual consistency and centralized design tokens.
---

# RedeemTrip Design Skill

## Purpose

Implement a cohesive, production-quality RedeemTrip interface using the existing application architecture and the exported Stitch brand design system.

The goal is to translate the available visual references into reusable React components, not to copy exported HTML into the application.

## 1. Inspect the Reference Directory

The design reference root is:

`docs/design-reference/brand-design-system/`

Inspect this directory recursively. It contains the Stitch export and may contain nested folders for individual screens, brand guidelines, and supporting assets.

Do not assume that all reference files are directly inside the root directory.

### Inspection procedure

1. List the root directory and its nested folders.
2. Locate available design guidelines, especially `DESIGN.md` and other Markdown documentation.
3. Locate screenshots such as `screen.png`.
4. Locate logos, SVGs, images, icons, fonts, and other exported assets.
5. Read relevant documentation and inspect screenshots before implementation.
6. Match each reference to its intended page or component.
7. Check whether the corresponding page or component already exists in the application.

The former standalone HTML references have been deleted. Do not require `code.html`, `styles.css`, or other deleted HTML exports as prerequisites.

If a file is missing, work with the available evidence and identify any material uncertainty.

## 2. Establish the Design Evidence

Use this priority order:

1. Explicit requirements in the current user request.
2. Existing brand guidelines and design tokens.
3. Relevant Stitch screenshots and screen-specific visual references.
4. Existing application components and established patterns.
5. A minimal, brand-consistent design decision for unspecified details.

Do not invent undocumented design specifications and claim they came from Stitch.

When screenshot details are ambiguous, use judgment while preserving the existing brand identity.

## 3. Preserve the Existing Application

Before editing:

- Inspect the relevant route, page, and components.
- Identify existing shared components and their consumers.
- Understand existing form behavior, validation, authentication, API calls, and navigation.
- Identify which styles and tokens already exist.
- Determine whether the requested task requires a new screen, a localized improvement, or a shared component change.

Do not rebuild an existing page from scratch when a targeted change is sufficient.

Login, signup, and the AI trip planner have already been implemented. Preserve their working behavior and routing unless the user explicitly requests changes.

Do not convert static reference documents into production routes.

## 4. Apply the Shared Design System

The central token source is:

`app/globals.css`

The project uses Tailwind CSS v4 and its CSS-first theme architecture.

Before adding styling:

1. Inspect existing theme variables and semantic mappings.
2. Reuse existing semantic tokens.
3. Add or modify shared tokens centrally only when necessary.
4. Use those tokens throughout the affected components.
5. Avoid duplicate color palettes or component-specific copies of shared design values.

### Brand palette

- Midnight: `#080B14`
- Deep Navy: `#101625`
- Elevated Surface: `#171F31`
- Border: `#273149`
- Primary Text: `#F4F7FC`
- Secondary Text: `#9AA7BD`
- Lime: `#C7F36B`
- Mint: `#72E6C1`
- AI Blue: `#7EA7FF`
- Violet: `#A78BFA`
- Danger: `#FF7C86`

Typography:

- Headings: Space Grotesk
- Body: Inter

Reuse existing font configuration and semantic tokens. Do not introduce duplicate font imports or unnecessary Tailwind configuration.

## 5. Asset Discovery and Usage

Search the nested reference directories before creating replacements.

For each relevant asset:

- Confirm the file actually exists.
- Inspect its intended purpose and appearance.
- Reuse the supplied file when appropriate.
- Preserve the official RedeemTrip logo without redrawing or replacing it.
- Keep reference assets separate from production assets.
- Place assets needed by the application in the project's existing asset organization.
- Use descriptive filenames and valid asset paths.

Never assume a file exists just because it appears in a design description.

Do not use random stock imagery, emoji in place of brand icons, fabricated external URLs, or arbitrary logo alternatives.

If the design references require an asset that is unavailable, report the gap and choose a restrained fallback only when implementation must proceed.

## 6. Translate Screenshots into React UI

For each requested screen:

1. Identify the page's major sections and information hierarchy.
2. Compare layout, spacing, typography, colors, borders, radii, imagery, and component states against the reference.
3. Identify existing components that can be reused.
4. Implement the screen using the existing Next.js and React architecture.
5. Use semantic HTML, shared tokens, and existing shadcn/ui components where appropriate.
6. Ensure forms and controls have real, appropriate behavior.
7. Match the reference at desktop sizes and adapt it deliberately for mobile.

Do not reproduce the screenshot as a flat background image. The page must remain a functional, responsive interface.

Do not copy an entire exported HTML document into a React component.

## 7. Reusable Component Strategy

Prefer consistent shared components for:

- Buttons and links.
- Inputs, selects, and date pickers.
- Cards and information panels.
- Navigation and page headers.
- Dialogs and dropdowns.
- Flight result cards.
- Cash-versus-points comparisons.
- Loading, empty, error, and success states.

Inspect existing components before creating new ones.

Do not create abstractions for every small element. Extract a shared component when it improves consistency, reuse, or maintainability.

Avoid unrelated refactoring during a screen-specific task.

## 8. RedeemTrip Product-Specific Visual Requirements

RedeemTrip is a premium travel-fintech product centered on AI-assisted trip planning and rewards redemption.

Maintain:

- Clear distinction between cash prices and points or miles.
- Readable flight details, schedules, and fare information.
- Transparent redemption comparisons.
- Clear explanations of estimated savings and their assumptions.
- A consistent AI-assistant visual language.
- Trustworthy booking and confirmation interfaces.
- A coherent experience across authentication, trip planning, flight selection, and booking.

Never present mock flight results, invented availability, or unverified savings as real provider data.

Clearly distinguish demonstration data from live results.

## 9. Responsive Behavior and Accessibility

For affected screens, check:

- Desktop, tablet, and mobile layouts.
- Navigation and menus.
- Form controls and validation messages.
- Flight-result cards and comparison layouts.
- Dialogs and booking-review content.
- Keyboard navigation and focus visibility.
- Accessible labels and semantic elements.
- Text contrast and reduced-motion preferences.

Avoid horizontal overflow, clipped controls, and layouts that become unusable on small screens.

## 10. Motion and Interaction

Use animation only when it improves feedback, hierarchy, or perceived responsiveness.

- Keep transitions consistent and restrained.
- Respect reduced-motion preferences.
- Avoid unnecessary animation libraries if the project already has an appropriate solution.
- Provide clear loading and disabled states.
- Do not make nonfunctional controls appear interactive.

## 11. Verification

After implementation:

1. Review the changed components and shared token usage.
2. Confirm that existing behavior remains intact.
3. Check for unnecessary hardcoded styling and duplicate components.
4. Run the available lint, type-check, and build commands when appropriate.
5. Verify responsive behavior for affected screens.
6. Report completed changes, reused assets, missing references, and any remaining issues.

Do not claim tests passed unless they were actually run.

Do not commit or push unless explicitly requested.

## Expected Outcome

Deliver a functional React implementation that respects the supplied brand system, matches the relevant visual references, reuses existing application components, and keeps design tokens centralized.