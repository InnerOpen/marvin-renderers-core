import PageRenderer from './renderers/PageRenderer.astro';
import ArticleRenderer from './renderers/ArticleRenderer.astro';
import FaqRenderer from './renderers/FaqRenderer.astro';
import NavigationRenderer from './renderers/NavigationRenderer.astro';
import { createRendererPackage, createRegistry } from '../logic/registry.js';
import type { CoreRendererName } from '../logic/types.js';
import packageJson from '../../package.json';

export { PageRenderer, ArticleRenderer, FaqRenderer, NavigationRenderer };

const rendererMap: Record<CoreRendererName, typeof PageRenderer> = {
  page: PageRenderer,
  article: ArticleRenderer,
  faq: FaqRenderer,
  navigation: NavigationRenderer,
};

export const astroRegistry = createRegistry(rendererMap);

export const coreRendererPackage = createRendererPackage({
  packageName: packageJson.name,
  version: packageJson.version,
  renderers: rendererMap,
});

export function getRenderer(name: string) {
  return astroRegistry.get(name);
}
