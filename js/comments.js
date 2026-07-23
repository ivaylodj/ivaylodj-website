/* ============================================================================
 * ivaylodj.com — Blog comments (Supabase + Google sign-in)
 * ----------------------------------------------------------------------------
 * Renders INTO the template's own comments section. blog_post.js builds the
 * wrapper + "Comments on This Post" heading + an empty <div id="comments">
 * (in its correct position, for every post template) and then calls
 * window.PMComments.mount(slug) once that markup is in the DOM.
 *
 * Follows the Aurel comment pattern: a threaded list (top-level comments with
 * nested replies, depth-1 / depth-2) where each top-level comment has a
 * "Reply" link, plus a compose box for new top-level comments. Replies are
 * stored via the schema's parent_id column.
 *
 * Security notes:
 *   - Talks to Supabase with the PUBLIC anon/publishable key; Row-Level
 *     Security is the real access control (see supabase/schema.sql).
 *   - ALL user-supplied strings are HTML-escaped before injection (esc()).
 *   - Moderation posture: INSTANT display (status defaults to 'approved').
 * ========================================================================== */
(function () {
  'use strict';

  var MAX_LEN = 4000;

  function mountComments(slugArg) {
    var mount = document.getElementById('comments');
    if (!mount) return; // Section not on the page (e.g. post failed to load)

    // Post slug: prefer the value blog_post.js passes; fall back to ?post=.
    var postSlug;
    if (slugArg) {
      postSlug = String(slugArg).replace(/\.md$/, '');
    } else {
      var params = new URLSearchParams(window.location.search);
      var postParam = params.get('post');
      if (!postParam) return;
      postSlug = postParam.replace(/\.md$/, '');
    }

    var cfg = window.COMMENTS_CONFIG || {};
    var configured =
      cfg.supabaseUrl &&
      cfg.supabaseAnonKey &&
      cfg.supabaseUrl.indexOf('REPLACE_WITH') === -1 &&
      cfg.supabaseAnonKey.indexOf('REPLACE_WITH') === -1;

    // ----- Scaffold (reuses the theme's .cherga_comment_* styling) ---------
    mount.innerHTML =
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
    var commentsById = {}; // id -> row, for edit (original body) & delete prompts

    // Did this page load come back from the Google OAuth redirect? Captured
    // synchronously now, before supabase-js / blog_post.js rewrite the URL, so
    // we can scroll the user back to the comment box instead of the page top.
    var cameFromOAuth =
      /[?&](code|access_token)=/.test(window.location.search) ||
      /(access_token|code)=/.test(window.location.hash);
    var didAutoScroll = false;

    function scrollBackIfReturning() {
      if (!cameFromOAuth || didAutoScroll) return;
      didAutoScroll = true;
      // Let layout settle (images/related posts) before scrolling.
      setTimeout(function () {
        var target = document.getElementById('comments-respond') || mount;
        if (target && target.scrollIntoView) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }

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

    // depth: 1 = top-level, 2 = reply. Only top-level comments get a Reply link.
    function commentItemHtml(c, depth) {
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
      var body = esc(c.body).replace(/\n/g, '<br>');

      var reply = depth === 1
        ? '<a class="cmt_action cmt_reply_link" href="javascript:void(0)" data-id="' +
            esc(c.id) + '">Reply</a>'
        : '';
      var edit = mine
        ? '<a class="cmt_action cmt_edit_link" href="javascript:void(0)" data-id="' +
            esc(c.id) + '">Edit</a>'
        : '';
      var del = mine
        ? '<a class="cmt_action cmt_delete" href="javascript:void(0)" data-id="' +
            esc(c.id) + '">Delete</a>'
        : '';
      var actions = (reply || edit || del)
        ? '<div class="cmt_actions">' + reply + edit + del + '</div>' : '';
      var edited = c.edited_at
        ? ' <span class="cmt_edited">(edited)</span>' : '';

      return '<div class="cmt_item depth-' + depth + '">' +
        '<div class="cmt_ava_cont">' + avatarHtml(info) + '</div>' +
        '<div class="cherga_comment_body">' +
          '<div class="cmt_head">' +
            '<span class="cherga_comment_author cmt_author">' + esc(c.author_name) + '</span>' +
            badge + pending +
          '</div>' +
          '<div class="cherga_comment_meta cmt_meta"><div>' + esc(relTime(c.created_at)) + edited + '</div></div>' +
          '<div class="cherga_comment_text cmt_text"><p>' + body + '</p></div>' +
          actions +
        '</div>' +
      '</div>';
    }

    function threadHtml(top, replies) {
      var html = '<div class="cmt_thread">';
      html += commentItemHtml(top, 1);
      for (var i = 0; i < replies.length; i++) {
        html += commentItemHtml(replies[i], 2);
      }
      // Inline reply form gets injected here when "Reply" is clicked.
      html += '<div class="cmt_reply_slot" data-parent="' + esc(top.id) + '"></div>';
      html += '</div>';
      return html;
    }

    function renderList(rows) {
      if (!rows || !rows.length) {
        listEl.innerHTML =
          '<p class="cmt_state cmt_empty">No comments yet. Be the first to share your thoughts.</p>';
        return;
      }
      // Split into top-level comments (newest-first from the query) and replies
      // grouped by parent (shown oldest-first, i.e. chronological under parent).
      var tops = [];
      var repliesByParent = {};
      commentsById = {};
      rows.forEach(function (r) {
        commentsById[r.id] = r;
        if (r.parent_id) {
          (repliesByParent[r.parent_id] = repliesByParent[r.parent_id] || []).push(r);
        } else {
          tops.push(r);
        }
      });
      Object.keys(repliesByParent).forEach(function (k) {
        repliesByParent[k].sort(function (a, b) {
          return new Date(a.created_at) - new Date(b.created_at);
        });
      });

      listEl.innerHTML = tops.map(function (t) {
        return threadHtml(t, repliesByParent[t.id] || []);
      }).join('');

      each('.cmt_delete', function (el) { el.addEventListener('click', onDelete); });
      each('.cmt_reply_link', function (el) { el.addEventListener('click', onReplyClick); });
      each('.cmt_edit_link', function (el) { el.addEventListener('click', onEditClick); });
    }

    function each(sel, fn) {
      Array.prototype.forEach.call(listEl.querySelectorAll(sel), fn);
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

    // ----- Shared insert ---------------------------------------------------
    function postComment(text, parentId) {
      var info = userInfo(currentUser);
      var row = {
        post_slug: postSlug,
        user_id: info.id,
        author_name: info.name,
        author_avatar_url: info.avatar || null,
        author_provider: info.provider,
        body: text
      };
      if (parentId) row.parent_id = parentId;
      return db.from('comments').insert(row).select().then(function (res) {
        if (res.error) throw res.error;
        return res.data && res.data[0];
      });
    }

    // ----- Reply (threaded) ------------------------------------------------
    function onReplyClick(e) {
      var id = e.currentTarget.getAttribute('data-id');
      if (!id) return;
      if (!currentUser) { signIn(); return; } // must sign in to reply

      var slot = listEl.querySelector('.cmt_reply_slot[data-parent="' + id + '"]');
      if (!slot) return;
      if (slot.firstChild) { slot.innerHTML = ''; return; } // toggle off

      slot.innerHTML =
        '<div class="cmt_reply_form">' +
          '<textarea class="cmt_reply_body" maxlength="' + MAX_LEN + '" ' +
            'placeholder="Write a reply…"></textarea>' +
          '<div class="cmt_form_foot">' +
            '<span class="cmt_reply_count cmt_count">0 / ' + MAX_LEN + '</span>' +
            '<span class="cmt_reply_btns">' +
              '<a class="cmt_action cmt_reply_cancel" href="javascript:void(0)">Cancel</a>' +
              '<button type="button" class="cmt_btn cmt_reply_submit">Post reply</button>' +
            '</span>' +
          '</div>' +
          '<p class="cmt_reply_error cmt_error" style="display:none;"></p>' +
        '</div>';

      var ta = slot.querySelector('.cmt_reply_body');
      var count = slot.querySelector('.cmt_reply_count');
      var err = slot.querySelector('.cmt_reply_error');
      var btn = slot.querySelector('.cmt_reply_submit');
      ta.focus();
      ta.addEventListener('input', function () {
        count.textContent = ta.value.length + ' / ' + MAX_LEN;
      });
      slot.querySelector('.cmt_reply_cancel').addEventListener('click', function () {
        slot.innerHTML = '';
      });
      btn.addEventListener('click', function () {
        var text = (ta.value || '').trim();
        if (!text) { err.textContent = 'Please write something before posting.'; err.style.display = 'block'; return; }
        err.style.display = 'none';
        btn.disabled = true;
        btn.textContent = 'Posting…';
        postComment(text, id).then(function () {
          return loadComments();
        }).catch(function (e2) {
          err.textContent = 'Sorry, your reply couldn’t be posted. Please try again.';
          err.style.display = 'block';
          btn.disabled = false;
          btn.textContent = 'Post reply';
          if (window.console) console.error('[comments] reply failed', e2);
        });
      });
    }

    // ----- Edit own comment ------------------------------------------------
    function onEditClick(e) {
      var id = e.currentTarget.getAttribute('data-id');
      var c = commentsById[id];
      if (!c) return;
      var item = e.currentTarget;
      while (item && !(item.className && item.className.indexOf('cmt_item') !== -1)) {
        item = item.parentNode;
      }
      if (!item) return;
      var textEl = item.querySelector('.cmt_text');
      var actionsEl = item.querySelector('.cmt_actions');
      if (item.querySelector('.cmt_edit_form')) return; // already editing

      textEl.style.display = 'none';
      if (actionsEl) actionsEl.style.display = 'none';

      var form = document.createElement('div');
      form.className = 'cmt_edit_form';
      form.innerHTML =
        '<textarea class="cmt_edit_body" maxlength="' + MAX_LEN + '"></textarea>' +
        '<div class="cmt_form_foot">' +
          '<span class="cmt_edit_count cmt_count"></span>' +
          '<span class="cmt_reply_btns">' +
            '<a class="cmt_action cmt_edit_cancel" href="javascript:void(0)">Cancel</a>' +
            '<button type="button" class="cmt_btn cmt_edit_save">Save</button>' +
          '</span>' +
        '</div>' +
        '<p class="cmt_edit_error cmt_error" style="display:none;"></p>';
      textEl.parentNode.insertBefore(form, textEl.nextSibling);

      var ta = form.querySelector('.cmt_edit_body');
      var count = form.querySelector('.cmt_edit_count');
      var err = form.querySelector('.cmt_edit_error');
      var save = form.querySelector('.cmt_edit_save');
      ta.value = c.body;                    // set via .value (no escaping needed)
      count.textContent = ta.value.length + ' / ' + MAX_LEN;
      ta.focus();
      ta.addEventListener('input', function () {
        count.textContent = ta.value.length + ' / ' + MAX_LEN;
      });

      function restore() {
        if (form.parentNode) form.parentNode.removeChild(form);
        textEl.style.display = '';
        if (actionsEl) actionsEl.style.display = '';
      }
      form.querySelector('.cmt_edit_cancel').addEventListener('click', restore);

      save.addEventListener('click', function () {
        var text = (ta.value || '').trim();
        if (!text) { err.textContent = 'Comment can’t be empty.'; err.style.display = 'block'; return; }
        if (text === c.body) { restore(); return; } // no change
        err.style.display = 'none';
        save.disabled = true;
        save.textContent = 'Saving…';
        db.from('comments').update({
          body: text,
          edited_at: new Date().toISOString()
        }).eq('id', id).select().then(function (res) {
          if (res.error) throw res.error;
          return loadComments();
        }).catch(function (e2) {
          err.textContent = 'Sorry, the edit couldn’t be saved. Please try again.';
          err.style.display = 'block';
          save.disabled = false;
          save.textContent = 'Save';
          if (window.console) console.error('[comments] edit failed', e2);
        });
      });
    }

    // ----- Compose / respond area (new top-level comment) ------------------
    var REPLY_TITLE =
      '<h5 class="cherga_reply_comment_title cmt_reply_title">Let us know your thoughts about this topic</h5>';

    function renderRespond() {
      if (!currentUser) {
        respondEl.innerHTML =
          '<div class="cmt_signin_row">' +
            REPLY_TITLE +
            '<button type="button" id="cmt-google" class="cmt_btn cmt_google_btn">' +
              '<i class="fa fa-google" aria-hidden="true"></i> Continue with Google' +
            '</button>' +
          '</div>';
        document.getElementById('cmt-google').addEventListener('click', signIn);
        return;
      }

      var info = userInfo(currentUser);
      respondEl.innerHTML =
        REPLY_TITLE +
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
            '<button type="button" id="cmt-submit" class="cmt_btn cmt_submit">Post comment</button>' +
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
      e.style.display = msg ? 'block' : 'none';
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
        loadComments(); // refresh so Reply/Delete affordances update
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
      btn.disabled = true;
      btn.textContent = 'Posting…';

      postComment(text, null).then(function (inserted) {
        body.value = '';
        var cnt = document.getElementById('cmt-count');
        if (cnt) cnt.textContent = '0 / ' + MAX_LEN;
        showError('');
        if (inserted && inserted.status === 'pending') {
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
      // Deleting a top-level comment cascades to its replies (schema ON DELETE
      // CASCADE) — including replies by other people. Warn accordingly.
      var thread = e.currentTarget;
      while (thread && !(thread.className && thread.className.indexOf('cmt_thread') !== -1)) {
        thread = thread.parentNode;
      }
      var isTop = !(commentsById[id] && commentsById[id].parent_id);
      var replyCount = (isTop && thread)
        ? thread.querySelectorAll('.cmt_item.depth-2').length : 0;
      var msg = replyCount
        ? 'Delete your comment and its ' + replyCount + ' repl' +
            (replyCount > 1 ? 'ies' : 'y') + '? This cannot be undone.'
        : 'Delete your comment? This cannot be undone.';
      if (!window.confirm(msg)) return;
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
      if (currentUser) scrollBackIfReturning();
    });

    db.auth.onAuthStateChange(function (_event, session) {
      currentUser = (session && session.user) || null;
      renderRespond();
      loadComments(); // Reply/Delete affordances depend on auth state
      if (currentUser) scrollBackIfReturning();
    });

    loadComments();
  }

  // Exposed so blog_post.js can mount comments after it injects the section.
  window.PMComments = { mount: mountComments };
})();
