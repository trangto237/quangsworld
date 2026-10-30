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
   - Turn on **Allow anonymous sign-ins** if your child should be able to join with the code only (no email).
4. **Project Settings → API**: copy the **Project URL** and the **anon public** key.
   (Never use the `service_role` key in the app.)

## 2. Give the app the two values

Either:

- **Cloudflare Pages (recommended):** project → **Settings → Variables and Secrets** (Production), add
  `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then redeploy. These are public values (the anon key is
  designed to be shipped to browsers; row-level security protects the data).
- **Or per device:** parent dashboard → **Settings → Cloud sync** → paste them → **Save**.

The optional **Make questions with AI** feature (Materials → Add textbook or document) reuses the two Cloudflare
variables to check that the caller is the signed-in parent; it also needs a free `GEMINI_API_KEY` secret (or a paid
`ANTHROPIC_API_KEY`) — see "Making questions with AI" in the main README.

## 3. Connect your devices

**One sign-in screen.** Everyone signs in at the app's address (`/`): your email opens the parent
dashboard, your child's username opens their own profile.

1. **Your phone or computer:** open the app → **New family? Create a parent account** (name, email,
   password), then create your child's profile. On any other device: open the app and **Sign in** with your
   email; your family's data downloads.
2. **Parent app → Profiles → your child → 🔑 Create login.** Choose a username (e.g. `quang`) and a
   password. Your child signs in with it on their devices and goes straight to their profile — no email
   needed. You can reset the password or remove the login there too.
   *(Needs the latest `setup.sql`: run it again in the SQL editor if Profiles says so.)*
3. Older ways still work: a child's own email account, or a device joined with a family code
   (Settings → Cloud sync → Make a family code).

You never need to touch your child's device. **Settings → Family logins** lists every login in your family
(your child's email, code-only devices); **Remove** stops one from syncing. **Make a new code** stops the old
code from working; logins already in the family stay.

If a device that already has its own data signs in with the parent account, you'll be asked to **use the
cloud data** (replace this device's) or **merge both**.

## How it works

- The parent's Supabase account is the family. A child's own email account or a code-only device (signed in
  anonymously) joins with the family code and is recorded in `atlas_members`, so row-level security lets it
  use that family's rows and nothing else. Only the parent can make codes, see and remove family logins, and
  use the AI question maker.
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
