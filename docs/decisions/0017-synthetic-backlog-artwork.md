# Decision 0017: Add deterministic artwork for every demo review

**Date:** 2026-08-19  
**Status:** Accepted

## Decision

Provide one distinct, repository-backed label-artwork fixture for each of the 12
reviews in `public/sample-reviews.csv`. Keep the fictional `.png` source filename
in the review record and explicitly map it to a corresponding SVG under
`public/sample-labels/demo/` for display.

The SVGs are synthetic prototype fixtures. They include the visible product
identity and field evidence represented by each review, including deliberate
omissions, mismatches, and obscured text. They are clearly marked as synthetic
and not for sale.

## Rationale

The sample queue previously referenced filenames with no corresponding artwork,
so opening a demo review showed an unavailable message. Reusing one of the three
official TTB sample images would misrepresent which artwork produced the review.

Deterministic vector fixtures keep the regulatory wording and deliberate evidence
states legible and reproducible. Generative raster artwork is not used because
image-model typography could introduce accidental wording changes that conflict
with the fixture result.

## Consequences

- Every initial backlog review now displays distinct label artwork.
- The mapping is an explicit allowlist; arbitrary uploaded filenames do not
  become static asset paths.
- Existing contextual image alternative text and the unavailable-artwork fallback
  remain in place.
- SVG remains a display-fixture format only and is not accepted by the upload API.
- The artwork is synthetic evidence for the MVP demo and must not be represented
  as an approved label or regulatory determination.
