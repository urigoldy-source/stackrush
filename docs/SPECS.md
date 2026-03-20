# STACK RUSH - Development Architecture Plan

**Confidential | March 2026 | v1.1**

---

## 1. Overview

This document outlines the full technical architecture for a skill-based prize gaming platform. The platform supports arcade and card games where players compete for real money prizes funded by entry fees, with the house retaining a percentage as platform revenue. Gameplay is asynchronous: players are matched together but complete their sessions independently within a 24-hour window, after which scores are compared and a winner is declared. The initial launch targets up to 10,000 users with a stacking block game as the first title.

| Attribute | Detail |
|-----------|--------|
| **First Game** | Stacking block game (Phaser.js with Matter.js physics) |
| **Game Types** | Arcade / casual and card games |
| **Match Format** | Asynchronous: players complete within 24-hour window |
| **Scale** | Up to 10,000 users initially |
| **Revenue Model** | House fee deducted from each prize pool (no ads) |
| **Team Stack** | PHP (Laravel) — single unified backend service |

---

## 2. System Architecture

Because gameplay is asynchronous, real-time infrastructure is not required. The entire backend consolidates into a single Laravel service. There is no separate game server, no WebSocket layer, and no Colyseus. This significantly reduces complexity, deployment overhead, and operational risk at launch scale.

Players load the game in their browser, play their session locally via Phaser, and submit results to the Laravel API over standard HTTP when done. Laravel handles match resolution on a scheduled job after the 24-hour window closes.

### High-Level Diagram

```
User Browser
├── React + Phaser Frontend (game runs client-side)
└── Laravel API (PHP)
    ├── auth, game sessions, ledger, match resolution
    ├── MySQL + Redis
    └── Scheduled Job resolves matches after 24hr window
```

### Async Match Lifecycle

| Step | Description |
|------|-------------|
| **1. Join Match** | Player enters lobby, Laravel creates session, deducts entry fee, issues signed session token |
| **2. Play** | Player completes game in browser at any point within 24 hours |
| **3. Submit** | On game end, full action replay log + score submitted to Laravel API via HTTP POST |
| **4. Validate** | Laravel replays and validates the session server-side before accepting the score |
| **5. Resolve** | After 24hr window (or all players done), scheduled job compares scores and determines winner |
| **6. Payout** | Prize payout queued via Laravel Queues, ledger updated, winner notified |

---

## 3. Platform Backend (Laravel / PHP)

Laravel is the sole backend service. It handles authentication, user management, financial transactions, game session management, score validation, match resolution, and payout processing. The async model means all game logic validation happens via standard HTTP requests rather than persistent connections.

### 3.1 Authentication & User Management

- Laravel Breeze or Jetstream for registration, login, email verification, and 2FA
- Sanctum for API token auth between frontend and backend
- KYC identity verification required by payment processor at payout threshold
- Role system: player, admin, auditor

### 3.2 Payment Processing

Stripe's ToS prohibits prize gaming platforms. Use one of the following gaming-friendly processors:

| Processor | Notes |
|-----------|-------|
| **Sightline Payments** | Built specifically for skill-prize and gaming platforms. Best compliance fit, slower to onboard. |
| **Skrill / Paysafe** | Widely used in competitive gaming. Supports deposits and withdrawals. Good ToS flexibility. |
| **Nuvei** | Used across iGaming-adjacent platforms. Supports ACH and card. Strong compliance tooling. |

- Support card deposits and ACH withdrawals from day one
- Budget 4 to 8 weeks for processor compliance review and approval
- All financial logic runs server-side only; client never touches amounts or fees

### 3.3 Ledger & House Fee Model

Use an immutable ledger table rather than a simple balance column. Every financial event is a row with a type, amount, and reference. This is essential for auditing, disputes, and regulatory review.

| Transaction Type | Description |
|-----------------|-------------|
| **deposit** | Player deposits funds via payment processor |
| **withdrawal** | Player requests payout |
| **entry_fee** | Deducted when player joins a game session |
| **house_fee** | Platform cut taken from prize pool before payout |
| **prize_payout** | Winnings credited to player balance |
| **refund** | Entry fee returned on cancelled session |

- House fee percentage is configurable per game type (e.g. 10 to 15%)
- Prize pool = sum of entry fees minus house fee
- Payouts are queued and processed asynchronously via Laravel Queues + Redis

### 3.4 Match Resolution (Scheduled Jobs)

Match resolution runs entirely within Laravel's task scheduler. No external service or cron manager is needed beyond a single server cron entry.

- Laravel Scheduler runs every minute via a single cron: `* * * * * php artisan schedule:run`
- ResolveExpiredMatches job fires every 5 minutes, checks for sessions past their 24hr deadline
- If all players have submitted, resolves immediately without waiting for deadline
- If a player has not submitted by deadline, they forfeit and remaining players split the pool
- Resolution is idempotent: running it twice on the same session produces the same result

### 3.5 Key Laravel Packages

| Package | Purpose |
|---------|---------|
| **laravel/sanctum** | API authentication and signed session tokens |
| **laravel/horizon** | Queue and job monitoring dashboard |
| **spatie/laravel-permission** | Role and permission management |
| **spatie/laravel-activitylog** | Audit trail for all user and admin actions |
| **laravel/telescope** | Development debugging and request inspection |

---

## 4. Game Logic & Anti-Cheat

Because games are played asynchronously in the player's browser, the game client cannot be fully trusted. The anti-cheat strategy centres on requiring a complete, verifiable action replay log to be submitted alongside every score. Laravel replays and validates this log server-side before accepting any result.

### 4.1 Phaser.js + Matter.js (Stacking Block Game)

Phaser.js runs entirely in the browser and handles rendering, input, and physics via its built-in Matter.js integration. The game records every player action as a timestamped event log during play.

- Game initialises with a server-issued seed (hashed and committed before play, revealed after)
- Every player action (tap, drop, timing) is appended to a local replay log with a timestamp
- On game completion, the full replay log and final score are submitted to Laravel via HTTP POST
- Laravel independently replays the log using a headless Node.js script to verify the claimed score
- Scores that cannot be reproduced from the replay log are rejected

### 4.2 Security Mechanisms

| Mechanism | Implementation |
|-----------|---------------|
| **Signed Session Tokens** | Laravel issues a signed token per match; score submissions without a valid token are rejected |
| **Provably Fair RNG** | Game seed hashed before session starts, plaintext revealed after; players can verify fairness |
| **Replay Validation** | Server replays full action log to verify submitted score is achievable and consistent |
| **Timing Analysis** | Flag sessions completed in implausibly short time for review |
| **Rate Limiting** | Score submission endpoints rate-limited per user per session |
| **Anomaly Detection** | Flag accounts winning at statistically improbable rates across sessions |
| **Replay Log Storage** | All action logs stored for audit and dispute resolution |

---

## 5. Frontend (React + Phaser)

The frontend is a single React application. Platform UI (lobby, wallet, leaderboard, profile) is built in React. The Phaser game runs inside a canvas component embedded within the React tree. All communication with the backend is standard HTTP via REST API calls — no WebSocket layer is needed.

| Library | Role |
|---------|------|
| **React + Vite** | Platform shell, routing, lobby, wallet UI |
| **Phaser.js** | Game canvas rendering, input handling, and local physics |
| **React Query** | Data fetching and caching for all Laravel API calls |
| **Zustand** | Lightweight global state (auth, wallet balance, active match) |
| **Tailwind CSS** | Utility-first styling for platform UI |

- Phaser game component mounts and unmounts cleanly within React lifecycle
- On game completion, React component collects replay log from Phaser and submits to Laravel API
- Match status polling (waiting, in-progress, resolved) handled by React Query with 30-second intervals
- Wallet balance refreshed after each match resolution notification

---

## 6. Database Schema (Key Tables)

| Table | Key Columns |
|-------|------------|
| **users** | id, name, email, password, kyc_status, balance_cents, created_at |
| **ledger_entries** | id, user_id, type, amount_cents, reference_id, reference_type, created_at |
| **game_sessions** | id, game_type, status, entry_fee_cents, house_fee_pct, prize_pool_cents, seed, seed_hash, deadline_at, resolved_at |
| **session_players** | id, session_id, user_id, score, rank, payout_cents, submitted_at, replay_log (JSON) |
| **withdrawals** | id, user_id, amount_cents, processor, status, requested_at, processed_at |

Note: session_actions is replaced by replay_log stored directly on session_players. The full action sequence is captured client-side and submitted atomically with the score, simplifying the schema while preserving auditability.

---

## 7. Infrastructure

At sub-10k user scale, keep infrastructure simple and managed. Avoid over-engineering. The priority is fast deployment, easy scaling when needed, and low operational overhead.

| Concern | Solution |
|---------|----------|
| **App Hosting** | Railway or Render (single Laravel service, managed DB, easy deploys) |
| **Database** | Managed MySQL or PostgreSQL via Railway / Render add-ons |
| **Cache / Queues** | Redis Cloud free tier (Laravel queues for payout processing) |
| **CDN / DDoS** | Cloudflare free tier in front of all services |
| **Object Storage** | Cloudflare R2 or AWS S3 for game assets and replay log archives |
| **Monitoring** | Laravel Telescope (dev) + Sentry (prod) for error tracking |

---

## 8. Compliance Considerations

Skill-based prize platforms occupy a specific legal category. This is not legal advice, but the following are standard operational requirements to engage with early.

- Obtain a legal opinion confirming your game qualifies as skill-based (not chance-based) in your target jurisdictions
- Certain US states (e.g. Arizona, Iowa) prohibit skill-prize platforms regardless of skill classification
- KYC verification required at withdrawal thresholds (typically $600+ in the US for tax reporting)
- Maintain full audit logs of all game sessions, transactions, and admin actions for minimum 5 years
- Terms of service must clearly define house fee, payout rules, and dispute process
- Age verification: 18+ gate on registration with ID check at KYC

---

## 9. Recommended Build Phases

| Phase | Deliverables |
|-------|-------------|
| **Phase 1 (Weeks 1-4)** | Laravel auth + user management. Ledger schema. Payment processor integration (sandbox). Basic admin panel. |
| **Phase 2 (Weeks 5-8)** | Game session API. Match creation, entry fee deduction, signed session tokens. Provably fair seed system. Score submission and replay log storage. |
| **Phase 3 (Weeks 9-11)** | Replay validation service. Match resolution scheduled job. Payout queue. End-to-end session flow tested. |
| **Phase 4 (Weeks 12-15)** | React frontend. Phaser stacking block game with action logging. Wallet UI. Lobby and match status views. |
| **Phase 5 (Weeks 16-18)** | Security audit. Anomaly detection. Compliance review. Payment processor go-live approval. |
| **Phase 6 (Week 19+)** | Closed beta. Monitor ledger integrity. Validate replay system under real submissions. Iterate on game feel and UI. |

---

## 10. Technology Summary

| Layer | Technology |
|-------|------------|
| **Platform API** | PHP / Laravel (sole backend service) |
| **Game Client** | Phaser.js + Matter.js (runs in browser) |
| **Frontend Shell** | React + Vite |
| **Match Resolution** | Laravel Scheduler + Queues |
| **Database** | MySQL or PostgreSQL |
| **Cache & Queues** | Redis |
| **Payments** | Sightline, Skrill, or Nuvei |
| **Hosting** | Railway or Render (single service) |
| **CDN / Security** | Cloudflare |
| **Monitoring** | Sentry + Laravel Telescope |

---

## Current Implementation Status

### Completed (Phase 1 - Partial)

- [x] Laravel project structure
- [x] Breeze authentication scaffolding
- [x] User model and migrations
- [x] Landing page (Stack Rush branded)
- [x] Game page placeholder
- [x] Dashboard page
- [x] Tailwind CSS with custom theme
- [x] All auth views (login, register, forgot password, etc.)

### Next Steps

- [ ] Install dependencies (`composer install` && `npm install`)
- [ ] Generate app key (`php artisan key:generate`)
- [ ] Run migrations (`php artisan migrate`)
- [ ] Build assets (`npm run dev` or `npm run build`)
- [ ] Integrate Phaser.js game engine
- [ ] Implement ledger system
- [ ] Add game session management
