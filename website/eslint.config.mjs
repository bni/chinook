import { defineConfig, globalIgnores } from "eslint/config";
import nextTs from "eslint-config-next/typescript";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextTs,
  ...nextVitals,
  globalIgnores([
    "dist/**",
    ".next/**",
    "next-env.d.ts"
  ]),
  {
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
      "eol-last": "warn",
      "sort-imports": "warn",
      "react-hooks/set-state-in-effect": "off" // https://github.com/facebook/react/issues/34743
    }
  }
]);

export default eslintConfig;
