# PRD — Learning OS (Codename: Project Atlas)

Version: 1.0
Author: Trang (Product Owner)
Target builder: Claude Code
Date: 2026-09-28

## 1. Product Vision

Learning OS is a game-first adaptive learning platform for teenagers (initially one child, age 14). Instead of separating school, IELTS, math, and logic into different apps, the platform builds a unified knowledge graph and transforms learning into an RPG/tower-defense experience.

Two different experiences share the same backend:

- Kid App → gameplay, missions, worlds, rewards.
- Parent App → analytics, progress, curriculum management.

## 2. Goals

### Primary

- Increase voluntary daily study habit.
- Personalize learning path based on actual ability.
- Cover English, Mathematics, Logic, and Literature.
- Allow parent to upload curriculum materials (SGK, IELTS books, worksheets).

### Success Metrics

- 20+ minutes average daily study
- 80% weekly retention
- Parent dashboard updated in real time
- Adaptive curriculum after placement test

## 3. Users

### Student

Age: 14

Characteristics:
- Likes Plants vs Zombies
- Likes Chess
- Stronger in mathematics
- Weak in English and Literature
- Goal: IELTS 6.5+

### Parent

Needs:
- View progress
- Assign goals
- Upload learning materials
- Receive insights instead of only scores

## 4. Core Features

### 4.1 Adaptive Placement Test

Purpose:
Estimate ability without asking the child to choose a level.

Duration:
20–30 minutes

Sections:

| Section | Skill | Questions |
|---|---|---|
| Word Hunter | Vocabulary | 25 |
| Sentence Forge | Grammar | 20 |
| Echo Cave | Listening | 15 |
| Reading Puzzle | Reading & Paraphrase | 10 |
| Math Logic | Algebra + Logic | 20 |

Algorithm:
- Start at medium difficulty
- Increase difficulty after correct answers
- Decrease after repeated mistakes
- Output mastery score (0–100)

Output example:

English
- Vocabulary 72
- Grammar 41
- Listening 58
- Reading 63

Math
- Number 90
- Algebra 81
- Geometry 55
- Logic 84

## 4.2 Knowledge Graph

The entire system is built around Concepts.

Subject
  └── Domain
      └── Skill
          └── Concept
              ├── Lessons
              ├── Questions
              ├── Game Missions
              └── Exam References

Example:

English
- Grammar
  - Passive Voice
  - Relative Clauses
  - Conditionals

Math
- Algebra
  - Linear Equations
  - Quadratics

Every concept contains:
- mastery
- attempts
- confidence
- review schedule

## 4.3 Game Layer

Genre:
2D Tower Defense + Puzzle

Player never sees "exercise".

Instead they see:
- Worlds
- Missions
- Bosses
- Rewards
- Characters

Correct answer:
- Generate energy
- Build tower
- Upgrade unit

Wrong answer:
- Enemy advances
- Lose energy
- Concept scheduled for review

## 4.4 Parent Dashboard

Dashboard widgets:

- Weekly study time
- Streak
- Mastered concepts
- Subject progress
- Heatmap of weak concepts
- Recommended focus

Example insight:

Student repeatedly struggles with:
- Passive Voice
- Inference questions

Strongest areas:
- Algebra
- Synonyms

## 4.5 Daily Adaptive Engine

Input:
- mastery
- previous mistakes
- spacing interval
- parent goals

Output:
Today's mission

Example:

Today's 25 minutes

1. 8 min Grammar
2. 7 min Vocabulary
3. 5 min Algebra
4. 5 min Boss Battle

## 5. Subjects

### English

Modules

- Vocabulary
- Grammar
- Reading
- Listening
- Speaking (future)
- Writing (future)

CEFR mapping

A1 → C1

IELTS mapping

4.0–8.0

### Mathematics

Domains

- Number
- Algebra
- Geometry
- Statistics
- Combinatorics
- Mathematical Reasoning

### Logic

- Pattern recognition
- Spatial reasoning
- Chess puzzles
- Deduction
- Sequence

### Literature

- Reading comprehension
- Argument analysis
- Vocabulary
- Writing structure

## 6. Knowledge Import System

Parent uploads:

Supported:

- PDF
- DOCX
- Images
- CSV flashcards

Examples:

- Vietnamese SGK
- Cambridge IELTS
- Oxford Vocabulary
- School worksheets

Pipeline

Upload

↓

OCR

↓

Chunk

↓

Concept Extraction

↓

Question Generation

↓

Game Mission Generation

No copyrighted content should be redistributed.
Materials remain private for the family account.

## 7. Rewards System

Currencies

- Energy
- Coins
- Gems

Unlocks

- Towers
- Skins
- Worlds
- Chess pieces
- Avatar items

No pay-to-win.

## 8. Data Model

Student

```ts
Student {
  id
  name
  age
  grade
}
```

Concept

```ts
Concept {
  id
  subject
  skill
  mastery
  confidence
  nextReview
}
```

Question

```ts
Question {
  conceptId
  difficulty
  type
  source
}
```

Mission

```ts
Mission {
  id
  concepts[]
  duration
  reward
}
```

## 9. Tech Stack

Frontend

- React
- TypeScript
- Vite
- Tailwind

Game

- Phaser 3

State

- Zustand

Database

- SQLite (local)
- Drizzle ORM

Future sync

- Supabase

## 10. Folder Structure

```text
/apps
  kid
  parent

/packages
  ui
  engine
  game
  knowledge
  shared

/content
  english
  math
  literature
  logic
```

## 11. MVP Scope

### Phase 1

- Authentication
- Parent/Kid profile
- Placement Test
- Dashboard

### Phase 2

English only

- Vocabulary
- Grammar
- Review
- Mastery engine

### Phase 3

Game

- Lane battle
- Towers
- Boss
- Rewards

### Phase 4

Math reasoning

### Phase 5

Knowledge import

## 12. Non-functional Requirements

- Offline-first
- Mobile + Tablet + Desktop
- Dark mode
- Autosave
- Under 2 second screen transition
- Local content encryption

## 13. Future AI Features

Not required for MVP.

Later:

- Speaking evaluation
- IELTS Writing feedback
- Automatic concept extraction
- Personalized explanations
- Parent weekly AI report

## 14. Design Principles

1. Child sees a game, not homework.
2. Parent sees insights, not only grades.
3. Everything is concept-based.
4. Adaptive over linear curriculum.
5. Progress should feel like leveling up, not taking tests.
