# SCYTLE LAUNCH: COPY-PASTE TEMPLATES & SCRIPTS

---

## WEEK 1-4: COMMUNITY ENGAGEMENT SCRIPTS

### Indie Hackers: Comment on "Show IH" Posts

**Script Template (50-100 words, no product mention):**

```
Hi [Name],

The [feature] looks solid. Quick question: When you were building this, 
did you run into the problem of [their specific challenge]? 

[Their product] solves for [what it does], but I'm curious if you also 
handle [adjacent problem].

Either way, this is a smart approach. Good luck with it.
```

**Real Examples:**

```
Hi @[name],

The real-time preview is great. I'm guessing this saves a ton of time 
vs. refreshing manually?

One question: When you have 50+ components in one design system, does 
the performance hold up? I've been trying to find tools that scale past 
medium-sized projects.

Either way, nice work shipping this. The UI is clean.
```

```
@[name], I've been looking for something that does exactly [their feature]. 

Question: Does it also handle [specific use case they didn't mention]? 
Or is that outside scope for now?

Asking because that's the blocker for us—we need [specific problem solved].
```

---

### Reddit: Answering r/web_design Questions

**Script Template (2-5 sentences, pure help, no link drop):**

```
This is a really common problem. Here's what works for us:

[Your actual experience/solution]

The key is [one specific insight]. Everyone tries [wrong approach] first, 
but [right approach] is simpler.

[Optional: What we learned the hard way]

Hope that helps. Feel free to reach out if you hit other blockers.
```

**Real Examples:**

```
Design tokens are 80% of the battle here. If you keep them in one place 
(Figma, CSS, Storybook all point to same source of truth), syncing becomes 
10x easier.

Most teams split them across 3 places, then every update breaks something.

The framework doesn't matter much—just discipline about where the tokens live.
```

```
This is actually a bigger problem than people realize. Most design systems 
start with "we'll export from Figma" and end with "we manually update the code."

What we've found works:
1. Lock your design tokens down first
2. Components reference tokens, not hardcoded values
3. Automate the export so updates flow daily

The export is the part everyone gets wrong. Most tools assume you'll manually 
keep things in sync. Spoiler: you won't.
```

---

### Indie Hackers: Start Your Own Discussion (1-2x per week)

**Week 1 Template: Problem-Discovery Post**

```
TITLE: "What design workflow are you using? We're researching this."

BODY:
Hi all,

Building something around design tools, so I'm curious how different people work.

When you go from design → code, what's your current workflow?

Mine: Figma → export components → paste into Storybook → adjust → push

That's 4 tools and 2 manual steps that break things.

What's yours? Any tools I should know about?
```

**Week 2-4 Template: Learning-Share Post**

```
TITLE: "What's your biggest blocker in design → production?"

BODY:
Not a sales pitch—genuinely curious.

Last week I heard from 5 designers:
- 2 said components get out of sync between Figma and code
- 2 said exporting design systems doesn't preserve hierarchy
- 1 said tool switching kills productivity

We're building something around this, but I want to know:

**What's YOUR biggest blocker?**

Is it workflow tools? Is it team communication? Is it component parity?

Asking because the most obvious solution (better export) might not be the real problem.
```

---

### Reddit: Posting Your Own Discussion (1x per week)

**Post Template: Screenshot + Question**

```
TITLE: "Design-to-dev handoff: What's your solution to keeping components in sync?"

BODY:
[Screenshot of your current workflow]

This is our workflow right now:

1. Design system in Figma
2. Export components
3. Paste into code
4. Design changes, components get out of sync
5. Manual sync takes 30 min

Every week, something breaks because Figma and code diverged.

**How do you solve this?** 

Do you:
- Use Figma plugins?
- Manual updates?
- Give up and redesign?
- Something else?

I'm genuinely asking because it feels like a solvable problem but we're missing something.
```

---

### Warm List: Week 7 DM Template

**Script (When you're ready to invite to beta, Week 7+):**

```
Hi [Name],

A few weeks ago you mentioned [their specific problem they asked about in comment/post].

We're testing a tool that solves exactly that. Would you be willing to spend 
5 minutes on a demo and tell me if it's useful or broken?

No pressure—just honest feedback.

[Demo link: 2-min video or live app]

Super appreciate it.

[Your name]
```

**Real Examples:**

```
Hi Alex,

You commented last week asking about design system sync. We just built something 
for that and would love your 5-minute feedback.

Does this solve your problem? [Demo link]

Thanks!
```

```
Hi @[name],

Saw your Reddit post about keeping Figma and code in sync. Spent the last 
3 weeks building a fix for this exact problem.

Would you test it? Takes 5 min. No strings. Just tell me if it's useful or broken.

[Link to private demo]

Thanks,
[Your name]
```

---

## WEEK 5-8: BUILD-IN-PUBLIC SCRIPTS

### Weekly Dev Log Template

**Email Subject:** `Scytle Dev Log #[N]: [What we shipped]`  
**Post to:** Indie Hackers + Reddit + Email + LinkedIn

**Template:**

```
### Scytle Dev Log #[N]: [We solved X problem]

**The Problem:**
Last week, someone asked: "How do you keep components in sync when designers 
and engineers use different tools?"

We heard this 5 times in the past week. It's a real problem.

**What We Tried:**
[Screenshot or description of first attempt]
Result: Works for 30 components. Breaks at 50+. Too slow.

**What We Built:**
[Screenshot/GIF of solution]

The fix: Components now update in real-time when you change the design token. 
No manual sync.

**Result:**
- 30 component files: Instant sync ✓
- 100 component files: Instant sync ✓
- CSS-in-JS exports: Still broken ✗ (working on this)

**What We Learned:**
Real-time is easier than batch sync. We were overthinking it.

**What's Next:**
- Fix CSS-in-JS export (users are asking for this)
- Add component variant support (another common ask)
- Performance test at 500 components

**Your Turn:**
What's the biggest thing we got wrong this week? Reply and tell me.

---

[Honest note: This is rough. But it's real. Help us fix it.]
```

---

### Viral-Potential Content: Research Post (Week 10)

**Title:** "We analyzed 200 design workflows. Here's what breaks."

**Post:**

```
Spent the last week interviewing designers and engineers. Wanted to understand 
the design-to-production workflow.

200 conversations later, we found 3 surprising patterns:

## 1. The Export Problem (Affects 85% of teams)

Everyone thinks their tool exports correctly. Almost no one's actually do.

Example: Figma exports design tokens. Code doesn't read them. Manual copy-paste.
Result: 3 days later, a token changes. Code is out of sync. No one knows.

## 2. The Variant Problem (Affects 60% of teams)

Design systems have 30-100 component variants (size, color, state).

Most tools export: "Button.tsx"
Reality needed: "Button.tsx + Button.dark.tsx + Button.disabled.tsx..."

Exporting all variants = 10x file size. Exporting some = "Which ones are critical?"

## 3. The Permission Problem (Affects 40% of teams)

Designer: "I need to change colors in production real-time"
Engineer: "Absolutely not"
Result: Someone's always blocking someone.

---

## What Actually Works

We talked to 3 teams doing this right:

- **Team A**: Design tokens in a shared config. Auto-deploys to production.
- **Team B**: Design changes in Figma. Export to GitHub. CI/CD runs tests. Deploys.
- **Team C**: Designers use code editor directly. No Figma → code bridge.

Common theme: **One source of truth. Automated. No manual sync.**

---

What's YOUR biggest export blocker? 

We're building something around this. Your feedback matters.
```

---

## LAUNCH WEEK: SCRIPTS & POSTS

### Indie Hackers: "Show IH" Launch Post

**Title:** "Show IH: Scytle — From AI sketch to production UI in one workspace"

**Post:**

```
For 12 weeks, we shipped every week and listened to every piece of feedback. 
Today, Scytle is live.

## The Problem

Most design workflows are broken:

- AI generates a starting point (but rarely production-ready)
- You jump between Chat → Figma → Code
- Components drift out of sync
- Exports destroy the design system
- You manually fix things in three places

Every designer we talked to had a version of this problem.

## Our Solution

One workspace. One design system. Real-time sync.

[GIF: Sketch → Edit → Export with system intact]

**What Works:**
- Design tokens stay in sync across all components
- AI draft + your edits = one canvas (no tool switching)
- Export respects design system constraints
- Components auto-update when you change tokens

**What Breaks:**
- Large files (>100 components) are slow — working on it
- CSS-in-JS exports need refinement
- Accessibility labels aren't auto-generated (yet)
- No Tailwind config import (roadmap)

## This is Rough

We're not pretending it's perfect. Rough edges everywhere. But the core 
(design system sync) works. And we're fixing things daily.

## What We Need

Real designers. Real feedback. Real workflows.

[Demo link]

If you test it and tell us what's broken, we'll give you:
- Lifetime beta access
- Direct Slack (you get responses in minutes)
- Your name in our "early users" wall

Questions? Drop them below. I'm reading every comment.

Thanks for checking it out.
```

---

### Reddit: Launch Post

**Title:** "We built a design canvas that actually syncs. Soft-launched this morning."

**Post:**

```
tldr: Built a canvas where your design system stays in sync from sketch to 
export. It's rough. We want your feedback. [Demo link]

---

Most design tools assume you're working in isolation. Then you hit export 
and pray.

We spent 12 weeks building the opposite: a canvas where your design system 
is always in sync.

[GIF showing: token change → all components update]

**The problem we heard (1000 times):**
"Every time I export from Figma, something breaks in production. I end up 
manually fixing 3 things."

**What we built:**
- Design tokens in one place
- Components reference tokens (not hardcoded values)
- Export = import into production (no manual fixes)
- Changes to tokens ripple everywhere

**Reality check:**
- Works great with 30-100 components ✓
- Gets slow with 200+ components (we're optimizing)
- CSS exports work, Tailwind config needs work
- Accessibility labels coming next week

**We're looking for:**
- Real designers in production workflows
- Honest feedback on what breaks
- Use cases we haven't thought of

[Demo link]

Tell us: What's the #1 thing that breaks in YOUR design exports?

P.S. First 50 people who test and give feedback get lifetime beta access. 
We're serious.
```

---

### Email: Launch Day

**Subject:** "Scytle is live (and kind of rough)"

**Body:**

```
Hi [first name],

This morning, we shipped Scytle.

It's not polished. It's not feature-complete. But it works for the core thing 
we set out to solve: keeping your design system in sync from draft to production.

You've been following along for 12 weeks. We read your feedback. We shipped 
almost every suggestion. And today, we're ready for real-world testing.

[Demo link]

Here's what we need:

1. Test it for 5 minutes
2. Break something (intentionally or not)
3. Tell us what's wrong

In return:
- Lifetime beta access
- Direct Slack (we fix things fast)
- Your name in our "early users" wall

This isn't a sales pitch. We genuinely need your honest feedback.

Does this solve your design system sync problem, or did we build the wrong 
thing?

Try it. Tell us.

[Demo link]

Thanks,
[Your name]
```

---

### Email: Day 3 (After Public Launch)

**Subject:** "3 things we got wrong on Day 1 (and fixed)"

**Body:**

```
Hi [name],

Launch day feedback was incredible. 47 people tested Scytle. 23 found bugs. 
We fixed 3 of them by end of day.

Here's what broke:

**#1: Files over 100 components were slow**
Status: Fixed. Rewrote the sync engine to batch updates.
Test: [Public demo with 200 components - try it]

**#2: CSS-in-JS exports didn't preserve class names**
Status: Partially fixed. Tailwind export still needs work.
What we learned: More people use CSS-in-JS than we thought. Prioritizing this 
next week.

**#3: Design tokens weren't auto-importing from design systems**
Status: Not fixed yet, but it's the #1 feature request. Shipping end of week.

**What Surprised Us:**
Nobody complained about the UI. Everyone complained about token syncing 
not being automatic.

So that's what we're fixing first.

Thanks for the feedback. Keep it coming.

[Demo link]

—[Your name]
```

---

### Email: Week 1 Wrap-Up

**Subject:** "Week 1: Honest numbers (and what they mean)"

**Body:**

```
Hi [name],

Shipped Scytle 7 days ago. Here's the honest breakdown:

**Metrics:**
- 1,200 visits
- 140 signups
- 8 paying customers ($15-50/month)
- 42 bugs reported
- 35 bugs fixed
- 2 features shipped based on feedback

**What Worked:**
- People understood the problem immediately (we got positioning right)
- Direct feedback was brutal but useful (thanks for that)
- Early adopters have real design systems (they're not just exploring)

**What Didn't:**
- Performance at 200+ components (still too slow)
- Variant exports (incomplete)
- Mobile UI (it's broken, but no one's using on mobile yet)

**Surprises:**
- Three people asked if it works in production (yes, we moved to it)
- Zero questions about pricing (people didn't care, they wanted the tool)
- Designers wanted to collaborate (feature we hadn't planned)

**What's Next:**
Shipping:
- Performance fix (components up to 500)
- Variant export (working version)
- Real-time collaboration (next week)

Your move:
- Keep testing
- Keep reporting bugs
- Tell us what feature would make this 10x better

We're listening.

[Demo link]

Thanks for being early.
—[Your name]
```

---

## DIRECT MESSAGE TEMPLATES

### Week 7: Beta Invitation DM

```
Hi [name],

A few weeks ago you mentioned [their specific problem]. 

We just finished building a tool to solve exactly that. Would you test a 
5-minute demo and tell me if it actually works or if we're crazy?

No obligation. Just honest feedback.

[Demo link]

Thanks,
[Your name]
```

### Launch Day DM (Tier 1 List)

```
Morning [name]!

We launched Scytle this morning. You've been asking about 
[their problem] for months.

We built the fix. [Demo link]

Would love your 5-minute test. Tell me if it's useful or broken.

[Link to live app]

Thanks!
```

### Week 2: Follow-Up DM (to non-responders)

```
Hey [name],

No response to my last message—that's fine. But if you're still struggling 
with [problem], give this 5 minutes?

We've already shipped 3 big fixes since launch (performance, token sync, 
exports).

[Demo link]

Worth 5 minutes of your time?
```

---

## WHAT NOT TO WRITE

❌ **Avoid:**
- "Please upvote us" (instant credibility killer)
- "We built the Figma killer" (nobody's ever the killer)
- Generic enthusiasm without specifics ("This is amazing!")
- Asking for signal-boosting ("Share if you like this")
- Comparing to competitors ("We're better than Figma at X")
- Exclamation marks in every sentence

✅ **Instead:**
- "Test it. Tell us what breaks."
- "We're solving [specific problem] because..."
- "Here's one insight we didn't expect..."
- "This is rough. We need your feedback."
- "Does this solve YOUR problem?" (ask genuine question)

---

## TONE ACROSS CHANNELS

**Indie Hackers:**
- Conversational, honest, ship-focused
- Talk about what broke and how you fixed it
- Ask genuine questions (don't preach)
- Example: "We learned X the hard way"

**Reddit:**
- Casual, practical, help-first
- Answer questions longer than yours
- Post your own experience (not product pitches)
- Example: "This is what worked for us, might be different for you"

**Email:**
- Personal, direct, transparent
- Use "I" not "we" when possible
- Tell one story per email
- Example: "I was expecting X, but Y happened instead"

**LinkedIn:**
- Professional but still human
- Share lessons learned (not sales)
- Celebrate users/feedback
- Example: "Here's what our users taught us this week"

---

## GO LIVE CHECKLIST (Day Before Launch)

- [ ] All demo links tested (they work, right?)
- [ ] Draft posts saved in your editor (NOT published)
- [ ] Email templates in email client (ready to send)
- [ ] 50-75 person warm list in spreadsheet (know who to DM)
- [ ] Slack open (respond to messages)
- [ ] Phone nearby (take calls if important people reach out)
- [ ] Coffee ready (you'll need it)
- [ ] 6 AM calendar reminder set

Execute the checklist at **6 AM sharp.** Not 6:05. Not 5:55.

Consistency in timing = algorithm picks it up faster = more early visibility.

Go.
