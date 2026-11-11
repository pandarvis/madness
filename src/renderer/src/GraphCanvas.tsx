import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { DataSet, Network } from 'vis-network/standalone'
import type { GraphNode, GraphRelation } from '../../contracts/bmad-graph.ts'
import './graph-canvas.css'

// Same palette and force layout as Graphify's own graph.html, without its CDN script.
const COMMUNITY_COLORS = ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC']
const NO_COMMUNITY = -1
const MIN_ZOOM = 0.25
const MAX_ZOOM = 3
const LABEL_PX = 14

type View = { zoom: number; x: number; y: number }
type Base = { scale: number; x: number; y: number }
type Group = { id: number; name: string; color: string; size: number }

const communityOf = (node: GraphNode): number => node.community ?? NO_COMMUNITY
const colorOf = (community: number): string => community === NO_COMMUNITY ? '#BAB0AC' : COMMUNITY_COLORS[community % COMMUNITY_COLORS.length]!

function groupsOf(nodes: readonly GraphNode[], fr: boolean): Group[] {
  const files = new Map<number, Map<string, number>>()
  for (const node of nodes) {
    const community = communityOf(node), counts = files.get(community) ?? new Map<string, number>()
    const file = node.reference.status === 'known' ? node.reference.relativePath.split('/').at(-1)! : ''
    if (file) counts.set(file, (counts.get(file) ?? 0) + 1)
    files.set(community, counts)
  }
  const sizes = new Map<number, number>()
  for (const node of nodes) sizes.set(communityOf(node), (sizes.get(communityOf(node)) ?? 0) + 1)
  return [...sizes].sort((a, b) => b[1] - a[1] || a[0] - b[0]).map(([id, size]) => {
    const main = [...(files.get(id) ?? [])].filter(([file]) => file).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0]
    return { id, size, color: colorOf(id), name: main ?? (fr ? 'Sans fichier' : 'No file') }
  })
}

export function GraphCanvas({ nodes, relations, selected, view, language, onSelect, onView }: {
  nodes: readonly GraphNode[]; relations: readonly GraphRelation[]; selected: string | null; view: View; language: string
  onSelect: (id: string) => void; onView: (view: View) => void
}): ReactNode {
  const fr = language === 'fr'
  const host = useRef<HTMLDivElement>(null), network = useRef<Network | null>(null), base = useRef<Base | null>(null)
  const nodeData = useRef<DataSet<{ id: string; hidden?: boolean }> | null>(null)
  const latest = useRef({ view, onSelect, onView, selected })
  latest.current = { view, onSelect, onView, selected }
  const [ready, setReady] = useState(false)
  const [hidden, setHidden] = useState<ReadonlySet<number>>(new Set())
  const groups = useMemo(() => groupsOf(nodes, fr), [nodes, fr])

  useEffect(() => {
    if (!host.current) return
    const degree = new Map<string, number>()
    for (const r of relations) for (const id of [r.source, r.target]) degree.set(id, (degree.get(id) ?? 0) + 1)
    const largest = Math.max(1, ...degree.values())
    const data = new DataSet<{ id: string; hidden?: boolean }>(nodes.map((node, i) => {
      const color = colorOf(communityOf(node))
      return {
        id: node.id, label: node.label, size: 10 + 22 * (degree.get(node.id) ?? 0) / largest,
        color: { background: color, border: color, highlight: { background: '#e49b7a', border: '#f1ebe6' }, hover: { background: color, border: '#f1ebe6' } },
        // Spiral seed: same guard as Graphify against zero-distance repulsion on large graphs.
        x: 30 * Math.sqrt(i) * Math.cos(i * 2.4), y: 30 * Math.sqrt(i) * Math.sin(i * 2.4)
      }
    }))
    const edges = new DataSet(relations.map(r => ({ id: r.id, from: r.source, to: r.target, dashes: r.confidence !== 'EXTRACTED' })))
    const net = new Network(host.current, { nodes: data as never, edges: edges as never }, {
      autoResize: true,
      nodes: { shape: 'dot', borderWidth: 1.5, font: { size: LABEL_PX, color: '#f1ebe6', strokeWidth: 3, strokeColor: '#211f1e', face: 'Oxanium, Segoe UI, sans-serif' } },
      edges: { width: 1, color: { color: '#82766e', highlight: '#e49b7a', hover: '#bcb0a8' }, arrows: { to: { enabled: true, scaleFactor: 0.5 } }, smooth: { enabled: true, type: 'continuous', roundness: 0.2 } },
      physics: { enabled: true, solver: 'forceAtlas2Based', forceAtlas2Based: { gravitationalConstant: -60, centralGravity: 0.005, springLength: 120, springConstant: 0.08, damping: 0.4, avoidOverlap: 0.8 }, stabilization: { iterations: 200, updateInterval: 50 } },
      interaction: { hover: true, keyboard: false, tooltipDelay: 100 }
    })
    network.current = net; nodeData.current = data; base.current = null; setReady(false)
    const applyView = (): void => {
      const b = base.current; if (!b) return
      const { zoom, x, y } = latest.current.view, scale = b.scale * zoom
      net.moveTo({ scale, position: { x: b.x - x / scale, y: b.y - y / scale }, animation: false })
    }
    const capture = (): void => {
      net.fit({ animation: false })
      const position = net.getViewPosition()
      base.current = { scale: net.getScale(), x: position.x, y: position.y }
    }
    const syncView = (): void => {
      const b = base.current; if (!b) return
      const position = net.getViewPosition(), raw = net.getScale() / b.scale, zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, raw))
      if (zoom !== raw) net.moveTo({ scale: b.scale * zoom, animation: false })
      latest.current.onView({ zoom: Math.round(zoom * 100) / 100, x: Math.round((b.x - position.x) * b.scale * zoom), y: Math.round((b.y - position.y) * b.scale * zoom) })
    }
    net.once('stabilizationIterationsDone', () => {
      net.setOptions({ physics: { enabled: false } })
      capture()
      // Labels keep their reading size at the fitted scale; zooming still magnifies them.
      net.setOptions({ nodes: { font: { size: LABEL_PX / Math.min(1, base.current!.scale) } } })
      applyView()
      if (latest.current.selected && data.get(latest.current.selected)) net.selectNodes([latest.current.selected])
      setReady(true)
    })
    // Canvas pixels cannot be inspected: publish what the drawing guarantees for checks and diagnostics.
    net.on('afterDrawing', () => {
      const b = base.current, element = host.current
      if (!b || !element || nodes.length > 2000) return
      const scale = net.getScale(), box = { w: element.clientWidth, h: element.clientHeight }
      element.dataset.labelPx = String(LABEL_PX / Math.min(1, b.scale) * scale)
      element.dataset.allInFrame = String(nodes.every(node => { const p = net.canvasToDOM(net.getPosition(node.id)); return p.x >= 0 && p.x <= box.w && p.y >= 0 && p.y <= box.h }))
    })
    net.on('click', params => { const id = (params as { nodes: string[] }).nodes[0]; if (id) latest.current.onSelect(id) })
    net.on('dragEnd', syncView)
    net.on('zoom', syncView)
    net.on('resize', () => { const { zoom, x, y } = latest.current.view; if (base.current && zoom === 1 && x === 0 && y === 0) capture() })
    return () => { net.destroy(); network.current = null; nodeData.current = null; base.current = null }
  }, [nodes, relations])

  useEffect(() => {
    const net = network.current, b = base.current
    if (!net || !b || !ready) return
    if (view.zoom === 1 && view.x === 0 && view.y === 0) { net.moveTo({ scale: b.scale, position: { x: b.x, y: b.y }, animation: false }); return }
    const scale = b.scale * view.zoom, position = { x: b.x - view.x / scale, y: b.y - view.y / scale }, current = net.getViewPosition()
    if (Math.abs(net.getScale() - scale) < 0.01 * scale && Math.abs(current.x - position.x) * scale < 1 && Math.abs(current.y - position.y) * scale < 1) return
    net.moveTo({ scale, position, animation: false })
  }, [view.zoom, view.x, view.y, ready])

  useEffect(() => {
    const net = network.current
    if (!net || !ready) return
    if (selected && nodeData.current?.get(selected)) net.selectNodes([selected]); else net.unselectAll()
  }, [selected, ready])

  useEffect(() => {
    nodeData.current?.update(nodes.map(node => ({ id: node.id, hidden: hidden.has(communityOf(node)) })))
  }, [hidden, nodes])

  const toggle = (id: number): void => setHidden(current => { const next = new Set(current); if (!next.delete(id)) next.add(id); return next })
  return <>
    <div ref={host} className="graph-canvas" aria-hidden="true" data-ready={ready} data-node-count={nodes.length} data-edge-count={relations.length} data-groups={groups.length} />
    {!ready && <p className="graph-canvas-wait" role="status">{fr ? 'Disposition du graphe…' : 'Laying out the graph…'}</p>}
    <div className="graph-legend" role="group" aria-label={fr ? 'Groupes du graphe' : 'Graph groups'}>
      {groups.map(group => <button key={group.id} type="button" className="graph-legend-item" aria-pressed={!hidden.has(group.id)} onClick={() => toggle(group.id)}>
        <span className="graph-legend-dot" style={{ background: group.color }} aria-hidden="true" />{group.name} <span className="graph-legend-size">{group.size}</span>
      </button>)}
    </div>
  </>
}
