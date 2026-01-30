# Molt-OS: The Origin Story

**Document Purpose:** This file captures the complete evolution of Molt-OS from initial concept to current implementation. It preserves the thinking, decisions, and insights from our early conversations.

---

## The Spark (January 29, 2026)

### The Problem Statement

R2 (the human behind this project) had been running Clawdbot on an EC2 instance for a while. The experience was... painful:

> *"Right now to use molt there is so much going on. First I had to set it up: get an ec2 and curl it, then run the config then i had to setup my telegram bot, and connect it now every so often i have to ssh in to run config commands or reset the gateway i have setup many model apis but i have to buy credits in the different apis, switch models. If i want it to run code and me to see it I cant or interact with the frontend, because its en ec2 not my machine."*

### The Core Insight

The friction wasn't in the AI capabilities — it was in **everything around the AI**:
- Infrastructure setup (EC2, SSH, configs)
- API key management (multiple providers, credits, billing)
- Interface limitations (Telegram-only, no visual feedback)
- Maintenance overhead (restarts, updates, debugging)

**The big question:** What if using a powerful AI assistant was as easy as signing up for Netflix?

---

## The Name: Molt-OS

**Why "Molt"?**
- Clawdbot → Claws → Lobsters → Molt (when lobsters shed their shell to grow)
- Represents transformation, growth, shedding the old constraints
- "OS" implies it's a complete operating system for your AI

**Alternative considered:** Just "Molt" — but "Molt-OS" better conveys the platform nature.

---

## Version 1: The "Ghost Key" Concept

### The Breakthrough Idea

Instead of users managing API keys from OpenAI, Anthropic, Venice, etc., **Molt-OS would hold master keys** and act as a proxy.

```
User → Molt-OS → AI Providers (OpenAI, Anthropic, Venice, etc.)
        ↑
   Master Keys
   (Enterprise accounts)
```

**User experience:**
1. User pays Molt-OS $50/month + usage
2. User picks any model from dropdown (GPT-5, Claude, Llama, etc.)
3. Molt-OS handles the API calls behind the scenes
4. User sees one bill, one balance, zero API keys

**The 20% markup:** Covers infrastructure, support, and margin.

---

## Version 2: The Verticals Strategy

### The Insight

People don't want "an AI assistant." They want **specific outcomes**:
- "Handle my email and calendar" (Executive)
- "Review my code and manage PRs" (Developer)
- "Research topics and summarize papers" (Researcher)
- "Schedule my posts and track analytics" (Creator)

### The Four Verticals

| Vertical | Primary Pain Point | Molt-OS Solution |
|----------|-------------------|------------------|
| **The Executive** | Drowning in email/calendar chaos | Inbox triage, meeting prep, daily briefings |
| **The Developer** | Context-switching between tools | GitHub monitoring, CI/CD alerts, code reviews |
| **The Researcher** | Information overload | Deep dives, paper summaries, knowledge tracking |
| **The Creator** | Managing content across platforms | Content calendar, social scheduling, analytics |

**Key insight:** Each vertical gets a pre-configured skill set, prompt templates, and workflows. The user doesn't build their AI — they **choose their flavor**.

---

## Version 3: The Brain Visualizer

### The Inspiration

R2 mentioned "Crabwalk" — a tool that visualizes multi-agent processes. The insight:

> *"Most AI apps just show a chat bubble and a loading spinner. If your users can actually see the bot 'scanning their calendar' or 'opening a browser tab' in a cool graph, it transforms from a 'chatbot' into a 'digital employee.'"*

### The Vision

A real-time node graph showing:
- User message enters
- AI "thinks" (reasoning steps)
- Tool calls execute (calendar check, web search, etc.)
- Memory is accessed
- Response is formed

**Why it matters:**
- Transparency (user sees what the AI is doing)
- Trust (user understands why the AI responded that way)
- Justifies cost ("I'm not paying $50 for chat — I'm paying for a visible employee")

---

## Version 4: The Local-First MVP

### The Pivot

Rather than building the full cloud infrastructure first, we decided to build a **local MVP** that R2 could use immediately.

**Rationale:**
1. Prove the UX works before investing in infra
2. Dogfood the product
3. Iterate quickly without provisioning overhead

### The Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Web App | Expo (React Native Web) | One codebase, runs in browser |
| State | Zustand + AsyncStorage | Simple, no backend needed |
| Styling | NativeWind (Tailwind) | Familiar, fast |
| Connection | Direct to Clawdbot Gateway | No proxy needed for MVP |

### The Flow

1. User opens web app
2. Enters gateway URL and token (from their EC2 Clawdbot)
3. App connects via WebSocket
4. Chat begins

**Tradeoff:** No provisioning, no billing, no ghost keys — just a better interface for existing Clawdbot.

---

## Technical Architecture Decisions

### Decision 1: Expo vs. Next.js for the App

**Considered:**
- Next.js for web-only
- Expo for web + mobile future

**Chose:** Expo

**Why:** We want mobile apps eventually. Expo lets us build web now, mobile later, from one codebase.

### Decision 2: Zustand vs. Redux

**Chose:** Zustand

**Why:** Less boilerplate, persistence is easy, TypeScript-friendly.

### Decision 3: NativeWind vs. Regular CSS

**Chose:** NativeWind (Tailwind for RN)

**Why:** Consistent with landing page (Next.js + Tailwind), familiar to R2, fast iteration.

### Decision 4: Direct Gateway Connection vs. Proxy

**MVP:** Direct connection to user's gateway

**Future:** Proxy through Molt-OS API

**Why:** Direct is simpler for MVP. Proxy adds latency but enables ghost keys and usage tracking.

---

## The Build Process (January 30, 2026)

### Challenges Faced

1. **Babel configuration hell** — NativeWind 4.x has specific requirements
   - Solution: Add `babel-preset-expo` explicitly, fix config syntax

2. **Expo Router learning curve** — File-based routing is powerful but new
   - Solution: Read docs, iterate on structure

3. **WebSocket connection design** — How to handle streaming responses?
   - Solution: Support both SSE and regular JSON, with fallback

### Wins

1. **Build succeeded** — Static export works, can deploy anywhere
2. **GitHub repo live** — https://github.com/ArturoHaber/molt-os
3. **Component structure clean** — Chat, Settings, Brain (placeholder) all separated

---

## The Session Deep Dive

### Critical Insight About Sessions

R2 asked a crucial question: *"How do sessions work?"*

**What we learned:**
- Sessions are tied to **chat location** (channel + ID)
- Same chat = same session forever (until `/new`)
- Every turn loads **full system prompt + conversation history**
- Long conversations = expensive (100K+ tokens per message)

**Implications for Molt-OS:**
- Need compaction strategy for long sessions
- Model choice matters (Llama is free, Claude is $$$)
- Users might want session management (archive old, start new)

---

## The Canvas/Brain Confusion

### What We Learned

Clawdbot has a **Canvas** feature, but it's for **paired nodes** (desktop app), not headless servers.

**For EC2/headless:**
- No built-in visual output
- Options: SSH tunnel to Control UI, or build custom

**Molt-OS opportunity:** Build a web-based "Brain" view that works with any Clawdbot instance.

---

## Current Status (January 30, 2026)

### What's Built

✅ Landing page (Next.js + Tailwind)
- Hero, verticals, pricing, FAQ, waitlist

✅ Web app scaffold (Expo)
- Chat interface with message history
- Settings page (gateway config, bot name, theme)
- Brain placeholder

✅ GitHub repo
- Public, documented, ready for collaboration

### What's Next

🔄 **Phase 1: Working Local Connection**
- Test with R2's EC2 gateway
- Fix any connection issues
- Polish chat UX

🔄 **Phase 2: Brain Visualizer**
- Design node graph UI
- Hook into Clawdbot's tool execution
- Real-time updates via WebSocket

🔄 **Phase 3: Cloud Infrastructure**
- Fly.io/Railway provisioning
- Stripe billing
- Ghost key proxy

🔄 **Phase 4: Mobile**
- iOS/Android builds
- Push notifications
- App Store submission

---

## The Vision Statement

**Molt-OS is the operating system for your AI workforce.**

In 2026, using a powerful AI shouldn't require:
- Terminal knowledge
- API key management
- Infrastructure setup
- Provider hopping

It should be as simple as:
1. Sign up
2. Pick your flavor (Executive, Developer, Researcher, Creator)
3. Start chatting
4. Watch your digital employee work

**That's Molt-OS.**

---

## Key Principles

1. **Normie-proof** — If it requires SSH, we've failed
2. **Transparent** — Users see what their AI is doing (Brain view)
3. **Flexible** — Any model, any skill, one interface
4. **Profitable** — 20% markup on usage, $50 base = healthy margins

---

## The Team

- **R2** — Product visionary, dogfooder, artist (R2MAC)
- **Clawd** — AI assistant, code generator, documentation writer

*Started: January 29, 2026*
*Repository: https://github.com/ArturoHaber/molt-os*
