import globals from "globals";
import typescriptParser from "@typescript-eslint/parser";
import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import react from "eslint-plugin-react";
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

// 🚀 项目中如果不使用vue，请注释掉这两行代码
import vue from "eslint-plugin-vue";
import vue_eslint_parser from "vue-eslint-parser";

// migration from eslintrc.json to eslint.config.js:
// https://eslint.org/docs/latest/use/configure/migration-guide#processors

// rules reference:
// https://eslint.org/docs/v8.x/rules/

// stylistics reference:
// https://eslint.style/rules/default/semi-style

// react rules reference:
// https://www.npmjs.com/package/eslint-plugin-react

const rulesForJsOrTsSnippet = {
  "no-use-before-define": "error",
  "no-unused-vars": "off",
  "no-constant-condition": "off",
  "arrow-body-style": ["error", "as-needed"],
  "block-scoped-var": "error",
  "default-case-last": "error",
  "default-param-last": "error",
  "eqeqeq": "error",
  "prefer-const": "warn",
  "prefer-destructuring": "warn",
  "prefer-object-spread": "warn",
  "prefer-spread": "warn",
  "prefer-rest-params": "warn",
  "prefer-template": "warn",
  "sort-imports": ["error", {
    "ignoreCase": false,
    "ignoreDeclarationSort": true,
    "ignoreMemberSort": true,
    "memberSyntaxSortOrder": ["none", "all", "single", "multiple"],
    "allowSeparatedGroups": false
  }],
  "require-await": "warn",
  "@stylistic/semi": ["error", "always"],
  "@stylistic/semi-spacing": "error",
  "@stylistic/member-delimiter-style": "error",
  "@stylistic/indent": ["error", 2],
  "@stylistic/indent-binary-ops": ["error", 2],
  "@stylistic/block-spacing": "error",
  "@stylistic/function-call-spacing": "error",
  "@stylistic/arrow-spacing": "error",
  "@stylistic/brace-style": ["error", "1tbs"],
  "@stylistic/comma-spacing": "error",
  "@stylistic/computed-property-spacing": "error",
  "@stylistic/dot-location": ["error", "object"],
  "@stylistic/key-spacing": ["error", { 
    afterColon: true, 
    beforeColon: false,
  }],
  "@stylistic/keyword-spacing": "error",
  "@stylistic/lines-between-class-members": "error",
  "@stylistic/max-len": ["error", { 
    code: 90,
    tabWidth: 2,
    ignoreComments: true,
    ignoreStrings: true,
    ignoreTemplateLiterals: true,
    ignoreUrls: true,
    ignoreRegExpLiterals: true,
    ignorePattern: "^import\\s.+\\sfrom\\s.+;?"
  }],
  "@stylistic/new-parens": "error",
  "@stylistic/newline-per-chained-call": ["error", { "ignoreChainWithDepth": 2 }],
  "@stylistic/no-confusing-arrow": "error",
  "@stylistic/no-floating-decimal": "error",
  "@stylistic/no-mixed-operators": "error",
  "@stylistic/no-multi-spaces": "error",
  "@stylistic/no-whitespace-before-property": "error",
  "@stylistic/operator-linebreak": ["error", "before"],
  "@stylistic/rest-spread-spacing": "error",
  "@stylistic/space-in-parens": "error",
  "@stylistic/space-infix-ops": "error",
  "@stylistic/space-unary-ops": "error",
  "@stylistic/space-before-blocks": "error",
  "@stylistic/switch-colon-spacing": "error",
  "@stylistic/template-tag-spacing": "error",
  "@stylistic/type-annotation-spacing": "error",
  "@stylistic/type-generic-spacing": "error",
  "@stylistic/type-named-tuple-spacing": "error",
  "@stylistic/wrap-iife": ["error", "inside"],
  "@stylistic/yield-star-spacing": "error",

  "@stylistic/jsx-closing-bracket-location": "error",
  "@stylistic/jsx-closing-tag-location": "error",
  "@stylistic/jsx-equals-spacing": "error",
  "@stylistic/jsx-indent": ["error", 2],
  "@stylistic/jsx-indent-props": ["error", 2],
  "@stylistic/jsx-tag-spacing": ["error", { "beforeSelfClosing": "always" }],
  "@stylistic/jsx-wrap-multilines": ["error", {
    declaration: "parens-new-line",
    assignment: "parens-new-line",
    return: "parens-new-line",
    arrow: "parens-new-line",
    logical: "parens-new-line",
    prop: "parens-new-line"
  }],
  
};

export default [
  js.configs.recommended,
  // configure .js .jsx .cjs .mjs .ts .tsx file
  {
    plugins: {
      '@stylistic': stylistic,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      }
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      ...rulesForJsOrTsSnippet
    }
  },
  // 🚀 项目中如果不使用vue，请注释掉这一行代码
  ...vue.configs["flat/recommended"],
  react.configs.flat?.recommended,
  // 🚀 项目中如果不使用vue, 请注释掉下面这个 {} 里的代码
  // configure .vue file
  {
    files: ["**/*.vue"],
    plugins: {
      '@stylistic': stylistic,
      vue
    },
    languageOptions: {
      parser: vue_eslint_parser,
      // fix the conflicts between vue-eslint-parser and typescript-eslint-parser
      // refer: https://eslint.vuejs.org/user-guide/#what-is-the-use-the-latest-vue-eslint-parser-error
      parserOptions: {
        parser: "@typescript-eslint/parser",
        ecmaVersion: 2020,
        sourceType: "module"
      },
    },
    rules: {
      ...rulesForJsOrTsSnippet,
      "vue/no-unused-vars": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "off",
      "vue/multi-word-component-names": "off"
    }
  },
  {
    ignores: ['**/dist', '**/node_modules', "packages/layout/**/*.min.js",
      "packages/vite-config/**/*.js"]
  }
];