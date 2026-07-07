(function() {
  var posts = [];
  var allTags = {};
  var activeTag = null;
  var searchQuery = '';

  // Strip HTML tags for text search
  function stripHtml(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  // Slugify a tag for URL-safe filtering
  function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  // Load posts from index.json and render
  function loadPosts() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'blog_post_template.html', true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        window.blogPostTemplate = xhr.responseText;
      }
    };
    xhr.send();

    var postIdx = new XMLHttpRequest();
    postIdx.open('GET', '_posts/index.json', true);
    postIdx.onload = function() {
      if (postIdx.status === 200) {
        posts = JSON.parse(postIdx.responseText);
        buildTagCloud();
        renderPosts(posts);
      }
    };
    postIdx.send();
  }

  // Build tag cloud from all posts
  function buildTagCloud() {
    var tagCounts = {};
    var catCounts = {};

    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      if (post.tags) {
        for (var j = 0; j < post.tags.length; j++) {
          var tag = post.tags[j];
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          allTags[tag] = true;
        }
      }
      if (post.categories) {
        for (var k = 0; k < post.categories.length; k++) {
          var cat = post.categories[k];
          if (!(cat in catCounts)) catCounts[cat] = [];
          catCounts[cat].push(post);
        }
      }
    }

    // Render tag cloud
    var container = document.getElementById('blog-tag-cloud');
    if (!container) return;

    // All tags button
    var allBtn = document.createElement('span');
    allBtn.className = 'cherga_blog_tag_filter active';
    allBtn.textContent = 'All (' + posts.length + ')';
    allBtn.setAttribute('data-tag', '');
    allBtn.onclick = function() { setActiveTag(null); };
    container.appendChild(allBtn);

    var sortedTags = Object.keys(tagCounts).sort(function(a, b) { return tagCounts[b] - tagCounts[a]; });
    for (var t = 0; t < sortedTags.length; t++) {
      var btn = document.createElement('span');
      btn.className = 'cherga_blog_tag_filter';
      btn.textContent = sortedTags[t] + ' (' + tagCounts[sortedTags[t]] + ')';
      btn.setAttribute('data-tag', sortedTags[t]);
      btn.onclick = (function(tag) {
        return function() { setActiveTag(tag); };
      })(sortedTags[t]);
      container.appendChild(btn);
    }

    // Render sidebar categories list
    var catList = document.getElementById('blog-categories-list');
    if (catList && Object.keys(catCounts).length > 0) {
      for (var c in catCounts) {
        var li = document.createElement('li');
        li.innerHTML = '<a href="javascript:void(0)" data-cat="' + c + '">' + c + ' (' + catCounts[c].length + ')</a>';
        li.querySelector('a').onclick = (function(cat){ return function(){ filterByCategory(cat); }; })(c);
        catList.appendChild(li);
      }
    }

    // Render sidebar tag cloud with active link tracking
    var sideCloud = document.getElementById('sidebar-tag-cloud');
    if (sideCloud) {
      for (var s = 0; s < sortedTags.length; s++) {
        var existing = sideCloud.querySelector('[data-tag="' + sortedTags[s] + '"]');
        if (existing) {
          allTags[sortedTags[s]] = true;
          (function(tag){
            existing.onclick = function() { setActiveTag(tag); };
          })(sortedTags[s]);
        }
      }
    }
  }

  // Filter posts and render cards
  function renderPosts(postList) {
    var grid = document.getElementById('blog-post-grid');
    var noResults = document.getElementById('blog-no-results');
    if (!grid) return;

    // Sort by date desc
    postList.sort(function(a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    grid.innerHTML = '';

    if (postList.length === 0) {
      noResults.style.display = 'block';
      return;
    }

    noResults.style.display = 'none';

    for (var i = 0; i < postList.length; i++) {
      var post = postList[i];
      var card = document.createElement('a');
      card.className = 'cherga_blog_card';
      card.href = 'blog_post.html?post=' + post.filename;

      var coverImg = '';
      if (post.cover_image) {
        coverImg = '<img class="cherga_blog_card_image" src="' + post.cover_image + '" alt="">';
      } else {
        coverImg = '<div class="cherga_blog_card_image" style="display:flex;align-items:center;justify-content:center;color:#999;">No image</div>';
      }

      var dateStr = new Date(post.date).toLocaleDateString('en-GB', {
        year: 'numeric', month: 'long', day: 'numeric'
      });

      var tagsHtml = '';
      if (post.tags && post.tags.length > 0) {
        tagsHtml = '<div class="cherga_blog_card_tags">';
        for (var t = 0; t < post.tags.length; t++) {
          tagsHtml += '<a href="javascript:void(0)" onclick="event.stopPropagation();setActiveTag(\'' + post.tags[t] + '\');">' + post.tags[t] + '</a>';
        }
        tagsHtml += '</div>';
      }

      card.innerHTML = coverImg + 
        '<div class="cherga_blog_card_body">' +
          '<div class="cherga_blog_card_date">' + dateStr + '</div>' +
          '<span class="cherga_blog_card_title">' + post.title + '</span>' +
          '<div class="cherga_blog_card_excerpt">' + (post.excerpt || stripHtml(post.content || '').substring(0, 150)) + '...</div>' +
          tagsHtml +
        '</div>';

      grid.appendChild(card);
    }
  }

  // Set active tag filter
  function setActiveTag(tag) {
    activeTag = tag;

    // Update UI
    var filters = document.querySelectorAll('#blog-tag-cloud .cherga_blog_tag_filter');
    for (var i = 0; i < filters.length; i++) {
      if (filters[i].getAttribute('data-tag') === tag) {
        filters[i].classList.add('active');
      } else {
        filters[i].classList.remove('active');
      }
    }

    filterPosts();
  }

  // Filter posts by tag and search query
  function filterPosts() {
    var filtered = posts;

    if (activeTag) {
      filtered = filtered.filter(function(post) {
        return post.tags && post.tags.indexOf(activeTag) !== -1;
      });
    }

    if (searchQuery) {
      var q = searchQuery.toLowerCase();
      filtered = filtered.filter(function(post) {
        var titleMatch = post.title.toLowerCase().indexOf(q) !== -1;
        var excerptMatch = (post.excerpt || '').toLowerCase().indexOf(q) !== -1;
        var contentMatch = stripHtml(post.content || '').toLowerCase().indexOf(q) !== -1;
        return titleMatch || excerptMatch || contentMatch;
      });
    }

    renderPosts(filtered);
  }

  // Filter by category
  function filterByCategory(cat) {
    activeTag = null;

    var filters = document.querySelectorAll('#blog-tag-cloud .cherga_blog_tag_filter');
    for (var i = 0; i < filters.length; i++) {
      filters[i].classList.remove('active');
    }

    var filtered = posts.filter(function(post) {
      return post.categories && post.categories.indexOf(cat) !== -1;
    });

    renderPosts(filtered);
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', function() {
    loadPosts();

    // Search handler
    var searchInput = document.getElementById('blog-search');
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        searchQuery = e.target.value.trim();
        filterPosts();
      });
    }

    // Sidebar tag cloud handlers
    var sideTags = document.querySelectorAll('#sidebar-tag-cloud a[data-tag]');
    for (var i = 0; i < sideTags.length; i++) {
      sideTags[i].onclick = function() {
        var tag = this.getAttribute('data-tag');
        setActiveTag(tag);
        // Scroll to cloud
        document.getElementById('blog-tag-cloud').scrollIntoView({ behavior: 'smooth', block: 'center' });
      };
    }
  });

  // Expose functions globally for inline onclick handlers
  window.setActiveTag = setActiveTag;
})();
