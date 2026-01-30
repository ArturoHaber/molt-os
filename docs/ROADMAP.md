# Molt-OS Product Roadmap

**Version:** 1.0-Draft  
**Last Updated:** January 30, 2026  
**Status:** In Development

---

## Executive Summary

Molt-OS is a managed AI assistant platform that eliminates technical friction. This roadmap details our path from MVP to production, including features, timelines, and success metrics.

---

## Phase 0: Local MVP (Current)
**Timeline:** January 30 - February 7, 2026  
**Goal:** Prove the UX with R2's existing Clawdbot

### Deliverables

#### Web App v0.1
- [x] Project scaffold (Expo + NativeWind)
- [x] Chat interface (send/receive messages)
- [x] Settings page (gateway URL, token, bot name)
- [x] Message history (local storage)
- [x] Build system (static export)

#### Testing
- [ ] Connect to R2's EC2 gateway via SSH tunnel
- [ ] Validate WebSocket streaming
- [ ] Document connection process
- [ ] Gather UX feedback

### Success Criteria
- Can connect to remote gateway
- Messages send/receive reliably
- No crashes or major bugs
- R2 uses it daily instead of Telegram

---

## Phase 1: Enhanced Local Experience
**Timeline:** February 8-21, 2026  
**Goal:** Add core features that make it a real product

### Deliverables

#### Chat Improvements
- [ ] Message threading / conversation branches
- [ ] File attachments (drag & drop)
- [ ] Code syntax highlighting
- [ ] Markdown rendering
- [ ] Message search

#### Settings v2
- [ ] Model selection dropdown (reads from gateway)
- [ ] Temperature/personality sliders
- [ ] System prompt editor
- [ ] Export/import settings

#### Brain Visualizer v1
- [ ] Activity log (chronological events)
- [ ] Tool call visualization
- [ ] Simple node graph (static)
- [ ] Expandable details panels

#### Data Persistence
- [ ] SQLite for message history
- [ ] Session management (view old, start new)
- [ ] Backup/restore functionality

### Success Criteria
- Can view tool execution history
- Can switch models without Telegram
- Can search past conversations
- Brain view provides actionable insights

---

## Phase 2: Cloud Provisioning (Molt-OS Proper)
**Timeline:** February 22 - March 21, 2026  
**Goal:** One-click bot deployment

### Deliverables

#### Infrastructure
- [ ] Fly.io Machines API integration
- [ ] Automated provisioning script
- [ ] Container health monitoring
- [ ] Auto-restart on failure
- [ ] Graceful shutdown handling

#### User Management
- [ ] Supabase project setup
- [ ] User authentication (magic links)
- [ ] Password reset flow
- [ ] Profile management

#### Provisioning Flow
1. User signs up (email + password)
2. User selects vertical (Executive/Developer/Researcher/Creator)
3. User adds payment method (Stripe)
4. System spins up Fly Machine (~30 seconds)
5. User receives gateway URL + token
6. User opens web app and connects

#### Admin Dashboard
- [ ] View all my bots
- [ ] Bot status (running/stopped/error)
- [ ] Restart/stop/delete buttons
- [ ] Usage metrics (messages, tokens)

### Success Criteria
- New user can go from signup to chatting in < 2 minutes
- Bot provisioning succeeds 99% of the time
- Bot auto-restarts if it crashes
- Can have multiple bots per account

---

## Phase 3: Billing & Ghost Keys
**Timeline:** March 22 - April 11, 2026  
**Goal:** Make money, simplify user experience

### Deliverables

#### Stripe Integration
- [ ] Checkout flow for subscriptions
- [ ] Metered billing setup
- [ ] Webhook handlers (payment success/failure)
- [ ] Customer portal (view invoices, update card)

#### Pricing Structure
- **Base:** $50/month per bot
- **Usage:** Cost of tokens + 20% markup
- **Example:** If user uses $10 in API credits, bill is $50 + $12 = $62

#### Ghost Key System
- [ ] Master API keys (OpenAI, Anthropic, Venice)
- [ ] Proxy service (adds key to requests)
- [ ] Usage tracking per user
- [ ] Token counting and reporting

#### Billing Dashboard
- [ ] Current month usage
- [ ] Historical usage charts
- [ ] Projected bill based on current usage
- [ ] Usage alerts ("You've used $40 of API credits")

### Success Criteria
- Payment processing works end-to-end
- Usage is tracked accurately
- Bills are generated correctly
- Users can view and pay invoices

---

## Phase 4: Verticals & Skills Store
**Timeline:** April 12 - May 9, 2026  
**Goal:** Pre-configured experiences for different user types

### Deliverables

#### The Four Verticals

**Executive**
- Pre-installed: Gmail, Calendar, Slack
- Prompt templates: "Summarize my week," "Prep me for this meeting"
- Skills: Email triage, meeting notes, follow-up reminders

**Developer**
- Pre-installed: GitHub, Linear, Sentry
- Prompt templates: "Review this PR," "Check CI status"
- Skills: Code review, bug tracking, deployment alerts

**Researcher**
- Pre-installed: Zotero, Notion, Brave Search
- Prompt templates: "Deep dive on X," "Summarize this paper"
- Skills: Citation tracking, knowledge graphs, paper summaries

**Creator**
- Pre-installed: Twitter, Instagram, YouTube
- Prompt templates: "Draft a thread," "Analyze this video's performance"
- Skills: Content calendar, hashtag research, analytics summaries

#### Skills Store
- [ ] Browse available skills
- [ ] One-click install
- [ ] Skill configuration UI
- [ ] Skill ratings/reviews
- [ ] Developer SDK for third-party skills

#### Configuration UI
- [ ] Visual skill toggle (no JSON)
- [ ] Skill-specific settings forms
- [ ] Default prompt templates per vertical
- [ ] Personality presets

### Success Criteria
- New user picks vertical during onboarding
- Vertical comes pre-configured with relevant skills
- Can switch verticals (migrates settings)
- Skills install without touching config files

---

## Phase 5: Mobile Apps
**Timeline:** May 10 - June 6, 2026  
**Goal:** Native mobile experience

### Deliverables

#### iOS App
- [ ] Build with Expo EAS
- [ ] TestFlight distribution
- [ ] App Store submission
- [ ] Push notifications for mentions

#### Android App
- [ ] Build with Expo EAS
- [ ] Internal testing track
- [ ] Play Store submission
- [ ] Push notifications

#### Mobile-Specific Features
- [ ] Widget (quick actions)
- [ ] Share extension (send to Molt-OS)
- [ ] Voice input
- [ ] Biometric auth
- [ ] Offline mode (queue messages)

### Success Criteria
- Apps available on both stores
- 4+ star ratings
- Push notifications work reliably
- Mobile usage > 50% of total usage

---

## Phase 6: Advanced Features
**Timeline:** June 7 - July 4, 2026  
**Goal:** Enterprise-ready, competitive differentiation

### Deliverables

#### Brain Visualizer v2
- [ ] Real-time node graph (animated)
- [ ] Interactive exploration (click nodes for details)
- [ ] Session replay (rewind conversation)
- [ ] Performance metrics (token usage per step)

#### Teams/Enterprise
- [ ] Shared bots (team access)
- [ ] Role-based permissions
- [ ] Audit logs
- [ ] SSO (SAML/OIDC)
- [ ] Admin controls

#### Integrations
- [ ] Zapier/Make.com connector
- [ ] Webhook support
- [ ] Custom API endpoints
- [ ] Browser extension (clip to Molt-OS)

#### AI Improvements
- [ ] Multi-model routing (cheap model for simple queries, expensive for complex)
- [ ] Long-context optimization
- [ ] Memory compaction strategies
- [ ] Custom model fine-tuning

### Success Criteria
- Fortune 500 pilot customer
- Brain view is a killer feature people talk about
- API usage by external developers

---

## Success Metrics

### Phase 0-1 (Local)
| Metric | Target |
|--------|--------|
| Daily active use (R2) | 7 days/week |
| Messages sent | >100/week |
| Feature requests | <5 critical bugs |

### Phase 2-3 (Cloud)
| Metric | Target |
|--------|--------|
| Waitlist signups | 500+ |
| Paying users | 50+ |
| Monthly Recurring Revenue | $2,500+ |
| Churn rate | <10% |
| Provisioning success rate | 99%+ |

### Phase 4-6 (Growth)
| Metric | Target |
|--------|--------|
| Total users | 1,000+ |
| Paying users | 200+ |
| MRR | $10,000+ |
| NPS score | 50+ |
| Mobile app downloads | 5,000+ |

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Fly.io pricing changes | Medium | High | Multi-cloud support (Railway, Render) |
| AI API costs spike | Low | High | Rate limiting, usage alerts, fallback to cheaper models |
| Stripe account issues | Low | Critical | Backup payment processor (LemonSqueezy) |
| Security breach | Low | Critical | Security audit, encryption, SOC2 prep |
| Competitor launches similar product | Medium | Medium | Move fast, focus on UX, build community |
| Mobile app rejection | Medium | Medium | Early submission, guideline compliance, TestFlight first |

---

## Open Questions

1. **Pricing:** Is $50/month the right price point? Should we have a cheaper tier?
2. **Free tier:** Should we offer limited free usage to get people hooked?
3. **Open source:** Do we open source parts of Molt-OS? Which parts?
4. **On-prem:** Do we support self-hosted for enterprise?
5. **Custom models:** Do we let users bring their own fine-tuned models?

---

## Resources Needed

### Development
- 1x Full-stack engineer (Phase 2-6)
- 1x DevOps engineer (Phase 2-3)
- 1x Mobile developer (Phase 5)

### Budget (Monthly)
- Fly.io: ~$500 (for 100 active bots)
- Supabase: $25 (Pro tier)
- Stripe: Variable (0.5% + 30¢ per transaction)
- Expo EAS: $30 (Build credits)
- Domain/Email: $20
- **Total:** ~$575/month base + usage

### One-time
- Security audit: $5,000
- Mobile developer account: $100 (Apple) + $25 (Google)

---

## Appendix: Feature Priority Matrix

| Feature | User Value | Implementation Effort | Priority |
|---------|-----------|----------------------|----------|
| Basic chat | High | Low | P0 |
| Gateway connection | High | Low | P0 |
| Brain visualizer | High | High | P1 |
| Cloud provisioning | High | High | P1 |
| Ghost keys | High | Medium | P1 |
| Stripe billing | Medium | Medium | P1 |
| Verticals | Medium | Medium | P2 |
| Skills store | Medium | Medium | P2 |
| Mobile apps | High | High | P2 |
| Teams/Enterprise | Medium | High | P3 |
| Zapier integration | Low | Low | P3 |
| Browser extension | Low | Medium | P3 |

---

*Next review: February 7, 2026*
