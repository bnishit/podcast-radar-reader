import fs from 'node:fs/promises'
import path from 'node:path'
import { YoutubeTranscript } from 'youtube-transcript'

const input = process.argv[2]
if (!input) {
  console.error('Usage: node scripts/fetch-youtube-transcript.mjs <youtube-url-or-id>')
  process.exit(1)
}

const idMatch = input.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
const videoId = idMatch ? idMatch[1] : input
const url = `https://www.youtube.com/watch?v=${videoId}`

try {
  const transcript = await YoutubeTranscript.fetchTranscript(url)
  const out = {
    videoId,
    url,
    source: 'youtube-transcript',
    fetchedAt: new Date().toISOString(),
    transcript,
  }
  const outPath = path.resolve('public/transcripts', `${videoId}.json`)
  await fs.mkdir(path.dirname(outPath), { recursive: true })
  await fs.writeFile(outPath, JSON.stringify(out, null, 2))
  console.log(`OK ${outPath} entries=${transcript.length}`)
} catch (err) {
  const out = {
    videoId,
    url,
    source: 'youtube-transcript',
    fetchedAt: new Date().toISOString(),
    error: String(err?.message || err),
  }
  const outPath = path.resolve('public/transcripts', `${videoId}.error.json`)
  await fs.mkdir(path.dirname(outPath), { recursive: true })
  await fs.writeFile(outPath, JSON.stringify(out, null, 2))
  console.error(`FAIL ${outPath} :: ${out.error}`)
  process.exit(2)
}
