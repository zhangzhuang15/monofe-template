#!/usr/bin/env node

import { execSync } from "node:child_process";
import { argv, cwd } from "node:process";
import { set as color } from 'ansi-color';

function main() {
  const [nodePath, filePath, packageName] = argv;
  if (!packageName) {
    console.log("安装某个子包的依赖");
    console.log(`${color('pnpm -w i', 'green')} (安装根包的依赖直接使用这个命令)`);
    console.log("请给出子包包名");
    return;
  }

  execSync(`pnpm --filter=${packageName} i`, {
    cwd: cwd(),
    shell: true,
    stdio: 'inherit'
  });
}

main();