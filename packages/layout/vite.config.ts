import { defineConfig, getViteAliasPresets } from '@jasonzhang/vite-config';
const baseAlias = getViteAliasPresets(import.meta.dirname);

export default defineConfig({
  projectRootDirPath: import.meta.dirname,
  alias: baseAlias,
  // 申请好远程域名后，通常会在/etc/hosts里，配置dev域名，
  // test域名，st域名。假设远程域名是 hello.com， 本地
  // 配置的test域名为 local.test.hello.com, 将此处
  // 由 ‘localhost’ 修改为 'local.test.hello.com',
  // 前端项目跑起来后，就是模拟test环境
  host: 'localhost',
  // 默认给出的端口号。这个端口号可能并不适用，比如说你本地
  // 刚好有个其他的项目在启动，占用了 6783 端口号，这个时候
  // 你需要换成一个别的端口号
  port: 6783,
  mockFlag: true,
  proxy: {
    // 配置接口转发，根据自己的业务情形，修改这里；
    // 此处实例的意思是，启动前端项目后，项目里
    // 前端发送的 http://localhost:6783/api/xxy
    // 会转发给 https://xxx.yyy.com/api/xxy
    '/api': {
      target: 'https://xxx.yyy.com',
      changeOrigin: true
    }
  },
});