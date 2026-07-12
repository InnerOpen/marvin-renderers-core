import { describe, it, expect } from 'vitest';
import { createRegistry } from '../src/logic/registry.js';

describe('createRegistry', () => {
  const registry = createRegistry({
    page: 'PageComponent',
    article: 'ArticleComponent',
    faq: 'FaqComponent',
  });

  it('gets a registered component by name', () => {
    expect(registry.get('page')).toBe('PageComponent');
    expect(registry.get('article')).toBe('ArticleComponent');
  });

  it('returns undefined for unregistered name', () => {
    expect(registry.get('unknown')).toBeUndefined();
  });

  it('checks if a name is registered', () => {
    expect(registry.has('page')).toBe(true);
    expect(registry.has('unknown')).toBe(false);
  });

  it('lists all registered names', () => {
    expect(registry.names()).toEqual(['page', 'article', 'faq']);
  });

  it('works with an empty map', () => {
    const empty = createRegistry({});
    expect(empty.names()).toEqual([]);
    expect(empty.has('anything')).toBe(false);
    expect(empty.get('anything')).toBeUndefined();
  });
});
