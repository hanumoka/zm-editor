import { defineConfig } from 'tsup';
import { copyFileSync, mkdirSync } from 'fs';

function copyWithRetry(src: string, dest: string, retries = 3, delay = 200): void {
  for (let i = 0; i < retries; i++) {
    try {
      copyFileSync(src, dest);
      console.log(`✅ Copied ${src} to ${dest}`);
      return;
    } catch (error: unknown) {
      const code = (error as NodeJS.ErrnoException).code;
      if ((code === 'EBUSY' || code === 'EPERM') && i < retries - 1) {
        const waitUntil = Date.now() + delay;
        while (Date.now() < waitUntil) { /* busy wait */ }
      } else {
        console.error(`❌ Failed to copy ${src}:`, error);
      }
    }
  }
}

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: !options.watch,
  external: ['react', 'react-dom', '@tiptap/core', '@tiptap/react', '@tiptap/pm', 'mermaid', 'katex'],
  treeshake: true,
  splitting: false,
  injectStyle: false,
  onSuccess: async () => {
    const cssFiles = [
      { src: 'src/styles/editor.css', dest: 'dist/styles.css' },
      { src: 'src/styles/variables.css', dest: 'dist/variables.css' },
    ];

    mkdirSync('dist', { recursive: true });

    for (const { src, dest } of cssFiles) {
      copyWithRetry(src, dest);
    }
  },
}));
