#!/usr/bin/env node

import { execSync } from "node:child_process";
import { argv, cwd } from "node:process";

function main() {
  const [nodePath, filePath, packageName, pagePath] = argv;
  if (!packageName) {
    console.log("创建某个子包下的页面");
    console.log("请给出子包包名");
    return;
  }

  if (!pagePath) {
    console.log("创建某个子包下的页面");
    console.log("请给出页面路径");
    return;
  }


  execSync(`pnpm -w create:page ${packageName} ${pagePath}`, {
    cwd: cwd(),
    shell: true,
    stdio: 'inherit'
  });
}

main();