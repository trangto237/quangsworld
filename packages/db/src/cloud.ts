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
      else if (session?.user && session.user.id !== this.user?.id) this.attach(session.user);
    });
    const { data } = await this.client.auth.getSession();
    if (data.session?.user) this.attach(data.session.user);
    else this.set({ state: 'signed-out', email: undefined });
  }

  private teardown() {
    this.detach();
    void this.client?.removeAllChannels();
    this.client = null;
  }

  private attach(user: User) {
    if (!this.client) return;
    this.stopAuto?.();
    this.user = user;
    this.engine = new SyncEngine(this.repo.db, new SupabaseRemote(this.client, user.id));
    this.set({ email: user.email ?? undefined, error: undefined });
    this.refreshCounts();
    if (this.engine.isLinked()) this.beginAuto();
    else this.set({ state: 'needs-link' });
  }

  private detach() {
    this.stopAuto?.();
    this.stopAuto = null;
    this.engine = null;
    this.user = null;
    if (this.status.state !== 'unconfigured') this.set({ state: 'signed-out', email: undefined, pending: 0 });
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
    this.attach(data.session.user);
    return 'signed-in';
  }

  async signIn(email: string, password: string) {
    const client = await this.ensureClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    this.attach(data.user);
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
      ?.channel(`atlas-${this.user?.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'atlas_rows', filter: `family_id=eq.${this.user?.id}` }, () => soon(500))
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

const instances = new WeakMap<Repo, CloudSync>();

/** The app-wide cloud sync controller for this repo. */
export function getCloud(repo: Repo): CloudSync {
  let c = instances.get(repo);
  if (!c) instances.set(repo, (c = new CloudSync(repo)));
  return c;
}
