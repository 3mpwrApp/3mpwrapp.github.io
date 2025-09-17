// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      "dist/*",
      ".expo/*",
      // Admin restored; re-enable lint by removing ignore
      "server/**",
    ],
  },
  {
    files: ["scripts/**/*.js"],
    languageOptions: {
      globals: {
        __dirname: "readonly",
        require: "readonly",
        module: "readonly",
        process: "readonly",
      },
      ecmaVersion: 2021,
      sourceType: "script",
    },
    linterOptions: { reportUnusedDisableDirectives: true },
    rules: {
      "no-unused-vars": "off",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-redeclare": [
        "warn",
        { ignoreDeclarationMerge: true },
      ],
      "import/no-named-as-default": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
]);
