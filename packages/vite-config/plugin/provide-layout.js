import { join } from "node:path";
import { searchForWorkspaceRoot } from "vite";

/**
 * 支持在本地开发的时候，让 vite 自动加载侧边栏和顶栏，不需要
 * 单独启动layout项目。
 * 
 * @typedef {import('vite').Plugin} Plugin
 * 
 * @type {(workspaceRoot: string | null) => Plugin}
 * */
export default (workspaceRoot) => ({
    name: 'provide-layout',
    config(userConfig, env) {
        if (env.command === 'serve') {
            if (workspaceRoot === null) {
                const errorMessage = 
                    "not in npm/yarn/pnpm workspace," + 
                    " cannot load header and menu automatically for you";
                console.error(errorMessage);
                return userConfig;
            }

            return {
                ...userConfig,
                server: {
                    ...userConfig.server,
                    fs: {
                        strict: true,
                        allow: [
                            searchForWorkspaceRoot(process.cwd()),
                            join(workspaceRoot, 'packages/layout/src/pages/header'),
                            join(workspaceRoot, 'packages/layout/src/pages/menu')
                        ]
                    }
                }
            }
        }
        return userConfig
    },
    enforce:'pre'

})