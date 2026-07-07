(function() {
  // Minimal markdown parser - handles what this blog uses:
  // headers (h2-h4), bold, italic, blockquotes, lists, links, images, paragraphs
  
  function parseMd(md) {
    var lines = md.split('\n');
    var result = [];
    var inList = false;
    var listTag = 'ul';
    var headingLevel = 0;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      // Empty line closes list, adds paragraph break
      if (line.trim() === '') {
        if (inList) { result.push('</' + listTag + '>'); inList = false; }
        continue;
      }

      // Code blocks - skip for now
      if (line.indexOf('```') === 0) continue;

      // Headers: ##, ###, ####
      var m = line.match(/^(#{1,3})\s+(.+)$/);
      if (m) {
        level = m[1].length + 1; // convert to h{2,4}
        content = formatInline(m[2]);
        result.push('<h' + level + '>' + content + '</h' + level + '>');
        continue;
      }

      // Horizontal rule
      if (line.match(/^---+$/)) {
        result.push('<hr>');
        continue;
      }

      // Blockquote: > text or >> nested
      var bqMatch = line.match(/^\s*>\s?(.+)$/);
      if (bqMatch) {
        if (!inList) { result.push('<blockquote><p>' + formatInline(bqMatch[1]); inList = true; listTag = 'bq'; continue; }
        result.push(formatInline(bqMatch[1])); // just add the text inside <p> of blockquote
        continue;
      }

      // Unordered list: - or * item
      var ulMatch = line.match(/^\s*[-*]\s+(.+)$/);
      if (ulMatch) {
        if (!inList || listTag !== 'ul') { 
          result.push('<ul>'); 
          inList = true; 
          listTag = 'ul'; 
        }
        result.push('<li>' + formatInline(ulMatch[1]) + '</li>');
        continue;
      }

      // Ordered list: 1. item
      var olMatch = line.match(/^\s*\d+\.\s+(.+)$/);
      if (olMatch) {
        if (!inList || listTag !== 'ol') { 
          result.push('<ol>'); 
          inList = true; 
          listTag = 'ol'; 
        }
        result.push('<li>' + formatInline(olMatch[1]) + '</li>');
        continue;
      }

      // Close list if we were in one
      if (inList) { result.push('</' + listTag + '>'); inList = false; }

      // Closing blockquote if it was open
      if (listTag === 'bq') { 
        // Don't close bq immediately, let next line decide
      }

      // Paragraph - detect closing of nested blockquotes or other special structures
      var pMatch = line.match(/^>\s?/);  // still inside a quoted section
      // Skip these lines since they're handled in the blockquote logic above
      
      // Regular paragraph text
      result.push('<p>' + formatInline(line) + '</p>');
    }

    // Close any remaining list or quote blocks
    if (inList) { result.push('</' + listTag + '>'); }
    
    return result.join('\n');
  }

  function formatInline(text) {
    // Bold: **text** or __text__
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Italic: *text* or _text_ (but not inside HTML tags)
    text = text.replace(/(?<![^<])\*(?![\s<])(.+?)(?<![\s>])\*(?![^>])/g, '<em>$1</em>');
    text = text.replace(/(?<![^<])_(?![\s<])(.+?)(?<![\s>])_(?![^>])/g, '<em>$1</em>');

    // Links: [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(match, linkText, url) {
      if (linkText.indexOf('http') === 0) return match; // Already a full URL, no need to modify
      // Convert relative links if needed, but mostly keep as-is since the site uses full URLs
      return '<a href="' + url + '">' + linkText + '</a>';
    });

    // Images: ![alt](url)
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

    return text;
  }

  function loadPost() {
    // Get post filename from URL query param
    var params = new URLSearchParams(window.location.search);
    var postFile = params.get('post');
    
    if (!postFile) {
      document.getElementById('blog-post-content').innerHTML = 
        'No post specified. <a href="blog.html">&larr; Back to Blog</a>';
      return;
    }

    // Load both the post data and content
    var postIdx = new XMLHttpRequest();
    postIdx.open('GET', '_posts/index.json', true);
    postIdx.onload = function() {
      if (postIdx.status !== 200) return;
      
      var allPosts = JSON.parse(postIdx.responseText);
      var post = null;
      for (var i = 0; i < allPosts.length; i++) {
        if (allPosts[i].filename === postFile) {
          post = allPosts[i];
          break;
        }
      }

      if (!post) {
        document.getElementById('blog-post-content').innerHTML = 'Post not found. <a href="blog.html">&larr; Back to Blog</a>';
        return;
      }

      // Load post markdown content from _posts/ dir
      var contentXhr = new XMLHttpRequest();
      contentXhr.open('GET', '_posts/' + postFile, true);
      contentXhr.onload = function() {
        if (contentXhr.status !== 200) {
          document.getElementById('blog-post-content').innerHTML = 'Failed to load post. <a href="blog.html">&larr; Back to Blog</a>';
          return;
        }

        var mdContent = contentXhr.responseText;

        // Extract frontmatter if present
        var frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/m;
        var fmMatch = mdContent.match(frontmatterRegex);
        
        var title = post.title || '';
        var dateStr = new Date(post.date).toLocaleDateString('en-GB', {
          year: 'numeric', month: 'long', day: 'numeric'
        });

        // Build the post
        var html = '';
        
        // Cover image or placeholder
        if (post.cover_image) {
          html += '<div class="cherga_post_formats cherga_pf_standard cherga_pf_boxed">';
          html += '<div class="cherga_pf_standard_cont cherga_dp cherga_no_select"><img src="' + post.cover_image + '" alt=""></div>';
          html += '</div>';
        }

        // Meta
        html += '<div class="cherga_post_meta">';
        html += '<div class="cherga_post_meta_item">' + dateStr + '</div>';
        if (post.categories && post.categories.length) {
          html += '<div class="cherga_post_meta_item">in ';
          var cats = [];
          for (c in post.categories) {
            cats.push('<a rel="category tag" href="javascript:void(0)">' + post.categories[c] + '</a>');
          }
          html += cats.join(', ');
          html += '</div>';
        }
        html += '</div>';

        // Title
        html += '<h1 class="cherga_post_title">' + title + '</h1>';

        // Content (body with <span> class support for drop cap etc.)
        var bodyMd = '';
        if (fmMatch) {
          bodyMd = fmMatch[2];
        } else {
          bodyMd = mdContent;
        }
        
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
        var encodedUrl = encodeURIComponent(window.location.href);
        var encodedTitle = encodeURIComponent(title);
        html += '<div class="cherga_sharing">';
        html += '<span class="cherga_sharing_label">Share This Post</span> ';
        html += '<a href="https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl + '&t=' + encodedTitle + '" target="_blank" title="Share on Facebook" class="cherga_share_facebook">Facebook</a> ';
        html += '<a href="https://twitter.com/intent/tweet?url=' + encodedUrl + '&text=' + encodedTitle + '" target="_blank" title="Share on Twitter/X" class="cherga_share_twitter">Twitter/X</a>';
        html += '</div>';
        html += '<div class="clear"></div>';

        document.getElementById('blog-post-content').innerHTML = html;

        // Update page metadata with post-specific info
        document.title = title + ' | Ivaylo Djounov Photography Blog';
        var canonicalMeta = document.querySelector("link[rel='canonical']");
        if (canonicalMeta) canonicalMeta.href = 'https://ivaylodj.com/blog_post.html?post=' + postFile;
        
        var descMeta = document.querySelector('meta[name="description"]');
        if (descMeta) descMeta.content = post.excerpt || '';
        
        var ogTitleMeta = document.querySelector('meta[property="og:title"]');
        if (ogTitleMeta) ogTitleMeta.content = title;
        var ogDescMeta = document.querySelector('meta[property="og:description"]');
        if (ogDescMeta) ogDescMeta.content = post.excerpt || '';
        
        // Update URL without reload
        window.history.replaceState({}, '', 'blog_post.html?post=' + postFile);

        // Update sidebar categories
        var catList = document.getElementById('post-category-list');
        if (catList && post.categories) {
          for (var ci = 0; ci < post.categories.length; ci++) {
            var li = document.createElement('li');
            li.innerHTML = '<a href="javascript:void(0)" data-cat="' + post.categories[ci] + '">' + post.categories[ci] + '</a>';
            catList.appendChild(li);
          }
        }
      };
      contentXhr.send();
    };
    postIdx.send();
  }

  document.addEventListener('DOMContentLoaded', loadPost);
})();
