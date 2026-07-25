# 26 — AI Design Stack

Purpose: give the agent a practical map of external skills, references, UI kits, libraries, and tools so it can choose the right resource instead of designing from a blank prompt.

Core rule: do not browse or load everything. Pick 1–3 resources based on the project surface and current bottleneck.

## Agent skills and design layers

- MengTo Skills — reference capture, video-to-superprompt, stitched full-page capture, HTML-to-interaction prompts, landing/page/motion/WebGL workflows.
- Taste Skill — anti-AI-slop design layer for layout, typography, hierarchy, spacing, and polish.
- UI Skills — targeted UI correction directory for spacing, accessibility, motion, performance, baseline UI, and interaction issues.
- Better Design — design systems, shadcn/ui, tokens, components, and brand-inspired component systems.
- design-skill.lovable.app — Lovable-focused design behavior layer. Use as project Knowledge when building in Lovable.
- impeccable.style — high-quality visual direction reference.

## Reference discovery

Use when a visual direction is weak, generic, or missing.

Landing / SaaS / marketing:
- Awwwards, SiteInspire, Land-book, Landingfolio, SaaSFrame, SaaS Landing Page by Cruip, Lapa Ninja, One Page Love, Best Website Gallery, Godly, Admire The Web, Nice Very Nice.

Mobile / app flows:
- Mobbin, Pageflows, UX Archive, Screenlane, Pttrns, Scrnshts, UI Sources, Flowstep.

UI patterns / interactions:
- Collect UI, UI Jar, UI Garage, UI Movement, Hover States, User Interface Design Patterns, UI Recipes, NPM UI Patterns, Good UI, GoodUX.

Design systems / craft:
- Design Systems Repo, UXPin, Smashing Magazine, UX Collective, Designmodo, Codrops, Web Designer Depot.

Visual taste / creative risk:
- Behance, Dribbble, Pinterest, Instagram, Designspiration, Abduzeedo, Inspiration Grid, Muzli, Dark Mode Design, Minimal Gallery, Design Vault, Refero.

Framer / Webflow / templates:
- Framer Gallery, Flowbase, FigmaCrush, Lapa Ninja, One Page Love, UIKits.design, BestWebsiteTemplate.com.

Community / trends:
- X, Designer News, UX Magazine, Boxes and Arrows, 99designs Discover.

## UI kits and component systems

- UIKits.design — UI kit directory for Figma, Framer, Webflow, and Code.
- Meridan Lite — IoT Dashboard & Design System. Use for dashboard references, KPI cards, status badges, device/detail drawers, empty states, tables, light/dark variables, and mobile dashboard adaptation.
- Better Design — shadcn/ui-based design systems and component/tokens inspiration.

Rule: use kits as structure and component acceleration, not as final design. Replace generic sections with project promise, proof, limitations, and evaluator path.

## Iconography / UI asset libraries

Use one icon family per surface.

- Reicon — open-source SVG icon library for UI design, React, web development, and Figma.
- Nucleo — pixel-perfect broad icon coverage.
- Central Icons — modern product/SaaS icon style.
- 123Done Product Icons on UI8 — landing page, dashboard, and UI kit icons.
- Untitled UI Icons — Figma and React product UI icons.

Iconography decision must specify: icon set, style, stroke weight, corner style, size system, where icons appear, and where icons should not appear.

## UI component and interaction libraries

Use when interaction quality or product credibility improves, not for decoration.

- NumberFlow — animated numbers for KPI cards, balances, metric deltas, before/after values, and proof moments.
- input-otp — polished OTP/code verification input.
- Liveline — real-time charts and live data visuals.
- Leva — tweakable control panels for demos, prototypes, and dev-facing interfaces.
- cmdk — command menus, quick search, keyboard-first actions.
- Virtuoso — virtualization for long lists, logs, transactions, search results, and datasets.
- dnd kit — drag-and-drop interactions, boards, builders, ordering, and prioritization.

Interaction budget: use 0–2 special UI libraries by default. Each must support the main product moment or proof moment.

## Motion, micro-interactions, and developer utilities

- Kinetics by Colorion — open-source CSS/React motion snippets with prompts.
- Ripplix — UI animation and micro-interaction library.
- Coverflow by Ashish Gogula — iOS-like Cover Flow for React. Use only when carousel browsing improves the product moment.
- Gradient Buttons by Colorion — gradient buttons with hover effects for stronger CTA treatments.
- Docker Awesome Compose — Docker Compose samples for reproducible dev environments and fast backend scaffolding.

Motion budget: use 1–2 special motion patterns per page. Do not animate critical proof text, evidence labels, or limitations. Respect reduced motion.

## Visual assets and production tools

- Grainient.supply — gradients, grain, textures, hero/background assets.
- Fontshare — high-quality fonts and font pairing options.
- remove.bg — image background removal.
- Midjourney — image generation and visual moodboards.
- Kling AI — image-to-video, animation, motion, teasers.
- Figmify.ai — image/Figma conversion. Verify before core workflow.
- YumCut — short-form/faceless video pipeline reference: idea → script → scenes → voice → captions → export.

## Research and learning references

- Adham Dannaway Design Resources — UX/UI/design system/accessibility learning and checklist reference.
- Maze UX Research Guide — qualitative vs quantitative, attitudinal vs behavioral, generative vs evaluative methods.

## Selection rule

Before using any resource, answer:
- What is the current bottleneck?
- Which surface is active?
- What resource fixes that bottleneck fastest?
- What must not change?
- What acceptance check proves the result improved?
