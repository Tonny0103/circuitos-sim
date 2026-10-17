import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "node_modules/**",
    "coverage/**",
    "build/**",
    "dist/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
  {
    files: ["src/domain/**/*.ts", "src/engine/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "react",
            "react/**",
            "next/**",
            "@/ui/**",
            "@/editor/**",
            "@/persistence/**",
            "@/sharing/**",
            "../ui/**",
            "../editor/**",
            "../persistence/**",
            "../sharing/**",
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        "window",
        "document",
        "localStorage",
        "navigator",
        "fetch",
      ],
    },
  },
]);
