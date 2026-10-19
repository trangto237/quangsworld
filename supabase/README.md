# Family cloud sync with Supabase

Optional. Without it, everything stays on each device. With it, the kid's progress on their laptop
appears on the parent dashboard on any other device (and the other way round for goals and profiles).

Supabase's free tier is plenty: a family uses a few MB at most.

## 1. Create the project

1. Sign in at <https://supabase.com> → **New project**. Pick a region near you (e.g. Singapore) and any database password.
2. When it's ready, open **SQL Editor → New query**, paste all of [`setup.sql`](setup.sql) and press **Run**.
   It creates the `atlas_rows` table and the family-code tables, with row-level security, so each family can
   only read and write its own rows. Running it again is safe, and it's also how you update an older setup.
3. **Authentication → Sign In / Providers**:
   - **Email**: keep it enabled. If you'd rather not click a confirmation link, turn off **Confirm email**.
   - Turn on **Allow anonymous sign-ins**. That's how your child's devices connect with the family code,
     without an email or password.
4. **Project Settings → API**: copy the **Project URL** and the **anon public** key.
   (Never use the `service_role` key in the app.)

## 2. Give the app the two values

Either:

- **Cloudflare Pages (recommended):** project → **Settings → Variables and Secrets** (Production), add
  `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then redeploy. These are public values (the anon key is
  designed to be shipped to browsers; row-level security protects the data).
- **Or per device:** parent dashboard → **Settings → Cloud sync** → paste them → **Save**.

The optional **Make questions with AI** feature (Materials → Add textbook or document) reuses the two Cloudflare
variables to check that the caller is the signed-in parent; it also needs an `ANTHROPIC_API_KEY` secret — see
"Making questions with AI" in the main README.

## 3. Connect your devices

1. **Your phone (or computer):** open `/parent/`. Create the dashboard account and your child's profile, then go to
   **Settings → Cloud sync → Create family account**. (Already set up on another device? On the welcome
   screen choose **Sign in to your family cloud** instead.)
2. Still in **Settings → Cloud sync**, press **Make a family code**. You get a code like `K7P2Q-X9MHT`.
3. **Your child's laptop (or any device):** they open the app and tap **Connect to my family**, then type the
   code. Their hero appears, and everything they play syncs. You never need to touch their device.

The code works on as many devices as needed (school computer, tablet). **Make a new code** stops the old code
from working; devices already connected stay connected. **Disconnect** under *Connected devices* stops a
device from syncing.

If a device already has its own data when you sign in with email, you'll be asked to **use the cloud data**
(replace this device's) or **merge both**. A child's device that joins with the code takes the cloud's data,
unless it already has play history; then the two are merged.

## How it works

- One Supabase email account is the family. Devices that join with the family code sign in anonymously and
  are recorded in `atlas_members`, so row-level security lets them use that family's rows and nothing else.
  Wrong codes are limited to 10 tries per 15 minutes per device; codes are 10 characters (about 50 bits).
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
Deleting the user in **Authentication → Users** also deletes their rows, code and connected devices.
