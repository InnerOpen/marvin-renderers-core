# Renderer Package Skeleton

This is a minimal skeleton for a domain renderer package such as:

- `@inneropen/marvin-renderers-youtube`
- `@inneropen/marvin-renderers-shopify`
- `@inneropen/marvin-renderers-maps`

The renderer package should stay thin. It exports renderer components and a renderer package definition. The consuming site uses `@inneropen/marvin-sdk` to fetch entries, then passes entries to `EntryRenderer` from core.

## Package Export

```ts
// src/astro/index.ts
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
```

## Site Setup

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { marvinIntegration } from '@inneropen/marvin-renderers-core/astro/integration';
import { coreRendererPackage } from '@inneropen/marvin-renderers-core/astro';
import { createPackageRegistry } from '@inneropen/marvin-renderers-core/logic';
import { exampleRendererPackage } from '@inneropen/marvin-renderers-example/astro';

const renderers = createPackageRegistry([
  coreRendererPackage,
  exampleRendererPackage,
]);

export default defineConfig({
  integrations: [
    marvinIntegration({
      registry: renderers,
      apiUrl: process.env.MARVIN_API_URL,
      siteToken: process.env.MARVIN_SITE_CLIENT_TOKEN,
    }),
  ],
});
```

## Fetch And Render An Entry

```astro
---
import { createMarvinClient } from '@inneropen/marvin-sdk';
import { EntryRenderer } from '@inneropen/marvin-renderers-core/astro';

const client = createMarvinClient({
  apiUrl: import.meta.env.MARVIN_API_URL,
  siteClientToken: import.meta.env.MARVIN_SITE_CLIENT_TOKEN,
  workspaceSlug: import.meta.env.MARVIN_WORKSPACE_SLUG,
});

const entry = await client.entry('example-embed-entry');
---

{entry && <EntryRenderer entry={entry} />}
```

## Renderer Data Contract

`ExampleEmbedRenderer` reads data from the actual entry, not from the entry type:

```ts
const provider = extractField<string>(entry, 'provider') ?? 'example';
const embedId = extractField<string>(entry, 'embedId');
const title = extractField<string>(entry, 'title') ?? entry.title;
```

So entries rendered by `example-embed` should provide:

```json
{
  "data": {
    "provider": "example",
    "embedId": "shop-tour-001",
    "title": "Shop Tour"
  }
}
```

## Dynamic Routes

```astro
---
import { createMarvinClient } from '@inneropen/marvin-sdk';
import { EntryRenderer } from '@inneropen/marvin-renderers-core/astro';

const client = createMarvinClient({
  apiUrl: import.meta.env.MARVIN_API_URL,
  siteClientToken: import.meta.env.MARVIN_SITE_CLIENT_TOKEN,
  workspaceSlug: import.meta.env.MARVIN_WORKSPACE_SLUG,
});

export async function getStaticPaths() {
  const entries = await client.entries.list({ entryType: 'example-embed' });

  return entries.map((entry) => ({
    params: { slug: entry.slug },
  }));
}

const { slug } = Astro.params;
const entry = slug ? await client.entry(slug) : null;
---

{entry && <EntryRenderer entry={entry} />}
```

## Matching Marvin Entry Type

```json
{
  "slug": "video-embed",
  "name": "Video Embed",
  "isRendered": true,
  "rendering": {
    "renderer": "example-embed",
    "package": "@inneropen/marvin-renderers-example",
    "version": "^0.1.0",
    "config": {
      "allowFullscreen": true
    }
  }
}
```

The actual entry with this entry type carries the data the renderer reads:

```json
{
  "slug": "shop-tour-video",
  "title": "Shop Tour",
  "entryType": "video-embed",
  "entryTypeInfo": {
    "slug": "video-embed",
    "renderer": "example-embed",
    "package": "@inneropen/marvin-renderers-example",
    "version": "^0.1.0",
    "config": {
      "allowFullscreen": true
    },
    "publishable": true,
    "submittable": false,
    "routable": true
  },
  "summary": "A short tour of the workshop.",
  "data": {
    "provider": "example",
    "embedId": "shop-tour-001",
    "title": "Shop Tour"
  }
}
```

The `package` value does not load code dynamically. It is matched against packages the site has explicitly installed and registered.
