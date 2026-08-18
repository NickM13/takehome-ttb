# Sample label sources

The sample-label selector uses three fictitious examples published by the U.S.
Alcohol and Tobacco Tax and Trade Bureau (TTB):

| Local sample                   | TTB source                                                                                                                                                                      | Type              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `captain-johns-spiced-rum.png` | [Anatomy of a Distilled Spirits Label](https://www.ttb.gov/regulated-commodities/beverage-alcohol/distilled-spirits/ds-labeling-home/anatomy-of-a-distilled-spirits-label-tool) | Distilled spirits |
| `lighthouse-chardonnay.png`    | [Anatomy of a Wine Label](https://www.ttb.gov/regulated-commodities/beverage-alcohol/wine/anatomy-of-a-label)                                                                   | Wine              |
| `malt-and-hop-ale.png`         | [Anatomy of a Malt Beverage Label](https://www.ttb.gov/regulated-commodities/beverage-alcohol/beer/labeling/anatomy-of-a-malt-beverage-label-tool)                              | Malt beverage     |

TTB publishes each example as separate front- and back-label image strips for
its interactive anatomy tools. The local PNGs only reconstruct those strips in
their published order and place the two panels side by side. No wording,
branding, or regulatory content was generated or retouched.

TTB states that text and images on its website may be copied freely, except for
official seals, names, symbols, or separately copyrighted material, provided
credit is given to TTB. See TTB's
[Privacy Policy and Legal Notice](https://www.ttb.gov/about-ttb/privacy-policy).
These samples contain fictitious product branding and no TTB seal.

The examples are demo fixtures, not proof that the verifier supports every
beverage-specific regulation. The current MVP checks the seven common fields
and may correctly return `needs_review` for unsupported unit forms or visual
rules.
