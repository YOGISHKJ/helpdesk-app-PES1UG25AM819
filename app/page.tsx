// Yogish K J | PES1UG25AM819
"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

type HelpRequest = { id: number; student_name: string; message: string; created_at: string; resolved: boolean };
type RequestResponse = { source: "Redis" | "PostgreSQL"; requests: HelpRequest[]; error?: string };
let viewsLoad: Promise<void> | null = null;

export default function Home() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [source, setSource] = useState<"Redis" | "PostgreSQL">("PostgreSQL");
  const [views, setViews] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadRequests = useCallback(async () => {
    try {
      const response = await fetch("/api/requests", { cache: "no-store" });
      const data = await response.json() as RequestResponse;
      if (!response.ok) throw new Error(data.error || "Could not load requests.");
      setRequests(data.requests);
      setSource(data.source);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load requests."); }
  }, []);

  useEffect(() => {
    void loadRequests();
    if (!viewsLoad) {
      viewsLoad = fetch("/api/views", { method: "POST" })
        .then((response) => response.json())
        .then((data: { views: number | null }) => setViews(data.views))
        .catch(() => setViews(null));
    }
  }, [loadRequests]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanMessage = message.trim();
    if (!cleanName || !cleanMessage) { setError("Please enter your name and a help request."); return; }
    if (cleanName.length > 50 || cleanMessage.length > 200) { setError("Name must be 50 characters or fewer; request must be 200 characters or fewer."); return; }
    setError(""); setLoading(true);
    try {
      const response = await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student_name: cleanName, message: cleanMessage }) });
      const data = await response.json() as { success: boolean; error?: string };
      if (!response.ok || !data.success) throw new Error(data.error || "Could not post request.");
      setName(""); setMessage(""); await loadRequests();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not post request."); }
    finally { setLoading(false); }
  }

  async function resolve(id: number) {
    setError("");
    try {
      const response = await fetch(`/api/requests/${id}/resolve`, { method: "POST" });
      const data = await response.json() as { success: boolean; error?: string };
      if (!response.ok || !data.success) throw new Error(data.error || "Could not resolve request.");
      await loadRequests();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not resolve request."); }
  }

  return <main className="page-shell">
    <header className="hero">
      <div className="eyebrow"><span className="status-dot" /> CAMPUS COMMUNITY</div>
      <h1>Help Desk<span className="title-period">.</span></h1>
      <p className="intro">A little help goes a long way. Share what you need, and let’s figure it out together.</p>
      <div className="meta-row"><span className={`source-pill ${source === "Redis" ? "source-redis" : "source-postgres"}`}><span className="pill-dot" />Source: {source}</span><span className="views-pill"><span aria-hidden="true">◉</span> Board views: {views === null ? "unavailable" : views}</span></div>
    </header>

    <section className="compose-card" aria-labelledby="compose-title">
      <div className="section-kicker">YOUR CAMPUS, YOUR COMMUNITY</div>
      <h2 id="compose-title">What do you need help with?</h2>
      <p className="card-copy">Keep it short and clear. Someone might have just the answer.</p>
      <form onSubmit={submit} noValidate>
        <label htmlFor="student-name">Your name</label>
        <input id="student-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={50} placeholder="e.g. Alex Morgan" autoComplete="name" />
        <div className="label-line"><label htmlFor="request-message">Your request</label><span>{message.length}/200</span></div>
        <textarea id="request-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={200} placeholder="What are you stuck on?" rows={3} />
        {error && <p className="error-message" role="alert">{error}</p>}
        <button className="post-button" disabled={loading} type="submit">{loading ? "Posting…" : "Post Request"}<span aria-hidden="true">↗</span></button>
      </form>
    </section>

    <section className="requests-section" aria-labelledby="requests-title">
      <div className="requests-heading"><div><div className="section-kicker">HERE FOR EACH OTHER</div><h2 id="requests-title">Recent requests</h2></div><span className="count-badge">{requests.length} / 10</span></div>
      {requests.length === 0 ? <div className="empty-state"><span className="empty-icon">✳</span><h3>The board is quiet for now</h3><p>Be the first to ask for a hand.</p></div> : <div className="request-list">{requests.map((item) => <article className={`request-card ${item.resolved ? "is-resolved" : ""}`} key={item.id}>
        <div className="request-topline"><span className="avatar" aria-hidden="true">{item.student_name.charAt(0).toUpperCase()}</span><div className="request-author"><strong>{item.student_name}</strong><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</time></div>{item.resolved && <span className="resolved-badge">✓ Resolved</span>}</div>
        <p className="request-message">{item.message}</p>
        {!item.resolved && <button className="resolve-button" type="button" onClick={() => void resolve(item.id)}>Mark resolved <span aria-hidden="true">→</span></button>}
      </article>)}</div>}
    </section>
    <footer>Built for campus, with care.<span>Yogish K J | PES1UG25AM819</span></footer>
  </main>;
}
