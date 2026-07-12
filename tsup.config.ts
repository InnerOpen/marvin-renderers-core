import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/logic/index.ts'],
  outDir: 'dist/logic',
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
});
