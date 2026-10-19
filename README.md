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
| Pronunciation | Sound Temple world (`content/english/pronunciation.ts`): word stress ("main stress placed differently"), -ed/-s endings and letter sounds ("underlined part pronounced differently") as in Vietnamese school exams, plus minimal-pair listening (ship/sheep, bike/bite). Underlined parts are marked `sch[oo]l`. Reviews show stress patterns (col-LEC-tion) and play each word aloud. |
| Exam Hall | Timed mock papers in the real formats (`engine/src/exams.ts`, `apps/kid/src/screens/Exam.tsx`): a 40-question **Hà Nội grade-10 entrance** English paper scored /10 (pronunciation, stress, grammar & vocabulary, communication, signs, cloze passage, reading, sentence arrangement, transformation, combination), and **IELTS Reading and Listening minis** with headings, True/False/Not Given, typed completion answers and multi-voice recordings, with the band estimated from the score. Papers avoid passages already used. The timer keeps running, progress is saved after each answer, and the child can resume. Results update mastery, wrong answers go to the Mistake Book, and the parent dashboard lists every paper with its weakest part. The same exam question types also appear in the Scholars' Academy and IELTS Tower worlds. |
| Coach | 🦉 **Coach Owl** (`content/english/tutor.ts`, `apps/kid/src/components/Coach.tsx`) explains answers step by step in English and Vietnamese. **Word stress:** it splits each word into syllables, names the rule that puts the stress there (-tion, -ity, -ee, prefixes, noun or verb…) and says plainly when a word is an exception; a 🥁 button plays the word and animates the beat. **-ed/-s endings:** it finds the last sound and applies the throat test. Letter sounds, minimal pairs and grammar clues ("yesterday" → past simple) are covered too, with "why not your answer?". Each walkthrough ends with a short drill on the same rule (tap the stressed syllable, pick the ending sound) or fresh similar questions. It opens from any review, the Mistake Book and exam reviews, as a 🦉 Hint in calm practice, from world lessons, and in **Coach Owl's corner**, which lists every rule with examples you can hear, practice for each, and the child's weak spots. |
| Mistakes | In battle a wrong answer only flashes the right option. Afterwards a **review** goes through each miss (your answer, the right answer, the explanation, the lesson, and the transcript for listening items). Everything is saved to the **Mistake Book**; a correct retry there fixes it and earns coins. Parents see the list on the dashboard. |
| Question variety | Word lists and sentence templates (`content/english/lexicon.ts`, `generators.ts`) generate vocabulary, grammar and listening items, and maths and logic are generated too. A mission never repeats a question and skips anything answered in the last two weeks, matched by wording as well as ID. |
| Vietnamese help | Kid UI text has a dotted underline: hover or tap it for Vietnamese. Buttons show a small Vietnamese line. A 🇻🇳 button translates question instructions, and maths and logic prompts are translated in full. Tapping words in questions and passages gives the Vietnamese meaning, except where that would give away the answer (vocabulary items) or skew the placement estimate (English in the trial). Explanations and lessons have Vietnamese versions. A parent setting per child chooses English + help (default), mostly Vietnamese, or English only. |
| §4.4 Parent dashboard | Weekly time, streak, mastered concepts, subject progress, concept heatmap (with a table view), struggles and strengths, recommended focus, IELTS/CEFR estimate, today's plan, live activity. |
| §4.5 Daily adaptive engine | `engine/planner.ts` scores concepts by due reviews, weakness, recent mistakes, parent goals and prerequisites. It builds blocks such as 8/7/5 min plus a 5 min boss. The plan is fixed for the day. |
| §6 Knowledge import | **Add textbook or document** (parent → Materials): upload PDF, Word or TXT pages, photos of pages, or paste text, and pick the **Tiếng Anh 9 Global Success** unit (or name another book). Offline, the app recognises *Quick Import* questions (numbered, options A–D, `*` marks the right one), word lists (`cave (n): hang động`) and reading texts, and makes word quizzes, typed spelling, Sentence Sprint word-order items and gap-fills (`packages/knowledge/src/importers.ts`). With Claude set up on the server (below), **Make questions with AI** also reads photos and scanned PDFs and writes explanations in English and Vietnamese. **Scanned books** are read on the device (OCR with tesseract.js, English + Vietnamese, served from `/parent/ocr/`, free, about 3–8 s per page). **Whole book — split by unit** finds each unit page by page ("UNIT n" lines and page headers, unit titles, "Getting started" openers; the contents, Review and answer-key pages are skipped) and saves each unit's questions to that unit. The parent reviews and edits every question before saving. Each unit part becomes a mission in the kid's **📘 My Textbook** world (vocabulary, sentences & grammar, reading, practice questions); importing more pages of a unit adds to the same missions, and the daily plan favours fresh units. CSV flashcard decks still work. Originals are kept encrypted on the device; the questions sync. |
| §7 Rewards | Coins, gems, XP and levels. The Armoury unlocks towers, skins, battlefields, avatar items and chess sets. Nothing is bought with real money. |
| §12 Non-functional | Works offline (service worker plus local DB). Laptop-first layout that also works on phones. Dark mode, autosave after each answer, AES-GCM encryption at rest, Phaser loaded on demand. Self-hosted fonts (Baloo 2, Nunito) with full Vietnamese support. |

## Data & privacy

Each device keeps its own copy. After each write the SQLite database is exported, encrypted with AES-GCM
using a non-extractable device key, and stored in IndexedDB. The Web Locks API makes writes from
different tabs run one at a time. A BroadcastChannel tells the other app to refresh, so the parent
dashboard updates while the child plays. The parent password and kid PINs are stored as PBKDF2 hashes.

**Cloud sync (optional).** With your own Supabase project, devices sync through it: the parent dashboard on
your phone shows progress made on the kid's laptop. Setup takes about 10 minutes: see
[`supabase/README.md`](supabase/README.md) and run [`supabase/setup.sql`](supabase/setup.sql). Changed rows
are recorded by SQLite triggers, uploaded as JSON to a single `atlas_rows` table protected by row-level
security (only your family can read it), and downloaded by the other devices. The parent signs in with
email on their own device; the child's devices connect by typing a **family code** in the kid app (an
anonymous sign-in that joins the family), so nobody has to set up the child's laptop for them. The last upload wins
per row. Uploaded files (PDF, DOCX, images) stay on the device where they were added; CSV flashcards
sync. supabase-js is downloaded only on devices where sync is set up. Code: `packages/db/src/sync.ts`
(engine, tested against an in-memory cloud), `supabase.ts`, `cloud.ts`.

## Making questions with AI (optional)

The **Make questions with AI** button calls a Cloudflare Pages Function, `functions/api/generate.ts`
(logic and tests in `server/generate-core.ts`), which asks Claude (`claude-opus-5-5`, structured JSON output)
for questions grounded only in the uploaded material. Each question is checked again on the server and in
the browser before it can reach the game. To turn it on:

1. Get an API key at <https://console.anthropic.com> (pay-as-you-go; it uses Claude Opus 5.5, roughly 10–30 US cents per unit of pages).
2. Cloudflare Pages → your project → **Settings → Variables and Secrets** → add a **secret**
   `ANTHROPIC_API_KEY`. The function also needs the Supabase URL and anon key: the `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` variables from cloud sync are reused (or set `SUPABASE_URL` / `SUPABASE_ANON_KEY`).
3. Redeploy. In the parent app, sign in to the family cloud account (Settings → Cloud sync).

The key never reaches the browser. Only the signed-in parent account can use the function: it checks the
Supabase sign-in on every request and refuses kid devices that joined with the family code, so nobody else can
spend your credits. Locally (`pnpm preview`) there is no function, and the button explains how to enable it;
`npx wrangler pages dev dist` runs the function locally.

## Not yet built

Syncing the original uploaded files (the questions made from them do sync), offline OCR for photos (photos need AI), speaking and writing practice,
and the other AI features from PRD §13. Listening questions use the device's speech synthesis, so voice
quality depends on the browser and OS.
