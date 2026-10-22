import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "docs", "supabase", "src/mocks/dummy-data.ts"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    // shadcn/ui 컴포넌트는 variants 상수를 함께 export 함
    files: ["src/components/ui/**/*.tsx"],
    rules: { "react-refresh/only-export-components": "off" },
  },
  {
    files: ["scripts/**/*.mjs", "*.config.{js,ts}"],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
);
