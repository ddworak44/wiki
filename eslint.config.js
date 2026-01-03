import js from "@eslint/js";
import prettier from "eslint-plugin-prettier/recommended";

export default [
  js.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
        alert: "readonly",
        confirm: "readonly",
        localStorage: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        // Your app globals
        articles: "readonly",
        fuzzball: "readonly",
      },
    },
    rules: {
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-console": "off",
      "no-debugger": "warn",
      "prefer-const": "warn",
      "no-var": "warn",
      eqeqeq: ["warn", "always"],
      curly: ["warn", "all"],
      "no-undef": "error",
    },
  },
  {
    ignores: ["node_modules/", ".vercel/", "dist/", "build/"],
  },
];
