(function() {

  // ---------------------------------------------------------------
  // Markdown parser that preserves inline HTML tags (e.g.
  // <span class="cherga_drop_cap">, <span class="cherga_color">
  // <span class="cherga_highlighter_dark">) exactly as-is so the
  // theme.css custom classes render correctly against Decap CMS
  // markdown content. Supports: headers (h2-h4), bold, italic,
  // blockquotes, lists (<ul>/<ol>), inline links/images, <u>,
  // and regular paragraphs.
  // ---------------------------------------------------------------

  function parseMd(md) {
    var lines = md.split('\n');
    var result = [];
    var inList = false;
    var listTag = 'ul';

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      // Blank line: close any open list and continue
      if (line.trim() === '') {
        if (inList) { result.push('</' + listTag + '>'); inList = false; }
        continue;
      }

      // HTML tags (self-closing or wrapping) -- pass through verbatim so
      // the parser does not destroy .cherga_*, .drop_cap, etc.
      if (/^\s*<[^>]+>\s*$/.test(line)) {
        result.push(line);
        continue;
      }

      // Code blocks -- skip for now
      if (line.indexOf('\u0060\u0060\u0060') === 0) continue;

      // --- Headings: ## to ####  -----------------------------------
      var mH = line.match(/^(#{2,4})\s+(.+)$/);
      if (mH) {
        var lvl = Math.min(mH[1].length + 1, 4);
        result.push('<h' + lvl + '>' + formatInline(mH[2]) + '</h' + lvl + '>');
        continue;
      }

      // --- Horizontal rule ------------------------------------------
      if (/^---+$/.test(line.trim())) {
        result.push('<hr>');
        continue;
      }

      // --- Blockquotes: > text or >> deeper -------------------------
      var mBq = line.match(/^\s*> ?(.+)$/);
      if (mBq) {
        if (!inList || listTag !== 'bq') {
          result.push('<blockquote><p>' + formatInline(mBq[1]) + '</p>');
          inList = true;
          listTag = 'bq';
        } else {
          // Append inside the same <blockquote>
          result.push(formatInline(mBq[1]));
        }
        continue;
      }

      // Close blockquote tag if we are no longer in it
      if (listTag === 'bq') {
        result.push('</blockquote>');
        listTag = 'ul';   // reset, will reopen as <ul>/<ol> if needed
      }

      // --- Unordered list items: - or * ----------------------------
      var mU = line.match(/^\s*[-*]\s+(.+)$/);
      if (mU) {
        if (!inList || listTag !== 'ul') {
          result.push('<ul>');
          inList = true;
          listTag = 'ul';
        }
        result.push('<li>' + formatInline(mU[1]) + '</li>');
        continue;
      }

      // --- Ordered list items: 1. ----------------------------------
      var mO = line.match(/^\s*\d+\.\s+(.+)$/);
      if (mO) {
        if (!inList || listTag !== 'ol') {
          result.push('<ol>');
          inList = true;
          listTag = 'ol';
        }
        result.push('<li>' + formatInline(mO[1]) + '</li>');
        continue;
      }

      // Close ol/ul when we hit non-list content
      if (inList && listTag !== 'bq') {
        result.push('</' + listTag + '>');
        inList = false;
        listTag = 'ul';
      }

      // --- Regular paragraph text -----------------------------------
      result.push('<p>' + formatInline(line) + '</p>');
    }

    // Close any remaining blocks at EOF
    if (listTag === 'bq') { result.push('</blockquote>'); }
    else if (inList && listTag !== 'bq') { result.push('</' + listTag + '>'); }   

    return result.join('\n');
  }

  // Apply markdown inline syntax while preserving embedded HTML tags.
  // E.g. **bold**, *italic*, [link](url), ![img](src)
  function formatInline(text) {
    var parts = text.split(/(<[^>]+>)/g);

    for (var i = 0; i < parts.length; i++) {
      if (!parts[i] || parts[i].charAt(0) === '<') continue;

      var seg = parts[i];

      // Bold: **text**
      seg = seg.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

      // Italic: *text*
      seg = seg.replace(/\*(.+?)\*/g, '<em>$1</em>');

      // Images: ![alt](url)
      seg = seg.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
        '<img src="$2" alt="$1">');

      // Inline links: [text](url)
      seg = seg.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(m, lt, u) {
        return (lt.indexOf('http') === 0 || lt.indexOf('/') === 0) ? m :
               '<a href="' + u + '">' + lt + '</a>';
      });

      parts[i] = seg;
    }

    return parts.join('');
  }

  // ---------------------------------------------------------------
  // Load and render the single blog post
  // ---------------------------------------------------------------
  function loadPost() {
    var params = new URLSearchParams(window.location.search);
    var postFile = params.get('post');

    if (!postFile) {
      document.getElementById('blog-post-content').innerHTML = 
        'No post specified. <a href="blog.html">&larr; Back to Blog</a>';
      return;
    }

    var postIdx = new XMLHttpRequest();
    postIdx.open('GET', '_posts/index.json', true);
    postIdx.onload = function() {
      if (postIdx.status !== 200) return;

      var allPosts = JSON.parse(postIdx.responseText);
      var post = null;
      var postFilename = postFile.match(/\.md$/) ? postFile : postFile + '.md';
      for (var i = 0; i < allPosts.length; i++) {
        if (allPosts[i].filename === postFilename) { post = allPosts[i]; break; }
      }

      if (!post) {
        document.getElementById('blog-post-content').innerHTML = 
          'Post not found. <a href="blog.html">&larr; Back to Blog</a>';
        return;
      }

      var fullPostPath = postFile.match(/\.md$/) ? postFile : postFile + '.md';
      var contentXhr = new XMLHttpRequest();
      contentXhr.open('GET', '_posts/' + fullPostPath, true);
      contentXhr.onload = function() {
        if (contentXhr.status !== 200) {
          document.getElementById('blog-post-content').innerHTML = 
            'Failed to load post. <a href="blog.html">&larr; Back to Blog</a>';
          return;
        }

        var mdContent = contentXhr.responseText;

        // Extract frontmatter (YAML between --- markers)
        var fmRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/m;
        var fmMatch = mdContent.match(fmRegex);

        var title   = post.title || '';
        var template = post.template || 'blog_standard';
        var dateStr = new Date(post.date).toLocaleDateString('en-GB', {
          year: 'numeric', month: 'long', day: 'numeric'
        });

        // ---- Build the full HTML output (template-aware) ----
        var html = '';

        // Cover image (post-format block - varies by template)
        if (post.cover_image) {
          if (template === 'blog_image') {
            // blog_image template: owl carousel
            html += '<div class="cherga_post_formats cherga_pf_image cherga_pf_boxed">';
            html +=   '<div class="cherga_owlCarousel owl-carousel owl-theme">';
            html +=     '<div class="item">';
            html +=       '<img src="' + post.cover_image + '" alt="" />';
            html +=     '</div>';
            html +=   '</div>';
            html += '</div>';
          } else {
            // blog_standard template: simple boxed image (default)
            html += '<div class="cherga_post_formats cherga_pf_standard cherga_pf_boxed">';
            html +=   '<div class="cherga_pf_standard_cont cherga_dp cherga_no_select">';
            html +=     '<img src="' + post.cover_image + '" alt="" />';
            html +=   '</div>';
            html += '</div>';
          }
        }

        // Post meta (date + categories)
        html += '<div class="cherga_post_meta">';
        html +=   '<div class="cherga_post_meta_item">' + dateStr + '</div>';
        if (post.categories && post.categories.length) {
          var cats = [];
          for (var c = 0; c < post.categories.length; c++) {
            cats.push('<a rel="category tag" href="javascript:void(0)">' + post.categories[c] + '</a>');
          }
          html += '<div class="cherga_post_meta_item">in ' + cats.join(', ') + '</div>';
        }
        html += '</div>';

        // Post title
        html += '<h1 class="cherga_post_title">' + title + '</h1>';

        // Body content (preserves inline HTML from markdown)
        var bodyMd = fmMatch ? fmMatch[2] : mdContent;
        html += '<div class="cherga_tiny cherga_blog_post_content">';
        html += parseMd(bodyMd);
        html += '</div>';

        // Tags
        if (post.tags && post.tags.length) {
          html += '<div class="cherga_post_tags">Tagged in';
          for (var t = 0; t < post.tags.length; t++) {
            html += ' <a href="javascript:void(0)" rel="tag" onclick="window.parent.setActiveTag(\'' + post.tags[t] + '\')">' + post.tags[t] + '</a>';
            if (t < post.tags.length - 1) html += ',';
          }
          html += '</div>';
        }

        // Share buttons
        var encUrl  = encodeURIComponent(window.location.href);
        var encTitle = encodeURIComponent(title);
        html += '<div class="cherga_sharing">';
        html +=   '<span class="cherga_sharing_label">Share This Post</span> ';
        html +=   '<a href="https://www.facebook.com/sharer/sharer.php?u=' + encUrl + '&t=' + encTitle + '" target="_blank" title="Share on Facebook" class="cherga_share_facebook">Facebook</a>';
        html +=   ' <a href="https://twitter.com/intent/tweet?url=' + encUrl + '&text=' + encTitle + '" target="_blank" title="Share on Twitter/X" class="cherga_share_twitter">Twitter/X</a>';
        html += '</div>';
        html += '<div class="clear"></div>';

        // Single divider (matches old template)
        html += '<div class="cherga_single_divider"></div>';

        // Post navigation with circular looping (AUREL style)
        var currentPostIndex = -1;
        for (var pi = 0; pi < allPosts.length; pi++) {
          if (allPosts[pi].filename === postFilename) { currentPostIndex = pi; break; }
        }

        // Circular navigation: wrap around using modulo
        var prevIndex = (currentPostIndex - 1 + allPosts.length) % allPosts.length;
        var nextIndex = (currentPostIndex + 1) % allPosts.length;
        var prevPost = allPosts[prevIndex];
        var nextPost = allPosts[nextIndex];

        html += '<div class="cherga_posts_navigation row">';

        // Previous post (left side)
        if (prevPost) {
          var prevFilename = prevPost.filename.replace(/\.md$/, '');
          html +=   '<div class="cherga_prev_post_wrapper col">';
          html +=     '<span class="cherga_prev_post_button cherga_post_nav_button">';
          html +=       '<a href="blog_post.html?post=' + prevFilename + '" rel="prev">';
          html +=         '<i class="fa fa-arrow-left"></i> PREV POST';
          html +=       '</a>';
          html +=     '</span>';
          html +=     '<a class="cherga_prev_post_title" href="blog_post.html?post=' + prevFilename + '">' + prevPost.title + '</a>';
          html +=   '</div>';
        }

        // Next post (right side)
        if (nextPost) {
          var nextFilename = nextPost.filename.replace(/\.md$/, '');
          html +=   '<div class="cherga_next_post_wrapper col push-right">';
          html +=     '<span class="cherga_next_post_button cherga_post_nav_button">';
          html +=       '<a href="blog_post.html?post=' + nextFilename + '" rel="next">';
          html +=         'NEXT POST <i class="fa fa-arrow-right"></i>';
          html +=       '</a>';
          html +=     '</span>';
          html +=     '<a class="cherga_next_post_title" href="blog_post.html?post=' + nextFilename + '">' + nextPost.title + '</a>';
          html +=   '</div>';
        }

        html += '</div>';

        // Comments section (matches old template exactly)
        html += '<div class="cherga_comments_cont">';
        html +=   '<div class="cherga_comments_wrapper">';
        html +=     '<h4 class="cherga_comments_title">Comments on This Post</h4>';
        html +=     '<div class="comment-respond" id="respond">';
        html +=       '<h5 class="cherga_reply_comment_title">Let us know your thoughts about this topic</h5>';
        html +=       '<form class="comment-form" id="commentform" method="post">';
        html +=         '<div class="row"><div class="comment-form-comment col col-12">';
        html +=           '<textarea name="comment" cols="45" rows="5" placeholder="Your comments goes here." class="form-field" form="commentform"></textarea>';
        html +=         '</div></div>';
        html +=         '<p class="form-submit"><input name="submit" type="submit" class="submit" value="Send Comment" form="commentform"></p>';
        html +=       '</form>';
        html +=     '</div>';
        html +=   '</div>';
        html += '</div>';

        document.getElementById('blog-post-content').innerHTML = html;

        // ---- Update page metadata dynamically ----
        document.title = title + ' | Ivaylo Djounov Photography Blog';

        var canonicalMeta  = document.querySelector("link[rel='canonical']");
        if (canonicalMeta) canonicalMeta.href = 'https://ivaylodj.com/blog_post.html?post=' + postFile;

        var descMeta       = document.querySelector('meta[name="description"]');
        if (descMeta)      descMeta.content = post.excerpt || '';

        var ogTitleMeta    = document.querySelector('meta[property="og:title"]');
        if (ogTitleMeta)   ogTitleMeta.content = title;
        var ogDescMeta     = document.querySelector('meta[property="og:description"]');
        if (ogDescMeta)    ogDescMeta.content = post.excerpt || '';

        window.history.replaceState({}, '', 'blog_post.html?post=' + postFile);

        // Sidebar: populate category list
        var catListEl = document.getElementById('post-category-list');
        if (catListEl && post.categories) {
          for (var ci = 0; ci < post.categories.length; ci++) {
            var li = document.createElement('li');
            li.innerHTML = '<a href="javascript:void(0)" data-cat="' + post.categories[ci] + '">' + post.categories[ci] + '</a>';
            catListEl.appendChild(li);
          }
        }
      };
      contentXhr.send();
    };
    postIdx.send();
  }

  document.addEventListener('DOMContentLoaded', loadPost);
})();