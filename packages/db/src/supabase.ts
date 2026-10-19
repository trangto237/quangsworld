import type { SupabaseClient } from '@supabase/supabase-js';
import type { Remote, RemoteRow } from './sync';

/** Table created by supabase/setup.sql. Row-level security limits every query to the signed-in family. */
const TABLE = 'atlas_rows';

/** The family cloud: one Supabase user = one family. */
export class SupabaseRemote implements Remote {
  constructor(
    private client: SupabaseClient,
    private userId: string,
  ) {}

  accountId() {
    return this.userId;
  }

  async push(rows: RemoteRow[]) {
    const { error } = await this.client.from(TABLE).upsert(
      rows.map((r) => ({ family_id: this.userId, tbl: r.tbl, pk: r.pk, data: r.data, deleted: r.deleted })),
      { onConflict: 'family_id,tbl,pk' },
    );
    if (error) throw new Error(`Upload failed: ${error.message}`);
  }

  async pull(sinceSeq: number, limit: number): Promise<RemoteRow[]> {
    const { data, error } = await this.client.from(TABLE).select('tbl, pk, data, deleted, seq').gt('seq', sinceSeq).order('seq').limit(limit);
    if (error) throw new Error(`Download failed: ${error.message}`);
    return (data ?? []).map((r) => ({ tbl: r.tbl, pk: r.pk, data: r.data, deleted: r.deleted, seq: Number(r.seq) }));
  }

  async hasData(tbl?: string) {
    let q = this.client.from(TABLE).select('pk', { count: 'exact', head: true }).eq('deleted', false);
    if (tbl) q = q.eq('tbl', tbl);
    const { count, error } = await q;
    if (error) throw new Error(`Cloud check failed: ${error.message}`);
    return (count ?? 0) > 0;
  }
}
