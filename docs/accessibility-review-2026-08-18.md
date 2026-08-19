# UI Accessibility Review — 2026-08-18

## Outcome

The current UI received a source-level review against `docs/accessibility.md` and WCAG 2.2 Level AA. Confirmed issues were corrected and static regression coverage was added.

This review does **not** establish full WCAG conformance. The in-app test browser was unavailable, so the keyboard, zoom/reflow, forced-colors, visual-state, and screen-reader checks listed under Remaining manual verification still need to be completed in a rendered browser before a conformance claim or deployment accessibility sign-off.

## Scope

- Main page structure and form markup in `public/index.html`
- Responsive layout, focus styling, contrast, motion, tables, and content wrapping in `public/styles.css`
- Upload, validation, backlog, dynamic results, reviewer controls, focus movement, progress, and status behavior in `public/app.js`
- The single-label and batch-review UI states represented in the current source

## Method

- Reviewed the source against the mandatory WCAG 2.2 AA implementation rules in `docs/accessibility.md`.
- Calculated contrast ratios using the WCAG relative-luminance formula.
- Added static regression tests for core semantics, accessible dynamic-control names, contrast variables, focus treatment, and reduced-motion behavior.
- Ran formatting, linting, TypeScript checking, all automated tests, and a production build.
- Started the production server locally and confirmed that the page returned HTTP 200 with the corrected main target and upload description.

## Findings corrected

| Finding                                                                                                                                                                                   | Relevant criteria                                                                       | Correction                                                                                                                                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Small gold text in the introductory section had approximately 1.98:1 contrast against the page background.                                                                                | 1.4.3 Contrast (Minimum)                                                                | Added a dark gold text token with approximately 5.92:1 contrast while retaining the decorative gold on dark surfaces.                                                                                                                                            |
| The focus indicator had approximately 2.41:1 contrast against white and light-blue surfaces.                                                                                              | 1.4.11 Non-text Contrast; 2.4.7 Focus Visible                                           | Replaced it with a dark-blue indicator that has approximately 6.63:1 contrast against white, plus an outer white ring for visibility on dark surfaces. Applied it consistently to links, buttons, inputs, selects, textareas, summaries, and the upload control. |
| Input and select borders had approximately 2.31:1 contrast against white, and the upload boundary was also too light.                                                                     | 1.4.11 Non-text Contrast                                                                | Raised the standard control boundary to approximately 4.56:1 and the upload boundary to approximately 3.91:1 against its background.                                                                                                                             |
| The visually hidden file input was outside the styled label, so keyboard focus did not produce the intended visible upload focus state. A missing upload produced only a general message. | 2.1.1 Keyboard; 2.4.7 Focus Visible; 3.3.1 Error Identification; 3.3.3 Error Suggestion | Moved the native input inside its label, linked its instructions and error message, marks it invalid when empty, visibly marks the upload area, supplies a specific correction, and moves focus to the upload input.                                             |
| Repeated `Open review`, field decision, and reviewer-note controls did not have names that uniquely identified their reviews or fields.                                                   | 2.4.6 Headings and Labels; 4.1.2 Name, Role, Value                                      | Added the application/file identity to backlog actions and final decisions, and added visually hidden field-and-review context to every field decision and note label.                                                                                           |
| Application and verification-field cells were ordinary data cells instead of row headers.                                                                                                 | 1.3.1 Info and Relationships                                                            | Rendered them as `th scope="row"` while preserving the responsive card-style table layout.                                                                                                                                                                       |
| Batch application fields lacked an explicit programmatic relationship to their file summary.                                                                                              | 1.3.1 Info and Relationships                                                            | Added a named group for each file's batch fields using the corresponding summary as its label.                                                                                                                                                                   |
| Help text for the application ID, country of origin, sample selector, and upload constraints was visible but not consistently referenced by the associated controls.                      | 1.3.1 Info and Relationships; 3.3.2 Labels or Instructions                              | Added `aria-describedby` relationships to the relevant controls.                                                                                                                                                                                                 |
| Verification progress was represented primarily by a changed disabled-button label and spinner.                                                                                           | 4.1.3 Status Messages                                                                   | Added a visible polite live status, `aria-busy` on the form, and separate assertive behavior for errors.                                                                                                                                                         |
| Scripted scrolling always requested animation, even when reduced motion was requested.                                                                                                    | Project accessibility policy                                                            | Scripted scrolling now uses immediate movement when `prefers-reduced-motion: reduce` is active. Existing CSS also suppresses animations in that mode.                                                                                                            |
| Long filenames and result metadata could be visually truncated.                                                                                                                           | 1.4.10 Reflow                                                                           | Essential filenames and metadata now wrap instead of being replaced by an ellipsis.                                                                                                                                                                              |
| The skip link bypassed only to the verification form rather than the beginning of the main content.                                                                                       | 2.4.1 Bypass Blocks                                                                     | The skip link now targets a programmatically focusable main landmark.                                                                                                                                                                                            |

## Existing behavior retained

- The document declares English and uses header, main, footer, section, aside, heading, fieldset, and legend semantics.
- Native HTML controls remain keyboard operable without custom widget behavior.
- Both backlog and result tables have accessible captions and column headers.
- Match, mismatch, needs-review, and reviewer-decision states use text in addition to color.
- Images have text alternatives, while decorative marks and icons are hidden from assistive technology.
- Main controls exceed the WCAG 2.2 24-by-24 CSS-pixel minimum target size. Inline text links use the inline-target exception.
- The narrow layout presents table values with visible labels while retaining the original table semantics in the document.
- Dynamic results move focus to a named results heading, and reopening a backlog item now sets the correct heading before focus is moved.

## Automated verification

All completed successfully after the corrections:

- `npm run format`
- `npm run lint`
- `npm run typecheck`
- `npm test`: 8 files and 48 tests passed
- `npm run build`
- Production-server smoke check: home page returned HTTP 200 and contained the corrected main skip target and upload description

The new static tests are useful regression guards, but they do not replace testing the rendered accessibility tree or actual interaction.

## Remaining manual verification

Complete these checks in a rendered browser before accessibility sign-off:

1. Use only `Tab`, `Shift+Tab`, `Enter`, `Space`, arrow keys, and `Escape` as applicable to complete upload, sample selection, batch editing, verification, backlog reopening, reviewer decisions, notes, and CSV download.
2. Confirm focus order, visibility, and non-obscuration in every state, including the upload error, opened `details` elements, loading, results, and review-another transition.
3. Test at 200% text size, 400% browser zoom, and a 320 CSS-pixel viewport with long filenames, values, explanations, validation messages, and batch results.
4. Apply the WCAG text-spacing overrides and confirm that no labels, buttons, status badges, or table content are clipped or overlapped.
5. Check default, hover, focus, selected, invalid, disabled, success, mismatch, and needs-review states visually and with a contrast tool.
6. Test Windows forced-colors/high-contrast mode and reduced-motion mode.
7. Test the complete core flow using current NVDA with Firefox or Chrome, including landmarks, headings, labels, descriptions, error announcements, progress, table navigation, result focus, reviewer controls, and final decisions.
8. Confirm that the responsive CSS presentation does not remove table relationships from the accessibility tree in each supported browser.
9. Run an automated browser scanner such as axe on the initial page, validation-error state, populated preview and batch state, loading/error states, backlog review, and each result status.

Any issue found during these checks must be corrected or documented as an explicit product-owner limitation before the UI is described as WCAG 2.2 Level AA conformant.
