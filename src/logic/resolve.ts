import type { MarvinAsset } from '@inneropen/marvin-sdk';
import type { RendererEntry } from './types.js';
import { debug } from './debug.js';

const DEFAULT_RENDERER = 'page';

export function resolveRendererName(entry: RendererEntry): string {
  const name = entry.entryTypeInfo?.renderer ?? DEFAULT_RENDERER;
  debug('resolveRendererName', { slug: entry.slug, renderer: name });
  return name;
}

export function resolveRendererConfig(
  entry: RendererEntry,
  overrides?: Record<string, unknown>,
): Record<string, unknown> {
  const base = entry.entryTypeInfo?.config ?? {};
  const merged = overrides ? { ...base, ...overrides } : base;
  debug('resolveRendererConfig', { slug: entry.slug, config: merged });
  return merged;
}

export function extractBody(entry: RendererEntry): string | undefined {
  const data = entry.data ?? entry.dataJson ?? {};
  const body = data.body;
  if (typeof body === 'string') return body;
  return entry.contentMarkdown;
}

export function extractField<T = unknown>(
  entry: RendererEntry,
  key: string,
): T | undefined {
  return (entry.data?.[key] ?? entry.dataJson?.[key]) as T | undefined;
}

export function getFeaturedAsset(
  entry: RendererEntry,
): MarvinAsset | undefined {
  const featuredAsset = normalizeEntryAsset(entry.featuredAsset);
  if (featuredAsset?.publicUrl) {
    debug('getFeaturedAsset', { slug: entry.slug, source: 'featuredAsset', url: featuredAsset.publicUrl });
    return featuredAsset as unknown as MarvinAsset;
  }

  const assets = entry.assets;
  if (!assets?.length) return undefined;

  const featured = assets.find(
    (a) => {
      const value = a as unknown as Record<string, unknown>;
      const role = value.role ?? (value.metadata as Record<string, unknown> | undefined)?.role;
      return role === 'featured' || role === 'hero';
    },
  );
  const result = normalizeEntryAsset(featured ?? assets[0]) as unknown as MarvinAsset | undefined;
  debug('getFeaturedAsset', { slug: entry.slug, source: featured ? 'role-match' : 'first-asset', url: result?.publicUrl });
  return result;
}

export function isRoutable(entry: RendererEntry): boolean {
  return entry.entryTypeInfo?.routable !== false;
}

function normalizeEntryAsset(asset: unknown): Record<string, unknown> | undefined {
  if (!asset || typeof asset !== 'object') return undefined;

  const value = asset as Record<string, unknown>;
  const nestedAsset = value.asset as Record<string, unknown> | undefined;
  if (!nestedAsset) return value;

  return {
    ...nestedAsset,
    role: value.role,
    position: value.position,
    metadata: value.metadata ?? value.metadataJson,
    metadataJson: value.metadataJson ?? nestedAsset.metadataJson,
  };
}
