import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const PUBLISHED_PATH = path.join(DATA_DIR, "news-published.json");

export async function GET() {
  try {
    const raw = await fs.readFile(PUBLISHED_PATH, "utf8");
    const list = JSON.parse(raw || "[]");
    return NextResponse.json({ published: list });
  } catch {
    return NextResponse.json({ published: [] });
  }
}


