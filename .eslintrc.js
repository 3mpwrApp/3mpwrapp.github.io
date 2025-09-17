/**
 * Project ESLint configuration
 * - Adds TypeScript-aware module resolution so `import/no-unresolved` works
 * - Enables Node resolver for JS/TS extensions
 */
module.exports = {
  extends: ["expo"],
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: ["./tsconfig.json"],
      },
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
};
