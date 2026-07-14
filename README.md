# @inneropen/marvin-renderers-core

Core renderer components for [Marvin CMS](https://github.com/inneropen/marvin). Provides unstyled, semantic Astro components for rendering system entry types, plus framework-agnostic logic helpers.

## Install

```bash
npm install @inneropen/marvin-renderers-core
```

Peer dependencies: `astro` (^4, ^5, ^6, or ^7), `@inneropen/marvin-sdk` (^2).

## Astro Integration (Build-Time Validation)

The package includes an Astro integration that validates your renderer registry against the workspace's entry types at build time. It uses the SDK's `createMarvinClient` to fetch entry types via the Publishing API, filters to those with `isRendered: true`, and checks that each required renderer exists in your registry.

```js
// astro.config.mjs
import { marvinIntegration } from '@inneropen/marvin-renderers-core/astro';
import { astroRegistry } from '@inneropen/marvin-renderers-core/astro';

export default defineConfig({
  integrations: [
    marvinIntegration({ registry: astroRegistry }),
  ],
});
```

**Environment variables:**

```env
MARVIN_API_URL=http://localhost:8080
MARVIN_SITE_CLIENT_TOKEN=your-site-client-token
MARVIN_WORKSPACE_SLUG=your-workspace
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `registry` | `RendererRegistry` | required | Your renderer registry to validate against |
| `apiUrl` | `string` | `MARVIN_API_URL` env | Marvin API URL |
| `siteToken` | `string` | `MARVIN_SITE_CLIENT_TOKEN` env | Site client token |
| `strict` | `boolean` | `false` | Throw on missing renderers (default: warn) |
| `ignore` | `string[]` | `[]` | Entry type slugs to skip validation for |

The integration only validates entry types where `isRendered` is `true`. Non-rendered types (e.g., internal data types without a frontend component) are skipped automatically.

## Usage

### Direct import

```astro
---
import { ArticleRenderer } from '@inneropen/marvin-renderers-core/astro';
import { getEntries } from '@inneropen/marvin-sdk';

const entries = await getEntries();
const article = entries[0];
---

<ArticleRenderer entry={article.toJSON()} />
```

### Dynamic rendering via registry

```astro
---
import { getRenderer } from '@inneropen/marvin-renderers-core/astro/registry';
import { resolveRendererName } from '@inneropen/marvin-renderers-core/logic';

const name = resolveRendererName(entry);
const Renderer = getRenderer(name);
---

{Renderer && <Renderer entry={entry} />}
```

### Logic helpers (framework-agnostic)

```ts
import {
  resolveRendererName,
  resolveRendererConfig,
  extractBody,
  extractField,
  getFeaturedAsset,
  isRoutable,
  createPackageRegistry,
  createRegistry,
  createRendererPackage,
} from '@inneropen/marvin-renderers-core/logic';
```

## Creating Renderer Packages

Renderer packages should be thin domain packages. Core owns the registry contract, validation, and shared entry helpers. A package such as `@inneropen/marvin-renderers-youtube` or `@inneropen/marvin-renderers-shopify` should only export its domain components and a renderer package definition.

The package declares its own name and installed version from `package.json`:

```ts
// src/astro/index.ts
import { createRendererPackage } from '@inneropen/marvin-renderers-core/logic';
import packageJson from '../../package.json';
import YouTubeVideoRenderer from './renderers/YouTubeVideoRenderer.astro';

export const youtubeRendererPackage = createRendererPackage({
  packageName: packageJson.name,
  version: packageJson.version,
  renderers: {
    'youtube-video': YouTubeVideoRenderer,
  },
});
```

Renderer components receive the same props as core renderers:

```astro
---
import type { RendererEntry } from '@inneropen/marvin-renderers-core/logic';
import { extractField } from '@inneropen/marvin-renderers-core/logic';

interface Props {
  entry: RendererEntry;
  config?: Record<string, unknown>;
  class?: string;
}

const { entry, config = {}, class: className } = Astro.props;
const videoId = extractField<string>(entry, 'videoId');
const title = extractField<string>(entry, 'title') ?? entry.title;
---

<article data-renderer="youtube-video" class={className}>
  {videoId && (
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`}
      title={title}
      loading="lazy"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    />
  )}
</article>
```

Sites explicitly opt into renderer packages:

```ts
// astro.config.mjs
import { coreRendererPackage } from '@inneropen/marvin-renderers-core/astro';
import { createPackageRegistry } from '@inneropen/marvin-renderers-core/logic';
import { youtubeRendererPackage } from '@inneropen/marvin-renderers-youtube/astro';

const renderers = createPackageRegistry([
  coreRendererPackage,
  youtubeRendererPackage,
]);

export default defineConfig({
  integrations: [
    marvinIntegration({ registry: renderers }),
  ],
});
```

Marvin entry types can then request:

```json
{
  "isRendered": true,
  "rendering": {
    "renderer": "youtube-video",
    "package": "@inneropen/marvin-renderers-youtube",
    "version": "^1.0.0",
    "config": {
      "privacyEnhanced": true
    }
  }
}
```

The package string is not used to dynamically import code. It is used to verify that the site has explicitly installed and registered a matching renderer package.

See `examples/renderer-package` for a minimal package skeleton, including SDK examples for fetching entries and rendering them with core `EntryRenderer`.

## Components

All components accept `{ entry: MarvinEntry; config?: Record<string, unknown>; class?: string }` and include a `<slot />` for extensions.

| Renderer | Component | Entry Types | Semantics |
|----------|-----------|-------------|-----------|
| `page` | `PageRenderer` | page, project, reference, resource | `<article>` with title, summary, body, featured asset |
| `article` | `ArticleRenderer` | article | Same as page + `<time>` for publishedAt |
| `faq` | `FaqRenderer` | faq | `<dl>` with `<dt>` question / `<dd>` answer |
| `navigation` | `NavigationRenderer` | navigation-item | `<a>` with href, optional target="_blank" |

### Styling

Components ship unstyled. Use `data-renderer` and `data-role` attributes as styling hooks:

```css
[data-renderer="article"] [data-role="title"] {
  font-size: 2rem;
}

[data-renderer="article"] [data-role="published-at"] {
  color: var(--muted);
}
```

## Exports

| Subpath | Contents |
|---------|----------|
| `./logic` | Pre-compiled ESM + types — resolve helpers, registry factory, type definitions |
| `./astro` | Astro source — all components + registry (processed at consumer build time) |
| `./astro/registry` | Registry only |
| `./astro/renderers/*` | Individual `.astro` components |

## SDK Integration

This package uses `@inneropen/marvin-sdk` (v2+) for API access. The `marvinIntegration()` Astro integration creates a publish client via `createMarvinClient` and calls `client.renderers.list()` to fetch entry types from the `/api/publish/{workspace}/entry-types` endpoint.

The validation logic (`validateRenderers()`) compares the fetched entry types against your registry:

```ts
import { validateRenderers } from '@inneropen/marvin-renderers-core/logic';

const result = validateRenderers(entryTypes, registry);
// result.total    — total isRendered entry types
// result.covered  — entry types with a matching renderer in the registry
// result.missing  — array of { entryTypeSlug, entryTypeName, renderer, package?, version? }
```

## License

MIT
