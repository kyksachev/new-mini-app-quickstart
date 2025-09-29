export type Token = {
  address: `0x${string}`;
  symbol: string;
  decimals: number;
  name?: string;
  logo?: string;
};

// Minimal curated list for Base
export const TOKENS: Token[] = [
  { address: "0x4200000000000000000000000000000000000006", symbol: "WETH", decimals: 18, name: "Wrapped Ether" },
  { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", symbol: "USDC", decimals: 6, name: "USD Coin" },
  { address: "0x50C5725949A6F0c72E6C4a641F24049A917DB0Cb", symbol: "DAI", decimals: 18, name: "DAI Stablecoin" },
];

export function findToken(addrOrSymbol: string): Token | undefined {
  const key = addrOrSymbol.toLowerCase();
  return TOKENS.find(t => t.address.toLowerCase() === key || t.symbol.toLowerCase() === key);
}


