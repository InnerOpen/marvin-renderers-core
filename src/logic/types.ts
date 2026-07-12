import type { MarvinEntry } from '@inneropen/marvin-sdk';

export type CoreRendererName = 'page' | 'article' | 'faq' | 'navigation';

export interface RendererProps {
  entry: MarvinEntry;
  config?: Record<string, unknown>;
  class?: string;
}

export interface RendererRegistry<T = unknown> {
  get(name: string): T | undefined;
  has(name: string): boolean;
  names(): string[];
}
