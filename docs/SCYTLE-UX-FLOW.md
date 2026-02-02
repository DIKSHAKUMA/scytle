# Scytle Complete UX Flow - Clean Chat + Canvas Approach

## Interface Layout (Relume Top Bar + Figma Bottom Toolbar)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SCYTLE                         [project-name]          [@user] [⚙]     │
├────────────┬────────────────────────────────────────────────────────────┤
│            │  TOP BAR (Relume-style - View Switcher)                    │
│            │  [Sitemap] [Wireframe] [Style Guide] [Design]  OR          │
│            │  [Development] [Preview] [Deploy]  ← Changes based on mode │
│            ├────────────────────────────────────────────────────────────┤
│            │                                                            │
│  CHAT      │              CANVAS WORKSPACE                              │
│  (1/3)     │              (2/3 width)                                   │
│            │                                                            │
│  💬 AI     │  Content changes based on top bar selection:               │
│  Assistant │  • Sitemap → ReactFlow editor                              │
│            │  • Wireframe → Section blocks                              │
│            │  • Style Guide → Color/font picker                         │
│  Always    │  • Design → High-fi mockups                                │
│  available │  • Development → Code editor + file tree                   │
│            │                                                            │
│  [Type...] │                                                            │
│            ├────────────────────────────────────────────────────────────┤
│            │  BOTTOM TOOLBAR (Figma-style - Tools)                      │
│            │  [✋ Hand] [➤ Select] [⊕ Add] [🔍 Zoom] [⟲ Undo] [⟳ Redo] │
│            │  [🎨 Design Mode] [👨‍💻 Dev Mode] ← Quick toggle            │
└────────────┴────────────────────────────────────────────────────────────┘
```

**Layout Benefits:**
- ✅ **Top Bar**: Context switcher (what am I viewing?)
- ✅ **Canvas**: Main workspace (Figma/Relume-style editing)
- ✅ **Bottom Toolbar**: Interaction tools (how do I edit?)
- ✅ **Left Chat**: AI guidance always accessible
- ✅ **Clean**: No phase tracking, just visual workspace

---

## SCENARIO 1: User Types "Dog walking app"

### **What User Sees (Frontend)**

```
┌──────────────────────┬──────────────────────────────────────┐
│ CHAT (Left 1/3)      │ CANVAS (Right 2/3)                   │
├──────────────────────┼──────────────────────────────────────┤
│                      │                                      │
│ 💬 You:              │  [Empty canvas]                      │
│ dog walking app      │                                      │
│                      │  Ready to build...                   │
│ 🤖 Scytle:           │                                      │
│ Great! Let me        │                                      │
│ understand your      │                                      │
│ vision...            │                                      │
│                      │                                      │
│ ┌──────────────────┐ │                                      │
│ │ Quick Questions  │ │                                      │
│ │                  │ │                                      │
│ │ Who is this for? │ │                                      │
│ │ ○ Dog owners     │ │                                      │
│ │ ○ Dog walkers    │ │                                      │
│ │ ● Both           │ │                                      │
│ │                  │ │                                      │
│ │ Key feature?     │ │                                      │
│ │ ● Booking        │ │                                      │
│ │ ○ GPS tracking   │ │                                      │
│ │                  │ │                                      │
│ │ [Continue] [Skip]│ │                                      │
│ └──────────────────┘ │                                      │
│                      │                                      │
│ [Type message...]    │                                      │
│                      │                                      │
└──────────────────────┴──────────────────────────────────────┘
```

### **What Happens Behind the Scenes (Backend)**

```javascript
// 1. User message arrives at API
POST /api/project/123/chat
Body: { message: "dog walking app" }

// 2. OpenClaw ThinkAgent activates
ThinkAgent.analyze(message) {
  intent: "BUILD_PRODUCT", // Not just design
  product: "dog walking app",
  specificity: "LOW", // Vague request
  missingInfo: ["target_users", "features", "scope"]
}

// 3. Generate clarifying questions
ThinkAgent.generateQuestions() → Returns 2-3 smart questions

// 4. Send to frontend
Response: {
  phase: "think",
  questions: [...],
  suggestedAnswers: [...] // Pre-fill options
}
```

### **User Answers or Skips**

**IF USER ANSWERS:**
```
User selects: "Both (marketplace)" + "Booking & payments"

Frontend sends:
POST /api/project/123/think/complete
{ answers: { userType: "marketplace", priority: "booking" } }

Backend saves context → Moves to next phase
```

**IF USER CLICKS "SKIP":**
```
ThinkAgent uses intelligent defaults:
- userType: "marketplace" (most common for dog walking)
- priority: "booking" (most requested feature)
- monetization: "commission" (standard model)

Moves to next phase with these assumptions
```
┬──────────────────────────────────────┐
│ CHAT                 │ CANVAS                               │
├──────────────────────┼──────────────────────────────────────┤
│                      │                                      │
│ 🤖 Scytle:           │  [Empty - research happening]        │
│ ✓ Got it!            │                                      │
│ Building marketplace │  📊 Analyzing competitors...         │
│ for dog walking      │  ▓▓▓▓▓▓▓▓░░░░ 60%                   │
│                      │                                      │
│ 📊 Researching...    │                                      │
│                      │                                      │
│ Found competitors:   │                                      │
│                      │                                      │
│ • Rover.com          │                                      │
│   $50M revenue       │                                      │
│   20% commission     │                                      │
│                      │                                      │
│ • Wag.com            │                                      │
│   $40M revenue       │                                      │
│   30% commission     │                                      │
│                      │                                      │
│ [+3 more]            │                                      │
│                      │                                      │
│ 💡 Opportunity:      │                                      │
│ They charge 25% avg  │                                      │
│ → Your USP: 15%      │                                      │
│   commission         │                                      │
│                      │                                      │
└──────────────────────┴                                      │
│     💡 Opportunity: Both charge high commissions           │
│        Your USP → 15% commission + free insurance          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **Backend Processing**

```javascript
// Research phase auto-triggers
POST /api/project/123/research (server-side, automatic)

ResearchAgent.run({
  query: "dog walking app marketplace",
  focus: ["competitors", "pricing", "features"]
}) {
  // 1. Web scraping (5-10 seconds)
  scrapeCompetitors() → Rover, Wag, Barkly, etc.
  
  // 2. Extract key data
  analyze() → Pricing, features, reviews
  
  // 3. Find gaps/opportunities
  findUSP() → "All charge 20-30% commission"
  
  // 4. Stream to frontend
  return {
    competitors: [...],
    marketSize: "$1.2B US market",
    opportunity: "Lower commission model"
  }
}
```

### **Next: Define Phase (Auto-starts)**

```
┌────────────┬───────────────────────────────────────────────────────────┐
│            │ TOP BAR: [Sitemap] [Wireframe] [●Style Guide] [Design]   │
│            ├───────────────────────────────────────────────────────────┤
│ CHAT       │ CANVAS - STYLE GUIDE                                      │
├────────────┤                                                           │
│            │  📝 Building your style guide...                          │
│ 🤖 Scytle: │                                                           │
│ ✓ Research │  YOUR USP:                                                │
│   done!    │  "DogWalk - The fair marketplace"                        │
│            │                                                           │
│ 📝 Defining│  ✨ 15% commission (vs 25% average)                      │
│   product  │  🛡️ Free walker insurance                                │
│            │  📍 Live GPS tracking                                     │
│ YOUR USP:  │  ⭐ Verified walker profiles                              │
│ "DogWalk - The fair  │                                      │
│  marketplace"        │                                      │
│                      │                                      │
│ ✨ 15% commission    │                                      │
│    (vs 25% avg)      │                                      │
│ 🛡️ Free insurance    │                                      │
│ 📍 GPS tracking      │                                      │
│ ⭐ Verified profiles │                                      │
│                      │                                      │
│ [Edit USP]           │                                      │
│ [Looks Good ✓]       │                                      │
│                      │                                      │
│ Target Users:        │                                      │
│ 👤 Dog Owners        │                                      │
│    Age 28-45         │                                      │
│ 👤 Dog Walkers       │            Figma-Style)**

```
┌──────────────────────┬──────────────────────────────────────┐
│ CHAT                 │ CANVAS - SITEMAP (Interactive)       │
├──────────────────────┼──────────────────────────────────────┤
│                      │                                      │
│ 🤖 Scytle:           │      ┌──────────┐                   │
│ ✓ Created sitemap    │      │  Home    │                   │
│                      │      │          │                   │
│ Here's your site     │      │ • Hero   │                   │
│ structure. Drag to   │      │ • How It │                   │
│ edit, click pages    │      │   Works  │                   │
│ for details.         │      │ • Trust  │                   │
│                      │      └─────┬────┘                   │
│ [Generate Designs]   │            │                        │
│ [Edit Structure]     │   ┌────────┼────────┬─────────┐    │
│                      │   │        │        │         │     │
│                      │ ┌─▼───┐ ┌──▼───┐ ┌─▼─────┐ ┌▼───┐│
│ Or ask me:           │ │Find │ │Become│ │Pricing│ │About││
│ • Add a page         │ │Walk │ │Walker│ │       │ │     ││
│ • Change structure   │ └─────┘ └──────┘ └───────┘ └─────┘│
│ • Show page details  │                                      │
│                      │  [+ Add Page] [Auto-Layout] [Zoom]  │
│ [Type message...]    │                                      │
│                      │  ← Drag, drop, edit like Figma      │
│                      │                                      │
│                      │  Click page to see sections ↓        │
│                      │  ┌────────────────────────────────┐ │
│                      │  │ 📄 Home Page                   │ │
│                      │  │ • Hero with CTA                │ │
│                      │  │ • How It Works (3 steps)       │ │
│                      │  │ • Trust Indicators             │ │
│                      │  │ • Featured Walkers             │ │
│                      │  │ [Edit] [Design This]           │ │
│                      │  └────────────────────────────────┘ │
└──────────────────────┴Works (3 steps)                      │
│     Section 3: Trust Indicators                            │
│     Section 4: Featured Walkers                            │
│     Section 5: Testimonials                                │
│                                                             │
│  [Edit Sections] [PrevGenerate Designs"**

```
┌──────────────────────┬──────────────────────────────────────┐
│ CHAT                 │ CANVAS - DESIGN VIEW (Relume-style)  │
├──────────────────────┼──────────────────────────────────────┤
│                      │                                      │
│ 🤖 Scytle:           │  🎨 Generating designs...            │
│ Creating designs...  │  ▓▓▓▓▓▓▓▓▓░░░ 80%                   │
│                      │                                      │
│ 🎨 Style Guide:      │  ┌─────────────────────────────────┐│
│                      │  │ Colors: 🟠 #FF6B35  🟦 #004E89 ││
│ Colors:              │  │ Font: Poppins + Inter           ││
│ 🟠 #FF6B35 (primary) │  │ Vibe: Modern, trustworthy       ││
│ 🟦 #004E89 (accent)  │  │ [Customize]                     ││
│                      │  └─────────────────────────────────┘│
│ Fonts:               │                                      │
│ • Poppins (heading)  │  📱 Home Page Designs:              │
│ • Inter (body)       │                                      │
│                      │  [A] Modern  [B] Minimal  [C] Playful│
│ [Customize Style]    │  ┌─────┐    ┌─────┐    ┌─────┐     │
│                      │  │Hero │    │Hero │    │Hero │     │
│ Select a design →    │  │[img]│    │[img]│    │[img]│     │
│ or ask me to adjust  │  │ CTA │    │ CTA │    │ CTA │     │
│                      │  └─────┘    └─────┘    └─────┘     │
│ [Type message...]    │                                      │
│                      │  [Select & Export] [Regenerate]      │
│                      │                                      │
│                      │  ← Click design to see full page     │
│                      │  ← All sections included             │
└──────────────────────┴────┘    └─────────┘               │
│   Modern        Minimal        Playful                     │
│                                                             │
│  [Select Design A] [Mix & Match] [Regenerate]             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **Final: Code Generation**

```
User clicks [Generate C┬──────────────────────────────────────┐
│ CHAT                 │ CANVAS - CODE VIEW                   │
├──────────────────────┼──────────────────────────────────────┤
│                      │                                      │
│ 🤖 Scytle:           │  ┌───────┬──────────────────────────┐│
│ ✓ Code generated!    │  │📁Files│  app/page.tsx            ││
│                      │  │       │                          ││
│ Ready to:            │  │▾ app/ │ export default function  ││
│ • Preview live       │  │  page │   HomePage() {           ││
│ • Export to GitHub   │  │  layout│   return (              ││
│ • Deploy to Vercel   │  │       │     <div>                ││
│                      │  │▾ comps│       <Hero />           ││
│ Built with:          │  │  Hero │       <HowItWorks />     ││
│ • Next.js 15         │  │  CTA  │     </div>               ││
│ • React 19           │  │       │   )                      ││
│ • Tailwind CSS       │  │       │ }                        ││
│                      │  └───────┴──────────────────────────┘│
│ [Preview Live] ↗     │                                      │
│ [Export to GitHub]   │  [▶ Preview] [📤 GitHub] [🚀 Deploy]│
│ [Deploy Now]         │                                      │
│                      │  ← Full code editor, live preview    │
│ [Type message...]    │  ← Click files to edit               │
└──────────────────────┴t to GitHub] [🚀 Deploy]            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## SCENARIO 2: User Types "I just need a design of dog walking app"

### **What User Sees**

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  💬 You: I just need a design of dog walking app          │
│                                                             │
│  🤖 Scytle AI:                                             │
│     Got it! I'll focus on design.                          │
│                                                             │
│     Quick questions to nail the aesthetic:                 │
│                                                             │
│     1. Design style preference?                            │
│        ○ Modern & minimal                                  │
│        ○ Playful & colorful                                │
│        ○ Professional & clean                              │
│        ○ Surprise me                                       │
│                                                             │
│     2. What pages do you need?                             │
│        ☑ Home                                              │
│        ☑ Service pages                                     │
│        ☐ About/Contact                                     │
│        ☐ Dashboard (app interface)                         │
│                                                             │
│     [Continue] [Skip - Use Defaults]                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **Backend Logic**

```javascript
// 1. Intent detection
POST /api/project/123/chat
Body: { message: "I just need a design..." }

ThinkAgent.analyze() {
  intent: "DESIGN_ONLY", // ← Key detection
  skipPhases: ["research"], // User wants fast track
  focusPhase: "design",
  needsMinimal: ["sitemap"] // Still need basic structure
}

// 2. Fast-track mode activates
FastTrackService.run({
  target: "design",
  userInput: "dog walking app"
}) {
  // BACKEND SILENTLY RUNS (invisible to user):
  
  // Step 1: Generate minimal sitemap (3 seconds)
  sitemap = FlowAgent.quickGenerate({
    pages: ["Home", "Services", "Contact"]
  })
  
  // Step 2: Generate style guide (5 seconds)
  styleGuide = DesignAgent.generateStyleGuide({
    industry: "pet care",
    vibe: "trustworthy + playful"
  })
  
  // Step 3: Generate designs (10 seconds)
  designs = DesignAgent.generateMockups({
    sitemap: sitemap,
    styleGuide: styleGuide
  })
  
  // FRONTEND ONLY SEES: Design results
  return { designs, styleGuide }
}
```

### **What User Sees (15 seconds later)**

```
┌─────────────────────────────────────────────────────────────┐
│  🤖 Scytle AI:                                             │
│     ✓ Design ready!                                        │
│                                                             │
│  🎨 Style Guide:                                           │
│  ┌─────────────────────────────────────────────┐          │
│  │ Colors:  🟠 #FF8C42  🔵 #2A9D8F  ⚪ #F4F4F4 │          │
│  │ Fonts:   Quicksand (fun), Lato (readable)   │          │
│  │ Vibe:    Friendly, trustworthy, energetic   │          │
│  └─────────────────────────────────────────────┘          │
│                                                             │
│  📱 Designs (3 variations):                                │
│                                                             │
│  [Design A]          [Design B]          [Design C]        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │ [Hero Img]  │    │ [Hero Img]  │    │ [Hero Img]  │   │
│  │ Find Walker │    │ Book Walk   │    │ Safe Walks  │   │
│  │ Near You    │    │ Instantly   │    │ GPS Track   │   │
│  │             │    │             │    │             │   │
│  │ [See more]  │    │ [See more]  │    │ [See more]  │   │
│  └─────────────┘    └─────────────┘    └─────────────┘   │
│                                                             │
│  [Select & Export] [See Sitemap Used] [Regenerate]        │
│                                                             │
│  💡 Want to see competitor analysis? [Click here]         │
│  💡 Want to generate code? [Click here]                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **Key Differences:**

| Full Flow | Design-Only Flow |
|-----------|------------------|
| Shows research cards | Hides research (runs silently) |
| Shows sitemap canvas | Hides sitemap (auto-generated) |
| 5-step visible journey | Jump straight to design |
| User makes decisions | AI uses smart defaults |
| ~2 min total | ~15 seconds total |

---

## SCENARIO 3: User Types "Build an e-commerce site" (Ambiguous)

### **Frontend**

```
┌─────────────────────────────────────────────────────────────┐
│  💬 You: Build an e-commerce site                          │
│                                                             │
│  🤖 Scytle AI:                                             │
│     I can help! Let me ask a few quick questions...        │
│                                                             │
│     What are you selling?                                  │
│     ┌──────────────────────────────┐                      │
│     │ [Type here...]               │                      │
│     │ e.g., "handmade jewelry"     │                      │
│     └──────────────────────────────┘                      │
│                                                             │
│     OR choose a template:                                  │
│     [Fashion Store] [Digital Products] [Food Delivery]     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **Backend**

```javascript
ThinkAgent.analyze("Build an e-commerce site") {
  intent: "BUILD_PRODUCT",
  specificity: "VERY_LOW", // Too vague
  missingCritical: ["product_type", "target_market"],
  action: "REQUEST_CLARIFICATION" // Must ask
}

// Generate dynamic questions based on keywords
if (message.includes("e-commerce")) {
  questions = [
    "What products?",
    "Target audience?",
    "Key feature needs?"
  ]
}
```

---

## COMPLETE BACKEND DECISION TREE

```
User Input Arrives
       ↓
┌──────────────────────────────────────┐
│ ThinkAgent: Classify Intent          │
│                                       │
│ 1. Keyword detection:                │
│    - "design" → DESIGN_ONLY           │
│    - "code" → CODE_ONLY               │
│    - "build"/"make" → FULL_BUILD      │
│                                       │
│ 2. Specificity check:                │
│    - Vague → ASK_QUESTIONS            │
│    - Specific → PROCEED               │
│                                       │
│ 3. Missing info:                      │
│    - Critical → MUST_ASK              │
│    - Optional → USE_DEFAULTS          │
└──────────────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ Route to appropriate flow:            │
│                                       │
│ IF intent = "DESIGN_ONLY":            │
│   → Skip research (run silently)      │
│   → Skip define (auto-generate)       │
│   → Jump to design phase              │
│   → Show designs in ~15 seconds       │
│                                       │
│ IF intent = "CODE_ONLY":              │
│   → Ask for design reference          │
│   → Generate code structure           │
│   → Show code editor                  │
│                                       │
│ IF intent = "FULL_BUILD":             │
│   → Run all phases (visible)          │
│   → Show research → sitemap → design  │
│   → Full journey (~2 minutes)         │
│                                       │
│ IF specificity = "LOW":               │
│   → Show 2-3 targeted questions       │
│   → Wait for answers or use defaults  │
│   → Then proceed with chosen flow     │
└──────────────────────────────────────┘
```

---

## PHASE AUTO-SKIP LOGIC

```javascript
// In backend: /lib/phase-router.ts

function determinePhases(intent, userPreference) {
  const allPhases = ['think', 'research', 'define', 'flow', 'design', 'build']
  
  // Preset flows
  const flows = {
    DESIGN_ONLY: {
      visible: ['design'], // User only sees design
      hidden: ['think', 'flow'], // Runs in background
      skip: ['research', 'define', 'build'] // Completely skip
    },
    
    CODE_ONLY: {
      visible: ['build'],
      hidden: ['flow'], // Need structure
      skip: ['research', 'define', 'design']
    },
    
    FULL_BUILD: {
      visible: ['think', 'research', 'define', 'flow', 'design', 'build'],
      hidden: [],
      skip: []
    },
    
    FAST_TRACK: {
      visible: ['flow', 'design'],
      hidden: ['think'],
      skip: ['research', 'define', 'build']
    }
  }
  
  return flows[intent] || flows.FULL_BUILD
}
```

---

## LEFT SIDEBAR PHASE INDICATORS
CLEAN INTERFACE - NO PHASE TRACKING

**Why no phase sidebar?**
- ❌ Overwhelming to show "Think", "Research", "Define", etc.
- ✅ Users just want to chat and see results
- ✅ Backend handles all logic invisibly
- ✅ Canvas updates automatically as AI works

**Simple Chat Controls:**

```
Bottom of chat area:

[Type your message...]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 Type anything:
   • "Add a pricing page"
   • "Change colors to blue"
   • "Skip straight to designs"
   • "Export to Figma"
```

**Canvas Toolbar (Top):**

```
┌──────────────────────────────────────────────────┐
│ [← Back] [Sitemap] [Designs] [Code] [Export] [⚙]│
└──────────────────────────────────────────────────┘
```

**That's it. No phase tracking visible to user.**
---

## TIMING EXPECTATIONS

| Scenario | Backend Time | Frontend Shows | User Waits |
|----------|--------------|----------------|-----------|
| "Dog walking app" (full) | 45-60s total | All phases streaming | 45-60s |
| "Design only" | 15-20s | Jump to design | 15-20s |
| "Code only" | 10-15s | Jump to code editor | 10-15s |
| Fast-track (skip research) | 30s | Sitemap → Design | 30s |

---

## SUMMARY: How It All Works

**User types anything** → **AI understands intent** → **Runs necessary phases** → **Shows what user cares about**

**Key Principles:**

1. ✅ **Backend intelligence**: Always runs minimum necessary steps
2. ✅ **Frontend simplicity**: Only shows what user requested
3. ✅ **Smart defaults**: Never block user with questions if not critical
4. ✅ **Progressive disclosure**: Results expand/collapse as needed
5. ✅ **Always accessible**: Can jump to any phase, ask questions anytime

**The Magic:**
- User thinks they're skipping steps
- Backend still ensures quality (runs silently)
- Frontend stays clean and focused
- Total time: 15-60 seconds depending on request

**No more 7 separate dashboards** → **One intelligent canvas that adapts**
