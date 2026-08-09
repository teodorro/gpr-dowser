import { describe, expect, it } from 'vitest';
import { getRound } from './get-round';

describe('getRound', () => {
  it('rounds to the given number of digits after the dot', () => {
    expect(getRound(1.23456, 3, false)).toBe('1.235');
    expect(getRound(1.2, 3, false)).toBe('1.2');
    expect(getRound(1.999, 2, false)).toBe('2');
  });

  it('returns an integer string when afterDot is 0', () => {
    expect(getRound(12.6, 0, false)).toBe('13');
    expect(getRound(12.4, 0, false)).toBe('12');
  });

  it('does not insert spaces when division is false', () => {
    expect(getRound(12345678.9, 1, false)).toBe('12345678.9');
  });

  it('inserts spaces as thousands separators when division is true', () => {
    expect(getRound(12345678.9, 1, true)).toBe('12 345 678.9');
    expect(getRound(1234, 0, true)).toBe('1 234');
    expect(getRound(12, 0, true)).toBe('12');
  });

  it('uses the provided dot as the decimal separator', () => {
    expect(getRound(12.34, 2, false, 'en', ',')).toBe('12,34');
    expect(getRound(1234.5, 1, true, 'en', ',')).toBe('1 234,5');
  });

  it('uses the default decimal separator when dot is undefined', () => {
    expect(getRound(12.34, 2, false)).toBe('12.34');
    expect(getRound(12.34, 2, false, 'en', undefined)).toBe('12.34');
  });

  it('preserves the sign for negative numbers', () => {
    expect(getRound(-1234.56, 2, false)).toBe('-1234.56');
    expect(getRound(-1234.56, 2, true)).toBe('-1 234.56');
    expect(getRound(-1234.56, 2, true, 'en', ',')).toBe('-1 234,56');
  });

  it('pads fractional digits that round with leading zeros', () => {
    expect(getRound(1.005, 3, false)).toBe('1.005');
    expect(getRound(1.004, 3, false)).toBe('1.004');
  });

  it('returns Infinity in English and Russian', () => {
    expect(getRound(Infinity, 2, true, 'en')).toBe('Infinity');
    expect(getRound(Infinity, 2, true, 'ru')).toBe('Бесконечность');
  });

  it('returns negative Infinity with a minus sign', () => {
    expect(getRound(-Infinity, 2, true, 'en')).toBe('-Infinity');
    expect(getRound(-Infinity, 2, true, 'ru')).toBe('-Бесконечность');
  });

  it('returns NaN for NaN values', () => {
    expect(getRound(NaN)).toBe('NaN');
  });
});
