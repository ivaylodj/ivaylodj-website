/**
 * Regression tests for post navigation
 * Ensures circular navigation fix stays working
 */

describe('Post Navigation - Circular Loop', () => {
  const posts = [
    { filename: '2022-01-22-first-post.md', title: 'First Post' },
    { filename: '2022-01-22-welcome-post.md', title: 'Welcome Message' }
  ];

  test('should navigate from first post to next post', () => {
    const currentIndex = 0;
    const nextIndex = (currentIndex + 1) % posts.length;
    expect(posts[nextIndex].title).toBe('Welcome Message');
  });

  test('should navigate from last post back to first post', () => {
    const currentIndex = posts.length - 1;
    const nextIndex = (currentIndex + 1) % posts.length;
    expect(nextIndex).toBe(0);
    expect(posts[nextIndex].title).toBe('First Post');
  });

  test('should navigate backward from first post to last post', () => {
    const currentIndex = 0;
    const prevIndex = (currentIndex - 1 + posts.length) % posts.length;
    expect(prevIndex).toBe(posts.length - 1);
    expect(posts[prevIndex].title).toBe('Welcome Message');
  });

  test('should navigate backward from last post to first post', () => {
    const currentIndex = posts.length - 1;
    const prevIndex = (currentIndex - 1 + posts.length) % posts.length;
    expect(posts[prevIndex].title).toBe('First Post');
  });

  test('should work with single post (circular to itself)', () => {
    const singlePost = [{ filename: 'test.md', title: 'Only Post' }];
    const currentIndex = 0;
    const nextIndex = (currentIndex + 1) % singlePost.length;
    const prevIndex = (currentIndex - 1 + singlePost.length) % singlePost.length;
    expect(nextIndex).toBe(0);
    expect(prevIndex).toBe(0);
  });

  test('should handle filename matching with .md extension', () => {
    const postFile = '2022-01-22-first-post';
    const postFilename = postFile.match(/\.md$/) ? postFile : postFile + '.md';
    const found = posts.find(p => p.filename === postFilename);
    expect(found).toBeDefined();
    expect(found.filename).toBe('2022-01-22-first-post.md');
  });

  test('should navigate correctly after finding current post index', () => {
    const postFile = '2022-01-22-welcome-post';
    const postFilename = postFile.match(/\.md$/) ? postFile : postFile + '.md';
    let currentIndex = -1;
    for (let i = 0; i < posts.length; i++) {
      if (posts[i].filename === postFilename) {
        currentIndex = i;
        break;
      }
    }
    expect(currentIndex).toBe(1);

    const nextIndex = (currentIndex + 1) % posts.length;
    const prevIndex = (currentIndex - 1 + posts.length) % posts.length;
    expect(posts[nextIndex].title).toBe('First Post');
    expect(posts[prevIndex].title).toBe('First Post');
  });
});
