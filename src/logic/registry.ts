import type {
  RendererPackage,
  RendererPackageOptions,
  RendererPackageRegistry,
  RendererRegistry,
} from './types.js';

export function createRegistry<T>(
  map: Record<string, T>,
): RendererRegistry<T> {
  return {
    get(name: string): T | undefined {
      return map[name];
    },
    has(name: string): boolean {
      return name in map;
    },
    names(): string[] {
      return Object.keys(map);
    },
  };
}

export function createRendererPackage<T>(
  options: RendererPackageOptions<T>,
): RendererPackage<T> {
  return {
    packageName: options.packageName,
    version: options.version,
    registry: createRegistry(options.renderers),
  };
}

export function createPackageRegistry<T>(
  packages: RendererPackage<T>[],
): RendererPackageRegistry<T> {
  const byPackage = new Map(packages.map((item) => [item.packageName, item]));

  function getPackage(packageName: string): RendererPackage<T> | undefined {
    return byPackage.get(packageName);
  }

  function findLocalRenderer(name: string): T | undefined {
    for (const item of packages) {
      const renderer = item.registry.get(name);
      if (renderer) return renderer;
    }
    return undefined;
  }

  return {
    get(name: string, packageName?: string | null): T | undefined {
      if (packageName) {
        return getPackage(packageName)?.registry.get(name);
      }
      return findLocalRenderer(name);
    },
    has(name: string, packageName?: string | null): boolean {
      return Boolean(this.get(name, packageName));
    },
    names(): string[] {
      return packages.flatMap((item) => item.registry.names());
    },
    packages(): RendererPackage<T>[] {
      return packages;
    },
    getPackage,
  };
}
