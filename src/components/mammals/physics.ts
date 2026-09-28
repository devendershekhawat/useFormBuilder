// Floating-bubble layout physics.
//
// Each pair of bubbles is pulled toward an ideal distance (derived from how long
// ago they shared an ancestor). Two things keep it smooth instead of jittery:
//  - every body's summed spring stiffness is capped, so a hub with many
//    children can't overshoot on each tick (explicit integration goes unstable
//    past that point and oscillates forever);
//  - collisions are soft forces that go through velocity and damping, never
//    position corrections that fight the springs.
// A "heat" value cools after every change so the cloud settles, leaving only
// the gentle wander that makes bubbles look suspended in air.

export const PHYS = {
  gap: 26, // breathing room between bubble edges
  spread: 19, // px per √(million years) of evolutionary distance
  spring: 0.03, // pull toward the ideal distance
  kinship: 2.5, // parent–child pairs pull this many times harder
  maxStiffness: 0.35, // cap on a body's total spring stiffness per tick
  collide: 0.14, // soft push when bubbles overlap
  pad: 14, // minimum space between bubble edges
  gravity: 0.0012, // keeps the whole cloud centred
  wander: 0.045, // the "suspended in air" drift
  damping: 0.75,
  maxSpeed: 16,
  coolRate: 0.994, // heat multiplier per tick
  minHeat: 0.3,
}

export interface Body {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  fx: number
  fy: number
  r: number
  tr: number
  /** collision radius (leaves reserve room for their label) */
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

export interface Layout {
  ids: string[]
  index: Map<string, number>
  /** ideal distance for pair (i, j), i < j, at i * n + j */
  dist: Float32Array
  weight: Float32Array
  /** per-body stiffness normaliser */
  norm: Float32Array
}

export function buildLayout(
  ids: string[],
  radii: number[],
  isParentOf: (parent: string, child: string) => boolean,
  evoDistance: (a: string, b: string) => number,
): Layout {
  const n = ids.length
  const dist = new Float32Array(n * n)
  const weight = new Float32Array(n * n)
  const total = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = radii[i] + radii[j] + PHYS.gap + PHYS.spread * Math.sqrt(evoDistance(ids[i], ids[j]))
      // Nearby relatives matter most: stress-style weighting
      const kin = isParentOf(ids[i], ids[j]) || isParentOf(ids[j], ids[i]) ? PHYS.kinship : 1
      const w = kin * (160 / d) ** 1.6
      dist[i * n + j] = d
      weight[i * n + j] = w
      total[i] += w
      total[j] += w
    }
  }
  const norm = new Float32Array(n)
  for (let i = 0; i < n; i++) norm[i] = Math.min(1, PHYS.maxStiffness / (PHYS.spring * total[i] || 1))
  return { ids, index: new Map(ids.map((id, i) => [id, i])), dist, weight, norm }
}

export function idealDistance(L: Layout, a: string, b: string) {
  const i = L.index.get(a)
  const j = L.index.get(b)
  if (i === undefined || j === undefined) return 120
  return i < j ? L.dist[i * L.ids.length + j] : L.dist[j * L.ids.length + i]
}

/**
 * Advance one fixed tick (1/60 s). `bs` must be the bodies for `L.ids`, in order.
 * `heat` (0–1) scales the structural springs; `held` is a body being dragged.
 */
export function step(bs: Body[], L: Layout, t: number, heat: number, wander: number, held: string | null) {
  const n = bs.length
  if (n !== L.ids.length) return
  for (const b of bs) {
    b.fx = -b.x * PHYS.gravity + Math.sin(t * b.f1 + b.p1) * wander
    b.fy = -b.y * PHYS.gravity + Math.cos(t * b.f2 + b.p2) * wander
  }
  const k0 = PHYS.spring * heat
  // Right after a change, bubbles may pass through each other so the tree can
  // find its overall shape; collisions then fade in over ~half a second.
  const solid = Math.min(1, Math.max(0, (0.86 - heat) / 0.14))
  for (let i = 0; i < n; i++) {
    const a = bs[i]
    const na = L.norm[i]
    for (let j = i + 1; j < n; j++) {
      const c = bs[j]
      let dx = c.x - a.x
      let dy = c.y - a.y
      let d = Math.hypot(dx, dy)
      if (d < 0.01) {
        // coincident: nudge apart deterministically
        dx = Math.cos(i * 2.4 + j)
        dy = Math.sin(i * 2.4 + j)
        d = 1
      }
      const k = i * n + j
      const spring = (d - L.dist[k]) * L.weight[k] * k0
      const min = a.cr + c.cr + PHYS.pad
      const push = d < min ? (min - d) * PHYS.collide * solid : 0
      const ux = dx / d
      const uy = dy / d
      const fa = spring * na - push
      const fc = spring * L.norm[j] - push
      a.fx += fa * ux
      a.fy += fa * uy
      c.fx -= fc * ux
      c.fy -= fc * uy
    }
  }
  for (const b of bs) {
    if (b.id === held) continue
    b.vx = (b.vx + b.fx) * PHYS.damping
    b.vy = (b.vy + b.fy) * PHYS.damping
    const sp = Math.hypot(b.vx, b.vy)
    if (sp > PHYS.maxSpeed) {
      b.vx *= PHYS.maxSpeed / sp
      b.vy *= PHYS.maxSpeed / sp
    }
    b.x += b.vx
    b.y += b.vy
  }
}

export const cool = (heat: number) => Math.max(PHYS.minHeat, heat * PHYS.coolRate)
