import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.google.com", pathname: "/s2/favicons/**" },
      { protocol: "https", hostname: "coindesk.com", pathname: "/**" },
      { protocol: "https", hostname: "www.coindesk.com", pathname: "/**" },
      { protocol: "https", hostname: "www.binance.com", pathname: "/**" },
      { protocol: "https", hostname: "binance.com", pathname: "/**" },
      { protocol: "https", hostname: "www.rbc.ru", pathname: "/**" },
      { protocol: "https", hostname: "rbc.ru", pathname: "/**" },
      { protocol: "https", hostname: "holder.io", pathname: "/**" },
      { protocol: "https", hostname: "www.holder.io", pathname: "/**" },
      { protocol: "https", hostname: "nft.ru", pathname: "/**" },
      { protocol: "https", hostname: "www.nft.ru", pathname: "/**" },
    ],
  },
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
