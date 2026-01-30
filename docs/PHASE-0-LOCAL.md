# Phase 0: Local-First MVP

## Goal
Build a working UI that connects to a **local Clawdbot instance**. No cloud services, no auth, no billing. Just prove the UX works.

---

## What We're Building

### 1. Chat UI
- Connect to local Clawdbot gateway (localhost:18789)
- Send messages, receive streaming responses
- Clean WhatsApp-like interface
- Message history (stored in local SQLite or just in-memory for now)

### 2. Settings Page
- **Connection:** Gateway URL, token
- **Models:** Select default model from available list
- **Profile:** Bot name, personality preset
- **Skills:** Toggle installed skills on/off (read from config)

### 3. Visualizer (Coming Soon)
- Placeholder page
- "Brain View coming soon" message
- Maybe a simple activity log as a stepping stone

---

## Stack (Simplified)

| Layer | Tech | Notes |
|-------|------|-------|
| App | Expo (React Native Web) | Single codebase, runs in browser |
| State | Zustand | Simple, no Redux boilerplate |
| Storage | AsyncStorage / localStorage | For settings, history |
| API | Direct WebSocket to Clawdbot | No backend needed |
| Styling | Tailwind (NativeWind) | Familiar from landing page |

---

## Data Flow

```
┌─────────────────┐        ┌─────────────────┐
│   Molt-OS App   │◄──────▶│ Local Clawdbot  │
│   (Browser)     │   WS   │  (localhost)    │
└─────────────────┘        └─────────────────┘
        │
        │ localStorage
        ▼
┌─────────────────┐
│ Settings/Config │
│ Chat History    │
└─────────────────┘
```

---

## Pages

```
/                 → Redirect to /chat
/chat             → Main chat interface
/settings         → Connection, models, skills config
/brain            → Visualizer (placeholder)
```

---

## Settings Schema (localStorage)

```typescript
interface MoltSettings {
  // Connection
  gatewayUrl: string;      // 'http://localhost:18789'
  gatewayToken: string;    // from clawdbot config
  
  // Preferences
  botName: string;         // 'Clawd'
  theme: 'dark' | 'light';
  
  // Derived from gateway (read-only display)
  availableModels: string[];
  currentModel: string;
  installedSkills: string[];
}
```

---

## API Endpoints We'll Use

Clawdbot Gateway exposes:
- `GET /api/status` → health + config info
- `WS /api/chat` → streaming chat
- `POST /api/config` → update config (if supported)
- `GET /api/models` → list available models (if exposed)

We'll discover what's available and work with it.

---

## File Structure

```
packages/app/
├── app/                    # expo-router
│   ├── _layout.tsx        # Root layout, providers
│   ├── index.tsx          # Redirect to /chat
│   ├── chat.tsx           # Chat page
│   ├── settings.tsx       # Settings page
│   └── brain.tsx          # Visualizer placeholder
├── components/
│   ├── ChatMessage.tsx
│   ├── ChatInput.tsx
│   ├── SettingsForm.tsx
│   └── Sidebar.tsx
├── lib/
│   ├── gateway.ts         # WebSocket + API client
│   ├── store.ts           # Zustand store
│   └── storage.ts         # AsyncStorage helpers
├── app.json
├── package.json
└── tailwind.config.js
```

---

## MVP Checklist

### Chat
- [ ] Connect to gateway WebSocket
- [ ] Send message
- [ ] Receive streaming response
- [ ] Display message history
- [ ] Auto-scroll to bottom
- [ ] Loading/typing indicator

### Settings
- [ ] Gateway URL input
- [ ] Gateway token input
- [ ] Test connection button
- [ ] Display current model
- [ ] Display available models (if API supports)
- [ ] Save to localStorage

### Navigation
- [ ] Sidebar with Chat / Settings / Brain links
- [ ] Current page highlight
- [ ] Mobile-responsive

---

## Next Steps

1. Scaffold Expo app with expo-router
2. Set up NativeWind (Tailwind for RN)
3. Build chat UI (hardcoded first, then live)
4. Add settings page
5. Test with your local Clawdbot

---

*Created: 2026-01-30*
