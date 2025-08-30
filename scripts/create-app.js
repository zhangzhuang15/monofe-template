#!/usr/bin/env node

import { execSync } from "node:child_process";
import { argv, cwd } from "node:process";

function main() {
  const [nodePath, filePath, packageName] = argv;
  if (!packageName) {
    console.log("创建子包");
    console.log("请给出子包包名");
    return;
  }

  execSync(`pnpm -w create:app ${packageName}`, {
    cwd: cwd(),
    shell: true,
    stdio: 'inherit'
  });
}

main();