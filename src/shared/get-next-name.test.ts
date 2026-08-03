import { describe, expect, it } from 'vitest';
import { getNextName } from './get-next-name';

describe('getNextName', () => {
  it('returns the name when it does not exist', () => {
    expect(getNextName('scan', ['scan (1)', 'other'])).toBe('scan');
  });

  it('returns the first numbered name when the name exists', () => {
    expect(getNextName('scan', ['scan'])).toBe('scan (1)');
  });

  it('returns the minimal available numbered name', () => {
    expect(getNextName('scan', ['scan', 'scan (1)', 'scan (3)'])).toBe(
      'scan (2)',
    );
  });
});
