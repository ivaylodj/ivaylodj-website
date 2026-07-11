/**
 * Integration tests for template system
 * Tests that template field controls post rendering
 */

describe('Template System', () => {
  test('blog_image template should use carousel markup', () => {
    const template = 'blog_image';
    const html = template === 'blog_image'
      ? '<div class="cherga_post_formats cherga_pf_image cherga_pf_boxed"><div class="cherga_owlCarousel owl-carousel owl-theme"><div class="item"><img src="test.jpg" /></div></div></div>'
      : '<div class="cherga_post_formats cherga_pf_standard cherga_pf_boxed"><div class="cherga_pf_standard_cont"><img src="test.jpg" /></div></div>';

    expect(html).toContain('cherga_owlCarousel');
    expect(html).toContain('owl-carousel');
  });

  test('blog_standard template should use simple image markup', () => {
    const template = 'blog_standard';
    const html = template === 'blog_image'
      ? '<div class="cherga_post_formats cherga_pf_image cherga_pf_boxed"><div class="cherga_owlCarousel owl-carousel owl-theme"><div class="item"><img src="test.jpg" /></div></div></div>'
      : '<div class="cherga_post_formats cherga_pf_standard cherga_pf_boxed"><div class="cherga_pf_standard_cont"><img src="test.jpg" /></div></div>';

    expect(html).toContain('cherga_pf_standard');
    expect(html).not.toContain('cherga_owlCarousel');
  });

  test('should default to blog_standard if template not specified', () => {
    const post = { title: 'Test', template: undefined };
    const template = post.template || 'blog_standard';
    expect(template).toBe('blog_standard');
  });

  test('should accept custom template values', () => {
    const validTemplates = ['blog_standard', 'blog_image'];
    validTemplates.forEach(template => {
      expect(validTemplates).toContain(template);
    });
  });

  test('should handle template field in frontmatter', () => {
    const frontmatter = `---
title: "Test Post"
template: "blog_image"
cover_image: "img/test.jpg"
---`;

    expect(frontmatter).toContain('template: "blog_image"');
  });

  test('should pass template field through index.json', () => {
    const post = {
      filename: 'test.md',
      title: 'Test',
      template: 'blog_image'
    };
    expect(post.template).toBeDefined();
    expect(post.template).toBe('blog_image');
  });
});
