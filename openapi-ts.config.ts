import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "https://raw.githubusercontent.com/0xProject/0x-docs/refs/heads/main/fern/openapi.yaml",
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
