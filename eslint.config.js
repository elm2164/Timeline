import pluginJs from "@eslint/js"
import configPrettier from "eslint-config-prettier"
import importPlugin from "eslint-plugin-import"
import pluginNoRelativeImportPath from "eslint-plugin-no-relative-import-paths"
import pluginReact from "eslint-plugin-react"
import pluginReactHooks from "eslint-plugin-react-hooks"
import globals from "globals"
import tseslint from "typescript-eslint"

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
  },
  {
    ignores: ["app-script/*", "dist/*", "**/@types/*"],
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  configPrettier,
  {
    plugins: {
      import: importPlugin,
      "no-relative-import-paths": pluginNoRelativeImportPath,
      "react-hooks": pluginReactHooks,
    },
    rules: {
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-vars": "warn",

      "react-hooks/exhaustive-deps": "warn",

      "no-relative-import-paths/no-relative-import-paths": [
        "error",
        {
          allowSameFolder: false,
          rootDir: "./src",
        },
      ],

      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          pathGroups: [
            {
              pattern: "{react,react-dom/**,react-router-dom}",
              group: "builtin",
              position: "before",
            },
            {
              pattern: "@src/**",
              group: "parent",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          alphabetize: {
            order: "asc",
          },
          "newlines-between": "never",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],
    },
  },
]
