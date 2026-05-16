import { motion, type TargetAndTransition } from 'framer-motion'
import { StickFigureState } from '../../types'

interface Props {
  state?: StickFigureState
  size?: number
  color?: string
}

const bodyAnimations: Record<StickFigureState, TargetAndTransition> = {
  idle: {
    y: [0, -5, 0],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
  walking: {
    x: [0, 4, 0, -4, 0],
    y: [0, -3, 0],
    transition: { duration: 0.7, repeat: Infinity },
  },
  drawing: {
    rotate: [0, 4, -2, 0],
    transition: { duration: 0.9, repeat: Infinity },
  },
  pointing: {
    y: [0, -3, 0],
    transition: { duration: 1.6, repeat: Infinity },
  },
  celebrating: {
    y: [0, -18, 0],
    rotate: [0, 6, -6, 0],
    transition: { duration: 0.45, repeat: Infinity },
  },
  thinking: {
    y: [0, -2, 0],
    transition: { duration: 3, repeat: Infinity },
  },
}

const armPaths: Record<StickFigureState, { r: string; l: string }> = {
  idle:        { r: 'M50,50 L76,68', l: 'M50,50 L24,68' },
  walking:     { r: 'M50,50 L76,62', l: 'M50,50 L24,72' },
  drawing:     { r: 'M50,50 L78,32', l: 'M50,50 L26,68' },
  pointing:    { r: 'M50,50 L82,36', l: 'M50,50 L24,68' },
  celebrating: { r: 'M50,50 L74,22', l: 'M50,50 L26,22' },
  thinking:    { r: 'M50,50 L70,36', l: 'M50,50 L24,68' },
}

const StickFigure = ({ state = 'idle', size = 100, color = '#F5F0E8' }: Props) => {
  const arms = armPaths[state]

  return (
    <motion.div animate={bodyAnimations[state]} style={{ display: 'inline-block' }}>
      <svg width={size} height={size * 1.5} viewBox="0 0 100 150">
        {/* Head */}
        <circle cx="50" cy="18" r="14" fill="none" stroke={color} strokeWidth="3" />
        {/* Eyes */}
        <circle cx="44" cy="15" r="2" fill={color} />
        <circle cx="56" cy="15" r="2" fill={color} />
        {/* Mouth */}
        {state === 'celebrating' ? (
          <path d="M43 22 Q50 28 57 22" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        ) : state === 'thinking' ? (
          <path d="M44 24 Q50 22 56 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        ) : (
          <path d="M44 22 Q50 27 56 22" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        )}
        {/* Body */}
        <line x1="50" y1="32" x2="50" y2="92" stroke={color} strokeWidth="3" strokeLinecap="round" />
        {/* Arms */}
        <path d={arms.r} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <path d={arms.l} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
        {/* Legs */}
        <line x1="50" y1="92" x2="66" y2="140" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="92" x2="34" y2="140" stroke={color} strokeWidth="3" strokeLinecap="round" />
        {/* Thinking dots */}
        {state === 'thinking' && (
          <>
            <circle cx="67" cy="9" r="2.5" fill={color} opacity="0.45" />
            <circle cx="74" cy="5" r="3.5" fill={color} opacity="0.6" />
            <circle cx="83" cy="1" r="4.5" fill={color} opacity="0.75" />
          </>
        )}
        {/* Chalk in hand for drawing */}
        {state === 'drawing' && (
          <line x1="78" y1="32" x2="82" y2="24" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        )}
      </svg>
    </motion.div>
  )
}

export default StickFigure
