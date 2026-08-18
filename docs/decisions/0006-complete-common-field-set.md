# Decision 0006: Complete common label field set

Date: 2026-08-18

## Decision

Verify all seven common fields named in the project brief:

1. Brand name
2. Class/type designation
3. Alcohol content
4. Net contents
5. Bottler or producer name and address
6. Country of origin for imports
7. Government health warning

Bottler/producer name and address is required application data. Country of
origin is optional and should be provided only for imported products. The
government warning remains a centrally configured deterministic rule instead
of caller-entered wording.

## Conditional country behavior

For a domestic application with no expected country, no detected import-origin
statement is a match. A readable country-of-origin statement on that label
returns `needs_review` because the application may be incomplete; it is not
treated as a definitive mismatch. For an imported application, compare the
entered country with the explicit label statement using conservative case and
spacing normalization.

The extraction provider must not infer origin from a city, state, appellation,
or regional designation.

## Consequences

- The form, per-label batch editor, provider schema, results table, CSV, and
  partial-failure rows all share the complete field contract.
- Domestic users do not need to enter a placeholder country.
- Address qualifiers such as "Bottled by" remain visible evidence and are not
  removed automatically.
