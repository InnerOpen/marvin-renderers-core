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
  createRegistry,
} from '@inneropen/marvin-renderers-core/logic';
```

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
