/**
 * Family cloud sync (Supabase), browser side. Both apps call `getCloud(repo).start()`; the parent
 * app signs in and links the device, and the kid app (same origin → same session and database)
 * then syncs in the background too. supabase-js is only downloaded when sync is configured.
 */
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Repo } from './repo';
import { SyncEngine, type LinkMode } from './sync';
import { SupabaseRemote } from './supabase';

export interface CloudConfig {
  url: string;
  anonKey: string;
}

export type CloudState =
  /** No Supabase URL / key yet. */
  | 'unconfigured'
  | 'signed-out'
  /** Signed in, but this device isn't linked yet (the parent links it in Settings). */
  | 'needs-link'
  /** Both this device and the cloud have data: the parent must choose. */
  | 'needs-choice'
  | 'syncing'
  | 'synced'
  | 'offline'
  | 'error';

export interface CloudStatus {
  state: CloudState;
  email?: string;
  /** This device joined with a family code (no email account of its own). */
  viaCode?: boolean;
  /** 'parent': the family's own account. 'member': a child's email account or a code-joined device. */
  role?: 'parent' | 'member';
  lastSyncedAt: number | null;
  pending: number;
  error?: string;
}

const CONFIG_KEY = 'atlas-cloud-config';
const INTERVAL_MS = 20_000;
const AFTER_WRITE_MS = 2_000;

const envConfig = (): CloudConfig | null => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
};

function storedConfig(): CloudConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? (JSON.parse(raw) as CloudConfig) : null;
  } catch {
    return null;
  }
}

export class CloudSync {
  private status: CloudStatus = { state: 'unconfigured', lastSyncedAt: null, pending: 0 };
  private listeners = new Set<() => void>();
  private client: SupabaseClient | null = null;
  private engine: SyncEngine | null = null;
  private user: User | null = null;
  private familyId: string | null = null;
  private attachSeq = 0;
  private stopAuto: (() => void) | null = null;
  private started: Promise<void> | null = null;

  constructor(private repo: Repo) {
    repo.db.subscribe(() => this.refreshCounts());
  }

  // ── Status (for React: useSyncExternalStore(cloud.subscribe, cloud.getStatus)) ──
  getStatus = () => this.status;
  subscribe = (cb: () => void) => {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  };
  private set(patch: Partial<CloudStatus>) {
    this.status = { ...this.status, ...patch };
    for (const cb of this.listeners) cb();
  }
  private refreshCounts() {
    if (!this.engine) return;
    const pending = this.engine.pendingCount();
    const lastSyncedAt = this.engine.lastSyncedAt();
    if (pending !== this.status.pending || lastSyncedAt !== this.status.lastSyncedAt) this.set({ pending, lastSyncedAt });
  }

  // ── Configuration ──
  /** The settings in use: saved on this device, else the build's VITE_SUPABASE_* variables. */
  config(): CloudConfig | null {
    return storedConfig() ?? envConfig();
  }
  defaultConfig(): CloudConfig | null {
    return envConfig();
  }
  async setConfig(cfg: CloudConfig | null) {
    if (cfg) localStorage.setItem(CONFIG_KEY, JSON.stringify({ url: cfg.url.trim(), anonKey: cfg.anonKey.trim() }));
    else localStorage.removeItem(CONFIG_KEY);
    this.teardown();
    this.started = null;
    await this.start();
  }

  // ── Lifecycle ──
  start(): Promise<void> {
    this.started ??= this.boot().catch((e) => this.fail(e));
    return this.started;
  }

  private async boot() {
    const cfg = this.config();
    if (!cfg) return this.set({ state: 'unconfigured', email: undefined });
    const { createClient } = await import('@supabase/supabase-js');
    this.client = createClient(cfg.url, cfg.anonKey, { auth: { persistSession: true, autoRefreshToken: true } });
    this.client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') this.detach();
      else if (session?.user && session.user.id !== this.user?.id) void this.attach(session.user);
    });
    const { data } = await this.client.auth.getSession();
    if (data.session?.user) await this.attach(data.session.user);
    else this.set({ state: 'signed-out', email: undefined });
  }

  private teardown() {
    this.detach();
    void this.client?.removeAllChannels();
    this.client = null;
  }

  /** The family this account belongs to: its own (parent) or the one it joined with a family code. */
  private async resolveFamily(user: User): Promise<string> {
    if (!this.client) return user.id;
    const { data, error } = await this.client.rpc('atlas_my_family');
    // Projects set up before family codes existed don't have the function: the account is the family.
    return !error && typeof data === 'string' ? data : user.id;
  }

  private async attach(user: User) {
    if (!this.client) return;
    const seq = ++this.attachSeq;
    this.stopAuto?.();
    this.stopAuto = null;
    this.user = user;
    const familyId = await this.resolveFamily(user);
    if (seq !== this.attachSeq || !this.client) return; // a newer sign-in won
    this.familyId = familyId;
    this.engine = new SyncEngine(this.repo.db, new SupabaseRemote(this.client, familyId));
    this.set({ email: user.email || undefined, viaCode: !!user.is_anonymous, role: familyId === user.id ? 'parent' : 'member', error: undefined });
    this.refreshCounts();
    if (this.engine.isLinked()) this.beginAuto();
    else this.set({ state: 'needs-link' });
  }

  private detach() {
    this.stopAuto?.();
    this.stopAuto = null;
    this.engine = null;
    this.user = null;
    this.familyId = null;
    this.attachSeq++;
    if (this.status.state !== 'unconfigured') this.set({ state: 'signed-out', email: undefined, viaCode: undefined, role: undefined, pending: 0 });
  }

  private async ensureClient(): Promise<SupabaseClient> {
    await this.start();
    if (!this.client) throw new Error('Cloud sync is not set up: add the Supabase URL and anon key first.');
    return this.client;
  }

  private fail(e: unknown) {
    this.set({ state: 'error', error: e instanceof Error ? e.message : String(e) });
  }

  // ── Account (parent app) ──
  /** Returns 'confirm-email' when the Supabase project requires email confirmation first. */
  async signUp(email: string, password: string): Promise<'signed-in' | 'confirm-email'> {
    const client = await this.ensureClient();
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    if (!data.session?.user) return 'confirm-email';
    await this.attach(data.session.user);
    return 'signed-in';
  }

  async signIn(email: string, password: string) {
    const client = await this.ensureClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    await this.attach(data.user);
  }

  async signOut() {
    const client = await this.ensureClient();
    await client.auth.signOut();
    this.detach();
  }

  /** Links this device to the signed-in family account (see LinkMode). */
  async link(mode: LinkMode = 'auto') {
    await this.ensureClient();
    if (!this.engine) throw new Error('Sign in first.');
    this.set({ state: 'syncing', error: undefined });
    try {
      const r = await this.engine.link(mode);
      if (r === 'needs-choice') return this.set({ state: 'needs-choice' });
      this.refreshCounts();
      this.beginAuto();
    } catch (e) {
      this.fail(e);
      throw e;
    }
  }

  /** Stops syncing on this device; its data stays. */
  async unlink() {
    this.stopAuto?.();
    this.stopAuto = null;
    await this.engine?.unlink();
    this.set({ state: this.engine ? 'needs-link' : 'signed-out' });
  }

  /**
   * The signed-in parent's access token, for the app's own server functions (e.g. /api/generate).
   * Null when signed out, or when this device joined with the family code (anonymous kid device).
   */
  async parentAccessToken(): Promise<string | null> {
    if (!this.config()) return null;
    await this.start();
    if (!this.client) return null;
    const { data } = await this.client.auth.getSession();
    const s = data.session;
    return s && !s.user.is_anonymous && this.status.role === 'parent' ? s.access_token : null;
  }

  /** True when the signed-in account's own family already has data in the cloud (a real parent account). */
  private async ownsFamilyData(): Promise<boolean> {
    if (!this.client) return false;
    const { count, error } = await this.client.from('atlas_rows').select('pk', { count: 'exact', head: true }).eq('tbl', 'family').eq('deleted', false);
    return !error && (count ?? 0) > 0;
  }

  /** Signed-in account: change its password (the parent's is also the dashboard password). */
  async changePassword(newPassword: string) {
    const client = await this.ensureClient();
    const { error } = await client.auth.updateUser({ password: newPassword });
    if (error) throw new Error(friendly(error.message));
  }

  /**
   * A child's own email account (12+): create it and join the family with the family code.
   * If the project asks new accounts to confirm their email, the code is kept on this device and
   * used right after the first sign-in.
   */
  async signUpMember(email: string, password: string, code: string, label: string): Promise<'joined' | 'confirm-email'> {
    const client = await this.ensureClient();
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) throw new Error(friendly(error.message));
    if (!data.session?.user) {
      localStorage.setItem(PENDING_CODE, JSON.stringify({ email: email.toLowerCase(), code, label }));
      return 'confirm-email';
    }
    await this.joinFamily(code, label);
    return 'joined';
  }

  /**
   * Sign in on a child's device with any family login: the child's own email (member) or the parent's.
   * Applies a family code saved at sign-up, then downloads the family's data.
   */
  async signInMember(email: string, password: string, label: string) {
    await this.signIn(email, password);
    const pending = (() => {
      try {
        return JSON.parse(localStorage.getItem(PENDING_CODE) ?? 'null') as { email: string; code: string; label: string } | null;
      } catch {
        return null;
      }
    })();
    if (pending && pending.email === email.toLowerCase() && this.status.role !== 'member') {
      await this.joinFamily(pending.code, pending.label || label);
      localStorage.removeItem(PENDING_CODE);
      return;
    }
    if (this.status.role === 'parent') {
      // The parent's own account on this device (it already has the family's data in the cloud).
      if (!(await this.ownsFamilyData())) {
        await this.signOut();
        throw new Error('This account is not part of a family yet. Create it with the family code (“New account”).');
      }
      if (!this.engine?.isLinked()) await this.link('cloud');
      return;
    }
    if (this.status.role !== 'member') throw new Error('This account is not part of a family yet. Create it with the family code (“New account”).');
    const played = Number(this.repo.db.raw.exec('SELECT COUNT(*) FROM attempts')[0]?.values[0][0] ?? 0) > 0;
    if (!this.engine?.isLinked()) await this.link(played ? 'merge' : 'cloud');
  }

  // ── Family code ──
  /** Parent: the current family code, if one was made ("ABCDE-FGHJK"). */
  async familyCode(): Promise<string | null> {
    const client = await this.ensureClient();
    const { data, error } = await client.from('atlas_family_codes').select('code').maybeSingle();
    if (error) throw new Error(friendly(error.message));
    return data?.code ? formatCode(data.code) : null;
  }

  /** Parent: make a new family code. The old one stops working; joined devices stay joined. */
  async newFamilyCode(): Promise<string> {
    const client = await this.ensureClient();
    const { data, error } = await client.rpc('atlas_new_family_code');
    if (error) throw new Error(friendly(error.message));
    return formatCode(String(data));
  }

  /** Parent: the family's other logins — children's email accounts and devices joined with the code. */
  async devices(): Promise<{ id: string; label: string | null; email: string | null; joinedAt: string }[]> {
    const client = await this.ensureClient();
    let res = await client.from('atlas_members').select('user_id, label, email, created_at').eq('family_id', this.familyId ?? '').order('created_at');
    // Projects set up before member emails existed have no email column.
    if (res.error && /email/.test(res.error.message)) res = (await client.from('atlas_members').select('user_id, label, created_at').eq('family_id', this.familyId ?? '').order('created_at')) as typeof res;
    if (res.error) throw new Error(friendly(res.error.message));
    return (res.data ?? []).map((d) => ({ id: d.user_id, label: d.label, email: (d as { email?: string | null }).email ?? null, joinedAt: d.created_at }));
  }

  /** Parent: disconnect a device; it keeps what it has but can't sync any more. */
  async removeDevice(id: string) {
    const client = await this.ensureClient();
    const { error } = await client.from('atlas_members').delete().eq('user_id', id);
    if (error) throw new Error(friendly(error.message));
  }

  /**
   * Kid's device: join the family with its code — no email or password. Signs in anonymously
   * (Supabase: Authentication → Sign In / Providers → "Allow anonymous sign-ins"), joins, then
   * downloads the family's data. A device without play history simply takes the cloud's data.
   */
  async joinFamily(code: string, label: string) {
    const client = await this.ensureClient();
    this.set({ state: 'syncing', error: undefined });
    try {
      let { data: sess } = await client.auth.getSession();
      if (sess.session && !sess.session.user.is_anonymous && this.status.role === 'parent' && this.status.state !== 'needs-link')
        throw new Error('This device is signed in to the parent account already — it syncs without a code.');
      if (!sess.session) {
        const { error } = await client.auth.signInAnonymously();
        if (error) throw new Error(/anonymous/i.test(error.message) ? 'Family codes need "Allow anonymous sign-ins" turned on in Supabase (Authentication → Sign In / Providers).' : error.message);
        ({ data: sess } = await client.auth.getSession());
      }
      const { data: fam, error } = await client.rpc('atlas_join_family', { p_code: code, p_label: label });
      if (error) throw new Error(friendly(error.message));
      if (!fam) throw new Error('That family code is not right. Check it in the parent app: Settings → Cloud sync.');
      await this.attach(sess.session!.user);
      if (!this.engine) throw new Error('Could not connect. Try again.');
      const played = Number(this.repo.db.raw.exec('SELECT COUNT(*) FROM attempts')[0]?.values[0][0] ?? 0) > 0;
      await this.link(played ? 'merge' : 'cloud');
    } catch (e) {
      const err = new Error(friendly(e instanceof Error ? e.message : String(e)));
      this.fail(err);
      throw err;
    }
  }

  // ── Syncing ──
  async syncNow() {
    if (!this.engine?.isLinked()) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return this.set({ state: 'offline' });
    const run = async () => {
      this.set({ state: 'syncing' });
      try {
        await this.engine!.syncOnce();
        this.set({ state: 'synced', error: undefined });
      } catch (e) {
        this.fail(e);
      }
      this.refreshCounts();
    };
    // One tab syncs at a time (the kid and parent apps may both be open).
    const locks = navigator.locks;
    if (locks) await locks.request('atlas-sync', { ifAvailable: true }, (lock) => (lock ? run() : undefined));
    else await run();
  }

  private beginAuto() {
    this.stopAuto?.();
    const now = () => void this.syncNow();
    let debounce = 0;
    const soon = (ms: number) => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(now, ms);
    };
    const interval = window.setInterval(now, INTERVAL_MS);
    const unsub = this.repo.db.subscribe((origin) => origin === 'local' && soon(AFTER_WRITE_MS));
    const onFocus = () => soon(200);
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onFocus);
    // Realtime: another device uploaded → download now.
    const channel = this.client
      ?.channel(`atlas-${this.familyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'atlas_rows', filter: `family_id=eq.${this.familyId}` }, () => soon(500))
      .subscribe();
    this.stopAuto = () => {
      window.clearInterval(interval);
      window.clearTimeout(debounce);
      unsub();
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onFocus);
      if (channel) void this.client?.removeChannel(channel);
    };
    now();
  }
}

const PENDING_CODE = 'atlas-pending-family-code';
const formatCode = (c: string) => (c.length === 10 ? `${c.slice(0, 5)}-${c.slice(5)}` : c);
const friendly = (m: string) =>
  /atlas_(family_codes|members|join_family|new_family_code)|schema cache|does not exist/i.test(m)
    ? 'Your Supabase project needs the latest setup script: run supabase/setup.sql again in the SQL editor.'
    : /failed to fetch|network/i.test(m)
      ? "Can't reach Supabase. Check the internet connection."
      : m;

const instances = new WeakMap<Repo, CloudSync>();

/** The app-wide cloud sync controller for this repo. */
export function getCloud(repo: Repo): CloudSync {
  let c = instances.get(repo);
  if (!c) instances.set(repo, (c = new CloudSync(repo)));
  return c;
}
