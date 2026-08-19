# Accessibility Policy — WCAG 2.2 Level AA

## Status and scope

This policy is mandatory for every user-interface or user-facing content change in this repository. The application targets the [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/) at Level AA, which includes every applicable Level A and Level AA success criterion.

The policy applies to the complete experience, including:

- Application-value forms, label upload, image previews, and batch controls
- Loading, progress, empty, validation, provider-error, and timeout states
- The review backlog and reopening a saved-in-session review
- Field comparisons, reviewer notes, field dispositions, and final decisions
- CSV download controls and any help or instructional content
- Every responsive layout, supported viewport, zoom level, and interaction mode

A feature is not complete when an affected Level A or AA requirement is known to fail. Record an unavoidable limitation and raise it to the product owner rather than silently shipping it. Do not describe the application as "WCAG compliant" based only on this policy, an automated scan, or a partial review. A conformance claim requires an audit of every page, complete process, state, and responsive variation in scope.

WCAG 2.2 success criterion 4.1.1, Parsing, is obsolete and removed. Valid, semantic HTML remains required because it improves interoperability and makes the other criteria easier to satisfy.

## Required workflow for agents and contributors

Before changing the interface:

1. Read this document in full.
2. Identify the affected user journeys, UI states, and WCAG criteria.
3. Prefer native HTML elements and browser behavior over custom widgets.
4. Preserve existing accessibility behavior while making the change.
5. Perform the automated and manual checks in this document.
6. Report what was tested, what was not tested, and any remaining limitation in the handoff or pull request.

Automated tooling can find only some accessibility failures. Passing an automated scanner never replaces keyboard, zoom/reflow, visual, and assistive-technology checks.

## Mandatory implementation rules

### Perceivable

- Give every informative image a useful text alternative. Use `alt=""` for a purely decorative image. For user-uploaded label previews, identify the file or preview without inventing label content that has not been verified.
- Use headings, landmarks, lists, labels, table headers, and other semantic structure that communicates the same relationships visually and programmatically.
- Do not communicate an instruction or result only through color, shape, position, sound, or an icon. `Matches`, `Does not match`, and `Needs review` must remain available as text.
- Maintain a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text. Meaningful component boundaries, icons, and focus indicators must have at least 3:1 contrast against adjacent colors. Check default, hover, focus, selected, disabled, validation, and status states.
- Support text resizing to 200% without loss of content or function. At 400% browser zoom or a 320 CSS-pixel viewport, content must reflow without loss, overlap, or two-dimensional scrolling. A genuinely two-dimensional data table may scroll horizontally, but its surrounding workflow must still reflow.
- Do not clip or overlap content when users increase line height, paragraph spacing, letter spacing, or word spacing to the WCAG text-spacing values.
- Do not use images of text when real text can present the same information.
- Do not lock the interface to one display orientation.
- If audio or video is added, supply all applicable captions, transcripts, audio descriptions, and alternatives before release.

### Operable

- Every action must work with a keyboard alone. Support expected keys for the native control, including `Tab`, `Shift+Tab`, `Enter`, `Space`, and `Escape` where applicable. Never create a keyboard trap.
- Keep DOM order, reading order, and focus order logical. Do not use positive `tabindex` values to repair a visually reordered layout.
- Show a clear focus indicator on every interactive element. Keyboard focus must not be entirely hidden by sticky headers, banners, dialogs, or other author-created content.
- Provide a skip link and appropriate page landmarks when repeated navigation or header content precedes the main workflow.
- Make pointer targets at least 24 by 24 CSS pixels or provide the spacing/equivalent-target exception defined by WCAG 2.2. Prefer approximately 44 by 44 CSS pixels for important actions where the design permits it.
- Do not require dragging. Provide a single-pointer alternative such as buttons, a file picker, or direct value entry.
- Do not complete a destructive or consequential pointer action on pointer-down. Let the user cancel before pointer-up wherever possible.
- Do not require multipoint or path-based gestures when a simple pointer action can do the job.
- Respect `prefers-reduced-motion`. Avoid unnecessary animation, provide controls for moving content, and never include content that flashes more than the permitted threshold.
- Avoid time limits. If one is essential, let the user turn it off, adjust it, or extend it. Do not silently discard entered review data because of inactivity.
- If single-key shortcuts are introduced, let users turn them off, remap them, or limit them to when the relevant component has focus.

### Understandable

- Set the page language in HTML and identify passages in another language when assistive technology needs that information.
- Use plain, consistent names for repeated controls and concepts. Do not change the meaning of `Approve`, `Reject`, `Needs review`, or `Download CSV` between screens.
- Give every input a persistent visible label and programmatic label. Describe formats, constraints, and required fields before submission; do not rely on placeholder text or an asterisk alone.
- Make validation errors specific, associate them with the affected fields, explain how to correct them, and preserve other entered values. When a correction is known, suggest it unless doing so would create a security or regulatory risk.
- Do not trigger submission, navigation, or another unexpected context change merely because a control receives focus or a value changes. Explain any unavoidable behavior in advance.
- Keep repeated navigation, identification, and help mechanisms in a consistent order and location.
- Do not require users to re-enter information already supplied in the same process when it can be safely populated or selected. Batch review may offer copied values, but each file's values must remain reviewable and editable.
- If authentication is added later, support password managers and paste, and do not require a cognitive-function test unless an accessible alternative or another WCAG exception applies.

### Robust

- Use native controls before ARIA recreations: `button`, `a`, `input`, `select`, `textarea`, `fieldset`, `legend`, `table`, and `dialog` where supported and appropriate.
- Give every control an accessible name and expose its current role, state, and value. The visible control text must be included in the accessible name.
- Keep HTML IDs unique. Associate labels, descriptions, validation errors, table headers, and grouped controls programmatically.
- Announce important asynchronous changes with restrained live regions such as `role="status"` or `role="alert"`. Do not announce every keystroke or repeatedly announce unchanged content.
- When adding results dynamically, preserve heading structure and table relationships. Move focus only when doing so helps the user understand a major context change; otherwise announce the update without stealing focus.
- Put user-entered and AI-observed content into text nodes, not executable HTML.
- Do not visually hide an interactive element while leaving it focusable.
- Use ARIA only when native HTML cannot express the required behavior, and validate all roles, properties, and states.

## Project-specific acceptance criteria

### Upload and batch entry

- The upload area must include an operable native file input even if a drag-and-drop surface is also present.
- Each preview must expose the filename and relevant file details as text. Every remove, replace, or reorder action must have a unique accessible name and a non-drag alternative.
- Each batch item's fields must be grouped under a heading or `fieldset` that identifies the associated file.
- Upload type, size, unreadable-image, timeout, and provider errors must be announced and must explain the next action.

### Backlog and review results

- Backlog and result tables must use table semantics, a caption or equivalent accessible name, and correctly associated column and row headers.
- Repeated actions such as `Open review` must have an accessible name that identifies the review, not only the action.
- AI status and final human decision must be clearly labeled as separate values and must never rely on color alone.
- Every reviewer-note field and disposition control must have a unique label tied to its verification field.
- Responsive table treatment must retain the programmatic relationship between each value and its header. If a wide table scrolls, all controls and essential context must remain reachable at 320 CSS pixels.

### Dynamic behavior and downloads

- Verification progress must be announced once when it starts and once when it finishes or fails. Disabled controls must remain understandable, and duplicate submission prevention must not strand keyboard users.
- New results must have a descriptive heading, and screen-reader users must be told that the results are available.
- Download links or buttons must state their purpose. CSV reports must contain text headers and textual status values so the report does not depend on visual styling.
- If a modal dialog is introduced, it must have a name, move focus inside on open, contain focus while open, close with `Escape` unless unsafe, and restore focus to the opener.

## Required verification before handoff

Run these checks for every affected flow and UI state. A change may reuse documented evidence only when that behavior was not affected.

### Automated checks

- Run the repository formatter, linter, type checker, tests, and production build as applicable.
- Run an accessibility scanner such as axe against the relevant rendered states. Resolve all serious and critical findings and investigate every other finding.
- Validate HTML and ARIA when markup or widget behavior changes.

### Manual keyboard checks

- Start at the top of the page and complete the affected flow without a mouse.
- Confirm logical focus order, visible and unobscured focus, expected keyboard activation, no traps, and sensible focus after errors or dynamic updates.
- Confirm all hover-only information is also available by keyboard and can be dismissed when required.

### Zoom, reflow, and visual checks

- Test text at 200% and the full interface at 400% zoom or a 320 CSS-pixel viewport.
- Test portrait and landscape orientation, long values, validation messages, and browser text-spacing overrides.
- Check contrast in every interactive and status state, Windows forced-colors/high-contrast mode, and reduced-motion mode.
- Confirm that meaning does not depend on color and that no content is lost, clipped, overlapped, or unexpectedly hidden.

### Screen-reader checks

- Test the core affected flow with a current screen reader and supported browser. For this project's Windows environment, NVDA with Firefox or Chrome is an appropriate baseline.
- Verify landmarks, headings, labels, instructions, errors, progress announcements, table navigation, status text, reviewer notes, dispositions, and final decisions.
- If an appropriate screen reader is unavailable, record the gap. Do not claim complete conformance until the check has been performed.

### State coverage and evidence

At minimum, exercise the happy path, client validation, upload failure, loading, provider failure, match, mismatch, needs-review, backlog reopening, field approval/rejection, reviewer notes, final decision, CSV download, batch entry, and narrow viewport where those states exist.

The handoff or pull request must record:

- Pages, flows, breakpoints, and states tested
- Browser, scanner, and assistive-technology names and versions
- Test date and results
- Failures corrected during the change
- Untested, not-applicable, or unresolved criteria and the reason

Perform a complete accessibility audit before a deployment handoff or public conformance statement, and repeat it after major navigation, component-library, form, table, or workflow changes.

## Level A and AA coverage checklist

Use this inventory to prevent a new or less-visible criterion from being overlooked. Applicability depends on the content and behavior being changed.

- **1.1 Text Alternatives:** 1.1.1
- **1.2 Time-based Media:** 1.2.1–1.2.5, if media is present
- **1.3 Adaptable:** 1.3.1–1.3.5
- **1.4 Distinguishable:** 1.4.1–1.4.5 and 1.4.10–1.4.13
- **2.1 Keyboard Accessible:** 2.1.1, 2.1.2, and 2.1.4
- **2.2 Enough Time:** 2.2.1 and 2.2.2
- **2.3 Seizures and Physical Reactions:** 2.3.1
- **2.4 Navigable:** 2.4.1–2.4.7 and 2.4.11
- **2.5 Input Modalities:** 2.5.1–2.5.4, 2.5.7, and 2.5.8
- **3.1 Readable:** 3.1.1 and 3.1.2
- **3.2 Predictable:** 3.2.1–3.2.4 and 3.2.6
- **3.3 Input Assistance:** 3.3.1–3.3.4, 3.3.7, and 3.3.8
- **4.1 Compatible:** 4.1.2 and 4.1.3

The WCAG 2.2 criteria that are new compared with WCAG 2.1 and apply at Level A or AA are 2.4.11 Focus Not Obscured (Minimum), 2.5.7 Dragging Movements, 2.5.8 Target Size (Minimum), 3.2.6 Consistent Help, 3.3.7 Redundant Entry, and 3.3.8 Accessible Authentication (Minimum).

## Authoritative references

- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [Understanding WCAG 2.2 conformance](https://www.w3.org/WAI/WCAG22/Understanding/conformance)
- [What is new in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- [Understanding WCAG 2.2 success criteria](https://www.w3.org/WAI/WCAG22/understanding/)
- [How to refer to WCAG](https://www.w3.org/WAI/WCAG22/Understanding/refer-to-wcag)

Last reviewed against the W3C sources above: 2026-08-18.
