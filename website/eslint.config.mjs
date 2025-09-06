import { defineConfig, globalIgnores } from "eslint/config";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname
});

export default defineConfig([
  globalIgnores([
    ".next/*",
    "next-env.d.ts"
  ]), {
    extends: compat.extends("next/core-web-vitals", "next/typescript"),

    rules: {
      "indent": ["warn", 2],
      "quotes": ["warn", "double"],
      "prefer-const": "warn",
      "semi": "warn",
      "no-unused-vars": "warn",
      "no-useless-return": "warn",
      "object-curly-spacing": ["warn", "always"],
      "comma-dangle": ["warn", "never"],
      "no-multiple-empty-lines": ["warn", { "max": 1 }],
      "keyword-spacing": ["warn", { "before": true }],
      "space-before-blocks": "warn",
      "eol-last": "warn"
    }
  }
]);
