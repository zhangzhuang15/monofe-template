import { defineConfig } from "rollup";
import { env } from "node:process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import esbuild from "rollup-plugin-esbuild";
import cpy from "rollup-plugin-cpy";
import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

const require = createRequire(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));

/**
 * layout package 的 rollup 配置
 * @returns {import('rollup').RollupOptions[]}
 */
function defineLayoutConfig() {
  return [
    {
      input: join(__dirname, "packages", "layout/index.js"),
      output: {
        format: "iife",
        file: join(
          __dirname, "packages", "layout/build",
          env['outDirName'] || 'build', "index.min.js"),
        name: 'banma',
        compact: false,
      },
      plugins: [
        esbuild({ minify: true, loaders: {
          '.css': 'css'
        }}),
        cpy({
          files: [
            join(__dirname, "packages", "layout/*.min.js"),
            join(__dirname, "packages", "layout/img"),
            join(__dirname, "packages", "layout/font"),
            join(__dirname, "packages", "layout/css"),
          ],
          dest: join(
            __dirname, "packages", "layout/build",
            env['outDirName'] || 'build')
        }),
      ]
    }
  ];
}

export default defineConfig((commandLineArgs) => {
  const packageDirname = env['target'];
  if (packageDirname === undefined) {
    throw Error('cannot find target environment variable');
  }
  const pkg = require(join(__dirname, "packages", packageDirname, "package.json"));
  const pkgname = pkg.name;
  const pkgversion = pkg.version;
  const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    'fsevents',
    /node_modules/
  ];

  if (packageDirname === 'layout') {
    return defineLayoutConfig();
  }

  return [
    // config: generate js
    { 
      input: join(__dirname, "packages", packageDirname, "index.ts"),
      output: {
        format: "esm",
        file: join(__dirname, "packages", packageDirname, "dist/index.js"),
        compact: false,
        banner: `/**
* ${pkgname} v${pkgversion}
* (c) 2024-present zhangzhuang08 and other contributors
**/`,
      },
      plugins: [
        esbuild({
          tsconfig: join(__dirname, "tsconfig.rollup.json"),
          minify: true
        }),
        commonjs(),
        nodeResolve(),
      ],
      external
    },
    // config: generate .d.ts
    {
      input: join(__dirname, "packages", packageDirname, "index.ts"),
      output: {
        format: 'esm',
        file: join(__dirname, "packages", packageDirname, "dist/index.d.ts")
      },
      plugins: [
        typescript({
          tsconfig: join(__dirname, "tsconfig.rollup.json"),
          compilerOptions: {
            emitDeclarationOnly: true,
            moduleResolution: 'nodenext',
          },
          outDir: join(__dirname, "packages", packageDirname, "dist")
        })
      ]
    }
  ];

});