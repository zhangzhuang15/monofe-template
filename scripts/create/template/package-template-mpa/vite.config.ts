import { defineConfig, getViteAliasPresets } from '@jasonzhang/vite-config';
const baseAlias = getViteAliasPresets(import.meta.dirname);

export default defineConfig({
  projectRootDirPath: import.meta.dirname,
  alias: baseAlias,
  mockFlag: false,
  proxy: {
    '/api': {
      target: 'https://xxx.test.yyy.com',
      changeOrigin: true
    }
  },
});