#!/usr/bin/env node
/* eslint-disable @stylistic/max-len */

import { argv, exit, stdin, stdout } from "node:process";
import { spawnSync } from "node:child_process";
import { set as color } from "ansi-color";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { 
  existsSync, cpSync, readFileSync, 
  writeFileSync, mkdirSync 
} from "node:fs";


// dangerous: Dont change the position of this file!

const filePath = fileURLToPath(import.meta.url);
const dirname = resolve(filePath, "../");
const rootDirectoryAbsPath = resolve(dirname, "../../");

function help() {
  const content = `
create a SPA/MPA app under 'apps' directory. 

./create-app.js [-h | -help | --help ]  [spa | mpa] <app-name> [-f | --force] [framework]

options:
-h | -help | --help      [optional] show these help message 

spa | mpa                [required] spa, create SPA page; mpa, create MPA page;
                         right now, only support mpa;

<app-name>           [required] new app name.
                         e.g.  hello, refers to <projectRoot>/apps/hello

-f | --force             [optional] dont reconfirm when start to create new page

framework                [optional] vue/react, default: react


example:
assume your project root is directory "turingmono".

${color('./create-app.js', 'green')}
print this message 

${color('./create-app.js -h', 'green')}
print this message 

${color('./create-app.js mpa appA ', 'green')}
generate turingmono/apps/appA

${color('./create-app.js mpa appA -f', 'green')}
generate turingmono/apps/appA without repl 

${color('./create-app.js mpa appA -f vue', 'green')}
generate turingmono/apps/appA without repl, using vue framework
`.trimStart();
  console.log(content);
}

async function createSPAPackage({ packageAbsPath, reconfirm }) {
}

/**
 * 
 * @param {{packageName: string}} param0 
 */
async function createMPAPackage({ packageAbsPath, reconfirm, packageName, framework: _f }) {
  let framework = _f;
  if (reconfirm) {
    const rl = createInterface({ input: stdin, output: stdout });

    // 是否创建 app
    while (true) {
      const answer 
            = await rl.question(
              `即将创建${color(packageAbsPath, 'green')}，确认创建么？(y/n)`);
      if (['y', 'yes'].includes(answer.toLowerCase())) {
        break;
      } else if (['n', 'no'].includes(answer.toLowerCase())) {
        rl.close();
        exit();
      }
    }

    // 用什么框架创建
    while (true) {
      const answer = await rl.question('你想使用什么框架?(1.vue, 2.react, 3.all)');
      if (['1', 'v', 'vu', 'vue'].includes(answer.toLowerCase())) {
        framework = 'vue';
        rl.close();
        break;
      } else if (['2', 'r', 're', 'rea', 'react'].includes(answer.toLowerCase())) {
        framework = 'react';
        rl.close();
        break;
      } else if (['3', 'a', 'al', 'all'].includes(answer.toLowerCase())) {
        framework = 'all';
        rl.close();
        break;
      }
    }

  }
    
  console.log();
    
  if (existsSync(packageAbsPath)) {
    console.log(`${color(packageAbsPath, 'red')} 已经存在`);
    exit();
  }
    
  console.log('等一会儿...\n\n');

  console.log(`生成 ${ packageAbsPath } 下的文件...\n`);
  let templateName = 'package-template-mpa';
  if (framework === 'react') {
    templateName = 'package-template-mpa-react18';
  } else if (framework === 'vue') {
    templateName = 'package-template-mpa-vue3';
  }
  try {
    cpSync(
      resolve(dirname, 'template', templateName),
      packageAbsPath,
      { force: true, recursive: true }
    );
    console.log(color('success', 'green'));
  } catch (e) {
    console.log(color('failed', 'red'));
  }
  const packageContent = readFileSync(resolve(dirname, "template", templateName, 'package.json')).
    toString();
  const content = packageContent.replace('{{packageName}}', packageName);
  writeFileSync(
    resolve(packageAbsPath, 'package.json'),
    content,
    { flag: 'w+', mode: 0o666 }
  );

  console.log();
  console.log('done🚀!\n');
  
  const tips = `
接下来你可以尝试:
1. ${color("pnpm -w i", "green")}
   如果之前已经执行过， 可以跳过.
2. ${color(`pnpm --filter=${ packageName } i`, "green")}
3. ${color(`pnpm --filter=${ packageName } dev`, "green")}
4. 如果启动不起来，确认下第一步是否执行

`.trimStart();
  console.log(tips);

  {
    const rl = await createInterface({input: stdin, output: stdout});
    const answer = await rl.question("是否需要我帮你自动执行上述步骤?(y/n): ");
    rl.close();
    if (['y', 'yes'].includes(answer.toLowerCase())) {
      spawnSync(
        `pnpm -w i && pnpm --filter=${packageName} i && pnpm --filter=${packageName} dev`,
        { shell: true, stdio: 'inherit'}
      );
      return;
    } 
    console.log("bye");
  }
}

function main() {
  const [nodePath, fileName, helpOrMode, packageName, forceFlag, framework] = argv;

  if ([null, undefined, 'help', '--help', '-h', '-help'].includes(helpOrMode)) {
    help();
    return;
  }

  const mode = helpOrMode;
  const packageAbsPath = resolve(rootDirectoryAbsPath, 'apps', packageName);
  if (existsSync(packageAbsPath)) {
    console.log(`${color(packageAbsPath, 'red')} 已存在！`);
    return;
  }

  let reconfirm = true;
  if (['-f', '--force'].includes(forceFlag)) {
    reconfirm = false;
  }

  switch (mode) {
    case 'mpa':
      createMPAPackage({ packageAbsPath, reconfirm, packageName, framework: framework ?? 'react' });
      break;
    // eslint-disable-next-line no-fallthrough
    case 'spa':
    default:
      createSPAPackage({ packageAbsPath, reconfirm, framework: framework ?? 'react' });
  }
}


main();