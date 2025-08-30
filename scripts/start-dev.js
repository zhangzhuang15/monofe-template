#!/usr/bin/env node

import { execSync } from "node:child_process";
import { argv, cwd } from "node:process";

function main() {
  const [nodePath, filePath, packageName] = argv;
  if (!packageName) {
    console.log("启动子包服务");
    console.log("请指定好包名");
    return;
  }

  execSync(`pnpm --filter=${packageName} dev`, {
    cwd: cwd(),
    shell: true,
    stdio: 'inherit'
  });
}

main();