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
  // e.g. 'https://abcdefghijklmno.supabase.co'
  supabaseUrl: 'REPLACE_WITH_SUPABASE_PROJECT_URL',

  // the `anon` `public` API key (a long JWT-looking string)
  supabaseAnonKey: 'REPLACE_WITH_SUPABASE_ANON_KEY',

  // Where users return after Google sign-in. Defaults to the current page so
  // the user lands back on the exact post they were reading. Must also be
  // listed in Supabase → Auth → URL Configuration redirect allowlist.
  redirectTo: window.location.origin + window.location.pathname + window.location.search
};
