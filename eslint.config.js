const js = require("@eslint/js");
const prettier = require("eslint-config-prettier");
const prettierPlugin = require("eslint-plugin-prettier");

module.exports = [
  // Ignore config files and build directories
  {
    ignores: [
      "node_modules/",
      ".vercel/",
      "dist/",
      "build/",
      "eslint.config.js",
    ],
  },

  // Base config
  js.configs.recommended,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettier.rules,
      "prettier/prettier": "warn",
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

  // Browser files (game.js, modals.js, articles.js)
  {
    files: ["game.js", "modals.js", "articles.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
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
        articles: "readonly",
        fuzzball: "readonly",
      },
    },
  },

  // Node.js files (scrapers, batch processor)
  {
    files: ["scraper.js", "batch-processor.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
      },
    },
  },
];
