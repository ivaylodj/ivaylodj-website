/* ============================================================================
 * ivaylodj.com — Blog comments configuration
 * ----------------------------------------------------------------------------
 * Both values below are SAFE to commit and are public by design:
 *   - The Supabase Project URL is a public endpoint.
 *   - The `anon` key is a public client key. Access control is enforced
 *     server-side by Row-Level Security (see supabase/schema.sql), NOT by
 *     keeping this key secret. Never put the `service_role` key here.
 *
 * Phase 0 (user) hands back these two values from the Supabase dashboard:
 *   Settings → API → Project URL  and  Project API keys → `anon` `public`.
 * Until then the placeholders below keep comments in a graceful "disabled"
 * state — the UI shows a friendly notice instead of erroring.
 * ========================================================================== */
window.COMMENTS_CONFIG = {
  // Supabase Project URL (public endpoint).
  supabaseUrl: 'https://hzezbcryltiqnvekaxqg.supabase.co',

  // Publishable client key (safe to commit; RLS is the real access control).
  supabaseAnonKey: 'sb_publishable_Dl_9b_fHlzXdySMbZMgUZg_aAaYNuWP',

  // Where users return after Google sign-in. Defaults to the current page so
  // the user lands back on the exact post they were reading. Must also be
  // listed in Supabase → Auth → URL Configuration redirect allowlist.
  redirectTo: window.location.origin + window.location.pathname + window.location.search
};
