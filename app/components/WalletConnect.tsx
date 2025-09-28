"use client";
import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useBalance, WagmiProvider } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import styles from "./WalletConnect.module.css";

// Wagmi configuration
const queryClient = new QueryClient();

const config = createConfig({
  chains: [base],
  connectors: [
    injected(),
    walletConnect({
      projectId: "f2eba7675d260b1fbf9a6e96f057256c",
    }),
  ],
  transports: {
    [base.id]: http(),
  },
});

interface WalletConnectProps {
  onWalletConnected?: (address: string) => void;
  onWalletDisconnected?: () => void;
}

export default function WalletConnect({ onWalletConnected, onWalletDisconnected }: WalletConnectProps) {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address: address,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      onWalletConnected?.(address);
    } else {
      onWalletDisconnected?.();
    }
  }, [isConnected, address, onWalletConnected, onWalletDisconnected]);

  if (!mounted) {
    return null;
  }

  const handleConnect = (connector: typeof connectors[0]) => {
    connect({ connector });
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div className={styles.walletContainer}>
      {!isConnected ? (
        <div className={styles.connectSection}>
          <h3 className={styles.title}>Connect Your Wallet</h3>
          <p className={styles.subtitle}>Connect your wallet to view your Base tokens</p>
          
          <div className={styles.connectors}>
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => handleConnect(connector)}
                disabled={isPending}
                className={styles.connectorButton}
              >
                <div className={styles.connectorIcon}>
                  {connector.name === "MetaMask" && "🦊"}
                  {connector.name === "WalletConnect" && "🔗"}
                  {connector.name === "Injected" && "💼"}
                </div>
                <div className={styles.connectorInfo}>
                  <span className={styles.connectorName}>{connector.name}</span>
                  <span className={styles.connectorDescription}>
                    {connector.name === "MetaMask" && "Connect with MetaMask"}
                    {connector.name === "WalletConnect" && "Connect with WalletConnect"}
                    {connector.name === "Injected" && "Connect with browser wallet"}
                  </span>
                </div>
                {isPending && <div className={styles.loading}>⏳</div>}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.connectedSection}>
          <div className={styles.walletInfo}>
            <div className={styles.walletAddress}>
              <span className={styles.label}>Connected:</span>
              <span className={styles.address}>
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
            
            {balance && (
              <div className={styles.balance}>
                <span className={styles.label}>Balance:</span>
                <span className={styles.balanceValue}>
                  {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                </span>
              </div>
            )}
          </div>
          
          <button onClick={handleDisconnect} className={styles.disconnectButton}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

// Provider wrapper component
export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        {children}
      </WagmiProvider>
    </QueryClientProvider>
  );
}
