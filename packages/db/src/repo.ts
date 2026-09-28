import { and, desc, eq, gte } from 'drizzle-orm';
import type {
  Attempt, ConceptDef, ConceptState, Goal, GoalKind, PlacementScores, Question, Reward, Student, StudySession, Wallet,
} from '@atlas/shared';
import { uid } from '@atlas/shared';
import { allConcepts, flashcardsToConcept, registerCustomContent, unregisterConcept } from '@atlas/knowledge';
import { SHOP, STARTER_ITEMS, canAfford, newConceptState, scheduleReview, type PlacementState } from '@atlas/engine';
import type { AtlasDb } from './database';
import * as t from './schema';
import { hashSecret, verifySecret } from './crypto';

type StudentRow = typeof t.students.$inferSelect;
const toStudent = (r: StudentRow): Student & { hasPin: boolean } => ({
  id: r.id,
  name: r.name,
  age: r.age,
  grade: r.grade,
  avatar: r.avatar,
  placementDone: r.placementDone,
  createdAt: r.createdAt,
  hasPin: !!r.pinHash,
});

export type StudentProfile = ReturnType<typeof toStudent>;

export interface NewStudent {
  name: string;
  age: number;
  grade: number;
  avatar: string;
  pin?: string;
}

/** High-level data access used by both apps. Reads are synchronous; writes autosave. */
export class Repo {
  constructor(readonly db: AtlasDb) {}

  // ── Family / auth ─────────────────────────────────────────
  getFamily() {
    return this.db.read((o) => o.select().from(t.family).get());
  }

  async createFamily(parentName: string, password: string) {
    if (this.getFamily()) throw new Error('Family account already exists');
    if (password.length < 4) throw new Error('Password must be at least 4 characters');
    const { hash, salt } = await hashSecret(password);
    await this.db.write((o) => o.insert(t.family).values({ id: uid('fam_'), parentName, passwordHash: hash, salt, createdAt: Date.now() }).run());
  }

  async verifyParent(password: string) {
    const f = this.getFamily();
    return !!f && verifySecret(password, f.passwordHash, f.salt);
  }

  async changeParentPassword(oldPw: string, newPw: string) {
    const f = this.getFamily();
    if (!f || !(await this.verifyParent(oldPw))) throw new Error('Current password is incorrect');
    const { hash, salt } = await hashSecret(newPw);
    await this.db.write((o) => o.update(t.family).set({ passwordHash: hash, salt }).where(eq(t.family.id, f.id)).run());
  }

  // ── Students ──────────────────────────────────────────────
  listStudents(): StudentProfile[] {
    return this.db.read((o) => o.select().from(t.students).orderBy(t.students.createdAt).all()).map(toStudent);
  }

  getStudent(id: string): StudentProfile | undefined {
    const r = this.db.read((o) => o.select().from(t.students).where(eq(t.students.id, id)).get());
    return r && toStudent(r);
  }

  async addStudent(s: NewStudent): Promise<string> {
    const id = uid('stu_');
    const pin = s.pin ? await hashSecret(s.pin) : undefined;
    await this.db.write((o) => {
      o.insert(t.students)
        .values({ id, name: s.name, age: s.age, grade: s.grade, avatar: s.avatar, pinHash: pin?.hash, pinSalt: pin?.salt, placementDone: false, createdAt: Date.now() })
        .run();
      o.insert(t.wallets).values({ studentId: id, coins: 100, gems: 0, xp: 0 }).run();
      for (const itemId of STARTER_ITEMS) o.insert(t.unlocks).values({ studentId: id, itemId, createdAt: Date.now() }).run();
      o.insert(t.goals).values({ id: uid('goal_'), studentId: id, kind: 'dailyMinutes', value: '25', active: true, createdAt: Date.now() }).run();
    });
    return id;
  }

  async updateStudent(id: string, patch: Partial<Omit<NewStudent, 'pin'>> & { pin?: string | null }) {
    const pin = patch.pin ? await hashSecret(patch.pin) : undefined;
    await this.db.write((o) =>
      o.update(t.students)
        .set({
          ...(patch.name !== undefined && { name: patch.name }),
          ...(patch.age !== undefined && { age: patch.age }),
          ...(patch.grade !== undefined && { grade: patch.grade }),
          ...(patch.avatar !== undefined && { avatar: patch.avatar }),
          ...(patch.pin === null && { pinHash: null, pinSalt: null }),
          ...(pin && { pinHash: pin.hash, pinSalt: pin.salt }),
        })
        .where(eq(t.students.id, id))
        .run(),
    );
  }

  async verifyStudentPin(id: string, pin: string) {
    const r = this.db.read((o) => o.select().from(t.students).where(eq(t.students.id, id)).get());
    if (!r) return false;
    if (!r.pinHash || !r.pinSalt) return true;
    return verifySecret(pin, r.pinHash, r.pinSalt);
  }

  async removeStudent(id: string) {
    await this.db.write((o) => {
      for (const table of [t.conceptStates, t.attempts, t.sessions, t.placementResults, t.goals, t.unlocks] as const) {
        o.delete(table).where(eq(table.studentId, id)).run();
      }
      o.delete(t.wallets).where(eq(t.wallets.studentId, id)).run();
      o.delete(t.students).where(eq(t.students.id, id)).run();
      o.delete(t.kv).where(eq(t.kv.key, `placement:${id}`)).run();
      o.delete(t.kv).where(eq(t.kv.key, `equipped:${id}`)).run();
    });
  }

  // ── Concept states ────────────────────────────────────────
  getStates(studentId: string): Record<string, ConceptState> {
    const rows = this.db.read((o) => o.select().from(t.conceptStates).where(eq(t.conceptStates.studentId, studentId)).all());
    return Object.fromEntries(rows.map(({ studentId: _s, ...s }) => [s.conceptId, s]));
  }

  private upsertState(o: Parameters<Parameters<AtlasDb['write']>[0]>[0], studentId: string, s: ConceptState) {
    o.insert(t.conceptStates)
      .values({ studentId, ...s })
      .onConflictDoUpdate({ target: [t.conceptStates.studentId, t.conceptStates.conceptId], set: { ...s } })
      .run();
  }

  async saveStates(studentId: string, states: ConceptState[]) {
    await this.db.write((o) => states.forEach((s) => this.upsertState(o, studentId, s)));
  }

  // ── Attempts & sessions ───────────────────────────────────
  /** Records an answer and the concept's new state together (autosaved per answer). */
  async recordAnswer(a: Omit<Attempt, 'id' | 'createdAt'> & { createdAt?: number }, state?: ConceptState) {
    await this.db.write((o) => {
      o.insert(t.attempts).values({ ...a, id: uid('att_'), createdAt: a.createdAt ?? Date.now() }).run();
      if (state) this.upsertState(o, a.studentId, state);
    });
  }

  listAttempts(studentId: string, since = 0): Attempt[] {
    return this.db.read((o) =>
      o.select().from(t.attempts).where(and(eq(t.attempts.studentId, studentId), gte(t.attempts.createdAt, since))).orderBy(t.attempts.createdAt).all(),
    );
  }

  async addSession(s: Omit<StudySession, 'id'>) {
    if (s.activeMs < 5_000) return;
    await this.db.write((o) => o.insert(t.sessions).values({ ...s, id: uid('ses_') }).run());
  }

  listSessions(studentId: string, since = 0): StudySession[] {
    return this.db.read((o) =>
      o.select().from(t.sessions).where(and(eq(t.sessions.studentId, studentId), gte(t.sessions.startedAt, since))).orderBy(t.sessions.startedAt).all(),
    );
  }

  // ── Placement ─────────────────────────────────────────────
  getPlacementProgress(studentId: string): PlacementState | undefined {
    return this.getKv<PlacementState>(`placement:${studentId}`);
  }

  async savePlacementProgress(studentId: string, state: PlacementState, answer?: Omit<Attempt, 'id' | 'createdAt' | 'studentId' | 'context'>) {
    await this.db.write((o) => {
      o.insert(t.kv).values({ key: `placement:${studentId}`, value: state }).onConflictDoUpdate({ target: t.kv.key, set: { value: state } }).run();
      if (answer) o.insert(t.attempts).values({ ...answer, studentId, context: 'placement', id: uid('att_'), createdAt: Date.now() }).run();
    });
  }

  /**
   * Stores the result and seeds every concept's mastery: tested concepts from their own
   * estimate, untested ones from the matching subject/domain score.
   */
  async completePlacement(studentId: string, scores: PlacementScores, now = Date.now()) {
    const englishAvg = Object.values(scores.english).reduce((a, b) => a + b, 0) / 4;
    const mathAvg = (scores.math.number + scores.math.algebra + scores.math.geometry) / 3;
    const fallback = (c: ConceptDef) => {
      if (c.subject === 'english') {
        const d = c.domain.toLowerCase() as keyof PlacementScores['english'];
        return scores.english[d] ?? englishAvg;
      }
      if (c.subject === 'math') return c.domain === 'Geometry' ? scores.math.geometry : c.domain === 'Algebra' ? scores.math.algebra : mathAvg;
      if (c.subject === 'logic') return scores.math.logic;
      // Literature is not in the placement; reading ability is the best proxy.
      return Math.round((scores.english.reading + englishAvg) / 2);
    };
    await this.db.write((o) => {
      for (const c of allConcepts()) {
        const seed = scores.concepts[c.id] ?? fallback(c);
        const s = newConceptState(c.id, seed, now, c.id in scores.concepts);
        this.upsertState(o, studentId, c.id in scores.concepts ? scheduleReview(s, seed / 100, now) : s);
      }
      o.insert(t.placementResults).values({ id: uid('pl_'), studentId, createdAt: now, scores }).run();
      o.update(t.students).set({ placementDone: true }).where(eq(t.students.id, studentId)).run();
      o.delete(t.kv).where(eq(t.kv.key, `placement:${studentId}`)).run();
    });
  }

  latestPlacement(studentId: string): { createdAt: number; scores: PlacementScores } | undefined {
    const r = this.db.read((o) =>
      o.select().from(t.placementResults).where(eq(t.placementResults.studentId, studentId)).orderBy(desc(t.placementResults.createdAt)).get(),
    );
    return r && { createdAt: r.createdAt, scores: r.scores as PlacementScores };
  }

  async resetPlacement(studentId: string) {
    await this.db.write((o) => {
      o.update(t.students).set({ placementDone: false }).where(eq(t.students.id, studentId)).run();
      o.delete(t.kv).where(eq(t.kv.key, `placement:${studentId}`)).run();
    });
  }

  // ── Goals ─────────────────────────────────────────────────
  listGoals(studentId: string): Goal[] {
    return this.db.read((o) => o.select().from(t.goals).where(eq(t.goals.studentId, studentId)).orderBy(t.goals.createdAt).all());
  }

  /** dailyMinutes and ieltsTarget are single-valued: setting one replaces the previous. */
  async setGoal(studentId: string, kind: GoalKind, value: string) {
    await this.db.write((o) => {
      if (kind === 'dailyMinutes' || kind === 'ieltsTarget') o.delete(t.goals).where(and(eq(t.goals.studentId, studentId), eq(t.goals.kind, kind))).run();
      o.insert(t.goals).values({ id: uid('goal_'), studentId, kind, value, active: true, createdAt: Date.now() }).run();
    });
  }

  async toggleGoal(id: string, active: boolean) {
    await this.db.write((o) => o.update(t.goals).set({ active }).where(eq(t.goals.id, id)).run());
  }

  async deleteGoal(id: string) {
    await this.db.write((o) => o.delete(t.goals).where(eq(t.goals.id, id)).run());
  }

  // ── Wallet & unlocks ──────────────────────────────────────
  getWallet(studentId: string): Wallet {
    const w = this.db.read((o) => o.select().from(t.wallets).where(eq(t.wallets.studentId, studentId)).get());
    return w ? { coins: w.coins, gems: w.gems, xp: w.xp } : { coins: 0, gems: 0, xp: 0 };
  }

  listUnlocks(studentId: string): string[] {
    const rows = this.db.read((o) => o.select().from(t.unlocks).where(eq(t.unlocks.studentId, studentId)).all());
    return [...new Set([...STARTER_ITEMS, ...rows.map((r) => r.itemId)])];
  }

  /**
   * Finishes a mission atomically: final concept states (with review schedule),
   * the study session and the reward.
   */
  async completeMission(studentId: string, input: { states: ConceptState[]; session: Omit<StudySession, 'id' | 'studentId'>; reward: Reward }) {
    await this.db.write((o) => {
      input.states.forEach((s) => this.upsertState(o, studentId, s));
      if (input.session.activeMs >= 5_000) o.insert(t.sessions).values({ ...input.session, studentId, id: uid('ses_') }).run();
      const w = this.getWallet(studentId);
      o.insert(t.wallets)
        .values({ studentId, coins: w.coins + input.reward.coins, gems: w.gems + input.reward.gems, xp: w.xp + input.reward.xp })
        .onConflictDoUpdate({ target: t.wallets.studentId, set: { coins: w.coins + input.reward.coins, gems: w.gems + input.reward.gems, xp: w.xp + input.reward.xp } })
        .run();
    });
  }

  async purchase(studentId: string, itemId: string) {
    const item = SHOP.find((i) => i.id === itemId);
    if (!item) throw new Error('Unknown item');
    await this.db.write((o) => {
      const w = this.getWallet(studentId);
      if (this.listUnlocks(studentId).includes(itemId)) throw new Error('Already unlocked');
      if (!canAfford(w, item)) throw new Error('Not enough coins or gems');
      o.update(t.wallets).set({ coins: w.coins - item.coins, gems: w.gems - item.gems }).where(eq(t.wallets.studentId, studentId)).run();
      o.insert(t.unlocks).values({ studentId, itemId, createdAt: Date.now() }).run();
    });
  }

  // ── Key/value ─────────────────────────────────────────────
  getKv<T>(key: string): T | undefined {
    return this.db.read((o) => o.select().from(t.kv).where(eq(t.kv.key, key)).get())?.value as T | undefined;
  }

  async setKv(key: string, value: unknown) {
    await this.db.write((o) => o.insert(t.kv).values({ key, value }).onConflictDoUpdate({ target: t.kv.key, set: { value } }).run());
  }

  // ── Knowledge import (PRD §6) ─────────────────────────────
  listMaterials() {
    return this.db.read((o) => o.select().from(t.materials).orderBy(desc(t.materials.createdAt)).all());
  }

  /** Registers all family-imported content with the knowledge graph. Call on startup and after changes. */
  loadCustomContent() {
    const rows = this.db.read((o) => o.select().from(t.customItems).all());
    registerCustomContent(
      rows.filter((r) => r.kind === 'concept').map((r) => r.data as ConceptDef),
      rows.filter((r) => r.kind === 'question').map((r) => r.data as Question),
    );
  }

  async importFlashcards(name: string, csv: string) {
    const res = flashcardsToConcept(csv, name);
    const materialId = uid('mat_');
    await this.db.write((o) => {
      o.insert(t.materials)
        .values({ id: materialId, name, kind: 'csv', size: csv.length, status: 'processed', note: `${res.cards.length} cards → ${res.questions.length} questions`, conceptId: res.concept.id, createdAt: Date.now() })
        .run();
      o.insert(t.customItems).values({ id: res.concept.id, kind: 'concept', materialId, data: res.concept }).onConflictDoNothing().run();
      for (const q of res.questions) o.insert(t.customItems).values({ id: q.id, kind: 'question', materialId, data: q }).onConflictDoNothing().run();
    });
    registerCustomContent([res.concept], res.questions);
    return res;
  }

  /** PDFs, DOCX and images are stored encrypted; OCR/extraction arrives with the Phase 5 pipeline. */
  async storeMaterialFile(name: string, kind: 'pdf' | 'docx' | 'image', bytes: Uint8Array) {
    const id = uid('mat_');
    await this.db.putFile(id, bytes);
    await this.db.write((o) =>
      o.insert(t.materials)
        .values({ id, name, kind, size: bytes.byteLength, status: 'stored', note: 'Stored privately. Automatic extraction is coming in Phase 5.', createdAt: Date.now() })
        .run(),
    );
    return id;
  }

  async deleteMaterial(id: string) {
    const m = this.db.read((o) => o.select().from(t.materials).where(eq(t.materials.id, id)).get());
    await this.db.write((o) => {
      if (m?.conceptId) o.delete(t.conceptStates).where(eq(t.conceptStates.conceptId, m.conceptId)).run();
      o.delete(t.customItems).where(eq(t.customItems.materialId, id)).run();
      o.delete(t.materials).where(eq(t.materials.id, id)).run();
    });
    await this.db.deleteFile(id);
    if (m?.conceptId) unregisterConcept(m.conceptId);
  }
}
