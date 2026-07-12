import type { MarvinEntry } from '@inneropen/marvin-sdk';

export interface EntryTypeInfo {
  slug: string;
  renderer?: string;
  package?: string;
  version?: string;
  config?: Record<string, unknown>;
  publishable?: boolean;
  submittable?: boolean;
  routable?: boolean;
}

export interface RendererEntry extends MarvinEntry {
  entryTypeInfo?: EntryTypeInfo;
}

export type CoreRendererName = 'page' | 'article' | 'faq' | 'navigation';

export interface RendererProps {
  entry: RendererEntry;
  config?: Record<string, unknown>;
  class?: string;
}

export interface RendererRegistry<T = unknown> {
  get(name: string): T | undefined;
  has(name: string): boolean;
  names(): string[];
}
