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
  const body = entry.dataJson?.body;
  if (typeof body === 'string') return body;
  return entry.contentMarkdown;
}

export function extractField<T = unknown>(
  entry: RendererEntry,
  key: string,
): T | undefined {
  return entry.dataJson?.[key] as T | undefined;
}

export function getFeaturedAsset(
  entry: RendererEntry,
): MarvinAsset | undefined {
  const assets = entry.assets;
  if (!assets?.length) return undefined;

  const featured = assets.find(
    (a) => {
      const role = a.metadata?.role;
      return role === 'featured' || role === 'hero';
    },
  );
  return featured ?? assets[0];
}

export function isRoutable(entry: RendererEntry): boolean {
  return entry.entryTypeInfo?.routable !== false;
}
