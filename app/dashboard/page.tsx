export default function Home() {
  return (
    <>
      <h1 className="mt-[64px]">Project Athena</h1>
      <p className="muted">
        All-in-one internal app — Divisi Internationalization &amp; Partnership. Lihat <a href="/PRD">PRD</a> di repo
        (<code>PRD.md</code>).
      </p>
      <div className="card">
        <h2>Squad 1 — IE Monitoring</h2>
        <p>Monitoring International Experience + bulk update + rekap tahunan.</p>
        <a href="./ie">Buka /ie →</a>
      </div>
      <div className="card">
        <h2>Squad 2 — OCR Name Card</h2>
        <p>Scan kartu nama via LLM + koreksi manual + CRUD fallback.</p>
        <a href="./cards">Buka /cards →</a>
      </div>
    </>
  );
}

