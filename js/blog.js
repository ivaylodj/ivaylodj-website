(function() {
  var posts = [];
  var allTags = {};
  var searchQuery = '';

  function stripHtml(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  function formatDate(dateStr) {
    var date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  function loadPosts() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '_posts/index.json', true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        posts = JSON.parse(xhr.responseText);
        posts.sort(function(a, b) {
          return new Date(b.date) - new Date(a.date);
        });
        buildWidgets();
        renderPosts(posts);
      }
    };
    xhr.send();
  }

  function buildWidgets() {
    buildCategories();
    buildTagCloud();
    buildFeaturedPosts();
    buildFooterFeaturedPosts();
  }

  function buildCategories() {
    var catMap = {};
    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      if (post.categories && post.categories.length > 0) {
        for (var j = 0; j < post.categories.length; j++) {
          var cat = post.categories[j];
          catMap[cat] = (catMap[cat] || 0) + 1;
        }
      }
    }

    var catList = document.getElementById('blog-categories-list');
    if (!catList) return;

    catList.innerHTML = '';
    for (var c in catMap) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = 'javascript:void(0)';
      a.textContent = c + ' (' + catMap[c] + ')';
      a.onclick = (function(cat) {
        return function() { filterByCategory(cat); };
      })(c);
      li.appendChild(a);
      catList.appendChild(li);
    }
  }

  function buildTagCloud() {
    var tagCounts = {};
    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      if (post.tags && post.tags.length > 0) {
        for (var j = 0; j < post.tags.length; j++) {
          var tag = post.tags[j];
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          allTags[tag] = true;
        }
      }
    }

    var container = document.getElementById('sidebar-tag-cloud');
    if (!container) return;

    container.innerHTML = '';
    var sortedTags = Object.keys(tagCounts).sort(function(a, b) {
      return tagCounts[b] - tagCounts[a];
    });

    for (var t = 0; t < sortedTags.length; t++) {
      var link = document.createElement('a');
      link.href = 'javascript:void(0)';
      link.textContent = sortedTags[t];
      link.onclick = (function(tag) {
        return function() { filterByTag(tag); };
      })(sortedTags[t]);
      container.appendChild(link);
    }
  }

  function buildFeaturedPosts() {
    var list = document.getElementById('featured-posts-list');
    if (!list || posts.length === 0) return;

    list.innerHTML = '';
    var maxFeatured = Math.min(3, posts.length);
    for (var i = 0; i < maxFeatured; i++) {
      var post = posts[i];
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

      list.appendChild(li);
    }
  }

  function buildFooterFeaturedPosts() {
    var list = document.getElementById('footer-featured-posts-list');
    if (!list || posts.length === 0) return;

    list.innerHTML = '';
    var maxFeatured = Math.min(3, posts.length);
    for (var i = 0; i < maxFeatured; i++) {
      var post = posts[i];
      var li = document.createElement('li');
      var dateStr = formatDate(post.date);
      var filename = post.filename.replace(/\.md$/, '');

      li.innerHTML =
        '<a href="blog_post.html?post=' + filename + '">' + post.title + '</a>' +
        '<div class="cherga_post_date">' + dateStr + '</div>';

      list.appendChild(li);
    }
  }

  function renderPosts(postList) {
    var container = document.getElementById('blog-posts-container');
    if (!container) return;

    container.innerHTML = '';

    if (postList.length === 0) {
      container.innerHTML = '<div style="text-align:center;color:#9a9ea3;padding:60px 20px;">No posts found matching your search.</div>';
      return;
    }

    for (var i = 0; i < postList.length; i++) {
      var post = postList[i];
      var filename = post.filename.replace(/\.md$/, '');
      var dateStr = formatDate(post.date);

      var item = document.createElement('div');
      item.className = 'cherga_standard_post_item';

      var postImg = '';
      if (post.cover_image) {
        postImg = '<div class="cherga_post_formats">' +
          '<img class="cherga_post_featured_image" src="' + post.cover_image + '" alt="">' +
          '</div>';
      }

      var metaHtml = '<div class="cherga_post_meta">' +
        '<div class="cherga_post_meta_item">' + dateStr + '</div>';

      if (post.categories && post.categories.length > 0) {
        metaHtml += '<div class="cherga_post_meta_item">in ';
        for (var j = 0; j < post.categories.length; j++) {
          if (j > 0) metaHtml += ', ';
          metaHtml += '<a href="javascript:void(0)" onclick="filterByCategory(\'' + post.categories[j] + '\');">' + post.categories[j] + '</a>';
        }
        metaHtml += '</div>';
      }

      metaHtml += '</div>';

      var excerpt = post.excerpt || stripHtml(post.content || '').substring(0, 200);

      item.innerHTML = postImg + metaHtml +
        '<h2 class="cherga_post_listing_title">' +
          '<a href="blog_post.html?post=' + filename + '">' + post.title + '</a>' +
        '</h2>' +
        '<div class="cherga_excerpt">' + excerpt + '</div>' +
        '<a class="cherga_read_more_button" href="blog_post.html?post=' + filename + '">Read More</a>';

      container.appendChild(item);
    }

    renderPagination(postList.length);
  }

  function renderPagination(postCount) {
    var paginationContainer = document.getElementById('blog-pagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';

    if (postCount <= 0) return;

    var html = '<span class="current">Page 1</span>';

    if (postCount > 1) {
      html += ' <span style="color:#5a5f67;">of</span> ';
      html += '<span class="current">' + Math.ceil(postCount / 10) + '</span>';
    }

    paginationContainer.innerHTML = html;
  }

  function filterByTag(tag) {
    searchQuery = '';
    var searchInput = document.getElementById('blog-search');
    if (searchInput) searchInput.value = '';

    var filtered = posts.filter(function(post) {
      return post.tags && post.tags.indexOf(tag) !== -1;
    });
    renderPosts(filtered);
  }

  function filterByCategory(cat) {
    searchQuery = '';
    var searchInput = document.getElementById('blog-search');
    if (searchInput) searchInput.value = '';

    var filtered = posts.filter(function(post) {
      return post.categories && post.categories.indexOf(cat) !== -1;
    });
    renderPosts(filtered);
  }

  function filterBySearch() {
    var filtered = posts;

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

  document.addEventListener('DOMContentLoaded', function() {
    loadPosts();

    var searchInput = document.getElementById('blog-search');
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        searchQuery = e.target.value.trim();
        filterBySearch();
      });
    }
  });

  window.filterByTag = filterByTag;
  window.filterByCategory = filterByCategory;
})();
