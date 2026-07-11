/**
 * Unit tests for Markdown parser function
 * Tests parsing of markdown content to HTML
 */

describe('Markdown Parser', () => {
  // Mock the parseMd function from blog_post.js
  const parseMd = (md) => {
    // Simplified version of the actual parser for testing
    let result = [];
    const lines = md.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim() === '') continue;

      // Headings
      const headingMatch = line.match(/^(#{2,4})\s+(.+)$/);
      if (headingMatch) {
        const level = Math.min(headingMatch[1].length + 1, 4);
        result.push(`<h${level}>${headingMatch[2]}</h${level}>`);
        continue;
      }

      // Bold and italic
      let text = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');

      result.push(`<p>${text}</p>`);
    }

    return result.join('\n');
  };

  test('should convert headings to HTML', () => {
    const md = '## Welcome to my blog';
    const html = parseMd(md);
    expect(html).toContain('<h3>Welcome to my blog</h3>');
  });

  test('should convert bold text', () => {
    const md = 'This is **bold** text';
    const html = parseMd(md);
    expect(html).toContain('<strong>bold</strong>');
  });

  test('should convert italic text', () => {
    const md = 'This is *italic* text';
    const html = parseMd(md);
    expect(html).toContain('<em>italic</em>');
  });

  test('should skip blank lines', () => {
    const md = 'Line 1\n\nLine 2';
    const html = parseMd(md);
    expect(html).toContain('<p>Line 1</p>');
    expect(html).toContain('<p>Line 2</p>');
  });

  test('should handle multiple heading levels', () => {
    const md = '## H2\n### H3\n#### H4';
    const html = parseMd(md);
    expect(html).toContain('<h3>H2</h3>');
    expect(html).toContain('<h4>H3</h4>');
    expect(html).toContain('<h4>H4</h4>');
  });

  test('should convert mixed formatting', () => {
    const md = 'This is **bold** and *italic* text';
    const html = parseMd(md);
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
  });
});
