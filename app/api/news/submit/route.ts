import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type Incoming = {
  title: string;
  summary: string;
  source: string;
  href: string;
  tags?: string[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const PENDING_PATH = path.join(DATA_DIR, "news-pending.json");

async function ensureFiles() {
  try { await fs.mkdir(DATA_DIR, { recursive: true }); } catch {}
  try { await fs.access(PENDING_PATH); } catch { await fs.writeFile(PENDING_PATH, "[]", "utf8"); }
}

export async function POST(req: NextRequest) {
  await ensureFiles();
  const body = (await req.json()) as Incoming;

  if (!body?.title || !body?.summary || !body?.source || !body?.href) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: body.title.trim(),
    summary: body.summary.trim(),
    source: body.source.trim(),
    href: body.href.trim(),
    tags: Array.isArray(body.tags) ? body.tags.slice(0, 10) : [],
    date: new Date().toISOString(),
    status: "pending" as const,
  };

  const raw = await fs.readFile(PENDING_PATH, "utf8");
  const list = JSON.parse(raw || "[]");
  list.unshift(item);
  await fs.writeFile(PENDING_PATH, JSON.stringify(list, null, 2));

  return NextResponse.json({ ok: true, id: item.id });
}


