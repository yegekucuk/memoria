import { formatDuration } from '../format';

describe('formatDuration', () => {
  it('should format whole hours correctly', () => {
    expect(formatDuration(1)).toBe('1 hours 0 minutes');
    expect(formatDuration(5)).toBe('5 hours 0 minutes');
  });

  it('should format fractional hours correctly', () => {
    expect(formatDuration(1.5)).toBe('1 hours 30 minutes');
    expect(formatDuration(0.5)).toBe('0 hours 30 minutes');
    expect(formatDuration(2.25)).toBe('2 hours 15 minutes');
  });

  it('should format 0 hours correctly', () => {
    expect(formatDuration(0)).toBe('0 hours 0 minutes');
  });

  it('should handle small decimals by rounding to nearest minute', () => {
    // 1 minute = 1/60 = 0.01666...
    expect(formatDuration(0.0166667)).toBe('0 hours 1 minutes');
    // Less than half a minute should round down to 0
    expect(formatDuration(0.001)).toBe('0 hours 0 minutes');
  });

  it('should handle large numbers', () => {
     expect(formatDuration(24)).toBe('24 hours 0 minutes');
     expect(formatDuration(25.5)).toBe('25 hours 30 minutes');
  });
});
