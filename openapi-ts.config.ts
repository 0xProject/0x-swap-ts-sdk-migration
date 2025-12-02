import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "https://0x.org/docs/redocusaurus/plugin-redoc-0.yaml",
  output: {
    path: "src/client",
    format: "prettier",
  },
  plugins: [
    "@hey-api/typescript",
    "@hey-api/sdk",
    {
      name: "@hey-api/client-fetch",
      bundle: true,
    },
  ],
});
