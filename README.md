# @inneropen/marvin-renderers-core

Core renderer components for [Marvin CMS](https://github.com/inneropen/marvin). Provides unstyled, semantic Astro components for rendering system entry types, plus framework-agnostic logic helpers.

## Install

```bash
npm install @inneropen/marvin-renderers-core
```

Peer dependencies: `astro` (^4 or ^5), `@inneropen/marvin-sdk` (^2).

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

## License

MIT
