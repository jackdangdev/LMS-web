import { describe, expect, it } from 'vitest';
import { clamp, currency, fullDate, initials, minutesToHours, pluralise } from '../lib/format';

describe('format helpers', () => {
  it('renders zero as "Free" and formats paid prices as USD', () => {
    expect(currency(0)).toBe('Free');
    expect(currency('0')).toBe('Free');
    expect(currency(149)).toBe('$149');
  });

  it('derives two-letter initials from a display name', () => {
    expect(initials('Lena Osei')).toBe('LO');
    expect(initials('Kwame Boateng Mensah')).toBe('KB');
    expect(initials('')).toBe('EN');
  });

  it('converts minutes into a compact duration label', () => {
    expect(minutesToHours(45)).toBe('45 min');
    expect(minutesToHours(60)).toBe('1h');
    expect(minutesToHours(95)).toBe('1h 35m');
    expect(minutesToHours()).toBe('0 min');
  });

  it('pluralises counts correctly', () => {
    expect(pluralise(1, 'lesson')).toBe('1 lesson');
    expect(pluralise(4, 'lesson')).toBe('4 lessons');
  });

  it('clamps values into the requested range', () => {
    expect(clamp(-10, 0, 100)).toBe(0);
    expect(clamp(140, 0, 100)).toBe(100);
    expect(clamp(42, 0, 100)).toBe(42);
  });

  it('formats an ISO date and falls back to a dash', () => {
    expect(fullDate('2026-03-04T10:00:00.000Z')).toMatch(/Mar (3|4), 2026/);
    expect(fullDate(null)).toBe('—');
  });
});
