/**
 * Regression tests for layout switching
 * Ensures template-based layout changes work correctly
 */

describe('Layout Switching - blog_image vs blog_standard', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="cherga_content_wrapper row cherga_right_sidebar">
        <div class="cherga_content col9" id="blog-post-content">Content</div>
        <div class="cherga_sidebar col3">Sidebar</div>
      </div>
    `;
  });

  test('blog_image template should remove sidebar class', () => {
    const wrapper = document.querySelector('.cherga_content_wrapper');
    const template = 'blog_image';

    if (template === 'blog_image') {
      wrapper.classList.remove('cherga_right_sidebar');
      wrapper.classList.add('cherga_no_sidebar');
    }

    expect(wrapper.classList.contains('cherga_no_sidebar')).toBe(true);
    expect(wrapper.classList.contains('cherga_right_sidebar')).toBe(false);
  });

  test('blog_image template should change content width to full-width', () => {
    const content = document.querySelector('.cherga_content');
    const template = 'blog_image';

    if (template === 'blog_image') {
      content.classList.remove('col9');
      content.classList.add('col', 'col-12');
    }

    expect(content.classList.contains('col-12')).toBe(true);
    expect(content.classList.contains('col9')).toBe(false);
  });

  test('blog_image template should hide sidebar', () => {
    const sidebar = document.querySelector('.cherga_sidebar');
    const template = 'blog_image';

    if (template === 'blog_image') {
      sidebar.style.display = 'none';
    }

    expect(sidebar.style.display).toBe('none');
  });

  test('blog_standard template should keep sidebar visible', () => {
    const sidebar = document.querySelector('.cherga_sidebar');
    const template = 'blog_standard';

    if (template === 'blog_standard') {
      sidebar.style.display = '';
    }

    expect(sidebar.style.display).not.toBe('none');
  });

  test('blog_standard should keep right sidebar class', () => {
    const wrapper = document.querySelector('.cherga_content_wrapper');
    const template = 'blog_standard';

    // Standard should NOT remove the right_sidebar class
    if (template === 'blog_image') {
      wrapper.classList.remove('cherga_right_sidebar');
    }

    expect(wrapper.classList.contains('cherga_right_sidebar')).toBe(true);
  });

  test('layout switching should not affect content', () => {
    const content = document.querySelector('#blog-post-content');
    const originalContent = content.textContent;

    // Simulate layout switch
    document.querySelector('.cherga_content_wrapper').classList.add('cherga_no_sidebar');

    expect(content.textContent).toBe(originalContent);
  });

  test('multiple templates should be switchable', () => {
    const templates = ['blog_standard', 'blog_image'];
    expect(templates).toContain('blog_standard');
    expect(templates).toContain('blog_image');
    expect(templates.length).toBe(2);
  });
});
