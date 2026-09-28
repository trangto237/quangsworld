# Learning OS — Project Atlas

A game-first adaptive learning platform (see [`docs/PRD.md`](docs/PRD.md)). One shared, offline-first
backend powers two experiences:

- **Kid app** (`/`): worlds, missions, a chess-themed lane-battle tower defense, bosses, rewards.
- **Parent app** (`/parent/`): insights dashboard, knowledge map, goals, materials import, profiles.

## Quick start

```bash
pnpm install
pnpm dev        # kid → http://localhost:5173/   parent → http://localhost:5173/parent/
pnpm test       # unit tests (engine, knowledge, db, game rules)
pnpm typecheck
pnpm build && pnpm preview   # production build served on http://localhost:4173/
```

First run: open `/parent/` and create the parent account and a child profile. The child then opens `/`,
picks their hero and takes the **Trial of Five Realms** (the adaptive placement test).

## Structure

```text
apps/kid            React + Phaser game client
apps/parent         React dashboard
packages/shared     domain types & utils
packages/knowledge  Subject → Domain → Skill → Concept graph, worlds, question picking, CSV import
packages/engine     placement, mastery + spaced repetition, daily planner, mission sessions, insights, rewards
packages/game       battle simulation (pure, tested) + Phaser 3 renderer
packages/db         Drizzle ORM over SQLite (sql.js), encrypted autosave, cross-tab sync, repository
packages/ui         shared components, theme (dark mode), data hooks
content/            English, Math (incl. parametric generators), Logic, Literature (Vietnamese)
```

`packages/db` is an addition to the PRD's folder list. It keeps persistence out of `shared`.

## How the PRD maps to the code

| PRD | Implementation |
|---|---|
| §4.1 Adaptive placement (25/20/15/10/20 questions) | `engine/placement.ts` starts at difficulty 3, goes up one step after a correct answer and down one after two mistakes in a row. An Elo/1PL ability estimate gives 0–100 scores per section and per concept. Progress autosaves and resumes. |
| §4.2 Knowledge graph | `knowledge/graph.ts` and `content/*`. Each student's mastery, attempts, confidence and review schedule are stored in `concept_states`. |
| §4.3 Game layer | `game/sim.ts`: a correct answer gives energy (plus a streak bonus) to build and upgrade towers. A wrong answer costs energy, makes the enemies surge forward, and puts the concept back in the queue and on the review schedule. A 5-answer streak triggers a "Checkmate Strike". Boss battles. |
| §4.4 Parent dashboard | Weekly time, streak, mastered concepts, subject progress, concept heatmap (with a table view), struggles and strengths, recommended focus, IELTS/CEFR estimate, today's plan, live activity. |
| §4.5 Daily adaptive engine | `engine/planner.ts` scores concepts by due reviews, weakness, recent mistakes, parent goals and prerequisites. It builds blocks such as 8/7/5 min plus a 5 min boss. The plan is fixed for the day. |
| §6 Knowledge import | CSV flashcards become a playable concept right away. PDF, DOCX and image files are stored encrypted; OCR and extraction come in Phase 5. |
| §7 Rewards | Coins, gems, XP and levels. The Armoury unlocks towers, skins, battlefields, avatar items and chess sets. Nothing is bought with real money. |
| §12 Non-functional | Works offline (service worker plus local DB), responsive layout, dark mode, autosave after each answer, AES-GCM encryption at rest, Phaser loaded on demand. |

## Data & privacy

All data stays on the device. After each write the SQLite database is exported, encrypted with AES-GCM
using a non-extractable device key, and stored in IndexedDB. The Web Locks API makes writes from
different tabs run one at a time. A BroadcastChannel tells the other app to refresh, so the parent
dashboard updates while the child plays. The parent password and kid PINs are stored as PBKDF2 hashes.

## Not yet built

Cloud sync (Supabase), OCR and concept extraction for PDFs and images, speaking and writing practice,
and the AI features from PRD §13. Listening questions use the device's speech synthesis, so voice
quality depends on the browser and OS.
