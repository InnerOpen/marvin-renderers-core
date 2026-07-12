import type { RendererRegistry } from './types';
import type { MissingRenderer, ValidationResult } from './validation-types';

interface EntryTypeWithRendering {
  slug: string;
  name: string;
  rendering?: {
    renderer?: string;
    package?: string;
    version?: string;
  };
}

function isRendererRegistry(value: unknown): value is RendererRegistry {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as RendererRegistry).has === 'function'
  );
}

export function validateRenderers(
  entryTypes: EntryTypeWithRendering[],
  registry: RendererRegistry | Record<string, unknown>,
  options?: { ignore?: string[] }
): ValidationResult {
  const ignore = new Set(options?.ignore ?? []);

  const withRenderer = entryTypes.filter(
    (et) => et.rendering?.renderer && !ignore.has(et.slug)
  );

  const hasRenderer = isRendererRegistry(registry)
    ? (name: string) => registry.has(name)
    : (name: string) => name in registry;

  const missing: MissingRenderer[] = [];

  for (const et of withRenderer) {
    const renderer = et.rendering!.renderer!;
    if (!hasRenderer(renderer)) {
      missing.push({
        entryTypeSlug: et.slug,
        entryTypeName: et.name,
        renderer,
        package: et.rendering!.package,
        version: et.rendering!.version,
      });
    }
  }

  return {
    total: withRenderer.length,
    covered: withRenderer.length - missing.length,
    missing,
  };
}
