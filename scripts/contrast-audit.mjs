// WCAG contrast audit for AccessStudio. Run: node scripts/contrast-audit.mjs
// Computes real contrast ratios for every text/background pairing used in
// the app shell and in the four student looks. WCAG AA needs 4.5:1 for
// normal text and 3:1 for large text (18pt+ / 24px+ bold).

function luminance(hex) {
  const rgb = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function ratio(fg, bg) {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

const pairs = [
  // App shell (white background)
  ["Body text soil #3E2718", "#3E2718", "#FFFFFF", "normal"],
  ["Leaf green text #2E5B2E", "#2E5B2E", "#FFFFFF", "normal"],
  ["Terracotta text #B4551F", "#B4551F", "#FFFFFF", "normal"],
  ["White on leaf button #2E5B2E", "#FFFFFF", "#2E5B2E", "normal"],
  ["White on leaf hover #244723", "#FFFFFF", "#244723", "normal"],
  ["White on terracotta button #B4551F", "#FFFFFF", "#B4551F", "normal"],
  ["White on terracotta hover #9A4517", "#FFFFFF", "#9A4517", "normal"],
  ["Soil text on sage panel #EDF3E8", "#3E2718", "#EDF3E8", "normal"],
  ["Leaf text on sage panel #EDF3E8", "#2E5B2E", "#EDF3E8", "normal"],
  ["Soil text on paper #FFFDF8", "#3E2718", "#FFFDF8", "normal"],
  ["Leaf text on paper #FFFDF8", "#2E5B2E", "#FFFDF8", "normal"],
  ["White on soil #3E2718 (skip link)", "#FFFFFF", "#3E2718", "normal"],
  // Four student looks (palettes handed to Claude)
  ["Bright: soil on #FFF6DB", "#3E2718", "#FFF6DB", "normal"],
  ["Bright: white on accent #B4551F", "#FFFFFF", "#B4551F", "normal"],
  ["Calm: dark teal #14343B on #EAF4F6", "#14343B", "#EAF4F6", "normal"],
  ["Calm: white on accent #1F5E6B", "#FFFFFF", "#1F5E6B", "normal"],
  ["Sunset: brown #4A2310 on #FDF0E6", "#4A2310", "#FDF0E6", "normal"],
  ["Sunset: white on accent #9A4517", "#FFFFFF", "#9A4517", "normal"],
  ["Bold: black on white", "#000000", "#FFFFFF", "normal"],
  ["Bold: white on black", "#FFFFFF", "#000000", "normal"],
];

let failed = 0;
for (const [name, fg, bg, size] of pairs) {
  const r = ratio(fg, bg);
  const need = size === "normal" ? 4.5 : 3.0;
  const pass = r >= need;
  if (!pass) failed++;
  console.log(
    `${pass ? "PASS" : "FAIL"}  ${r.toFixed(2)}:1  (needs ${need.toFixed(1)}:1)  ${name}  [${fg} on ${bg}]`,
  );
}
console.log(failed === 0 ? "\nAll pairings pass WCAG AA." : `\n${failed} pairing(s) FAIL WCAG AA.`);
process.exit(failed === 0 ? 0 : 1);
