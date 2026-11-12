# Contrast Audit — AccessStudio

Checked with `node scripts/contrast-audit.mjs` on 2026-11-11. WCAG AA
needs 4.5:1 for normal text and 3:1 for large text. Every pairing below
is normal text and was checked against 4.5:1.

## App shell (white background)

| Pairing | Ratio | Result |
| --- | --- | --- |
| Body text soil #3E2718 on white #FFFFFF | 13.92:1 | PASS |
| Leaf green text #2E5B2E on white | 7.92:1 | PASS |
| Terracotta text #B4551F on white | 4.93:1 | PASS |
| White on leaf button #2E5B2E | 7.92:1 | PASS |
| White on leaf hover #244723 | 10.50:1 | PASS |
| White on terracotta button #B4551F | 4.93:1 | PASS |
| White on terracotta hover #9A4517 | 6.49:1 | PASS |
| Soil text on sage panel #EDF3E8 | 12.32:1 | PASS |
| Leaf text on sage panel #EDF3E8 | 7.01:1 | PASS |
| Soil text on paper #FFFDF8 | 13.70:1 | PASS |
| Leaf text on paper #FFFDF8 | 7.79:1 | PASS |
| White on soil #3E2718 (skip link) | 13.92:1 | PASS |

## Four student looks (palettes handed to Claude)

| Pairing | Ratio | Result |
| --- | --- | --- |
| Bright: soil #3E2718 on #FFF6DB | 12.90:1 | PASS |
| Bright: white on accent #B4551F | 4.93:1 | PASS |
| Calm: dark teal #14343B on #EAF4F6 | 11.85:1 | PASS |
| Calm: white on accent #1F5E6B | 7.31:1 | PASS |
| Sunset: brown #4A2310 on #FDF0E6 | 12.20:1 | PASS |
| Sunset: white on accent #9A4517 | 6.49:1 | PASS |
| Bold: black on white | 21.00:1 | PASS |
| Bold: white on black | 21.00:1 | PASS |

## Result

20 of 20 pairings pass WCAG AA. The tightest pairing is terracotta
#B4551F on white at 4.93:1, still above the 4.5:1 line.

Note: the generated apps themselves are built by Claude from these
palettes and the same contrast rules, which are written into the system
prompt. The numbers above cover the palettes; a generated app's exact
text colors depend on Claude following the palette, so spot-check a
generated app's colors in the browser before class.
