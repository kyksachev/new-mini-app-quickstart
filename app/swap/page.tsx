"use client";
import { useMemo, useState } from "react";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { erc20Abi, parseUnits, formatUnits } from "viem";
import { FACTORY_ADDRESS, ROUTER_ADDRESS, DEFAULT_SLIPPAGE_BPS, getDeadline } from "../../lib/swap/config";
import { TOKENS, Token } from "../../lib/swap/tokens";

const V2_FACTORY_ABI = [{
  "inputs": [{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"}],
  "name":"getPair","outputs":[{"internalType":"address","name":"pair","type":"address"}],"stateMutability":"view","type":"function"
}];

const V2_PAIR_ABI = [{
  "inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"reserve0","type":"uint112"},{"internalType":"uint112","name":"reserve1","type":"uint112"},{"internalType":"uint32","name":"blockTimestampLast","type":"uint32"}],"stateMutability":"view","type":"function"
}];

const V2_ROUTER_ABI = [
  {"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"}
];

function amountOutGivenIn(amountIn: bigint, reserveIn: bigint, reserveOut: bigint, feeBps = 30): bigint {
  // Uniswap v2 formula with 0.30% fee: amountOut = amountIn * 997 * reserveOut / (reserveIn*1000 + amountIn*997)
  const feeMultiplier = 1000n - BigInt(feeBps);
  const amountInWithFee = amountIn * feeMultiplier;
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * 1000n + amountInWithFee;
  return numerator / denominator;
}

export default function SwapPage() {
  const { address } = useAccount();
  const [tokenIn, setTokenIn] = useState<Token>(TOKENS[1]); // USDC
  const [tokenOut, setTokenOut] = useState<Token>(TOKENS[0]); // WETH
  const [amountInRaw, setAmountInRaw] = useState("");
  const amountIn = useMemo(() => amountInRaw ? parseUnits(amountInRaw || "0", tokenIn.decimals) : 0n, [amountInRaw, tokenIn.decimals]);

  // getPair
  const { data: pairAddr } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: V2_FACTORY_ABI,
    functionName: "getPair",
    args: [tokenIn.address, tokenOut.address],
    query: { enabled: !!FACTORY_ADDRESS && !!tokenIn && !!tokenOut }
  });

  // reserves
  const { data: reserves } = useReadContract({
    address: (pairAddr as `0x${string}`) || undefined,
    abi: V2_PAIR_ABI,
    functionName: "getReserves",
    query: { enabled: !!pairAddr }
  });

  type Reserves = readonly [bigint, bigint, number];
  const [reserveIn, reserveOut] = useMemo(() => {
    const tuple = reserves as Reserves | undefined;
    if (!tuple) return [0n, 0n] as const;
    // Assume token ordering by address to match pair's token0/token1; for MVP we just map by lexical order
    const token0IsIn = tokenIn.address.toLowerCase() < tokenOut.address.toLowerCase();
    const r0 = tuple[0] ?? 0n;
    const r1 = tuple[1] ?? 0n;
    return token0IsIn ? [r0, r1] as const : [r1, r0] as const;
  }, [reserves, tokenIn.address, tokenOut.address]);

  const quoteOut = useMemo(() => {
    if (!amountIn || !reserveIn || !reserveOut) return 0n;
    return amountOutGivenIn(amountIn, reserveIn, reserveOut, 30);
  }, [amountIn, reserveIn, reserveOut]);

  const minOut = useMemo(() => quoteOut ? (quoteOut * BigInt(10000 - DEFAULT_SLIPPAGE_BPS)) / 10000n : 0n, [quoteOut]);

  // allowance & approve
  const { data: allowance } = useReadContract({
    address: tokenIn.address,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address || "0x0000000000000000000000000000000000000000", ROUTER_ADDRESS as `0x${string}`],
    query: { enabled: !!address && !!ROUTER_ADDRESS }
  });

  const needsApprove = useMemo(() => {
    const allowanceValue: bigint = (allowance as bigint) ?? 0n;
    return !!amountIn && allowanceValue < amountIn;
  }, [allowance, amountIn]);

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const doApprove = () => {
    if (!address) return;
    writeContract({ address: tokenIn.address, abi: erc20Abi, functionName: "approve", args: [ROUTER_ADDRESS as `0x${string}`, amountIn] });
  };

  const doSwap = () => {
    if (!address) return;
    const path = [tokenIn.address, tokenOut.address];
    writeContract({
      address: ROUTER_ADDRESS as `0x${string}`,
      abi: V2_ROUTER_ABI,
      functionName: "swapExactTokensForTokens",
      args: [amountIn, minOut, path, address, getDeadline()]
    });
  };

  return (
    <div>
      <h1>Swap</h1>
      <div style={{ display: "grid", gap: ".75rem", maxWidth: 500 }}>
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: ".75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: ".5rem" }}>
            <select value={tokenIn.symbol} onChange={e => setTokenIn(TOKENS.find(t => t.symbol === e.target.value) || TOKENS[0])}>
              {TOKENS.map(t => <option key={t.address} value={t.symbol}>{t.symbol}</option>)}
            </select>
            <input value={amountInRaw} onChange={e => setAmountInRaw(e.target.value)} placeholder="0.0" style={{ flex: 1 }} />
          </div>
        </div>
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: ".75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: ".5rem" }}>
            <select value={tokenOut.symbol} onChange={e => setTokenOut(TOKENS.find(t => t.symbol === e.target.value) || TOKENS[1])}>
              {TOKENS.map(t => <option key={t.address} value={t.symbol}>{t.symbol}</option>)}
            </select>
            <input value={quoteOut ? formatUnits(quoteOut, tokenOut.decimals) : ""} readOnly placeholder="0.0" style={{ flex: 1, opacity: .8 }} />
          </div>
        </div>

        <div style={{ fontSize: ".9rem", opacity: .8 }}>
          Min received: {minOut ? formatUnits(minOut, tokenOut.decimals) : "-"}
        </div>

        {!address && <div>Please connect wallet</div>}
        {address && needsApprove && <button onClick={doApprove} disabled={isPending}>Approve {tokenIn.symbol}</button>}
        {address && !needsApprove && <button onClick={doSwap} disabled={isPending || !amountIn || !quoteOut}>Swap</button>}
        {(isPending || isConfirming) && <div>Submitting...</div>}
        {isSuccess && <div>Transaction confirmed ✅</div>}
      </div>
    </div>
  );
}


