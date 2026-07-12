import type { RendererRegistry } from './types.js';

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
