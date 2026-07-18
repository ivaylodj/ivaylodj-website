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
    // Strip HTML comments before parsing
    md = md.replace(/<!--[\s\S]*?-->/g, '');

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

    var html = result.join('\n');

    // Process drop cap markers: ~~L~~ becomes drop cap
    html = html.replace(/~~([a-zA-Z])~~/g, function(match, letter) {
      return '<span class="cherga_drop_cap"><span class="cherga_drop_cap_letter">' + letter + '</span></span>';
    });

    return html;
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
      allPosts.sort(function(a, b) {
        var dateCompare = new Date(b.date) - new Date(a.date);
        if (dateCompare !== 0) return dateCompare;
        // Secondary sort by filename for stable ordering when dates are equal
        return a.filename.localeCompare(b.filename);
      });
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

        // Parse gallery from YAML frontmatter (supports both single and nested top/bottom)
        if (fmMatch && fmMatch[1]) {
          var frontmatterText = fmMatch[1];
          var lines = frontmatterText.split('\n');
          var gallery = {};
          var inGallery = false;
          var currentSubGallery = null;
          var inImages = false;

          for (var fli = 0; fli < lines.length; fli++) {
            var line = lines[fli];

            // Check if we're entering gallery section
            if (line.startsWith('gallery:')) {
              inGallery = true;
              currentSubGallery = null;
              inImages = false;
              continue;
            }

            // If we hit a new top-level key (no indent), exit gallery section
            if (inGallery && line && !line.startsWith(' ') && !line.startsWith('\t')) {
              inGallery = false;
            }

            if (!inGallery) continue;

            // Check for sub-gallery sections (top: or bottom:)
            if (line.match(/^\s+(top|bottom):\s*$/)) {
              var subMatch = line.match(/^\s+(top|bottom):/);
              currentSubGallery = subMatch[1];
              if (!gallery[currentSubGallery]) gallery[currentSubGallery] = {};
              inImages = false;
              continue;
            }

            // Parse properties for current context
            var target = currentSubGallery ? gallery[currentSubGallery] : gallery;

            if (line.includes('columns:')) {
              var colMatch = line.match(/columns:\s*(\d+)/);
              if (colMatch) target.columns = parseInt(colMatch[1]);
            }
            if (line.includes('rows:')) {
              var rowMatch = line.match(/rows:\s*(\d+)/);
              if (rowMatch) target.rows = parseInt(rowMatch[1]);
            }
            if (line.includes('aspect_ratio:')) {
              var aspectMatch = line.match(/aspect_ratio:\s*"([^"]+)"/);
              if (aspectMatch) target.aspect_ratio = aspectMatch[1];
            }
            if (line.includes('images:')) {
              inImages = true;
              target.images = [];
              continue;
            }

            // Parse image list items
            if (inImages && line.trim().startsWith('- ')) {
              var imgPath = line.trim().substring(2).trim();
              if (imgPath.startsWith('"')) imgPath = imgPath.substring(1);
              if (imgPath.endsWith('"')) imgPath = imgPath.substring(0, imgPath.length - 1);
              if (imgPath) target.images.push(imgPath);
            }
          }

          // Merge gallery into post object
          if (Object.keys(gallery).length > 0) {
            post.gallery = gallery;
          }
        }

        // Extract gallery configuration from GALLERY_CONFIG comment (legacy)
        var galleryConfigFromMd = {};
        var configRegex = /<!-- GALLERY_CONFIG\n([\s\S]*?)\nEND_GALLERY_CONFIG -->/;
        var configMatch = mdContent.match(configRegex);
        if (configMatch) {
          var configText = configMatch[1];
          var lines = configText.split('\n');
          var currentSection = null;
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (!line.trim()) continue;

            // Section header: no leading spaces, ends with colon, no value
            if (line[0] !== ' ' && line.trim().endsWith(':')) {
              currentSection = line.trim().replace(':', '');
              galleryConfigFromMd[currentSection] = {};
            }
            // Property: starts with spaces, has key: value
            else if (line[0] === ' ' && line.includes(':')) {
              var parts = line.split(':');
              var key = parts[0].trim();
              var value = parts[1].trim();
              if (currentSection && key && value) {
                galleryConfigFromMd[currentSection][key] = value;
              }
            }
          }
        }

        var title   = post.title || '';
        var template = post.template || 'blog_standard';
        var dateStr = new Date(post.date).toLocaleDateString('en-GB', {
          year: 'numeric', month: 'long', day: 'numeric'
        });

        // ---- Build the full HTML output (template-aware) ----
        var html = '';

        // Cover image (post-format block - varies by template)
        if (post.cover_image || template === 'blog_video' || template === 'blog_audio') {
          if (template === 'blog_image') {
            // blog_image template: owl carousel slider
            html += '<div class="cherga_post_formats cherga_pf_image cherga_pf_boxed">';
            html +=   '<div class="cherga_owlCarousel owl-carousel owl-theme">';
            html +=     '<div class="item">';
            html +=       '<img src="' + post.cover_image + '" alt="" />';
            html +=     '</div>';
            html +=   '</div>';
            html += '</div>';
          } else if (template === 'blog_gallery') {
            // blog_gallery template: support top and bottom galleries
            if (post.gallery) {
              // Render top gallery if defined
              if (post.gallery.top && post.gallery.top.images && post.gallery.top.images.length > 0) {
                var topConfig = post.gallery.top;
                var topCols = parseInt(topConfig.columns) || 3;
                var topRows = parseInt(topConfig.rows) || 2;
                var topAspectRatio = topConfig.aspect_ratio || '5/4';
                var topImages = topConfig.images || [];
                var topItemCount = topCols * topRows;
                var topDisplayCount = Math.min(topItemCount, topImages.length);
                var topGalleryId = Math.random().toString(36).substr(2, 9);

                html += '<div class="cherga_post_formats cherga_gallery_grid cherga_pf_boxed">';
                html +=   '<div class="cherga_gallery_grid_inner cherga_photoswipe_wrapper" data-uniqid="' + topGalleryId + '" data-aspect-ratio="' + topAspectRatio + '" data-columns="' + topCols + '">';

                for (var tgi = 0; tgi < topDisplayCount; tgi++) {
                  html +=     '<div class="cherga_gallery_item">';
                  html +=       '<a rel="pf_gallery_' + post.filename + '_top" href="' + topImages[tgi] + '" class="cherga_pswp_slide cherga_dp cherga_no_select" data-size="1920x1280" data-count="' + tgi + '">';
                  html +=         '<img src="' + topImages[tgi] + '" alt="" />';
                  html +=       '</a>';
                  html +=     '</div>';
                }

                html +=   '</div>';
                html += '</div>';
              }

              // Render bottom gallery if defined
              if (post.gallery.bottom && post.gallery.bottom.images && post.gallery.bottom.images.length > 0) {
                var botConfig = post.gallery.bottom;
                var botCols = parseInt(botConfig.columns) || 4;
                var botRows = parseInt(botConfig.rows) || 1;
                var botAspectRatio = botConfig.aspect_ratio || '1/1';
                var botImages = botConfig.images || [];
                var botItemCount = botCols * botRows;
                var botDisplayCount = Math.min(botItemCount, botImages.length);
                var botGalleryId = Math.random().toString(36).substr(2, 9);

                html += '<div class="cherga_post_formats cherga_gallery_grid cherga_pf_boxed">';
                html +=   '<div class="cherga_gallery_grid_inner cherga_photoswipe_wrapper" data-uniqid="' + botGalleryId + '" data-aspect-ratio="' + botAspectRatio + '" data-columns="' + botCols + '">';

                for (var bgi = 0; bgi < botDisplayCount; bgi++) {
                  html +=     '<div class="cherga_gallery_item">';
                  html +=       '<a rel="pf_gallery_' + post.filename + '_bot" href="' + botImages[bgi] + '" class="cherga_pswp_slide cherga_dp cherga_no_select" data-size="1920x1280" data-count="' + bgi + '">';
                  html +=         '<img src="' + botImages[bgi] + '" alt="" />';
                  html +=       '</a>';
                  html +=     '</div>';
                }

                html +=   '</div>';
                html += '</div>';
              }
            }
          } else if (template === 'blog_video') {
            // blog_video template: embedded video (Vimeo)
            html += '<div class="cherga_post_formats cherga_pf_video cherga_pf_boxed">';
            html +=   '<div class="cherga_video_container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">';
            html +=     '<iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" src="' + post.cover_image + '" allowfullscreen allow="autoplay"></iframe>';
            html +=   '</div>';
            html += '</div>';
          } else if (template === 'blog_audio') {
            // blog_audio template: embedded audio (SoundCloud)
            html += '<div class="cherga_post_formats cherga_pf_audio cherga_pf_boxed">';
            html +=   '<div class="cherga_audio_container">';
            html +=     '<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="' + post.cover_image + '"></iframe>';
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

        // Process inline galleries in markdown
        var inlineGalleryRegex = /<!-- GALLERY_INLINE\n([\s\S]*?)\nEND_GALLERY_INLINE -->/g;
        bodyMd = bodyMd.replace(inlineGalleryRegex, function(match, galleryConfig) {
          var inlineCfg = {};
          var cfgLines = galleryConfig.split('\n');
          var cfgImages = [];
          var inImages = false;

          for (var ci = 0; ci < cfgLines.length; ci++) {
            var cfgLine = cfgLines[ci];
            if (cfgLine.includes('columns:')) {
              var colMatch = cfgLine.match(/columns:\s*(\d+)/);
              if (colMatch) inlineCfg.columns = parseInt(colMatch[1]);
            }
            if (cfgLine.includes('rows:')) {
              var rowMatch = cfgLine.match(/rows:\s*(\d+)/);
              if (rowMatch) inlineCfg.rows = parseInt(rowMatch[1]);
            }
            if (cfgLine.includes('aspect_ratio:')) {
              var aspMatch = cfgLine.match(/aspect_ratio:\s*"([^"]+)"/);
              if (aspMatch) inlineCfg.aspect_ratio = aspMatch[1];
            }
            if (cfgLine.includes('images:')) {
              inImages = true;
              continue;
            }
            if (inImages && cfgLine.trim().startsWith('- ')) {
              var imgPath = cfgLine.trim().substring(2).trim();
              if (imgPath.startsWith('"')) imgPath = imgPath.substring(1);
              if (imgPath.endsWith('"')) imgPath = imgPath.substring(0, imgPath.length - 1);
              if (imgPath) cfgImages.push(imgPath);
            }
          }

          // Render inline gallery
          var inlineCols = inlineCfg.columns || 4;
          var inlineRows = inlineCfg.rows || 1;
          var inlineAspect = inlineCfg.aspect_ratio || '1/1';
          var inlineItemCount = inlineCols * inlineRows;
          var inlineDisplayCount = Math.min(inlineItemCount, cfgImages.length);
          var inlineGalleryId = Math.random().toString(36).substr(2, 9);

          var galleryHtml = '<div class="cherga_post_formats cherga_gallery_grid cherga_pf_boxed">';
          galleryHtml +=   '<div class="cherga_gallery_grid_inner cherga_photoswipe_wrapper" data-uniqid="' + inlineGalleryId + '" data-aspect-ratio="' + inlineAspect + '" data-columns="' + inlineCols + '">';

          for (var igi = 0; igi < inlineDisplayCount; igi++) {
            galleryHtml +=     '<div class="cherga_gallery_item">';
            galleryHtml +=       '<a rel="pf_gallery_' + post.filename + '_inline" href="' + cfgImages[igi] + '" class="cherga_pswp_slide cherga_dp cherga_no_select" data-size="1920x1280" data-count="' + igi + '">';
            galleryHtml +=         '<img src="' + cfgImages[igi] + '" alt="" />';
            galleryHtml +=       '</a>';
            galleryHtml +=     '</div>';
          }

          galleryHtml +=   '</div>';
          galleryHtml += '</div>';

          return galleryHtml;
        });

        html += '<div class="cherga_tiny cherga_blog_post_content">';
        html += parseMd(bodyMd);
        html += '</div>';

        // Tags
        if (post.tags && post.tags.length) {
          html += '<div class="cherga_post_tags">Tagged in';
          for (var t = 0; t < post.tags.length; t++) {
            html += ' <a href="blog.html?tag=' + encodeURIComponent(post.tags[t]) + '" rel="tag">' + post.tags[t] + '</a>';
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

        // Initialize template-specific functionality
        setTimeout(function() {
          if (template === 'blog_image') {
            // Initialize Owl Carousel for blog_image template
            var $carousel = jQuery('.cherga_owlCarousel');
            if ($carousel.length > 0) {
              var itemCount = $carousel.find('.item').length;
              $carousel.owlCarousel({
                items: 1,
                loop: itemCount > 1,
                dots: false,
                nav: itemCount > 1,
                navText: ['', ''],
                autoplay: itemCount > 1,
                autoplayTimeout: 5000,
                autoplayHoverPause: true,
                autoHeight: true
              });
            }
          } else if (template === 'blog_gallery') {
            // Initialize PhotoSwipe for blog_gallery template
            updatePhotoSwipeSizes(function() {
              initializePhotoSwipe();
            });
          }
        }, 100);


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
        // Sidebar (categories, tags, featured posts) is built in buildSidebarWidgets().
      };
      contentXhr.send();
    };
    postIdx.send();
  }

  // Load image dimensions and update data-size attributes for PhotoSwipe
  function updatePhotoSwipeSizes(callback) {
    var photoswipeLinks = document.querySelectorAll('.cherga_pswp_slide');
    var loadedCount = 0;
    var totalCount = photoswipeLinks.length;


    if (totalCount === 0) {
      if (callback) callback();
      return;
    }

    photoswipeLinks.forEach(function(link) {
      var imgUrl = link.getAttribute('href');
      var img = new Image();
      img.onload = function() {
        link.setAttribute('data-size', img.width + 'x' + img.height);
        loadedCount++;
        if (loadedCount === totalCount && callback) callback();
      };
      img.onerror = function() {
        link.setAttribute('data-size', '1920x1280'); // fallback
        loadedCount++;
        if (loadedCount === totalCount && callback) callback();
      };
      img.src = imgUrl;
    });
  }

  function initializePhotoSwipe() {

    // Ensure PhotoSwipe container exists
    var pswp = document.querySelector('.pswp');
    if (!pswp) {
      var pswpHtml = '<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">' +
        '<div class="pswp__bg"></div>' +
        '<div class="pswp__scroll-wrap">' +
          '<div class="pswp__container"><div class="pswp__item"></div><div class="pswp__item"></div><div class="pswp__item"></div></div>' +
          '<div class="pswp__ui pswp__ui--hidden">' +
            '<div class="pswp__top-bar">' +
              '<div class="pswp__counter"></div>' +
              '<button class="pswp__button pswp__button--close" title="Close (Esc)"></button>' +
              '<button class="pswp__button pswp__button--share" title="Share"></button>' +
              '<button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button>' +
              '<div class="pswp__preloader">' +
                '<div class="pswp__preloader__icn">' +
                  '<div class="pswp__preloader__cut">' +
                    '<div class="pswp__preloader__donut"></div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">' +
              '<div class="pswp__share-tooltip"></div>' +
            '</div>' +
            '<button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"></button>' +
            '<button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)"></button>' +
            '<div class="pswp__caption"><div class="pswp__caption__center"></div></div>' +
          '</div>' +
        '</div>' +
        '</div>';
      document.body.appendChild((function() {
        var div = document.createElement('div');
        div.innerHTML = pswpHtml;
        return div.firstChild;
      })());
      pswp = document.querySelector('.pswp');
    }

    // Build gallery array indexed by data-uniqid
    var galleryArray = {};
    var wrappers = jQuery('.cherga_photoswipe_wrapper');

    wrappers.each(function() {
      var galleryId = jQuery(this).attr('data-uniqid');
      var slides = [];

      jQuery(this).find('.cherga_pswp_slide').each(function() {
        var href = jQuery(this).attr('href');
        var size = jQuery(this).data('size') || '1920x1280';
        var sizeParts = size.split('x');
        slides.push({
          src: href,
          w: parseInt(sizeParts[0]),
          h: parseInt(sizeParts[1])
        });
      });

      galleryArray['gallery_' + galleryId] = { slides: slides };
    });

    // Handle clicks on gallery images
    jQuery(document).on('click', '.cherga_pswp_slide', function(e) {
      e.preventDefault();
      var $this = jQuery(this);
      var galleryId = $this.parents('.cherga_photoswipe_wrapper').attr('data-uniqid');
      var index = parseInt($this.attr('data-count'), 10);


      var gallery = galleryArray['gallery_' + galleryId];
      if (!gallery || !gallery.slides) {
        return;
      }

      var options = {
        index: index,
        bgOpacity: 0.7,
        showHideOpacity: true
      };

      var lightBox = new PhotoSwipe(pswp, PhotoSwipeUI_Default, gallery.slides, options);
      lightBox.init();
    });
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
        var imgSrc = post.cover_image || 'img/clipart/banner.jpg';
        var dateStr = formatDate(post.date);
        var filename = post.filename.replace(/\.md$/, '');
        // Emit the theme-styled markup (cherga_posts_item) used by the widget CSS.
        var item = document.createElement('div');
        item.className = 'cherga_posts_item cherga_block_with_fi';
        item.innerHTML =
          '<a class="cherga_posts_item_image cherga_dp cherga_no_select" href="blog_post.html?post=' + filename + '">' +
            '<img src="' + imgSrc + '" alt="" width="62" height="62" />' +
          '</a>' +
          '<div class="cherga_posts_item_content">' +
            '<a class="cherga_featured_post_widget_title" href="blog_post.html?post=' + filename + '">' + post.title + '</a>' +
            '<div class="cherga_widget_meta"><div>' + dateStr + '</div></div>' +
          '</div>';
        featuredList.appendChild(item);
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
        a.textContent = c;
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
          // Same comparator as loadPost() so ordering is consistent everywhere
          // (date descending, then filename for a stable tie-break).
          allPosts.sort(function(a, b) {
            var dateCompare = new Date(b.date) - new Date(a.date);
            if (dateCompare !== 0) return dateCompare;
            return a.filename.localeCompare(b.filename);
          });
          var postFilename = postFile.match(/\.md$/) ? postFile : postFile + '.md';
          var post = null;

          for (var i = 0; i < allPosts.length; i++) {
            if (allPosts[i].filename === postFilename) { post = allPosts[i]; break; }
          }

          // Build sidebar widgets
          buildSidebarWidgets(allPosts, postFilename);

          // Determine if template should use full width (no sidebar)
          var fullWidthTemplates = ['blog_image', 'blog_gallery', 'blog_video'];
          var shouldBeFullWidth = post && fullWidthTemplates.indexOf(post.template) !== -1;

          if (shouldBeFullWidth) {
            // These templates are full-width, no sidebar
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