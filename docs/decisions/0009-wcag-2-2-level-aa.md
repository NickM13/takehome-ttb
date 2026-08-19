# Decision 0009: Adopt WCAG 2.2 Level AA

**Date:** 2026-08-18  
**Status:** Accepted

## Decision

WCAG 2.2 Level AA is the mandatory accessibility target for the complete user interface. All contributors and agents must follow `docs/accessibility.md` for implementation and verification of user-facing changes.

This target includes all applicable Level A and Level AA success criteria. Automated scanning is one required check, but it is not sufficient by itself. Keyboard, zoom/reflow, visual, dynamic-state, and assistive-technology testing are also required.

## Rationale

The application is intended for government reviewers with varied abilities, devices, and technical comfort. Adopting a single, current W3C baseline makes accessibility expectations testable and prevents accessibility from being treated as a final visual polish step. WCAG 2.2 also adds requirements relevant to this interface, including unobscured focus, non-drag alternatives, minimum pointer-target size, consistent help, avoiding redundant entry, and accessible authentication if authentication is later added.

## Consequences

- Known Level A or AA failures block completion of an affected UI feature unless the product owner explicitly accepts and documents a limitation.
- New components should use semantic HTML and native controls before custom ARIA widgets.
- Each UI handoff must include evidence from the checks required by `docs/accessibility.md`.
- A complete page-and-process audit is required before the product is publicly described as WCAG 2.2 Level AA conformant.
- This decision establishes a target and development process; it does not assert that the current application has already passed a full conformance audit.

## Sources

- [W3C Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C Understanding conformance](https://www.w3.org/WAI/WCAG22/Understanding/conformance)
- [W3C What is new in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
