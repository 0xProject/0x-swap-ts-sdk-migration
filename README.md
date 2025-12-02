# Migrating from @0x/swap-ts-sdk

The `@0x/swap-ts-sdk` package is being retired. This guide shows how to use `@hey-api/openapi-ts` as an alternative if you want a type-safe SDK generated from the 0x API OpenAPI specification.

## Why @hey-api/openapi-ts?

If you prefer a type-safe SDK over raw `fetch` calls, `@hey-api/openapi-ts` is a great option:

- **Full SDK generation** - Generates complete typed SDK with functions, not just types
- **Self-updating** - Regenerate from the latest OpenAPI spec anytime with `npm run generate`
- **Standard fetch** - Uses native fetch API under the hood
- **Type-safe** - Full TypeScript types for requests, responses, and errors
- **Plugin ecosystem** - Supports Zod validation, TanStack Query integration, etc.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate the SDK

```bash
npm run generate
```

This fetches the OpenAPI spec from 0x and generates the typed SDK in `src/client/`.

### 3. Use the SDK

```typescript
import { swapAllowanceHolderGetPrice } from "./client/sdk.gen";

// Define headers for authentication
const headers = {
  "0x-api-key": "YOUR_API_KEY",
  "0x-version": "v2",
} as const;

// Make API calls
const { data, error } = await swapAllowanceHolderGetPrice({
  headers,
  query: {
    chainId: 1,
    sellToken: "0x...",
    buyToken: "0x...",
    sellAmount: "1000000",
  },
});

if (error) {
  console.error("Error:", error);
  return;
}

// Check liquidity is available (narrows the response type)
if (!data.liquidityAvailable) {
  console.error("No liquidity available");
  return;
}

console.log("Buy amount:", data.buyAmount);
```

---

## Migration Guide

### Client Setup

**@0x/swap-ts-sdk:**
```typescript
import { createClientV2 } from "@0x/swap-ts-sdk";

const client = createClientV2({ apiKey: "YOUR_API_KEY" });
```

**@hey-api/openapi-ts:**
```typescript
// Define headers once, pass to each call
const headers = {
  "0x-api-key": "YOUR_API_KEY",
  "0x-version": "v2",
} as const;
```

### Get Price (Allowance Holder)

**@0x/swap-ts-sdk:**
```typescript
const price = await client.swap.allowanceHolder.getPrice.query({
  chainId: 8453,
  sellToken: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  buyToken: "0x4200000000000000000000000000000000000006",
  sellAmount: "100000",
});
```

**@hey-api/openapi-ts:**
```typescript
import { swapAllowanceHolderGetPrice } from "./client/sdk.gen";

const { data: price, error } = await swapAllowanceHolderGetPrice({
  headers,
  query: {
    chainId: 8453,
    sellToken: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    buyToken: "0x4200000000000000000000000000000000000006",
    sellAmount: "100000",
  },
});

if (error) {
  console.error("Error:", error);
  return;
}
console.log("Price:", price);
```

### Get Quote (Allowance Holder)

**@0x/swap-ts-sdk:**
```typescript
const quote = await client.swap.allowanceHolder.getQuote.query({
  chainId: 8453,
  sellToken: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  buyToken: "0x4200000000000000000000000000000000000006",
  sellAmount: "100000",
  taker: "0x...",
});
```

**@hey-api/openapi-ts:**
```typescript
import { swapAllowanceHolderGetQuote } from "./client/sdk.gen";

const { data: quote, error } = await swapAllowanceHolderGetQuote({
  headers,
  query: {
    chainId: 8453,
    sellToken: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    buyToken: "0x4200000000000000000000000000000000000006",
    sellAmount: "100000",
    taker: "0x...",
  },
});
```

### Get Price (Permit2)

**@0x/swap-ts-sdk:**
```typescript
const price = await client.swap.permit2.getPrice.query({
  chainId: 1,
  sellToken: "0x...",
  buyToken: "0x...",
  sellAmount: "1000000",
});
```

**@hey-api/openapi-ts:**
```typescript
import { swapPermit2GetPrice } from "./client/sdk.gen";

const { data: price, error } = await swapPermit2GetPrice({
  headers,
  query: {
    chainId: 1,
    sellToken: "0x...",
    buyToken: "0x...",
    sellAmount: "1000000",
  },
});
```

### Gasless Submit (POST)

**@0x/swap-ts-sdk:**
```typescript
const result = await client.gasless.submit.mutate({
  trade: { /* ... */ },
  signature: "0x...",
});
```

**@hey-api/openapi-ts:**
```typescript
import { gaslessSubmit } from "./client/sdk.gen";

const { data: result, error } = await gaslessSubmit({
  headers,
  body: {
    trade: { /* ... */ },
    signature: "0x...",
  },
});
```

### Error Handling

**@0x/swap-ts-sdk - throws exceptions:**
```typescript
try {
  const price = await client.swap.permit2.getPrice.query({ /* ... */ });
} catch (error) {
  console.error("API error:", error);
}
```

**@hey-api/openapi-ts - returns { data, error }:**
```typescript
const { data: price, error } = await swapPermit2GetPrice({ headers, query: { /* ... */ } });

if (error) {
  console.error("API error:", error);
  return;
}

// Check liquidity is available (narrows the union type)
if (!price.liquidityAvailable) {
  console.error("No liquidity available");
  return;
}

// price is now typed with all fields available
console.log(price.buyAmount);
```

---

## API Endpoint Mapping

| @0x/swap-ts-sdk | @hey-api/openapi-ts | HTTP Endpoint |
|-------------------|----------------|---------------|
| `client.swap.allowanceHolder.getPrice.query()` | `swapAllowanceHolderGetPrice()` | GET /swap/allowance-holder/price |
| `client.swap.allowanceHolder.getQuote.query()` | `swapAllowanceHolderGetQuote()` | GET /swap/allowance-holder/quote |
| `client.swap.permit2.getPrice.query()` | `swapPermit2GetPrice()` | GET /swap/permit2/price |
| `client.swap.permit2.getQuote.query()` | `swapPermit2GetQuote()` | GET /swap/permit2/quote |
| `client.swap.chains.query()` | `swapChains()` | GET /swap/chains |
| `client.gasless.getPrice.query()` | `gaslessGetPrice()` | GET /gasless/price |
| `client.gasless.getQuote.query()` | `gaslessGetQuote()` | GET /gasless/quote |
| `client.gasless.submit.mutate()` | `gaslessSubmit()` | POST /gasless/submit |
| `client.gasless.getStatus.query()` | `gaslessGetStatus()` | GET /gasless/status |
| `client.gasless.chains.query()` | `gaslessChains()` | GET /gasless/chains |
| `client.gasless.getGaslessApprovalTokens.query()` | `gaslessGetGaslessApprovalTokens()` | GET /gasless/gasless-approval-tokens |
| `client.sources.query()` | `sourcesGetSources()` | GET /sources |

---

## Key Differences

| Feature | @0x/swap-ts-sdk | @hey-api/openapi-ts |
|---------|----------------------|---------------------------|
| **Pattern** | `client.router.method.query()` | `functionName({ headers, query/body })` |
| **Setup** | `createClientV2({ apiKey })` | Define `headers` object, pass to each call |
| **Response** | Returns data directly | Returns `{ data, error }` |
| **Errors** | Throws exceptions | Returns typed error object |
| **Types** | From tRPC router | Generated from OpenAPI spec |
| **Regeneration** | N/A (internal package) | `npm run generate` anytime |

---

## Running the Example

1. Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

2. Edit `.env`:

```
ZERO_EX_API_KEY=your_api_key_here
PRIVATE_KEY=your_private_key_here
RPC_URL=https://base-mainnet.g.alchemy.com/v2/your_key
```

3. Run the example:

```bash
bun run src/examples/swap-allowance-holder.ts
```

---

## Regenerating the SDK

To update the SDK when the 0x API changes:

```bash
npm run generate
```

This fetches the latest OpenAPI spec and regenerates all types and SDK functions.

---

## Resources

- [0x API Documentation](https://0x.org/docs/api)
- [0x Dashboard](https://dashboard.0x.org) - Get your API key
- [@hey-api/openapi-ts Documentation](https://heyapi.dev/)
- [OpenAPI Specification](https://0x.org/docs/redocusaurus/plugin-redoc-0.yaml)
