#!/usr/bin/env node
/* eslint-disable @stylistic/max-len */

import { argv, exit, stdin, stdout } from "node:process";
import { set as color } from "ansi-color";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { 
  existsSync, cpSync, readFileSync, 
  writeFileSync, mkdirSync, readdirSync
} from "node:fs";
import inquirer from "inquirer";

// dangerous: Dont change the position of this file!

const filePath = fileURLToPath(import.meta.url);
const dirname = resolve(filePath, "../");
const rootDirectoryAbsPath = resolve(dirname, "../../");

function help() {
  const content = `
create a SPA/MPA page under an app. 

./create-page.js [-h | -help | --help ] [spa | mpa] <app-name> <page-path> [-f | --force] [framework]

options:
-h | -help | --help      [optional] show these help message 

spa | mpa                [required] spa, create SPA page; mpa, create MPA page

<app-name>           [required] app name where new page will be put in.
                         e.g.  hello, refers to <projectRoot>/apps/hello

<page-path>              [required] name/path of new page
                         e.g. detail, refers to src/pages/detail
                         e.g. detail/list, refers to src/pages/detail/list

-f | --force             [optional] dont reconfirm when start to create new page

framework                [optional] vue/react, default: react


example:
assume your project root is directory "turingmono".

${color('./create-page.js', 'green')}
print this message 

${color('./create-page.js -h', 'green')}
print this message 

${color('./create-page.js mpa appA rider', 'green')}
generate turingmono/apps/appA/pages/rider.html and turingmono/apps/appA/src/pages/rider with default files (index.tsx, index-entry.tsx .etc)

${color('./create-page.js mpa appA detail/list', 'green')}
generate turingmono/apps/appA/pages/detail/list.html and turingmono/apps/appA/src/pages/detail/list with default files (index.tsx, index-entry.tsx .etc)

${color('./create-page.js spa appA rider', 'green')}
generate turingmono/apps/appA/src/pages/rider with default files(index.tsx .etc)

${color('./create-page.js spa appA rider -f', 'green')}
generate turingmono/apps/appA/src/pages/rider with default files(index.tsx .etc), without repl

${color('./create-page.js spa appA rider -f vue', 'green')}
generate turingmono/apps/appA/src/pages/rider with default files(index.tsx .etc), without repl, using vue
  `.trimStart();
  console.log(content);
}

async function createSPAPage({ packageAbsPath, reconfirm, pageName, framework: _f }) {
  let framework = _f;
  if (reconfirm) {
    const rl = createInterface({ input: stdin, output: stdout });
    while (true) {
      const answer 
        = await rl.question(`即将在${color(packageAbsPath, 'green')}， 创建新的页面，确认创建么？(y/n)`);
      if (['y', 'yes'].includes(answer.toLowerCase())) {
        break;
      } else {
        rl.close();
        exit();
      }
    }

    while (true) {
      const answer = await rl.question('你想使用什么框架？(1.vue, 2.react)');
      if (['1', 'v', 'vu', 'vue'].includes(answer.toLowerCase())) {
        framework = 'vue';
        rl.close();
        break;
      } else if (['2', 'r', 're', 'rea', 'reac', 'react'].includes(answer.toLowerCase())) {
        framework = 'react';
        rl.close();
        break;
      }
    }
  }

  console.log();

  const pageDirAbsPath = resolve(packageAbsPath, "src/pages", pageName);
  if (existsSync(pageDirAbsPath)) {
    console.log(`${color(pageDirAbsPath, 'blue')} 已经存在`);
    exit();
  }

  console.log('wait for seconds...\n');
  console.log(`generating files under ${ pageDirAbsPath } ...\n`);

  let templateName = framework === 'react' ? 'page-template-spa-react18' : 'page-template-spa-vue3';
  if (reconfirm) {
    const templateNameList = readdirSync(resolve(dirname, 'template'));
    const rawChoices = templateNameList.filter(it => it.startsWith('page-template')).
      map((it, index) => ({ name: it, value: index }));
    const defaultChoice = rawChoices.findIndex(it => it.name === templateName);
    const answers = await inquirer.prompt([
      { 
        name: 'templateName', 
        message: '请选择模板',
        type: 'list',
        choices: rawChoices,
        default: defaultChoice,
      }
    ]);
    templateName = rawChoices[answers.templateName].name;
  }

  cpSync(
    resolve(dirname, 'template', templateName),
    pageDirAbsPath,
    { force: true, recursive: true }
  );

  console.log('done🚀!\n');
}

/**
 * 
 * @param {{ pagePath: string }} param0 
 */
async function createMPAPage({ packageAbsPath, reconfirm, pagePath, framework: _f }) {
  let framework = _f;
  if (reconfirm) {
    const rl = createInterface({ input: stdin, output: stdout });
    while (true) {
      const answer 
            = await rl.question(
              `即将在${color(packageAbsPath, 'green')}， 创建新的页面，确认创建么？(y/n)`);
      if (['y', 'yes'].includes(answer.toLowerCase())) {
        break;
      } else {
        rl.close();
        exit();
      }
    }

    while (true) {
      const answer = await rl.question('你想使用什么框架？(1.vue, 2.react)');
      if (['1', 'v', 'vu', 'vue'].includes(answer.toLowerCase())) {
        framework = 'vue';
        rl.close();
        break;
      } else if (['2', 'r', 're', 'rea', 'reac', 'react'].includes(answer.toLowerCase())) {
        framework = 'react';
        rl.close();
        break;
      }
    }
  }

  const pageHtmlAbsPath = resolve(packageAbsPath, 'pages', `${pagePath}.html`);
  if (existsSync(pageHtmlAbsPath)) {
    console.log(`${color(pageHtmlAbsPath, 'red')} 已经存在`);
    exit();
  }

  let startAbsPath = resolve(packageAbsPath, "src/pages");
  const pageSplitPath = pagePath.split('/').
    filter(item => item.trim().length > 0);
  while (pageSplitPath.length > 0) {
    // order/detail/list
    // pageSplitPath: [order, detail, list]
    //
    // order exist ?
    // no -> create order/detail/list/index-entry.tsx, order/detail/list.html
    //
    // order already a page ?
    // yes -> reject
    //
    // detail exist ?
    // no -> create order/detail/list/index-entry.tsx, order/detail/list.html
    //
    // detail already a page ?
    // yes -> reject
    //
    // list exist ?
    // no -> create order/detail/list/index-entry.tsx, order/detail/list.html
    
    startAbsPath = join(startAbsPath, pageSplitPath.shift());
    if (!existsSync(startAbsPath)) {
      break;
    } 

    if (existsSync(join(startAbsPath, 'index-entry.tsx'))) {
      console.log(`${color(startAbsPath, 'red')} 已经是一个页面了!\n`);
      exit();
    } 
  };

  if (existsSync(startAbsPath)) {
    console.log(`${color(startAbsPath, 'red')} 已经存在了!\n`);
    exit();
  }
    
  console.log('等一会儿...\n\n');
  console.log();

  // 生成入口 html 文件 
  console.log(`生成 ${pageHtmlAbsPath}\n`);
  const pageHtmlDirAbsPath = resolve(pageHtmlAbsPath, '../');
  if (!existsSync(pageHtmlDirAbsPath)) {
    mkdirSync(pageHtmlDirAbsPath, { recursive: true });
  }
  const template = readFileSync(resolve(dirname, 'index.html')).
    toString();
  const content = template.replace("{{src}}", join(`/src/pages/${pagePath}`, framework === 'react' ? 'index-entry.tsx' : 'index-entry.ts'));
  try {
    writeFileSync(
      pageHtmlAbsPath, 
      content, 
      { flag: 'w+', mode: 0o666 }
    );
    console.log(color('success\n\n', 'green'));
  } catch (e) {
    console.log(color('failed\n\n', 'red'));
  }

  // 生成入口 index-entry.tsx, index.tsx 等文件
  const pageDirAbsPath = resolve(packageAbsPath, "src/pages", pagePath);
  let templateName = framework === 'react' ? 'page-template-mpa-react18' : 'page-template-mpa-vue3';
  if (reconfirm) {
    const templateNameList = readdirSync(resolve(dirname, 'template'));
    const rawChoices = templateNameList.filter(it => it.startsWith('page-template')).
      map((it, index) => ({ name: it, value: index }));
    const defaultChoice = rawChoices.findIndex(it => it.name === templateName);
    const answers = await inquirer.prompt([
      { 
        name: 'templateName', 
        message: '请选择模板',
        type: 'list',
        choices: rawChoices,
        default: defaultChoice,
      }
    ]);
    templateName = rawChoices[answers.templateName].name;
  }
  console.log(`生成 ${ pageDirAbsPath } 下的文件 ...\n`);
  try {
    cpSync(
      resolve(dirname, 'template', templateName),
      pageDirAbsPath,
      { force: true, recursive: true }
    );
    console.log(color('success\n\n', 'green'));
  } catch (e) {
    console.log(color('failed\n\n', 'red'));
  }
  
  if (templateName === 'page-template-mpa-react18') {
    let indexEntryFileContent = readFileSync(
      resolve(dirname, './template', templateName, 'index-entry.tsx')
    ).
      toString();
    indexEntryFileContent = indexEntryFileContent.replace("appID={}", `appID="${pagePath}"`);
    writeFileSync(
      resolve(pageDirAbsPath, "index-entry.tsx"),
      indexEntryFileContent
    );
  }
  
  console.log();
  console.log('done🚀!\n');
}

function main() {
  const [nodePath, fileName, helpOrmode, packageName, pagePath, forceFlag, framework] = argv;

  if ([null, undefined, 'help', '--help', '-h', '-help'].includes(helpOrmode)) {
    help();
    return;
  }

  const mode = helpOrmode;
  const packageAbsPath = resolve(rootDirectoryAbsPath, 'apps', packageName);
  if (!existsSync(packageAbsPath)) {
    console.log(`${color(packageAbsPath, 'red')} 不存在！`);
    return;
  }

  if (['', undefined].includes(pagePath)) {
    console.log("请指定page名！");
    return;
  }

  let reconfirm = true;
  if (['-f', '--force'].includes(forceFlag)) {
    reconfirm = false;
  }

  switch (mode) {
    case 'mpa':
      createMPAPage({ packageAbsPath, reconfirm, pagePath, framework });
      break;
    // eslint-disable-next-line no-fallthrough
    case 'spa':
    default:
      createSPAPage({ packageAbsPath, reconfirm, pageName: pagePath, framework });
  }
}


main();


