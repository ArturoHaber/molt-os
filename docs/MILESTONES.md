# Molt-OS — Milestones & Sprint Planning

## Current Sprint: **Sprint 0 — Foundation**
**Goal:** Landing page live + project scaffolding
**Duration:** 1 week

---

## Milestone 1: Landing Page (Week 1)
> Get something live to start collecting interest

### Tasks

#### 1.1 Project Setup
- [x] Create project structure
- [x] Write PRD
- [x] Initialize Next.js landing page
- [x] Set up Tailwind + basic theme
- [ ] Deploy to Vercel (molt-os.com or similar)

#### 1.2 Landing Page Content
- [x] Hero section: Headline + subhead + CTA
- [x] "How it works" — 3-step visual
- [x] Verticals showcase (4 cards: Executive, Developer, Researcher, Creator)
- [x] Pricing section ($50/mo + usage)
- [x] FAQ section
- [x] Footer (socials, legal links)
- [x] "The Brain" visualizer teaser section

#### 1.3 Waitlist
- [x] Email capture form (UI complete)
- [ ] Store in Supabase or simple webhook
- [ ] Confirmation email (optional)

**Deliverable:** Live landing page at molt-os.vercel.app (or custom domain)

---

## Milestone 2: Web App Shell (Week 2-3)
> Basic chat interface connected to a single test bot

### Tasks

#### 2.1 App Scaffolding
- [ ] Initialize Expo project (web + mobile ready)
- [ ] Set up routing (expo-router)
- [ ] Auth flow (Clerk or Supabase)
- [ ] Basic layout: Sidebar + Chat area

#### 2.2 Chat Interface
- [ ] Message list component
- [ ] Input bar with send button
- [ ] WebSocket connection to Clawdbot gateway
- [ ] Message streaming (typing indicator)

#### 2.3 Settings
- [ ] Profile page (name, email, avatar)
- [ ] Billing placeholder (Stripe integration later)
- [ ] Skills toggle (mock data for now)

**Deliverable:** Working chat app that connects to your personal Clawdbot

---

## Milestone 3: Billing & Provisioning (Week 4-5)
> Users can pay and get their own bot

### Tasks

#### 3.1 Stripe Integration
- [ ] Stripe account setup
- [ ] Checkout flow for $50/mo subscription
- [ ] Metered billing for token usage
- [ ] Webhook handlers (subscription created/cancelled)

#### 3.2 Auto-Provisioning
- [ ] Container orchestration (Fly.io or Railway)
- [ ] "Spin up bot" function triggered on payment
- [ ] Generate unique gateway token per user
- [ ] Store user↔bot mapping in database

#### 3.3 Usage Tracking
- [ ] Hook into Clawdbot usage logs
- [ ] Report usage to Stripe metering API
- [ ] Display usage in user dashboard

**Deliverable:** End-to-end flow: Pay → Bot spins up → Start chatting

---

## Milestone 4: Polish & Launch (Week 6+)
> Public beta

### Tasks

- [ ] The Brain View (Crabwalk visualizer)
- [ ] Mobile app builds (iOS/Android)
- [ ] Skills Store integration
- [ ] Onboarding flow refinement
- [ ] Marketing push (Product Hunt, Twitter, etc.)

---

## Progress Tracker

| Milestone | Status | ETA |
|-----------|--------|-----|
| M1: Landing Page | 🟢 90% Complete | Week 1 |
| M2: Web App Shell | ⚪ Not Started | Week 2-3 |
| M3: Billing & Provisioning | ⚪ Not Started | Week 4-5 |
| M4: Polish & Launch | ⚪ Not Started | Week 6+ |

---

## Daily Standup Template

**Yesterday:** 
**Today:** 
**Blockers:** 

---

*Last updated: 2026-01-29*
