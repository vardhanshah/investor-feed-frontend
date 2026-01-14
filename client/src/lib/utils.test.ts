import { describe, it, expect } from 'vitest';
import { encodeFilterCriteria, decodeFilterCriteria } from './utils';

describe('encodeFilterCriteria / decodeFilterCriteria', () => {
  it('should encode and decode simple ASCII object', () => {
    const original = { name: 'Test', value: 123 };
    const encoded = encodeFilterCriteria(original);
    const decoded = decodeFilterCriteria(encoded);
    expect(decoded).toEqual(original);
  });

  it('should encode and decode object with Unicode characters', () => {
    const original = {
      company: 'टाटा Motors',
      sector: 'Automobile & Ancillaries',
      description: '日本語テスト'
    };
    const encoded = encodeFilterCriteria(original);
    const decoded = decodeFilterCriteria(encoded);
    expect(decoded).toEqual(original);
  });

  it('should encode and decode object with special characters', () => {
    const original = {
      name: 'Café & Résumé Corp.',
      emoji: '🚀💰📈',
      symbols: '©®™'
    };
    const encoded = encodeFilterCriteria(original);
    const decoded = decodeFilterCriteria(encoded);
    expect(decoded).toEqual(original);
  });

  it('should encode and decode nested objects', () => {
    const original = {
      filter_criteria: {
        filters: [
          { field: 'sector', operator: 'in', value: ['金融', 'Technology'] },
          { field: 'mcap', operator: 'gte', value: 1000 }
        ],
        profile_ids: [1, 2, 3]
      },
      limit: 20,
      offset: 0
    };
    const encoded = encodeFilterCriteria(original);
    const decoded = decodeFilterCriteria(encoded);
    expect(decoded).toEqual(original);
  });

  it('should encode and decode arrays', () => {
    const original = { items: ['item1', 'आइटम2', 'アイテム3'] };
    const encoded = encodeFilterCriteria(original);
    const decoded = decodeFilterCriteria(encoded);
    expect(decoded).toEqual(original);
  });

  it('should produce URL-safe Base64 (no +, /, or = characters)', () => {
    const original = { data: 'test+data/with=special' };
    const encoded = encodeFilterCriteria(original);
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it('should handle empty object', () => {
    const original = {};
    const encoded = encodeFilterCriteria(original);
    const decoded = decodeFilterCriteria(encoded);
    expect(decoded).toEqual(original);
  });

  it('should handle large objects without stack overflow', () => {
    // Create a large object with many entries
    const original: Record<string, string> = {};
    for (let i = 0; i < 1000; i++) {
      original[`key${i}`] = `value${i}_टेस्ट`;
    }
    const encoded = encodeFilterCriteria(original);
    const decoded = decodeFilterCriteria(encoded);
    expect(decoded).toEqual(original);
  });

  it('should return null for invalid encoded string', () => {
    expect(decodeFilterCriteria('invalid!!!')).toBeNull();
    expect(decodeFilterCriteria('')).toBeNull();
  });
});
