import type { AstroIntegration } from 'astro';
import type { RendererRegistry } from '../logic/types';
import type { RendererCheckOptions } from '../logic/validation-types';
import { validateRenderers } from '../logic/validation';

export function marvinIntegration(options: RendererCheckOptions): AstroIntegration {
  const { registry, strict = false, ignore } = options;

  return {
    name: '@inneropen/marvin-renderers-core',
    hooks: {
      'astro:config:done': async ({ logger }) => {
        const apiUrl = options.apiUrl || process.env.MARVIN_API_URL;
        const siteToken = options.siteToken || process.env.MARVIN_SITE_CLIENT_TOKEN;
        const workspaceSlug = process.env.MARVIN_WORKSPACE_SLUG;

        if (!apiUrl || !siteToken || !workspaceSlug) {
          logger.warn(
            'Skipping renderer validation — missing MARVIN_API_URL, MARVIN_SITE_CLIENT_TOKEN, or MARVIN_WORKSPACE_SLUG'
          );
          return;
        }

        let entryTypes;
        try {
          const url = `${apiUrl.replace(/\/$/, '')}/api/publish/${workspaceSlug}/entry-types`;
          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${siteToken}` },
          });

          if (!response.ok) {
            logger.warn(
              `Renderer validation failed — API returned ${response.status}`
            );
            return;
          }

          entryTypes = await response.json();
        } catch (error) {
          logger.warn(
            `Renderer validation failed — could not reach Marvin API: ${error instanceof Error ? error.message : error}`
          );
          return;
        }

        const result = validateRenderers(entryTypes, registry, { ignore });

        if (result.missing.length === 0) {
          logger.info(
            `All ${result.total} entry type renderer(s) covered`
          );
          return;
        }

        const lines = result.missing.map(
          (m) => `  - "${m.renderer}" for entry type "${m.entryTypeName}" (${m.entryTypeSlug})`
        );
        const message = `Missing ${result.missing.length} renderer(s):\n${lines.join('\n')}`;

        if (strict) {
          throw new Error(message);
        }

        logger.warn(message);
      },
    },
  };
}
