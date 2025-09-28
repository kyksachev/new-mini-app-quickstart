"use client";
import { useState, useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
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
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize the miniapp
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Mock data for Base tokens - in real app, you'd fetch from API
  useEffect(() => {
    const mockTokens: Token[] = [
      {
        id: "1",
        name: "Ethereum",
        symbol: "ETH",
        price: 3245.67,
        priceChange24h: 2.34,
        volume24h: 15420000000,
        marketCap: 390000000000,
        logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
        address: "0x0000000000000000000000000000000000000000"
      },
      {
        id: "2",
        name: "USD Coin",
        symbol: "USDC",
        price: 1.00,
        priceChange24h: 0.01,
        volume24h: 3200000000,
        marketCap: 32000000000,
        logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
      },
      {
        id: "3",
        name: "Dai Stablecoin",
        symbol: "DAI",
        price: 1.00,
        priceChange24h: -0.02,
        volume24h: 450000000,
        marketCap: 5400000000,
        logo: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png",
        address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"
      },
      {
        id: "4",
        name: "Wrapped Bitcoin",
        symbol: "WBTC",
        price: 67543.21,
        priceChange24h: 1.87,
        volume24h: 890000000,
        marketCap: 10500000000,
        logo: "https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png",
        address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f"
      },
      {
        id: "5",
        name: "Aerodrome Finance",
        symbol: "AERO",
        price: 0.45,
        priceChange24h: -5.23,
        volume24h: 12000000,
        marketCap: 180000000,
        logo: "https://aerodrome.finance/aero-token.svg",
        address: "0x940181a94A35A4569E4529A3CDfB74e38FD98631"
      },
      {
        id: "6",
        name: "Brett",
        symbol: "BRETT",
        price: 0.0234,
        priceChange24h: 8.45,
        volume24h: 5600000,
        marketCap: 230000000,
        logo: "https://i.imgur.com/8QZQZQZ.png",
        address: "0x532fC0C4A6c3e7F3B2B2B2B2B2B2B2B2B2B2B2B2"
      }
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
                  <img src={token.logo} alt={token.name} className={styles.tokenLogo} />
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