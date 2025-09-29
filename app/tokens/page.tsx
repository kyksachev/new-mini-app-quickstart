"use client";
import Link from "next/link";
import styles from "../page.module.css";

export default function TokensPage() {
  return (
    <div>
      <h1 className={styles.title}>Tokens</h1>
      <p className={styles.subtitle}>Explore trending tokens on Base and Farcaster ecosystem.</p>
      <p style={{ opacity: .8, marginTop: ".5rem" }}>Use the navigation to return home or check news.</p>
      <div style={{ marginTop: "1.5rem" }}>
        <Link className={styles.joinButton} href="/">Back to Home</Link>
      </div>
    </div>
  );
}


