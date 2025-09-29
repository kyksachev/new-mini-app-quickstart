import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { SafeArea } from "@coinbase/onchainkit/minikit";
import { minikitConfig } from "../minikit.config";
import { RootProvider } from "./rootProvider";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: minikitConfig.miniapp.name,
    description: minikitConfig.miniapp.description,
    other: {
      "fc:frame": JSON.stringify({
        version: minikitConfig.miniapp.version,
        imageUrl: minikitConfig.miniapp.heroImageUrl,
        button: {
          title: `Join the ${minikitConfig.miniapp.name}  waitlist now`,
          action: {
            name: `Launch ${minikitConfig.miniapp.name}`,
            type: "launch_frame",
          },
        },
      }),
    },
  };
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RootProvider>
      <html lang="en">
        <body className={`${inter.variable} ${sourceCodePro.variable}`}>
          <SafeArea>
            <header className="site-header">
              <div className="container header-inner">
                <Link href="/" className="brand">
                  <Image src="/blue-icon.png" alt="Logo" className="brand-logo" width={28} height={28} />
                  <span className="brand-name"></span>
                </Link>
                <nav className="nav">
                  <Link className="nav-link" href="/">Home</Link>
                  <Link className="nav-link" href="/tokens">Tokens</Link>
                  <Link className="nav-link" href="/news">News</Link>
                  <Link className="nav-link" href="/about">About</Link>
                </nav>
              </div>
            </header>
            <main className="container page-content">{children}</main>
            <footer className="site-footer">
              <div className="container footer-inner">
                <span>© {new Date().getFullYear()} Simple Finance</span>
                <div className="footer-links">
                  <a href="https://base.org" target="_blank" rel="noreferrer">Built on Base</a>
                  <a href="https://warpcast.com/" target="_blank" rel="noreferrer">Farcaster</a>
                </div>
              </div>
            </footer>
          </SafeArea>
        </body>
      </html>
    </RootProvider>
  );
}
