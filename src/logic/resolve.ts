import type { MarvinAsset } from '@inneropen/marvin-sdk';
import type { RendererEntry } from './types.js';

const DEFAULT_RENDERER = 'page';

export function resolveRendererName(entry: RendererEntry): string {
  return entry.entryTypeInfo?.renderer ?? DEFAULT_RENDERER;
}

export function resolveRendererConfig(
  entry: RendererEntry,
  overrides?: Record<string, unknown>,
): Record<string, unknown> {
  const base = entry.entryTypeInfo?.config ?? {};
  if (!overrides) return base;
  return { ...base, ...overrides };
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
  if (featuredAsset?.publicUrl) return featuredAsset as unknown as MarvinAsset;

  const assets = entry.assets;
  if (!assets?.length) return undefined;

  const featured = assets.find(
    (a) => {
      const value = a as unknown as Record<string, unknown>;
      const role = value.role ?? (value.metadata as Record<string, unknown> | undefined)?.role;
      return role === 'featured' || role === 'hero';
    },
  );
  return normalizeEntryAsset(featured ?? assets[0]) as unknown as MarvinAsset | undefined;
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
