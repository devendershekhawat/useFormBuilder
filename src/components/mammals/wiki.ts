// Tiny client for Wikipedia's public APIs (CORS-enabled via origin=*).

export interface WikiSummary {
  extract: string
  url: string
  image?: string
}

const API = 'https://en.wikipedia.org/w/api.php'

/** Fetch thumbnails for up to 50 article titles in a single request. */
export async function fetchThumbnails(titles: string[], size = 320): Promise<Map<string, string>> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    origin: '*',
    redirects: '1',
    prop: 'pageimages',
    piprop: 'thumbnail',
    pithumbsize: String(size),
    titles: titles.join('|'),
  })
  const res = await fetch(`${API}?${params}`)
  if (!res.ok) throw new Error(`Wikipedia ${res.status}`)
  const json = await res.json()

  // Follow normalisations ("Red_fox" → "Red fox") and redirects to the final page
  const hops = new Map<string, string>()
  for (const { from, to } of [...(json.query?.normalized ?? []), ...(json.query?.redirects ?? [])]) {
    hops.set(from, to)
  }
  const pages = new Map<string, { thumbnail?: { source: string } }>()
  for (const p of json.query?.pages ?? []) pages.set(p.title, p)

  const out = new Map<string, string>()
  for (const title of titles) {
    let key = title
    for (let i = 0; i < 4 && hops.has(key); i++) key = hops.get(key)!
    const src = pages.get(key)?.thumbnail?.source
    if (src) out.set(title, src)
  }
  return out
}

export async function fetchSummary(title: string): Promise<WikiSummary> {
  const res = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`,
  )
  if (!res.ok) throw new Error(`Wikipedia ${res.status}`)
  const json = await res.json()
  return {
    extract: json.extract ?? '',
    url: json.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    image: json.thumbnail?.source,
  }
}
