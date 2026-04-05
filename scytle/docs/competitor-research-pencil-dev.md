# Competitor Research: pencil.dev

> Researched: 2026-04-03
> URL: https://www.pencil.dev / https://docs.pencil.dev

## Overview

Pencil is an **MCP-based vector design canvas** that lives inside your IDE (Cursor, VSCode, Claude Code, OpenAI Codex). Their tagline: "Design on canvas. Land in code."

**Key differentiator from Scytle**: Pencil does NOT generate HTML. It generates its own `.pen` vector format (JSON-based), and AI writes directly to a canvas via MCP tools. There is no HTML→canvas parsing step at all.

---

## Architecture

### The .pen File Format

- **JSON-based** object tree (similar to HTML/SVG)
- Each node has: `id`, `type`, `x`, `y`, `width`, `height`
- **Node types**: Frame, Rectangle, Ellipse, Line, Polygon, Path, Text, Note, Prompt, Context, Group, IconFont, Ref (component instance)
- Lives in the repo — versioned with Git like code

#### Fills
- Solid colors (hex `#AABBCC` or `#AABBCCDD` with alpha)
- Gradients (linear, radial, angular)
- Images (stretch, fill, fit modes)
- Mesh gradients

#### Layout System
- Flexbox-style: `layout: "none" | "vertical" | "horizontal"`
- `justifyContent`, `alignItems`, `padding`, `gap`
- `SizingBehavior`: `"fit_content"` or `"fill_container"`

#### Variables & Theming
```json
{
  "variables": {
    "color.background": {
      "type": "color",
      "value": [
        { "value": "#FFFFFF", "theme": { "mode": "light" } },
        { "value": "#000000", "theme": { "mode": "dark" } }
      ]
    }
  },
  "themes": {
    "mode": ["light", "dark"]
  }
}
```
- Referenced with `"$variableName"` syntax

#### Components
- Set `"reusable": true` on any frame to create a component
- Instances use `"type": "ref"` with `"ref": "componentId"`
- Overrides via direct property changes or `descendants` object
- `slot` property marks frames intended for customization

### Design Libraries
- `.lib.pen` suffix for library files
- Changes to library components propagate to all instances
- Can import/export between files

---

## AI Generation Pipeline

### How It Works (CRITICAL DIFFERENCE FROM SCYTLE)

Pencil's AI does NOT generate HTML and parse it. Instead:

1. User provides a natural language prompt (via IDE Cmd+K)
2. AI receives **MCP tool access** to manipulate `.pen` files directly
3. AI calls `batch_design` to create/modify canvas nodes
4. Changes render immediately in the design canvas

### MCP Tools Exposed

| Tool | Purpose |
|------|---------|
| `batch_design` | Create, modify, manipulate design elements (insert, copy, update, replace, move, delete, generate images) |
| `batch_get` | Read design components, search elements, inspect structure |
| `get_screenshot` | Render design previews for AI verification |
| `snapshot_layout` | Analyze spatial properties, detect overlaps |
| `get_editor_state` | Current selection, active file context |
| `get_variables` / `set_variables` | Manage design tokens, theme values, CSS sync |

### AI Models Used
- `claude-opus-4-6` (default, most capable)
- `claude-sonnet-4-6` (balanced)
- `claude-haiku-4-5` (fastest)

### Key Insight: No HTML Intermediate Step
The AI writes DIRECTLY to the vector format. This means:
- No HTML parsing bugs (padding, colors, layout issues)
- No Tailwind CSS constraints
- No "parser constraints" section in prompts
- The AI has full control over every pixel

---

## Design → Code Conversion

Design-to-code is a SEPARATE step from generation:

1. Design exists as `.pen` file (vector canvas)
2. User asks AI to generate code FROM the design
3. AI reads the `.pen` structure + takes a screenshot for visual context
4. Generates code for the target stack

### Supported Output
- **Frameworks**: React, Next.js, Vue, Svelte, HTML/CSS
- **Styling**: Tailwind CSS, CSS Modules, Styled Components, plain CSS
- **Component Libraries**: shadcn/ui, Radix UI, Chakra UI, Material UI

### Code → Design (Reverse)
- Import existing code components back into `.pen` format
- AI reads code files and recreates them as vector objects
- Enables two-way sync: import → edit → export → iterate

---

## Prompt Gallery Analysis

### Prompt Types Users Use

1. **Full page from scratch**: "Design a web app for managing rocket launches. Use a technical style."
2. **Style-specific**: "Design a mobile app for tracking music royalties. Use a Scandinavian minimalistic style."
3. **Location/context-aware**: "Design a website for a specialty cafe in Haight Ashbury, San Francisco."
4. **Iterative refinement**: "Let's go more bold and rock'n'roll, make the headline much larger"
5. **Direction exploration**: "Explore a totally different design direction."
6. **Layout variation**: "Explore a different layout, but keep the current design direction."
7. **Theme switching**: "Change it to the light mode."
8. **Typography**: "Now change fonts to something more classy."
9. **Navigation changes**: "Great! Now use a sidenav."
10. **Code sync**: "Adjust the prompts page code to reflect the selected design."

### Key Observation
Prompts are **short and conversational** — not engineering-heavy. The AI handles all the design decisions. Users iterate via multi-turn conversation.

---

## What Scytle Can Learn from Pencil

### Problem 1: Generic Design Output

**How Pencil avoids it:**
- AI writes directly to a vector format with **full creative freedom** — no layout archetypes, no hardcoded section structures, no few-shot HTML skeletons constraining the output
- Uses **screenshot feedback loops** (`get_screenshot`) — AI can see what it created and iterate
- **Brand kits / design libraries** provide curated components the AI can compose from, rather than generating everything from scratch
- **Variable system** for theming — not hardcoded hex colors in prompts
- **Multi-turn conversation** — users refine iteratively rather than getting one-shot output
- **No prescriptive section guidance** — AI interprets the prompt freely

**Scytle's current approach vs Pencil:**

| Aspect | Scytle | Pencil |
|--------|--------|--------|
| Generation target | HTML + Tailwind | Native .pen vector format |
| Layout control | 12 hardcoded archetypes | AI decides freely |
| Color control | Hardcoded palettes, fallback hex | Variable system, AI decides |
| Section structure | Prescriptive SECTION_GUIDANCE | None — AI interprets prompt |
| Few-shot examples | Fixed HTML skeletons per layout | Design libraries (curated kits) |
| AI feedback loop | None (one-shot) | `get_screenshot` for verification |
| Iteration | Regenerate from scratch | Multi-turn refinement |

### Problem 2: Parser Issues (Padding, Colors)

**How Pencil avoids it:**
- **No parser at all.** There is no HTML→canvas conversion step.
- AI writes directly to the canvas format via `batch_design` MCP tool
- Every property (padding, fills, strokes, layout) is set explicitly in JSON — no CSS computed style ambiguity
- No `getComputedStyle()` quirks, no iframe rendering, no Tailwind class interpretation

**What this means for Scytle:**
The fundamental architecture choice of generating HTML and then parsing it to canvas nodes is the root cause of parser issues. Pencil sidesteps this entirely.

### Potential Strategies for Scytle

1. **Short-term**: Improve the HTML→node parser to handle edge cases better (padding, colors, layout)
2. **Medium-term**: Add a screenshot feedback loop — let AI see what it generated and self-correct
3. **Long-term**: Consider generating ScytleNode JSON directly (like Pencil generates .pen JSON) instead of going through HTML. This would eliminate the parser entirely.
4. **Design variety**: Remove hardcoded layout archetypes, let AI have more creative freedom. Use design libraries/component refs instead of few-shot HTML skeletons.
5. **Theming**: Use the variable system more aggressively in prompts, remove hardcoded color fallbacks.
6. **Iteration**: Support multi-turn refinement instead of one-shot generation.

---

## Pencil CLI

```bash
# Generate a design from prompt
pencil -p "Design a dashboard for analytics" -o output.pen

# With specific model
pencil -p "Design a landing page" -m claude-sonnet-4-6 -o page.pen

# Export to image
pencil -i design.pen --export output.png --export-scale 2

# Batch processing
pencil -t tasks.json

# Interactive mode
pencil interactive
# Then: batch_design({ ... })
```

**Note**: CLI does NOT support HTML conversion. It only converts prompts → .pen files and .pen → images (PNG, JPEG, WEBP, PDF).
