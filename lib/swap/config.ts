export const BASE_CHAIN_ID = 8453;

export const ROUTER_ADDRESS = process.env.NEXT_PUBLIC_UNISWAP_V2_ROUTER_ADDRESS || "";
export const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_UNISWAP_V2_FACTORY_ADDRESS || "";
export const WETH_ADDRESS = process.env.NEXT_PUBLIC_BASE_WETH_ADDRESS || "";

// Optional Uniswap v3 integration (recommended for production)
export const V3_ROUTER_ADDRESS = process.env.NEXT_PUBLIC_UNISWAP_V3_ROUTER_ADDRESS || ""; // e.g. SwapRouter02
export const V3_QUOTER_ADDRESS = process.env.NEXT_PUBLIC_UNISWAP_V3_QUOTER_ADDRESS || ""; // Quoter (v1 or v2)
export const V3_FEE_DEFAULT: number = Number(process.env.NEXT_PUBLIC_UNISWAP_V3_FEE || 3000); // 0.3%

export const DEFAULT_SLIPPAGE_BPS = 50; // 0.50%
export const DEFAULT_DEADLINE_MINUTES = 20;

export function getDeadline(): bigint {
  const now = Math.floor(Date.now() / 1000);
  return BigInt(now + DEFAULT_DEADLINE_MINUTES * 60);
}


