'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from 'react'
import {
  MAMMAL_TREE,
  STATUS_LABEL,
  evoDistance,
  indexTree,
  mrca,
  pathTo,
  type IndexedNode,
} from '@/lib/mammals/tree'
import { fetchSummary, fetchThumbnails, type WikiSummary } from './wiki'
import styles from './MammalExplorer.module.css'

const TREE = indexTree(MAMMAL_TREE)
const ROOT_ID = TREE.root.id
const INITIAL_EXPANDED = ['mammalia', 'theria', 'placentalia']

// Layout / physics tuning. Distances are in world pixels.
const PHYS = {
  gap: 26, // breathing room between bubble edges
  spread: 19, // px per √(million years) of evolutionary distance
  spring: 0.03, // pull toward the ideal distance
  kinship: 5, // parent–child pairs pull this many times harder
  pad: 14, // minimum space between bubble edges
  gravity: 0.0012, // keeps the whole cloud centred
  wander: 0.07, // the "suspended in air" drift
  damping: 0.86,
  maxSpeed: 22,
}

const LEAF_R = 30
const SETTLE_STEPS = 150

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

const isClade = (n: IndexedNode) => !!n.children?.length
const wikiTitle = (n: IndexedNode) => n.wiki ?? n.name

function radiusOf(n: IndexedNode, open: boolean) {
  if (!isClade(n)) return LEAF_R
  // an open branch shrinks to a small glowing junction between its children
  if (open) return 11 + 2 * Math.log10(n.count + 1)
  return 30 + 9 * Math.log10(n.count + 1)
}

/** Radius used for collisions: leaves reserve room for the name beneath them */
const collisionRadius = (n: IndexedNode, open: boolean) => radiusOf(n, open) + (isClade(n) ? (open ? 2 : 6) : 12)

function visibleIds(expanded: Set<string>): string[] {
  const out: string[] = []
  const walk = (n: IndexedNode) => {
    out.push(n.id)
    if (expanded.has(n.id)) n.children?.forEach((c) => walk(TREE.nodes.get(c.id)!))
  }
  walk(TREE.root)
  return out
}

function descendantsOf(id: string): string[] {
  const out: string[] = []
  const walk = (n: IndexedNode) => {
    out.push(n.id)
    n.children?.forEach((c) => walk(TREE.nodes.get(c.id)!))
  }
  walk(TREE.nodes.get(id)!)
  return out
}

const isAncestor = (anc: string, id: string) => pathTo(TREE, id).some((n) => n.id === anc)

export function formatMya(mya: number) {
  if (mya === 0) return 'today'
  return `${mya < 10 && !Number.isInteger(mya) ? mya.toFixed(1) : Math.round(mya)} Mya`
}

const initials = (name: string) =>
  name
    .split(/[\s-]+/)
    .filter((w) => /^[A-Z]/.test(w))
    .slice(-2)
    .map((w) => w[0])
    .join('') || name[0]

// ---------------------------------------------------------------------------
// Simulation types
// ---------------------------------------------------------------------------

interface Body {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  fx: number
  fy: number
  r: number
  tr: number
  cr: number
  // personal drift rhythm so no two bubbles float in sync
  f1: number
  f2: number
  p1: number
  p2: number
  alpha: number
  leaving: boolean
  to: string | null
}

interface Layout {
  ids: string[]
  index: Map<string, number>
  dist: Float32Array
  weight: Float32Array
}

function idealDistance(L: Layout, a: string, b: string) {
  const i = L.index.get(a)
  const j = L.index.get(b)
  if (i === undefined || j === undefined) return 120
  return i < j ? L.dist[i * L.ids.length + j] : L.dist[j * L.ids.length + i]
}

interface Camera {
  x: number
  y: number
  s: number
  manual: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MammalExplorer() {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(INITIAL_EXPANDED))
  const [selected, setSelected] = useState<string | null>(ROOT_ID)
  const [hovered, setHovered] = useState<string | null>(null)
  const [renderIds, setRenderIds] = useState<string[]>([])
  const [thumbs, setThumbs] = useState<Record<string, string>>({})
  const [brokenImgs, setBrokenImgs] = useState<Set<string>>(() => new Set())
  const markBroken = (src: string) => setBrokenImgs((prev) => new Set(prev).add(src))
  const [summaries, setSummaries] = useState<Record<string, WikiSummary | 'error'>>({})
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [manualCam, setManualCam] = useState(false)

  const stageRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bubbleEls = useRef(new Map<string, HTMLDivElement>())
  const linkEls = useRef(new Map<string, SVGPathElement>())
  const bodies = useRef(new Map<string, Body>())
  const layoutRef = useRef<Layout | null>(null)
  const cam = useRef<Camera>({ x: 0, y: 0, s: 0.6, manual: false })
  const panelOpen = useRef(true)
  const drag = useRef<{
    id: string | null
    startX: number
    startY: number
    lastX: number
    lastY: number
    moved: boolean
    pointerId: number
  } | null>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{ dist: number } | null>(null)
  const settle = useRef(0)

  // ---- Derived layout: ideal distance for every pair of visible bubbles ----
  const layout = useMemo<Layout>(() => {
    const ids = visibleIds(expanded)
    const n = ids.length
    const dist = new Float32Array(n * n)
    const weight = new Float32Array(n * n)
    const radii = ids.map((id) => radiusOf(TREE.nodes.get(id)!, expanded.has(id)))
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const myr = evoDistance(TREE, ids[i], ids[j])
        const d = radii[i] + radii[j] + PHYS.gap + PHYS.spread * Math.sqrt(myr)
        dist[i * n + j] = d
        // Nearby relatives matter most: stress-style 1/d² weighting
        const kin = TREE.nodes.get(ids[j])!.parentId === ids[i] ? PHYS.kinship : 1
        weight[i * n + j] = kin * (160 / d) ** 1.6
      }
    }
    return { ids, index: new Map(ids.map((id, i) => [id, i])), dist, weight }
  }, [expanded])

  // ---- Sync bodies with the visible set: spawn children, retire the rest ----
  useEffect(() => {
    layoutRef.current = layout
    const map = bodies.current
    const visible = new Set(layout.ids)

    for (const id of layout.ids) {
      const node = TREE.nodes.get(id)!
      const tr = radiusOf(node, expanded.has(id))
      const cr = collisionRadius(node, expanded.has(id))
      const existing = map.get(id)
      if (existing) {
        existing.tr = tr
        existing.cr = cr
        existing.leaving = false
        existing.to = null
        continue
      }
      // Fan children out along the direction their branch is already growing,
      // so deep reveals start untangled instead of piled on one point.
      const parentNode = node.parentId ? TREE.nodes.get(node.parentId)! : null
      const parent = parentNode ? map.get(parentNode.id) : undefined
      const grand = parentNode?.parentId ? map.get(parentNode.parentId) : undefined
      const siblings = parentNode?.children ?? [node]
      const k = siblings.findIndex((s) => s.id === id)
      let angle: number
      if (parent && grand && Math.hypot(parent.x - grand.x, parent.y - grand.y) > 1) {
        const out = Math.atan2(parent.y - grand.y, parent.x - grand.x)
        const fan = Math.min(Math.PI * 1.2, 0.7 * siblings.length)
        angle = out + (siblings.length > 1 ? (k / (siblings.length - 1) - 0.5) * fan : 0)
      } else {
        angle = (parent ? parent.p1 : 0) + ((k + 0.5) / siblings.length) * Math.PI * 2
      }
      const reach = parent ? idealDistance(layout, parent.id, id) * 0.55 : 0
      const px = parent?.x ?? 0
      const py = parent?.y ?? 0
      map.set(id, {
        id,
        x: px + Math.cos(angle) * reach,
        y: py + Math.sin(angle) * reach,
        vx: Math.cos(angle) * 6,
        vy: Math.sin(angle) * 6,
        fx: 0,
        fy: 0,
        r: 2,
        tr,
        cr,
        f1: 0.25 + Math.random() * 0.35,
        f2: 0.2 + Math.random() * 0.35,
        p1: Math.random() * Math.PI * 2,
        p2: Math.random() * Math.PI * 2,
        alpha: 0,
        leaving: false,
        to: null,
      })
    }

    for (const b of map.values()) {
      if (visible.has(b.id) || b.leaving) continue
      b.leaving = true
      // fold back into the nearest ancestor still on screen
      b.to = pathTo(TREE, b.id)
        .reverse()
        .find((n) => visible.has(n.id))?.id ?? ROOT_ID
    }

    settle.current = SETTLE_STEPS
    setRenderIds([...layout.ids, ...[...map.values()].filter((b) => b.leaving).map((b) => b.id)])
    if (!cam.current.manual) return
    cam.current.manual = false
    setManualCam(false)
  }, [layout, expanded])

  useEffect(() => {
    panelOpen.current = selected !== null
  }, [selected])

  // ---- Animation loop ----
  useEffect(() => {
    const stage = stageRef.current
    const world = worldRef.current
    const canvas = canvasRef.current
    if (!stage || !world || !canvas) return
    const ctx = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const wander = reduced ? PHYS.wander * 0.2 : PHYS.wander
    const bob = reduced ? 0 : 1

    // floating motes for depth
    const motes = Array.from({ length: 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.2 + Math.random() * 0.8,
      s: 0.4 + Math.random() * 1.6,
      p: Math.random() * Math.PI * 2,
    }))

    // One fixed physics tick (1 = 1/60 s)
    const simulate = (bs: Body[], L: Layout, t: number, held: string | null) => {
      const dt = 1
      // Right after a change, let bubbles pass through each other so the tree
      // can find its overall shape, then ease collisions back in.
      const ghost = Math.min(1, Math.max(0, (SETTLE_STEPS - settle.current - 25) / 50))
      const n = bs.length
      if (n !== L.ids.length) return
      for (const b of bs) {
        b.fx = -b.x * PHYS.gravity + Math.sin(t * b.f1 + b.p1) * wander
        b.fy = -b.y * PHYS.gravity + Math.cos(t * b.f2 + b.p2) * wander
      }
      for (let i = 0; i < n; i++) {
        const a = bs[i]
        for (let j = i + 1; j < n; j++) {
          const c = bs[j]
          const dx = c.x - a.x
          const dy = c.y - a.y
          const d = Math.hypot(dx, dy) || 0.01
          const k = i * n + j
          const f = (d - L.dist[k]) * L.weight[k] * PHYS.spring
          a.fx += (f * dx) / d
          a.fy += (f * dy) / d
          c.fx -= (f * dx) / d
          c.fy -= (f * dy) / d
        }
      }
      const damp = Math.pow(PHYS.damping, dt)
      for (const b of bs) {
        if (b.id === held) continue
        b.vx = (b.vx + b.fx * dt) * damp
        b.vy = (b.vy + b.fy * dt) * damp
        const sp = Math.hypot(b.vx, b.vy)
        if (sp > PHYS.maxSpeed) {
          b.vx *= PHYS.maxSpeed / sp
          b.vy *= PHYS.maxSpeed / sp
        }
        b.x += b.vx * dt
        b.y += b.vy * dt
      }
      // hard collisions: bubbles never pass through each other
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < n; i++) {
          const a = bs[i]
          for (let j = i + 1; j < n; j++) {
            const c = bs[j]
            let dx = c.x - a.x
            let dy = c.y - a.y
            let d = Math.hypot(dx, dy)
            const min = a.cr + c.cr + PHYS.pad
            if (d >= min) continue
            if (d < 0.01) {
              dx = Math.random() - 0.5
              dy = Math.random() - 0.5
              d = Math.hypot(dx, dy)
            }
            const push = ((min - d) / d) * 0.5 * ghost
            if (push === 0) continue
            const wa = a.id === held ? 0 : c.id === held ? 1 : 0.5
            const wc = 1 - wa
            a.x -= dx * push * wa * 2
            a.y -= dy * push * wa * 2
            c.x += dx * push * wc * 2
            c.y += dy * push * wc * 2
          }
        }
      }
    }

    let raf = 0
    let last = performance.now()
    let first = true
    let acc = 0

    const frame = (now: number) => {
      // dt in 60fps frames; physics runs on a fixed step so it behaves the same on slow devices
      const dt = Math.min(15, Math.max(0.2, (now - last) / 16.667))
      last = now
      acc += dt
      const t = now / 1000
      const L = layoutRef.current
      const map = bodies.current
      const W = stage.clientWidth
      const H = stage.clientHeight

      if (L) {
        const bs: Body[] = []
        for (const id of L.ids) {
          const b = map.get(id)
          if (b) bs.push(b)
        }
        let steps = Math.min(12, Math.floor(acc))
        acc -= Math.floor(acc)
        // fast-forward a little right after a change so new branches untangle quickly
        if (settle.current > 0 && steps > 0) {
          settle.current -= steps
          steps += 2
        }
        const held = drag.current?.moved ? drag.current.id : null
        for (let s = 0; s < steps; s++) simulate(bs, L, t, held)
        for (const b of bs) {
          b.r += (b.tr - b.r) * (1 - Math.pow(0.86, dt))
          b.alpha += (1 - b.alpha) * (1 - Math.pow(0.9, dt))
        }
      }

      // retiring bubbles drift home into their ancestor and fade
      const gone: string[] = []
      for (const b of map.values()) {
        if (!b.leaving) continue
        const home = b.to ? map.get(b.to) : undefined
        const ease = 1 - Math.pow(0.84, dt)
        if (home) {
          b.x += (home.x - b.x) * ease
          b.y += (home.y - b.y) * ease
        }
        b.r *= Math.pow(0.88, dt)
        b.alpha *= Math.pow(0.85, dt)
        if (b.alpha < 0.03) gone.push(b.id)
      }
      if (gone.length) {
        gone.forEach((id) => map.delete(id))
        setRenderIds((ids) => ids.filter((id) => !gone.includes(id)))
      }

      // ---- camera: gently keep everything in frame ----
      const wide = W > 760
      const panel = panelOpen.current
      const areaL = 24
      const areaR = W - (panel && wide ? 420 : 24)
      const areaT = wide ? 110 : 130
      const areaB = H - (panel && !wide ? H * 0.46 : 56)
      const ax = (areaL + areaR) / 2
      const ay = (areaT + areaB) / 2
      const c = cam.current
      if (!c.manual && L) {
        let minX = Infinity
        let minY = Infinity
        let maxX = -Infinity
        let maxY = -Infinity
        for (const id of L.ids) {
          const b = map.get(id)
          if (!b) continue
          minX = Math.min(minX, b.x - b.tr - 20)
          maxX = Math.max(maxX, b.x + b.tr + 20)
          minY = Math.min(minY, b.y - b.tr - 20)
          maxY = Math.max(maxY, b.y + b.tr + 40)
        }
        if (minX < Infinity) {
          const ts = Math.min(1.25, Math.max(0.28, Math.min((areaR - areaL) / (maxX - minX), (areaB - areaT) / (maxY - minY))))
          const ease = first ? 1 : 1 - Math.pow(0.955, dt)
          c.s += (ts - c.s) * ease
          c.x += ((minX + maxX) / 2 - c.x) * ease
          c.y += ((minY + maxY) / 2 - c.y) * ease
          first = false
        }
      }
      const ox = ax - c.x * c.s
      const oy = ay - c.y * c.s
      world.style.transform = `translate3d(${ox}px, ${oy}px, 0) scale(${c.s})`
      // labels shrink slower than the world so they stay readable when zoomed out
      world.style.setProperty('--ls', String(Math.min(1.6, Math.pow(c.s, -0.55))))
      stage.dataset.ox = String(ox)
      stage.dataset.oy = String(oy)

      // ---- write bubbles ----
      for (const [id, b] of map) {
        const el = bubbleEls.current.get(id)
        if (!el) continue
        const bx = Math.sin(t * b.f2 * 1.7 + b.p1) * 3 * bob
        const by = Math.sin(t * b.f1 * 2.1 + b.p2) * 5 * bob
        const breathe = 1 + Math.sin(t * 0.9 + b.p1) * 0.012 * bob
        el.style.transform = `translate3d(${b.x + bx - b.tr}px, ${b.y + by - b.tr}px, 0) scale(${(b.r / b.tr) * breathe})`
        el.style.opacity = String(Math.min(1, b.alpha))
      }

      // ---- write links: silk threads that sway ----
      for (const [id, path] of linkEls.current) {
        const b = map.get(id)
        const node = TREE.nodes.get(id)
        const p = node?.parentId ? map.get(node.parentId) : undefined
        if (!b || !p) continue
        const x1 = p.x + Math.sin(t * p.f2 * 1.7 + p.p1) * 3 * bob
        const y1 = p.y + Math.sin(t * p.f1 * 2.1 + p.p2) * 5 * bob
        const x2 = b.x + Math.sin(t * b.f2 * 1.7 + b.p1) * 3 * bob
        const y2 = b.y + Math.sin(t * b.f1 * 2.1 + b.p2) * 5 * bob
        const mx = (x1 + x2) / 2
        const my = (y1 + y2) / 2
        const sway = Math.sin(t * 0.6 + b.p1) * 0.14 * bob
        path.setAttribute('d', `M${x1},${y1} Q${mx - (y2 - y1) * sway},${my + (x2 - x1) * sway} ${x2},${y2}`)
        path.style.opacity = String(Math.min(b.alpha, p.alpha))
      }

      // ---- background motes, with parallax against the camera ----
      if (ctx) {
        const dpr = window.devicePixelRatio || 1
        if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
          canvas.width = Math.round(W * dpr)
          canvas.height = Math.round(H * dpr)
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, W, H)
        for (const m of motes) {
          m.y -= 0.00006 * m.z * dt * (reduced ? 0 : 1)
          if (m.y < -0.05) m.y += 1.1
          const px = (((m.x * W - c.x * c.s * m.z * 0.15 + Math.sin(t * 0.2 + m.p) * 12) % W) + W) % W
          const py = (((m.y * H - c.y * c.s * m.z * 0.15) % H) + H) % H
          ctx.globalAlpha = 0.15 + 0.35 * m.z * (0.6 + 0.4 * Math.sin(t * 0.8 + m.p))
          ctx.fillStyle = '#cfe8ff'
          ctx.beginPath()
          ctx.arc(px, py, m.s * m.z, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  // ---- Wikipedia thumbnails: the whole tree in a few batched requests, cached per session ----
  useEffect(() => {
    const CACHE = 'mammal-thumbs-v1'
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE) ?? 'null')
      if (cached && typeof cached === 'object') {
        setThumbs(cached)
        return
      }
    } catch {
      // storage unavailable; fall through to the network
    }
    // what's on screen first, then everything else
    const first = visibleIds(new Set(INITIAL_EXPANDED))
    const order = [...first, ...[...TREE.nodes.keys()].filter((id) => !first.includes(id))]
    const chunks: string[][] = []
    for (let i = 0; i < order.length; i += 50) chunks.push(order.slice(i, i + 50))

    let cancelled = false
    const all: Record<string, string> = {}
    const load = async () => {
      for (const chunk of chunks) {
        const titles = chunk.map((id) => wikiTitle(TREE.nodes.get(id)!))
        for (let attempt = 0; attempt < 4 && !cancelled; attempt++) {
          try {
            const found = await fetchThumbnails(titles)
            chunk.forEach((id, k) => {
              const src = found.get(titles[k])
              if (src) all[id] = src
            })
            if (!cancelled) setThumbs({ ...all })
            break
          } catch {
            // Wikipedia rate-limits bursts: back off and retry
            await new Promise((r) => setTimeout(r, 1500 * 2 ** attempt))
          }
        }
        await new Promise((r) => setTimeout(r, 300))
      }
      if (cancelled || Object.keys(all).length < TREE.nodes.size / 2) return
      try {
        sessionStorage.setItem(CACHE, JSON.stringify(all))
      } catch {
        // ignore quota / privacy-mode errors
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // ---- Wikipedia summary for the selected node ----
  useEffect(() => {
    if (!selected || summaries[selected]) return
    const id = selected
    fetchSummary(wikiTitle(TREE.nodes.get(id)!))
      .then((s) => setSummaries((prev) => ({ ...prev, [id]: s })))
      .catch(() => setSummaries((prev) => ({ ...prev, [id]: 'error' })))
  }, [selected, summaries])

  // ---- Interactions ----
  const toggle = useCallback((id: string) => {
    const node = TREE.nodes.get(id)!
    setSelected(id)
    if (!isClade(node)) return
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) descendantsOf(id).forEach((d) => next.delete(d))
      else next.add(id)
      return next
    })
  }, [])

  const reveal = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      pathTo(TREE, id)
        .slice(0, -1)
        .forEach((n) => next.add(n.id))
      return next
    })
    setSelected(id)
    setQuery('')
    setSearchOpen(false)
  }, [])

  const fitView = useCallback(() => {
    cam.current.manual = false
    setManualCam(false)
  }, [])

  const toWorld = (clientX: number, clientY: number) => {
    const stage = stageRef.current!
    const rect = stage.getBoundingClientRect()
    const ox = Number(stage.dataset.ox ?? 0)
    const oy = Number(stage.dataset.oy ?? 0)
    return { x: (clientX - rect.left - ox) / cam.current.s, y: (clientY - rect.top - oy) / cam.current.s }
  }

  const setManual = () => {
    if (cam.current.manual) return
    cam.current.manual = true
    setManualCam(true)
  }

  const zoomAt = (clientX: number, clientY: number, factor: number) => {
    const c = cam.current
    const before = toWorld(clientX, clientY)
    c.s = Math.min(2.5, Math.max(0.15, c.s * factor))
    const after = toWorld(clientX, clientY)
    c.x += before.x - after.x
    c.y += before.y - after.y
    setManual()
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    if (pointers.current.size === 2) {
      // second finger: switch from drag/pan to pinch-zoom
      const [a, b] = [...pointers.current.values()]
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y) }
      drag.current = null
      return
    }
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-id]')
    drag.current = {
      id: target?.dataset.id ?? null,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      moved: false,
      pointerId: e.pointerId,
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pinch.current && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, dist / pinch.current.dist)
      pinch.current.dist = dist
      return
    }
    const d = drag.current
    if (!d || d.pointerId !== e.pointerId) return
    if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 5) d.moved = true
    if (!d.moved) return
    const dx = e.clientX - d.lastX
    const dy = e.clientY - d.lastY
    d.lastX = e.clientX
    d.lastY = e.clientY
    if (d.id) {
      const b = bodies.current.get(d.id)
      if (!b) return
      const w = toWorld(e.clientX, e.clientY)
      b.vx = (w.x - b.x) * 0.6
      b.vy = (w.y - b.y) * 0.6
      b.x = w.x
      b.y = w.y
    } else {
      cam.current.x -= dx / cam.current.s
      cam.current.y -= dy / cam.current.s
      setManual()
    }
  }

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinch.current = null
    const d = drag.current
    if (!d || d.pointerId !== e.pointerId) return
    drag.current = null
    if (!d.moved && d.id) toggle(d.id)
  }

  const onWheel = (e: React.WheelEvent) => zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0015))

  const onBubbleKey = (e: ReactKeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle(id)
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setSelected(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ---- Relatedness overlay for the hovered / selected bubble ----
  const focus = hovered ?? selected
  // How long ago each bubble shared an ancestor with the focused one. Open hubs
  // are skipped (they're ancestors, not relatives).
  const relation = useMemo(() => {
    const out = new Map<string, number>()
    if (!focus) return out
    for (const id of layout.ids) {
      if (id === focus || expanded.has(id) || isAncestor(id, focus) || isAncestor(focus, id)) continue
      out.set(id, mrca(TREE, id, focus).height)
    }
    return out
  }, [focus, layout, expanded])
  const maxRelation = Math.max(1, ...relation.values())
  // Hover shows every chip; a resting selection only labels its closest kin.
  const chipIds = useMemo(() => {
    const entries = [...relation.entries()].sort((a, b) => a[1] - b[1])
    return new Set((hovered ? entries : entries.slice(0, 5)).map(([id]) => id))
  }, [relation, hovered])

  const selectedParent = selected ? TREE.nodes.get(selected)!.parentId : null
  const highlightPath = useMemo(() => new Set(selected ? pathTo(TREE, selected).map((n) => n.id) : []), [selected])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    return [...TREE.nodes.values()]
      .filter((n) => n.name.toLowerCase().includes(q) || n.latin.toLowerCase().includes(q))
      .sort((a, b) => Number(!a.name.toLowerCase().startsWith(q)) - Number(!b.name.toLowerCase().startsWith(q)))
      .slice(0, 8)
  }, [query])

  const sel = selected ? TREE.nodes.get(selected)! : null
  const selSummary = sel ? summaries[sel.id] : undefined
  const heroImg = [sel ? thumbs[sel.id] : undefined, selSummary && selSummary !== 'error' ? selSummary.image : undefined].find(
    (src): src is string => !!src && !brokenImgs.has(src),
  )

  return (
    <div className={styles.root}>
      <div className={styles.aurora} aria-hidden />
      <canvas ref={canvasRef} className={styles.motes} aria-hidden />

      <div
        ref={stageRef}
        className={styles.stage}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <div ref={worldRef} className={styles.world}>
          <svg className={styles.links} aria-hidden>
            {renderIds
              .filter((id) => id !== ROOT_ID)
              .map((id) => (
                <path
                  key={id}
                  ref={(el) => {
                    if (el) linkEls.current.set(id, el)
                    else linkEls.current.delete(id)
                  }}
                  className={highlightPath.has(id) ? styles.linkActive : styles.link}
                  style={{ '--h': TREE.nodes.get(id)!.h } as CSSProperties}
                />
              ))}
          </svg>

          {renderIds.map((id) => {
            const n = TREE.nodes.get(id)!
            const open = expanded.has(id)
            const clade = isClade(n)
            const r = radiusOf(n, open)
            const thumb = thumbs[id] && !brokenImgs.has(thumbs[id]) ? thumbs[id] : undefined
            const rel = relation.get(id)
            const dim = rel === undefined ? 1 : 1 - 0.55 * Math.sqrt(rel / maxRelation)
            const cls = [
              styles.bubble,
              clade ? (open ? styles.hub : styles.clade) : styles.leaf,
              selected === id ? styles.selected : '',
              focus === id ? styles.focused : '',
            ].join(' ')
            return (
              <div
                key={id}
                data-id={id}
                ref={(el) => {
                  if (el) bubbleEls.current.set(id, el)
                  else bubbleEls.current.delete(id)
                }}
                className={cls}
                style={{ width: r * 2, height: r * 2, '--h': n.h, '--r': `${r}px` } as CSSProperties}
                role="button"
                tabIndex={0}
                aria-label={`${n.name}${clade ? (open ? ', collapse branch' : ', expand branch') : ''}`}
                aria-expanded={clade ? open : undefined}
                onPointerEnter={() => setHovered(id)}
                onPointerLeave={() => setHovered((h) => (h === id ? null : h))}
                onKeyDown={(e) => onBubbleKey(e, id)}
                onFocus={() => setHovered(id)}
                onBlur={() => setHovered((h) => (h === id ? null : h))}
              >
                <div className={styles.orb} style={{ opacity: dim }}>
                  {thumb && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className={styles.photo}
                      src={thumb}
                      alt=""
                      draggable={false}
                      loading="lazy"
                      onError={() => markBroken(thumb)}
                    />
                  )}
                  {!thumb && !clade && <span className={styles.glyph}>{n.emoji ?? initials(n.name)}</span>}
                  {clade && !open && (
                    <div className={styles.cladeText}>
                      {n.emoji && <span className={styles.cladeEmoji}>{n.emoji}</span>}
                      <span className={styles.cladeName}>{n.name}</span>
                      <span className={styles.cladeCount}>
                        {n.count.toLocaleString()} species
                      </span>
                    </div>
                  )}
                </div>
                {(!clade || (open && (focus === id || selected === id || selectedParent === id))) && (
                  <div className={styles.label}>
                    <span>{n.name}</span>
                    {open && <small>{formatMya(n.height)}</small>}
                  </div>
                )}
                {rel !== undefined && chipIds.has(id) && (
                  <div className={styles.chip}>
                    <span aria-hidden>⟡</span> {formatMya(rel)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>
            The Mammal <em>Tree</em>
          </h1>
          <p className={styles.subtitle}>
            Tap a bubble to open its branch. The closer two bubbles float, the more recently they shared an ancestor.
          </p>
        </div>
        <div className={styles.controls}>
          <div className={styles.search}>
            <input
              value={query}
              placeholder="Find a mammal…"
              aria-label="Search mammals"
              onChange={(e) => {
                setQuery(e.target.value)
                setSearchOpen(true)
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && results[0]) reveal(results[0].id)
              }}
            />
            {searchOpen && results.length > 0 && (
              <ul className={styles.results} role="listbox">
                {results.map((n) => (
                  <li key={n.id}>
                    <button onClick={() => reveal(n.id)} style={{ '--h': n.h } as CSSProperties}>
                      <span className={styles.resultDot} />
                      <span>
                        {n.name}
                        <em>{n.latin}</em>
                      </span>
                      {isClade(n) && <small>{n.count.toLocaleString()} spp.</small>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button className={styles.ghost} onClick={() => setExpanded(new Set(INITIAL_EXPANDED))}>
            Reset
          </button>
          <button className={styles.ghost} onClick={fitView} disabled={!manualCam}>
            Fit
          </button>
        </div>
      </header>

      <footer className={styles.legend}>
        <span className={styles.legendDots}>
          <i />
          <i />
        </span>
        close together = close relatives · <span>⟡ shows when two lineages last shared an ancestor</span>
      </footer>

      {sel && (
        <aside className={styles.panel} style={{ '--h': sel.h } as CSSProperties} aria-live="polite">
          <button className={styles.close} onClick={() => setSelected(null)} aria-label="Close details">
            ×
          </button>
          <nav className={styles.crumbs} aria-label="Lineage">
            {pathTo(TREE, sel.id)
              .slice(0, -1)
              .map((n) => (
                <button key={n.id} onClick={() => reveal(n.id)}>
                  {n.name}
                </button>
              ))}
          </nav>

          <div className={styles.hero}>
            {heroImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroImg} alt={sel.name} onError={() => markBroken(heroImg)} />
            ) : (
              <span>{sel.emoji ?? initials(sel.name)}</span>
            )}
          </div>

          <h2 className={styles.panelTitle}>{sel.name}</h2>
          <p className={styles.latin}>{sel.latin}</p>

          <div className={styles.meta}>
            {isClade(sel) ? (
              <>
                <span>≈ {sel.count.toLocaleString()} living species</span>
                <span>branched {formatMya(sel.height)}</span>
              </>
            ) : (
              sel.status && (
                <span className={styles.status} data-status={sel.status}>
                  {STATUS_LABEL[sel.status]}
                </span>
              )
            )}
          </div>

          <p className={styles.blurb}>{sel.blurb}</p>

          {isClade(sel) && (
            <button className={styles.primary} onClick={() => toggle(sel.id)}>
              {expanded.has(sel.id) ? 'Close this branch' : `Open this branch · ${sel.children!.length} groups`}
            </button>
          )}

          <NearestRelatives id={sel.id} visible={layout.ids.filter((v) => !expanded.has(v))} onPick={reveal} />

          {summaries[sel.id] !== 'error' && (
          <section className={styles.wiki}>
            {summaries[sel.id] === undefined && <p className={styles.loading}>Fetching from Wikipedia…</p>}
            {summaries[sel.id] && summaries[sel.id] !== 'error' && (
              <>
                <p>{(summaries[sel.id] as WikiSummary).extract}</p>
                <a href={(summaries[sel.id] as WikiSummary).url} target="_blank" rel="noreferrer">
                  Read more on Wikipedia ↗
                </a>
              </>
            )}
          </section>
          )}
        </aside>
      )}
    </div>
  )
}

function NearestRelatives({ id, visible, onPick }: { id: string; visible: string[]; onPick: (id: string) => void }) {
  const list = useMemo(
    () =>
      visible
        .filter((v) => v !== id && !isAncestor(v, id) && !isAncestor(id, v))
        .map((v) => ({ node: TREE.nodes.get(v)!, when: mrca(TREE, v, id).height, d: evoDistance(TREE, v, id) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 4),
    [id, visible],
  )
  if (!list.length) return null
  return (
    <section className={styles.relatives}>
      <h3>Closest relatives on screen</h3>
      <ul>
        {list.map(({ node, when }) => (
          <li key={node.id}>
            <button onClick={() => onPick(node.id)} style={{ '--h': node.h } as CSSProperties}>
              <span className={styles.resultDot} />
              <span>{node.name}</span>
              <small>shared ancestor {formatMya(when)}</small>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
