"use client";
import { useMemo, useState } from "react";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { erc20Abi, parseUnits, formatUnits } from "viem";
import { FACTORY_ADDRESS, ROUTER_ADDRESS, DEFAULT_SLIPPAGE_BPS, V3_QUOTER_ADDRESS, V3_ROUTER_ADDRESS, V3_FEE_DEFAULT, WETH_ADDRESS } from "../../lib/swap/config";
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

// Uniswap v3 minimal ABIs
const V3_QUOTER_ABI = [
  // Quoter V2: returns tuple
  { "type":"function","stateMutability":"nonpayable","name":"quoteExactInputSingle","inputs":[{"name":"params","type":"tuple","components":[{"name":"tokenIn","type":"address"},{"name":"tokenOut","type":"address"},{"name":"fee","type":"uint24"},{"name":"amountIn","type":"uint256"},{"name":"sqrtPriceLimitX96","type":"uint160"}]}],"outputs":[{"name":"amountOut","type":"uint256"},{"name":"sqrtPriceX96After","type":"uint160"},{"name":"initializedTicksCrossed","type":"uint32"},{"name":"gasEstimate","type":"uint256"}] },
  // Quoter V1 fallback signature (some deployments)
  { "type":"function","stateMutability":"view","name":"quoteExactInputSingle","inputs":[{"name":"tokenIn","type":"address"},{"name":"tokenOut","type":"address"},{"name":"fee","type":"uint24"},{"name":"amountIn","type":"uint256"},{"name":"sqrtPriceLimitX96","type":"uint160"}],"outputs":[{"name":"amountOut","type":"uint256"}] }
];

const V3_ROUTER_ABI = [
  { "type":"function","stateMutability":"payable","name":"exactInputSingle","inputs":[{"name":"params","type":"tuple","components":[{"name":"tokenIn","type":"address"},{"name":"tokenOut","type":"address"},{"name":"fee","type":"uint24"},{"name":"recipient","type":"address"},{"name":"deadline","type":"uint256"},{"name":"amountIn","type":"uint256"},{"name":"amountOutMinimum","type":"uint256"},{"name":"sqrtPriceLimitX96","type":"uint160"}]}],"outputs":[{"name":"amountOut","type":"uint256"}] }
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
  const [slippageBps, setSlippageBps] = useState<number>(DEFAULT_SLIPPAGE_BPS);
  const [deadlineMin, setDeadlineMin] = useState<number>(20);

  function sanitizeDecimal(input: string): string {
    // Replace comma with dot, keep only digits and one dot
    let s = (input || "").replace(/,/g, ".").replace(/[^0-9.]/g, "");
    const parts = s.split(".");
    if (parts.length > 2) {
      s = parts.shift() + "." + parts.join("");
    }
    return s;
  }

  const amountIn = useMemo(() => {
    const clean = sanitizeDecimal(amountInRaw);
    if (!clean) return 0n;
    try {
      return parseUnits(clean, tokenIn.decimals);
    } catch {
      return 0n;
    }
  }, [amountInRaw, tokenIn.decimals]);

  // getPair
  const { data: pairAddr } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: V2_FACTORY_ABI,
    functionName: "getPair",
    args: [tokenIn.address, tokenOut.address],
    query: { enabled: !!FACTORY_ADDRESS && !!tokenIn && !!tokenOut }
  });

  // reserves (v2 path)
  const { data: reserves } = useReadContract({
    address: (pairAddr as `0x${string}`) || undefined,
    abi: V2_PAIR_ABI,
    functionName: "getReserves",
    query: { enabled: !!pairAddr }
  });

  // v2 hop via WETH
  const { data: pairInWeth } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: V2_FACTORY_ABI,
    functionName: "getPair",
    args: [tokenIn.address, WETH_ADDRESS as `0x${string}`],
    query: { enabled: !!FACTORY_ADDRESS && !!WETH_ADDRESS }
  });
  const { data: reservesInWeth } = useReadContract({
    address: (pairInWeth as `0x${string}`) || undefined,
    abi: V2_PAIR_ABI,
    functionName: "getReserves",
    query: { enabled: !!pairInWeth }
  });
  const { data: pairWethOut } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: V2_FACTORY_ABI,
    functionName: "getPair",
    args: [WETH_ADDRESS as `0x${string}`, tokenOut.address],
    query: { enabled: !!FACTORY_ADDRESS && !!WETH_ADDRESS }
  });
  const { data: reservesWethOut } = useReadContract({
    address: (pairWethOut as `0x${string}`) || undefined,
    abi: V2_PAIR_ABI,
    functionName: "getReserves",
    query: { enabled: !!pairWethOut }
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

  const hopReserves1 = useMemo(() => {
    const t = reservesInWeth as Reserves | undefined;
    if (!t) return [0n, 0n] as const;
    const token0IsIn = tokenIn.address.toLowerCase() < (WETH_ADDRESS as string).toLowerCase();
    const r0 = t[0] ?? 0n;
    const r1 = t[1] ?? 0n;
    return token0IsIn ? [r0, r1] as const : [r1, r0] as const;
  }, [reservesInWeth, tokenIn.address]);
  const hopReserves2 = useMemo(() => {
    const t = reservesWethOut as Reserves | undefined;
    if (!t) return [0n, 0n] as const;
    const token0IsIn = (WETH_ADDRESS as string).toLowerCase() < tokenOut.address.toLowerCase();
    const r0 = t[0] ?? 0n;
    const r1 = t[1] ?? 0n;
    return token0IsIn ? [r0, r1] as const : [r1, r0] as const;
  }, [reservesWethOut, tokenOut.address]);

  // v2 quote (direct pair). Will be used if no v3 quoter configured
  const v2Quote = useMemo(() => {
    if (!amountIn || !reserveIn || !reserveOut) return 0n;
    return amountOutGivenIn(amountIn, reserveIn, reserveOut, 30);
  }, [amountIn, reserveIn, reserveOut]);

  const v2QuoteHop = useMemo(() => {
    if (!amountIn || !hopReserves1[0] || !hopReserves1[1] || !hopReserves2[0] || !hopReserves2[1]) return 0n;
    const out1 = amountOutGivenIn(amountIn, hopReserves1[0], hopReserves1[1], 30);
    if (!out1) return 0n;
    const out2 = amountOutGivenIn(out1, hopReserves2[0], hopReserves2[1], 30);
    return out2;
  }, [amountIn, hopReserves1, hopReserves2]);

  // v3 quote via Quoter (single pool, default fee)
  type V3QuoteParams = { tokenIn: `0x${string}`; tokenOut: `0x${string}`; fee: number; amountIn: bigint; sqrtPriceLimitX96: bigint };
  const v3Params: V3QuoteParams | undefined = V3_QUOTER_ADDRESS ? {
    tokenIn: tokenIn.address as `0x${string}`,
    tokenOut: tokenOut.address as `0x${string}`,
    fee: V3_FEE_DEFAULT,
    amountIn,
    sqrtPriceLimitX96: 0n,
  } : undefined;

  const { data: v3QuoteData } = useReadContract({
    address: (V3_QUOTER_ADDRESS as `0x${string}`) || undefined,
    abi: V3_QUOTER_ABI,
    functionName: "quoteExactInputSingle",
    args: v3Params ? [v3Params] : undefined,
    query: { enabled: !!V3_QUOTER_ADDRESS && !!amountIn }
  });

  const quoteOut = useMemo(() => {
    if (v3QuoteData) {
      // QuoterV2 returns tuple; V1 returns single value
      if (Array.isArray(v3QuoteData)) {
        const first = v3QuoteData[0] as bigint;
        return first ?? 0n;
      }
      return (v3QuoteData as bigint) ?? 0n;
    }
    return v2Quote;
  }, [v3QuoteData, v2Quote]);

  const minOut = useMemo(() => quoteOut ? (quoteOut * BigInt(10000 - slippageBps)) / 10000n : 0n, [quoteOut, slippageBps]);

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
    const deadline = BigInt(Math.floor(Date.now() / 1000) + deadlineMin * 60);
    if (V3_ROUTER_ADDRESS) {
      type V3SwapParams = { tokenIn: `0x${string}`; tokenOut: `0x${string}`; fee: number; recipient: `0x${string}`; deadline: bigint; amountIn: bigint; amountOutMinimum: bigint; sqrtPriceLimitX96: bigint };
      const params: V3SwapParams = {
        tokenIn: tokenIn.address as `0x${string}`,
        tokenOut: tokenOut.address as `0x${string}`,
        fee: V3_FEE_DEFAULT,
        recipient: address as `0x${string}`,
        deadline,
        amountIn,
        amountOutMinimum: minOut,
        sqrtPriceLimitX96: 0n,
      };
      writeContract({
        address: V3_ROUTER_ADDRESS as `0x${string}`,
        abi: V3_ROUTER_ABI,
        functionName: "exactInputSingle",
        args: [params]
      });
    } else {
      const useHop = v2QuoteHop > v2Quote;
      const path = useHop ? [tokenIn.address, WETH_ADDRESS as `0x${string}`, tokenOut.address] : [tokenIn.address, tokenOut.address];
      writeContract({
        address: ROUTER_ADDRESS as `0x${string}`,
        abi: V2_ROUTER_ABI,
        functionName: "swapExactTokensForTokens",
        args: [amountIn, minOut, path, address, deadline]
      });
    }
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
            <input value={amountInRaw} onChange={e => setAmountInRaw(sanitizeDecimal(e.target.value))} placeholder="0.0" style={{ flex: 1 }} />
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

        <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
          <div>
            Slippage:
            {[10, 50, 100].map(v => (
              <button key={v} onClick={() => setSlippageBps(v)} style={{ marginLeft: 6, border: `1px solid ${slippageBps===v?"#00d4ff":"var(--border)"}`, background: slippageBps===v?"rgba(0,212,255,.1)":"transparent", color: slippageBps===v?"#00d4ff":"#fff", borderRadius: 8, padding: ".2rem .5rem" }}>{v/100}%</button>
            ))}
            <input value={(slippageBps/100).toString()} onChange={e=>{
              const num = Number(e.target.value.replace(",","."));
              if (!Number.isFinite(num) || num<0 || num>50) return; // 0..50%
              setSlippageBps(Math.round(num*100));
            }} style={{ width: 60, marginLeft: 8 }} />%
          </div>
          <div>
            Deadline:
            <input value={deadlineMin} onChange={e=>{ const n = Number(e.target.value); if(Number.isFinite(n) && n>0 && n<120){ setDeadlineMin(n);} }} style={{ width: 60, marginLeft: 6 }} /> min
          </div>
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


