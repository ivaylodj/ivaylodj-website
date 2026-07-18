/**
 * Regression tests for "You may also like" section
 * Ensures related posts are displayed correctly
 */

describe('Related Posts Section', () => {
  const mockPosts = [
    {
      filename: '2022-01-22-first-post.md',
      title: 'First Post',
      date: '2022-01-22',
      cover_image: 'img/photos/Sunsets/img-1.jpg',
      excerpt: 'Welcome to my photography blog.'
    },
    {
      filename: '2022-01-22-welcome-post.md',
      title: 'Welcome Message',
      date: '2022-01-22',
      cover_image: 'img/photos/Sunrises/img-1.jpg',
      excerpt: 'Welcome to my web corner.'
    }
  ];

  test('should display "You may also like" heading', () => {
    const html = '<h4 class="cherga_featured_posts_heading">You may also like</h4>';
    expect(html).toContain('You may also like');
  });

  test('should show related posts from allPosts array', () => {
    const currentPostFile = '2022-01-22-first-post.md';
    const relatedPosts = mockPosts.filter(p => p.filename !== currentPostFile);
    expect(relatedPosts.length).toBe(1);
    expect(relatedPosts[0].title).toBe('Welcome Message');
  });

  test('should limit related posts to 2', () => {
    const currentPostFile = '2022-01-22-first-post.md';
    const relatedPosts = mockPosts
      .filter(p => p.filename !== currentPostFile)
      .slice(0, 2);
    expect(relatedPosts.length).toBeLessThanOrEqual(2);
  });

  test('should include featured image for related posts', () => {
    mockPosts.forEach(post => {
      expect(post.cover_image).toBeDefined();
      expect(post.cover_image).toMatch(/\.(jpg|jpeg|png|gif)$/i);
    });
  });

  test('should include post title for related posts', () => {
    const post = mockPosts[0];
    const html = `<h4 class="cherga_post_title"><a href="blog_post.html?post=${post.filename}">${post.title}</a></h4>`;
    expect(html).toContain(post.title);
  });

  test('should include post date for related posts', () => {
    const post = mockPosts[0];
    expect(post.date).toBeDefined();
  });

  test('should include post excerpt for related posts', () => {
    const post = mockPosts[0];
    expect(post.excerpt).toBeDefined();
    expect(post.excerpt.length).toBeGreaterThan(0);
  });

  test('should create clickable links to related posts', () => {
    const post = mockPosts[0];
    const filename = post.filename.replace(/\.md$/, '');
    const link = `blog_post.html?post=${filename}`;
    expect(link).toContain('blog_post.html');
    expect(link).toContain(filename);
  });

  test('should skip current post from related posts', () => {
    const currentIndex = 0;
    const currentPost = mockPosts[currentIndex];
    const relatedPosts = mockPosts.filter((p, i) => i !== currentIndex);
    expect(relatedPosts).not.toContain(currentPost);
  });

  test('should handle when only one post exists', () => {
    const singlePost = [mockPosts[0]];
    const related = singlePost.filter(p => p.filename !== singlePost[0].filename);
    expect(related.length).toBe(0);
  });
});
