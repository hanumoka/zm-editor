import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'extensions/index': 'src/extensions/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['@tiptap/core', '@tiptap/pm'],
  treeshake: true,
  splitting: false,
});
