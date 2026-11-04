# Our Magical Maintenance 🏰✨

Shared home & car maintenance tracker PWA for Brennen and Hope (Walton, KY). Single-file vanilla JS app + Supabase (auth, Postgres, realtime). Original artwork only.

## Files
- `index.html` – the whole app (supabase-js v2 via jsDelivr, Fredoka/Nunito via Google Fonts)
- `manifest.json`, `sw.js` (cache `maint-v1`), `icon-192.png`, `icon-512.png`
- `maintenance-setup.sql` – tables (`maint_*`), RLS, realtime, starter tasks

## Setup
1. In Supabase (shared project is fine — everything is prefixed `maint_`), open **SQL Editor** and run `maintenance-setup.sql`.
2. **Authentication → Users → Add user** (tick *Auto Confirm User*) twice:
   - `brennen@homemaint.example`, password `homemaint-<Brennen's PIN>`
   - `hope@homemaint.example`, password `homemaint-<Hope's PIN>`
   (Do **not** enable public sign-up for this. PINs are never stored in code.)
3. Run the last block of `maintenance-setup.sql` again (the `insert into maint_members …`) so both users become members. Only members can read/write data.
4. Put the Project URL and anon key into `SUPABASE_URL` / `SUPABASE_ANON_KEY` at the top of the script in `index.html`.
5. Host the folder on any static host (GitHub Pages / Netlify). HTTPS required for the service worker.

## Install on iPhone
Open the URL in **Safari** → Share → **Add to Home Screen** → Add.

## Notes
- Status: Overdue (past due), Due soon (≤14 days for intervals under 2 months, else ≤30 days; or ≤500 mi left), OK. Car tasks with a mileage interval use the worst of date and miles.
- Offline: cached list is viewable; edits/completions queue in localStorage and sync when back online (last write wins).
- PIN login is light security (a 3–4 digit PIN plus a 30 s client-side lockout after 5 misses). Don't store anything sensitive here.
- `calendar_event_id` is reserved for an external Google Calendar sync; the app shows a 📅 icon when it's set.
- To change the PIN, update that user's password in Supabase to `homemaint-<newPIN>`.
