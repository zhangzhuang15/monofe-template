import { defineConfig, getViteAliasPresets } from '@jasonzhang/vite-config';
const baseAlias = getViteAliasPresets(import.meta.dirname);

export default defineConfig({
  framework: 'vue',
  projectRootDirPath: import.meta.dirname,
  alias: baseAlias,
  proxy: {
    '/api': {
      target: 'https://xxx.test.yyy.com',
      changeOrigin: true
    }
  },
});