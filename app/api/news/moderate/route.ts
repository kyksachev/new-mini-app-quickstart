import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type PendingItem = {
  id: string;
  title: string;
  summary: string;
  source: string;
  href: string;
  tags?: string[];
  date: string;
  status: "pending";
};

type PublishedItem = {
  title: string;
  date: string;
  source: string;
  href: string;
  summary: string;
  tags: string[];
  thumb: string;
  domain: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const PENDING_PATH = path.join(DATA_DIR, "news-pending.json");
const PUBLISHED_PATH = path.join(DATA_DIR, "news-published.json");

async function ensureFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try { await fs.access(PENDING_PATH); } catch { await fs.writeFile(PENDING_PATH, "[]", "utf8"); }
  try { await fs.access(PUBLISHED_PATH); } catch { await fs.writeFile(PUBLISHED_PATH, "[]", "utf8"); }
}

export async function GET() {
  await ensureFiles();
  const pending = JSON.parse(await fs.readFile(PENDING_PATH, "utf8"));
  return NextResponse.json({ pending });
}

export async function POST(req: NextRequest) {
  await ensureFiles();
  const { id, action } = await req.json();
  if (!id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const pending: PendingItem[] = JSON.parse(await fs.readFile(PENDING_PATH, "utf8"));
  const idx = pending.findIndex((i: PendingItem) => i.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [item] = pending.splice(idx, 1);

  if (action === "approve") {
    const published: PublishedItem[] = JSON.parse(await fs.readFile(PUBLISHED_PATH, "utf8"));
    published.unshift({
      title: item.title,
      date: new Date(item.date).toDateString(),
      source: item.source,
      href: item.href,
      summary: item.summary,
      tags: item.tags || [],
      thumb: "/news/6.svg",
      domain: (new URL(item.href)).hostname.replace(/^www\./, ""),
    });
    await fs.writeFile(PUBLISHED_PATH, JSON.stringify(published, null, 2));
  }

  await fs.writeFile(PENDING_PATH, JSON.stringify(pending, null, 2));
  return NextResponse.json({ ok: true });
}


