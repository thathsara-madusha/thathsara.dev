import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

export default defineConfig({
  integrations: [svelte()],
  server: { port: 4321, host: true },
  devToolbar: { enabled: false },
});
