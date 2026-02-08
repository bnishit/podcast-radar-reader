import { useEffect, useMemo, useState } from 'react'

type Episode = { show: string; title: string; notes: string; episodeUrl?: string; transcriptUrl?: string; transcriptStatus?: string }
type RunData = { updatedAt?: string; tldr?: string[]; episodes?: Episode[]; rabbitHoles?: string[] }
type IndexData = { latest?: string; runs?: { date?: string; path: string; label?: string }[] }

const esc = (s = '') => s

function renderNotes(text = '') {
  const lines = text.split('\n')
  return lines.map((ln, i) => {
    const line = ln.trim()
    if (!line) return <div key={i} style={{ height: 8 }} />
    if (/^[A-Za-z].*:\s*$/.test(line)) return <h4 key={i}>{esc(line.replace(/:$/, ''))}</h4>
    return <p key={i}>{esc(line)}</p>
  })
}

export function App() {
  const [index, setIndex] = useState<IndexData>({})
  const [data, setData] = useState<RunData>({})
  const [currentPath, setCurrentPath] = useState('')
  const [dark, setDark] = useState(false)
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('dark', dark)
  }, [dark])

  useEffect(() => {
    ;(async () => {
      const idx = await fetch('/index.json?_=' + Date.now()).then((r) => r.json())
      setIndex(idx)
      const p = idx.latest || '/latest.json'
      setCurrentPath(p)
      const d = await fetch('/' + p.replace(/^\//, '') + '?_=' + Date.now()).then((r) => r.json())
      setData(d)
    })()
  }, [])

  const loadRun = async (p: string) => {
    setCurrentPath(p)
    const d = await fetch('/' + p.replace(/^\//, '') + '?_=' + Date.now()).then((r) => r.json())
    setData(d)
  }

  const episodeCount = useMemo(() => data.episodes?.length || 0, [data.episodes])

  return (
    <div className="wrap">
      <aside className="panel">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Archive</div>
        {(index.runs || []).map((r, i) => (
          <button key={i} className={`run ${currentPath === r.path ? 'active' : ''}`} onClick={() => loadRun(r.path)}>
            {r.label || r.date || r.path}
          </button>
        ))}
      </aside>

      <main className="main">
        <h1 className="h1">Podcast Radar</h1>
        <div className="sub">Premium deep-notes reader</div>
        <div className="toolbar">
          <button className="btn" onClick={() => setDark((v) => !v)}>Toggle dark mode</button>
          <button className="btn" onClick={() => setCompact((v) => !v)}>Reading: {compact ? 'Compact' : 'Cozy'}</button>
        </div>
        <div className="sub" style={{ marginTop: 10 }}>Updated: {data.updatedAt || ''} · Episodes: {episodeCount}</div>

        <section className="section">
          <h2>TL;DR</h2>
          <div className={`read ${compact ? 'compact' : ''}`}>
            <ol>{(data.tldr || []).map((x, i) => <li key={i}>{x}</li>)}</ol>
          </div>
        </section>

        {(data.episodes || []).map((ep, i) => (
          <section className="section" key={i}>
            <h3 className="title">{ep.show} — {ep.title}</h3>
            <div className="row">
              <span className="chip">Transcript: {ep.transcriptStatus || 'unknown'}</span>
              {ep.episodeUrl && <a className="btn primary" href={ep.episodeUrl} target="_blank">Open episode</a>}
              {ep.transcriptUrl && <a className="btn" href={ep.transcriptUrl} target="_blank">Open transcript</a>}
            </div>
            <div className="divider" />
            <div className={`read ${compact ? 'compact' : ''}`}>{renderNotes(ep.notes)}</div>
          </section>
        ))}

        <section className="section">
          <h2>Rabbit Holes</h2>
          <div className={`read ${compact ? 'compact' : ''}`}>
            <ol>{(data.rabbitHoles || []).map((x, i) => <li key={i}>{x}</li>)}</ol>
          </div>
        </section>
      </main>
    </div>
  )
}
