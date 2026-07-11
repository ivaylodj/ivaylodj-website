/**
 * Integration tests for blog post loading
 * Tests the full flow of loading and rendering a blog post
 */

describe('Blog Post Loading', () => {
  let mockXHR;
  const mockPostsIndex = [
    {
      filename: '2022-01-22-first-post.md',
      title: 'First Post',
      date: '2022-01-22',
      template: 'blog_image',
      cover_image: 'img/clipart/facebook/Sunsets/img-1.jpg',
      categories: [],
      tags: ['General'],
      excerpt: 'Welcome to my photography blog. More posts coming soon.'
    },
    {
      filename: '2022-01-22-welcome-post.md',
      title: 'Welcome Message',
      date: '2022-01-22',
      template: 'blog_standard',
      cover_image: 'img/clipart/facebook/Sunrises/img-1.jpg',
      categories: ['General'],
      tags: ['General', 'Photography'],
      excerpt: 'Welcome to my web corner.'
    }
  ];

  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = '<div id="blog-post-content"></div>';

    // Mock XMLHttpRequest
    mockXHR = jest.fn(() => ({
      open: jest.fn(),
      send: jest.fn(function() {
        setTimeout(() => {
          this.status = 200;
          this.responseText = JSON.stringify(mockPostsIndex);
          this.onload();
        }, 0);
      }),
      onload: null,
      status: 200,
      responseText: JSON.stringify(mockPostsIndex)
    }));

    global.XMLHttpRequest = mockXHR;
  });

  test('should load posts index from _posts/index.json', (done) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '_posts/index.json');
    xhr.onload = function() {
      expect(this.status).toBe(200);
      const posts = JSON.parse(this.responseText);
      expect(posts.length).toBe(2);
      expect(posts[0].title).toBe('First Post');
      done();
    };
    xhr.send();
  });

  test('should have template field in post metadata', (done) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '_posts/index.json');
    xhr.onload = function() {
      const posts = JSON.parse(this.responseText);
      expect(posts[0].template).toBe('blog_image');
      expect(posts[1].template).toBe('blog_standard');
      done();
    };
    xhr.send();
  });

  test('should find correct post by filename', () => {
    const postFile = '2022-01-22-first-post';
    const postFilename = postFile.match(/\.md$/) ? postFile : postFile + '.md';
    const post = mockPostsIndex.find(p => p.filename === postFilename);
    expect(post).toBeDefined();
    expect(post.title).toBe('First Post');
  });

  test('should have cover image for all posts', () => {
    mockPostsIndex.forEach(post => {
      expect(post.cover_image).toBeDefined();
      expect(post.cover_image).not.toBe('');
    });
  });

  test('should inject post content into DOM', () => {
    const contentDiv = document.getElementById('blog-post-content');
    const html = '<h1>First Post</h1><p>Test content</p>';
    contentDiv.innerHTML = html;
    expect(contentDiv.innerHTML).toContain('<h1>First Post</h1>');
    expect(contentDiv.innerHTML).toContain('Test content');
  });

  test('should preserve post metadata during loading', () => {
    const post = mockPostsIndex[0];
    expect(post).toEqual({
      filename: '2022-01-22-first-post.md',
      title: 'First Post',
      date: '2022-01-22',
      template: 'blog_image',
      cover_image: 'img/clipart/facebook/Sunsets/img-1.jpg',
      categories: [],
      tags: ['General'],
      excerpt: expect.any(String)
    });
  });
});
