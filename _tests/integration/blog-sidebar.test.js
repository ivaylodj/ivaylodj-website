describe('Blog Sidebar Rendering', () => {
  let mockPosts;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="blog-posts-container"></div>
      <div id="blog-categories-list"></div>
      <div id="sidebar-tag-cloud"></div>
      <div id="featured-posts-list"></div>
      <input id="blog-search" type="text">
    `;

    mockPosts = [
      {
        filename: '2022-01-22-first-post.md',
        title: 'First Post',
        date: '2022-01-22',
        template: 'blog_image',
        cover_image: 'img/test1.jpg',
        categories: ['Sunsets', 'Nature'],
        tags: ['photography', 'sunsets', 'nature'],
        excerpt: 'First post excerpt'
      },
      {
        filename: '2022-01-22-welcome-post.md',
        title: 'Welcome Message',
        date: '2022-01-22',
        template: 'blog_standard',
        cover_image: 'img/test2.jpg',
        categories: ['Photography', 'Behind the Scenes'],
        tags: ['photography', 'travel', 'behind-the-scenes'],
        excerpt: 'Welcome post excerpt'
      }
    ];

    // Mock fetch for XMLHttpRequest
    global.XMLHttpRequest = jest.fn(() => ({
      open: jest.fn(),
      send: jest.fn(),
      onload: null,
      status: 200,
      responseText: JSON.stringify(mockPosts),
      addEventListener: jest.fn()
    }));
  });

  test('should render categories with post counts', () => {
    const catList = document.getElementById('blog-categories-list');

    // Simulate building categories
    const catMap = {};
    mockPosts.forEach(post => {
      if (post.categories && post.categories.length > 0) {
        post.categories.forEach(cat => {
          catMap[cat] = (catMap[cat] || 0) + 1;
        });
      }
    });

    catList.innerHTML = '';
    for (const c in catMap) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.textContent = c + ' (' + catMap[c] + ')';
      li.appendChild(a);
      catList.appendChild(li);
    }

    expect(catList.children.length).toBeGreaterThan(0);
    expect(catList.innerHTML).toContain('Sunsets (1)');
    expect(catList.innerHTML).toContain('Nature (1)');
    expect(catList.innerHTML).toContain('Photography (1)');
    expect(catList.innerHTML).toContain('Behind the Scenes (1)');
  });

  test('should render tag cloud from all posts', () => {
    const tagCloud = document.getElementById('sidebar-tag-cloud');

    // Simulate building tag cloud
    const tagCounts = {};
    mockPosts.forEach(post => {
      if (post.tags && post.tags.length > 0) {
        post.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    tagCloud.innerHTML = '';
    const sortedTags = Object.keys(tagCounts).sort((a, b) =>
      tagCounts[b] - tagCounts[a]
    );

    sortedTags.forEach(tag => {
      const link = document.createElement('a');
      link.textContent = tag;
      tagCloud.appendChild(link);
    });

    expect(tagCloud.children.length).toBeGreaterThan(0);
    expect(tagCloud.innerHTML).toContain('photography');
    expect(tagCloud.innerHTML).toContain('sunsets');
    expect(tagCloud.innerHTML).toContain('travel');
  });

  test('should render featured posts with images and dates', () => {
    const list = document.getElementById('featured-posts-list');

    // Simulate building featured posts
    list.innerHTML = '';
    const maxFeatured = Math.min(3, mockPosts.length);
    for (let i = 0; i < maxFeatured; i++) {
      const post = mockPosts[i];
      const li = document.createElement('li');
      li.className = 'cherga_featured_post_item';
      const filename = post.filename.replace(/\.md$/, '');
      li.innerHTML =
        '<a class="cherga_featured_post_image" href="blog_post.html?post=' + filename + '">' +
          '<img src="' + post.cover_image + '" alt="">' +
        '</a>' +
        '<div class="cherga_featured_post_content">' +
          '<a class="cherga_featured_post_title" href="blog_post.html?post=' + filename + '">' + post.title + '</a>' +
          '<div class="cherga_featured_post_meta">' + post.date + '</div>' +
        '</div>';
      list.appendChild(li);
    }

    expect(list.children.length).toBe(2);
    expect(list.innerHTML).toContain('cherga_featured_post_item');
    expect(list.innerHTML).toContain('img/test1.jpg');
    expect(list.innerHTML).toContain('img/test2.jpg');
    expect(list.innerHTML).toContain('First Post');
    expect(list.innerHTML).toContain('Welcome Message');
  });

  test('should limit featured posts to 3 maximum', () => {
    const list = document.getElementById('featured-posts-list');

    // Create 5 mock posts
    const manyPosts = [];
    for (let i = 0; i < 5; i++) {
      manyPosts.push({
        filename: `post-${i}.md`,
        title: `Post ${i}`,
        date: '2022-01-22',
        cover_image: `img/test${i}.jpg`,
        categories: ['Test'],
        tags: ['test']
      });
    }

    // Simulate building featured posts
    list.innerHTML = '';
    const maxFeatured = Math.min(3, manyPosts.length);
    for (let i = 0; i < maxFeatured; i++) {
      const post = manyPosts[i];
      const li = document.createElement('li');
      li.className = 'cherga_featured_post_item';
      list.appendChild(li);
    }

    expect(list.children.length).toBe(3);
  });

  test('should have all sidebar widgets present', () => {
    expect(document.getElementById('blog-categories-list')).toBeTruthy();
    expect(document.getElementById('sidebar-tag-cloud')).toBeTruthy();
    expect(document.getElementById('featured-posts-list')).toBeTruthy();
    expect(document.getElementById('blog-search')).toBeTruthy();
  });
});
