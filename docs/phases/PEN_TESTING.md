# 🧪 Pen Tool & Vector Edit — Testing Guide

## Prerequisites

```bash
cd /Users/dilip/Documents/scytle.ai/scytle
npm run dev
```

Open **http://localhost:3000/demo/layers** (or create a project from the dashboard).

---

## Test 1: Activate Pen Tool

1. Press **P** on your keyboard
2. ✅ Cursor should change — you're now in pen drawing mode
3. The main toolbar won't highlight (pen isn't in the toolbar UI), but the tool is active

---

## Test 2: Draw a Straight-Line Triangle

1. With pen active, **click** 3 different spots on the canvas (no dragging)
2. You should see straight line segments connecting the points, with a rubber-band preview line following your cursor
3. Move your cursor close to the **first point** (within ~8px) — you should see a close indicator
4. **Click** near the first point → path closes with **Z**, and a `VectorNode` is created
5. ✅ A closed triangle shape should appear on canvas

---

## Test 3: Draw Bezier Curves (Click + Drag)

1. Press **P** to activate pen again
2. **Click and drag** on the canvas — as you drag, you should see two bezier handle arms extending symmetrically from the point
3. Release the mouse — the handles are set
4. **Click and drag** a second point — the curve between point 1 and 2 should be a smooth cubic bezier
5. Place a 3rd point (click or click+drag)
6. Close the path by clicking near the first point, OR press **Escape** to leave it open
7. ✅ You should see a smooth curved shape

---

## Test 4: Open Path (Escape to Finish)

1. Press **P**, click 3–4 points (straight or curved)
2. Press **Escape** — the path should commit as an **open** path (no Z closure)
3. ✅ Open path appears as a VectorNode with visible stroke

---

## Test 5: Select & Inspect the Vector

1. Press **V** to switch to the Select/Move tool
2. Click on a vector shape you just drew
3. ✅ Right panel should show **Vector** properties: Mirroring buttons, Stroke Weight, Cap, Join, Align

---

## Test 6: Enter Vector Edit Mode (Double-Click)

1. With a vector selected, **double-click** it
2. ✅ You should see:
   - **Anchor points** (small blue-outlined squares) on each vertex
   - **Bezier handles** (small circles connected by lines) on curved vertices
   - A **floating toolbar** with 7 tools + Close button

---

## Test 7: Enter Vector Edit Mode via Keyboard

1. Press **Escape** to exit vector edit mode
2. Select the vector node (single click)
3. Press **Enter**
4. ✅ Should enter vector edit mode again (same result as double-click)

---

## Test 8: Move Tool — Drag Vertices

1. In vector edit mode, the **Move** tool (V) should be active by default
2. **Click** a vertex — it should highlight (filled blue)
3. **Drag** the vertex — it should move, and connected curves update in real-time
4. ✅ Release → vertex stays at new position. **⌘Z** should undo the entire drag as one step.

---

## Test 9: Multi-Select Vertices

1. In Move tool, **Shift+click** multiple vertices
2. ✅ Multiple vertices should be selected (all filled blue)
3. Drag one — all selected vertices should move together

---

## Test 10: Drag Bezier Handles

1. Select a vertex that has curve handles (from a click+drag drawn point)
2. You should see handle arms extending from it
3. **Drag a handle circle** — the curve reshapes as you drag
4. ✅ The connected bezier curve updates smoothly

---

## Test 11: Vertex Position in Right Panel

1. In vector edit mode, **click a single vertex**
2. ✅ Right panel should now show **Position X / Y** inputs with the vertex coordinates
3. Type a new X or Y value and press Enter
4. ✅ Vertex moves to the new coordinate
5. Click away (deselect all vertices) — Position inputs should show `0` and be disabled

---

## Test 12: Per-Vertex Mirroring

1. Select a single vertex
2. In the right panel, click the **3 mirroring buttons** (None / Angle / Symmetric)
3. ✅ The mirroring mode should change for that specific vertex
4. Deselect → mirroring shows the node-level default

---

## Test 13: Per-Vertex Corner Radius

1. In vector edit mode, select a single vertex
2. ✅ A **Corner radius** input should appear in the right panel
3. Set it to e.g. `10`
4. ✅ The vertex should get a corner radius (visible in the rendered path)

---

## Test 14: Bend Tool — Toggle Straight ↔ Curve

1. In the floating toolbar, click **Bend** (spline icon), or hold **⌘** (Mac) / **Ctrl** (Win)
2. Click on a **straight segment** between two vertices
3. ✅ The segment should become a **curve** with default handles appearing
4. Click the same segment again
5. ✅ It should toggle back to **straight** (handles removed)
6. Release ⌘ → should switch back to whatever tool was active before

---

## Test 15: Cut Tool — Split Path

1. In the floating toolbar, click **Cut** (scissors icon)
2. Click on a **vertex** in your path
3. ✅ One segment connected to that vertex is removed, effectively splitting the path at that point
4. The path should now be two separate chains (or an open path if it was closed)

---

## Test 16: Delete Selected Vertices

1. Switch back to Move tool (V)
2. Select one or more vertices
3. Press **Delete** or **Backspace**
4. ✅ Selected vertices (and their connected segments) should be removed

---

## Test 17: Sub-Tool Keyboard Shortcuts

In vector edit mode, test these shortcuts:

| Key    | Expected Tool  | Status |
|--------|---------------|--------|
| **V**  | Move          | Full   |
| **Q**  | Lasso         | Stub   |
| **M**  | Shape Builder | Stub   |
| **X**  | Cut           | Full   |
| **⇧B** | Paint         | Stub   |
| **⇧W** | Variable Width| Stub   |

✅ Each key should switch the active tool in the floating toolbar.

---

## Test 18: Exit Vector Edit Mode

1. Press **Escape**
2. ✅ Floating toolbar disappears, anchor points disappear, back to normal select mode
3. The vector node should still be selected on canvas

---

## Test 19: SVG Export

1. If your app has an export/code panel, select a page containing vector nodes
2. Trigger HTML export (however your app exposes it)
3. ✅ The exported HTML should contain an `<svg>` element for each vector with:
   - `<path d="...">` elements for fills
   - A `<path>` with `stroke`, `stroke-width`, `stroke-linecap`, `stroke-linejoin` for the stroke
   - Proper `viewBox`, `width`, `height`, and inline `position:absolute` positioning

---

## Quick Smoke Test Checklist

| #  | Action                                  | Pass? |
|----|-----------------------------------------|-------|
| 1  | Press P → pen mode activates            | ☐     |
| 2  | Click 3 points + close → triangle       | ☐     |
| 3  | Click+drag → bezier handles appear      | ☐     |
| 4  | Escape → open path commits              | ☐     |
| 5  | Double-click vector → edit mode         | ☐     |
| 6  | Drag vertex → moves with undo           | ☐     |
| 7  | Shift+click → multi-select              | ☐     |
| 8  | Drag bezier handle → curve reshapes     | ☐     |
| 9  | ⌘-hold → bend tool, release → restore  | ☐     |
| 10 | Click segment in bend → toggles curve   | ☐     |
| 11 | Cut tool + click vertex → splits        | ☐     |
| 12 | Delete key → removes vertices           | ☐     |
| 13 | Right panel shows vertex X/Y            | ☐     |
| 14 | Escape → exits edit mode cleanly        | ☐     |
