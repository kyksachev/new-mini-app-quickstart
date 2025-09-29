"use client";
import Link from "next/link";

type Article = {
  title: string;
  date: string;
  source: string;
  href: string;
  summary: string;
};

const articles: Article[] = [
  {
    title: "Base reaches Stage 1 status, reducing centralization risk",
    date: "Apr 29, 2025",
    source: "CoinDesk",
    href: "https://www.coindesk.com/ru/tech/2025/04/29/coinbases-base-network-achieves-stage-1-status-reducing-centralization-risk",
    summary:
      "Base introduced a security council with multiple independent orgs and advanced its decentralization roadmap, lowering governance risk for builders and users.",
  },
  {
    title: "Flashblocks planned for Base to turbocharge confirmations",
    date: "Q2 2025 (announced)",
    source: "Binance Square",
    href: "https://www.binance.com/ru/square/hashtag/Base",
    summary:
      "Flashblocks propose partial blocks streamed up to 5x per second, enabling near-instant confirmations, boosting UX for DeFi, games, and payments on Base.",
  },
  {
    title: '“Base is for everyone” token surges to $17M cap, then plunges 95%',
    date: "Apr 16, 2025",
    source: "RBC",
    href: "https://www.rbc.ru/crypto/news/6800aeed9a794764dde511aa",
    summary:
      "An experimental community token on Base spiked on launch hype before collapsing. Base reiterated it was not an official network token.",
  },
  {
    title: "Temporary deposit/withdrawal suspensions for select tokens (May 7)",
    date: "May 7, 2025",
    source: "Holder",
    href: "https://holder.io/ru/coins/base/news/",
    summary:
      "Binance announced temporary maintenance-related suspensions for certain assets. Users were advised to check updated schedules before moving funds.",
  },
  {
    title: "Base experiences brief block production halt (19 minutes)",
    date: "Aug 5, 2025",
    source: "NFT.ru",
    href: "https://nft.ru/news/sboi-v-seti-base-na-fone-rosta-v-chem-prichina-i-kak-otreagiroval-rynok",
    summary:
      "A short outage paused block production. Services resumed after mitigation. Incident sparked discussion on L2 resiliency and monitoring.",
  },
];

export default function NewsPage() {
  return (
    <div>
      <h1>News</h1>
      <p style={{ opacity: 0.8, marginTop: ".5rem" }}>
        Curated updates from the Base and broader crypto ecosystem.
      </p>

      <div style={{ marginTop: "1.5rem", display: "grid", gap: "1rem" }}>
        {articles.map((a) => (
          <article
            key={a.title}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "1rem",
              background: "var(--card-bg)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: ".5rem" }}>
              <h3 style={{ margin: 0 }}>{a.title}</h3>
              <span style={{ opacity: 0.6, whiteSpace: "nowrap" }}>{a.date}</span>
            </div>
            <p style={{ marginTop: ".5rem", opacity: 0.9 }}>{a.summary}</p>
            <div style={{ marginTop: ".5rem", display: "flex", gap: ".75rem" }}>
              <Link href={a.href} target="_blank" rel="noreferrer">
                Read source ({a.source}) →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
