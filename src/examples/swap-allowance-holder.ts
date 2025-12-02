/**
 * Swap Example using 0x API with @hey-api/openapi-ts generated SDK
 *
 * This example demonstrates how to:
 * 1. Get an indicative price for a swap
 * 2. Check and set token allowance for AllowanceHolder
 * 3. Fetch a firm quote
 * 4. Execute the swap transaction
 *
 * Network: Base mainnet
 * Swap: 0.1 USDC -> WETH
 */

import "dotenv/config";
import {
  createWalletClient,
  http,
  getContract,
  erc20Abi,
  parseUnits,
  maxUint256,
  publicActions,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

// Import from the generated SDK
import {
  swapAllowanceHolderGetPrice,
  swapAllowanceHolderGetQuote,
} from "../client/sdk.gen";

// Load and validate environment variables
const { PRIVATE_KEY, ZERO_EX_API_KEY, RPC_URL } = process.env;

if (!PRIVATE_KEY) throw new Error("missing PRIVATE_KEY");
if (!ZERO_EX_API_KEY) throw new Error("missing ZERO_EX_API_KEY");
if (!RPC_URL) throw new Error("missing RPC_URL");

// Headers for 0x API authentication
const headers = {
  "0x-api-key": ZERO_EX_API_KEY,
  "0x-version": "v2",
} as const;

// Setup wallet client with viem
const walletClient = createWalletClient({
  account: privateKeyToAccount(`0x${PRIVATE_KEY}` as `0x${string}`),
  chain: base,
  transport: http(RPC_URL),
}).extend(publicActions);

// Token contracts on Base
const USDC_ADDRESS = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";

const usdc = getContract({
  address: USDC_ADDRESS,
  abi: erc20Abi,
  client: walletClient,
});

async function main() {
  const decimals = await usdc.read.decimals();
  const sellAmount = parseUnits("0.1", decimals);

  console.log("=".repeat(60));
  console.log("0x Swap Example - Using @hey-api/openapi-ts SDK");
  console.log("=".repeat(60));
  console.log(`Swapping 0.1 USDC -> WETH on Base`);
  console.log(`Taker: ${walletClient.account.address}`);
  console.log();

  // 1. Get indicative price
  console.log("1. Fetching indicative price...");
  const { data: price, error: priceError } = await swapAllowanceHolderGetPrice({
    headers,
    query: {
      chainId: walletClient.chain.id,
      sellToken: usdc.address,
      buyToken: WETH_ADDRESS,
      sellAmount: sellAmount.toString(),
    },
  });

  if (priceError) {
    console.error("Price error:", priceError);
    return;
  }

  if (!price.liquidityAvailable) {
    console.error("No liquidity available for this swap");
    return;
  }

  console.log("Price response:");
  console.log(`  Buy amount: ${price.buyAmount} WETH (wei)`);
  console.log(`  Gas estimate: ${price.gas}`);
  console.log();

  // 2. Check and set allowance if needed
  if (price.issues?.allowance) {
    console.log("2. Setting token allowance for AllowanceHolder...");
    const spender = price.issues.allowance.spender as `0x${string}`;

    const { request } = await usdc.simulate.approve([spender, maxUint256]);
    const approvalHash = await usdc.write.approve(request.args);

    console.log(`  Approval tx: ${approvalHash}`);
    const receipt = await walletClient.waitForTransactionReceipt({
      hash: approvalHash,
    });
    console.log(`  Status: ${receipt.status}`);
    console.log();
  } else {
    console.log("2. Token allowance already set, skipping approval");
    console.log();
  }

  // 3. Fetch firm quote
  console.log("3. Fetching firm quote...");
  const { data: quote, error: quoteError } = await swapAllowanceHolderGetQuote({
    headers,
    query: {
      chainId: walletClient.chain.id,
      sellToken: usdc.address,
      buyToken: WETH_ADDRESS,
      sellAmount: sellAmount.toString(),
      taker: walletClient.account.address,
    },
  });

  if (quoteError) {
    console.error("Quote error:", quoteError);
    return;
  }

  if (!quote.liquidityAvailable) {
    console.error("No liquidity available for this swap");
    return;
  }

  console.log("Quote response:");
  console.log(`  Buy amount: ${quote.buyAmount} WETH (wei)`);
  console.log(`  Min buy amount: ${quote.minBuyAmount} WETH (wei)`);
  console.log(`  Transaction to: ${quote.transaction.to}`);
  console.log();

  // 4. Execute the swap
  console.log("4. Executing swap transaction...");
  const txHash = await walletClient.sendTransaction({
    to: quote.transaction.to as `0x${string}`,
    data: quote.transaction.data as `0x${string}`,
    value: quote.transaction.value
      ? BigInt(quote.transaction.value)
      : undefined,
    gas: quote.transaction.gas ? BigInt(quote.transaction.gas) : undefined,
  });

  console.log(`  Transaction hash: ${txHash}`);
  console.log(`  View on BaseScan: https://basescan.org/tx/${txHash}`);
  console.log();
  console.log("=".repeat(60));
  console.log("Swap complete!");
  console.log("=".repeat(60));
}

main().catch(console.error);
