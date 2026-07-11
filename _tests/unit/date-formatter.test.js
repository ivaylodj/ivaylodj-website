/**
 * Unit tests for date formatting
 * Tests date parsing and formatting to readable strings
 */

describe('Date Formatter', () => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  test('should format ISO date string correctly', () => {
    const result = formatDate('2022-01-22');
    expect(result).toBe('22 January 2022');
  });

  test('should handle different year formats', () => {
    const result = formatDate('2026-07-11');
    expect(result).toContain('2026');
    expect(result).toContain('July');
    expect(result).toContain('11');
  });

  test('should handle month variations', () => {
    const january = formatDate('2022-01-15');
    const december = formatDate('2022-12-25');
    expect(january).toContain('January');
    expect(december).toContain('December');
  });

  test('should preserve day of month', () => {
    const result = formatDate('2022-06-05');
    expect(result).toContain('5');
  });

  test('should handle leap year dates', () => {
    const result = formatDate('2024-02-29');
    expect(result).toContain('February');
    expect(result).toContain('29');
  });
});
