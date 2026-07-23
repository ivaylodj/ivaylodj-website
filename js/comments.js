/* ============================================================================
 * ivaylodj.com — Blog comments (Supabase + Google sign-in)
 * ----------------------------------------------------------------------------
 * Fully self-contained: reads the post slug from the ?post= query param itself
 * (same source as blog_post.js) so it does NOT depend on, and never touches,
 * blog_post.js's #blog-post-content render. Mounts into the sibling #comments
 * container in blog_post.html.
 *
 * Security notes:
 *   - Talks to Supabase with the PUBLIC anon key; Row-Level Security is the
 *     real access control (see supabase/schema.sql).
 *   - ALL user-supplied strings are HTML-escaped before injection (esc()).
 *   - Moderation posture: INSTANT display (status defaults to 'approved' in
 *     the DB). Switching to pre-moderation is a one-line DB change; this file
 *     already handles a 'pending' insert result gracefully.
 * ========================================================================== */
(function () {
  'use strict';

  var MOUNT_ID = 'comments';
  var MAX_LEN = 4000;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var mount = document.getElementById(MOUNT_ID);
    if (!mount) return; // Only present on blog_post.html

    // Only show comments when we're actually viewing a specific post.
    var params = new URLSearchParams(window.location.search);
    var postParam = params.get('post');
    if (!postParam) return;
    var postSlug = postParam.replace(/\.md$/, '');

    var cfg = window.COMMENTS_CONFIG || {};
    var configured =
      cfg.supabaseUrl &&
      cfg.supabaseAnonKey &&
      cfg.supabaseUrl.indexOf('REPLACE_WITH') === -1 &&
      cfg.supabaseAnonKey.indexOf('REPLACE_WITH') === -1;

    // ----- Scaffold (reuses the theme's .cherga_comment_* styling) ---------
    mount.className = 'cherga_comments_cont';
    mount.innerHTML =
      '<h3 class="cherga_comments_title">Comments</h3>' +
      '<div id="comments-list" class="cherga_comment_list cmt_list">' +
        '<p class="cmt_state">Loading comments…</p>' +
      '</div>' +
      '<div id="comments-respond" class="cmt_respond"></div>';

    var listEl = document.getElementById('comments-list');
    var respondEl = document.getElementById('comments-respond');

    if (!configured) {
      listEl.innerHTML =
        '<p class="cmt_state">Comments are being set up and will be available shortly.</p>';
      respondEl.innerHTML = '';
      return;
    }

    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      listEl.innerHTML =
        '<p class="cmt_state">Comments couldn’t load (the comment service is unavailable). Please try again later.</p>';
      return;
    }

    var db = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    var currentUser = null;

    // ----- Helpers ---------------------------------------------------------
    function esc(s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function relTime(iso) {
      var then = new Date(iso).getTime();
      if (isNaN(then)) return '';
      var s = Math.round((Date.now() - then) / 1000);
      if (s < 0) s = 0;
      var units = [
        ['year', 31536000], ['month', 2592000], ['week', 604800],
        ['day', 86400], ['hour', 3600], ['minute', 60]
      ];
      for (var i = 0; i < units.length; i++) {
        var v = Math.floor(s / units[i][1]);
        if (v >= 1) return v + ' ' + units[i][0] + (v > 1 ? 's' : '') + ' ago';
      }
      return 'just now';
    }

    function userInfo(user) {
      var m = (user && user.user_metadata) || {};
      var provider =
        (user && user.app_metadata && user.app_metadata.provider) || 'google';
      return {
        id: user ? user.id : null,
        name: m.full_name || m.name || m.user_name || 'Anonymous',
        avatar: m.avatar_url || m.picture || '',
        provider: provider
      };
    }

    function providerLabel(p) {
      if (!p) return '';
      return p.charAt(0).toUpperCase() + p.slice(1);
    }

    function initials(name) {
      var parts = String(name || '?').trim().split(/\s+/);
      var a = parts[0] ? parts[0][0] : '?';
      var b = parts.length > 1 ? parts[parts.length - 1][0] : '';
      return (a + b).toUpperCase();
    }

    // ----- Rendering -------------------------------------------------------
    function avatarHtml(info) {
      if (info.avatar) {
        return '<img class="cmt_avatar" src="' + esc(info.avatar) +
          '" alt="' + esc(info.name) + '" referrerpolicy="no-referrer" ' +
          'onerror="this.style.display=\'none\';this.nextSibling.style.display=\'flex\';">' +
          '<span class="cmt_avatar cmt_avatar_fallback" style="display:none;">' +
          esc(initials(info.name)) + '</span>';
      }
      return '<span class="cmt_avatar cmt_avatar_fallback">' +
        esc(initials(info.name)) + '</span>';
    }

    function commentHtml(c) {
      var info = {
        name: c.author_name,
        avatar: c.author_avatar_url,
        provider: c.author_provider
      };
      var mine = currentUser && currentUser.id === c.user_id;
      var badge = c.author_provider
        ? '<span class="cmt_badge cmt_badge_' + esc(c.author_provider) + '">' +
            esc(providerLabel(c.author_provider)) + '</span>'
        : '';
      var pending = c.status === 'pending'
        ? '<span class="cmt_pending">awaiting approval</span>' : '';
      var del = mine
        ? '<button type="button" class="cmt_delete" data-id="' + esc(c.id) +
            '">Delete</button>'
        : '';
      // Body: escaped, then newlines to <br> (no other HTML allowed).
      var body = esc(c.body).replace(/\n/g, '<br>');
      return '<div class="cmt_item depth-1">' +
        '<div class="cmt_ava_cont">' + avatarHtml(info) + '</div>' +
        '<div class="cherga_comment_body">' +
          '<div class="cmt_head">' +
            '<span class="cherga_comment_author cmt_author">' + esc(c.author_name) + '</span>' +
            badge + pending +
          '</div>' +
          '<div class="cherga_comment_meta cmt_meta"><div>' + esc(relTime(c.created_at)) + '</div></div>' +
          '<div class="cherga_comment_text cmt_text"><p>' + body + '</p></div>' +
          del +
        '</div>' +
      '</div>';
    }

    function renderList(rows) {
      if (!rows || !rows.length) {
        listEl.innerHTML =
          '<p class="cmt_state cmt_empty">No comments yet. Be the first to share your thoughts.</p>';
        return;
      }
      listEl.innerHTML = rows.map(commentHtml).join('');
      Array.prototype.forEach.call(
        listEl.querySelectorAll('.cmt_delete'),
        function (btn) { btn.addEventListener('click', onDelete); }
      );
    }

    function loadComments() {
      return db
        .from('comments')
        .select('*')
        .eq('post_slug', postSlug)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .then(function (res) {
          if (res.error) throw res.error;
          renderList(res.data);
        })
        .catch(function (err) {
          listEl.innerHTML =
            '<p class="cmt_state">Couldn’t load comments right now. Please refresh to try again.</p>';
          if (window.console) console.error('[comments] load failed', err);
        });
    }

    // ----- Compose / respond area -----------------------------------------
    function renderRespond() {
      if (!currentUser) {
        respondEl.innerHTML =
          '<div class="cmt_signin">' +
            '<p class="cmt_signin_lead">Join the conversation — sign in to leave a comment.</p>' +
            '<button type="button" id="cmt-google" class="cmt_google_btn">' +
              '<span class="cmt_g_icon" aria-hidden="true">G</span>' +
              'Continue with Google' +
            '</button>' +
          '</div>';
        document.getElementById('cmt-google').addEventListener('click', signIn);
        return;
      }

      var info = userInfo(currentUser);
      respondEl.innerHTML =
        '<div id="respond" class="cmt_form">' +
          '<div class="cmt_form_id">' +
            '<div class="cmt_ava_cont cmt_ava_sm">' + avatarHtml(info) + '</div>' +
            '<div class="cmt_form_id_text">' +
              '<span class="cmt_author">' + esc(info.name) + '</span>' +
              '<button type="button" id="cmt-signout" class="cmt_signout">Sign out</button>' +
            '</div>' +
          '</div>' +
          '<textarea id="cmt-body" maxlength="' + MAX_LEN + '" ' +
            'placeholder="Write a comment…"></textarea>' +
          '<div class="cmt_form_foot">' +
            '<span id="cmt-count" class="cmt_count">0 / ' + MAX_LEN + '</span>' +
            '<button type="button" id="cmt-submit" class="cmt_submit">Post comment</button>' +
          '</div>' +
          '<p id="cmt-error" class="cmt_error" style="display:none;"></p>' +
          '<p class="cmt_consent">By posting, your name and avatar from your ' +
            esc(providerLabel(info.provider)) + ' account are shown publicly with your ' +
            'comment. You can delete your own comments at any time.</p>' +
        '</div>';

      var body = document.getElementById('cmt-body');
      var count = document.getElementById('cmt-count');
      body.addEventListener('input', function () {
        count.textContent = body.value.length + ' / ' + MAX_LEN;
      });
      document.getElementById('cmt-signout').addEventListener('click', signOut);
      document.getElementById('cmt-submit').addEventListener('click', submit);
    }

    function showError(msg) {
      var e = document.getElementById('cmt-error');
      if (!e) return;
      e.textContent = msg;
      e.style.display = 'block';
    }

    // ----- Actions ---------------------------------------------------------
    function signIn() {
      db.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: cfg.redirectTo || window.location.href }
      });
    }

    function signOut() {
      db.auth.signOut().then(function () {
        currentUser = null;
        renderRespond();
      });
    }

    function submit() {
      var body = document.getElementById('cmt-body');
      var btn = document.getElementById('cmt-submit');
      var text = (body.value || '').trim();
      if (!text) { showError('Please write something before posting.'); return; }
      if (text.length > MAX_LEN) {
        showError('Comment is too long (max ' + MAX_LEN + ' characters).');
        return;
      }
      var info = userInfo(currentUser);
      btn.disabled = true;
      btn.textContent = 'Posting…';

      db.from('comments').insert({
        post_slug: postSlug,
        user_id: info.id,
        author_name: info.name,
        author_avatar_url: info.avatar || null,
        author_provider: info.provider,
        body: text
      }).select().then(function (res) {
        if (res.error) throw res.error;
        body.value = '';
        var cnt = document.getElementById('cmt-count');
        if (cnt) cnt.textContent = '0 / ' + MAX_LEN;
        var inserted = res.data && res.data[0];
        if (inserted && inserted.status === 'pending') {
          showError(''); // clear
          document.getElementById('cmt-error').style.display = 'none';
          alert('Thanks! Your comment was submitted and will appear once approved.');
        }
        return loadComments();
      }).catch(function (err) {
        showError('Sorry, your comment couldn’t be posted. Please try again.');
        if (window.console) console.error('[comments] insert failed', err);
      }).then(function () {
        btn.disabled = false;
        btn.textContent = 'Post comment';
      });
    }

    function onDelete(e) {
      var id = e.currentTarget.getAttribute('data-id');
      if (!id) return;
      if (!window.confirm('Delete your comment? This cannot be undone.')) return;
      db.from('comments').delete().eq('id', id).then(function (res) {
        if (res.error) throw res.error;
        return loadComments();
      }).catch(function (err) {
        alert('Couldn’t delete the comment. Please try again.');
        if (window.console) console.error('[comments] delete failed', err);
      });
    }

    // ----- Boot ------------------------------------------------------------
    db.auth.getSession().then(function (res) {
      currentUser = (res.data && res.data.session && res.data.session.user) || null;
      renderRespond();
    });

    db.auth.onAuthStateChange(function (_event, session) {
      currentUser = (session && session.user) || null;
      renderRespond();
    });

    loadComments();
  });
})();
