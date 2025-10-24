import js from "@eslint/js";
import { globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "**/external/**"]),
  {
    files: ["**/*.{ts,tsx,js,mjs}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      "no-restricted-syntax": ["error", {
        "selector": "MethodDefinition[key.name='constructor'] CallExpression[callee.object.type='ThisExpression']",
        "message": "Do not call instance methods from constructors."
      }],
      "@typescript-eslint/unbound-method": ["error", {
        "ignoreStatic": true
      }]
    }
  },
]);
