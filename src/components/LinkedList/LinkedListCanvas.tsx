import { useEffect, useRef, useState } from 'react'
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

const LinkedListCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ w: 800, h: 380 })
  const [hovered, setHovered] = useState<string | null>(null)
  const { getOrderedNodes } = useLinkedListStore()

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setDims({ w: el.offsetWidth, h: el.offsetHeight })
    })
    ro.observe(el)
    setDims({ w: el.offsetWidth, h: el.offsetHeight })
    return () => ro.disconnect()
  }, [])

  const ordered = getOrderedNodes()
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
          {/* Empty state hint */}
          {ordered.length === 0 && (
            <Text
              x={dims.w / 2 - 170}
              y={dims.h / 2 - 14}
              text="Empty list — insert a value to begin"
              fontSize={20}
              fontFamily="Caveat, cursive"
              fill="rgba(245,240,232,0.3)"
              width={340}
              align="center"
            />
          )}

          {/* HEAD label + arrow */}
          {positions.length > 0 && (
            <>
              <Text
                x={positions[0].x + 18}
                y={positions[0].y - 44}
                text="HEAD"
                fontSize={16}
                fontFamily="Caveat, cursive"
                fill={YELLOW}
              />
              <Arrow
                points={[
                  positions[0].x + 35,
                  positions[0].y - 26,
                  positions[0].x + 35,
                  positions[0].y - 2,
                ]}
                pointerLength={8}
                pointerWidth={8}
                fill={YELLOW}
                stroke={YELLOW}
                strokeWidth={2}
              />
            </>
          )}

          {/* Nodes */}
          {positions.map(({ node, x, y, i }) => {
            const hl = hovered === node.id
            const stroke = hl ? YELLOW : WHITE
            const fill = hl ? 'rgba(245,215,110,0.08)' : 'rgba(245,240,232,0.04)'

            return (
              <Group
                key={node.id}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Value cell */}
                <Rect
                  x={x} y={y}
                  width={NODE_W} height={NODE_H}
                  fill={fill}
                  stroke={stroke} strokeWidth={2}
                  cornerRadius={[4, 0, 0, 4]}
                  dash={[6, 3]}
                />
                {/* Pointer cell */}
                <Rect
                  x={x + NODE_W} y={y}
                  width={PTR_W} height={NODE_H}
                  fill={fill}
                  stroke={stroke} strokeWidth={2}
                  cornerRadius={[0, 4, 4, 0]}
                  dash={[6, 3]}
                />
                {/* Divider */}
                <Line
                  points={[x + NODE_W, y + 4, x + NODE_W, y + NODE_H - 4]}
                  stroke={stroke} strokeWidth={1.5} opacity={0.5}
                />
                {/* Value */}
                <Text
                  x={x} y={y + 12}
                  width={NODE_W}
                  text={String(node.value)}
                  fontSize={26}
                  fontFamily="Caveat, cursive"
                  fill={stroke}
                  align="center"
                />
                {/* Arrow symbol */}
                <Text
                  x={x + NODE_W} y={y + 14}
                  width={PTR_W}
                  text="→"
                  fontSize={20}
                  fontFamily="Caveat, cursive"
                  fill={BLUE}
                  align="center"
                />
                {/* Index badge */}
                <Text
                  x={x} y={y + NODE_H + 8}
                  width={NODE_W + PTR_W}
                  text={`[${i}]`}
                  fontSize={13}
                  fontFamily="Caveat, cursive"
                  fill={DIM}
                  align="center"
                />
              </Group>
            )
          })}

          {/* Arrows between nodes */}
          {positions.map(({ node, x, y }, idx) => {
            if (!node.next) return null
            const next = positions[idx + 1]
            if (!next) return null
            return (
              <Arrow
                key={`arrow-${node.id}`}
                points={[
                  x + NODE_W + PTR_W / 2,
                  y + NODE_H / 2,
                  next.x - 2,
                  next.y + NODE_H / 2,
                ]}
                pointerLength={10}
                pointerWidth={10}
                fill={BLUE}
                stroke={BLUE}
                strokeWidth={2.5}
              />
            )
          })}

          {/* NULL */}
          {positions.length > 0 && (() => {
            const last = positions[positions.length - 1]
            const nx = last.x + NODE_W + PTR_W + 14
            return (
              <>
                <Text
                  x={nx} y={last.y + 16}
                  text="NULL"
                  fontSize={18}
                  fontFamily="Caveat, cursive"
                  fill="rgba(245,240,232,0.38)"
                />
                <Line
                  points={[nx - 2, last.y + 10, nx + 48, last.y + 42]}
                  stroke="rgba(245,240,232,0.25)"
                  strokeWidth={1.5}
                />
              </>
            )
          })()}
        </Layer>
      </Stage>
    </div>
  )
}

export default LinkedListCanvas
