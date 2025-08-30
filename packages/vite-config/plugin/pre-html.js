import fs from 'fs';
import path from 'path';

let headerScript = '';
let footerScript = '';
let bodyScript = '';

// 读取文件内容
const readHtmlFromDevLionConf = (blockName, workspaceRoot) => {
  try {
    const fileName = `${blockName}.html`;
    return fs.readFileSync(path.join(workspaceRoot, `scripts/base-html/conf/dev/${fileName}`)).toString();
  } catch (error) {
    console.error(`读取文件失败: ${error}`);
    return '';
  }
};

// 读取文件内容入口
const readFileMain = (workspaceRoot) => {
  headerScript = readHtmlFromDevLionConf('header', workspaceRoot);
  footerScript = readHtmlFromDevLionConf('footer', workspaceRoot);
  bodyScript = readHtmlFromDevLionConf('body', workspaceRoot);
};

/**
 * @typedef {import("vite").Plugin} Plugin 
 * 
 * @type {(params: { base: string, loadMenu: boolean, menuImpl: 'vue' | 'react', workspaceRoot: string | null }) => Plugin}
 */
export default ({ base, loadMenu, menuImpl, workspaceRoot }) => ({
  name: 'pre-html',
  transformIndexHtml: (html) => {
    if (!process.env.CI) {
      const headerScriptTag = (() => {
        if (!loadMenu) return ''
        if (workspaceRoot === null) return ''
        const src = path.join(
          base, 
          '@fs', 
          workspaceRoot, 
          'packages/layout/src/pages/header', 
          menuImpl === 'react' ? 'react-version/index-entry.tsx' : 'vue-version/index.ts'
        );
        return `<script type="module" src="${src}"></script>`;
      })();

      const menuScriptTag = (() => {
        if (!loadMenu) return ''
        if (workspaceRoot === null) return ''
        const src = path.join(
          base, 
          '@fs', 
          workspaceRoot, 
          'packages/layout/src/pages/menu', 
          menuImpl === 'react' ? 'react-version/index-entry.tsx' : 'vue-version/index.ts'
        );
        return `<script type="module" src="${src}"></script>`;
      })();

      if (workspaceRoot !== null) {
        readFileMain(workspaceRoot);
      }

      headerScript = headerScript.replace(
        "{headerScriptTag}", 
        headerScriptTag
      ).replace("{menuScriptTag}", menuScriptTag);
      
      // 本地开发
      return html.replace('${htmlHeaderScript}', headerScript).
        replace('${htmlFooterScript}', footerScript).
        replace('${htmlBodyScript}', bodyScript);
    }
    return html;
  }
});