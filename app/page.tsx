"use client";
import { useState, useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import Image from "next/image";
import { minikitConfig } from "../minikit.config";
import styles from "./page.module.css";

interface Token {
  id: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  logo: string;
  address: string;
}

export default function Home() {
  const { isFrameReady, setFrameReady } = useMiniKit();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize the miniapp
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Mock data for Farcaster Top 10 tokens - in real app, fetch from API
  useEffect(() => {
    const mockTokens: Token[] = [
      { id: "1", name: "DEGEN", symbol: "DEGEN", price: 0.0423, priceChange24h: 3.25, volume24h: 8200000, marketCap: 580000000, logo: "/tokens/degen.svg", address: "0x0000000000000000000000000000000000000001" },
      { id: "2", name: "Farcaster", symbol: "FRC", price: 2.13, priceChange24h: -1.12, volume24h: 4200000, marketCap: 210000000, logo: "/tokens/farcaster.svg", address: "0x0000000000000000000000000000000000000002" },
      { id: "3", name: "Warpcast", symbol: "WARP", price: 1.24, priceChange24h: 5.18, volume24h: 2600000, marketCap: 98000000, logo: "/tokens/warpcast.svg", address: "0x0000000000000000000000000000000000000003" },
      { id: "4", name: "Frames", symbol: "FRAME", price: 0.87, priceChange24h: -2.75, volume24h: 1400000, marketCap: 65000000, logo: "/tokens/frames.svg", address: "0x0000000000000000000000000000000000000004" },
      { id: "5", name: "Points", symbol: "POINTS", price: 0.34, priceChange24h: 1.05, volume24h: 980000, marketCap: 42000000, logo: "/tokens/points.svg", address: "0x0000000000000000000000000000000000000005" },
      { id: "6", name: "Cast", symbol: "CAST", price: 0.56, priceChange24h: 0.82, volume24h: 730000, marketCap: 38000000, logo: "/tokens/cast.svg", address: "0x0000000000000000000000000000000000000006" },
      { id: "7", name: "Warp", symbol: "WRP", price: 0.19, priceChange24h: -0.45, volume24h: 510000, marketCap: 22000000, logo: "/tokens/warp.svg", address: "0x0000000000000000000000000000000000000007" },
      { id: "8", name: "Chan", symbol: "CHAN", price: 0.92, priceChange24h: 6.12, volume24h: 1250000, marketCap: 56000000, logo: "/tokens/chan.svg", address: "0x0000000000000000000000000000000000000008" },
      { id: "9", name: "Castaway", symbol: "CSTWY", price: 0.12, priceChange24h: 2.03, volume24h: 310000, marketCap: 15000000, logo: "/tokens/castaway.svg", address: "0x0000000000000000000000000000000000000009" },
      { id: "10", name: "Purple", symbol: "PURP", price: 3.45, priceChange24h: -1.98, volume24h: 2100000, marketCap: 120000000, logo: "/tokens/purple.svg", address: "0x0000000000000000000000000000000000000010" },
    ];

    // Simulate API loading
    setTimeout(() => {
      setTokens(mockTokens);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredTokens = tokens.filter(token =>
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return `$${(volume / 1000000000).toFixed(2)}B`;
    } else if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(2)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(2)}K`;
    }
    return `$${volume.toFixed(2)}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000) {
      return `$${(marketCap / 1000000000).toFixed(2)}B`;
    } else if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(2)}M`;
    } else if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(2)}K`;
    }
    return `$${marketCap.toFixed(2)}`;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{minikitConfig.miniapp.name}</h1>
          <p className={styles.subtitle}>Base Network Token Tracker</p>
        </div>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </header>

      <main className={styles.main}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading tokens...</p>
          </div>
        ) : (
          <div className={styles.tokensGrid}>
            {filteredTokens.map((token) => (
              <div key={token.id} className={styles.tokenCard}>
                <div className={styles.tokenHeader}>
                  <Image 
                    src={token.logo} 
                    alt={token.name} 
                    width={48}
                    height={48}
                    className={styles.tokenLogo}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/tokens/default.svg';
                    }}
                  />
                  <div className={styles.tokenInfo}>
                    <h3 className={styles.tokenName}>{token.name}</h3>
                    <span className={styles.tokenSymbol}>{token.symbol}</span>
                  </div>
                </div>
                
                <div className={styles.tokenPrice}>
                  <span className={styles.price}>{formatPrice(token.price)}</span>
                  <span className={`${styles.priceChange} ${token.priceChange24h >= 0 ? styles.positive : styles.negative}`}>
                    {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                  </span>
                </div>

                <div className={styles.tokenStats}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>24h Volume</span>
                    <span className={styles.statValue}>{formatVolume(token.volume24h)}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Market Cap</span>
                    <span className={styles.statValue}>{formatMarketCap(token.marketCap)}</span>
                  </div>
                </div>

                <div className={styles.tokenAddress}>
                  <span className={styles.addressLabel}>Contract:</span>
                  <span className={styles.address}>{token.address.slice(0, 6)}...{token.address.slice(-4)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}