# Research: Baby Tracking Application

**Feature**: 001-baby-tracking-app | **Date**: 2026-05-28

## Research Tasks & Findings

### 1. Offline-First Sync Strategy for .NET MAUI + ASP.NET Core

**Decision**: SQLite local database with background delta-sync using timestamps and conflict resolution via last-writer-wins with caregiver attribution.

**Rationale**: SQLite is natively supported in .NET MAUI, provides full relational query support offline, and pairs well with EF Core for consistent data access patterns. Delta-sync via `LastModifiedUtc` timestamps minimizes data transfer on reconnection. Last-writer-wins is appropriate because baby care events are rarely conflicting (different activities at different times).

**Alternatives considered**:
- CouchDB/PouchDB sync: Rejected — not native .NET, adds complexity with JavaScript interop
- Azure Mobile Apps offline sync: Rejected — deprecated and replaced by Datasync toolkit which has limited MAUI support
- Custom CRDT: Rejected — over-engineered for this use case; events are append-mostly

**Implementation approach**:
- Each entity has `Id`, `LastModifiedUtc`, `SyncStatus` (Pending/Synced/Conflict)
- Background service polls connectivity and syncs pending changes
- Server returns changes since client's last sync timestamp
- Conflicts detected by comparing `LastModifiedUtc` — newest wins, conflicts logged for review

---

### 2. Real-Time Multi-Caregiver Sync via SignalR

**Decision**: SignalR Hub per family group with push notifications for activity events.

**Rationale**: SignalR provides real-time bidirectional communication native to .NET. Hub groups map naturally to family units. When a caregiver logs an activity, the server broadcasts to all family members' connected clients within seconds.

**Alternatives considered**:
- Firebase Cloud Messaging: Rejected — Google dependency, not .NET native
- Polling: Rejected — too slow for <5s sync requirement, wasteful on battery
- gRPC streaming: Rejected — more complex, less mobile-friendly, overkill for event notifications

**Implementation approach**:
- `FamilyHub` with groups per FamilyId
- Activities broadcast as typed events: `ActivityLogged(type, babyId, caregiverId, summary)`
- Offline clients receive missed events on reconnect via sync mechanism
- Push notifications as fallback when app is backgrounded

---

### 3. WHO/CDC Growth Chart Integration

**Decision**: Embed WHO growth standard LMS tables as static data in the application, calculate percentiles using the LMS method.

**Rationale**: WHO publishes growth chart data as downloadable CSV/Excel files with L (lambda), M (mu), S (sigma) values for each age. The LMS method calculates exact percentiles without needing external API calls — critical for offline operation.

**Alternatives considered**:
- External API (e.g., CDC API): Rejected — requires internet, offline-first constraint
- Pre-rendered chart images: Rejected — not interactive, can't show baby's exact position
- Simplified percentile bands: Rejected — spec requires <1% accuracy vs WHO standards

**Implementation approach**:
- Store WHO LMS tables as embedded resources (weight-for-age, length-for-age, head-circumference-for-age, by sex)
- Calculate z-score: `Z = ((measurement/M)^L - 1) / (L * S)` (Box-Cox transformation)
- Convert z-score to percentile using normal distribution CDF
- Display on interactive charts using LiveCharts2 or SkiaSharp

---

### 4. Smart Feeding Reminders (Pattern-Based Prediction)

**Decision**: Rolling average of last 7 feeding intervals, weighted toward recent feedings, with configurable reminder offset.

**Rationale**: Simple weighted moving average provides reliable predictions without complex ML infrastructure. Baby feeding patterns are relatively regular and shift gradually over weeks.

**Alternatives considered**:
- Fixed schedule: Rejected — doesn't adapt to baby's actual patterns
- ML model: Rejected — over-engineered for MVP, needs training data, adds complexity
- Pediatrician-standard intervals: Rejected — too generic, not personalized

**Implementation approach**:
- Calculate average interval from last 7 feedings (exponential decay weighting: recent = 2x weight)
- `NextFeedingDue = LastFeedingEnd + WeightedAverageInterval`
- Reminder fires at `NextFeedingDue - offset` (default 10 minutes before)
- Adapt: if parent consistently feeds earlier/later, average adjusts naturally

---

### 5. .NET MAUI Dark Mode & Nighttime UX

**Decision**: System-aware dark mode with an "Ultra Night" mode that reduces all elements to minimum brightness with warm amber tones.

**Rationale**: Standard dark mode isn't sufficient for 3 AM use — even dark backgrounds can be too bright. Ultra Night mode uses darker blacks, amber accent colors (less blue light), and reduces contrast to minimize eye strain.

**Alternatives considered**:
- System dark mode only: Rejected — not dark enough for nighttime nursing
- Screen brightness API only: Rejected — doesn't address contrast and blue light
- Separate nighttime theme: Selected as "Ultra Night" — combines reduced brightness with warm color palette

**Implementation approach**:
- Three themes: Light, Dark (system), Ultra Night (manual toggle or scheduled)
- Ultra Night: background #0A0A0A, text #8B7355 (warm amber), accents #654321
- Reduce all animations in Ultra Night mode
- Auto-enable Ultra Night between configurable hours (default 9 PM - 6 AM)
- Hardware brightness reduction via platform APIs where available

---

### 6. One-Handed Thumb Operation (Ergonomic UI)

**Decision**: Bottom-aligned navigation with floating action button (FAB) for quick-log, swipe gestures for common actions, large touch targets (minimum 48dp).

**Rationale**: Thumb reachability studies show the bottom 60% of the screen is the comfortable zone for one-handed use. Placing primary actions there ensures parents can operate while holding their baby.

**Alternatives considered**:
- Top navigation: Rejected — unreachable with one hand while holding baby
- Gesture-only: Rejected — not discoverable, risky for accidental actions
- Voice-only: Rejected — could wake sleeping baby

**Implementation approach**:
- Tab bar at bottom with 4 tabs: Dashboard, Activity, Growth, Settings
- FAB center-bottom for "Quick Log" (expands to sleep/feed/diaper buttons)
- Swipe right on active timer to end session
- All interactive elements minimum 48x48dp with 8dp spacing
- Confirmation via haptic feedback, not modals (avoid extra taps)

---

### 7. Authentication & Family Management

**Decision**: OAuth 2.0 with JWT tokens, optional account creation (app works locally without account), family invitation via shareable link/code.

**Rationale**: Privacy-first means the app must work without an account for basic tracking. Account creation unlocks multi-caregiver sync. OAuth provides secure, standard authentication without password management burden.

**Alternatives considered**:
- Mandatory account: Rejected — contradicts "works immediately without account" assumption
- Email/password only: Rejected — less secure, password fatigue
- Anonymous with device ID: Rejected — can't transfer data between devices

**Implementation approach**:
- First launch: create local profile, all data stored in SQLite
- Optional: "Create Account" to enable sync (Microsoft, Google, Apple OAuth)
- Family creation: generates invite code/link
- Accepting invite: links caregiver to family, triggers initial sync
- JWT tokens with refresh mechanism, stored in secure platform keychain
