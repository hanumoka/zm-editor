import { defineConfig } from 'tsup';
import { copyFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom', '@tiptap/core', '@tiptap/react', '@tiptap/pm', 'mermaid', 'katex'],
  treeshake: true,
  splitting: false,
  injectStyle: false,
  onSuccess: async () => {
    // Copy CSS files to dist
    const cssFiles = [
      { src: 'src/styles/editor.css', dest: 'dist/styles.css' },
      { src: 'src/styles/variables.css', dest: 'dist/variables.css' },
    ];

    mkdirSync('dist', { recursive: true });

    for (const { src, dest } of cssFiles) {
      try {
        copyFileSync(src, dest);
        console.log(`✅ Copied ${src} to ${dest}`);
      } catch (error) {
        console.error(`❌ Failed to copy ${src}:`, error);
      }
    }
  },
});
