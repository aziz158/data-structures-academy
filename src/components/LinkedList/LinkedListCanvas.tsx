import { useEffect, useRef, useState, useCallback } from 'react'
import { Stage, Layer, Rect, Text, Arrow, Group, Line } from 'react-konva'
import useLinkedListStore from '../../store/useLinkedListStore'

const NODE_W = 90
const PTR_W = 42
const NODE_H = 52
const GAP = 72
const START_X = 60
const START_Y = 130

const WHITE = '#F5F0E8'
const YELLOW = '#F5D76E'
const BLUE = '#87CEEB'
const DIM = 'rgba(245,240,232,0.35)'

// ── RAF-based animation hook ──────────────────────────────────────────────────
function useNodeOpacity() {
  const [opacities, setOpacities] = useState<Record<string, number>>({})
  const rafs = useRef<Record<string, number>>({})

  const fadeIn = useCallback((id: string, ms = 320) => {
    cancelAnimationFrame(rafs.current[id] ?? 0)
    const start = performance.now()
    setOpacities(m => ({ ...m, [id]: 0 }))
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms)
      // ease out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      setOpacities(m => ({ ...m, [id]: eased }))
      if (t < 1) rafs.current[id] = requestAnimationFrame(tick)
      else delete rafs.current[id]
    }
    rafs.current[id] = requestAnimationFrame(tick)
  }, [])

  const fadeOut = useCallback((id: string, ms = 260, onDone?: () => void) => {
    cancelAnimationFrame(rafs.current[id] ?? 0)
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms)
      const eased = Math.pow(1 - t, 2) // ease in quad
      setOpacities(m => ({ ...m, [id]: eased }))
      if (t < 1) rafs.current[id] = requestAnimationFrame(tick)
      else {
        delete rafs.current[id]
        onDone?.()
      }
    }
    rafs.current[id] = requestAnimationFrame(tick)
  }, [])

  const remove = useCallback((id: string) => {
    cancelAnimationFrame(rafs.current[id] ?? 0)
    delete rafs.current[id]
    setOpacities(m => {
      const n = { ...m }
      delete n[id]
      return n
    })
  }, [])

  useEffect(() => {
    return () => { Object.values(rafs.current).forEach(cancelAnimationFrame) }
  }, [])

  return { opacities, fadeIn, fadeOut, remove }
}
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  leavingIds?: string[]
  onNodeLeft?: (id: string) => void
}

const LinkedListCanvas = ({ leavingIds = [], onNodeLeft }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ w: 800, h: 380 })
  const [hovered, setHovered] = useState<string | null>(null)
  const { getOrderedNodes } = useLinkedListStore()

  const { opacities, fadeIn, fadeOut, remove } = useNodeOpacity()
  const prevIdsRef = useRef<Set<string>>(new Set())
  const leavingInProgress = useRef<Set<string>>(new Set())

  // Resize observer
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setDims({ w: el.offsetWidth, h: el.offsetHeight }))
    ro.observe(el)
    setDims({ w: el.offsetWidth, h: el.offsetHeight })
    return () => ro.disconnect()
  }, [])

  const ordered = getOrderedNodes()

  // Detect newly added nodes → fade in
  useEffect(() => {
    const prev = prevIdsRef.current
    ordered.forEach(n => {
      if (!prev.has(n.id)) fadeIn(n.id)
    })
    prevIdsRef.current = new Set(ordered.map(n => n.id))
  }, [ordered, fadeIn])

  // Drive fade-out for leaving nodes
  useEffect(() => {
    leavingIds.forEach(id => {
      if (leavingInProgress.current.has(id)) return
      leavingInProgress.current.add(id)
      fadeOut(id, 260, () => {
        leavingInProgress.current.delete(id)
        remove(id)
        onNodeLeft?.(id)
      })
    })
  }, [leavingIds, fadeOut, remove, onNodeLeft])

  const positions = ordered.map((node, i) => ({
    node,
    x: START_X + i * (NODE_W + PTR_W + GAP),
    y: START_Y,
    i,
  }))

  const stageW = positions.length
    ? positions[positions.length - 1].x + NODE_W + PTR_W + 100
    : dims.w

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', overflowX: 'auto', overflowY: 'hidden' }}
    >
      <Stage width={Math.max(dims.w, stageW)} height={dims.h}>
        <Layer>
          {/* Empty hint */}
          {ordered.length === 0 && leavingIds.length === 0 && (
            <Text
              x={dims.w / 2 - 170}
              y={dims.h / 2 - 14}
              text="Empty list — type list.append(5) to begin"
              fontSize={20}
              fontFamily="Caveat, cursive"
              fill="rgba(245,240,232,0.28)"
              width={340}
              align="center"
            />
          )}

          {/* HEAD label */}
          {positions.length > 0 && (
            <>
              <Text
                x={positions[0].x + 18}
                y={positions[0].y - 44}
                text="HEAD"
                fontSize={16}
                fontFamily="Caveat, cursive"
                fill={YELLOW}
                opacity={opacities[positions[0].node.id] ?? 1}
              />
              <Arrow
                points={[positions[0].x + 35, positions[0].y - 26, positions[0].x + 35, positions[0].y - 2]}
                pointerLength={8}
                pointerWidth={8}
                fill={YELLOW}
                stroke={YELLOW}
                strokeWidth={2}
                opacity={opacities[positions[0].node.id] ?? 1}
              />
            </>
          )}

          {/* Nodes */}
          {positions.map(({ node, x, y, i }) => {
            const hl = hovered === node.id
            const stroke = hl ? YELLOW : WHITE
            const fill = hl ? 'rgba(245,215,110,0.08)' : 'rgba(245,240,232,0.04)'
            const op = opacities[node.id] ?? 1

            return (
              <Group
                key={node.id}
                x={x}
                y={y}
                opacity={op}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <Rect x={0} y={0} width={NODE_W} height={NODE_H}
                  fill={fill} stroke={stroke} strokeWidth={2}
                  cornerRadius={[4, 0, 0, 4]} dash={[6, 3]} />
                <Rect x={NODE_W} y={0} width={PTR_W} height={NODE_H}
                  fill={fill} stroke={stroke} strokeWidth={2}
                  cornerRadius={[0, 4, 4, 0]} dash={[6, 3]} />
                <Line points={[NODE_W, 4, NODE_W, NODE_H - 4]}
                  stroke={stroke} strokeWidth={1.5} opacity={0.5} />
                <Text x={0} y={13} width={NODE_W} text={String(node.value)}
                  fontSize={26} fontFamily="Caveat, cursive" fill={stroke} align="center" />
                <Text x={NODE_W} y={15} width={PTR_W} text="→"
                  fontSize={20} fontFamily="Caveat, cursive" fill={BLUE} align="center" />
                <Text x={0} y={NODE_H + 8} width={NODE_W + PTR_W} text={`[${i}]`}
                  fontSize={13} fontFamily="Caveat, cursive" fill={DIM} align="center" />
              </Group>
            )
          })}

          {/* Arrows between nodes — start outside right edge, end before left edge */}
          {positions.map(({ node, x, y }, idx) => {
            if (!node.next) return null
            const next = positions[idx + 1]
            if (!next) return null
            const op = Math.min(opacities[node.id] ?? 1, opacities[next.node.id] ?? 1)
            return (
              <Arrow
                key={`arrow-${node.id}`}
                points={[x + NODE_W + PTR_W + 6, y + NODE_H / 2, next.x - 6, next.y + NODE_H / 2]}
                pointerLength={10} pointerWidth={9}
                fill={BLUE} stroke={BLUE} strokeWidth={2}
                opacity={op}
              />
            )
          })}

          {/* NULL */}
          {positions.length > 0 && (() => {
            const last = positions[positions.length - 1]
            const nx = last.x + NODE_W + PTR_W + 14
            const op = opacities[last.node.id] ?? 1
            return (
              <>
                <Text x={nx} y={last.y + 16} text="NULL"
                  fontSize={18} fontFamily="Caveat, cursive"
                  fill="rgba(245,240,232,0.38)" opacity={op} />
                <Line points={[nx - 2, last.y + 10, nx + 48, last.y + 42]}
                  stroke="rgba(245,240,232,0.25)" strokeWidth={1.5} opacity={op} />
              </>
            )
          })()}
        </Layer>
      </Stage>
    </div>
  )
}

export default LinkedListCanvas
