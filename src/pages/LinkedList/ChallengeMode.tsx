import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LinkedListCanvas from '../../components/LinkedList/LinkedListCanvas'
import StickFigure from '../../components/StickFigure/StickFigure'
import useLinkedListStore from '../../store/useLinkedListStore'
import { StickFigureState, ChallengeTarget } from '../../types'

const CHALLENGES: ChallengeTarget[] = [
  { values: [1, 2, 3],      description: 'Build: 1 → 2 → 3 → NULL' },
  { values: [3, 8, 12],     description: 'Build: 3 → 8 → 12 → NULL' },
  { values: [7],             description: 'Build a single-node list with value 7' },
  { values: [5, 10, 15, 20], description: 'Build: 5 → 10 → 15 → 20 → NULL' },
  { values: [42, 17, 93, 5], description: 'Build: 42 → 17 → 93 → 5 → NULL' },
]

type ValidationState = 'idle' | 'correct' | 'wrong'

const ChallengeMode = () => {
  const [cIdx, setCIdx] = useState(0)
  const [input, setInput] = useState('')
  const [valid, setValid] = useState<ValidationState>('idle')
  const [figure, setFigure] = useState<StickFigureState>('idle')
  const [score, setScore] = useState(0)
  const [done, setDone] = useState<Set<number>>(new Set())

  const { insertAtTail, deleteById, reset, getOrderedNodes } = useLinkedListStore()
  const challenge = CHALLENGES[cIdx]

  useEffect(() => {
    reset()
    setValid('idle')
    setFigure('idle')
  }, [cIdx, reset])

  const validate = () => {
    const vals = getOrderedNodes().map((n) => n.value)
    const ok = vals.length === challenge.values.length && vals.every((v, i) => v === challenge.values[i])
    setValid(ok ? 'correct' : 'wrong')
    setFigure(ok ? 'celebrating' : 'thinking')
    if (ok && !done.has(cIdx)) {
      setScore((s) => s + 100)
      setDone((d) => new Set([...d, cIdx]))
    }
  }

  const handleAppend = () => {
    const v = parseInt(input, 10)
    if (!isNaN(v)) {
      insertAtTail(v)
      setInput('')
      setValid('idle')
      setFigure('drawing')
      setTimeout(() => setFigure('idle'), 900)
    }
  }

  const handleRemoveLast = () => {
    const nodes = getOrderedNodes()
    const last = nodes[nodes.length - 1]
    if (last) {
      deleteById(last.id)
      setValid('idle')
    }
  }

  const ordered = getOrderedNodes()

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left panel ── */}
      <div className="w-[300px] flex-shrink-0 flex flex-col border-r border-chalk-white/15 p-4 gap-3 overflow-y-auto">
        {/* Score + progress */}
        <div className="flex items-center justify-between">
          <span className="font-chalk text-chalk-yellow text-lg">Score: {score}</span>
          <div className="flex gap-1.5">
            {CHALLENGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCIdx(i)}
                className={`w-7 h-7 rounded-full font-chalk text-xs transition-all ${
                  i === cIdx
                    ? 'bg-chalk-yellow text-chalkboard-dark'
                    : done.has(i)
                    ? 'bg-chalk-green/25 border border-chalk-green/60 text-chalk-green'
                    : 'bg-chalk-white/8 border border-chalk-white/25 text-chalk-white/45'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Stick figure */}
        <div className="flex justify-center py-2">
          <StickFigure state={figure} size={82} />
        </div>

        {/* Challenge info */}
        <AnimatePresence mode="wait">
          <motion.div
            key={cIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-3"
          >
            <h3 className="font-chalk text-chalk-yellow text-lg">Challenge {cIdx + 1}</h3>
            <p className="font-hand text-chalk-white/85 text-sm">{challenge.description}</p>

            {/* Target */}
            <div className="bg-black/30 rounded p-3 border border-chalk-white/15">
              <p className="font-chalk text-chalk-blue text-xs mb-2">Target structure:</p>
              <div className="flex items-center gap-1 flex-wrap">
                {challenge.values.map((v, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="font-chalk text-chalk-yellow text-sm px-2 py-0.5 border border-chalk-yellow/45 rounded">
                      {v}
                    </span>
                    {i < challenge.values.length - 1 && (
                      <span className="font-chalk text-chalk-blue text-xs">→</span>
                    )}
                  </span>
                ))}
                <span className="font-chalk text-chalk-white/35 text-xs ml-1">→ NULL</span>
              </div>
            </div>

            {/* Your list */}
            <div className="bg-black/30 rounded p-3 border border-chalk-white/15">
              <p className="font-chalk text-chalk-blue text-xs mb-2">Your list:</p>
              <div className="flex items-center gap-1 flex-wrap min-h-7">
                {ordered.length === 0 ? (
                  <span className="font-chalk text-chalk-white/28 text-xs">Empty</span>
                ) : (
                  ordered.map((n, i) => {
                    const expected = challenge.values[i]
                    const color =
                      valid === 'correct'
                        ? 'border-chalk-green/55 text-chalk-green'
                        : valid === 'wrong' && n.value !== expected
                        ? 'border-chalk-red/55 text-chalk-red'
                        : 'border-chalk-white/45 text-chalk-white'
                    return (
                      <span key={n.id} className="flex items-center gap-1">
                        <span className={`font-chalk text-sm px-2 py-0.5 border rounded ${color}`}>
                          {n.value}
                        </span>
                        {i < ordered.length - 1 && (
                          <span className="font-chalk text-chalk-blue text-xs">→</span>
                        )}
                      </span>
                    )
                  })
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Feedback */}
        <AnimatePresence>
          {valid !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className={`p-3 rounded border font-hand text-sm ${
                valid === 'correct'
                  ? 'bg-chalk-green/10 border-chalk-green/45 text-chalk-green'
                  : 'bg-chalk-red/10 border-chalk-red/45 text-chalk-red'
              }`}
            >
              {valid === 'correct'
                ? '✓ Perfect! Your list matches the target!'
                : 'Not quite — check the values and order.'}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1" />

        {/* Next challenge */}
        <AnimatePresence>
          {valid === 'correct' && cIdx < CHALLENGES.length - 1 && (
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setCIdx((i) => i + 1)}
              className="py-2 rounded font-chalk text-chalkboard-dark bg-chalk-green hover:bg-chalk-green/80 transition-colors text-sm"
            >
              Next Challenge →
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Canvas + controls ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <LinkedListCanvas />
        </div>

        <div className="flex-shrink-0 border-t border-chalk-white/15 px-4 py-2.5 flex items-center gap-3 flex-wrap">
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAppend()}
            placeholder="value"
            className="w-24 px-3 py-1.5 rounded bg-black/30 border border-chalk-white/25 font-chalk text-chalk-white text-sm placeholder-chalk-white/25 focus:outline-none focus:border-chalk-yellow"
          />
          <button
            onClick={handleAppend}
            className="px-3 py-1.5 rounded bg-chalk-blue/15 border border-chalk-blue/45 font-chalk text-chalk-blue text-sm hover:bg-chalk-blue/25 transition-colors"
          >
            Append
          </button>
          <button
            onClick={handleRemoveLast}
            disabled={ordered.length === 0}
            className="px-3 py-1.5 rounded bg-chalk-red/15 border border-chalk-red/45 font-chalk text-chalk-red text-sm hover:bg-chalk-red/25 transition-colors disabled:opacity-30"
          >
            Remove last
          </button>
          <button
            onClick={reset}
            className="px-3 py-1.5 rounded bg-chalk-white/8 border border-chalk-white/20 font-chalk text-chalk-white/60 text-sm hover:bg-chalk-white/15 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={validate}
            className="px-4 py-1.5 rounded bg-chalk-yellow/15 border border-chalk-yellow/45 font-chalk text-chalk-yellow text-sm hover:bg-chalk-yellow/25 transition-colors ml-auto"
          >
            Check answer ✓
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChallengeMode
