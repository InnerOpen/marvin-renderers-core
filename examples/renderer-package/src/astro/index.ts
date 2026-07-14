import { createRendererPackage } from '@inneropen/marvin-renderers-core/logic';
import packageJson from '../../../package.json';
import ExampleEmbedRenderer from './renderers/ExampleEmbedRenderer.astro';

export const exampleRendererPackage = createRendererPackage({
  packageName: packageJson.name,
  version: packageJson.version,
  renderers: {
    'example-embed': ExampleEmbedRenderer,
  },
});

export { ExampleEmbedRenderer };
