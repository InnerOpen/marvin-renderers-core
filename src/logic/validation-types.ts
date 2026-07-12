export interface RendererCheckOptions {
  registry: import('./types').RendererRegistry | Record<string, unknown>;
  apiUrl?: string;
  siteToken?: string;
  strict?: boolean;
  ignore?: string[];
}

export interface MissingRenderer {
  entryTypeSlug: string;
  entryTypeName: string;
  renderer: string;
  package?: string;
  version?: string;
}

export interface ValidationResult {
  total: number;
  covered: number;
  missing: MissingRenderer[];
}
