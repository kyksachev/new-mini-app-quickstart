export const BASE_CHAIN_ID = 8453;

export const ROUTER_ADDRESS = process.env.NEXT_PUBLIC_UNISWAP_V2_ROUTER_ADDRESS || "";
export const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_UNISWAP_V2_FACTORY_ADDRESS || "";
export const WETH_ADDRESS = process.env.NEXT_PUBLIC_BASE_WETH_ADDRESS || "";

export const DEFAULT_SLIPPAGE_BPS = 50; // 0.50%
export const DEFAULT_DEADLINE_MINUTES = 20;

export function getDeadline(): bigint {
  const now = Math.floor(Date.now() / 1000);
  return BigInt(now + DEFAULT_DEADLINE_MINUTES * 60);
}


