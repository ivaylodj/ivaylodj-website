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

        // "You may also like" - show 2 other posts
        html += '<div class="cherga_single_divider"></div>';
        html += '<h4 class="cherga_featured_posts_heading">You may also like</h4>';
        html += '<div class="cherga_featured_posts cherga_items_2 row">';

        var relatedCount = 0;
        for (var ri = 0; ri < allPosts.length && relatedCount < 2; ri++) {
          if (allPosts[ri].filename === postFilename) continue; // Skip current post

          var relPost = allPosts[ri];
          var relFilename = relPost.filename.replace(/\.md$/, '');
          var relDateStr = new Date(relPost.date).toLocaleDateString('en-GB', {
            year: 'numeric', month: 'long', day: 'numeric'
          });

          html += '<div class="cherga_posts_item col col6">';
          html +=   '<div class="cherga_fimage_cont">';
          if (relPost.cover_image) {
            html +=     '<a href="blog_post.html?post=' + relFilename + '" class="cherga_dp cherga_no_select">';
            html +=       '<img src="' + relPost.cover_image + '" alt="' + relPost.title + '"/>';
            html +=     '</a>';
          }
          html +=   '</div>';
          html +=   '<div class="cherga_post_meta">';
          html +=     '<div class="cherga_post_meta_item">' + relDateStr + '</div>';
          if (relPost.categories && relPost.categories.length) {
            var relCats = [];
            for (var rc = 0; rc < relPost.categories.length; rc++) {
              relCats.push('<a rel="category tag" href="javascript:void(0)">' + relPost.categories[rc] + '</a>');
            }
            html += '<div class="cherga_post_meta_item">in ' + relCats.join(', ') + '</div>';
          }
          html +=     '<h4 class="cherga_post_title">';
          html +=       '<a href="blog_post.html?post=' + relFilename + '">' + relPost.title + '</a>';
          html +=     '</h4>';
          html +=     '<div class="cherga_excerpt">' + (relPost.excerpt || '') + '</div>';
          html +=   '</div>';
          html += '</div>';

          relatedCount++;
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

  function formatDate(dateStr) {
    var date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  function buildSidebarWidgets(allPosts, currentPostFilename) {
    // Featured Posts
    var featuredList = document.getElementById('blog-featured-posts-list');
    if (featuredList && allPosts.length > 0) {
      featuredList.innerHTML = '';
      var maxFeatured = Math.min(3, allPosts.length);
      for (var i = 0; i < maxFeatured; i++) {
        var post = allPosts[i];
        var li = document.createElement('li');
        li.className = 'cherga_featured_post_item';
        var imgSrc = post.cover_image || 'img/clipart/banner.jpg';
        var dateStr = formatDate(post.date);
        var filename = post.filename.replace(/\.md$/, '');
        li.innerHTML =
          '<a class="cherga_featured_post_image" href="blog_post.html?post=' + filename + '">' +
            '<img src="' + imgSrc + '" alt="">' +
          '</a>' +
          '<div class="cherga_featured_post_content">' +
            '<a class="cherga_featured_post_title" href="blog_post.html?post=' + filename + '">' + post.title + '</a>' +
            '<div class="cherga_featured_post_meta">' + dateStr + '</div>' +
          '</div>';
        featuredList.appendChild(li);
      }
    }

    // Categories
    var catList = document.getElementById('post-category-list');
    if (catList && allPosts.length > 0) {
      var catMap = {};
      for (var i = 0; i < allPosts.length; i++) {
        var post = allPosts[i];
        if (post.categories && post.categories.length > 0) {
          for (var j = 0; j < post.categories.length; j++) {
            var cat = post.categories[j];
            catMap[cat] = (catMap[cat] || 0) + 1;
          }
        }
      }
      catList.innerHTML = '';
      for (var c in catMap) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = 'javascript:void(0)';
        a.textContent = c + ' (' + catMap[c] + ')';
        li.appendChild(a);
        catList.appendChild(li);
      }
    }

    // Tags
    var tagCloud = document.getElementById('post-tag-cloud');
    if (tagCloud && allPosts.length > 0) {
      var tagCounts = {};
      for (var i = 0; i < allPosts.length; i++) {
        var post = allPosts[i];
        if (post.tags && post.tags.length > 0) {
          for (var j = 0; j < post.tags.length; j++) {
            var tag = post.tags[j];
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        }
      }
      tagCloud.innerHTML = '';
      var sortedTags = Object.keys(tagCounts).sort(function(a, b) {
        return tagCounts[b] - tagCounts[a];
      });
      for (var t = 0; t < sortedTags.length; t++) {
        var link = document.createElement('a');
        link.href = 'javascript:void(0)';
        link.textContent = sortedTags[t];
        tagCloud.appendChild(link);
      }
    }

    // Footer Featured Posts
    var footerList = document.getElementById('footer-featured-posts-list');
    if (footerList && allPosts.length > 0) {
      footerList.innerHTML = '';
      var maxFeatured = Math.min(3, allPosts.length);
      for (var i = 0; i < maxFeatured; i++) {
        var post = allPosts[i];
        var li = document.createElement('li');
        var dateStr = formatDate(post.date);
        var filename = post.filename.replace(/\.md$/, '');
        li.innerHTML =
          '<a href="blog_post.html?post=' + filename + '">' + post.title + '</a>' +
          '<div class="cherga_post_date">' + dateStr + '</div>';
        footerList.appendChild(li);
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    loadPost();

    // After post loads, adjust layout based on template and build sidebar widgets
    setTimeout(function() {
      var params = new URLSearchParams(window.location.search);
      var postFile = params.get('post');

      if (postFile) {
        var postIdx = new XMLHttpRequest();
        postIdx.open('GET', '_posts/index.json', true);
        postIdx.onload = function() {
          if (postIdx.status !== 200) return;

          var allPosts = JSON.parse(postIdx.responseText);
          var postFilename = postFile.match(/\.md$/) ? postFile : postFile + '.md';
          var post = null;

          for (var i = 0; i < allPosts.length; i++) {
            if (allPosts[i].filename === postFilename) { post = allPosts[i]; break; }
          }

          // Build sidebar widgets
          buildSidebarWidgets(allPosts, postFilename);

          if (post && post.template === 'blog_image') {
            // blog_image template: full-width, no sidebar
            var wrapper = document.querySelector('.cherga_content_wrapper');
            if (wrapper) {
              wrapper.classList.remove('cherga_right_sidebar');
              wrapper.classList.add('cherga_no_sidebar');
            }

            var content = document.querySelector('.cherga_content_wrapper .cherga_content');
            if (content) {
              content.classList.remove('col9');
              content.classList.add('col', 'col-12');
            }

            var sidebar = document.querySelector('.cherga_content_wrapper .cherga_sidebar');
            if (sidebar) {
              sidebar.style.display = 'none';
            }
          }
        };
        postIdx.send();
      }
    }, 100);
  });
})();