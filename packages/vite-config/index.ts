import dayjs from 'dayjs';
import { glob } from 'glob';
import { env } from "node:process";
import vue from "@vitejs/plugin-vue";
import react from '@vitejs/plugin-react';
import { set as color } from "ansi-color";
import { join, relative } from "node:path";
import { existsSync, statSync } from "node:fs";
import { viteMockServe } from 'vite-plugin-mock';
import { defineConfig as $defineConfig, UserConfig } from 'vite';
import { pnpmWorkspaceRootSync } from "@node-kit/pnpm-workspace-root";

import preHtml from './plugin/pre-html.js';
import pagesListPlugin from './plugin/page-list.js';
import provideLayoutPlugin from "./plugin/provide-layout.js";
import customDevServerOpenPlugin from "./plugin/server.js";

const PathBasePrefix = '/monofe';

// 自定义构建版本
process.env.__BuildVersion = `buildVer-${dayjs().
  format('YYYY-MM-DD+HH:mm:ss') }`;

async function resolveEntries(projectRootDirPath: string, entry: string) {
  let absoluteFilePathArrayPromise = Promise.resolve([] as string[]);
  // 不需要递归遍历，就可以得到的文件路径
  const absoluteFilePathNoRecursively = [] as string[];

  const promises = entry.
    split(/,|，/).
    map(item => item.trim()).
    filter(item => item.length > 0).
    map((fileOrDirPath) => {
      const absoluteFileOrDirPath = join(projectRootDirPath, fileOrDirPath);
      if (!existsSync(absoluteFileOrDirPath)) {
        throw Error(`cannot find ${color(absoluteFileOrDirPath, 'red')}`);
      }

      const stat = statSync(absoluteFileOrDirPath);
      if (stat.isDirectory()) {
        return glob(join(absoluteFileOrDirPath, "**/*.html")).
          then(res => {
            absoluteFilePathArrayPromise 
              = absoluteFilePathArrayPromise.then(part => [...part, ...res]);
          }).
          catch(err => {});
      }

      absoluteFilePathNoRecursively.push(absoluteFileOrDirPath);
      return Promise.resolve();
    });
  await Promise.allSettled(promises);

  absoluteFilePathArrayPromise = absoluteFilePathArrayPromise.
    then(res => [...absoluteFilePathNoRecursively, ...res]);

  const result = absoluteFilePathArrayPromise.then(res => {
    // 去重
    const set = new Set(res);

    return Array.from(set).
      map(absoluteFilepath => relative(projectRootDirPath, absoluteFilepath)).
      map(filepath => {
      // filepath: apps/detail/index.test.a.html
      // appname: apps/detail/index/test/a
      // _: index.html
        const appname = filepath.split('.').
          slice(0, -1).
          join('/');
        return { [appname]: join(projectRootDirPath, filepath)};
      }). 
      reduce((lastState, currentValue) => {
        lastState = {
          ...lastState,
          ...currentValue
        };
        return lastState;
      }, {});
  });

  return await result;
}

function setBaseAndOutDirNameFromPublicPath(config: UserConfig) {
  const publicPath = env['PUBLIC_PATH'];
  if (publicPath === undefined) {
    throw Error('cannot find PUBLIC_PATH environment variable');
  }
  const [outDirName] = publicPath.split('/').
    slice(-1);
  const base = publicPath.split('/').
    slice(0, -1).
    join('/');
  config.base = base;
  config.build!.outDir = `build/${outDirName}`;
}

/**
 * 提供vite配置中的alias预设，你必须通过 projectRootDirPath 告知项目根目录的绝对路径，之后本预设会完成如下的alias配置：
 * 
 * - `@src/` 映射为 `<project_root_dir>/src/`
 * - `@utils/` 映射为 `<project_root_dir>/../../packages/utils/`
 * 
 * # example
 * ```ts 
 * // /Users/jasonzhang/Project/project-a/apps/app-a/vite.config.ts
 * import { useViteAliasPresets, defineConfig } from '@lvyue/vite-config';
 * import { join } from "node:path";
 * 
 * // 项目根目录的绝对路径
 * const rootDir = import.meta.dirname;
 * 
 * const alias = useViteAliasPresets(rootDir);
 * 
 * // 只想要预设中的`@src/`映射
 * const rootAlias = alias[0]
 * 
 * // 只想要预设中的`@utils/`映射
 * const pagesAlias = alias[1]
 * 
 * // 加入自定义的映射
 * const customAlias = {
 *   find: /^@custom/,
 *   replacement: join(rootDir, "src/custom")
 * }
 * 
 * export default defineConfig({
 *  projectRootDirPath: rootDir,
 *  alias: [componentsAlias, customAlias]
 * })
 * ```
 * 
 * @param projectRootDirPath 
 * @returns 
 */
export function getViteAliasPresets(projectRootDirPath: string) {
  return [
    {
      find: /^@src\//,
      replacement: join(projectRootDirPath, "src/")
    },
    {
      find: /^@utils\//,
      replacement: join(projectRootDirPath, "../../packages/utils/")
    },
  ] as Required<UserConfig>['resolve']['alias'];
}

/**
 * 设置vite config. 
 * 
 * 有几个环境变量非常重要：
 * 
 * 1. printConfig, 设置为true, 则在启动或者构建项目的时候，会输出内置的vite配置到终端
 * 2. emptyOutDir, 设置为true，则在每次构建项目之前，清空上一次构建的产物
 * 3. entry, 设置构建入口路径，这个路径是相对于业务项目根目录而言的（不是仓库的根目录），比如"pages/list/index.html",
 * 不要设置为"./pages/list/index.html", 如果一次构建多个页面，这些路径使用英文逗号或者中文逗号连接
 * 4. outDirName, 设置构建产物输出的目录，如果设置为hello，则构建的产物将出现在 build/hello 目录下
 * 5. base, 设置静态资源相对路径参考的基础路径，不设置的话，自动从环境变量PUBLIC_PATH读取
 * 6. usePublicPath, 设置为true，则vite config中的base和outDirName强制从环境变量PUBLIC_PATH解析，优先级比环境变量
 *    base和outDirName要高
 * 
 * 
 * 本地构建必须指定的环境变量：outDirName, entry
 * 
 * # example 
 * ```ts
 * // /Users/jasonzhang/Project/project-a/vite.config.ts
 * 
 * 
 * // 假设我们拥有这样的文件：
 * // /Users/jasonzhang/Project/project-a/src/main.tsx
 * // /Users/jasonzhang/Project/project-a/pages/list/index.html
 * // /Users/jasonzhang/Project/project-a/pages/detail/index.html
 * 
 * // 我们想一次编译上边两个html，就可以执行：
 * // entry=pages/list/index.html,pages/detail/index.html vite build
 * ```
 * 
 * @param params 
 * @returns 
 */
export function defineConfig(params: {
  /** 项目使用什么框架，默认用 all */
  framework?: 'react' | 'vue' | 'all';
  /** 项目根目录的绝对路径，这里是指业务项目，不是整个仓库的根目录 */
  projectRootDirPath: string;
  /** 
   * 设置路径别名, 更多信息见{@link useViteAliasPresets }
   * */
  alias?: Required<UserConfig>['resolve']['alias'];
  /** 
   * 设置前端服务器代理 
   * 
   * # example
   * ```ts 
   * // /Users/jasonzhang/Project/project-a/apps/app-a/vite.config.ts
   * import { defineConfig } from 'vite-config'
   * 
   * export default defineConfig({
   *   projectRootDirPath: import.meta.dirname,
   *   port: 8007,
   *   proxy: {
   *     // http://localhost:8007/api/list/120 将被转化为
   *     // http://hello.api.com:6007/api/list/120 
   *     '/api': 'http://hello.api.com:6007'
   *   }
   * })
   *
   * ```
   * */
  proxy?: Required<UserConfig>['server']['proxy'];
  /** 设置前端服务器的端口号，不设置的话，内部会自动设置 */
  port?: number;
  /** 
   * 设置前端服务器的域名，如果不设置的话，就是localhost。
   * 
   * 如果设置的话，不要忘记在 /etc/hosts 中做好域名映射设置。
   */
  host?: string;
  /** 设置是否开启mock */
  mockFlag?: boolean;
  /** 设置是否加载菜单，如果开启，页面启动后，会展示侧边栏和顶栏 */
  loadMenu?: boolean;
}) {
  // refer: https://vite.dev/config/
  return $defineConfig(async ({ command }) => {
    const frameworkPlugins: any[] = [react(), vue()];
    if (params.framework === 'react') {
      frameworkPlugins.pop();
    }
    if (params.framework === 'vue') {
      frameworkPlugins.shift();
    }

    const baseConfig: UserConfig = {
      plugins: [
        ...frameworkPlugins
      ],
      resolve: {
        alias: (params.alias || [])
      },
      build: {
        cssMinify: 'esbuild',
        minify: 'esbuild',
      },
      server: {}
    }; 

    if (params.port !== undefined) {
      baseConfig.server!.port = params.port;
    }
    if (params.host !== undefined) {
      baseConfig.server!.host = params.host;
    }
    if (params.proxy !== undefined) {
      baseConfig.server!.proxy = params.proxy;
    }

    // 开发环境
    if (command === 'serve') {
      baseConfig.base = `${PathBasePrefix}/${ env['npm_package_name']}/`;

      const workspaceRoot = pnpmWorkspaceRootSync();

      baseConfig.plugins!.push(preHtml({
        base: baseConfig.base!,
        loadMenu: params.loadMenu ?? false,
        menuImpl: 'react',
        workspaceRoot
      }));

      if (params.loadMenu) {
        // 自动锁定顶栏和菜单栏入口文件
        baseConfig.plugins!.push(provideLayoutPlugin(workspaceRoot));
      }

      baseConfig.plugins!.push(viteMockServe({
        // mock文件目录
        mockPath: 'mock',
        // 打开后，可以读取 ts 文件模块。 请注意，打开后将无法监视.js 文件
        enable: params.mockFlag || false,
      }));

      baseConfig.plugins!.push(pagesListPlugin({
        pagesDir: 'pages',
        pathPrefix: PathBasePrefix,
        pathSubAppName: env['npm_package_name']
      }));

      baseConfig.plugins!.push(customDevServerOpenPlugin());
    } else {
      baseConfig.plugins!.push(preHtml({
        loadMenu: false,
        menuImpl: 'react',
        base: '',
        workspaceRoot: null
      }));
    }

    if (command === 'build') {
      // 设置 base 和 outDir
      if (env['usePublicPath'] !== undefined) {
        setBaseAndOutDirNameFromPublicPath(baseConfig);
      } else {
        // eslint-disable-next-line prefer-destructuring
        const outDirName = env['outDirName'];
        if (outDirName === undefined) 
          throw Error("You have to set outDirName environment variable!");
        baseConfig.build!.outDir = `build/${outDirName}`;
         
        const publicPath = env['PUBLIC_PATH'];
        // eslint-disable-next-line prefer-destructuring
        const base = env['base'];
        baseConfig.base = publicPath || base || '/';
        baseConfig.base = join(baseConfig.base, outDirName);
        if (publicPath !== undefined) {
          baseConfig.base = `/${baseConfig.base}`;
        }
      }
      
      
      // eslint-disable-next-line prefer-destructuring
      const entry = env['entry'];
      if (entry === undefined)
        throw Error("You have to set entry environment variable!");
      const entries = await resolveEntries(params.projectRootDirPath, entry);
      baseConfig.build!.rollupOptions = {
        input: entries,
        output: {
          entryFileNames: '[name].[hash].entry.js',
          chunkFileNames: '[name].[hash].chunk.js'
        },
      };
      baseConfig.build!.emptyOutDir = env['emptyOutDir'] === 'true' ? true : false;
    }
    

    if (env['printConfig'] === 'true') {
      console.log("internal vite config: \n", JSON.stringify(baseConfig));
    }

    return baseConfig;
  });
}