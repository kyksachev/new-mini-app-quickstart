"use client";
import { useState } from "react";

export default function SubmitNewsPage() {
  const [title, setTitle] = useState("");
  const [href, setHref] = useState("");
  const [source, setSource] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Submitting...");
    try {
      const res = await fetch("/api/news/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, href, source, summary, tags: tags.split(",").map(t => t.trim()).filter(Boolean) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setStatus("Submitted! Pending admin review.");
      setTitle(""); setHref(""); setSource(""); setSummary(""); setTags("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setStatus(message);
    }
  };

  return (
    <div>
      <h1>Submit news</h1>
      <p style={{ opacity: .8 }}>Articles will be reviewed by an admin before publication.</p>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: ".75rem", maxWidth: 720 }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required style={{ padding: ".6rem .8rem", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,.05)", color: "#fff" }} />
        <input value={href} onChange={e => setHref(e.target.value)} placeholder="Source link (https://...)" type="url" required style={{ padding: ".6rem .8rem", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,.05)", color: "#fff" }} />
        <input value={source} onChange={e => setSource(e.target.value)} placeholder="Source name (e.g., CoinDesk)" required style={{ padding: ".6rem .8rem", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,.05)", color: "#fff" }} />
        <textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Short summary" rows={4} required style={{ padding: ".6rem .8rem", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,.05)", color: "#fff" }} />
        <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma separated)" style={{ padding: ".6rem .8rem", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,.05)", color: "#fff" }} />
        <button type="submit" style={{ padding: ".7rem 1rem", borderRadius: 10, border: "1px solid #00d4ff", background: "rgba(0,212,255,.1)", color: "#00d4ff", fontWeight: 600 }}>Submit</button>
        {status && <p style={{ opacity: .9 }}>{status}</p>}
      </form>
    </div>
  );
}


