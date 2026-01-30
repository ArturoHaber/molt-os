# Molt-OS — Product Requirements Document

## Executive Summary

Molt-OS is a managed AI assistant platform that removes all technical friction from deploying a personal AI. Users sign up, add payment, and immediately start chatting with a fully-configured AI assistant.

---

## Problem Statement

Current AI assistant solutions require:
- Terminal/CLI knowledge
- API key management (OpenAI, Anthropic, etc.)
- Self-hosting or complex config files
- Multiple platform integrations (Telegram, WhatsApp, etc.)

**Result:** Only technical users can benefit from powerful AI assistants.

---

## Solution

A SaaS wrapper around Moltbot/Clawdbot that:
1. Provisions isolated instances automatically
2. Handles all API billing transparently
3. Provides a clean mobile/web chat interface
4. Offers pre-configured "verticals" for different user types

---

## Target Users

### Primary Personas

| Persona | Pain Point | Molt-OS Solution |
|---------|------------|------------------|
| **The Executive** | Drowning in email/calendar chaos | AI handles inbox triage, meeting prep, summaries |
| **The Developer** | Context-switching between tools | AI monitors GitHub, runs commands, manages PRs |
| **The Researcher** | Information overload | AI does deep dives, summarizes papers, tracks topics |
| **The Creator** | Managing content across platforms | AI schedules posts, tracks analytics, brainstorms |

---

## Core Features

### P0 — MVP (Must Have)

1. **Landing Page**
   - Clear value proposition
   - Vertical showcase (Executive, Developer, etc.)
   - Pricing: $50/mo + usage
   - Waitlist signup → Email capture

2. **Web App**
   - Email/password auth (Supabase or Clerk)
   - Chat interface (clean, WhatsApp-like)
   - Settings panel (profile, billing, preferences)
   - "Skills" toggle (enable/disable capabilities)

3. **Backend**
   - User provisioning (spin up isolated bot per user)
   - Stripe billing integration
   - Usage tracking & metering

### P1 — Post-MVP

4. **The Brain View**
   - Crabwalk-style visualizer
   - Real-time node graph of agent activity
   - Tool calls, memory access, reasoning steps

5. **Mobile App**
   - Expo wrapper of web app
   - Push notifications
   - App Store / Play Store distribution

6. **Skills Store**
   - ClawdHub integration
   - One-click skill installation
   - Curated "packs" per vertical

### P2 — Future

7. **Team/Enterprise Features**
   - Shared bots, admin controls
   - SSO, audit logs

8. **Voice Interface**
   - Talk to your bot (ElevenLabs TTS)
   - Phone call integration

---

## Technical Stack (Proposed)

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Landing | Next.js 14 + Tailwind | Fast, SEO-friendly, easy deploy |
| Web App | Expo (React Native Web) | Single codebase for web + mobile |
| Auth | Clerk or Supabase Auth | Quick setup, good DX |
| Database | Supabase (Postgres) | Familiar from CribUp, fast iteration |
| Payments | Stripe (Metered Billing) | Industry standard, handles complexity |
| Infra | Fly.io or Railway | Simple container deploys, good pricing |
| Bot Runtime | Dockerized Clawdbot | Isolated per user |

---

## Success Metrics

| Metric | Target (3 months) |
|--------|-------------------|
| Waitlist signups | 500+ |
| Paying users | 50+ |
| MRR | $2,500+ |
| Churn | <10% monthly |

---

## Open Questions

- [ ] Fly.io vs Railway vs DigitalOcean for container hosting?
- [ ] Clerk vs Supabase for auth?
- [ ] How to handle bot "cold starts" (always-on vs on-demand)?
- [ ] Multi-tenant vs single-tenant architecture?

---

*Last updated: 2026-01-29*
