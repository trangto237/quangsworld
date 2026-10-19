# Family cloud sync with Supabase

Optional. Without it, everything stays on each device. With it, the kid's progress on their laptop
appears on the parent dashboard on any other device (and the other way round for goals and profiles).

Supabase's free tier is plenty: a family uses a few MB at most.

## 1. Create the project

1. Sign in at <https://supabase.com> → **New project**. Pick a region near you (e.g. Singapore) and any database password.
2. When it's ready, open **SQL Editor → New query**, paste all of [`setup.sql`](setup.sql) and press **Run**.
   It creates one table, `atlas_rows`, with row-level security so each family account can only read and
   write its own rows. Running it again is safe.
3. **Authentication → Sign In / Providers → Email**: keep Email enabled. If you'd rather not click a
   confirmation link, turn off **Confirm email**.
4. **Project Settings → API**: copy the **Project URL** and the **anon public** key.
   (Never use the `service_role` key in the app.)

## 2. Give the app the two values

Either:

- **Cloudflare Pages (recommended):** project → **Settings → Variables and Secrets** (Production), add
  `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then redeploy. These are public values (the anon key is
  designed to be shipped to browsers; row-level security protects the data).
- **Or per device:** parent dashboard → **Settings → Cloud sync** → paste them → **Save**.

## 3. Sign in on each device

1. On the device that already has your data (usually the kid's laptop): open `/parent/` → **Settings →
   Cloud sync** → **Create family account** (first time) or **Sign in**. The device uploads its data.
2. On every other device (e.g. your phone): open `/parent/`. On the welcome screen choose
   **Sign in to your family cloud**. Everything downloads, and you log in with your usual dashboard password.
3. The kid app on a device syncs automatically once the parent has signed in there.

If a device already has its own data, you'll be asked to **use the cloud data** (replace this device's) or
**merge both**.

## How it works

- Each device keeps its own encrypted SQLite copy and works offline. Triggers record every changed row.
- Changed rows are uploaded as JSON to `atlas_rows` (one row per app row). Each upload gets an increasing
  `seq`; devices download rows with a higher `seq` than they last saw. Realtime pushes a "something changed"
  signal, and devices also check every 20 seconds and when the app comes back into focus.
- Conflicts are resolved per row: the last upload wins. An unsent change on a device is never overwritten
  by a download.
- Deletions are uploaded as tombstones (`deleted = true`).
- Uploaded files (PDF, DOCX, images) are **not** uploaded; they stay on the device where they were added.
  CSV flashcards do sync.

### Known limitation

Coins/gems/XP are a single row per child. If the kid plays on two devices at the same moment while both
are offline, the device that syncs last wins and the other device's coins from that session are lost.
Learning progress (answers, mastery, mistakes, exam results) is not affected.

## Remove everything

`delete from atlas_rows;` in the SQL editor deletes all synced data (devices keep their local copies).
Deleting the user in **Authentication → Users** also deletes their rows.
