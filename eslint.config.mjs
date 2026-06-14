import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "next-env.d.ts",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // L'application est intégralement en français : les apostrophes typographiques
      // et droites dans le texte JSX sont volontaires et lisibles telles quelles.
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
