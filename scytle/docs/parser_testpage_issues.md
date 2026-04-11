Here are the issues found by comparing the parsed canvas output vs the browser preview (ground truth):

  Layout / Grid Problems

  1. Grid layouts not rendering as grid — All grid-cols-* layouts (4-col stats, 2x3 features, 3-col dashboard, 3-col pricing, 4-col footer) render as
  single-column vertical stacks instead of multi-column grids
  2. row-span-* / col-span-* not working — The features section's tall left card (row-span-2) and full-width bottom card (col-span-2) don't span multiple
  grid tracks. Same for dashboard's col-span-2 revenue card
  3. grid-rows-3 not parsed — Explicit row definitions ignored

  Flex Problems

  4. flex direction defaulting to column — The navbar (flex items-center justify-between) renders vertically instead of as a horizontal row. Same issue with
  hero buttons, stats items, CTA buttons, footer links
  5. flex-1 not working — Before/After cards should split equally but don't
  6. flex-shrink-0 not parsed — Collaboration section placeholder doesn't maintain fixed width
  7. justify-between / justify-center / items-center not working — Flex alignment properties not applying

  Absolute Positioning Problems

  8. absolute positioned elements not positioned — Hero "New" badge, blur circles, pricing "Most Popular" badge, Before/After labels, dashboard metric values
   inside relative containers — all appear in normal flow instead of being absolutely positioned
  9. relative container context not established — Parent elements with relative don't create positioning context for absolute children
  10. Negative offsets not working — -bottom-20, -left-20, -top-3, -translate-x-1/2 etc. not applied

  Sizing / Spacing Problems

  11. max-w-* constraints not working — max-w-3xl, max-w-5xl, max-w-4xl, max-w-lg, max-w-md don't limit content width
  12. mx-auto centering not working — Content that should be centered within its container isn't
  13. Fixed w-* / h-* dimensions possibly not applying — Placeholder boxes (w-72 h-72, w-48 h-48, w-64 h-28, etc.) may not have correct sizes

  Visual / Style Problems

  14. Gradients not rendering — bg-gradient-to-br, bg-gradient-to-b, bg-gradient-to-r, bg-gradient-to-t backgrounds show as flat colors or missing
  15. blur-* filter not applied — Decorative blur circles appear as solid shapes instead of blurred
  16. overflow-hidden not clipping — Hero and CTA sections should clip absolute children but don't
  17. border-y not parsed — Stats section should have top+bottom borders only
  18. shadow-lg shadow-cyan-500/10 not working — Colored shadows on the popular pricing card missing
  19. Color opacity syntax — bg-cyan-500/10, bg-indigo-500/15, from-red-500/10 opacity modifiers may not be parsed

  ---
  These are all parser-level issues in domparser.ts — the browser preview (ground truth) renders everything correctly via Tailwind CDN, but the DOM-to-canvas
   parser doesn't handle these CSS features. Want me to prioritize them or start fixing specific categories?

