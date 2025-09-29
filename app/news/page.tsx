"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Article = {
  title: string;
  date: string;
  source: string;
  href: string;
  summary: string;
  tags?: string[];
  image?: string; // remote image URL from the source
  thumb: string;  // local thumbnail path in /public/news
  domain: string; // source domain for favicon
};

const articles: Article[] = [
  {
    title: "Base reaches Stage 1 status, reducing centralization risk",
    date: "Apr 29, 2025",
    source: "CoinDesk",
    href: "https://www.coindesk.com/ru/tech/2025/04/29/coinbases-base-network-achieves-stage-1-status-reducing-centralization-risk",
    summary:
      "Base introduced a security council with multiple independent orgs and advanced its decentralization roadmap, lowering governance risk for builders and users.",
    tags: ["Base", "Governance", "Decentralization"],
    // image: remote source image (disabled to ensure reliable local thumbnails)
    thumb: "/news/1.svg",
    domain: "coindesk.com",
  },
  {
    title: "DeFi TVL on Base climbs as protocols attract inflows",
    date: "Sep 2025",
    source: "Analytics",
    href: "https://base.org/",
    summary:
      "Multiple DeFi protocols on Base report rising liquidity and usage, with incentives and improved UX drawing users on-chain.",
    tags: ["DeFi", "TVL", "Base"],
    thumb: "/news/6.svg",
    domain: "base.org",
  },
  {
    title: "Onchain gaming sees momentum with instant settlement loops",
    date: "Sep 2025",
    source: "Ecosystem",
    href: "https://base.org/",
    summary:
      "Studios experiment with quick session games leveraging low-latency confirms, opening new formats for Web3 gameplay.",
    tags: ["Gaming", "UX", "Latency"],
    thumb: "/news/7.svg",
    domain: "base.org",
  },
  {
    title: "Stablecoin volumes rise as USDC adoption expands on Base",
    date: "Sep 2025",
    source: "Markets",
    href: "https://base.org/",
    summary:
      "Merchants and apps broaden USDC use cases across payments and DeFi, improving capital efficiency for users.",
    tags: ["Stablecoins", "USDC", "Payments"],
    thumb: "/news/8.svg",
    domain: "base.org",
  },
  {
    title: "Core infra teams announce new funding to scale Base tooling",
    date: "Sep 2025",
    source: "Funding",
    href: "https://base.org/",
    summary:
      "Developer tooling, data pipelines, and monitoring services raise capital to support the growing ecosystem.",
    tags: ["Infrastructure", "Funding"],
    thumb: "/news/9.svg",
    domain: "base.org",
  },
  {
    title: "Wallet integrations expand, improving onboarding flows",
    date: "Sep 2025",
    source: "Wallets",
    href: "https://base.org/",
    summary:
      "More wallets add native Base support and smoother account abstractions for faster sign-in and transactions.",
    tags: ["Wallets", "Onboarding"],
    thumb: "/news/10.svg",
    domain: "base.org",
  },
  {
    title: "Security pushes accelerate with audits and bounties",
    date: "Sep 2025",
    source: "Security",
    href: "https://base.org/",
    summary:
      "Ecosystem projects expand audit coverage and bounty programs to harden protocols and apps.",
    tags: ["Security", "Audits"],
    thumb: "/news/11.svg",
    domain: "base.org",
  },
  {
    title: "Flashblocks planned for Base to turbocharge confirmations",
    date: "Q2 2025 (announced)",
    source: "Binance Square",
    href: "https://www.binance.com/ru/square/hashtag/Base",
    summary:
      "Flashblocks propose partial blocks streamed up to 5x per second, enabling near-instant confirmations, boosting UX for DeFi, games, and payments on Base.",
    tags: ["Base", "Performance", "Flashblocks"],
    // image: remote source image (disabled to ensure reliable local thumbnails)
    thumb: "/news/2.svg",
    domain: "binance.com",
  },
  {
    title: '“Base is for everyone” token surges to $17M cap, then plunges 95%',
    date: "Apr 16, 2025",
    source: "RBC",
    href: "https://www.rbc.ru/crypto/news/6800aeed9a794764dde511aa",
    summary:
      "An experimental community token on Base spiked on launch hype before collapsing. Base reiterated it was not an official network token.",
    tags: ["Tokens", "Volatility", "Community"],
    // image: remote source image (disabled to ensure reliable local thumbnails)
    thumb: "/news/3.svg",
    domain: "rbc.ru",
  },
  {
    title: "Temporary deposit/withdrawal suspensions for select tokens (May 7)",
    date: "May 7, 2025",
    source: "Holder",
    href: "https://holder.io/ru/coins/base/news/",
    summary:
      "Binance announced temporary maintenance-related suspensions for certain assets. Users were advised to check updated schedules before moving funds.",
    tags: ["Exchanges", "Maintenance"],
    // image: remote source image (disabled to ensure reliable local thumbnails)
    thumb: "/news/4.svg",
    domain: "holder.io",
  },
  {
    title: "Base experiences brief block production halt (19 minutes)",
    date: "Aug 5, 2025",
    source: "NFT.ru",
    href: "https://nft.ru/news/sboi-v-seti-base-na-fone-rosta-v-chem-prichina-i-kak-otreagiroval-rynok",
    summary:
      "A short outage paused block production. Services resumed after mitigation. Incident sparked discussion on L2 resiliency and monitoring.",
    tags: ["Outage", "Reliability", "L2"],
    // image: remote source image (disabled to ensure reliable local thumbnails)
    thumb: "/news/5.svg",
    domain: "nft.ru",
  },
];

export default function NewsPage() {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    articles.forEach(a => a.tags?.forEach(t => s.add(t)));
    return Array.from(s).sort();
  }, []);

  const [remote, setRemote] = useState<Article[]>([]);

  useEffect(() => {
    fetch("/api/news/published").then(r => r.json()).then(d => {
      if (Array.isArray(d?.published)) setRemote(d.published as Article[]);
    }).catch(() => {});
  }, []);

  const combined = useMemo(() => {
    // Merge remote (approved) on top of static articles
    return [...remote, ...articles];
  }, [remote]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return combined.filter(a => {
      const matchesQuery = !q || a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.source.toLowerCase().includes(q);
      const matchesTag = !activeTag || (a.tags?.includes(activeTag));
      return matchesQuery && matchesTag;
    });
  }, [query, activeTag, combined]);

  const [featured, ...rest] = filtered;

  return (
    <div>
      <h1>News</h1>
      <p style={{ opacity: 0.8, marginTop: ".5rem" }}>
        Curated updates from the Base and broader crypto ecosystem.
      </p>

      {/* Controls */}
      <div style={{
        marginTop: "1rem",
        display: "flex",
        gap: "1rem",
        flexWrap: "wrap",
        alignItems: "center"
      }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search news..."
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--border)",
            color: "#fff",
            padding: ".6rem .9rem",
            borderRadius: 10,
            minWidth: 240
          }}
        />
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveTag(null)}
            style={{
              padding: ".4rem .7rem",
              borderRadius: 9999,
              border: `1px solid ${activeTag ? "var(--border)" : "#00d4ff"}`,
              background: activeTag ? "transparent" : "rgba(0,212,255,.1)",
              color: activeTag ? "#fff" : "#00d4ff"
            }}
          >All</button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              style={{
                padding: ".4rem .7rem",
                borderRadius: 9999,
                border: `1px solid ${activeTag === tag ? "#00d4ff" : "var(--border)"}`,
                background: activeTag === tag ? "rgba(0,212,255,.1)" : "transparent",
                color: activeTag === tag ? "#00d4ff" : "#fff"
              }}
            >{tag}</button>
          ))}
        </div>
      </div>

      {/* Featured */}
      {featured && (
        <article
          style={{
            marginTop: "1.5rem",
            border: "1px solid var(--border)",
            borderRadius: 16,
            overflow: "hidden",
            background: "var(--card-bg)",
          }}
        >
          <div style={{ position: "relative", height: 300 }}>
            <Image
              src={featured.thumb}
              alt={featured.title}
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
          <div style={{ padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: ".5rem" }}>
              <h2 style={{ margin: 0 }}>{featured.title}</h2>
              <span style={{ opacity: 0.6, whiteSpace: "nowrap" }}>{featured.date}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginTop: ".35rem" }}>
              <Image src={`https://www.google.com/s2/favicons?domain=${featured.domain}&sz=64`} alt={featured.source} width={16} height={16} />
              <span style={{ opacity: .75, fontSize: ".9rem" }}>{featured.source}</span>
            </div>
            <p style={{ marginTop: ".5rem", opacity: 0.9 }}>{featured.summary}</p>
            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
              {(featured.tags || []).map(t => (
                <span key={t} style={{
                  padding: ".2rem .5rem",
                  borderRadius: 9999,
                  border: "1px solid var(--border)",
                  opacity: .9
                }}>{t}</span>
              ))}
            </div>
            <div style={{ marginTop: ".75rem" }}>
              <Link href={featured.href} target="_blank" rel="noreferrer">Read source ({featured.source}) →</Link>
            </div>
          </div>
        </article>
      )}

      {/* Grid */}
      <div style={{ marginTop: "1.5rem", display: "grid", gap: "1rem" }}>
        {rest.map((a) => (
          <article
            key={a.title}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              overflow: "hidden",
              background: "var(--card-bg)",
              display: "grid",
              gridTemplateColumns: "minmax(220px, 32%) 1fr",
              minHeight: 200,
            }}
          >
            <div style={{ position: "relative", background: "rgba(255,255,255,0.02)" }}>
              <Image
                src={a.thumb}
                alt={a.title}
                width={600}
                height={315}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                priority={articles.indexOf(a) < 2}
              />
              {/* Overlay small fallback if image fails to render in some clients */}
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                <Image
                  src={
                    a.domain === "rbc.ru"
                      ? "/news/sources/rbc.svg"
                      : a.thumb
                  }
                  alt="fallback"
                  width={1}
                  height={1}
                  style={{ opacity: 0, width: 1, height: 1 }}
                />
              </div>
            </div>
            <div style={{ padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: ".5rem" }}>
                <h3 style={{ margin: 0 }}>{a.title}</h3>
                <span style={{ opacity: 0.6, whiteSpace: "nowrap" }}>{a.date}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                <Image src={`https://www.google.com/s2/favicons?domain=${a.domain}&sz=64`} alt={a.source} width={14} height={14} />
                <span style={{ opacity: .7, fontSize: ".85rem" }}>{a.source}</span>
              </div>
              <p style={{ marginTop: ".5rem", opacity: 0.9 }}>{a.summary}</p>
              <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                {(a.tags || []).map(t => (
                  <button
                    key={t}
                    onClick={() => setActiveTag(t)}
                    style={{
                      padding: ".2rem .5rem",
                      borderRadius: 9999,
                      border: `1px solid ${activeTag === t ? "#00d4ff" : "var(--border)"}`,
                      background: activeTag === t ? "rgba(0,212,255,.1)" : "transparent",
                      color: activeTag === t ? "#00d4ff" : "#fff"
                    }}
                  >{t}</button>
                ))}
              </div>
              <div style={{ marginTop: ".5rem", display: "flex", gap: ".75rem" }}>
                <Link href={a.href} target="_blank" rel="noreferrer">
                  Read source ({a.source}) →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
