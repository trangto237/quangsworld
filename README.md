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
| §4.1 Adaptive placement (25/20/15/10/20 questions) | Played as **the Trial of Five Realms**: each section is a battle the castle can't lose, and the realm is freed when its challenges are done, revealing one "power". Behind it, `engine/placement.ts` starts at difficulty 3, goes up one step after a correct answer and down one after two mistakes in a row, and uses an Elo/1PL ability estimate for 0–100 scores. It autosaves after every answer, and the child can rest between realms. |
| §4.2 Knowledge graph | `knowledge/graph.ts` and `content/*`. Each student's mastery, attempts, confidence and review schedule are stored in `concept_states`. |
| §4.3 Game layer | `game/sim.ts`: a correct answer gives energy (plus a streak bonus) and **reloads every tower's limited ammo**. A wrong answer costs energy and makes the enemies surge forward. Later waves come in groups, so a board only holds while the child keeps answering. A 5-answer streak triggers a "Checkmate Strike". Boss battles. |
| Game modes | Four games on one learning loop (`game/src/modes.ts`, `apps/kid/src/components/modes/`), each matched to the content that suits it: 🏃 **Word Runner** for vocabulary (steer into the right answer gate), 🏰 **Castle Defense** for grammar, ♞ **Knight's Quest** for maths and logic (correct answers earn knight moves; capture the Glitch pawns, then the king), ⚔️ **Boss Duel** for reading, listening, literature and every daily boss (turn-based, no time pressure). The daily quest mixes them, the placement realms use four different ones, and the child can pick any mode from a world map. |
| Mistakes | In battle a wrong answer only flashes the right option. Afterwards a **review** goes through each miss (your answer, the right answer, the explanation, the lesson, and the transcript for listening items). Everything is saved to the **Mistake Book**; a correct retry there fixes it and earns coins. Parents see the list on the dashboard. |
| Question variety | Word lists and sentence templates (`content/english/lexicon.ts`, `generators.ts`) generate vocabulary, grammar and listening items, and maths and logic are generated too. A mission never repeats a question and skips anything answered in the last two weeks, matched by wording as well as ID. |
| Vietnamese help | Kid UI text has a dotted underline: hover or tap it for Vietnamese. Buttons show a small Vietnamese line. A 🇻🇳 button translates question instructions, and maths and logic prompts are translated in full. Tapping words in questions and passages gives the Vietnamese meaning, except where that would give away the answer (vocabulary items) or skew the placement estimate (English in the trial). Explanations and lessons have Vietnamese versions. A parent setting per child chooses English + help (default), mostly Vietnamese, or English only. |
| §4.4 Parent dashboard | Weekly time, streak, mastered concepts, subject progress, concept heatmap (with a table view), struggles and strengths, recommended focus, IELTS/CEFR estimate, today's plan, live activity. |
| §4.5 Daily adaptive engine | `engine/planner.ts` scores concepts by due reviews, weakness, recent mistakes, parent goals and prerequisites. It builds blocks such as 8/7/5 min plus a 5 min boss. The plan is fixed for the day. |
| §6 Knowledge import | CSV flashcards become a playable concept right away. PDF, DOCX and image files are stored encrypted; OCR and extraction come in Phase 5. |
| §7 Rewards | Coins, gems, XP and levels. The Armoury unlocks towers, skins, battlefields, avatar items and chess sets. Nothing is bought with real money. |
| §12 Non-functional | Works offline (service worker plus local DB). Laptop-first layout that also works on phones. Dark mode, autosave after each answer, AES-GCM encryption at rest, Phaser loaded on demand. Self-hosted fonts (Baloo 2, Nunito) with full Vietnamese support. |

## Data & privacy

All data stays on the device. After each write the SQLite database is exported, encrypted with AES-GCM
using a non-extractable device key, and stored in IndexedDB. The Web Locks API makes writes from
different tabs run one at a time. A BroadcastChannel tells the other app to refresh, so the parent
dashboard updates while the child plays. The parent password and kid PINs are stored as PBKDF2 hashes.

## Not yet built

Cloud sync (Supabase), OCR and concept extraction for PDFs and images, speaking and writing practice,
and the AI features from PRD §13. Listening questions use the device's speech synthesis, so voice
quality depends on the browser and OS.
