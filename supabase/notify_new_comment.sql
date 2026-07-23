-- ============================================================================
-- ivaylodj.com — Email notification on new blog comment
-- Run this in the Supabase SQL Editor AFTER schema.sql.
--
-- Flow:  INSERT into public.comments  ->  AFTER trigger  ->  pg_net async POST
--        to the Resend API  ->  email lands in the owner's inbox.
--
-- SECRETS: the Resend API key is a real secret. It is stored ENCRYPTED in
-- Supabase Vault and read only inside the SECURITY DEFINER trigger function.
-- It NEVER goes into website code or the git repo — that is why the line below
-- has a placeholder you replace in the SQL Editor, not in this file.
--
-- Free-tier note: Resend's shared sender (onboarding@resend.dev) may only send
-- TO the address you registered your Resend account with. That address must
-- match the 'to' recipient below. To send FROM your own domain later, verify
-- ivaylodj.com in Resend (DNS) and change the 'from' line.
-- ============================================================================

-- 1. Extensions --------------------------------------------------------------
create extension if not exists pg_net;      -- async HTTP from Postgres

-- 2. Store the Resend API key in Vault (encrypted at rest) --------------------
--    Re-runnable: drop any previous copy, then store fresh.
--    >>> REPLACE the placeholder with your real key (starts with re_...) <<<
delete from vault.secrets where name = 'resend_api_key';
select vault.create_secret('re_REPLACE_WITH_YOUR_RESEND_API_KEY', 'resend_api_key');

-- 3. Trigger function --------------------------------------------------------
create or replace function public.notify_new_comment()
returns trigger
language plpgsql
security definer
set search_path = public, vault, extensions, net
as $$
declare
  api_key text;
begin
  select decrypted_secret into api_key
    from vault.decrypted_secrets
   where name = 'resend_api_key';

  -- Fire-and-forget: a notification failure must NEVER block a comment insert.
  begin
    perform net.http_post(
      url     := 'https://api.resend.com/emails',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || api_key
      ),
      -- Plain text (not HTML): user content is passed as a JSON value, so it is
      -- automatically escaped and cannot inject markup into the email.
      body := jsonb_build_object(
        'from',    'ivaylodj.com comments <onboarding@resend.dev>',
        'to',      jsonb_build_array('ivaylo.djounov@gmail.com'),
        'subject', 'New comment on ' || NEW.post_slug,
        'text',
          NEW.author_name || ' commented on "' || NEW.post_slug || '":' ||
          E'\n\n' || NEW.body || E'\n\n' ||
          'View: https://ivaylodj.com/blog_post.html?post=' || NEW.post_slug
      )
    );
  exception when others then
    null;  -- swallow email errors; the comment is already saved
  end;

  return NEW;
end;
$$;

-- 4. Trigger -----------------------------------------------------------------
drop trigger if exists trg_notify_new_comment on public.comments;
create trigger trg_notify_new_comment
  after insert on public.comments
  for each row execute function public.notify_new_comment();

-- ============================================================================
-- To DISABLE notifications later:  drop trigger trg_notify_new_comment on public.comments;
-- To change recipient/sender:      edit the 'to' / 'from' lines and re-run step 3.
-- ============================================================================
