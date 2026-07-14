import { describe, it, expect } from 'vitest';
import type { RendererEntry } from '../src/logic/types.js';
import {
  resolveRendererName,
  resolveRendererRequirement,
  resolveRendererConfig,
  extractBody,
  extractField,
  getFeaturedAsset,
  isRoutable,
  shouldRenderEntry,
} from '../src/logic/resolve.js';

function makeEntry(overrides: Partial<RendererEntry> = {}): RendererEntry {
  return {
    id: '1',
    title: 'Test Entry',
    slug: 'test-entry',
    status: 'published',
    entryTypeId: 'et-1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('resolveRendererName', () => {
  it('returns renderer from entryTypeInfo', () => {
    const entry = makeEntry({
      entryTypeInfo: { slug: 'article', renderer: 'article' },
    });
    expect(resolveRendererName(entry)).toBe('article');
  });

  it('falls back to "page" when no entryTypeInfo', () => {
    expect(resolveRendererName(makeEntry())).toBe('page');
  });

  it('falls back to "page" when renderer is undefined', () => {
    const entry = makeEntry({
      entryTypeInfo: { slug: 'custom' },
    });
    expect(resolveRendererName(entry)).toBe('page');
  });
});

describe('resolveRendererRequirement', () => {
  it('returns the renderer requirement from entryTypeInfo', () => {
    const entry = makeEntry({
      entryTypeInfo: { slug: 'faq', renderer: 'faq', package: '@inneropen/marvin-renderers-core', version: '^1.0.0', config: { layout: 'stacked' } },
    });

    expect(resolveRendererRequirement(entry)).toEqual({
      key: 'faq',
      packageName: '@inneropen/marvin-renderers-core',
      versionRange: '^1.0.0',
      config: { layout: 'stacked' },
    });
  });
});

describe('resolveRendererConfig', () => {
  it('returns entryTypeInfo config when no overrides', () => {
    const entry = makeEntry({
      entryTypeInfo: { slug: 'page', config: { layout: 'wide' } },
    });
    expect(resolveRendererConfig(entry)).toEqual({ layout: 'wide' });
  });

  it('returns empty object when no config and no overrides', () => {
    expect(resolveRendererConfig(makeEntry())).toEqual({});
  });

  it('merges overrides on top of entry config', () => {
    const entry = makeEntry({
      entryTypeInfo: { slug: 'page', config: { layout: 'wide', sidebar: true } },
    });
    const result = resolveRendererConfig(entry, { layout: 'narrow', toc: true });
    expect(result).toEqual({ layout: 'narrow', sidebar: true, toc: true });
  });
});

describe('extractBody', () => {
  it('returns body from dataJson', () => {
    const entry = makeEntry({ dataJson: { body: '<p>Hello</p>' } });
    expect(extractBody(entry)).toBe('<p>Hello</p>');
  });

  it('falls back to contentMarkdown', () => {
    const entry = makeEntry({ contentMarkdown: '# Hello' });
    expect(extractBody(entry)).toBe('# Hello');
  });

  it('prefers dataJson.body over contentMarkdown', () => {
    const entry = makeEntry({
      dataJson: { body: '<p>From data</p>' },
      contentMarkdown: '# From markdown',
    });
    expect(extractBody(entry)).toBe('<p>From data</p>');
  });

  it('returns undefined when neither exists', () => {
    expect(extractBody(makeEntry())).toBeUndefined();
  });

  it('falls back to contentMarkdown when body is not a string', () => {
    const entry = makeEntry({
      dataJson: { body: 42 },
      contentMarkdown: '# Fallback',
    });
    expect(extractBody(entry)).toBe('# Fallback');
  });
});

describe('extractField', () => {
  it('extracts a typed field from dataJson', () => {
    const entry = makeEntry({ dataJson: { question: 'Why?' } });
    expect(extractField<string>(entry, 'question')).toBe('Why?');
  });

  it('returns undefined for missing field', () => {
    const entry = makeEntry({ dataJson: {} });
    expect(extractField(entry, 'missing')).toBeUndefined();
  });

  it('returns undefined when no dataJson', () => {
    expect(extractField(makeEntry(), 'anything')).toBeUndefined();
  });
});

describe('getFeaturedAsset', () => {
  const imgAsset = {
    id: 'a1',
    slug: 'photo',
    name: 'Photo',
    originalFilename: 'photo.jpg',
    filename: 'photo.jpg',
    extension: 'jpg',
    mimeType: 'image/jpeg',
    assetType: 'image' as const,
    fileSize: 1024,
    checksum: 'abc',
    storageProvider: 's3',
    storageKey: 'photos/photo.jpg',
    publicUrl: 'https://cdn.example.com/photo.jpg',
    uploadedBy: 'user-1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  it('returns asset with role "featured"', () => {
    const featured = { ...imgAsset, id: 'a2', metadata: { role: 'featured' } };
    const entry = makeEntry({ assets: [imgAsset, featured] });
    expect(getFeaturedAsset(entry)?.id).toBe('a2');
  });

  it('returns asset with role "hero"', () => {
    const hero = { ...imgAsset, id: 'a3', metadata: { role: 'hero' } };
    const entry = makeEntry({ assets: [imgAsset, hero] });
    expect(getFeaturedAsset(entry)?.id).toBe('a3');
  });

  it('falls back to first asset when no role matches', () => {
    const entry = makeEntry({ assets: [imgAsset] });
    expect(getFeaturedAsset(entry)?.id).toBe('a1');
  });

  it('returns undefined when no assets', () => {
    expect(getFeaturedAsset(makeEntry())).toBeUndefined();
    expect(getFeaturedAsset(makeEntry({ assets: [] }))).toBeUndefined();
  });
});

describe('isRoutable', () => {
  it('returns true by default', () => {
    expect(isRoutable(makeEntry())).toBe(true);
  });

  it('returns true when routable is true', () => {
    const entry = makeEntry({
      entryTypeInfo: { slug: 'page', routable: true },
    });
    expect(isRoutable(entry)).toBe(true);
  });

  it('returns false when routable is false', () => {
    const entry = makeEntry({
      entryTypeInfo: { slug: 'nav', routable: false },
    });
    expect(isRoutable(entry)).toBe(false);
  });
});

describe('shouldRenderEntry', () => {
  it('returns false when the renderer-specific flag is false', () => {
    const entry = makeEntry({ dataJson: { faq: false } });
    expect(shouldRenderEntry(entry, 'faq')).toBe(false);
  });

  it('returns false when a generic enabled flag is false', () => {
    const entry = makeEntry({ dataJson: { enabled: false } });
    expect(shouldRenderEntry(entry, 'faq')).toBe(false);
  });

  it('returns true by default when no visibility flag is present', () => {
    expect(shouldRenderEntry(makeEntry(), 'faq')).toBe(true);
  });
});
