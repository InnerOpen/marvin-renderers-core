import type { MarvinEntry } from '@inneropen/marvin-sdk';

export interface EntryTypeInfo {
  slug: string;
  renderer?: string | null;
  package?: string | null;
  version?: string | null;
  config?: Record<string, unknown> | null;
  publishable: boolean;
  submittable: boolean;
  routable: boolean;
}

export interface RendererEntry extends MarvinEntry {
  data?: Record<string, unknown> | null;
  dataJson?: Record<string, unknown>;
  contentMarkdown?: string;
  featuredAsset?: unknown;
  entryTypeInfo?: EntryTypeInfo | null;
}

export type CoreRendererName = 'page' | 'article' | 'faq' | 'navigation';

export interface RendererProps {
  entry: RendererEntry;
  config?: Record<string, unknown>;
  class?: string;
}

export interface RendererRequirement {
  key: string;
  packageName?: string;
  versionRange?: string;
  config: Record<string, unknown>;
}

export interface RendererDefinition<T = unknown> {
  key: string;
  component: T;
  defaultConfig?: Record<string, unknown>;
  description?: string;
}

export interface RendererRegistry<T = unknown> {
  get(name: string, packageName?: string | null): T | undefined;
  has(name: string, packageName?: string | null): boolean;
  names(): string[];
  use?(packageDefinition: RendererPackage<T>): RendererRegistry<T>;
  register?(definition: RendererDefinition<T>): RendererRegistry<T>;
  override?(overrides: Record<string, T>): RendererRegistry<T>;
}

export interface RendererPackage<T = unknown> {
  packageName: string;
  version: string;
  registry: RendererRegistry<T>;
}

export interface RendererPackageOptions<T = unknown> {
  packageName: string;
  version: string;
  renderers: Record<string, T>;
}

export interface RendererPackageRegistry<T = unknown> extends RendererRegistry<T> {
  packages(): RendererPackage<T>[];
  getPackage(packageName: string): RendererPackage<T> | undefined;
}
